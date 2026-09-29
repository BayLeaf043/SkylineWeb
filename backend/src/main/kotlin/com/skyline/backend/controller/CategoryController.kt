package com.skyline.backend.controller

import com.skyline.backend.dto.category.CategoryResponse
import com.skyline.backend.dto.category.CreateCategoryRequest
import com.skyline.backend.dto.category.UpdateCategoryRequest
import com.skyline.backend.dto.category.UpdateCategoryStatusRequest
import com.skyline.backend.service.CategoryService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/categories")
class CategoryController(
    private val categoryService: CategoryService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createCategory(
        @AuthenticationPrincipal jwt: Jwt,
        @Valid @RequestBody request: CreateCategoryRequest
    ): CategoryResponse {

        return categoryService.createCategory(jwt, request)
    }


    @GetMapping
    fun getAll(
        @AuthenticationPrincipal jwt: Jwt
    ): List<CategoryResponse> {

        return categoryService.getAll(jwt)
    }


    @GetMapping("/{categoryId}")
    fun getById(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable categoryId: Long
    ): CategoryResponse {

        return categoryService.getById(jwt, categoryId)
    }


    @PutMapping("/{categoryId}")
    fun updateCategory(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable categoryId: Long,
        @Valid @RequestBody request: UpdateCategoryRequest
    ): CategoryResponse {

        return categoryService.updateCategory(jwt, categoryId, request)
    }


    @PatchMapping("/{categoryId}/status")
    fun updateCategoryStatus(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable categoryId: Long,
        @RequestBody request: UpdateCategoryStatusRequest
    ): CategoryResponse {
        return categoryService.updateCategoryStatus(categoryId, request, jwt)
    }


    @DeleteMapping("/{categoryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteCategory(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable categoryId: Long
    ) {

        categoryService.deleteCategory(jwt, categoryId)
    }
}