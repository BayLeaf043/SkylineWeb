package com.skyline.backend.dto.profile

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpdateClubProfileRequest(

    @field:NotBlank(message = "Назва клубу є обов'язковою")
    @field:Size(
        max = 150,
        message = "Назва клубу не може містити більше 150 символів"
    )
    val title: String,

    @field:Size(
        max = 100,
        message = "Назва міста не може містити більше 100 символів"
    )
    val city: String?,

    @field:Size(
        max = 255,
        message = "Адреса не може містити більше 255 символів"
    )
    val address: String?,

    @field:Size(
        max = 30,
        message = "Номер телефону не може містити більше 30 символів"
    )
    val phone: String?,

    @field:Email(message = "Вкажіть коректну електронну адресу")
    @field:Size(
        max = 255,
        message = "Email не може містити більше 255 символів"
    )
    val email: String?,

    @field:Size(
        max = 1000,
        message = "Опис не може містити більше 1000 символів"
    )
    val description: String?
)