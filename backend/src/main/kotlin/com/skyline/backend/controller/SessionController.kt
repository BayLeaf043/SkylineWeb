package com.skyline.backend.controller

import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import java.time.OffsetDateTime
import com.skyline.backend.service.SessionService
import com.skyline.backend.dto.session.CreateSessionRequest
import com.skyline.backend.dto.session.UpdateSessionRequest
import com.skyline.backend.dto.session.UpdateSessionTypeRequest
import com.skyline.backend.dto.session.SessionResponse


@RestController
@RequestMapping("/api/sessions")
class SessionController(
    private val sessionService: SessionService
) {

    // CREATE
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createSession(
        @AuthenticationPrincipal jwt: Jwt,
        @Valid @RequestBody request: CreateSessionRequest
    ): SessionResponse {
        return sessionService.createSession(jwt, request)
    }


    // GET ALL BY DATE RANGE
    @GetMapping
    fun getAll(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestParam from: OffsetDateTime,
        @RequestParam to: OffsetDateTime
    ): List<SessionResponse> {
        return sessionService.getAll(jwt, from, to)
    }


    // GET BY ID
    @GetMapping("/{sessionId}")
    fun getById(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable sessionId: Long
    ): SessionResponse {
        return sessionService.getById(jwt, sessionId)
    }


    // GET BY TRAINER
    @GetMapping("/trainer/{trainerId}")
    fun getByTrainer(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable trainerId: Long,
        @RequestParam from: OffsetDateTime,
        @RequestParam to: OffsetDateTime
    ): List<SessionResponse> {
        return sessionService.getByTrainer(jwt, trainerId, from, to)
    }


    // GET BY GROUP
    @GetMapping("/group/{groupId}")
    fun getByGroup(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable groupId: Long,
        @RequestParam from: OffsetDateTime,
        @RequestParam to: OffsetDateTime
    ): List<SessionResponse> {
        return sessionService.getByGroup(jwt, groupId, from, to)
    }


    // GET BY HALL
    @GetMapping("/hall/{hallId}")
    fun getByHall(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable hallId: Long,
        @RequestParam from: OffsetDateTime,
        @RequestParam to: OffsetDateTime
    ): List<SessionResponse> {
        return sessionService.getByHall(jwt, hallId, from, to)
    }


    // UPDATE
    @PutMapping("/{sessionId}")
    fun updateSession(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable sessionId: Long,
        @Valid @RequestBody request: UpdateSessionRequest
    ): SessionResponse {
        return sessionService.updateSession(jwt, sessionId, request)
    }


    // UPDATE TYPE
    @PatchMapping("/{sessionId}/type")
    fun updateSessionType(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable sessionId: Long,
        @Valid @RequestBody request: UpdateSessionTypeRequest
    ): SessionResponse {
        return sessionService.updateSessionType(jwt, sessionId, request)
    }


    // DELETE
    @DeleteMapping("/{sessionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteSession(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable sessionId: Long
    ) {
        sessionService.deleteSession(jwt, sessionId)
    }

    // COMPLETE SESSION
    @PostMapping("/{sessionId}/complete")
    fun completeSession(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable sessionId: Long
    ): SessionResponse {
        return sessionService.completeSession(jwt = jwt, sessionId = sessionId)
    }
}