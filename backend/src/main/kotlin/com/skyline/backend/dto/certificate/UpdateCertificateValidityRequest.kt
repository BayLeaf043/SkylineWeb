package com.skyline.backend.dto.certificate

import jakarta.validation.constraints.NotNull
import java.time.LocalDate

data class UpdateCertificateValidityRequest(

    @field:NotNull(message = "Дата закінчення дії є обов'язковою")
    val validTo: LocalDate
)