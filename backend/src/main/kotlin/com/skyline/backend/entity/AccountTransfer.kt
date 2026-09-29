package com.skyline.backend.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.OffsetDateTime

@Entity
@Table(name = "account_transfers", schema = "public")
class AccountTransfer(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transfer_id")
    var transferId: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    var club: Club? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_account_id", nullable = false)
    var fromAccount: Account? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_account_id", nullable = false)
    var toAccount: Account? = null,

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