package com.skyline.backend.service

import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID
import java.nio.file.AccessDeniedException
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

@Service
class EmployeeService(
    private val currentUserService: CurrentUserService,
    private val userRepository: UserRepository,
    private val trainerRepository: TrainerRepository
) {

    @Transactional
    fun createAdmin(
        jwt: Jwt,
        request: CreateAdminRequest
    ): EmployeeResponse {

        val currentAdmin =
            currentUserService.requireAdmin(jwt)

        val club = currentAdmin.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val user = User(
            authUserId = null,
            club = club,
            firstName = request.firstName.trim(),
            lastName = request.lastName.trim(),
            phone = request.phone
                .trim()
                .takeIf { it.isNotEmpty() },
            birthDate = request.birthDate,
            role = UserRole.ADMIN,
            status = true
        )

        val savedUser =
            userRepository.save(user)

        return savedUser.toEmployeeResponse()
    }


    @Transactional
    fun createTrainer(
        jwt: Jwt,
        request: CreateTrainerRequest
    ): EmployeeResponse {

        val currentAdmin =
            currentUserService.requireAdmin(jwt)

        val club = currentAdmin.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val user = User(
            authUserId = null,
            club = club,
            firstName = request.firstName.trim(),
            lastName = request.lastName.trim(),
            phone = request.phone
                .trim()
                .takeIf { it.isNotEmpty() },
            birthDate = request.birthDate,
            role = UserRole.TRAINER,
            status = true
        )

        val savedUser =
            userRepository.save(user)

        val trainer = Trainer(
            user = savedUser,
            specialization = request.specialization
                .trim()
                .takeIf { it.isNotEmpty() },
            description = request.description
                .trim()
                .takeIf { it.isNotEmpty() },
            experienceYears = request.experienceYears
        )

        val savedTrainer =
            trainerRepository.save(trainer)

        return savedUser.toEmployeeResponse(
            savedTrainer
        )
    }


    @Transactional(readOnly = true)
    fun getEmployees(
        jwt: Jwt
    ): List<EmployeeResponse> {

        val currentAdmin =
            currentUserService.requireAdmin(jwt)

        val club = currentAdmin.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val users =
            userRepository
                .findAllByClubClubIdOrderByFirstNameAscLastNameAsc(
                    club.clubId
                )

        val trainers =
            trainerRepository
                .findAllByUserClubClubId(
                    club.clubId
                )

        val trainersByUserId =
            trainers.associateBy {
                it.user?.userId
            }

        return users
            .filter {
                it.role == UserRole.ADMIN ||
                        it.role == UserRole.TRAINER
            }
            .map { user ->

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

        val currentAdmin =
            currentUserService.requireAdmin(jwt)

        val user =
            getEmployeeForCurrentClub(
                currentAdmin,
                userId
            )

        val trainer =
            if (user.role == UserRole.TRAINER) {
                trainerRepository.findByUserUserId(
                    user.userId
                )
            } else {
                null
            }

        return user.toEmployeeResponse(trainer)
    }


    @Transactional
    fun updateEmployee(
        jwt: Jwt,
        userId: Long,
        request: UpdateEmployeeRequest
    ): EmployeeResponse {

        val currentAdmin =
            currentUserService.requireAdmin(jwt)

        val user =
            getEmployeeForCurrentClub(
                currentAdmin,
                userId
            )

        user.firstName =
            request.firstName.trim()

        user.lastName =
            request.lastName.trim()

        user.phone =
            request.phone
                .trim()
                .takeIf { it.isNotEmpty() }

        user.birthDate =
            request.birthDate

        val savedUser =
            userRepository.save(user)

        var trainer: Trainer? = null

        if (savedUser.role == UserRole.TRAINER) {

            trainer =
                trainerRepository.findByUserUserId(
                    savedUser.userId
                )
                    ?: throw IllegalStateException(
                        "Профіль тренера не знайдено"
                    )

            trainer.specialization =
                request.specialization
                    ?.trim()
                    ?.takeIf { it.isNotEmpty() }

            trainer.description =
                request.description
                    ?.trim()
                    ?.takeIf { it.isNotEmpty() }

            trainer.experienceYears =
                request.experienceYears

            trainer =
                trainerRepository.save(trainer)
        }

        return savedUser.toEmployeeResponse(trainer)
    }


    @Transactional
    fun updateEmployeeStatus(
        jwt: Jwt,
        userId: Long,
        request: UpdateEmployeeStatusRequest
    ): EmployeeResponse {

        val currentAdmin =
            currentUserService.requireAdmin(jwt)

        val user =
            getEmployeeForCurrentClub(
                currentAdmin,
                userId
            )

        if (
            user.userId == currentAdmin.userId &&
            !request.status
        ) {
            throw IllegalArgumentException(
                "Неможливо деактивувати власний обліковий запис"
            )
        }

        user.status =
            request.status

        val savedUser =
            userRepository.save(user)

        val trainer =
            if (savedUser.role == UserRole.TRAINER) {
                trainerRepository.findByUserUserId(
                    savedUser.userId
                )
            } else {
                null
            }

        return savedUser.toEmployeeResponse(trainer)
    }


    @Transactional
    fun deleteEmployee(
        jwt: Jwt,
        userId: Long
    ) {

        val currentAdmin =
            currentUserService.requireAdmin(jwt)

        val user =
            getEmployeeForCurrentClub(
                currentAdmin,
                userId
            )

        if (user.userId == currentAdmin.userId) {
            throw IllegalArgumentException(
                "Неможливо видалити власний обліковий запис"
            )
        }

        /*
         * TODO:
         * Перед фізичним видаленням перевірити,
         * чи працівник використовується в:
         *
         * - групах;
         * - заняттях;
         * - відвідуваннях;
         * - платежах;
         * - нарахуваннях тренеру;
         * - інших історичних даних.
         *
         * Якщо використовується:
         * throw ConflictException(...)
         *
         * У такому випадку працівника потрібно
         * деактивувати.
         */

        if (user.role == UserRole.TRAINER) {

            val trainer =
                trainerRepository.findByUserUserId(
                    user.userId
                )

            if (trainer != null) {
                trainerRepository.delete(trainer)
            }
        }

        userRepository.delete(user)
    }


    private fun getEmployeeForCurrentClub(
        currentAdmin: User,
        userId: Long
    ): User {

        val clubId =
            currentAdmin.club?.clubId
                ?: throw AccessDeniedException(
                    "Користувач не прив'язаний до спортивного клубу"
                )

        val user =
            userRepository.findById(userId)
                .orElseThrow {
                    NoSuchElementException(
                        "Працівника не знайдено"
                    )
                }

        if (
            user.club?.clubId != clubId ||
            (
                    user.role != UserRole.ADMIN &&
                            user.role != UserRole.TRAINER
                    )
        ) {
            throw NoSuchElementException(
                "Працівника не знайдено"
            )
        }

        return user
    }


    private fun User.toEmployeeResponse(
        trainer: Trainer? = null
    ): EmployeeResponse {

        return EmployeeResponse(
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
}