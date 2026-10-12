package com.skyline.backend.repository

import com.skyline.backend.entity.Group
import org.springframework.data.jpa.repository.JpaRepository

interface GroupRepository : JpaRepository<Group, Long> {

    fun findAllByClubClubIdOrderByTitleAsc(
        clubId: Long
    ): List<Group>

    fun findByGroupIdAndClubClubId(
        groupId: Long,
        clubId: Long
    ): Group?

    fun existsByClubClubIdAndTitleIgnoreCase(
        clubId: Long,
        title: String
    ): Boolean

    fun existsByClubClubIdAndTitleIgnoreCaseAndGroupIdNot(
        clubId: Long,
        title: String,
        groupId: Long
    ): Boolean

    fun existsByDirectionDirectionId(
        directionId: Long
    ): Boolean

    fun existsByTrainerTrainerId(
        trainerId: Long
    ): Boolean

    fun findAllByClubClubIdAndTrainerTrainerIdOrderByTitleAsc(
        clubId: Long,
        trainerId: Long
    ): List<Group>
}