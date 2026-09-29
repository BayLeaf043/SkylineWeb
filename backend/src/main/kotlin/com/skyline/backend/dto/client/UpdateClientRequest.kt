package com.skyline.backend.dto.client

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.LocalDate

data class UpdateClientRequest(

    @field:NotBlank(message = "Ім'я є обов'язковим")
    @field:Size(
        max = 100,
        message = "Ім'я не може містити більше 100 символів"
    )
    val firstName: String,

    @field:NotBlank(message = "Прізвище є обов'язковим")
    @field:Size(
        max = 100,
        message = "Прізвище не може містити більше 100 символів"
    )
    val lastName: String,

    @field:NotBlank(message = "Номер телефону є обов'язковим")
    @field:Size(
        max = 30,
        message = "Номер телефону не може містити більше 30 символів"
    )
    val phone: String,

    @field:NotNull(message = "Дата народження є обов'язковою")
    val birthDate: LocalDate,

)