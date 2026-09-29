package com.skyline.backend.controller

import com.skyline.backend.dto.purchase.CreatePurchaseRequest
import com.skyline.backend.dto.purchase.PurchaseResponse
import com.skyline.backend.dto.purchase.RefundPurchaseRequest
import com.skyline.backend.service.PurchaseService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/purchases")
class PurchaseController(
    private val purchaseService: PurchaseService
) {

    @GetMapping
    fun getAll(
        @AuthenticationPrincipal jwt: Jwt
    ): List<PurchaseResponse> {

        return purchaseService.getAll(jwt)
    }


    @GetMapping("/{purchaseId}")
    fun getById(
        @PathVariable purchaseId: Long,
        @AuthenticationPrincipal jwt: Jwt
    ): PurchaseResponse {

        return purchaseService.getById(jwt, purchaseId)
    }


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createPurchase(
        @Valid
        @RequestBody request: CreatePurchaseRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): PurchaseResponse {

        return purchaseService.createPurchase(jwt, request)
    }


    @PostMapping("/{purchaseId}/refund")
    fun refundPurchase(
        @PathVariable purchaseId: Long,
        @Valid
        @RequestBody request: RefundPurchaseRequest,
        @AuthenticationPrincipal jwt: Jwt
    ): PurchaseResponse {

        return purchaseService.refundPurchase(jwt, purchaseId, request)
    }
}