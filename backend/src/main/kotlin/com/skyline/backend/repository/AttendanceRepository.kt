package com.skyline.backend.repository

import com.skyline.backend.entity.Attendance
import org.springframework.data.jpa.repository.JpaRepository
import java.time.OffsetDateTime

interface AttendanceRepository :
    JpaRepository<Attendance, Long> {

    fun findAllBySessionSessionIdOrderByClientUserLastNameAsc(
        sessionId: Long
    ): List<Attendance>

    fun findByAttendanceIdAndSessionClubClubId(
        attendanceId: Long,
        clubId: Long
    ): Attendance?

    fun findBySessionSessionIdAndClientClientId(
        sessionId: Long,
        clientId: Long
    ): Attendance?

    fun existsBySessionSessionIdAndClientClientId(
        sessionId: Long,
        clientId: Long
    ): Boolean

    fun findAllByClientClientIdAndSessionClubClubIdOrderBySessionStartAtDesc(
        clientId: Long,
        clubId: Long
    ): List<Attendance>

    fun findAllBySessionClubClubIdAndSessionGroupGroupIdAndSessionStartAtGreaterThanEqualAndSessionStartAtLessThanOrderBySessionStartAtAsc(
        clubId: Long,
        groupId: Long,
        from: OffsetDateTime,
        to: OffsetDateTime
    ): List<Attendance>

    fun existsByCertificateCertificateId(
        certificateId: Long
    ): Boolean

    fun existsByClientClientId(
        clientId: Long
    ): Boolean

    fun existsBySessionSessionId(
        sessionId: Long
    ): Boolean

}