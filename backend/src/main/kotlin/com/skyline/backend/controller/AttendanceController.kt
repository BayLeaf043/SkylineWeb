package com.skyline.backend.controller

import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import com.skyline.backend.service.AttendanceService
import com.skyline.backend.dto.attendance.AttendanceResponse
import com.skyline.backend.dto.attendance.CreateAttendanceRequest


@RestController
class AttendanceController(
    private val attendanceService: AttendanceService
) {

    // GET ATTENDANCE BY SESSION
    @GetMapping("/api/sessions/{sessionId}/attendance")
    fun getAllBySession(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable sessionId: Long
    ): List<AttendanceResponse> {
        return attendanceService.getAllBySession(jwt = jwt, sessionId = sessionId)
    }


    // CREATE ATTENDANCE
    @PostMapping("/api/sessions/{sessionId}/attendance")
    @ResponseStatus(HttpStatus.CREATED)
    fun createAttendance(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable sessionId: Long,
        @Valid @RequestBody request: CreateAttendanceRequest
    ): AttendanceResponse {
        return attendanceService.createAttendance(jwt = jwt, sessionId = sessionId, request = request)
    }


    // GET ATTENDANCE HISTORY BY CLIENT
    @GetMapping("/api/clients/{clientId}/attendance")
    fun getAllByClient(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable clientId: Long
    ): List<AttendanceResponse> {
        return attendanceService.getAllByClient(jwt = jwt, clientId = clientId)
    }
}