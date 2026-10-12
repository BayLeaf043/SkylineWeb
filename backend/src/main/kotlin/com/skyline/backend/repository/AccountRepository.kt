package com.skyline.backend.repository

import com.skyline.backend.entity.Account
import org.springframework.data.jpa.repository.JpaRepository
import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface AccountRepository : JpaRepository<Account, Long> {

    fun findAllByClubClubIdOrderByTitleAsc(
        clubId: Long
    ): List<Account>

    fun findByAccountIdAndClubClubId(
        accountId: Long,
        clubId: Long
    ): Account?

    fun existsByClubClubIdAndTitleIgnoreCase(
        clubId: Long,
        title: String
    ): Boolean

    fun existsByClubClubIdAndTitleIgnoreCaseAndAccountIdNot(
        clubId: Long,
        title: String,
        accountId: Long
    ): Boolean

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query(
        """
    SELECT a
    FROM Account a
    WHERE a.accountId = :accountId
      AND a.club.clubId = :clubId
    """
    )
    fun findLockedByAccountIdAndClubClubId(
        @Param("accountId") accountId: Long,
        @Param("clubId") clubId: Long
    ): Account?
}