package com.skyline.backend.service

import com.skyline.backend.dto.direction.UpdateDirectionStatusRequest
import com.skyline.backend.dto.direction.UpdateDirectionRequest
import com.skyline.backend.entity.Direction
import com.skyline.backend.entity.Club
import com.skyline.backend.dto.direction.DirectionResponse
import com.skyline.backend.dto.direction.CreateDirectionRequest
import com.skyline.backend.repository.DirectionRepository
import com.skyline.backend.exception.ConflictException
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import com.skyline.backend.repository.ServiceRepository
import com.skyline.backend.repository.GroupRepository
import com.skyline.backend.repository.SessionRepository

@Service
class DirectionService(
    private val directionRepository: DirectionRepository,
    private val serviceRepository: ServiceRepository,
    private val groupRepository: GroupRepository,
    private val sessionRepository: SessionRepository,
    private val currentUserService: CurrentUserService
) {


    // =========================================================
    // ОТРИМАННЯ НАПРЯМКІВ
    // =========================================================
    @Transactional(readOnly = true)
    fun getAll(jwt: Jwt): List<DirectionResponse> {
        val club = requireAdminClub(jwt)

        return directionRepository
            .findAllByClubClubIdOrderByTitleAsc(club.clubId)
            .map { it.toResponse() }
    }

    @Transactional(readOnly = true)
    fun getById(
        jwt: Jwt,
        directionId: Long
    ): DirectionResponse {
        val club = requireAdminClub(jwt)
        return findDirection(directionId, club.clubId).toResponse()
    }


    // =========================================================
    // СТВОРЕННЯ ТА РЕДАГУВАННЯ
    // =========================================================
    @Transactional
    fun createDirection(
        jwt: Jwt,
        request: CreateDirectionRequest
    ): DirectionResponse {
        val club = requireAdminClub(jwt)
        val title = request.title.trim()

        if (
            directionRepository.existsByClubClubIdAndTitleIgnoreCase(
                club.clubId,
                title
            )
        ) {
            throw ConflictException(
                "Напрямок з такою назвою вже існує"
            )
        }

        val direction = Direction(
            club = club,
            title = title,
            status = true
        )

        return directionRepository.save(direction).toResponse()
    }

    @Transactional
    fun updateDirection(
        jwt: Jwt,
        directionId: Long,
        request: UpdateDirectionRequest
    ): DirectionResponse {
        val club = requireAdminClub(jwt)
        val direction = findDirection(directionId, club.clubId)
        val title = request.title.trim()

        if (
            directionRepository
                .existsByClubClubIdAndTitleIgnoreCaseAndDirectionIdNot(
                    club.clubId,
                    title,
                    directionId
                )
        ) {
            throw ConflictException(
                "Напрямок з такою назвою вже існує"
            )
        }

        direction.title = title

        return directionRepository.save(direction).toResponse()
    }


    // =========================================================
    // АКТИВАЦІЯ ТА ДЕАКТИВАЦІЯ
    // =========================================================
    @Transactional
    fun updateDirectionStatus(
        directionId: Long,
        request: UpdateDirectionStatusRequest,
        jwt: Jwt
    ): DirectionResponse {
        val club = requireAdminClub(jwt)
        val direction = findDirection(directionId, club.clubId)

        direction.status = request.status

        return directionRepository.save(direction).toResponse()
    }

    // =========================================================
    // ВИДАЛЕННЯ
    // =========================================================
    /**
     * Зберігаємо історичні дані: напрямок не можна
     * фізично видалити, якщо він використовувався
     * у послугах, групах або заняттях.
     */
    @Transactional
    fun deleteDirection(
        jwt: Jwt,
        directionId: Long
    ) {
        val club = requireAdminClub(jwt)
        val direction = findDirection(directionId, club.clubId)

        if (
            serviceRepository.existsByDirectionDirectionId(directionId)
        ) {
            throw ConflictException(
                "Неможливо видалити напрямок, оскільки він " +
                        "використовується у послугах. " +
                        "Деактивуйте напрямок замість видалення"
            )
        }

        if (
            groupRepository.existsByDirectionDirectionId(directionId)
        ) {
            throw ConflictException(
                "Неможливо видалити напрямок, оскільки він " +
                        "використовується у групах. " +
                        "Деактивуйте напрямок замість видалення"
            )
        }

        if (
            sessionRepository.existsByDirectionDirectionId(directionId)
        ) {
            throw ConflictException(
                "Неможливо видалити напрямок, оскільки він " +
                        "використовується у заняттях. " +
                        "Деактивуйте напрямок замість видалення"
            )
        }

        directionRepository.delete(direction)
    }


    // Допоміжні методи

    private fun requireAdminClub(jwt: Jwt): Club {
        val user = currentUserService.requireAdmin(jwt)

        return user.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )
    }

    private fun findDirection(
        directionId: Long,
        clubId: Long
    ): Direction {
        return directionRepository
            .findByDirectionIdAndClubClubId(directionId, clubId)
            ?: throw NoSuchElementException(
                "Напрямок не знайдено"
            )
    }

    private fun Direction.toResponse() = DirectionResponse(
        directionId = requireNotNull(directionId),
        title = title,
        status = status,
        createdAt = createdAt
    )
}