package com.skyline.backend.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.OffsetDateTime

@Entity
@Table(name = "financial_transactions", schema = "public")
class FinancialTransaction(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    var transactionId: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    var club: Club? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    var account: Account? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_id", nullable = true)
    var purchase: Purchase? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transfer_id", nullable = true)
    var transfer: AccountTransfer? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var type: FinancialTransactionType =
        FinancialTransactionType.INCOME,

    @Column(
        nullable = false,
        precision = 12,
        scale = 2
    )
    var amount: BigDecimal = BigDecimal.ZERO,

    @Column(length = 500)
    var comment: String? = null,

    @Column(nullable = false)
    var status: Boolean = true,

    @Column(
        name = "created_at",
        nullable = false,
        updatable = false
    )
    var createdAt: OffsetDateTime =
        OffsetDateTime.now(),

    @Column(
        name = "updated_at",
        nullable = false
    )
    var updatedAt: OffsetDateTime =
        OffsetDateTime.now()

) {

    @PreUpdate
    fun onUpdate() {
        updatedAt = OffsetDateTime.now()
    }
}