package com.skyline.backend.dto.session

import java.time.OffsetDateTime
import com.skyline.backend.entity.SessionType

data class SessionResponse(

    val sessionId: Long,

    val groupId: Long?,
    val groupTitle: String?,

    val directionId: Long,
    val directionTitle: String,

    val categoryId: Long,
    val categoryTitle: String,

    val trainerId: Long?,
    val trainerFirstName: String?,
    val trainerLastName: String?,

    val hallId: Long,
    val hallTitle: String,

    val startAt: OffsetDateTime,
    val endAt: OffsetDateTime,

    val capacity: Int,

    val type: SessionType,

    val comment: String?,

    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime,

    val closedAt: OffsetDateTime?
)