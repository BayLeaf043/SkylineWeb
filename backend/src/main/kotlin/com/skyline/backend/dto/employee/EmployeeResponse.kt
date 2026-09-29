package com.skyline.backend.dto.employee

import java.time.LocalDate
import java.util.UUID

data class EmployeeResponse(
    val userId: Long,

    val firstName: String,
    val lastName: String,

    val phone: String?,
    val birthDate: LocalDate?,

    val role: String,
    val status: Boolean,

    val trainerId: Long?,

    val specialization: String?,
    val description: String?,
    val experienceYears: Int?
)