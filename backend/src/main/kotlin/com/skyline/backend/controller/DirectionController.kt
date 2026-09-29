package com.skyline.backend.controller

import com.skyline.backend.dto.direction.UpdateDirectionStatusRequest
import com.skyline.backend.dto.direction.UpdateDirectionRequest
import com.skyline.backend.dto.direction.DirectionResponse
import com.skyline.backend.dto.direction.CreateDirectionRequest
import com.skyline.backend.service.DirectionService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/directions")
class DirectionController(
    private val directionService: DirectionService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createDirection(
        @AuthenticationPrincipal jwt: Jwt,
        @Valid @RequestBody request: CreateDirectionRequest
    ): DirectionResponse {

        return directionService.createDirection(jwt, request)
    }


    @GetMapping
    fun getAll(
        @AuthenticationPrincipal jwt: Jwt
    ): List<DirectionResponse> {

        return directionService.getAll(jwt)
    }


    @GetMapping("/{directionId}")
    fun getById(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable directionId: Long
    ): DirectionResponse {

        return directionService.getById(jwt, directionId)
    }


    @PutMapping("/{directionId}")
    fun updateDirection(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable directionId: Long,
        @Valid @RequestBody request: UpdateDirectionRequest
    ): DirectionResponse {

        return directionService.updateDirection(jwt, directionId, request)
    }


    @PatchMapping("/{directionId}/status")
    fun updateDirectionStatus(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable directionId: Long,
        @RequestBody request: UpdateDirectionStatusRequest
    ): DirectionResponse {
        return directionService.updateDirectionStatus(directionId, request, jwt)
    }


    @DeleteMapping("/{directionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteDirection(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable directionId: Long
    ) {

        directionService.deleteDirection(jwt, directionId)
    }
}