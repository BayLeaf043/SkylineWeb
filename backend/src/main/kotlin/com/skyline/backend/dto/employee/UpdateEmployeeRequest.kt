package com.skyline.backend.dto.employee

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import jakarta.validation.constraints.NotNull
import java.time.LocalDate
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Max

data class UpdateEmployeeRequest(

    @field:NotBlank(message = "Ім'я є обов'язковим")
    @field:Size(max = 100, message = "Ім'я не може містити більше 100 символів")
    val firstName: String,

    @field:NotBlank(message = "Прізвище є обов'язковим")
    @field:Size(max = 100, message = "Прізвище не може містити більше 100 символів")
    val lastName: String,

    @field:NotBlank(message = "Номер телефону є обов'язковим")
    @field:Size(max = 30, message = "Номер телефону не може містити більше 30 символів")
    val phone: String,

    @field:NotNull(message = "Дата народження є обов'язковою")
    val birthDate: LocalDate,

    val specialization: String?,
    val description: String?,

    @field:Min(
        value = 0,
        message = "Досвід роботи не може бути від'ємним"
    )
    @field:Max(
        value = 80,
        message = "Вкажіть коректний досвід роботи"
    )
    val experienceYears: Int?
)