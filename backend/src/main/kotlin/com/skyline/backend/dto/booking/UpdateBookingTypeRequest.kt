package com.skyline.backend.dto.booking

import com.skyline.backend.entity.BookingType
import jakarta.validation.constraints.NotNull

data class UpdateBookingTypeRequest(

    @field:NotNull(
        message = "Статус бронювання є обов'язковим"
    )
    val type: BookingType
)