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

    fun getUser(jwt: Jwt): User {

        val userId = UUID.fromString(jwt.subject)

        val user = userRepository.findById(userId)
            .orElseThrow {
                IllegalStateException("User profile not found")
            }

        if (!user.status) {
            throw AccessDeniedException(
                "User account is disabled"
            )
        }

        return user
    }

    fun requireAdmin(jwt: Jwt): User {

        val user = getUser(jwt)

        if (user.role != UserRole.ADMIN) {
            throw AccessDeniedException(
                "Admin access required"
            )
        }

        return user
    }

    fun requireTrainerOrAdmin(jwt: Jwt): User {

        val user = getUser(jwt)

        if (
            user.role != UserRole.ADMIN &&
            user.role != UserRole.TRAINER
        ) {
            throw AccessDeniedException(
                "Access denied"
            )
        }

        return user
    }
}