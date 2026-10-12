package com.skyline.backend.service

import com.skyline.backend.dto.client.*
import com.skyline.backend.entity.*
import com.skyline.backend.repository.*
import com.skyline.backend.dto.certificate.CertificateResponse
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import com.skyline.backend.exception.ConflictException
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort

@Service
class ClientService(
    private val clientRepository: ClientRepository,
    private val userRepository: UserRepository,
    private val groupClientRepository: GroupClientRepository,
    private val bookingRepository: BookingRepository,
    private val attendanceRepository: AttendanceRepository,
    private val purchaseRepository: PurchaseRepository,
    private val certificateRepository: CertificateRepository,
    private val currentUserService: CurrentUserService
) {

    // =========================================================
    // СТВОРЕННЯ
    // =========================================================
    @Transactional
    fun createClient(
        jwt: Jwt,
        request: CreateClientRequest
    ): ClientResponse {
        val club = requireCurrentClub(jwt)

        val user = userRepository.save(
            User(
                authUserId = null,
                club = club,
                firstName = request.firstName.trim(),
                lastName = request.lastName.trim(),
                phone = request.phone.trim(),
                birthDate = request.birthDate,
                role = UserRole.CLIENT,
                status = true
            )
        )

        val client = clientRepository.save(
            Client(
                user = user,
                lastVisit = null,
                countOfVisits = 0
            )
        )

        return client.toResponse()
    }

    // =========================================================
    // ОТРИМАННЯ КЛІЄНТІВ
    // =========================================================
    @Transactional(readOnly = true)
    fun getAllClients(jwt: Jwt): List<ClientResponse> {
        val clubId = requireCurrentClub(jwt).clubId

        return clientRepository
            .findAllByUserClubClubId(clubId)
            .map { it.toResponse() }
    }

    @Transactional(readOnly = true)
    fun getClientsPage(
        jwt: Jwt,
        page: Int,
        size: Int,
        search: String
    ): ClientPageResponse {
        val clubId = requireCurrentClub(jwt).clubId

        require(page >= 0) {
            "Номер сторінки не може бути від'ємним"
        }

        require(size in 1..100) {
            "Кількість клієнтів на сторінці повинна бути від 1 до 100"
        }

        val pageable = PageRequest.of(
            page,
            size,
            Sort.by(
                Sort.Order.desc("user.status"),
                Sort.Order.asc("user.lastName"),
                Sort.Order.asc("user.firstName"),
                Sort.Order.asc("clientId")
            )
        )

        val result = clientRepository.findPageByClubIdAndSearch(
            clubId = clubId,
            search = search.trim(),
            pageable = pageable
        )

        return ClientPageResponse(
            content = result.content.map { it.toResponse() },
            page = result.number,
            size = result.size,
            totalElements = result.totalElements,
            totalPages = result.totalPages,
            first = result.isFirst,
            last = result.isLast
        )
    }

    @Transactional(readOnly = true)
    fun getClient(
        jwt: Jwt,
        clientId: Long
    ): ClientResponse {
        val clubId = requireCurrentClub(jwt).clubId
        return findClient(clientId, clubId).toResponse()
    }

    // =========================================================
    // РЕДАГУВАННЯ ТА СТАТУС
    // =========================================================
    @Transactional
    fun updateClient(
        jwt: Jwt,
        clientId: Long,
        request: UpdateClientRequest
    ): ClientResponse {
        val clubId = requireCurrentClub(jwt).clubId
        val client = findClient(clientId, clubId)
        val user = client.requireUser()

        user.firstName = request.firstName.trim()
        user.lastName = request.lastName.trim()
        user.phone = request.phone.trim()
        user.birthDate = request.birthDate

        userRepository.save(user)

        return client.toResponse()
    }

    @Transactional
    fun updateClientStatus(
        jwt: Jwt,
        clientId: Long,
        request: UpdateClientStatusRequest
    ): ClientResponse {
        val clubId = requireCurrentClub(jwt).clubId
        val client = findClient(clientId, clubId)
        val user = client.requireUser()

        user.status = request.status
        userRepository.save(user)

        return client.toResponse()
    }

    // =========================================================
    // ВИДАЛЕННЯ
    // =========================================================
    @Transactional
    fun deleteClient(
        jwt: Jwt,
        clientId: Long
    ) {
        val clubId = requireCurrentClub(jwt).clubId
        val client = findClient(clientId, clubId)
        val user = client.requireUser()

        if (user.authUserId != null) {
            throw ConflictException(
                "Неможливо видалити клієнта з обліковим " +
                        "записом авторизації. Деактивуйте клієнта"
            )
        }

        if (purchaseRepository.existsByClientClientId(clientId)) {
            throw ConflictException(
                "Неможливо видалити клієнта з історією покупок. " +
                        "Деактивуйте клієнта замість видалення"
            )
        }

        if (attendanceRepository.existsByClientClientId(clientId)) {
            throw ConflictException(
                "Неможливо видалити клієнта з історією відвідувань. " +
                        "Деактивуйте клієнта замість видалення"
            )
        }

        if (bookingRepository.existsByClientClientId(clientId)) {
            throw ConflictException(
                "Неможливо видалити клієнта з історією бронювань. " +
                        "Деактивуйте клієнта замість видалення"
            )
        }

        // Зв'язки з групами можна прибрати, якщо
        // немає історичних покупок, відвідувань і бронювань.
        groupClientRepository.deleteAllByClientClientId(clientId)
        clientRepository.delete(client)
        userRepository.delete(user)
    }

    // =========================================================
    // ДЕТАЛЬНА КАРТКА КЛІЄНТА
    // =========================================================
    @Transactional(readOnly = true)
    fun getClientDetails(
        jwt: Jwt,
        clientId: Long
    ): ClientDetailsResponse {
        val clubId = requireCurrentClub(jwt).clubId
        val client = findClient(clientId, clubId)

        val groups = groupClientRepository
            .findAllByClientClientIdAndGroupClubClubIdOrderByJoinedAtDesc(
                clientId,
                clubId
            )
            .map { groupClient ->
                val group = groupClient.group
                val direction = group.direction
                val trainer = group.trainer
                val trainerUser = requireNotNull(trainer.user) {
                    "Профіль тренера відсутній"
                }

                ClientGroupResponse(
                    groupClientId = requireNotNull(
                        groupClient.groupClientId
                    ),
                    groupId = requireNotNull(group.groupId),
                    groupTitle = group.title,
                    directionId = requireNotNull(direction.directionId),
                    directionTitle = direction.title,
                    trainerId = trainer.trainerId,
                    trainerFirstName = trainerUser.firstName,
                    trainerLastName = trainerUser.lastName,
                    joinedAt = groupClient.joinedAt,
                    status = groupClient.status
                )
            }

        val certificates = certificateRepository
            .findAllByPurchaseClientClientIdAndPurchaseClubClubIdOrderByCreatedAtDesc(
                clientId,
                clubId
            )
            .map { it.toClientDetailsResponse() }

        val completedPurchasesCount = purchaseRepository
            .countByClientClientIdAndClubClubIdAndTypeAndStatusTrue(
                clientId,
                clubId,
                PurchaseType.COMPLETED
            )

        val refundedPurchasesCount = purchaseRepository
            .countByClientClientIdAndClubClubIdAndTypeAndStatusTrue(
                clientId,
                clubId,
                PurchaseType.REFUNDED
            )

        val totalPaid = purchaseRepository.getTotalPaidByClient(
            clientId,
            clubId
        )

        return ClientDetailsResponse(
            client = client.toResponse(),
            groups = groups,
            certificates = certificates,
            finances = ClientFinanceResponse(
                completedPurchasesCount = completedPurchasesCount,
                refundedPurchasesCount = refundedPurchasesCount,
                totalPaid = totalPaid
            )
        )
    }

    // =========================================================
    // ПРАВА ДОСТУПУ ТА ІЗОЛЯЦІЯ КЛУБУ
    // =========================================================
    private fun requireCurrentClub(jwt: Jwt): Club {
        val user = currentUserService.requireTrainerOrAdmin(jwt)

        return user.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )
    }

    private fun findClient(
        clientId: Long,
        clubId: Long
    ): Client =
        clientRepository.findByClientIdAndUserClubClubId(
            clientId,
            clubId
        ) ?: throw NoSuchElementException(
            "Клієнта не знайдено"
        )

    private fun Client.requireUser(): User =
        user ?: throw IllegalStateException(
            "Профіль користувача клієнта відсутній"
        )

    // =========================================================
    // ФОРМУВАННЯ DTO
    // =========================================================
    private fun Client.toResponse(): ClientResponse {
        val clientUser = requireUser()

        return ClientResponse(
            clientId = clientId,
            userId = clientUser.userId,
            firstName = clientUser.firstName,
            lastName = clientUser.lastName,
            phone = clientUser.phone,
            birthDate = clientUser.birthDate,
            status = clientUser.status,
            lastVisit = lastVisit,
            countOfVisits = countOfVisits,
            createdAt = createdAt
        )
    }

    private fun Certificate.toClientDetailsResponse(): CertificateResponse {
        val certificatePurchase = requireNotNull(purchase) {
            "Покупка сертифіката відсутня"
        }
        val certificateClient = requireNotNull(certificatePurchase.client)
        val clientUser = requireNotNull(certificateClient.user)
        val purchasedService = requireNotNull(certificatePurchase.service)

        return CertificateResponse(
            certificateId = certificateId,
            purchaseId = certificatePurchase.purchaseId,
            clientId = certificateClient.clientId,
            clientFirstName = clientUser.firstName,
            clientLastName = clientUser.lastName,
            serviceId = requireNotNull(purchasedService.serviceId),
            serviceTitle = purchasedService.title,
            validFrom = validFrom,
            validTo = validTo,
            totalSessions = totalSessions,
            usedSessions = usedSessions,
            remainingSessions = totalSessions - usedSessions,
            type = type,
            status = status,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
}