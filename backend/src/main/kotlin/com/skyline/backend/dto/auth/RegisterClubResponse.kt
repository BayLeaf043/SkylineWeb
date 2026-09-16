package com.skyline.backend.dto.auth

import java.util.UUID

data class RegisterClubResponse(
    val userId: UUID,
    val clubId: Long,
    val role: String,
    val message: String
)