package com.skyline.backend.entity

import jakarta.persistence.*
import java.time.OffsetDateTime

@Entity
@Table(name = "sessions")
class Session(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    var sessionId: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    var club: Club,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    var group: Group? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "direction_id", nullable = false)
    var direction: Direction,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    var category: Category,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id")
    var trainer: Trainer? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hall_id", nullable = false)
    var hall: Hall,

    @Column(name = "start_at", nullable = false)
    var startAt: OffsetDateTime,

    @Column(name = "end_at", nullable = false)
    var endAt: OffsetDateTime,

    @Column(nullable = false)
    var capacity: Int,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var type: SessionType = SessionType.PLANNED,

    @Column(columnDefinition = "TEXT")
    var comment: String? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "closed_at")
    var closedAt: OffsetDateTime? = null
)