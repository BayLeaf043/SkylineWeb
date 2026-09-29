package com.skyline.backend.dto.client

import java.time.LocalDate
import java.time.OffsetDateTime

data class ClientResponse(

    val clientId: Long,
    val userId: Long,

    val firstName: String,
    val lastName: String,

    val phone: String?,
    val birthDate: LocalDate?,

    val status: Boolean,

    val lastVisit: OffsetDateTime?,
    val countOfVisits: Int,

    val createdAt: OffsetDateTime
)