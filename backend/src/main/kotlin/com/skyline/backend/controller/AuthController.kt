package com.skyline.backend.controller

import com.skyline.backend.dto.auth.RegisterClubRequest
import com.skyline.backend.dto.auth.RegisterClubResponse
import com.skyline.backend.dto.auth.LoginRequest
import com.skyline.backend.dto.auth.LoginResponse
import com.skyline.backend.service.AuthService
import com.skyline.backend.service.CurrentUserService
import com.skyline.backend.dto.auth.CurrentUserResponse
import com.skyline.backend.dto.auth.RefreshTokenRequest
import java.util.UUID
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.http.HttpHeaders
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.ResponseStatus

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
    private val currentUserService: CurrentUserService
) {

    @PostMapping("/register-club")
    @ResponseStatus(HttpStatus.CREATED)
    fun registerClub(
        @Valid @RequestBody request: RegisterClubRequest
    ): RegisterClubResponse {
        return authService.registerClub(request)
    }

    @PostMapping("/login")
    fun login(
        @Valid @RequestBody request: LoginRequest
    ): LoginResponse {

        println(">>> LOGIN CONTROLLER REACHED <<<")

        return authService.login(request)
    }
    
    @GetMapping("/me")
    fun me(
        @AuthenticationPrincipal jwt: Jwt
    ): CurrentUserResponse {

    val user = currentUserService.getUser(jwt)

    return CurrentUserResponse(
        userId = user.userId,
        firstName = user.firstName,
        lastName = user.lastName,
        role = user.role.name,
        clubId = user.club?.clubId,
        clubName = user.club?.title)
    }
    
    @PostMapping("/refresh")
    fun refresh(
       @Valid @RequestBody request: RefreshTokenRequest
    ): LoginResponse {
        return authService.refresh(request)
    }
    
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun logout(
       @RequestHeader(HttpHeaders.AUTHORIZATION)
        authorizationHeader: String
    ) {
        val accessToken = authorizationHeader
            .removePrefix("Bearer ")
            .trim()

        authService.logout(accessToken)
    }
}