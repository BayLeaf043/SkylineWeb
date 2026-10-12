package com.skyline.backend.repository

import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.Lock
import com.skyline.backend.entity.Certificate
import org.springframework.data.jpa.repository.JpaRepository
import com.skyline.backend.entity.CertificateType
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDate
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable

interface CertificateRepository : JpaRepository<Certificate, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Certificate c WHERE c.certificateId = :certificateId AND c.purchase.club.clubId = :clubId")
    fun findLockedByCertificateIdAndPurchaseClubClubId(
        @Param("certificateId") certificateId: Long,
        @Param("clubId") clubId: Long
    ): Certificate?

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

    fun findAllByPurchaseClientClientIdAndPurchaseClubClubIdAndStatusTrueOrderByValidToAsc(
        clientId: Long,
        clubId: Long
    ): List<Certificate>

    fun findAllByPurchaseClientClientIdAndPurchaseClubClubIdOrderByCreatedAtDesc(
        clientId: Long,
        clubId: Long
    ): List<Certificate>

    @Modifying
    @Query(
        """
    UPDATE Certificate c
    SET c.type = :expiredType,
        c.updatedAt = CURRENT_TIMESTAMP
    WHERE c.purchase.club.clubId = :clubId
      AND c.type = :activeType
      AND c.status = true
      AND c.validTo < :today
    """
    )
    fun expireCertificates(
        @Param("clubId") clubId: Long,
        @Param("today") today: LocalDate,
        @Param("activeType") activeType: CertificateType,
        @Param("expiredType") expiredType: CertificateType
    ): Int


    fun findAllByPurchaseClubClubIdAndTypeAndStatusTrue(
        clubId: Long,
        type: CertificateType,
        pageable: Pageable
    ): Page<Certificate>


    @Query(
        """
    SELECT c
    FROM Certificate c
    JOIN c.purchase p
    JOIN p.client cl
    JOIN cl.user u
    WHERE p.club.clubId = :clubId
      AND c.type <> :activeType
      AND c.validTo >= :from
      AND c.validTo < :to
      AND (
          :search = ''
          OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
          OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
          OR (
              :searchId IS NOT NULL
              AND c.certificateId = :searchId
          )
      )
    """
    )
    fun findArchivePage(
        @Param("clubId") clubId: Long,
        @Param("activeType") activeType: CertificateType,
        @Param("from") from: LocalDate,
        @Param("to") to: LocalDate,
        @Param("search") search: String,
        @Param("searchId") searchId: Long?,
        pageable: Pageable
    ): Page<Certificate>


    @Query(
        """
    SELECT c
    FROM Certificate c
    JOIN c.purchase p
    JOIN p.client cl
    JOIN cl.user u
    WHERE p.club.clubId = :clubId
      AND c.type = :activeType
      AND c.status = true
      AND (
          :search = ''
          OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
          OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
          OR (
              :searchId IS NOT NULL
              AND c.certificateId = :searchId
          )
      )
    """
    )
    fun findActivePage(
        @Param("clubId") clubId: Long,
        @Param("activeType") activeType: CertificateType,
        @Param("search") search: String,
        @Param("searchId") searchId: Long?,
        pageable: Pageable
    ): Page<Certificate>


}
