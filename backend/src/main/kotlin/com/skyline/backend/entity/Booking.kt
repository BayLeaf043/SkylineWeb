package com.skyline.backend.entity

import jakarta.persistence.*
import java.time.OffsetDateTime

@Entity
@Table(
    name = "bookings",
    schema = "public",
    uniqueConstraints = [
        UniqueConstraint(
            name = "uq_bookings_session_client",
            columnNames = ["session_id", "client_id"]
        )
    ]
)
class Booking(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    var bookingId: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    var session: Session? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    var client: Client? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "certificate_id")
    var certificate: Certificate? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    var type: BookingType = BookingType.BOOKED,

    @Column(
        name = "created_at",
        nullable = false,
        updatable = false
    )
    var createdAt: OffsetDateTime = OffsetDateTime.now()
)