package com.skyline.backend.dto.hall

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpdateHallRequest(

    @field:NotBlank(message = "Назва залу є обов'язковою")
    @field:Size(
        max = 100,
        message = "Назва залу не може містити більше 100 символів"
    )
    val title: String,

    @field:Size(
        max = 1000,
        message = "Опис не може містити більше 1000 символів"
    )
    val description: String? = null,

    @field:Min(
        value = 1,
        message = "Місткість залу повинна бути не менше 1"
    )
    val capacity: Int
)