package com.skyline.backend.controller

import com.skyline.backend.dto.accountTransfer.AccountTransferResponse
import com.skyline.backend.dto.accountTransfer.CreateAccountTransferRequest
import com.skyline.backend.service.AccountTransferService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/account-transfers")
class AccountTransferController(
    private val accountTransferService: AccountTransferService
) {

    @GetMapping
    fun getAll(
        @AuthenticationPrincipal jwt: Jwt
    ): List<AccountTransferResponse> {

        return accountTransferService.getAll(jwt)
    }


    @GetMapping("/{transferId}")
    fun getById(
        @PathVariable transferId: Long,
        @AuthenticationPrincipal jwt: Jwt
    ): AccountTransferResponse {

        return accountTransferService.getById(jwt, transferId)
    }


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createTransfer(
        @Valid
        @RequestBody request: CreateAccountTransferRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): AccountTransferResponse {

        return accountTransferService.createTransfer(jwt, request)
    }
}