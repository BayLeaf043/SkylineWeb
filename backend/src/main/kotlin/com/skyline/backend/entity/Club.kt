package com.skyline.backend.entity

import jakarta.persistence.*
import java.time.OffsetDateTime

@Entity
@Table(name = "clubs", schema = "public")
class Club(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "club_id")
    var clubId: Long = 0,

    @Column(nullable = false)
    var title: String = "",

    var address: String? = null,

    var city: String? = null,

    var email: String? = null,

    var phone: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(nullable = false)
    var status: Boolean = true,

    @Column(name = "description")
    var description: String? = null,

    @Column(name = "updated_at", nullable = false)
    var updatedAt: OffsetDateTime = OffsetDateTime.now()
){

    @PreUpdate
    fun onUpdate() {
        updatedAt = OffsetDateTime.now()
    }
}