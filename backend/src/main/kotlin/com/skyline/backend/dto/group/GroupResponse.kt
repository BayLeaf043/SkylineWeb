package com.skyline.backend.dto.group

import java.time.OffsetDateTime

data class GroupResponse(

    val groupId: Long,

    val directionId: Long,
    val directionTitle: String,

    val trainerId: Long,
    val trainerFirstName: String,
    val trainerLastName: String,

    val activeClientsCount: Long,

    val title: String,

    val capacity: Int,

    val description: String?,

    val status: Boolean,

    val createdAt: OffsetDateTime
)