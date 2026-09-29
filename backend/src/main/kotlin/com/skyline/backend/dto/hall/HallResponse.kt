package com.skyline.backend.dto.hall

import java.time.OffsetDateTime

data class HallResponse(
    val hallId: Long,
    val title: String,
    val description: String?,
    val capacity: Int,
    val status: Boolean,
    val createdAt: OffsetDateTime
)