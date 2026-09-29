package com.skyline.backend.controller

import com.skyline.backend.dto.service.CreateServiceRequest
import com.skyline.backend.dto.service.UpdateServiceStatusRequest
import com.skyline.backend.dto.service.ServiceResponse
import com.skyline.backend.dto.service.UpdateServiceRequest
import com.skyline.backend.service.ServiceService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/services")
class ServiceController(
    private val serviceService: ServiceService
) {

    @GetMapping
    fun getAll(
        @AuthenticationPrincipal jwt: Jwt
    ): List<ServiceResponse> {

        return serviceService.getAll(jwt)
    }

    @GetMapping("/{serviceId}")
    fun getById(
        @PathVariable serviceId: Long,
        @AuthenticationPrincipal jwt: Jwt
    ): ServiceResponse {

        return serviceService.getById(serviceId, jwt)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createService(
        @Valid @RequestBody request: CreateServiceRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): ServiceResponse {

        return serviceService.createService(request, jwt)
    }

    @PutMapping("/{serviceId}")
    fun updateService(
        @PathVariable serviceId: Long,
        @Valid @RequestBody request: UpdateServiceRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): ServiceResponse {

        return serviceService.updateService(serviceId, request, jwt)
    }

    @PatchMapping("/{serviceId}/status")
    fun updateServiceStatus(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable serviceId: Long,
        @RequestBody request: UpdateServiceStatusRequest
    ): ServiceResponse {
        return serviceService.updateServiceStatus(serviceId, request, jwt)
    }

    @DeleteMapping("/{serviceId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteService(
        @PathVariable serviceId: Long,
        @AuthenticationPrincipal jwt: Jwt
    ) {

        serviceService.deleteService(serviceId, jwt)
    }
}