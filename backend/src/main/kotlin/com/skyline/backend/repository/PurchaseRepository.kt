package com.skyline.backend.repository

import com.skyline.backend.entity.Purchase
import org.springframework.data.jpa.repository.JpaRepository
import com.skyline.backend.entity.PurchaseType
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import java.time.OffsetDateTime
import java.math.BigDecimal
import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.Lock

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

    fun countByClientClientIdAndClubClubIdAndTypeAndStatusTrue(
        clientId: Long,
        clubId: Long,
        type: PurchaseType
    ): Long


    @Query(
        """
    SELECT COALESCE(SUM(p.amount), 0)
    FROM Purchase p
    WHERE p.client.clientId = :clientId
      AND p.club.clubId = :clubId
      AND p.type = com.skyline.backend.entity.PurchaseType.COMPLETED
      AND p.status = true
    """
    )
    fun getTotalPaidByClient(
        @Param("clientId")
        clientId: Long,

        @Param("clubId")
        clubId: Long
    ): BigDecimal

    fun findAllByClubClubIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
        clubId: Long,
        from: OffsetDateTime,
        to: OffsetDateTime,
        pageable: Pageable
    ): Page<Purchase>

    fun findAllByClubClubIdAndTypeAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
        clubId: Long,
        type: PurchaseType,
        from: OffsetDateTime,
        to: OffsetDateTime,
        pageable: Pageable
    ): Page<Purchase>

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query(
        """
    SELECT p
    FROM Purchase p
    WHERE p.purchaseId = :purchaseId
      AND p.club.clubId = :clubId
    """
    )
    fun findLockedByPurchaseIdAndClubClubId(
        @Param("purchaseId") purchaseId: Long,
        @Param("clubId") clubId: Long
    ): Purchase?

}