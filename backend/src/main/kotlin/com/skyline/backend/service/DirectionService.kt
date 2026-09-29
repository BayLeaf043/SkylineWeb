package com.skyline.backend.service

import com.skyline.backend.dto.direction.UpdateDirectionStatusRequest
import com.skyline.backend.dto.direction.UpdateDirectionRequest
import com.skyline.backend.entity.Direction
import com.skyline.backend.dto.direction.DirectionResponse
import com.skyline.backend.dto.direction.CreateDirectionRequest
import com.skyline.backend.repository.DirectionRepository
import com.skyline.backend.exception.ConflictException
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DirectionService(
    private val directionRepository: DirectionRepository,
    private val currentUserService: CurrentUserService
) {

    @Transactional
    fun createDirection(
        jwt: Jwt,
        request: CreateDirectionRequest
    ): DirectionResponse {

        val user = currentUserService.requireAdmin(jwt)

        val club = user.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

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

        val savedDirection = directionRepository.save(direction)

        return savedDirection.toResponse()
    }


    @Transactional(readOnly = true)
    fun getAll(jwt: Jwt): List<DirectionResponse> {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        return directionRepository
            .findAllByClubClubIdOrderByTitleAsc(clubId)
            .map { it.toResponse() }
    }


    @Transactional(readOnly = true)
    fun getById(
        jwt: Jwt,
        directionId: Long
    ): DirectionResponse {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val direction = directionRepository
            .findByDirectionIdAndClubClubId(directionId, clubId)
            ?: throw NoSuchElementException(
                "Напрямок не знайдено"
            )

        return direction.toResponse()
    }


    @Transactional
    fun updateDirection(
        jwt: Jwt,
        directionId: Long,
        request: UpdateDirectionRequest
    ): DirectionResponse {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val direction = directionRepository
            .findByDirectionIdAndClubClubId(directionId, clubId)
            ?: throw NoSuchElementException(
                "Напрямок не знайдено"
            )

        val title = request.title.trim()

        if (
            directionRepository
                .existsByClubClubIdAndTitleIgnoreCaseAndDirectionIdNot(
                    clubId,
                    title,
                    directionId
                )
        ) {
            throw ConflictException(
                "Напрямок з такою назвою вже існує"
            )
        }

        direction.title = title

        val savedDirection = directionRepository.save(direction)

        return savedDirection.toResponse()
    }


    @Transactional
    fun updateDirectionStatus(
        directionId: Long,
        request: UpdateDirectionStatusRequest,
        jwt: Jwt
    ): DirectionResponse {

        val currentAdmin =
            currentUserService.requireAdmin(jwt)

        val clubId = currentAdmin.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val direction = directionRepository
            .findByDirectionIdAndClubClubId(
                directionId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Напрямок не знайдено"
            )

        direction.status = request.status

        return directionRepository
            .save(direction)
            .toResponse()
    }


    @Transactional
    fun deleteDirection(
        jwt: Jwt,
        directionId: Long
    ) {

        val user = currentUserService.requireAdmin(jwt)

        val club = user.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val direction = directionRepository
            .findByDirectionIdAndClubClubId(
                directionId,
                club.clubId
            )
            ?: throw NoSuchElementException(
                "Напрямок не знайдено"
            )

        /*
         * TODO:
         * Before deleting the category, check whether
         * it is used by any services.
         *
         * If the category is used:
         * - physical deletion must be prohibited;
         * - administrator should set status = false instead.
         */

        directionRepository.delete(direction)
    }


    private fun Direction.toResponse(): DirectionResponse {
        return DirectionResponse(
            directionId = requireNotNull(directionId),
            title = title,
            status = status,
            createdAt = createdAt
        )
    }
}