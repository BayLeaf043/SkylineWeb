package com.skyline.backend.controller

import com.skyline.backend.dto.profile.ClubProfileResponse
import com.skyline.backend.dto.profile.ProfileResponse
import com.skyline.backend.dto.profile.UpdateClubProfileRequest
import com.skyline.backend.dto.profile.UpdateProfileRequest
import com.skyline.backend.service.ProfileService
import jakarta.validation.Valid
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/profile")
class ProfileController(
    private val profileService: ProfileService
) {

    @GetMapping
    fun getProfile(
        @AuthenticationPrincipal jwt: Jwt
    ): ProfileResponse {
        return profileService.getProfile(jwt)
    }


    @PutMapping
    fun updateProfile(
        @AuthenticationPrincipal jwt: Jwt,
        @Valid @RequestBody request: UpdateProfileRequest
    ): ProfileResponse {
        return profileService.updateProfile(
            jwt,
            request
        )
    }


    @GetMapping("/club")
    fun getClub(
        @AuthenticationPrincipal jwt: Jwt
    ): ClubProfileResponse {
        return profileService.getClub(jwt)
    }


    @PutMapping("/club")
    fun updateClub(
        @AuthenticationPrincipal jwt: Jwt,
        @Valid @RequestBody request: UpdateClubProfileRequest
    ): ClubProfileResponse {
        return profileService.updateClub(
            jwt,
            request
        )
    }
}