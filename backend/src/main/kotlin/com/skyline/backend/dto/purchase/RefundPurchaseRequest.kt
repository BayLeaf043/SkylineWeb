package com.skyline.backend.dto.purchase

import jakarta.validation.constraints.Size

data class RefundPurchaseRequest(

    @field:Size(
        max = 500,
        message = "Коментар не може містити більше 500 символів"
    )
    val comment: String? = null
)