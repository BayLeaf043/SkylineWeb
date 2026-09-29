package com.skyline.backend.controller

import com.skyline.backend.dto.certificate.CertificateResponse
import com.skyline.backend.dto.certificate.UpdateCertificateValidityRequest
import com.skyline.backend.service.CertificateService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

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
}