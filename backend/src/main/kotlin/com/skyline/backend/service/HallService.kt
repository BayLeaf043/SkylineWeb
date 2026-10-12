package com.skyline.backend.service

import com.skyline.backend.dto.hall.CreateHallRequest
import com.skyline.backend.dto.hall.HallResponse
import com.skyline.backend.dto.hall.UpdateHallRequest
import com.skyline.backend.dto.hall.UpdateHallStatusRequest
import com.skyline.backend.entity.Club
import com.skyline.backend.entity.Hall
import com.skyline.backend.exception.ConflictException
import com.skyline.backend.repository.HallRepository
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import com.skyline.backend.repository.SessionRepository

@Service
class HallService(
    private val hallRepository: HallRepository,
    private val sessionRepository: SessionRepository,
    private val currentUserService: CurrentUserService
) {

    // =========================================================
    // ОТРИМАННЯ ЗАЛІВ
    // =========================================================
    @Transactional(readOnly = true)
    fun getAll(jwt: Jwt): List<HallResponse> {
        val club = requireAdminClub(jwt)

        return hallRepository
            .findAllByClubClubIdOrderByTitleAsc(club.clubId)
            .map { it.toResponse() }
    }

    @Transactional(readOnly = true)
    fun getById(
        hallId: Long,
        jwt: Jwt
    ): HallResponse {
        val club = requireAdminClub(jwt)
        return findHall(hallId, club.clubId).toResponse()
    }

    // =========================================================
    // СТВОРЕННЯ ТА РЕДАГУВАННЯ
    // =========================================================
    @Transactional
    fun createHall(
        request: CreateHallRequest,
        jwt: Jwt
    ): HallResponse {
        val club = requireAdminClub(jwt)
        val title = request.title.trim()

        if (
            hallRepository.existsByClubClubIdAndTitleIgnoreCase(
                club.clubId,
                title
            )
        ) {
            throw ConflictException(
                "Зал з такою назвою вже існує"
            )
        }

        val hall = Hall(
            club = club,
            title = title,
            description = request.description.normalizeOptional(),
            capacity = request.capacity,
            status = true
        )

        return hallRepository.save(hall).toResponse()
    }

    @Transactional
    fun updateHall(
        hallId: Long,
        request: UpdateHallRequest,
        jwt: Jwt
    ): HallResponse {
        val club = requireAdminClub(jwt)
        val hall = findHall(hallId, club.clubId)
        val title = request.title.trim()

        if (
            hallRepository
                .existsByClubClubIdAndTitleIgnoreCaseAndHallIdNot(
                    club.clubId,
                    title,
                    hallId
                )
        ) {
            throw ConflictException(
                "Зал з такою назвою вже існує"
            )
        }

        hall.title = title
        hall.description = request.description.normalizeOptional()
        hall.capacity = request.capacity

        return hallRepository.save(hall).toResponse()
    }



    // =========================================================
    // АКТИВАЦІЯ ТА ДЕАКТИВАЦІЯ
    // =========================================================
    @Transactional
    fun updateHallStatus(
        hallId: Long,
        request: UpdateHallStatusRequest,
        jwt: Jwt
    ): HallResponse {
        val club = requireAdminClub(jwt)
        val hall = findHall(hallId, club.clubId)

        hall.status = request.status

        return hallRepository.save(hall).toResponse()
    }

    // =========================================================
    // ВИДАЛЕННЯ
    // =========================================================

    /**
     * Фізичне видалення дозволене лише для залу,
     * який ніколи не використовувався в заняттях.
     * Історичні дані повинні зберігатися.
     */
    @Transactional
    fun deleteHall(
        hallId: Long,
        jwt: Jwt
    ) {
        val club = requireAdminClub(jwt)
        val hall = findHall(hallId, club.clubId)

        if (sessionRepository.existsByHallHallId(hallId)) {
            throw ConflictException(
                "Неможливо видалити зал, оскільки він " +
                        "використовується у заняттях. " +
                        "Деактивуйте зал замість видалення"
            )
        }

        hallRepository.delete(hall)
    }


    // =========================================================
    // ПЕРЕВІРКИ ДОСТУПУ ТА ПОШУК
    // =========================================================

    /**
     * Перевіряє роль ADMIN і повертає лише його клуб.
     * TRAINER не має доступу до цього модуля.
     */
    private fun requireAdminClub(jwt: Jwt): Club {
        val user = currentUserService.requireAdmin(jwt)

        return user.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )
    }

    /**
     * Шукає зал виключно в межах клубу адміністратора.
     * Чужий або неіснуючий зал повертає 404.
     */
    private fun findHall(
        hallId: Long,
        clubId: Long
    ): Hall {
        return hallRepository
            .findByHallIdAndClubClubId(hallId, clubId)
            ?: throw NoSuchElementException(
                "Зал не знайдено"
            )
    }

    // =========================================================
    // ДОПОМІЖНІ МЕТОДИ
    // =========================================================

    private fun String?.normalizeOptional(): String? =
        this?.trim()?.takeIf { it.isNotEmpty() }

    private fun Hall.toResponse() = HallResponse(
        hallId = requireNotNull(hallId),
        title = title,
        description = description,
        capacity = capacity,
        status = status,
        createdAt = createdAt
    )
}