package com.skyline.backend.dto.session

import com.skyline.backend.entity.SessionType
import jakarta.validation.constraints.NotNull

data class UpdateSessionTypeRequest(

    @field:NotNull(
        message = "Статус заняття є обов'язковим"
    )
    val type: SessionType
)