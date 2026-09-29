package com.skyline.backend.dto.certificate

import com.skyline.backend.entity.CertificateType
import java.time.LocalDate
import java.time.OffsetDateTime

data class CertificateResponse(

    val certificateId: Long,
    val purchaseId: Long,

    val clientId: Long,
    val clientFirstName: String,
    val clientLastName: String,

    val serviceId: Long,
    val serviceTitle: String,

    val validFrom: LocalDate,
    val validTo: LocalDate,

    val totalSessions: Int,
    val usedSessions: Int,
    val remainingSessions: Int,

    val type: CertificateType,
    val status: Boolean,

    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime
)