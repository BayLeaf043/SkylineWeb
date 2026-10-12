package com.skyline.backend.controller

import com.skyline.backend.dto.certificate.CertificateResponse
import com.skyline.backend.dto.certificate.UpdateCertificateValidityRequest
import com.skyline.backend.service.CertificateService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import com.skyline.backend.dto.certificate.CertificatePageResponse

@RestController
@RequestMapping("/api/certificates")
class CertificateController(
    private val certificateService: CertificateService
) {

    @GetMapping
    fun getAll(
        @AuthenticationPrincipal jwt: Jwt
    ): List<CertificateResponse> {

        return certificateService.getAll(jwt)
    }


    @GetMapping("/{certificateId}")
    fun getById(
        @PathVariable certificateId: Long,
        @AuthenticationPrincipal jwt: Jwt
    ): CertificateResponse {

        return certificateService.getById(jwt, certificateId)
    }


    @PatchMapping("/{certificateId}/validity")
    fun updateValidity(
        @PathVariable certificateId: Long,
        @Valid
        @RequestBody request: UpdateCertificateValidityRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): CertificateResponse {

        return certificateService.updateValidity(jwt, certificateId, request)
    }


    @DeleteMapping("/{certificateId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteCertificate(
        @PathVariable certificateId: Long,
        @AuthenticationPrincipal jwt: Jwt
    ) {

        certificateService.deleteCertificate(jwt, certificateId)
    }


    @GetMapping("/available")
    fun getAvailableForSession(
        @RequestParam sessionId: Long,
        @RequestParam clientId: Long,
        @AuthenticationPrincipal jwt: Jwt
    ): List<CertificateResponse> {

        return certificateService.getAvailableForSession(jwt = jwt, sessionId = sessionId, clientId = clientId)
    }


    @GetMapping("/active")
    fun getActivePage(
        @RequestParam(defaultValue = "0")
        page: Int,

        @RequestParam(defaultValue = "20")
        size: Int,

        @AuthenticationPrincipal
        jwt: Jwt,

        @RequestParam(defaultValue = "")
        search: String,
    ): CertificatePageResponse {

        return certificateService
            .getActivePage(
                jwt = jwt,
                page = page,
                size = size,
                search = search
            )
    }


    @GetMapping("/archive")
    fun getArchivePage(
        @RequestParam(defaultValue = "0")
        page: Int,

        @RequestParam(defaultValue = "20")
        size: Int,

        @RequestParam
        year: Int,

        @RequestParam
        month: Int,

        @AuthenticationPrincipal
        jwt: Jwt,

        @RequestParam(defaultValue = "")
        search: String,
    ): CertificatePageResponse {

        return certificateService
            .getArchivePage(
                jwt = jwt,
                page = page,
                size = size,
                year = year,
                month = month,
                search = search
            )
    }
}