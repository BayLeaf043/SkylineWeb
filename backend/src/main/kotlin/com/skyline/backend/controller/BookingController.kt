package com.skyline.backend.controller

import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import com.skyline.backend.service.BookingService
import com.skyline.backend.dto.booking.BookingResponse
import com.skyline.backend.dto.booking.CreateBookingRequest
import com.skyline.backend.dto.booking.UpdateBookingCertificateRequest

@RestController
@RequestMapping("/api/sessions/{sessionId}/bookings")
class BookingController(
    private val bookingService: BookingService
) {

    // GET ACTIVE BOOKINGS BY SESSION
    @GetMapping
    fun getAllBySession(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable sessionId: Long
    ): List<BookingResponse> {
        return bookingService.getAllBySession(jwt = jwt, sessionId = sessionId)
    }


    // CREATE / RESTORE BOOKING
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createBooking(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable sessionId: Long,
        @Valid @RequestBody request: CreateBookingRequest
    ): BookingResponse {
        return bookingService.createBooking(jwt = jwt, sessionId = sessionId, request = request)
    }


    // CANCEL BOOKING
    @PatchMapping("/{bookingId}/cancel")
    fun cancelBooking(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable sessionId: Long,
        @PathVariable bookingId: Long
    ): BookingResponse {
        return bookingService.cancelBooking(jwt = jwt, sessionId = sessionId, bookingId = bookingId)
    }

    @PatchMapping("/{bookingId}/certificate")
    fun updateBookingCertificate(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable sessionId: Long,
        @PathVariable bookingId: Long,
        @RequestBody request: UpdateBookingCertificateRequest
    ): BookingResponse {

        return bookingService.updateBookingCertificate(
            jwt = jwt,
            sessionId = sessionId,
            bookingId = bookingId,
            request = request
        )
    }
}
