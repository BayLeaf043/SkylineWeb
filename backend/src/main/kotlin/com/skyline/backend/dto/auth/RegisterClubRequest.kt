package com.skyline.backend.dto.auth

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import jakarta.validation.constraints.Pattern
import java.time.LocalDate

data class RegisterClubRequest(

    @field:NotBlank(message = "Club name is required")
    @field:Size(max = 150)
    val clubName: String,

    @field:Size(max = 100)
    val city: String?,

    @field:NotBlank(message = "First name is required")
    @field:Size(max = 100)
    val firstName: String,

    @field:NotBlank(message = "Last name is required")
    @field:Size(max = 100)
    val lastName: String,

    @field:Email(message = "Invalid email")
    @field:NotBlank(message = "Email is required")
    val email: String,

    @field:NotBlank(message = "Password is required")
    @field:Size(min = 8, max = 72, message = "Password must contain at least 8 characters")
    @field:Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,72}$",
        message = "Password must contain uppercase and lowercase letters and at least one number"
    )
    val password: String,
)