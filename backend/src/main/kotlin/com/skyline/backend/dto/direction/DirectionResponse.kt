package com.skyline.backend.dto.direction

import java.time.OffsetDateTime

data class DirectionResponse(
    val directionId: Long,
    val title: String,
    val status: Boolean,
    val createdAt: OffsetDateTime
)