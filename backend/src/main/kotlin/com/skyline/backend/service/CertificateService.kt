package com.skyline.backend.service

import com.skyline.backend.dto.certificate.CertificateResponse
import com.skyline.backend.dto.certificate.UpdateCertificateValidityRequest
import com.skyline.backend.entity.Certificate
import com.skyline.backend.entity.CertificateType
import com.skyline.backend.entity.FinancialTransactionType
import com.skyline.backend.entity.PurchaseType
import com.skyline.backend.exception.ConflictException
import com.skyline.backend.repository.CertificateRepository
import com.skyline.backend.repository.FinancialTransactionRepository
import com.skyline.backend.repository.PurchaseRepository
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import com.skyline.backend.repository.AttendanceRepository
import com.skyline.backend.repository.SessionRepository
import com.skyline.backend.repository.ClientRepository
import com.skyline.backend.entity.SessionType
import com.skyline.backend.dto.certificate.CertificatePageResponse
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import java.time.YearMonth
import com.skyline.backend.repository.AccountRepository
import com.skyline.backend.repository.BookingRepository
import com.skyline.backend.entity.BookingType

@Service
class CertificateService(
    private val certificateRepository: CertificateRepository,
    private val purchaseRepository: PurchaseRepository,
    private val financialTransactionRepository: FinancialTransactionRepository,
    private val attendanceRepository: AttendanceRepository,
    private val currentUserService: CurrentUserService,
    private val sessionRepository: SessionRepository,
    private val clientRepository: ClientRepository,
    private val accountRepository: AccountRepository,
    private val bookingRepository: BookingRepository,
) {

    @Transactional()
    fun getAll(
        jwt: Jwt
    ): List<CertificateResponse> {

        val clubId = getCurrentClubId(jwt)

        synchronizeExpiredCertificates(clubId)

        return certificateRepository
            .findAllByPurchaseClubClubIdOrderByCreatedAtDesc(
                clubId
            )
            .map { it.toResponse() }
    }



    @Transactional
    fun getActivePage(
        jwt: Jwt,
        page: Int,
        size: Int,
        search: String
    ): CertificatePageResponse {

        val clubId = getCurrentClubId(jwt)

        validatePagination(
            page,
            size
        )

        synchronizeExpiredCertificates(
            clubId
        )

        val normalizedSearch = search.trim()
        val searchId = normalizedSearch.toLongOrNull()

        val pageable =
            PageRequest.of(
                page,
                size,
                Sort.by(
                    Sort.Order.asc(
                        "validTo"
                    ),
                    Sort.Order.desc(
                        "certificateId"
                    )
                )
            )

        val result =
            certificateRepository.findActivePage(
                clubId = clubId,
                activeType = CertificateType.ACTIVE,
                search = normalizedSearch,
                searchId = searchId,
                pageable = pageable
            )

        return result.toPageResponse()
    }


    @Transactional
    fun getArchivePage(
        jwt: Jwt,
        page: Int,
        size: Int,
        year: Int,
        month: Int,
        search: String
    ): CertificatePageResponse {

        val clubId = getCurrentClubId(jwt)

        validatePagination(
            page,
            size
        )

        if (month !in 1..12) {
            throw IllegalArgumentException(
                "Некоректний номер місяця"
            )
        }

        val yearMonth =
            YearMonth.of(
                year,
                month
            )

        synchronizeExpiredCertificates(
            clubId
        )

        val from =
            yearMonth.atDay(1)

        val to =
            yearMonth
                .plusMonths(1)
                .atDay(1)

        val normalizedSearch = search.trim()
        val searchId = normalizedSearch.toLongOrNull()

        val pageable =
            PageRequest.of(
                page,
                size,
                Sort.by(
                    Sort.Order.desc(
                        "validTo"
                    ),
                    Sort.Order.desc(
                        "certificateId"
                    )
                )
            )

        val result =
            certificateRepository
                .findArchivePage(
                    clubId = clubId,
                    activeType =
                        CertificateType.ACTIVE,
                    from = from,
                    to = to,
                    search = normalizedSearch,
                    searchId = searchId,
                    pageable = pageable
                )

        return result.toPageResponse()
    }


    @Transactional()
    fun getById(
        jwt: Jwt,
        certificateId: Long
    ): CertificateResponse {

        val clubId = getCurrentClubId(jwt)

        synchronizeExpiredCertificates(clubId)

        val certificate =
            certificateRepository
                .findByCertificateIdAndPurchaseClubClubId(
                    certificateId,
                    clubId
                )
                ?: throw NoSuchElementException(
                    "Сертифікат не знайдено"
                )

        return certificate.toResponse()
    }


    @Transactional
    fun updateValidity(
        jwt: Jwt,
        certificateId: Long,
        request: UpdateCertificateValidityRequest
    ): CertificateResponse {

        val clubId = getCurrentClubId(jwt)

        val certificate = certificateRepository
            .findLockedByCertificateIdAndPurchaseClubClubId(
                certificateId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Сертифікат не знайдено"
            )

        if (request.validTo.isBefore(certificate.validFrom)) {
            throw IllegalArgumentException(
                "Дата закінчення дії не може бути раніше " +
                        "дати початку дії сертифіката"
            )
        }

        if (certificate.type == CertificateType.CANCELLED) {
            throw ConflictException(
                "Неможливо змінити термін дії скасованого сертифіката"
            )
        }

        if (certificate.type == CertificateType.USED ||
            certificate.usedSessions >= certificate.totalSessions
        ) {
            throw ConflictException(
                "Неможливо змінити термін дії повністю використаного сертифіката"
            )
        }

        val purchase = certificate.purchase
            ?: throw IllegalStateException(
                "Покупку сертифіката не знайдено"
            )

        if (!purchase.status ||
            purchase.type != PurchaseType.COMPLETED
        ) {
            throw ConflictException(
                "Неможливо змінити термін дії сертифіката " +
                        "неактивної або поверненої покупки"
            )
        }

        certificate.validTo = request.validTo

        certificate.type =
            if (request.validTo.isBefore(LocalDate.now())) {
                CertificateType.EXPIRED
            } else {
                CertificateType.ACTIVE
            }

        return certificateRepository
            .save(certificate)
            .toResponse()
    }


    @Transactional
    fun deleteCertificate(
        jwt: Jwt,
        certificateId: Long
    ) {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val certificate =
            certificateRepository
                .findLockedByCertificateIdAndPurchaseClubClubId(certificateId, clubId)
                ?: throw NoSuchElementException(
                    "Сертифікат не знайдено"
                )

        /*
         * Сертифікат не можна фізично видалити,
         * якщо з нього вже було списано хоча б одне заняття.
         */
        if (certificate.usedSessions > 0) {
            throw ConflictException(
                "Неможливо видалити сертифікат, оскільки він уже використовувався"
            )
        }

        /*
         * Додаткова перевірка історії відвідувань.
         *
         * Навіть якщо usedSessions з якихось причин
         * містить некоректне значення, наявність Attendance
         * із цим certificate_id забороняє фізичне видалення.
         */
        if (
            attendanceRepository.existsByCertificateCertificateId(
                certificateId
            )
        ) {
            throw ConflictException(
                "Неможливо видалити сертифікат, оскільки він уже використовувався для відвідування"
            )
        }

        if (
            bookingRepository.existsByCertificateCertificateId(
                certificateId
            )
        ) {
            throw ConflictException(
                "Неможливо видалити сертифікат, оскільки " +
                        "він використовується в активних бронюваннях. " +
                        "Спочатку скасуйте ці бронювання"
            )
        }

        val purchase = certificate.purchase
            ?: throw IllegalStateException(
                "Покупку сертифіката не знайдено"
            )

        if (purchase.type != PurchaseType.COMPLETED) {
            throw ConflictException(
                "Неможливо видалити сертифікат для поверненої або скасованої покупки"
            )
        }

        if (!purchase.status) {
            throw ConflictException(
                "Неможливо видалити сертифікат неактивної покупки"
            )
        }

        val transactions =
            financialTransactionRepository
                .findAllByPurchasePurchaseIdOrderByCreatedAtDesc(
                    purchase.purchaseId
                )

        /*
         * Фізичне видалення дозволяємо лише для
         * помилково оформленого продажу.
         *
         * У покупки повинна існувати рівно одна
         * активна фінансова операція INCOME.
         */
        val canDelete =
            transactions.size == 1 &&
                    transactions.first().type ==
                    FinancialTransactionType.INCOME &&
                    transactions.first().status

        if (!canDelete) {
            throw ConflictException(
                "Неможливо видалити сертифікат, оскільки покупка має пов'язані фінансові операції"
            )
        }

        val incomeTransaction = transactions.first()

        val incomeAccount = incomeTransaction.account
            ?: throw IllegalStateException(
                "Для фінансової операції не знайдено рахунок"
            )

        val account = accountRepository
            .findLockedByAccountIdAndClubClubId(
                incomeAccount.accountId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Рахунок продажу не знайдено"
            )

        val currentBalance =
            financialTransactionRepository.getAccountBalance(
                account.accountId
            )

        if (currentBalance < incomeTransaction.amount) {
            throw ConflictException(
                "Неможливо видалити сертифікат: після видалення " +
                        "пов'язаного доходу баланс рахунку стане від'ємним"
            )
        }

        /*
         * Видаляємо весь помилково створений ланцюжок:
         *
         * FinancialTransaction
         *        ↓
         * Certificate
         *        ↓
         * Purchase
         */

        financialTransactionRepository
            .delete(transactions.first())

        certificateRepository
            .delete(certificate)

        purchaseRepository
            .delete(purchase)
    }



    @Transactional(readOnly = true)
    fun getAvailableForSession(
        jwt: Jwt,
        sessionId: Long,
        clientId: Long
    ): List<CertificateResponse> {

        val clubId = getCurrentClubId(jwt)

        // -----------------------------------------------------
        // SESSION
        // -----------------------------------------------------

        val session = sessionRepository
            .findBySessionIdAndClubClubId(
                sessionId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Заняття не знайдено"
            )

        if (session.type != SessionType.PLANNED) {
            return emptyList()
        }

        // -----------------------------------------------------
        // CLIENT
        // -----------------------------------------------------

        val client = clientRepository
            .findByClientIdAndUserClubClubId(
                clientId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Клієнта не знайдено"
            )

        val clientUser = client.user
            ?: throw IllegalStateException(
                "Для клієнта не знайдено користувача"
            )

        if (!clientUser.status) {
            return emptyList()
        }

        // -----------------------------------------------------
        // CERTIFICATES
        // -----------------------------------------------------

        val sessionDate = session.startAt.toLocalDate()

        return certificateRepository
            .findAllByPurchaseClientClientIdAndPurchaseClubClubIdAndStatusTrueOrderByValidToAsc(
                clientId,
                clubId
            )
            .filter { certificate ->

                val purchase =
                    certificate.purchase
                        ?: return@filter false

                val service =
                    purchase.service
                        ?: return@filter false

                val serviceCategoryId =
                    service.category?.categoryId
                        ?: return@filter false

                val serviceDirectionId =
                    service.direction?.directionId
                        ?: return@filter false

                val validPurchase =
                    purchase.status &&
                            purchase.type == PurchaseType.COMPLETED

                val activeCertificate =
                    certificate.status &&
                            certificate.type == CertificateType.ACTIVE

                val validDate =
                    !sessionDate.isBefore(
                        certificate.validFrom
                    ) &&
                            !sessionDate.isAfter(
                                certificate.validTo
                            )

                val hasSessions =
                    certificate.usedSessions <
                            certificate.totalSessions

                val categoryMatches =
                    serviceCategoryId ==
                            session.category.categoryId

                val directionMatches =
                    serviceDirectionId ==
                            session.direction.directionId

                validPurchase &&
                        activeCertificate &&
                        validDate &&
                        hasSessions &&
                        categoryMatches &&
                        directionMatches
            }
            .map { it.toResponse() }
    }


    private fun synchronizeExpiredCertificates(
        clubId: Long
    ) {
        certificateRepository
            .expireCertificates(
                clubId = clubId,
                today = LocalDate.now(),
                activeType =
                    CertificateType.ACTIVE,
                expiredType =
                    CertificateType.EXPIRED
            )
    }


    private fun validatePagination(
        page: Int,
        size: Int
    ) {
        if (page < 0) {
            throw IllegalArgumentException(
                "Номер сторінки не може бути від'ємним"
            )
        }

        if (size !in 1..100) {
            throw IllegalArgumentException(
                "Кількість сертифікатів на сторінці повинна бути від 1 до 100"
            )
        }
    }


    private fun org.springframework.data.domain.Page<Certificate>
            .toPageResponse():
            CertificatePageResponse {

        return CertificatePageResponse(
            content =
                content.map {
                    it.toResponse()
                },

            page = number,
            size = size,

            totalElements =
                totalElements,

            totalPages =
                totalPages,

            first =
                isFirst,

            last =
                isLast
        )
    }


    private fun Certificate.toResponse():
            CertificateResponse {

        val purchase = requireNotNull(purchase)

        val client =
            requireNotNull(purchase.client)

        val clientUser =
            requireNotNull(client.user)

        val service =
            requireNotNull(purchase.service)

        return CertificateResponse(
            certificateId = certificateId,
            purchaseId = purchase.purchaseId,

            clientId = client.clientId,
            clientFirstName = clientUser.firstName,
            clientLastName = clientUser.lastName,

            serviceId =
                requireNotNull(service.serviceId),

            serviceTitle = service.title,

            validFrom = validFrom,
            validTo = validTo,

            totalSessions = totalSessions,
            usedSessions = usedSessions,
            remainingSessions =
                totalSessions - usedSessions,

            type = type,
            status = status,

            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }


    private fun getCurrentClubId(jwt: Jwt): Long {
        val user = currentUserService.requireTrainerOrAdmin(jwt)

        return user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )
    }
}