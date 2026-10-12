package com.skyline.backend.entity

import jakarta.persistence.*
import java.time.OffsetDateTime

@Entity
@Table(
    name = "group_clients",
    uniqueConstraints = [
        UniqueConstraint(
            name = "uq_group_clients",
            columnNames = ["group_id", "client_id"]
        )
    ]
)
class GroupClient(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_client_id")
    var groupClientId: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    var group: Group,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    var client: Client,

    @Column(name = "joined_at", nullable = false)
    var joinedAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(nullable = false)
    var status: Boolean = true
)