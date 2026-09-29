package com.skyline.backend.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.OffsetDateTime

@Entity
@Table(name = "purchases", schema = "public")
class Purchase(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "purchase_id")
    var purchaseId: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    var club: Club? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    var client: Client? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    var service: Service? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var type: PurchaseType = PurchaseType.COMPLETED,

    @Column(
        nullable = false,
        precision = 12,
        scale = 2
    )
    var amount: BigDecimal = BigDecimal.ZERO,

    @Column(nullable = false)
    var status: Boolean = true,

    @Column(length = 500)
    var comment: String? = null,

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