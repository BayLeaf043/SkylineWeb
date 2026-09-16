package com.skyline.backend.service

import com.skyline.backend.dto.auth.RegisterClubRequest
import com.skyline.backend.dto.auth.RegisterClubResponse
import com.skyline.backend.dto.auth.LoginRequest
import com.skyline.backend.dto.auth.LoginResponse
import com.skyline.backend.dto.auth.CurrentUserResponse
import com.skyline.backend.entity.Club
import com.skyline.backend.entity.User
import com.skyline.backend.entity.UserRole
import com.skyline.backend.repository.ClubRepository
import com.skyline.backend.repository.UserRepository
import com.skyline.backend.dto.auth.RefreshTokenRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class AuthService(
    private val supabaseAuthService: SupabaseAuthService,
    private val clubRepository: ClubRepository,
    private val userRepository: UserRepository
) {

    @Transactional
    fun registerClub(request: RegisterClubRequest): RegisterClubResponse {


        var authUserId: UUID? = null

        try {
            
            val club = Club(
                title = request.clubName.trim(),
                city = request.city?.trim(),
                status = true
            )

            val savedClub = clubRepository.save(club)
            
            authUserId = supabaseAuthService.createUser(
                email = request.email.trim(),
                password = request.password
            )

            val user = User(
                userId = authUserId,
                club = savedClub,
                firstName = request.firstName.trim(),
                lastName = request.lastName.trim(),
                role = UserRole.ADMIN,
                status = true
            )

            userRepository.save(user)

            return RegisterClubResponse(
                userId = authUserId,
                clubId = savedClub.clubId,
                role = user.role.name,
                message = "Club and administrator account created successfully"
            )

        } catch (exception: Exception) {

            if (authUserId != null) {
                runCatching {
                    supabaseAuthService.deleteUser(authUserId)
                }
            }

            throw exception
        }
    }
    
    fun login(request: LoginRequest): LoginResponse {

        val result = supabaseAuthService.login(
            request.email.trim(),
            request.password
    )

        return LoginResponse(
            accessToken = result.accessToken,
            refreshToken = result.refreshToken,
            expiresIn = result.expiresIn,
            tokenType = result.tokenType
        )
    }
    
    fun refresh(
        request: RefreshTokenRequest
        ): LoginResponse {

        val result = supabaseAuthService.refresh(
            request.refreshToken
        )

        return LoginResponse(
            accessToken = result.accessToken,
            refreshToken = result.refreshToken,
            expiresIn = result.expiresIn,
            tokenType = result.tokenType
        )
    }
    
    fun logout(accessToken: String) {
        supabaseAuthService.logout(accessToken)
    }
}