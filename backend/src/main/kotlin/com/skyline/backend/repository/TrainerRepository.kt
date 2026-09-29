package com.skyline.backend.repository

import com.skyline.backend.entity.Trainer
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface TrainerRepository : JpaRepository<Trainer, Long>{

    fun findAllByUserClubClubId(
        clubId: Long
    ): List<Trainer>

    fun findByUserUserId(
        userId: Long
    ): Trainer?
}