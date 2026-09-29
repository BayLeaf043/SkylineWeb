package com.skyline.backend.dto.financialTransaction

import com.skyline.backend.entity.FinancialTransactionType
import java.math.BigDecimal
import java.time.OffsetDateTime

data class FinancialTransactionResponse(

    val transactionId: Long,

    val accountId: Long,
    val accountTitle: String,

    val purchaseId: Long?,
    val transferId: Long?,

    val type: FinancialTransactionType,

    val amount: BigDecimal,
    val comment: String?,

    val status: Boolean,

    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime
)