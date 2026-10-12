package com.skyline.backend.service

import com.fasterxml.jackson.annotation.JsonProperty
import org.springframework.beans.factory.annotation.Value
import com.skyline.backend.exception.ConflictException
import com.skyline.backend.exception.UnauthorizedException
import org.springframework.web.client.RestClientResponseException
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient
import tools.jackson.databind.ObjectMapper
import java.util.UUID

@Service
class SupabaseAuthService(
    @Value("\${supabase.url}")
    private val supabaseUrl: String,

    @Value("\${supabase.secret-key}")
    private val secretKey: String,

    @Value("\${supabase.publishable-key}")
    private val publishableKey: String,

    private val objectMapper: ObjectMapper
) {

    private val restClient = RestClient.create()

    fun createUser(email: String, password: String): UUID {

        val request = CreateAuthUserRequest(
            email = email,
            password = password,
            emailConfirm = true
        )

        try {
            val response = restClient.post()
                .uri("$supabaseUrl/auth/v1/admin/users")
                .headers { addAdminHeaders(it) }
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(CreateAuthUserResponse::class.java)
                ?: throw IllegalStateException(
                    "Supabase did not return a user"
                )

        return response.id

        } catch (ex: RestClientResponseException) {
            val errorCode = getErrorCode(ex)

            if (
                ex.statusCode.value() == 422 &&
                errorCode in setOf(
                    "email_exists",
                    "user_already_exists"
                )
            ) {
                throw ConflictException(
                    "Користувач з такою електронною поштою вже існує"
                )
            }

            throw IllegalStateException(
                "Unable to create authentication account",
                ex
            )
        }
    }

    fun deleteUser(userId: UUID) {
        try {
            restClient.delete()
                .uri("$supabaseUrl/auth/v1/admin/users/$userId")
                .headers { addAdminHeaders(it) }
                .retrieve()
                .toBodilessEntity()

        } catch (ex: RestClientResponseException) {
            throw IllegalStateException(
                "Unable to delete authentication account",
                ex
            )
        }
    }

    fun login(email: String, password: String): LoginAuthResponse {
        val request = mapOf(
            "email" to email,
            "password" to password
        )

        try {
            return restClient.post()
                .uri("$supabaseUrl/auth/v1/token?grant_type=password")
                .header("apikey", publishableKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(LoginAuthResponse::class.java)
                ?: throw IllegalStateException(
                    "Supabase did not return a session"
                )

        } catch (ex: RestClientResponseException) {
            if (ex.statusCode.is4xxClientError) {
                throw UnauthorizedException(
                    "Неправильна електронна пошта або пароль"
                )
            }

            throw IllegalStateException(
                "Unable to authenticate user",
                ex
            )
        }
    }


    fun refresh(refreshToken: String): LoginAuthResponse {
        val request = mapOf(
            "refresh_token" to refreshToken
        )

        try {
            return restClient.post()
                .uri("$supabaseUrl/auth/v1/token?grant_type=refresh_token")
                .header("apikey", publishableKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(LoginAuthResponse::class.java)
                ?: throw IllegalStateException(
                    "Unable to refresh session"
                )

        } catch (ex: RestClientResponseException) {
            if (ex.statusCode.is4xxClientError) {
                throw UnauthorizedException(
                    "Сесія закінчилася. Увійдіть у систему повторно"
                )
            }

            throw IllegalStateException(
                "Unable to refresh session",
                ex
            )
        }
    }

    fun logout(accessToken: String) {
        try {
            restClient.post()
                .uri("$supabaseUrl/auth/v1/logout")
                .header(
                    HttpHeaders.AUTHORIZATION,
                    "Bearer $accessToken"
                )
                .header("apikey", publishableKey)
                .retrieve()
                .toBodilessEntity()

        } catch (ex: RestClientResponseException) {
            if (
                ex.statusCode.value() == 401 ||
                ex.statusCode.value() == 403
            ) {
                return
            }

            throw IllegalStateException(
                "Unable to terminate authentication session",
                ex
            )
        }
    }


    fun getUser(userId: UUID): AuthUserResponse {
        try {
            return restClient.get()
                .uri("$supabaseUrl/auth/v1/admin/users/$userId")
                .headers { addAdminHeaders(it) }
                .retrieve()
                .body(AuthUserResponse::class.java)
                ?: throw IllegalStateException(
                    "Supabase did not return a user"
                )

        } catch (ex: RestClientResponseException) {
            throw IllegalStateException(
                "Unable to load authentication account",
                ex
            )
        }
    }


    private fun addAdminHeaders(headers: HttpHeaders) {
        headers.setBearerAuth(secretKey)
        headers.set("apikey", secretKey)
    }

    /**
     * Отримує структурований код помилки Supabase,
     * якщо він присутній у JSON-відповіді.
     */
    private fun getErrorCode(
        ex: RestClientResponseException
    ): String? {
        return runCatching {
            val json = objectMapper.readTree(
                ex.responseBodyAsString
            )

            json.path("code")
                .asText("")
                .ifBlank { null }
        }.getOrNull()
    }
}



data class CreateAuthUserRequest(
    val email: String,
    val password: String,

    @JsonProperty("email_confirm")
    val emailConfirm: Boolean
)

data class CreateAuthUserResponse(
    val id: UUID
)

data class AuthUserResponse(
    val id: UUID,
    val email: String?
)

data class LoginAuthResponse(
    @JsonProperty("access_token")
    val accessToken: String,

    @JsonProperty("refresh_token")
    val refreshToken: String?,

    @JsonProperty("expires_in")
    val expiresIn: Long,

    @JsonProperty("token_type")
    val tokenType: String
)