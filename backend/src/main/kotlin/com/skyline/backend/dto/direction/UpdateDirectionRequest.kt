package com.skyline.backend.dto.direction

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpdateDirectionRequest(

    @field:NotBlank(message = "Назва напрямку є обов'язковою")
    @field:Size(
        max = 100,
        message = "Назва напрямку не може містити більше 100 символів"
    )
    val title: String
)