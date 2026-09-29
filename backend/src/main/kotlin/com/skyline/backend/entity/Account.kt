package com.skyline.backend.entity

import jakarta.persistence.*
import java.time.OffsetDateTime

@Entity
@Table(name = "accounts", schema = "public")
class Account(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    var accountId: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    var club: Club? = null,

    @Column(nullable = false, length = 100)
    var title: String = "",

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var type: AccountType = AccountType.CASH,

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