package com.skyline.backend.dto.auth

import java.util.UUID

data class CurrentUserResponse(
    val userId: Long,
    val firstName: String,
    val lastName: String,
    val role: String,
    val clubId: Long?,
    val clubName: String?
)