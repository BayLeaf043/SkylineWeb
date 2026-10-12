package com.skyline.backend.service

import com.skyline.backend.entity.User
import com.skyline.backend.entity.UserRole
import com.skyline.backend.repository.UserRepository
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.security.access.AccessDeniedException
import java.util.UUID

@Service
class CurrentUserService(
    private val userRepository: UserRepository
) {

    /**
     * Отримує поточного користувача за перевіреним JWT.
     * Перевіряє активність користувача та його клубу.
     */
    fun getUser(jwt: Jwt): User {
        val authUserId = try {
            UUID.fromString(jwt.subject)
        } catch (ex: IllegalArgumentException) {
            throw AccessDeniedException("Invalid authentication user ID")
        }

        val user = userRepository.findByAuthUserId(authUserId)
            ?: throw AccessDeniedException("User profile not found")

        if (!user.status) {
            throw AccessDeniedException("User account is disabled")
        }

        val club = user.club
            ?: throw AccessDeniedException("User is not assigned to a club")

        if (!club.status) {
            throw AccessDeniedException("Club is disabled")
        }

        return user
    }


    /**
     * Дозволяє доступ лише адміністратору клубу.
     */
    fun requireAdmin(jwt: Jwt): User {
        val user = getUser(jwt)

        if (user.role != UserRole.ADMIN) {
            throw AccessDeniedException("Admin access required")
        }

        return user
    }

    /**
     * Дозволяє доступ адміністратору або тренеру.
     */
    fun requireTrainerOrAdmin(jwt: Jwt): User {
        val user = getUser(jwt)

        if (
            user.role != UserRole.ADMIN &&
            user.role != UserRole.TRAINER
        ) {
            throw AccessDeniedException("Access denied")
        }

        return user
    }
}