package com.skyline.backend.dto.category

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpdateCategoryRequest(

    @field:NotBlank(message = "Назва категорії є обов'язковою")
    @field:Size(
        max = 100,
        message = "Назва категорії не може містити більше 100 символів"
    )
    val title: String
)