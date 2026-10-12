package com.skyline.backend.dto.certificate

data class CertificatePageResponse(

    val content:
    List<CertificateResponse>,

    val page: Int,
    val size: Int,

    val totalElements: Long,
    val totalPages: Int,

    val first: Boolean,
    val last: Boolean
)