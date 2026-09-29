package com.skyline.backend.dto.purchase

import com.skyline.backend.entity.PurchaseType
import java.math.BigDecimal
import java.time.OffsetDateTime

data class PurchaseResponse(

    val purchaseId: Long,

    val clientId: Long,
    val clientFirstName: String,
    val clientLastName: String,

    val serviceId: Long,
    val serviceTitle: String,

    val amount: BigDecimal,

    val type: PurchaseType,
    val status: Boolean,

    val comment: String?,

    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime
)