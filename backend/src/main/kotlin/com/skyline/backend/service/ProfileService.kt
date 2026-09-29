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


@Service
class ProfileService(
    private val currentUserService: CurrentUserService,
    private val supabaseAuthService: SupabaseAuthService,
    private val userRepository: UserRepository,
    private val clubRepository: ClubRepository
) {

    fun getProfile(jwt: Jwt): ProfileResponse {

        val user =
            currentUserService.getUser(jwt)

        val authUserId =
            user.authUserId
                ?: throw IllegalStateException(
                    "Authentication account is not linked"
                )

        val authUser =
            supabaseAuthService.getUser(authUserId)

        return ProfileResponse(
            userId = user.userId,
            firstName = user.firstName,
            lastName = user.lastName,
            phone = user.phone,
            birthDate = user.birthDate,
            email = authUser.email ?: "",
            role = user.role.name
        )
    }


    @Transactional
    fun updateProfile(
        jwt: Jwt,
        request: UpdateProfileRequest
    ): ProfileResponse {

        val user =
            currentUserService.getUser(jwt)

        user.firstName =
            request.firstName.trim()

        user.lastName =
            request.lastName.trim()

        user.phone =
            request.phone
                ?.trim()
                ?.takeIf { it.isNotEmpty() }

        user.birthDate =
            request.birthDate

        val savedUser =
            userRepository.save(user)

        val authUserId =
            savedUser.authUserId
                ?: throw IllegalStateException(
                    "Authentication account is not linked"
                )

        val authUser =
            supabaseAuthService.getUser(authUserId)

        return ProfileResponse(
            userId = savedUser.userId,
            firstName = savedUser.firstName,
            lastName = savedUser.lastName,
            phone = savedUser.phone,
            birthDate = savedUser.birthDate,
            email = authUser.email ?: "",
            role = savedUser.role.name
        )
    }


    fun getClub(jwt: Jwt): ClubProfileResponse {

        val user =
            currentUserService.getUser(jwt)

        val club = user.club
            ?: throw IllegalStateException(
                "User is not assigned to a club"
            )

        return ClubProfileResponse(
            clubId = club.clubId,
            title = club.title,
            city = club.city,
            address = club.address,
            phone = club.phone,
            email = club.email,
            description = club.description
        )
    }


    @Transactional
    fun updateClub(
        jwt: Jwt,
        request: UpdateClubProfileRequest
    ): ClubProfileResponse {

        val user =
            currentUserService.requireAdmin(jwt)

        val club = user.club
            ?: throw IllegalStateException(
                "User is not assigned to a club"
            )

        club.title =
            request.title.trim()

        club.city = request.city
            ?.trim()
            ?.takeIf { it.isNotEmpty() }

        club.address = request.address
            ?.trim()
            ?.takeIf { it.isNotEmpty() }

        club.phone = request.phone
            ?.trim()
            ?.takeIf { it.isNotEmpty() }

        club.email = request.email
            ?.trim()
            ?.takeIf { it.isNotEmpty() }

        club.description =
            request.description
                ?.trim()
                ?.takeIf { it.isNotEmpty() }

        val savedClub =
            clubRepository.save(club)

        return ClubProfileResponse(
            clubId = savedClub.clubId,
            title = savedClub.title,
            city = savedClub.city,
            address = savedClub.address,
            phone = savedClub.phone,
            email = savedClub.email,
            description = savedClub.description
        )
    }
}