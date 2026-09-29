package com.skyline.backend.dto.employee

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.LocalDate

data class CreateTrainerRequest(

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

    @field:NotBlank(message = "Спеціалізація є обов'язковою")
    @field:Size(
        max = 255,
        message = "Спеціалізація не може містити більше 255 символів"
    )
    val specialization: String,

    @field:NotBlank(message = "Опис є обов'язковим")
    @field:Size(
        max = 2000,
        message = "Опис не може містити більше 2000 символів"
    )
    val description: String,

    @field:NotNull(message = "Досвід роботи є обов'язковим")
    @field:Min(
        value = 0,
        message = "Досвід роботи не може бути від'ємним"
    )
    @field:Max(
        value = 80,
        message = "Вкажіть коректний досвід роботи"
    )
    val experienceYears: Int
)