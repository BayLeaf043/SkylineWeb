package com.skyline.backend.service

import com.skyline.backend.dto.auth.RegisterClubRequest
import com.skyline.backend.dto.auth.RegisterClubResponse
import com.skyline.backend.dto.auth.LoginRequest
import com.skyline.backend.dto.auth.LoginResponse
import com.skyline.backend.entity.Club
import com.skyline.backend.entity.User
import com.skyline.backend.entity.UserRole
import com.skyline.backend.repository.ClubRepository
import com.skyline.backend.repository.UserRepository
import com.skyline.backend.dto.auth.RefreshTokenRequest
import org.springframework.stereotype.Service
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtException
import org.springframework.transaction.annotation.Transactional
import com.skyline.backend.exception.UnauthorizedException
import java.util.UUID

@Service
class AuthService(
    private val supabaseAuthService: SupabaseAuthService,
    private val clubRepository: ClubRepository,
    private val userRepository: UserRepository,
    private val jwtDecoder: JwtDecoder,
    private val currentUserService: CurrentUserService
) {

    @Transactional
    fun registerClub(
        request: RegisterClubRequest
    ): RegisterClubResponse {

        var authUserId: UUID? = null

        try {
            val club = Club(
                title = request.clubName.trim(),
                city = request.city?.trim(),
                status = true
            )

            val savedClub =
                clubRepository.save(club)

            authUserId =
                supabaseAuthService.createUser(
                    email = request.email.trim(),
                    password = request.password
                )

            val user = User(
                authUserId = authUserId,
                club = savedClub,
                firstName = request.firstName.trim(),
                lastName = request.lastName.trim(),
                role = UserRole.ADMIN,
                status = true
            )

            val savedUser =
                userRepository.save(user)

            return RegisterClubResponse(
                userId = savedUser.userId,
                clubId = savedClub.clubId,
                role = savedUser.role.name,
                message = "Club and administrator account created successfully"
            )

        } catch (exception: Exception) {

            if (authUserId != null) {
                runCatching {
                    supabaseAuthService.deleteUser(
                        authUserId
                    )
                }
            }

            throw exception
        }
    }

    fun login(request: LoginRequest): LoginResponse {

        val session = supabaseAuthService.login(
            email = request.email.trim(),
            password = request.password
        )

        validateSessionUser(session.accessToken)

        return session.toLoginResponse()
    }

    fun refresh(
        request: RefreshTokenRequest
    ): LoginResponse {

        val session = supabaseAuthService.refresh(
            request.refreshToken
        )

        validateSessionUser(session.accessToken)

        return session.toLoginResponse()
    }

    fun logout(accessToken: String) {
        supabaseAuthService.logout(accessToken)
    }


    private fun validateSessionUser(accessToken: String) {

        val jwt = try {
            jwtDecoder.decode(accessToken)
        } catch (ex: JwtException) {
            throw UnauthorizedException(
                "Не вдалося перевірити сесію користувача"
            )
        }

        val user = try {
            currentUserService.getUser(jwt)
        } catch (ex: org.springframework.security.access.AccessDeniedException) {
            throw UnauthorizedException(
                "Обліковий запис недоступний або заблокований"
            )
        }

    }


    private fun LoginAuthResponse.toLoginResponse() =
        LoginResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            expiresIn = expiresIn,
            tokenType = tokenType
        )
}