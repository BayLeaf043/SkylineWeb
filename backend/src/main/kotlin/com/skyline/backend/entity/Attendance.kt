package com.skyline.backend.entity

import jakarta.persistence.*
import java.time.OffsetDateTime

@Entity
@Table(
    name = "attendance",
    schema = "public",
    uniqueConstraints = [
        UniqueConstraint(
            name = "uq_attendance_session_client",
            columnNames = ["session_id", "client_id"]
        )
    ]
)
class Attendance(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendance_id")
    var attendanceId: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    var session: Session? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    var client: Client? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "certificate_id")
    var certificate: Certificate? = null,

    @Column(
        name = "created_at",
        nullable = false,
        updatable = false
    )
    var createdAt: OffsetDateTime = OffsetDateTime.now()
)