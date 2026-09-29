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

@Service
class CertificateService(
    private val certificateRepository: CertificateRepository,
    private val purchaseRepository: PurchaseRepository,
    private val financialTransactionRepository: FinancialTransactionRepository,
    private val currentUserService: CurrentUserService
) {

    @Transactional(readOnly = true)
    fun getAll(
        jwt: Jwt
    ): List<CertificateResponse> {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        return certificateRepository
            .findAllByPurchaseClubClubIdOrderByCreatedAtDesc(
                clubId
            )
            .map { it.toResponse() }
    }


    @Transactional(readOnly = true)
    fun getById(
        jwt: Jwt,
        certificateId: Long
    ): CertificateResponse {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

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

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val certificate =
            certificateRepository
                .findByCertificateIdAndPurchaseClubClubId(
                    certificateId,
                    clubId
                )
                ?: throw NoSuchElementException(
                    "Сертифікат не знайдено"
                )

        if (
            request.validTo.isBefore(
                certificate.validFrom
            )
        ) {
            throw IllegalArgumentException(
                "Дата закінчення дії не може бути раніше дати початку дії сертифіката"
            )
        }

        if (
            certificate.type ==
            CertificateType.CANCELLED
        ) {
            throw ConflictException(
                "Неможливо змінити термін дії скасованого сертифіката"
            )
        }

        if (
            certificate.type ==
            CertificateType.USED
        ) {
            throw ConflictException(
                "Неможливо змінити термін дії використаного сертифіката"
            )
        }

        certificate.validTo = request.validTo

        /*
         * Якщо сертифікат був EXPIRED,
         * але ADMIN продовжив його строк,
         * він знову стає ACTIVE за умови,
         * що в ньому залишились заняття.
         */
        if (
            certificate.type == CertificateType.EXPIRED &&
            !request.validTo.isBefore(LocalDate.now()) &&
            certificate.usedSessions < certificate.totalSessions
        ) {
            certificate.type = CertificateType.ACTIVE
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
                .findByCertificateIdAndPurchaseClubClubId(
                    certificateId,
                    clubId
                )
                ?: throw NoSuchElementException(
                    "Сертифікат не знайдено"
                )

        if (certificate.usedSessions > 0) {
            throw ConflictException(
                "Неможливо видалити сертифікат, оскільки він уже використовувався"
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
         * Для помилково оформленого продажу
         * повинна існувати тільки одна системна
         * транзакція INCOME.
         *
         * Якщо вже існує REFUND або будь-яка
         * інша операція — фізичне видалення
         * всього ланцюжка забороняємо.
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

        /*
         * TODO:
         * Після реалізації bookings / attendance
         * додати перевірку, що сертифікат
         * не має пов'язаних бронювань або відвідувань.
         */

        financialTransactionRepository
            .delete(transactions.first())

        certificateRepository
            .delete(certificate)

        purchaseRepository
            .delete(purchase)
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
}