package com.skyline.backend.service

import com.skyline.backend.dto.financialTransaction.CreateFinancialTransactionRequest
import com.skyline.backend.dto.financialTransaction.FinancialTransactionResponse
import com.skyline.backend.dto.financialTransaction.ManualFinancialTransactionType
import com.skyline.backend.dto.financialTransaction.UpdateFinancialTransactionRequest
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
import java.math.BigDecimal

@Service
class FinancialTransactionService(
    private val financialTransactionRepository: FinancialTransactionRepository,
    private val accountRepository: AccountRepository,
    private val currentUserService: CurrentUserService
) {

    @Transactional
    fun createTransaction(
        jwt: Jwt,
        request: CreateFinancialTransactionRequest
    ): FinancialTransactionResponse {

        val user = currentUserService.requireAdmin(jwt)

        val club = user.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

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
                "Неможливо виконати операцію з неактивним рахунком"
            )
        }

        val transactionType =
            request.type.toEntityType()

        if (transactionType == FinancialTransactionType.EXPENSE) {

            val currentBalance =
                financialTransactionRepository
                    .getAccountBalance(account.accountId)

            if (request.amount > currentBalance) {
                throw ConflictException(
                    "Недостатньо коштів на рахунку для виконання операції"
                )
            }
        }

        val transaction = FinancialTransaction(
            club = club,
            account = account,
            purchase = null,
            transfer = null,
            type = transactionType,
            amount = request.amount,
            comment = request.comment?.trim()?.takeIf {
                it.isNotEmpty()
            },
            status = true
        )

        return financialTransactionRepository
            .save(transaction)
            .toResponse()
    }


    @Transactional(readOnly = true)
    fun getAll(
        jwt: Jwt
    ): List<FinancialTransactionResponse> {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        return financialTransactionRepository
            .findAllByClubClubIdOrderByCreatedAtDesc(
                clubId
            )
            .map { it.toResponse() }
    }


    @Transactional(readOnly = true)
    fun getById(
        jwt: Jwt,
        transactionId: Long
    ): FinancialTransactionResponse {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val transaction =
            financialTransactionRepository
                .findByTransactionIdAndClubClubId(
                    transactionId,
                    clubId
                )
                ?: throw NoSuchElementException(
                    "Фінансову операцію не знайдено"
                )

        return transaction.toResponse()
    }


    @Transactional
    fun updateTransaction(
        jwt: Jwt,
        transactionId: Long,
        request: UpdateFinancialTransactionRequest
    ): FinancialTransactionResponse {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val transaction =
            financialTransactionRepository
                .findByTransactionIdAndClubClubId(
                    transactionId,
                    clubId
                )
                ?: throw NoSuchElementException(
                    "Фінансову операцію не знайдено"
                )

        validateManualTransaction(transaction)

        val newAccount =
            accountRepository
                .findByAccountIdAndClubClubId(
                    request.accountId,
                    clubId
                )
                ?: throw NoSuchElementException(
                    "Рахунок не знайдено"
                )

        if (!newAccount.status) {
            throw ConflictException(
                "Неможливо виконати операцію з неактивним рахунком"
            )
        }

        val newType = request.type.toEntityType()

        validateBalanceForUpdate(
            transaction = transaction,
            newAccount = newAccount,
            newType = newType,
            newAmount = request.amount
        )

        transaction.account = newAccount
        transaction.type = newType
        transaction.amount = request.amount
        transaction.comment =
            request.comment?.trim()?.takeIf {
                it.isNotEmpty()
            }

        return financialTransactionRepository
            .save(transaction)
            .toResponse()
    }


    @Transactional
    fun deleteTransaction(
        jwt: Jwt,
        transactionId: Long
    ) {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val transaction =
            financialTransactionRepository
                .findByTransactionIdAndClubClubId(
                    transactionId,
                    clubId
                )
                ?: throw NoSuchElementException(
                    "Фінансову операцію не знайдено"
                )

        validateManualTransaction(transaction)

        /*
         * Видалення ручної INCOME-операції також не повинно
         * призвести до від'ємного балансу рахунку.
         *
         * Наприклад:
         * INCOME +5000
         * EXPENSE -4000
         * balance = 1000
         *
         * Просто видалити INCOME +5000 не можна,
         * бо баланс став би -4000.
         */
        if (transaction.type == FinancialTransactionType.INCOME) {

            val account = requireNotNull(transaction.account)

            val currentBalance =
                financialTransactionRepository
                    .getAccountBalance(account.accountId)

            val balanceAfterDeletion =
                currentBalance - transaction.amount

            if (balanceAfterDeletion < BigDecimal.ZERO) {
                throw ConflictException(
                    "Неможливо видалити операцію, оскільки баланс рахунку стане від'ємним"
                )
            }
        }

        financialTransactionRepository.delete(transaction)
    }


    private fun validateManualTransaction(
        transaction: FinancialTransaction
    ) {

        val isManualType =
            transaction.type == FinancialTransactionType.INCOME ||
                    transaction.type == FinancialTransactionType.EXPENSE

        val hasNoRelations =
            transaction.purchase == null &&
                    transaction.transfer == null

        if (!isManualType || !hasNoRelations) {
            throw ConflictException(
                "Системну фінансову операцію не можна змінювати або видаляти вручну"
            )
        }
    }


    private fun validateBalanceForUpdate(
        transaction: FinancialTransaction,
        newAccount: Account,
        newType: FinancialTransactionType,
        newAmount: BigDecimal
    ) {

        val oldAccount =
            requireNotNull(transaction.account)

        /*
         * Спочатку визначаємо, яким був би баланс
         * старого рахунку без поточної транзакції.
         */
        val oldAccountBalance =
            financialTransactionRepository
                .getAccountBalance(oldAccount.accountId)

        val oldTransactionEffect =
            transaction.signedAmount()

        val oldAccountBalanceWithoutTransaction =
            oldAccountBalance - oldTransactionEffect

        /*
         * Якщо рахунок не змінюється, нову операцію
         * застосовуємо до балансу без старої операції.
         */
        if (oldAccount.accountId == newAccount.accountId) {

            val newEffect =
                signedAmount(
                    type = newType,
                    amount = newAmount
                )

            val resultingBalance =
                oldAccountBalanceWithoutTransaction +
                        newEffect

            if (resultingBalance < BigDecimal.ZERO) {
                throw ConflictException(
                    "Недостатньо коштів на рахунку для виконання операції"
                )
            }

            return
        }

        /*
         * Якщо транзакцію переносимо на інший рахунок,
         * після вилучення старої операції старий рахунок
         * також не повинен стати від'ємним.
         */
        if (
            oldAccountBalanceWithoutTransaction <
            BigDecimal.ZERO
        ) {
            throw ConflictException(
                "Неможливо перенести операцію, оскільки баланс попереднього рахунку стане від'ємним"
            )
        }

        /*
         * Перевіряємо новий рахунок.
         *
         * INCOME його збільшує, тому проблеми немає.
         * EXPENSE повинен вкладатися в поточний баланс.
         */
        if (newType == FinancialTransactionType.EXPENSE) {

            val newAccountBalance =
                financialTransactionRepository
                    .getAccountBalance(newAccount.accountId)

            if (newAmount > newAccountBalance) {
                throw ConflictException(
                    "Недостатньо коштів на новому рахунку для виконання операції"
                )
            }
        }
    }


    private fun FinancialTransaction.signedAmount(): BigDecimal {

        return signedAmount(
            type = type,
            amount = amount
        )
    }


    private fun signedAmount(
        type: FinancialTransactionType,
        amount: BigDecimal
    ): BigDecimal {

        return when (type) {

            FinancialTransactionType.INCOME,
            FinancialTransactionType.TRANSFER_IN,
            FinancialTransactionType.OPENING_BALANCE ->
                amount

            FinancialTransactionType.EXPENSE,
            FinancialTransactionType.REFUND,
            FinancialTransactionType.TRANSFER_OUT ->
                amount.negate()
        }
    }


    private fun ManualFinancialTransactionType.toEntityType():
            FinancialTransactionType {

        return when (this) {

            ManualFinancialTransactionType.INCOME ->
                FinancialTransactionType.INCOME

            ManualFinancialTransactionType.EXPENSE ->
                FinancialTransactionType.EXPENSE
        }
    }


    private fun FinancialTransaction.toResponse():
            FinancialTransactionResponse {

        val account = requireNotNull(account)

        return FinancialTransactionResponse(
            transactionId = transactionId,

            accountId = account.accountId,
            accountTitle = account.title,

            purchaseId = purchase?.purchaseId,
            transferId = transfer?.transferId,

            type = type,

            amount = amount,
            comment = comment,

            status = status,

            createdAt = createdAt,
            updatedAt = updatedAt
        )
    }
}