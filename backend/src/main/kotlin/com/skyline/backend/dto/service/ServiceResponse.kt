package com.skyline.backend.dto.service

import java.math.BigDecimal
import java.time.OffsetDateTime

data class ServiceResponse(

    val serviceId: Long,

    val categoryId: Long,

    val categoryTitle: String,

    val directionId: Long,

    val directionTitle: String,

    val title: String,

    val description: String?,

    val price: BigDecimal,

    val sessionsCount: Int,

    val validityDays: Int,

    val status: Boolean,

    val createdAt: OffsetDateTime
)