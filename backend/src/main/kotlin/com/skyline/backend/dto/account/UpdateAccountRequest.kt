package com.skyline.backend.dto.account

import com.skyline.backend.entity.AccountType
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class UpdateAccountRequest(

    @field:NotBlank(message = "Назва рахунку є обов'язковою")
    @field:Size(
        max = 100,
        message = "Назва рахунку не може містити більше 100 символів"
    )
    val title: String,

    @field:NotNull(message = "Тип рахунку є обов'язковим")
    val type: AccountType
)