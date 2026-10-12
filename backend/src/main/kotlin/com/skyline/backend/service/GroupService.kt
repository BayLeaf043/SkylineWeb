package com.skyline.backend.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import com.skyline.backend.repository.GroupRepository
import com.skyline.backend.repository.GroupClientRepository
import com.skyline.backend.repository.DirectionRepository
import com.skyline.backend.repository.TrainerRepository
import com.skyline.backend.dto.group.*
import com.skyline.backend.entity.*
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import com.skyline.backend.exception.ConflictException
import com.skyline.backend.repository.SessionRepository

@Service
class GroupService(
    private val groupRepository: GroupRepository,
    private val groupClientRepository: GroupClientRepository,
    private val directionRepository: DirectionRepository,
    private val trainerRepository: TrainerRepository,
    private val sessionRepository: SessionRepository,
    private val currentUserService: CurrentUserService
) {

    // =========================================================
    // ОТРИМАННЯ ГРУП
    // =========================================================
    @Transactional(readOnly = true)
    fun getAll(jwt: Jwt): List<GroupResponse> {
        val clubId = requireCurrentClub(jwt).clubId

        return groupRepository
            .findAllByClubClubIdOrderByTitleAsc(clubId)
            .map { it.toResponse() }
    }

    /**
     * Особисті групи поточного тренера.
     * trainerId не передається клієнтом.
     */
    @Transactional(readOnly = true)
    fun getMyGroups(jwt: Jwt): List<GroupResponse> {
        val user = currentUserService.requireTrainerOrAdmin(jwt)

        if (user.role != UserRole.TRAINER) {
            throw AccessDeniedException(
                "Особисті групи доступні лише тренеру"
            )
        }

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до клубу"
            )

        val trainer = trainerRepository.findByUserUserId(user.userId)
            ?: throw NoSuchElementException(
                "Профіль тренера не знайдено"
            )

        return groupRepository
            .findAllByClubClubIdAndTrainerTrainerIdOrderByTitleAsc(
                clubId,
                trainer.trainerId
            )
            .map { it.toResponse() }
    }

    @Transactional(readOnly = true)
    fun getById(
        groupId: Long,
        jwt: Jwt
    ): GroupResponse {
        val clubId = requireCurrentClub(jwt).clubId
        return findGroup(groupId, clubId).toResponse()
    }

    // =========================================================
    // СТВОРЕННЯ
    // =========================================================
    @Transactional
    fun createGroup(
        request: CreateGroupRequest,
        jwt: Jwt
    ): GroupResponse {
        val club = requireCurrentClub(jwt)
        val title = request.title.trim()

        if (
            groupRepository.existsByClubClubIdAndTitleIgnoreCase(
                club.clubId,
                title
            )
        ) {
            throw ConflictException(
                "Група з такою назвою вже існує"
            )
        }

        val direction = findDirection(
            request.directionId,
            club.clubId
        )

        if (!direction.status) {
            throw ConflictException(
                "Неможливо створити групу в неактивному напрямку"
            )
        }

        val trainer = findTrainer(
            request.trainerId,
            club.clubId
        )

        if (trainer.user?.status != true) {
            throw ConflictException(
                "Неможливо призначити неактивного тренера"
            )
        }

        val group = Group(
            club = club,
            direction = direction,
            trainer = trainer,
            title = title,
            capacity = request.capacity,
            description = request.description.normalizeOptional(),
            status = true
        )

        return groupRepository.save(group).toResponse()
    }

    // =========================================================
    // РЕДАГУВАННЯ
    // =========================================================
    @Transactional
    fun updateGroup(
        groupId: Long,
        request: UpdateGroupRequest,
        jwt: Jwt
    ): GroupResponse {
        val clubId = requireCurrentClub(jwt).clubId
        val group = findGroup(groupId, clubId)
        val title = request.title.trim()

        if (
            groupRepository
                .existsByClubClubIdAndTitleIgnoreCaseAndGroupIdNot(
                    clubId,
                    title,
                    groupId
                )
        ) {
            throw ConflictException(
                "Група з такою назвою вже існує"
            )
        }

        val direction = findDirection(
            request.directionId,
            clubId
        )

        if (
            !direction.status &&
            group.direction.directionId != direction.directionId
        ) {
            throw ConflictException(
                "Неможливо перемістити групу в неактивний напрямок"
            )
        }

        val trainer = findTrainer(
            request.trainerId,
            clubId
        )

        if (
            trainer.user?.status != true &&
            group.trainer.trainerId != trainer.trainerId
        ) {
            throw ConflictException(
                "Неможливо призначити неактивного тренера"
            )
        }

        val activeClientsCount =
            groupClientRepository.countByGroupGroupIdAndStatusTrue(
                groupId
            )

        if (request.capacity < activeClientsCount) {
            throw ConflictException(
                "Місткість групи не може бути меншою за кількість " +
                        "активних учасників ($activeClientsCount)"
            )
        }

        group.direction = direction
        group.trainer = trainer
        group.title = title
        group.capacity = request.capacity
        group.description = request.description.normalizeOptional()

        return groupRepository.save(group).toResponse()
    }

    // =========================================================
    // АКТИВАЦІЯ ТА ДЕАКТИВАЦІЯ
    // =========================================================
    @Transactional
    fun updateGroupStatus(
        groupId: Long,
        request: UpdateGroupStatusRequest,
        jwt: Jwt
    ): GroupResponse {
        val clubId = requireCurrentClub(jwt).clubId
        val group = findGroup(groupId, clubId)

        if (request.status) {
            if (!group.direction.status) {
                throw ConflictException(
                    "Неможливо активувати групу в неактивному напрямку"
                )
            }

            if (group.trainer.user?.status != true) {
                throw ConflictException(
                    "Неможливо активувати групу з неактивним тренером"
                )
            }
        }

        group.status = request.status

        return groupRepository.save(group).toResponse()
    }

    // =========================================================
    // ВИДАЛЕННЯ
    // =========================================================
    @Transactional
    fun deleteGroup(
        groupId: Long,
        jwt: Jwt
    ) {
        val clubId = requireCurrentClub(jwt).clubId
        val group = findGroup(groupId, clubId)

        if (groupClientRepository.existsByGroupGroupId(groupId)) {
            throw ConflictException(
                "Неможливо видалити групу з історією учасників. " +
                        "Деактивуйте групу замість видалення"
            )
        }

        if (sessionRepository.existsByGroupGroupId(groupId)) {
            throw ConflictException(
                "Неможливо видалити групу, для якої створювалися заняття. " +
                        "Деактивуйте групу замість видалення"
            )
        }

        groupRepository.delete(group)
    }

    // =========================================================
    // ДОСТУП І ПОШУК
    // =========================================================
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
    ): Group =
        groupRepository.findByGroupIdAndClubClubId(
            groupId,
            clubId
        ) ?: throw NoSuchElementException(
            "Групу не знайдено"
        )

    private fun findDirection(
        directionId: Long,
        clubId: Long
    ): Direction =
        directionRepository.findByDirectionIdAndClubClubId(
            directionId,
            clubId
        ) ?: throw NoSuchElementException(
            "Напрямок не знайдено"
        )

    private fun findTrainer(
        trainerId: Long,
        clubId: Long
    ): Trainer =
        trainerRepository.findByTrainerIdAndUserClubClubId(
            trainerId,
            clubId
        ) ?: throw NoSuchElementException(
            "Тренера не знайдено"
        )

    private fun String?.normalizeOptional(): String? =
        this?.trim()?.takeIf { it.isNotEmpty() }

    // =========================================================
    // DTO
    // =========================================================
    private fun Group.toResponse(): GroupResponse {
        val trainerUser = trainer.user
            ?: throw IllegalStateException(
                "Обліковий запис тренера відсутній"
            )

        val id = requireNotNull(groupId)

        return GroupResponse(
            groupId = id,
            directionId = requireNotNull(direction.directionId),
            directionTitle = direction.title,
            trainerId = trainer.trainerId,
            trainerFirstName = trainerUser.firstName,
            trainerLastName = trainerUser.lastName,
            activeClientsCount =
                groupClientRepository.countByGroupGroupIdAndStatusTrue(id),
            title = title,
            capacity = capacity,
            description = description,
            status = status,
            createdAt = createdAt
        )
    }
}