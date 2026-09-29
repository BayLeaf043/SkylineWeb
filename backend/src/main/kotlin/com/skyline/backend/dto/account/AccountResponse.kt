package com.skyline.backend.dto.account

import com.skyline.backend.entity.AccountType
import java.time.OffsetDateTime
import java.math.BigDecimal

data class AccountResponse(
    val accountId: Long,
    val title: String,
    val type: AccountType,
    val balance: BigDecimal,
    val status: Boolean,
    val createdAt: OffsetDateTime,
    val updatedAt: OffsetDateTime
)