package com.skyline.backend.dto.booking

import java.time.OffsetDateTime
import com.skyline.backend.entity.BookingType

data class BookingResponse(

    val bookingId: Long,

    val sessionId: Long,

    val clientId: Long,

    val clientFirstName: String,

    val clientLastName: String,

    val clientPhone: String?,
    val certificateId: Long?,

    val type: BookingType,

    val createdAt: OffsetDateTime
)