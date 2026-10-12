package com.skyline.backend.service

import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import com.skyline.backend.entity.Club
import org.springframework.security.access.AccessDeniedException
import com.skyline.backend.repository.UserRepository
import com.skyline.backend.repository.TrainerRepository
import com.skyline.backend.dto.employee.CreateAdminRequest
import com.skyline.backend.dto.employee.EmployeeResponse
import com.skyline.backend.entity.User
import com.skyline.backend.entity.UserRole
import com.skyline.backend.dto.employee.CreateTrainerRequest
import com.skyline.backend.entity.Trainer
import com.skyline.backend.dto.employee.UpdateEmployeeRequest
import com.skyline.backend.dto.employee.UpdateEmployeeStatusRequest
import com.skyline.backend.repository.SessionRepository
import com.skyline.backend.repository.GroupRepository
import com.skyline.backend.exception.ConflictException

@Service
class EmployeeService(
    private val currentUserService: CurrentUserService,
    private val userRepository: UserRepository,
    private val trainerRepository: TrainerRepository,
    private val groupRepository: GroupRepository,
    private val sessionRepository: SessionRepository
) {

    // =========================================================
    // СТВОРЕННЯ ПРАЦІВНИКІВ
    // =========================================================
    @Transactional
    fun createAdmin(
        jwt: Jwt,
        request: CreateAdminRequest
    ): EmployeeResponse {
        val club = requireAdminClub(jwt)

        val user = User(
            authUserId = null,
            club = club,
            firstName = request.firstName.trim(),
            lastName = request.lastName.trim(),
            phone = request.phone.trim(),
            birthDate = request.birthDate,
            role = UserRole.ADMIN,
            status = true
        )

        return userRepository
            .save(user)
            .toEmployeeResponse()
    }

    @Transactional
    fun createTrainer(
        jwt: Jwt,
        request: CreateTrainerRequest
    ): EmployeeResponse {
        val club = requireAdminClub(jwt)

        val user = User(
            authUserId = null,
            club = club,
            firstName = request.firstName.trim(),
            lastName = request.lastName.trim(),
            phone = request.phone.trim(),
            birthDate = request.birthDate,
            role = UserRole.TRAINER,
            status = true
        )

        val savedUser = userRepository.save(user)

        val trainer = Trainer(
            user = savedUser,
            specialization = request.specialization.trim(),
            description = request.description.trim(),
            experienceYears = request.experienceYears
        )

        val savedTrainer = trainerRepository.save(trainer)

        return savedUser.toEmployeeResponse(savedTrainer)
    }

    // =========================================================
    // ОТРИМАННЯ ПРАЦІВНИКІВ
    // =========================================================
    @Transactional(readOnly = true)
    fun getEmployees(jwt: Jwt): List<EmployeeResponse> {
        val club = requireAdminClub(jwt)

        val users = userRepository
            .findAllByClubClubIdOrderByFirstNameAscLastNameAsc(
                club.clubId
            )
            .filter {
                it.role == UserRole.ADMIN ||
                        it.role == UserRole.TRAINER
            }

        val trainersByUserId = trainerRepository
            .findAllByUserClubClubId(club.clubId)
            .associateBy { it.user?.userId }

        return users.map { user ->
            user.toEmployeeResponse(
                trainersByUserId[user.userId]
            )
        }
    }

    @Transactional(readOnly = true)
    fun getEmployee(
        jwt: Jwt,
        userId: Long
    ): EmployeeResponse {
        val club = requireAdminClub(jwt)
        val user = findEmployee(userId, club.clubId)

        val trainer = if (user.role == UserRole.TRAINER) {
            findTrainer(user.userId)
        } else {
            null
        }

        return user.toEmployeeResponse(trainer)
    }

    // =========================================================
    // РЕДАГУВАННЯ
    // =========================================================
    @Transactional
    fun updateEmployee(
        jwt: Jwt,
        userId: Long,
        request: UpdateEmployeeRequest
    ): EmployeeResponse {
        val club = requireAdminClub(jwt)
        val user = findEmployee(userId, club.clubId)

        // Для TRAINER професійні поля обов'язкові.
        // Для ADMIN вони не використовуються.
        val trainerFields = if (user.role == UserRole.TRAINER) {
            validateTrainerFields(request)
        } else {
            null
        }

        user.firstName = request.firstName.trim()
        user.lastName = request.lastName.trim()
        user.phone = request.phone.trim()
        user.birthDate = request.birthDate

        val savedUser = userRepository.save(user)

        val trainer = if (trainerFields != null) {
            val existingTrainer = findTrainer(savedUser.userId)

            existingTrainer.specialization =
                trainerFields.specialization

            existingTrainer.description =
                trainerFields.description

            existingTrainer.experienceYears =
                trainerFields.experienceYears

            trainerRepository.save(existingTrainer)
        } else {
            null
        }

        return savedUser.toEmployeeResponse(trainer)
    }

    // =========================================================
    // АКТИВАЦІЯ ТА ДЕАКТИВАЦІЯ
    // =========================================================
    @Transactional
    fun updateEmployeeStatus(
        jwt: Jwt,
        userId: Long,
        request: UpdateEmployeeStatusRequest
    ): EmployeeResponse {
        val currentAdmin = currentUserService.requireAdmin(jwt)
        val clubId = requireClub(currentAdmin).clubId
        val user = findEmployee(userId, clubId)

        if (
            user.userId == currentAdmin.userId &&
            !request.status
        ) {
            throw IllegalArgumentException(
                "Неможливо деактивувати власний обліковий запис"
            )
        }

        user.status = request.status
        val savedUser = userRepository.save(user)

        val trainer = if (savedUser.role == UserRole.TRAINER) {
            findTrainer(savedUser.userId)
        } else {
            null
        }

        return savedUser.toEmployeeResponse(trainer)
    }

    // =========================================================
    // ВИДАЛЕННЯ
    // =========================================================
    @Transactional
    fun deleteEmployee(
        jwt: Jwt,
        userId: Long
    ) {
        val currentAdmin = currentUserService.requireAdmin(jwt)
        val clubId = requireClub(currentAdmin).clubId
        val user = findEmployee(userId, clubId)

        if (user.userId == currentAdmin.userId) {
            throw IllegalArgumentException(
                "Неможливо видалити власний обліковий запис"
            )
        }

        if (user.authUserId != null) {
            throw ConflictException(
                "Неможливо фізично видалити працівника " +
                        "з обліковим записом авторизації. " +
                        "Деактивуйте працівника замість видалення"
            )
        }

        if (user.role == UserRole.TRAINER) {
            val trainer = findTrainer(user.userId)
            val trainerId = trainer.trainerId

            if (groupRepository.existsByTrainerTrainerId(trainerId)) {
                throw ConflictException(
                    "Неможливо видалити тренера, оскільки " +
                            "він закріплений за групами. " +
                            "Деактивуйте працівника замість видалення"
                )
            }

            if (sessionRepository.existsByTrainerTrainerId(trainerId)) {
                throw ConflictException(
                    "Неможливо видалити тренера, оскільки " +
                            "він використовується у заняттях. " +
                            "Деактивуйте працівника замість видалення"
                )
            }

            trainerRepository.delete(trainer)
        }

        userRepository.delete(user)
    }

    // =========================================================
    // ДОСТУП ТА ПОШУК
    // =========================================================
    private fun requireAdminClub(jwt: Jwt): Club =
        requireClub(currentUserService.requireAdmin(jwt))

    private fun requireClub(user: User): Club =
        user.club ?: throw AccessDeniedException(
            "Користувач не прив'язаний до спортивного клубу"
        )

    private fun findEmployee(
        userId: Long,
        clubId: Long
    ): User {
        val user = userRepository
            .findByUserIdAndClubClubId(userId, clubId)
            ?: throw NoSuchElementException(
                "Працівника не знайдено"
            )

        if (
            user.role != UserRole.ADMIN &&
            user.role != UserRole.TRAINER
        ) {
            throw NoSuchElementException(
                "Працівника не знайдено"
            )
        }

        return user
    }

    private fun findTrainer(userId: Long): Trainer =
        trainerRepository.findByUserUserId(userId)
            ?: throw IllegalStateException(
                "Профіль тренера не знайдено"
            )

    // =========================================================
    // ВАЛІДАЦІЯ ДАНИХ ТРЕНЕРА
    // =========================================================
    private data class TrainerFields(
        val specialization: String,
        val description: String,
        val experienceYears: Int
    )

    private fun validateTrainerFields(
        request: UpdateEmployeeRequest
    ): TrainerFields {
        val specialization = request.specialization
            ?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException(
                "Спеціалізація тренера є обов'язковою"
            )

        val description = request.description
            ?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException(
                "Опис тренера є обов'язковим"
            )

        val experienceYears = request.experienceYears
            ?: throw IllegalArgumentException(
                "Досвід роботи тренера є обов'язковим"
            )

        if (specialization.length > 255) {
            throw IllegalArgumentException(
                "Спеціалізація не може містити більше 255 символів"
            )
        }

        if (description.length > 2000) {
            throw IllegalArgumentException(
                "Опис не може містити більше 2000 символів"
            )
        }

        if (experienceYears !in 0..80) {
            throw IllegalArgumentException(
                "Вкажіть коректний досвід роботи"
            )
        }

        return TrainerFields(
            specialization = specialization,
            description = description,
            experienceYears = experienceYears
        )
    }

    // =========================================================
    // ФОРМУВАННЯ ВІДПОВІДІ
    // =========================================================
    private fun User.toEmployeeResponse(
        trainer: Trainer? = null
    ): EmployeeResponse =
        EmployeeResponse(
            userId = userId,
            firstName = firstName,
            lastName = lastName,
            phone = phone,
            birthDate = birthDate,
            role = role.name,
            status = status,
            trainerId = trainer?.trainerId,
            specialization = trainer?.specialization,
            description = trainer?.description,
            experienceYears = trainer?.experienceYears
        )
}