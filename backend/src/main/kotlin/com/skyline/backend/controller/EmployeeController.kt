package com.skyline.backend.controller

import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import com.skyline.backend.service.EmployeeService
import com.skyline.backend.dto.employee.CreateAdminRequest
import com.skyline.backend.dto.employee.EmployeeResponse
import com.skyline.backend.dto.employee.CreateTrainerRequest
import java.util.UUID
import com.skyline.backend.dto.employee.UpdateEmployeeRequest
import com.skyline.backend.dto.employee.UpdateEmployeeStatusRequest

@RestController
@RequestMapping("/api/employees")
class EmployeeController(
    private val employeeService: EmployeeService
) {

    @PostMapping("/admins")
    @ResponseStatus(HttpStatus.CREATED)
    fun createAdmin(
        @AuthenticationPrincipal jwt: Jwt,
        @Valid @RequestBody request: CreateAdminRequest
    ): EmployeeResponse {
        return employeeService.createAdmin(
            jwt,
            request
        )
    }

    @PostMapping("/trainers")
    @ResponseStatus(HttpStatus.CREATED)
    fun createTrainer(
        @AuthenticationPrincipal jwt: Jwt,
        @Valid @RequestBody request: CreateTrainerRequest
    ): EmployeeResponse {
        return employeeService.createTrainer(
            jwt,
            request
        )
    }

    @GetMapping
    fun getEmployees(
        @AuthenticationPrincipal jwt: Jwt
    ): List<EmployeeResponse> {
        return employeeService.getEmployees(jwt)
    }

    @GetMapping("/{userId}")
    fun getEmployee(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable userId: Long
    ): EmployeeResponse {
        return employeeService.getEmployee(
            jwt,
            userId
        )
    }

    @PutMapping("/{userId}")
    fun updateEmployee(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable userId: Long,
        @Valid @RequestBody request: UpdateEmployeeRequest
    ): EmployeeResponse {
        return employeeService.updateEmployee(
            jwt,
            userId,
            request
        )
    }

    @PatchMapping("/{userId}/status")
    fun updateEmployeeStatus(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable userId: Long,
        @RequestBody request: UpdateEmployeeStatusRequest
    ): EmployeeResponse {
        return employeeService.updateEmployeeStatus(
            jwt,
            userId,
            request
        )
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteEmployee(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable userId: Long
    ) {
        employeeService.deleteEmployee(
            jwt,
            userId
        )
    }
}