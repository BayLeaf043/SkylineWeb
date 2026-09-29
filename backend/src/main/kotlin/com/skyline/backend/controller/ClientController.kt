package com.skyline.backend.controller

import com.skyline.backend.dto.client.ClientResponse
import com.skyline.backend.dto.client.CreateClientRequest
import com.skyline.backend.dto.client.UpdateClientRequest
import com.skyline.backend.dto.client.UpdateClientStatusRequest
import com.skyline.backend.service.ClientService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/clients")
class ClientController(
    private val clientService: ClientService
) {

    @GetMapping
    fun getAllClients(
        @AuthenticationPrincipal jwt: Jwt
    ): List<ClientResponse> =
        clientService.getAllClients(jwt)

    @GetMapping("/{clientId}")
    fun getClient(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable clientId: Long
    ): ClientResponse =
        clientService.getClient(jwt, clientId)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createClient(
        @AuthenticationPrincipal jwt: Jwt,
        @Valid @RequestBody request: CreateClientRequest
    ): ClientResponse =
        clientService.createClient(jwt, request)

    @PutMapping("/{clientId}")
    fun updateClient(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable clientId: Long,
        @Valid @RequestBody request: UpdateClientRequest
    ): ClientResponse =
        clientService.updateClient(jwt, clientId, request)

    @PatchMapping("/{clientId}/status")
    fun updateClientStatus(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable clientId: Long,
        @RequestBody request: UpdateClientStatusRequest
    ): ClientResponse =
        clientService.updateClientStatus(jwt, clientId, request)

    @DeleteMapping("/{clientId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteClient(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable clientId: Long
    ) {
        clientService.deleteClient(jwt, clientId)
    }
}