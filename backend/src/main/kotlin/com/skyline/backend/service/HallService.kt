package com.skyline.backend.service

import com.skyline.backend.dto.hall.CreateHallRequest
import com.skyline.backend.dto.hall.HallResponse
import com.skyline.backend.dto.hall.UpdateHallRequest
import com.skyline.backend.dto.hall.UpdateHallStatusRequest
import com.skyline.backend.entity.Hall
import com.skyline.backend.exception.ConflictException
import com.skyline.backend.repository.HallRepository
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class HallService(
    private val hallRepository: HallRepository,
    private val currentUserService: CurrentUserService
) {

    @Transactional(readOnly = true)
    fun getAll(jwt: Jwt): List<HallResponse> {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        return hallRepository
            .findAllByClubClubIdOrderByTitleAsc(clubId)
            .map { it.toResponse() }
    }

    @Transactional(readOnly = true)
    fun getById(
        hallId: Long,
        jwt: Jwt
    ): HallResponse {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val hall = hallRepository
            .findByHallIdAndClubClubId(hallId, clubId)
            ?: throw NoSuchElementException(
                "Зал не знайдено"
            )

        return hall.toResponse()
    }

    @Transactional
    fun createHall(
        request: CreateHallRequest,
        jwt: Jwt
    ): HallResponse {

        val user = currentUserService.requireAdmin(jwt)

        val club = user.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

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
            description = request.description
                ?.trim()
                ?.takeIf { it.isNotEmpty() },
            capacity = request.capacity,
            status = true
        )

        return hallRepository
            .save(hall)
            .toResponse()
    }

    @Transactional
    fun updateHall(
        hallId: Long,
        request: UpdateHallRequest,
        jwt: Jwt
    ): HallResponse {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val hall = hallRepository
            .findByHallIdAndClubClubId(hallId, clubId)
            ?: throw NoSuchElementException(
                "Зал не знайдено"
            )

        val title = request.title.trim()

        val titleAlreadyExists =
            hallRepository.existsByClubClubIdAndTitleIgnoreCase(
                clubId,
                title
            )

        if (
            titleAlreadyExists &&
            !hall.title.equals(title, ignoreCase = true)
        ) {
            throw ConflictException(
                "Зал з такою назвою вже існує"
            )
        }

        hall.title = title
        hall.description = request.description
            ?.trim()
            ?.takeIf { it.isNotEmpty() }

        hall.capacity = request.capacity

        return hallRepository
            .save(hall)
            .toResponse()
    }



    @Transactional
    fun updateHallStatus(
        hallId: Long,
        request: UpdateHallStatusRequest,
        jwt: Jwt
    ): HallResponse {

        val currentAdmin =
            currentUserService.requireAdmin(jwt)

        val clubId = currentAdmin.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val hall = hallRepository
            .findByHallIdAndClubClubId(
                hallId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Зал не знайдено"
            )

        hall.status = request.status

        return hallRepository
            .save(hall)
            .toResponse()
    }


    @Transactional
    fun deleteHall(
        hallId: Long,
        jwt: Jwt
    ) {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val hall = hallRepository
            .findByHallIdAndClubClubId(hallId, clubId)
            ?: throw NoSuchElementException(
                "Зал не знайдено"
            )

        /*
         * TODO:
         * Перед фізичним видаленням перевірити,
         * чи використовується зал у подіях / заняттях / розкладі.
         *
         * Якщо зал використовується:
         *
         * throw ConflictException(
         *     "Неможливо видалити зал, оскільки він використовується"
         * )
         *
         * У такому випадку адміністратор зможе
         * змінити status залу на false.
         */

        hallRepository.delete(hall)
    }

    private fun Hall.toResponse(): HallResponse {
        return HallResponse(
            hallId = requireNotNull(hallId),
            title = title,
            description = description,
            capacity = capacity,
            status = status,
            createdAt = createdAt
        )
    }
}