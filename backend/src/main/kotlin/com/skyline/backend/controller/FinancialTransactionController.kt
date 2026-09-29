package com.skyline.backend.controller

import com.skyline.backend.dto.financialTransaction.CreateFinancialTransactionRequest
import com.skyline.backend.dto.financialTransaction.FinancialTransactionResponse
import com.skyline.backend.dto.financialTransaction.UpdateFinancialTransactionRequest
import com.skyline.backend.service.FinancialTransactionService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/financial-transactions")
class FinancialTransactionController(
    private val financialTransactionService: FinancialTransactionService
) {

    @GetMapping
    fun getAll(
        @AuthenticationPrincipal jwt: Jwt
    ): List<FinancialTransactionResponse> {

        return financialTransactionService.getAll(jwt)
    }


    @GetMapping("/{transactionId}")
    fun getById(
        @PathVariable transactionId: Long,
        @AuthenticationPrincipal jwt: Jwt
    ): FinancialTransactionResponse {

        return financialTransactionService.getById(jwt, transactionId)
    }


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createTransaction(
        @Valid
        @RequestBody request: CreateFinancialTransactionRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): FinancialTransactionResponse {

        return financialTransactionService.createTransaction(jwt, request)
    }


    @PutMapping("/{transactionId}")
    fun updateTransaction(
        @PathVariable transactionId: Long,
        @Valid
        @RequestBody request: UpdateFinancialTransactionRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): FinancialTransactionResponse {

        return financialTransactionService.updateTransaction(jwt, transactionId, request)
    }


    @DeleteMapping("/{transactionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteTransaction(
        @PathVariable transactionId: Long,
        @AuthenticationPrincipal jwt: Jwt
    ) {

        financialTransactionService.deleteTransaction(jwt, transactionId)
    }
}