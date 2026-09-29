package com.skyline.backend.entity

import jakarta.persistence.*
import java.time.OffsetDateTime

@Entity
@Table(name = "clients", schema = "public")
class Client(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "client_id")
    var clientId: Long = 0,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "user_id",
        nullable = false,
        unique = true
    )
    var user: User? = null,

    @Column(name = "last_visit")
    var lastVisit: OffsetDateTime? = null,

    @Column(
        name = "count_of_visits",
        nullable = false
    )
    var countOfVisits: Int = 0,

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