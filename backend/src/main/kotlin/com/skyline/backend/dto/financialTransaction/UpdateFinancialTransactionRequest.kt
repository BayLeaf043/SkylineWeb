package com.skyline.backend.dto.financialTransaction

import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.math.BigDecimal

data class UpdateFinancialTransactionRequest(

    @field:NotNull(message = "Рахунок є обов'язковим")
    val accountId: Long,

    @field:NotNull(message = "Тип операції є обов'язковим")
    val type: ManualFinancialTransactionType,

    @field:NotNull(message = "Сума є обов'язковою")
    @field:DecimalMin(
        value = "0.01",
        inclusive = true,
        message = "Сума повинна бути більшою за 0"
    )
    val amount: BigDecimal,

    @field:Size(
        max = 500,
        message = "Коментар не може містити більше 500 символів"
    )
    val comment: String? = null
)