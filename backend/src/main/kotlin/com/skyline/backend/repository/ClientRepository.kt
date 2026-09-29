package com.skyline.backend.repository

import com.skyline.backend.entity.Client
import org.springframework.data.jpa.repository.JpaRepository

interface ClientRepository : JpaRepository<Client, Long> {

    fun findAllByUserClubClubId(
        clubId: Long
    ): List<Client>

    fun findByClientIdAndUserClubClubId(
        clientId: Long,
        clubId: Long
    ): Client?
}