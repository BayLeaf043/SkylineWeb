package com.skyline.backend.dto.booking

import jakarta.validation.constraints.NotNull

data class CreateBookingRequest(

    @field:NotNull(
        message = "Клієнта необхідно обрати"
    )
    val clientId: Long
)