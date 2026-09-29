package com.skyline.backend.dto.auth

import java.util.UUID

data class RegisterClubResponse(
    val userId: Long,
    val clubId: Long,
    val role: String,
    val message: String
)