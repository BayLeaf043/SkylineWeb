package com.skyline.backend.exception

data class ApiError(
    val status: Int,
    val error: String,
    val message: String
)