package com.skyline.backend.dto.attendance

import java.time.OffsetDateTime

data class AttendanceResponse(

    val attendanceId: Long,

    val sessionId: Long,

    val clientId: Long,
    val clientFirstName: String,
    val clientLastName: String,
    val clientPhone: String?,

    val certificateId: Long?,

    val createdAt: OffsetDateTime
)