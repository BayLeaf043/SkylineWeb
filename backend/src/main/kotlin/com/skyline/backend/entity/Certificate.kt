package com.skyline.backend.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.OffsetDateTime

@Entity
@Table(name = "certificates", schema = "public")
class Certificate(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "certificate_id")
    var certificateId: Long = 0,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "purchase_id",
        nullable = false,
        unique = true
    )
    var purchase: Purchase? = null,

    @Column(name = "valid_from", nullable = false)
    var validFrom: LocalDate = LocalDate.now(),

    @Column(name = "valid_to", nullable = false)
    var validTo: LocalDate = LocalDate.now(),

    @Column(name = "total_sessions", nullable = false)
    var totalSessions: Int = 1,

    @Column(name = "used_sessions", nullable = false)
    var usedSessions: Int = 0,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var type: CertificateType = CertificateType.ACTIVE,

    @Column(nullable = false)
    var status: Boolean = true,

    @Column(
        name = "created_at",
        nullable = false,
        updatable = false
    )
    var createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(
        name = "updated_at",
        nullable = false
    )
    var updatedAt: OffsetDateTime = OffsetDateTime.now()

) {

    @PreUpdate
    fun onUpdate() {
        updatedAt = OffsetDateTime.now()
    }
}