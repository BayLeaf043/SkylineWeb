package com.skyline.backend.dto.attendance

import jakarta.validation.constraints.NotNull

data class CreateAttendanceRequest(

    @field:NotNull(
        message = "Клієнт є обов'язковим"
    )
    val clientId: Long?,

    @field:NotNull(
        message = "Необхідно обрати сертифікат"
    )
    val certificateId: Long?
)