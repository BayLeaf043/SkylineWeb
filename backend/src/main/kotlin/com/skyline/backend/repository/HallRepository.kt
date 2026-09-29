package com.skyline.backend.repository

import com.skyline.backend.entity.Hall
import org.springframework.data.jpa.repository.JpaRepository

interface HallRepository : JpaRepository<Hall, Long> {

    fun findAllByClubClubIdOrderByTitleAsc(
        clubId: Long
    ): List<Hall>

    fun findByHallIdAndClubClubId(
        hallId: Long,
        clubId: Long
    ): Hall?

    fun existsByClubClubIdAndTitleIgnoreCase(
        clubId: Long,
        title: String
    ): Boolean
}