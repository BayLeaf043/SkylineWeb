package com.skyline.backend.controller


import com.skyline.backend.dto.hall.CreateHallRequest
import com.skyline.backend.dto.hall.HallResponse
import com.skyline.backend.dto.hall.UpdateHallRequest
import com.skyline.backend.dto.hall.UpdateHallStatusRequest
import com.skyline.backend.service.HallService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/halls")
class HallController(
    private val hallService: HallService
) {

    @GetMapping
    fun getAll(
        @AuthenticationPrincipal jwt: Jwt
    ): List<HallResponse> {
        return hallService.getAll(jwt)
    }

    @GetMapping("/{hallId}")
    fun getById(
        @PathVariable hallId: Long,
        @AuthenticationPrincipal jwt: Jwt
    ): HallResponse {
        return hallService.getById(hallId, jwt)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createHall(
        @Valid @RequestBody request: CreateHallRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): HallResponse {
        return hallService.createHall(request, jwt)
    }

    @PutMapping("/{hallId}")
    fun updateHall(
        @PathVariable hallId: Long,
        @Valid @RequestBody request: UpdateHallRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): HallResponse {
        return hallService.updateHall(hallId, request, jwt)
    }


    @PatchMapping("/{hallId}/status")
    fun updateHallStatus(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable hallId: Long,
        @RequestBody request: UpdateHallStatusRequest
    ): HallResponse {
        return hallService.updateHallStatus(hallId, request, jwt)
    }


    @DeleteMapping("/{hallId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteHall(
        @PathVariable hallId: Long,
        @AuthenticationPrincipal jwt: Jwt
    ) {
        hallService.deleteHall(hallId, jwt)
    }
}