package com.skyline.backend.exception

import org.springframework.http.HttpStatus
import com.skyline.backend.exception.UnauthorizedException
import org.springframework.security.access.AccessDeniedException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.http.ResponseEntity

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleBadRequest(
        ex: IllegalArgumentException
    ) = ApiError(
        status = 400,
        error = "Bad Request",
        message = ex.message ?: "Invalid request"
    )

    @ExceptionHandler(AccessDeniedException::class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    fun handleForbidden(
        ex: AccessDeniedException
    ) = ApiError(
        status = 403,
        error = "Forbidden",
        message = ex.message ?: "Access denied"
    )

    @ExceptionHandler(MethodArgumentNotValidException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleValidation(
        ex: MethodArgumentNotValidException
    ): ApiError {

        val message = ex.bindingResult
            .fieldErrors
            .firstOrNull()
            ?.defaultMessage
            ?: "Validation failed"

        return ApiError(
            status = 400,
            error = "Validation Error",
            message = message
        )
    }
    
    @ExceptionHandler(ConflictException::class)
    @ResponseStatus(HttpStatus.CONFLICT)
    fun handleConflict(
        ex: ConflictException
    ) = ApiError(
        status = 409,
        error = "Conflict",
        message = ex.message ?: "Resource already exists"
    )

    @ExceptionHandler(UnauthorizedException::class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    fun handleUnauthorized(
        ex: UnauthorizedException
    ) = ApiError(
        status = 401,
        error = "Unauthorized",
        message = ex.message ?: "Authentication failed"
    )

    @ExceptionHandler(NoSuchElementException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handleNotFound(
        ex: NoSuchElementException
    ) = ApiError(
        status = 404,
        error = "Not Found",
        message = ex.message ?: "Ресурс не знайдено"
    )
}