package com.skyline.backend.repository

import com.skyline.backend.entity.Certificate
import org.springframework.data.jpa.repository.JpaRepository

interface CertificateRepository : JpaRepository<Certificate, Long> {

    fun findByPurchasePurchaseId(
        purchaseId: Long
    ): Certificate?

    fun findAllByPurchaseClubClubIdOrderByCreatedAtDesc(
        clubId: Long
    ): List<Certificate>

    fun findByCertificateIdAndPurchaseClubClubId(
        certificateId: Long,
        clubId: Long
    ): Certificate?

}