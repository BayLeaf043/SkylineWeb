package com.skyline.backend.service

import com.skyline.backend.dto.purchase.CreatePurchaseRequest
import com.skyline.backend.dto.purchase.PurchaseResponse
import com.skyline.backend.dto.purchase.RefundPurchaseRequest
import com.skyline.backend.entity.BookingType
import com.skyline.backend.repository.AttendanceRepository
import com.skyline.backend.repository.BookingRepository
import com.skyline.backend.entity.Certificate
import com.skyline.backend.entity.CertificateType
import com.skyline.backend.entity.FinancialTransaction
import com.skyline.backend.entity.FinancialTransactionType
import com.skyline.backend.entity.Purchase
import com.skyline.backend.entity.PurchaseType
import com.skyline.backend.exception.ConflictException
import com.skyline.backend.repository.AccountRepository
import com.skyline.backend.repository.CertificateRepository
import com.skyline.backend.repository.ClientRepository
import com.skyline.backend.repository.FinancialTransactionRepository
import com.skyline.backend.repository.PurchaseRepository
import com.skyline.backend.repository.ServiceRepository
import com.skyline.backend.dto.purchase.PurchasePageResponse
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import java.time.YearMonth
import java.time.ZoneId
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class PurchaseService(
    private val purchaseRepository: PurchaseRepository,
    private val certificateRepository: CertificateRepository,
    private val financialTransactionRepository: FinancialTransactionRepository,
    private val clientRepository: ClientRepository,
    private val serviceRepository: ServiceRepository,
    private val accountRepository: AccountRepository,
    private val currentUserService: CurrentUserService,
    private val attendanceRepository: AttendanceRepository,
    private val bookingRepository: BookingRepository,
) {

    @Transactional
    fun createPurchase(
        jwt: Jwt,
        request: CreatePurchaseRequest
    ): PurchaseResponse {

        val user = currentUserService.requireAdmin(jwt)

        val club = user.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val client = clientRepository
            .findByClientIdAndUserClubClubId(
                request.clientId,
                club.clubId
            )
            ?: throw NoSuchElementException(
                "Клієнта не знайдено"
            )

        val clientUser = client.user
            ?: throw IllegalStateException(
                "Профіль клієнта не знайдено"
            )

        if (!clientUser.status) {
            throw ConflictException(
                "Неможливо оформити послугу неактивному клієнту"
            )
        }

        val service = serviceRepository
            .findByServiceIdAndClubClubId(
                request.serviceId,
                club.clubId
            )
            ?: throw NoSuchElementException(
                "Послугу не знайдено"
            )

        if (!service.status) {
            throw ConflictException(
                "Неможливо оформити неактивну послугу"
            )
        }

        val account = accountRepository
            .findLockedByAccountIdAndClubClubId(
                request.accountId,
                club.clubId
            )
            ?: throw NoSuchElementException(
                "Рахунок не знайдено"
            )

        if (!account.status) {
            throw ConflictException(
                "Неможливо провести оплату на неактивний рахунок"
            )
        }

        val comment = request.comment
            ?.trim()
            ?.takeIf { it.isNotEmpty() }

        val purchase = Purchase(
            club = club,
            client = client,
            service = service,
            amount = request.amount,
            comment = comment,
            type = PurchaseType.COMPLETED,
            status = true
        )

        val savedPurchase =
            purchaseRepository.save(purchase)

        /*
         * Наприклад:
         * validFrom = 01.10
         * validityDays = 30
         *
         * Сертифікат діє 30 календарних днів:
         * 01.10 ... 30.10 включно.
         */
        val validTo =
            request.validFrom.plusDays(
                service.validityDays.toLong() - 1
            )

        val certificateType =
            if (validTo.isBefore(LocalDate.now())) {
                CertificateType.EXPIRED
            } else {
                CertificateType.ACTIVE
            }

        val certificate = Certificate(
            purchase = savedPurchase,
            validFrom = request.validFrom,
            validTo = validTo,
            totalSessions = service.sessionsCount,
            usedSessions = 0,
            type = certificateType,
            status = true
        )

        certificateRepository.save(certificate)

        val incomeTransaction =
            FinancialTransaction(
                club = club,
                account = account,
                purchase = savedPurchase,
                transfer = null,
                type = FinancialTransactionType.INCOME,
                amount = request.amount,
                comment = comment,
                status = true
            )

        financialTransactionRepository.save(
            incomeTransaction
        )

        return savedPurchase.toResponse()
    }


    @Transactional(readOnly = true)
    fun getAll(
        jwt: Jwt
    ): List<PurchaseResponse> {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        return purchaseRepository
            .findAllByClubClubIdOrderByCreatedAtDesc(
                clubId
            )
            .map { it.toResponse() }
    }


    @Transactional(readOnly = true)
    fun getById(
        jwt: Jwt,
        purchaseId: Long
    ): PurchaseResponse {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val purchase = purchaseRepository
            .findByPurchaseIdAndClubClubId(
                purchaseId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Покупку не знайдено"
            )

        return purchase.toResponse()
    }


    @Transactional
    fun refundPurchase(
        jwt: Jwt,
        purchaseId: Long,
        request: RefundPurchaseRequest
    ): PurchaseResponse {

        val user = currentUserService.requireAdmin(jwt)

        val club = user.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val purchase = purchaseRepository
            .findLockedByPurchaseIdAndClubClubId(
                purchaseId,
                club.clubId
            )
            ?: throw NoSuchElementException(
                "Покупку не знайдено"
            )

        if (!purchase.status) {
            throw ConflictException(
                "Неможливо виконати повернення для неактивної покупки"
            )
        }

        if (purchase.type != PurchaseType.COMPLETED) {
            throw ConflictException(
                "Повернення коштів можливе лише для завершеної покупки"
            )
        }

        val certificate = certificateRepository
            .findByPurchasePurchaseId(purchaseId)
            ?: throw NoSuchElementException(
                "Сертифікат покупки не знайдено"
            )

        val lockedCertificate = certificateRepository
            .findLockedByCertificateIdAndPurchaseClubClubId(
                certificate.certificateId,
                club.clubId
            )
            ?: throw NoSuchElementException(
                "Сертифікат покупки не знайдено"
            )

        if (lockedCertificate.type == CertificateType.CANCELLED) {
            throw ConflictException(
                "Неможливо повернути покупку зі скасованим сертифікатом"
            )
        }

        if (
            lockedCertificate.usedSessions > 0 ||
            attendanceRepository.existsByCertificateCertificateId(
                lockedCertificate.certificateId
            )
        ) {
            throw ConflictException(
                "Повернення неможливе: сертифікат уже використовувався"
            )
        }

        if (
            bookingRepository.existsByCertificateCertificateIdAndType(
                lockedCertificate.certificateId,
                BookingType.BOOKED
            )
        ) {
            throw ConflictException(
                "Сертифікат має активні бронювання. " +
                        "Спочатку скасуйте відповідні бронювання"
            )
        }


        if (certificate.type == CertificateType.CANCELLED) {
            throw ConflictException(
                "Неможливо виконати повернення для скасованого сертифіката"
            )
        }

        val incomeTransaction =
            financialTransactionRepository
                .findFirstByPurchasePurchaseIdAndTypeAndStatusTrue(
                    purchaseId,
                    FinancialTransactionType.INCOME
                )
                ?: throw IllegalStateException(
                    "Транзакцію оплати покупки не знайдено"
                )

        val incomeAccount = incomeTransaction.account
            ?: throw IllegalStateException(
                "Рахунок оплати покупки не знайдено"
            )

        val account = accountRepository
            .findLockedByAccountIdAndClubClubId(
                incomeAccount.accountId,
                club.clubId
            )
            ?: throw NoSuchElementException(
                "Рахунок оплати покупки не знайдено"
            )

        val currentBalance =
            financialTransactionRepository.getAccountBalance(
                account.accountId
            )

        if (purchase.amount > currentBalance) {
            throw ConflictException(
                "Недостатньо коштів на рахунку для повернення"
            )
        }

        val refundComment =
            request.comment
                ?.trim()
                ?.takeIf { it.isNotEmpty() }

        val refundTransaction =
            FinancialTransaction(
                club = club,
                account = account,
                purchase = purchase,
                transfer = null,
                type = FinancialTransactionType.REFUND,
                amount = purchase.amount,
                comment = refundComment,
                status = true
            )

        financialTransactionRepository.save(
            refundTransaction
        )

        purchase.type = PurchaseType.REFUNDED
        lockedCertificate.type = CertificateType.CANCELLED

        certificateRepository.save(lockedCertificate)

        return purchaseRepository
            .save(purchase)
            .toResponse()
    }


    private fun Purchase.toResponse():
            PurchaseResponse {

        val client = requireNotNull(client)
        val clientUser = requireNotNull(client.user)
        val service = requireNotNull(service)

        return PurchaseResponse(
            purchaseId = purchaseId,

            clientId = client.clientId,
            clientFirstName = clientUser.firstName,
            clientLastName = clientUser.lastName,

            serviceId = requireNotNull(service.serviceId),
            serviceTitle = service.title,

            amount = amount,
            comment = comment,

            type = type,
            status = status,

            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }


    @Transactional(readOnly = true)
    fun getPage(
        jwt: Jwt,
        page: Int,
        size: Int,
        year: Int,
        month: Int,
        type: PurchaseType?
    ): PurchasePageResponse {

        val user =
            currentUserService.requireAdmin(jwt)

        val clubId =
            user.club?.clubId
                ?: throw AccessDeniedException(
                    "Користувач не прив'язаний до спортивного клубу"
                )

        if (page < 0) {
            throw IllegalArgumentException(
                "Номер сторінки не може бути від'ємним"
            )
        }

        if (size !in 1..100) {
            throw IllegalArgumentException(
                "Кількість покупок на сторінці повинна бути від 1 до 100"
            )
        }

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

        /*
         * Purchase.createdAt — OffsetDateTime.
         *
         * Для меж календарного місяця
         * використовуємо часовий пояс Києва,
         * оскільки продажі переглядаються
         * як локальні операції клубу.
         */
        val zone =
            ZoneId.of("Europe/Kyiv")

        val from =
            yearMonth
                .atDay(1)
                .atStartOfDay(zone)
                .toOffsetDateTime()

        val to =
            yearMonth
                .plusMonths(1)
                .atDay(1)
                .atStartOfDay(zone)
                .toOffsetDateTime()

        val pageable =
            PageRequest.of(
                page,
                size,
                Sort.by(
                    Sort.Order.desc(
                        "createdAt"
                    ),
                    Sort.Order.desc(
                        "purchaseId"
                    )
                )
            )

        val result =
            if (type == null) {
                purchaseRepository
                    .findAllByClubClubIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                        clubId,
                        from,
                        to,
                        pageable
                    )
            } else {
                purchaseRepository
                    .findAllByClubClubIdAndTypeAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                        clubId,
                        type,
                        from,
                        to,
                        pageable
                    )
            }

        return PurchasePageResponse(
            content =
                result.content.map {
                    it.toResponse()
                },

            page =
                result.number,

            size =
                result.size,

            totalElements =
                result.totalElements,

            totalPages =
                result.totalPages,

            first =
                result.isFirst,

            last =
                result.isLast
        )
    }
}