package com.skyline.backend.controller

import com.skyline.backend.dto.account.AccountResponse
import com.skyline.backend.dto.account.CreateAccountRequest
import com.skyline.backend.dto.account.UpdateAccountRequest
import com.skyline.backend.dto.account.UpdateAccountStatusRequest
import com.skyline.backend.service.AccountService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/accounts")
class AccountController(
    private val accountService: AccountService
) {

    @GetMapping
    fun getAll(
        @AuthenticationPrincipal jwt: Jwt
    ): List<AccountResponse> {

        return accountService.getAll(jwt)
    }


    @GetMapping("/{accountId}")
    fun getById(
        @PathVariable accountId: Long,
        @AuthenticationPrincipal jwt: Jwt
    ): AccountResponse {

        return accountService.getById(jwt, accountId)
    }


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createAccount(
        @Valid
        @RequestBody request: CreateAccountRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): AccountResponse {

        return accountService.createAccount(jwt, request)
    }


    @PutMapping("/{accountId}")
    fun updateAccount(
        @PathVariable accountId: Long,
        @Valid
        @RequestBody request: UpdateAccountRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): AccountResponse {

        return accountService.updateAccount(jwt, accountId, request)
    }


    @PatchMapping("/{accountId}/status")
    fun updateAccountStatus(
        @PathVariable accountId: Long,
        @Valid
        @RequestBody request: UpdateAccountStatusRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): AccountResponse {

        return accountService.updateAccountStatus(accountId, request, jwt)
    }


    @DeleteMapping("/{accountId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteAccount(
        @PathVariable accountId: Long,
        @AuthenticationPrincipal jwt: Jwt
    ) {

        accountService.deleteAccount(jwt, accountId)
    }
}