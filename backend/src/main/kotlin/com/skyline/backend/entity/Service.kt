package com.skyline.backend.entity

import jakarta.persistence.*
import java.time.OffsetDateTime
import java.math.BigDecimal

@Entity
@Table(name = "services", schema = "public")
class Service(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_id")
    var serviceId: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    var club: Club? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    var category: Category? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "direction_id", nullable = false)
    var direction: Direction? = null,

    @Column(nullable = false, length = 100)
    var title: String = "",

    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    @Column(nullable = false, precision = 10, scale = 2)
    var price: BigDecimal = BigDecimal.ZERO,

    @Column(name = "sessions_count", nullable = false)
    var sessionsCount: Int = 1,

    @Column(name = "validity_days", nullable = false)
    var validityDays: Int = 30,

    @Column(nullable = false)
    var status: Boolean = true,

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: OffsetDateTime = OffsetDateTime.now()
){

    @PreUpdate
    fun onUpdate() {
        updatedAt = OffsetDateTime.now()
    }
}