package com.skyline.backend.repository

import com.skyline.backend.entity.Purchase
import org.springframework.data.jpa.repository.JpaRepository

interface PurchaseRepository : JpaRepository<Purchase, Long> {

    fun findAllByClubClubIdOrderByCreatedAtDesc(
        clubId: Long
    ): List<Purchase>

    fun findByPurchaseIdAndClubClubId(
        purchaseId: Long,
        clubId: Long
    ): Purchase?

    fun existsByClientClientId(
        clientId: Long
    ): Boolean

    fun existsByServiceServiceId(
        serviceId: Long
    ): Boolean
}