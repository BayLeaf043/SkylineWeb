package com.skyline.backend.service

import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

import com.skyline.backend.repository.UserRepository
import com.skyline.backend.repository.ClubRepository
import com.skyline.backend.dto.profile.ProfileResponse
import com.skyline.backend.dto.profile.UpdateProfileRequest
import com.skyline.backend.dto.profile.ClubProfileResponse
import com.skyline.backend.dto.profile.UpdateClubProfileRequest
import com.skyline.backend.entity.User
import com.skyline.backend.entity.Club


@Service
class ProfileService(
    private val currentUserService: CurrentUserService,
    private val supabaseAuthService: SupabaseAuthService,
    private val userRepository: UserRepository,
    private val clubRepository: ClubRepository
) {

    /**
     * Повертає профіль поточного користувача.
     * Доступ: ADMIN / TRAINER.
     */
    @Transactional(readOnly = true)
    fun getProfile(jwt: Jwt): ProfileResponse {
        val user = currentUserService.getUser(jwt)
        return user.toProfileResponse()
    }


    /**
     * Оновлює особисті дані поточного користувача.
     * Доступ: ADMIN / TRAINER.
     */
    @Transactional
    fun updateProfile(
        jwt: Jwt,
        request: UpdateProfileRequest
    ): ProfileResponse {
        val user = currentUserService.getUser(jwt)

        user.apply {
            firstName = request.firstName.trim()
            lastName = request.lastName.trim()
            phone = request.phone.normalizeOptional()
            birthDate = request.birthDate
        }

        val savedUser = userRepository.save(user)
        return savedUser.toProfileResponse()
    }


    /**
     * Повертає інформацію лише про клуб
     * поточного користувача.
     * Доступ: ADMIN / TRAINER.
     */
    @Transactional(readOnly = true)
    fun getClub(jwt: Jwt): ClubProfileResponse {
        val user = currentUserService.getUser(jwt)
        val club = user.requireClub()

        return club.toClubProfileResponse()
    }


    /**
     * Оновлює дані спортивного комплексу.
     * Доступ: тільки ADMIN.
     */
    @Transactional
    fun updateClub(
        jwt: Jwt,
        request: UpdateClubProfileRequest
    ): ClubProfileResponse {
        val user = currentUserService.requireAdmin(jwt)
        val club = user.requireClub()

        club.apply {
            title = request.title.trim()
            city = request.city.normalizeOptional()
            address = request.address.normalizeOptional()
            phone = request.phone.normalizeOptional()
            email = request.email.normalizeOptional()
            description = request.description.normalizeOptional()
        }

        val savedClub = clubRepository.save(club)
        return savedClub.toClubProfileResponse()
    }


    /**
     * Формує DTO профілю та отримує email із Supabase.
     */
    private fun User.toProfileResponse(): ProfileResponse {
        val authUserId = authUserId
            ?: throw IllegalStateException(
                "Authentication account is not linked"
            )

        val authUser = supabaseAuthService.getUser(authUserId)

        return ProfileResponse(
            userId = userId,
            firstName = firstName,
            lastName = lastName,
            phone = phone,
            birthDate = birthDate,
            email = authUser.email ?: "",
            role = role.name
        )
    }

    /**
     * Формує DTO спортивного комплексу.
     */
    private fun Club.toClubProfileResponse() =
        ClubProfileResponse(
            clubId = clubId,
            title = title,
            city = city,
            address = address,
            phone = phone,
            email = email,
            description = description
        )

    /**
     * Повертає клуб користувача або повідомляє
     * про відсутність відповідного зв'язку.
     */
    private fun User.requireClub(): Club =
        club ?: throw IllegalStateException(
            "User is not assigned to a club"
        )

    /**
     * Видаляє зайві пробіли.
     * Порожні необов'язкові значення перетворює на null.
     */
    private fun String?.normalizeOptional(): String? =
        this?.trim()?.takeIf { it.isNotEmpty() }
}