package com.skyline.backend.dto.groupClient
import jakarta.validation.constraints.NotNull

data class AddGroupClientRequest(

    @field:NotNull(
        message = "Клієнта необхідно обрати"
    )
    val clientId: Long
)