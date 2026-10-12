package com.skyline.backend.repository

import com.skyline.backend.entity.FinancialTransaction
import com.skyline.backend.repository.projection.AccountBalanceProjection
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.math.BigDecimal
import com.skyline.backend.entity.FinancialTransactionType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import java.time.OffsetDateTime

interface FinancialTransactionRepository :
    JpaRepository<FinancialTransaction, Long> {

    fun findAllByClubClubIdOrderByCreatedAtDesc(
        clubId: Long
    ): List<FinancialTransaction>

    fun findAllByAccountAccountIdOrderByCreatedAtDesc(
        accountId: Long
    ): List<FinancialTransaction>

    fun findByTransactionIdAndClubClubId(
        transactionId: Long,
        clubId: Long
    ): FinancialTransaction?

    fun findAllByPurchasePurchaseIdOrderByCreatedAtDesc(
        purchaseId: Long
    ): List<FinancialTransaction>


    fun findFirstByPurchasePurchaseIdAndTypeAndStatusTrue(
        purchaseId: Long,
        type: FinancialTransactionType
    ): FinancialTransaction?

    @Query(
        value = """
            SELECT
                ft.account_id AS "accountId",

                COALESCE(
                    SUM(
                        CASE
                            WHEN ft.type IN (
                                'INCOME',
                                'TRANSFER_IN',
                                'OPENING_BALANCE'
                            )
                            THEN ft.amount

                            WHEN ft.type IN (
                                'EXPENSE',
                                'REFUND',
                                'TRANSFER_OUT'
                            )
                            THEN -ft.amount

                            ELSE 0
                        END
                    ),
                    0
                ) AS "balance"

            FROM public.financial_transactions ft

            WHERE ft.club_id = :clubId
              AND ft.status = TRUE

            GROUP BY ft.account_id
        """,
        nativeQuery = true
    )
    fun findAccountBalancesByClubId(
        @Param("clubId") clubId: Long
    ): List<AccountBalanceProjection>


    @Query(
        value = """
        SELECT COALESCE(
            SUM(
                CASE
                    WHEN ft.type IN (
                        'INCOME',
                        'TRANSFER_IN',
                        'OPENING_BALANCE'
                    )
                    THEN ft.amount

                    WHEN ft.type IN (
                        'EXPENSE',
                        'REFUND',
                        'TRANSFER_OUT'
                    )
                    THEN -ft.amount

                    ELSE 0
                END
            ),
            0
        )
        FROM public.financial_transactions ft
        WHERE ft.account_id = :accountId
          AND ft.status = TRUE
    """,
        nativeQuery = true
    )
    fun getAccountBalance(
        @Param("accountId") accountId: Long
    ): BigDecimal


    fun existsByAccountAccountIdAndTypeNot(
        accountId: Long,
        type: FinancialTransactionType
    ): Boolean


    @Query(
        """
    SELECT ft
    FROM FinancialTransaction ft
    JOIN ft.account a
    WHERE ft.club.clubId = :clubId

      AND ft.createdAt >= :from
      AND ft.createdAt < :to

      AND (
          :type IS NULL
          OR ft.type = :type
      )

      AND (
          :search = ''
          OR LOWER(a.title)
              LIKE LOWER(CONCAT('%', :search, '%'))
          OR LOWER(COALESCE(ft.comment, ''))
              LIKE LOWER(CONCAT('%', :search, '%'))
          OR (
              :searchId IS NOT NULL
              AND ft.transactionId = :searchId
          )
      )
    """
    )
    fun findPage(
        @Param("clubId")
        clubId: Long,

        @Param("from")
        from: OffsetDateTime,

        @Param("to")
        to: OffsetDateTime,

        @Param("type")
        type: FinancialTransactionType?,

        @Param("search")
        search: String,

        @Param("searchId")
        searchId: Long?,

        pageable: Pageable
    ): Page<FinancialTransaction>
}