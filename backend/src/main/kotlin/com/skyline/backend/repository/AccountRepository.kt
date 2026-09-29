package com.skyline.backend.repository

import com.skyline.backend.entity.Account
import org.springframework.data.jpa.repository.JpaRepository

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
}