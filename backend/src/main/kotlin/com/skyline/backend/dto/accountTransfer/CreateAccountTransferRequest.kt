package com.skyline.backend.dto.accountTransfer

import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.math.BigDecimal

data class CreateAccountTransferRequest(

    @field:NotNull(message = "Рахунок списання є обов'язковим")
    val fromAccountId: Long,

    @field:NotNull(message = "Рахунок зарахування є обов'язковим")
    val toAccountId: Long,

    @field:NotNull(message = "Сума переказу є обов'язковою")
    @field:DecimalMin(
        value = "0.01",
        inclusive = true,
        message = "Сума переказу повинна бути більшою за 0"
    )
    val amount: BigDecimal,

    @field:Size(
        max = 500,
        message = "Коментар не може містити більше 500 символів"
    )
    val comment: String? = null
)