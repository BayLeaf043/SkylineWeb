package com.skyline.backend.dto.profile

import java.util.UUID
import java.time.LocalDate

data class ProfileResponse(
    val userId: Long,
    val firstName: String,
    val lastName: String,
    val phone: String?,
    val birthDate: LocalDate?,
    val email: String,
    val role: String
)