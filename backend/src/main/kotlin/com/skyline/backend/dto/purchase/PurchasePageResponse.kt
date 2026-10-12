package com.skyline.backend.dto.purchase

data class PurchasePageResponse(

    val content: List<PurchaseResponse>,

    val page: Int,
    val size: Int,

    val totalElements: Long,
    val totalPages: Int,

    val first: Boolean,
    val last: Boolean
)