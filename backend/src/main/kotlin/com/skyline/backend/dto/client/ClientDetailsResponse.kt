package com.skyline.backend.dto.client

import com.skyline.backend.dto.certificate.CertificateResponse
import java.math.BigDecimal
import java.time.OffsetDateTime


data class ClientDetailsResponse(

    val client: ClientResponse,

    val groups: List<ClientGroupResponse>,

    val certificates: List<CertificateResponse>,

    val finances: ClientFinanceResponse
)


data class ClientGroupResponse(

    val groupClientId: Long,

    val groupId: Long,
    val groupTitle: String,

    val directionId: Long,
    val directionTitle: String,

    val trainerId: Long,
    val trainerFirstName: String,
    val trainerLastName: String,

    val joinedAt: OffsetDateTime,

    val status: Boolean
)


data class ClientFinanceResponse(

    val completedPurchasesCount: Long,

    val refundedPurchasesCount: Long,

    val totalPaid: BigDecimal
)