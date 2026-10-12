package com.skyline.backend.dto.groupClient

import java.time.OffsetDateTime

data class GroupClientResponse(

    val groupClientId: Long,

    val groupId: Long,

    val clientId: Long,

    val clientFirstName: String,

    val clientLastName: String,

    val joinedAt: OffsetDateTime,

    val status: Boolean
)