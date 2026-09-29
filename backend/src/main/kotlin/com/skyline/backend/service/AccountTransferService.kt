package com.skyline.backend.service

import com.skyline.backend.dto.accountTransfer.AccountTransferResponse
import com.skyline.backend.dto.accountTransfer.CreateAccountTransferRequest
import com.skyline.backend.entity.AccountTransfer
import com.skyline.backend.entity.FinancialTransaction
import com.skyline.backend.entity.FinancialTransactionType
import com.skyline.backend.exception.ConflictException
import com.skyline.backend.repository.AccountRepository
import com.skyline.backend.repository.AccountTransferRepository
import com.skyline.backend.repository.FinancialTransactionRepository
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AccountTransferService(
    private val accountTransferRepository: AccountTransferRepository,
    private val accountRepository: AccountRepository,
    private val financialTransactionRepository: FinancialTransactionRepository,
    private val currentUserService: CurrentUserService
) {

    @Transactional
    fun createTransfer(
        jwt: Jwt,
        request: CreateAccountTransferRequest
    ): AccountTransferResponse {

        val user = currentUserService.requireAdmin(jwt)

        val club = user.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        if (request.fromAccountId == request.toAccountId) {
            throw ConflictException(
                "Рахунок списання та рахунок зарахування повинні бути різними"
            )
        }

        val fromAccount =
            accountRepository
                .findByAccountIdAndClubClubId(
                    request.fromAccountId,
                    club.clubId
                )
                ?: throw NoSuchElementException(
                    "Рахунок списання не знайдено"
                )

        val toAccount =
            accountRepository
                .findByAccountIdAndClubClubId(
                    request.toAccountId,
                    club.clubId
                )
                ?: throw NoSuchElementException(
                    "Рахунок зарахування не знайдено"
                )

        if (!fromAccount.status) {
            throw ConflictException(
                "Рахунок списання є неактивним"
            )
        }

        if (!toAccount.status) {
            throw ConflictException(
                "Рахунок зарахування є неактивним"
            )
        }

        val fromAccountBalance =
            financialTransactionRepository
                .getAccountBalance(fromAccount.accountId)

        if (request.amount > fromAccountBalance) {
            throw ConflictException(
                "Недостатньо коштів на рахунку для виконання переказу"
            )
        }

        val comment =
            request.comment
                ?.trim()
                ?.takeIf { it.isNotEmpty() }

        val transfer = AccountTransfer(
            club = club,
            fromAccount = fromAccount,
            toAccount = toAccount,
            amount = request.amount,
            comment = comment,
            status = true
        )

        val savedTransfer =
            accountTransferRepository.save(transfer)

        val transferOut = FinancialTransaction(
            club = club,
            account = fromAccount,
            purchase = null,
            transfer = savedTransfer,
            type = FinancialTransactionType.TRANSFER_OUT,
            amount = request.amount,
            comment = comment,
            status = true
        )

        val transferIn = FinancialTransaction(
            club = club,
            account = toAccount,
            purchase = null,
            transfer = savedTransfer,
            type = FinancialTransactionType.TRANSFER_IN,
            amount = request.amount,
            comment = comment,
            status = true
        )

        financialTransactionRepository.saveAll(
            listOf(
                transferOut,
                transferIn
            )
        )

        return savedTransfer.toResponse()
    }


    @Transactional(readOnly = true)
    fun getAll(
        jwt: Jwt
    ): List<AccountTransferResponse> {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        return accountTransferRepository
            .findAllByClubClubIdOrderByCreatedAtDesc(
                clubId
            )
            .map { it.toResponse() }
    }


    @Transactional(readOnly = true)
    fun getById(
        jwt: Jwt,
        transferId: Long
    ): AccountTransferResponse {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val transfer =
            accountTransferRepository
                .findByTransferIdAndClubClubId(
                    transferId,
                    clubId
                )
                ?: throw NoSuchElementException(
                    "Переказ не знайдено"
                )

        return transfer.toResponse()
    }


    private fun AccountTransfer.toResponse():
            AccountTransferResponse {

        val fromAccount =
            requireNotNull(fromAccount)

        val toAccount =
            requireNotNull(toAccount)

        return AccountTransferResponse(
            transferId = transferId,

            fromAccountId = fromAccount.accountId,
            fromAccountTitle = fromAccount.title,

            toAccountId = toAccount.accountId,
            toAccountTitle = toAccount.title,

            amount = amount,
            comment = comment,

            status = status,

            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
}