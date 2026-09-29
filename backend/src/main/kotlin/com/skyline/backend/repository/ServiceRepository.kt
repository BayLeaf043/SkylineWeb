package com.skyline.backend.repository

import com.skyline.backend.entity.Service
import org.springframework.data.jpa.repository.JpaRepository

interface ServiceRepository : JpaRepository<Service, Long> {

    fun findAllByClubClubIdOrderByTitleAsc(
        clubId: Long
    ): List<Service>

    fun findByServiceIdAndClubClubId(
        serviceId: Long,
        clubId: Long
    ): Service?

    fun existsByClubClubIdAndTitleIgnoreCase(
        clubId: Long,
        title: String
    ): Boolean

    fun existsByClubClubIdAndTitleIgnoreCaseAndServiceIdNot(
        clubId: Long,
        title: String,
        serviceId: Long
    ): Boolean

}