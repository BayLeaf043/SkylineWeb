package com.skyline.backend.service

import com.skyline.backend.dto.purchase.CreatePurchaseRequest
import com.skyline.backend.dto.purchase.PurchaseResponse
import com.skyline.backend.dto.purchase.RefundPurchaseRequest
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
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class PurchaseService(
    private val purchaseRepository: PurchaseRepository,
    private val certificateRepository: CertificateRepository,
    private val financialTransactionRepository: FinancialTransactionRepository,
    private val clientRepository: ClientRepository,
    private val serviceRepository: ServiceRepository,
    private val accountRepository: AccountRepository,
    private val currentUserService: CurrentUserService
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
            .findByAccountIdAndClubClubId(
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

        val certificate = Certificate(
            purchase = savedPurchase,
            validFrom = request.validFrom,
            validTo = validTo,
            totalSessions = service.sessionsCount,
            usedSessions = 0,
            type = CertificateType.ACTIVE,
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
            .findByPurchaseIdAndClubClubId(
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

        val certificate =
            certificateRepository
                .findByPurchasePurchaseId(
                    purchaseId
                )
                ?: throw NoSuchElementException(
                    "Сертифікат покупки не знайдено"
                )

        if (certificate.type == CertificateType.CANCELLED) {
            throw ConflictException(
                "Неможливо виконати повернення для скасованого сертифіката"
            )
        }

        if (certificate.usedSessions > 0) {
            throw ConflictException(
                "Неможливо виконати повне повернення, оскільки сертифікат уже використовувався"
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

        val account = incomeTransaction.account
            ?: throw IllegalStateException(
                "Рахунок оплати покупки не знайдено"
            )

        /*
         * Рахунки в нашій системі не можуть мати
         * від'ємний баланс.
         */
        val currentBalance =
            financialTransactionRepository
                .getAccountBalance(account.accountId)

        if (incomeTransaction.amount > currentBalance) {
            throw ConflictException(
                "Недостатньо коштів на рахунку для виконання повернення"
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

        /*
         * CANCELLED — бізнес-стан сертифіката.
         * status залишається true, тому що запис
         * не видалений і є частиною історії.
         */
        certificate.type = CertificateType.CANCELLED

        certificateRepository.save(certificate)

        val savedPurchase =
            purchaseRepository.save(purchase)

        return savedPurchase.toResponse()
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
}