package com.skyline.backend.dto.purchase

import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.math.BigDecimal
import java.time.LocalDate

data class CreatePurchaseRequest(

    @field:NotNull(message = "Клієнт є обов'язковим")
    val clientId: Long,

    @field:NotNull(message = "Послуга є обов'язковою")
    val serviceId: Long,

    @field:NotNull(message = "Рахунок є обов'язковим")
    val accountId: Long,

    @field:NotNull(message = "Ціна продажу є обов'язковою")
    @field:DecimalMin(
        value = "0.01",
        inclusive = true,
        message = "Ціна продажу повинна бути більшою за 0"
    )
    val amount: BigDecimal,

    @field:NotNull(message = "Дата початку дії є обов'язковою")
    val validFrom: LocalDate,

    @field:Size(
        max = 500,
        message = "Коментар не може містити більше 500 символів"
    )
    val comment: String? = null
)