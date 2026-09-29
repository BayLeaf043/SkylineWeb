package com.skyline.backend.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "trainers", schema = "public")
class Trainer(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trainer_id")
    var trainerId: Long = 0,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "user_id",
        nullable = false,
        unique = true
    )
    var user: User? = null,

    @Column(name = "specialization")
    var specialization: String? = null,

    @Column(name = "description")
    var description: String? = null,

    @Column(name = "experience_years")
    var experienceYears: Int? = null,

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