package com.skyline.backend.repository.projection

import java.math.BigDecimal

interface AccountBalanceProjection {

    val accountId: Long

    val balance: BigDecimal
}