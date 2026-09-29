package com.skyline.backend.dto.profile

data class ClubProfileResponse(
    val clubId: Long,
    val title: String,
    val city: String?,
    val address: String?,
    val phone: String?,
    val email: String?,
    val description: String?
)