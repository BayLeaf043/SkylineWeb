package com.skyline.backend.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtValidators
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.http.HttpMethod
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
class SecurityConfig(
    @Value("\${supabase.url}")
    private val supabaseUrl: String
) {

    @Bean
    fun jwtDecoder(): JwtDecoder {
        val jwkSetUri = "$supabaseUrl/auth/v1/.well-known/jwks.json"
        val issuer = "$supabaseUrl/auth/v1"

        val decoder = NimbusJwtDecoder
            .withJwkSetUri(jwkSetUri)
            .jwsAlgorithm(SignatureAlgorithm.ES256)
            .build()

        decoder.setJwtValidator(
            JwtValidators.createDefaultWithIssuer(issuer)
        )

        return decoder
    }

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .cors { }
            .sessionManagement {
                it.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            }
            .authorizeHttpRequests {
            it
                .requestMatchers(
                    HttpMethod.OPTIONS,
                    "/**"
                ).permitAll()

                .requestMatchers(
                    "/api/health",
                    "/api/auth/register-club",
                    "/api/auth/login",
                    "/api/auth/refresh",
                    "/error"
                ).permitAll()

                .anyRequest()
                .authenticated()
            }
            .oauth2ResourceServer {
                it.jwt {}
            }
            .exceptionHandling {
                it.authenticationEntryPoint { _, response, _ ->
                    response.status = 401
                    response.contentType = "application/json"

                    response.writer.write(
                        """
                        {
                          "status": 401,
                          "error": "Unauthorized",
                          "message": "Authentication is required"
                        }
                        """.trimIndent()
                    )
                }

                it.accessDeniedHandler { _, response, _ ->
                    response.status = 403
                    response.contentType = "application/json"

                    response.writer.write(
                        """
                        {
                          "status": 403,
                          "error": "Forbidden",
                          "message": "You do not have permission to perform this action"
                        }
                        """.trimIndent()
                    )
                }
            }

        return http.build()
    }
    
    
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {

    val configuration = CorsConfiguration()

    configuration.allowedOrigins = listOf(
        "http://localhost:5173"
    )

    configuration.allowedMethods = listOf(
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"
    )

    configuration.allowedHeaders = listOf(
        "Authorization",
        "Content-Type"
    )

    configuration.exposedHeaders = listOf(
        "Authorization"
    )

    configuration.allowCredentials = true

    val source = UrlBasedCorsConfigurationSource()

    source.registerCorsConfiguration(
        "/**",
        configuration
    )

    return source
}
}