package com.skyline.backend.dto.group

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class CreateGroupRequest(

    @field:NotNull(
        message = "Напрямок необхідно обрати"
    )
    val directionId: Long,

    @field:NotNull(
        message = "Тренера необхідно обрати"
    )
    val trainerId: Long,

    @field:NotBlank(
        message = "Назва групи є обов'язковою"
    )
    @field:Size(
        max = 255,
        message = "Назва групи не може містити більше 255 символів"
    )
    val title: String,

    @field:Min(
        value = 1,
        message = "Місткість групи повинна бути не менше 1"
    )
    val capacity: Int,

    @field:Size(
        max = 1000,
        message = "Опис не може містити більше 1000 символів"
    )
    val description: String? = null
)