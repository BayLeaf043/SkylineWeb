package com.skyline.backend.service

import com.skyline.backend.dto.account.AccountResponse
import com.skyline.backend.dto.account.CreateAccountRequest
import com.skyline.backend.dto.account.UpdateAccountRequest
import com.skyline.backend.dto.account.UpdateAccountStatusRequest
import com.skyline.backend.entity.Account
import com.skyline.backend.entity.FinancialTransaction
import com.skyline.backend.entity.FinancialTransactionType
import com.skyline.backend.exception.ConflictException
import com.skyline.backend.repository.AccountRepository
import com.skyline.backend.repository.FinancialTransactionRepository
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import com.skyline.backend.repository.AccountTransferRepository
import java.math.BigDecimal

@Service
class AccountService(
    private val accountRepository: AccountRepository,
    private val financialTransactionRepository: FinancialTransactionRepository,
    private val currentUserService: CurrentUserService,
    private val accountTransferRepository: AccountTransferRepository,
) {

    @Transactional
    fun createAccount(
        jwt: Jwt,
        request: CreateAccountRequest
    ): AccountResponse {

        val user = currentUserService.requireAdmin(jwt)

        val club = user.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val title = request.title.trim()

        if (
            accountRepository.existsByClubClubIdAndTitleIgnoreCase(
                club.clubId,
                title
            )
        ) {
            throw ConflictException(
                "Рахунок з такою назвою вже існує"
            )
        }

        val account = Account(
            club = club,
            title = title,
            type = request.type,
            status = true
        )

        val savedAccount =
            accountRepository.save(account)

        if (request.openingBalance > BigDecimal.ZERO) {

            val openingTransaction =
                FinancialTransaction(
                    club = club,
                    account = savedAccount,
                    type = FinancialTransactionType.OPENING_BALANCE,
                    amount = request.openingBalance,
                    comment = "Початковий баланс",
                    status = true
                )

            financialTransactionRepository.save(
                openingTransaction
            )
        }

        return savedAccount.toResponse(
            request.openingBalance
        )
    }


    @Transactional(readOnly = true)
    fun getAll(
        jwt: Jwt
    ): List<AccountResponse> {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val accounts =
            accountRepository
                .findAllByClubClubIdOrderByTitleAsc(
                    clubId
                )

        val balances =
            financialTransactionRepository
                .findAccountBalancesByClubId(clubId)
                .associate {
                    it.accountId to it.balance
                }

        return accounts.map { account ->
            account.toResponse(
                balances[account.accountId]
                    ?: BigDecimal.ZERO
            )
        }
    }


    @Transactional(readOnly = true)
    fun getById(
        jwt: Jwt,
        accountId: Long
    ): AccountResponse {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val account =
            accountRepository
                .findByAccountIdAndClubClubId(
                    accountId,
                    clubId
                )
                ?: throw NoSuchElementException(
                    "Рахунок не знайдено"
                )

        val balance =
            financialTransactionRepository
                .getAccountBalance(accountId)

        return account.toResponse(balance)
    }


    @Transactional
    fun updateAccount(
        jwt: Jwt,
        accountId: Long,
        request: UpdateAccountRequest
    ): AccountResponse {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val account =
            accountRepository
                .findByAccountIdAndClubClubId(
                    accountId,
                    clubId
                )
                ?: throw NoSuchElementException(
                    "Рахунок не знайдено"
                )

        val title = request.title.trim()

        if (
            accountRepository
                .existsByClubClubIdAndTitleIgnoreCaseAndAccountIdNot(
                    clubId,
                    title,
                    accountId
                )
        ) {
            throw ConflictException(
                "Рахунок з такою назвою вже існує"
            )
        }

        account.title = title
        account.type = request.type

        val savedAccount =
            accountRepository.save(account)

        val balance =
            financialTransactionRepository
                .getAccountBalance(accountId)

        return savedAccount.toResponse(balance)
    }


    @Transactional
    fun updateAccountStatus(
        accountId: Long,
        request: UpdateAccountStatusRequest,
        jwt: Jwt
    ): AccountResponse {

        val currentAdmin =
            currentUserService.requireAdmin(jwt)

        val clubId =
            currentAdmin.club?.clubId
                ?: throw AccessDeniedException(
                    "Користувач не прив'язаний до спортивного клубу"
                )

        val account =
            accountRepository
                .findByAccountIdAndClubClubId(
                    accountId,
                    clubId
                )
                ?: throw NoSuchElementException(
                    "Рахунок не знайдено"
                )

        account.status = request.status

        val savedAccount =
            accountRepository.save(account)

        val balance =
            financialTransactionRepository
                .getAccountBalance(accountId)

        return savedAccount.toResponse(balance)
    }


    @Transactional
    fun deleteAccount(
        jwt: Jwt,
        accountId: Long
    ) {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val account =
            accountRepository
                .findByAccountIdAndClubClubId(
                    accountId,
                    clubId
                )
                ?: throw NoSuchElementException(
                    "Рахунок не знайдено"
                )

        val hasTransfers =
            accountTransferRepository
                .existsByFromAccountAccountIdOrToAccountAccountId(
                    accountId,
                    accountId
                )

        if (hasTransfers) {
            throw ConflictException(
                "Неможливо видалити рахунок, оскільки він використовувався у переказах"
            )
        }

        val hasOtherTransactions =
            financialTransactionRepository
                .existsByAccountAccountIdAndTypeNot(
                    accountId,
                    FinancialTransactionType.OPENING_BALANCE
                )

        if (hasOtherTransactions) {
            throw ConflictException(
                "Неможливо видалити рахунок, оскільки він має фінансові операції"
            )
        }

        val openingTransactions =
            financialTransactionRepository
                .findAllByAccountAccountIdOrderByCreatedAtDesc(
                    accountId
                )

        if (openingTransactions.isNotEmpty()) {
            financialTransactionRepository
                .deleteAll(openingTransactions)
        }

        accountRepository.delete(account)
    }


    private fun Account.toResponse(
        balance: BigDecimal
    ): AccountResponse {

        return AccountResponse(
            accountId = accountId,
            title = title,
            type = type,
            balance = balance,
            status = status,
            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
}