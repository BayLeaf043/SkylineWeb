package com.skyline.backend.repository

import com.skyline.backend.entity.GroupClient
import org.springframework.data.jpa.repository.JpaRepository

interface GroupClientRepository : JpaRepository<GroupClient, Long> {

    fun findAllByGroupGroupIdAndStatusTrueOrderByClientUserLastNameAsc(
        groupId: Long
    ): List<GroupClient>

    fun findByGroupClientIdAndGroupClubClubId(
        groupClientId: Long,
        clubId: Long
    ): GroupClient?

    fun findByGroupGroupIdAndClientClientId(
        groupId: Long,
        clientId: Long
    ): GroupClient?

    fun existsByGroupGroupIdAndClientClientIdAndStatusTrue(
        groupId: Long,
        clientId: Long
    ): Boolean

    fun countByGroupGroupIdAndStatusTrue(
        groupId: Long
    ): Long

    fun deleteAllByClientClientId(
        clientId: Long
    )

    fun existsByClientClientId(
        clientId: Long
    ): Boolean

    fun existsByGroupGroupId(
        groupId: Long
    ): Boolean

    fun findAllByClientClientIdOrderByJoinedAtDesc(
        clientId: Long
    ): List<GroupClient>

    fun findAllByClientClientIdAndGroupClubClubIdOrderByJoinedAtDesc(
        clientId: Long,
        clubId: Long
    ): List<GroupClient>

}