package com.skyline.backend.repository

import com.skyline.backend.entity.AccountTransfer
import org.springframework.data.jpa.repository.JpaRepository

interface AccountTransferRepository :
    JpaRepository<AccountTransfer, Long> {

    fun findAllByClubClubIdOrderByCreatedAtDesc(
        clubId: Long
    ): List<AccountTransfer>

    fun findByTransferIdAndClubClubId(
        transferId: Long,
        clubId: Long
    ): AccountTransfer?

    fun existsByFromAccountAccountIdOrToAccountAccountId(
        fromAccountId: Long,
        toAccountId: Long
    ): Boolean
}