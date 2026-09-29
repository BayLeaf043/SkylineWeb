package com.skyline.backend.dto.accountTransfer

import java.math.BigDecimal
import java.time.OffsetDateTime

data class AccountTransferResponse(

    val transferId: Long,

    val fromAccountId: Long,
    val fromAccountTitle: String,

    val toAccountId: Long,
    val toAccountTitle: String,

    val amount: BigDecimal,
    val comment: String?,

    val status: Boolean,

    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime
)