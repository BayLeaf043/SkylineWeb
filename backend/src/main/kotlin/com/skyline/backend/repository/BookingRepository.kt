package com.skyline.backend.repository

import com.skyline.backend.entity.Booking
import com.skyline.backend.entity.BookingType
import org.springframework.data.jpa.repository.JpaRepository

interface BookingRepository : JpaRepository<Booking, Long> {

    fun findAllBySessionSessionIdAndTypeOrderByClientUserLastNameAsc(
        sessionId: Long,
        type: BookingType
    ): List<Booking>

    fun findByBookingIdAndSessionClubClubId(
        bookingId: Long,
        clubId: Long
    ): Booking?

    fun findBySessionSessionIdAndClientClientId(
        sessionId: Long,
        clientId: Long
    ): Booking?

    fun existsBySessionSessionIdAndClientClientIdAndType(
        sessionId: Long,
        clientId: Long,
        type: BookingType
    ): Boolean

    fun countBySessionSessionIdAndType(
        sessionId: Long,
        type: BookingType
    ): Long

    fun existsByClientClientId(
        clientId: Long
    ): Boolean

    fun existsBySessionSessionId(
        sessionId: Long
    ): Boolean

    fun existsByCertificateCertificateIdAndType(
        certificateId: Long,
        type: BookingType
    ): Boolean

    fun existsByCertificateCertificateId(
        certificateId: Long
    ): Boolean
}