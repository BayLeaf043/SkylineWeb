package com.skyline.backend.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "users", schema = "public")
class User(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    var userId: Long = 0,

    @Column(name = "auth_user_id", unique = true)
    var authUserId: UUID? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id")
    var club: Club? = null,

    @Column(name = "first_name", nullable = false)
    var firstName: String = "",

    @Column(name = "last_name", nullable = false)
    var lastName: String = "",

    var phone: String? = null,

    @Column(name = "birth_date")
    var birthDate: LocalDate? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var role: UserRole = UserRole.ADMIN,

    @Column(
        name = "created_at",
        nullable = false,
        updatable = false
    )
    var createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(nullable = false)
    var status: Boolean = true,

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