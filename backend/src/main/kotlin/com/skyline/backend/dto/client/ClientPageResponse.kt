package com.skyline.backend.dto.client


data class ClientPageResponse(

    val content: List<ClientResponse>,

    val page: Int,
    val size: Int,

    val totalElements: Long,
    val totalPages: Int,

    val first: Boolean,
    val last: Boolean
)