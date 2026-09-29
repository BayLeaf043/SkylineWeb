package com.skyline.backend.repository

import com.skyline.backend.entity.Direction
import org.springframework.data.jpa.repository.JpaRepository

interface DirectionRepository : JpaRepository<Direction, Long> {

    fun findAllByClubClubIdOrderByTitleAsc(
        clubId: Long
    ): List<Direction>

    fun findByDirectionIdAndClubClubId(
        directionId: Long,
        clubId: Long
    ): Direction?

    fun existsByClubClubIdAndTitleIgnoreCase(
        clubId: Long,
        title: String
    ): Boolean

    fun existsByClubClubIdAndTitleIgnoreCaseAndDirectionIdNot(
        clubId: Long,
        title: String,
        directionId: Long
    ): Boolean
}