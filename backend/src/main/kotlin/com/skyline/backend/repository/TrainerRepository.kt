package com.skyline.backend.repository

import com.skyline.backend.entity.Trainer
import org.springframework.data.jpa.repository.JpaRepository

interface TrainerRepository : JpaRepository<Trainer, Long>{

    fun findAllByUserClubClubId(
        clubId: Long
    ): List<Trainer>

    fun findByUserUserId(
        userId: Long
    ): Trainer?

    fun findByTrainerIdAndUserClubClubId(
        trainerId: Long,
        clubId: Long
    ): Trainer?
}