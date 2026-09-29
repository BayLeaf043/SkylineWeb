package com.skyline.backend.dto.service

import jakarta.validation.constraints.*
import java.math.BigDecimal

data class CreateServiceRequest(

    @field:NotNull(
        message = "Категорію необхідно обрати"
    )
    val categoryId: Long,

    @field:NotNull(
        message = "Напрямок необхідно обрати"
    )
    val directionId: Long,

    @field:NotBlank(
        message = "Назва послуги не може бути порожньою"
    )
    @field:Size(
        max = 100,
        message = "Назва послуги не може містити більше 100 символів"
    )
    val title: String,

    @field:Size(
        max = 1000,
        message = "Опис не може містити більше 1000 символів"
    )
    val description: String? = null,

    @field:DecimalMin(
        value = "0.01",
        message = "Ціна повинна бути більшою за 0"
    )
    val price: BigDecimal,

    @field:Min(
        value = 1,
        message = "Кількість занять повинна бути від 1 до 12"
    )
    @field:Max(
        value = 12,
        message = "Кількість занять повинна бути від 1 до 12"
    )
    val sessionsCount: Int,

    @field:Min(
        value = 1,
        message = "Термін дії повинен бути не менше 1 дня"
    )
    val validityDays: Int
)