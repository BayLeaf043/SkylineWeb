package com.skyline.backend.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import com.skyline.backend.repository.GroupClientRepository
import com.skyline.backend.repository.GroupRepository
import com.skyline.backend.repository.ClientRepository
import com.skyline.backend.dto.groupClient.GroupClientResponse
import com.skyline.backend.dto.groupClient.AddGroupClientRequest
import com.skyline.backend.exception.ConflictException
import java.time.OffsetDateTime
import com.skyline.backend.entity.GroupClient
import com.skyline.backend.entity.Club


@Service
class GroupClientService(
    private val groupClientRepository: GroupClientRepository,
    private val groupRepository: GroupRepository,
    private val clientRepository: ClientRepository,
    private val currentUserService: CurrentUserService
) {

    @Transactional(readOnly = true)
    fun getAll(
        groupId: Long,
        jwt: Jwt
    ): List<GroupClientResponse> {
        val clubId = requireCurrentClub(jwt).clubId
        findGroup(groupId, clubId)

        return groupClientRepository
            .findAllByGroupGroupIdAndStatusTrueOrderByClientUserLastNameAsc(
                groupId
            )
            .map { it.toResponse() }
    }


    @Transactional
    fun addClient(
        groupId: Long,
        request: AddGroupClientRequest,
        jwt: Jwt
    ): GroupClientResponse {
        val clubId = requireCurrentClub(jwt).clubId
        val group = findGroup(groupId, clubId)

        if (!group.status) {
            throw ConflictException(
                "Неможливо додати клієнта до неактивної групи"
            )
        }

        val client = clientRepository
            .findByClientIdAndUserClubClubId(
                request.clientId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Клієнта не знайдено"
            )

        if (client.user?.status != true) {
            throw ConflictException(
                "Неможливо додати неактивного клієнта до групи"
            )
        }

        val existing = groupClientRepository
            .findByGroupGroupIdAndClientClientId(
                groupId,
                request.clientId
            )

        if (existing?.status == true) {
            throw ConflictException(
                "Клієнт уже входить до цієї групи"
            )
        }

        val activeCount = groupClientRepository
            .countByGroupGroupIdAndStatusTrue(groupId)

        if (activeCount >= group.capacity) {
            throw ConflictException(
                "У групі немає вільних місць"
            )
        }

        if (existing != null) {
            existing.status = true
            existing.joinedAt = OffsetDateTime.now()

            return groupClientRepository
                .save(existing)
                .toResponse()
        }

        val groupClient = GroupClient(
            group = group,
            client = client,
            joinedAt = OffsetDateTime.now(),
            status = true
        )

        return groupClientRepository
            .save(groupClient)
            .toResponse()
    }


    @Transactional
    fun removeClient(
        groupId: Long,
        clientId: Long,
        jwt: Jwt
    ) {
        val clubId = requireCurrentClub(jwt).clubId
        findGroup(groupId, clubId)

        clientRepository
            .findByClientIdAndUserClubClubId(clientId, clubId)
            ?: throw NoSuchElementException(
                "Клієнта не знайдено"
            )

        val groupClient = groupClientRepository
            .findByGroupGroupIdAndClientClientId(
                groupId,
                clientId
            )
            ?: throw NoSuchElementException(
                "Клієнт не входить до цієї групи"
            )

        if (!groupClient.status) {
            throw ConflictException(
                "Клієнт уже не входить до цієї групи"
            )
        }

        groupClient.status = false
        groupClientRepository.save(groupClient)
    }

    private fun requireCurrentClub(jwt: Jwt): Club {
        val user = currentUserService.requireTrainerOrAdmin(jwt)

        return user.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )
    }


    private fun findGroup(
        groupId: Long,
        clubId: Long
    ) = groupRepository.findByGroupIdAndClubClubId(
        groupId,
        clubId
    ) ?: throw NoSuchElementException(
        "Групу не знайдено"
    )

    private fun GroupClient.toResponse(): GroupClientResponse {
        val clientUser = client.user
            ?: throw IllegalStateException(
                "Обліковий запис клієнта відсутній"
            )

        return GroupClientResponse(
            groupClientId = requireNotNull(groupClientId),
            groupId = requireNotNull(group.groupId),
            clientId = client.clientId,
            clientFirstName = clientUser.firstName,
            clientLastName = clientUser.lastName,
            joinedAt = joinedAt,
            status = status
        )
    }
}