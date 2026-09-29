package com.skyline.backend.dto.category

import java.time.OffsetDateTime

data class CategoryResponse(
    val categoryId: Long,
    val title: String,
    val status: Boolean,
    val createdAt: OffsetDateTime
)