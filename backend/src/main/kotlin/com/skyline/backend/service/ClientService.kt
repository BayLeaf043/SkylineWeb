package com.skyline.backend.service

import com.skyline.backend.dto.client.ClientResponse
import com.skyline.backend.dto.client.CreateClientRequest
import com.skyline.backend.dto.client.UpdateClientRequest
import com.skyline.backend.dto.client.UpdateClientStatusRequest
import com.skyline.backend.entity.Client
import com.skyline.backend.entity.User
import com.skyline.backend.entity.UserRole
import com.skyline.backend.repository.ClientRepository
import com.skyline.backend.repository.UserRepository
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ClientService(
    private val clientRepository: ClientRepository,
    private val userRepository: UserRepository,
    private val currentUserService: CurrentUserService
) {

    @Transactional
    fun createClient(
        jwt: Jwt,
        request: CreateClientRequest
    ): ClientResponse {
        val currentAdmin = currentUserService.requireAdmin(jwt)

        val currentClub = currentAdmin.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val user = User(
            authUserId = null,
            club = currentClub,
            firstName = request.firstName.trim(),
            lastName = request.lastName.trim(),
            phone = request.phone.trim(),
            birthDate = request.birthDate,
            role = UserRole.CLIENT,
            status = true
        )

        val savedUser = userRepository.save(user)

        val client = Client(
            user = savedUser,
            lastVisit = null,
            countOfVisits = 0
        )

        val savedClient = clientRepository.save(client)

        return savedClient.toResponse()
    }

    @Transactional(readOnly = true)
    fun getAllClients(jwt: Jwt): List<ClientResponse> {
        val currentAdmin = currentUserService.requireAdmin(jwt)

        val clubId = currentAdmin.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        return clientRepository
            .findAllByUserClubClubId(clubId)
            .map { it.toResponse() }
    }

    @Transactional(readOnly = true)
    fun getClient(
        jwt: Jwt,
        clientId: Long
    ): ClientResponse {
        val currentAdmin = currentUserService.requireAdmin(jwt)

        val client = getClientForCurrentClub(
            currentAdmin,
            clientId
        )

        return client.toResponse()
    }

    @Transactional
    fun updateClient(
        jwt: Jwt,
        clientId: Long,
        request: UpdateClientRequest
    ): ClientResponse {
        val currentAdmin = currentUserService.requireAdmin(jwt)

        val client = getClientForCurrentClub(
            currentAdmin,
            clientId
        )

        val user = client.user
            ?: throw IllegalStateException(
                "Профіль користувача клієнта відсутній"
            )

        user.firstName = request.firstName.trim()
        user.lastName = request.lastName.trim()
        user.phone = request.phone.trim()
        user.birthDate = request.birthDate

        userRepository.save(user)

        return client.toResponse()
    }

    @Transactional
    fun updateClientStatus(
        jwt: Jwt,
        clientId: Long,
        request: UpdateClientStatusRequest
    ): ClientResponse {
        val currentAdmin = currentUserService.requireAdmin(jwt)

        val client = getClientForCurrentClub(
            currentAdmin,
            clientId
        )

        val user = client.user
            ?: throw IllegalStateException(
                "Профіль користувача клієнта відсутній"
            )

        user.status = request.status
        userRepository.save(user)

        return client.toResponse()
    }

    @Transactional
    fun deleteClient(
        jwt: Jwt,
        clientId: Long
    ) {
        val currentAdmin = currentUserService.requireAdmin(jwt)

        val client = getClientForCurrentClub(
            currentAdmin,
            clientId
        )

        val user = client.user
            ?: throw IllegalStateException(
                "Профіль користувача клієнта відсутній"
            )

        // TODO:
        // Перед видаленням клієнта перевірити пов'язані сутності:
        // абонементи, бронювання, платежі, відвідування тощо.
        // Якщо існують важливі пов'язані дані —
        // заборонити фізичне видалення через ConflictException.

        clientRepository.delete(client)
        userRepository.delete(user)
    }

    private fun getClientForCurrentClub(
        currentAdmin: User,
        clientId: Long
    ): Client {
        val clubId = currentAdmin.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val client = clientRepository.findById(clientId)
            .orElseThrow {
                NoSuchElementException("Клієнта не знайдено")
            }

        if (client.user?.club?.clubId != clubId) {
            throw NoSuchElementException("Клієнта не знайдено")
        }

        return client
    }

    private fun Client.toResponse(): ClientResponse {
        val user = user
            ?: throw IllegalStateException(
                "Профіль користувача клієнта відсутній"
            )

        return ClientResponse(
            clientId = clientId,
            userId = user.userId,
            firstName = user.firstName,
            lastName = user.lastName,
            phone = user.phone,
            birthDate = user.birthDate,
            status = user.status,
            lastVisit = lastVisit,
            countOfVisits = countOfVisits,
            createdAt = createdAt
        )
    }
}