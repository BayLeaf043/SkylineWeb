package com.skyline.backend.dto.financialTransaction

data class FinancialTransactionPageResponse(

    val content: List<FinancialTransactionResponse>,

    val page: Int,
    val size: Int,

    val totalElements: Long,
    val totalPages: Int,

    val first: Boolean,
    val last: Boolean
)