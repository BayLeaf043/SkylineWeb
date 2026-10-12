package com.skyline.backend.controller

import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import com.skyline.backend.service.GroupClientService
import com.skyline.backend.dto.groupClient.GroupClientResponse
import com.skyline.backend.dto.groupClient.AddGroupClientRequest

@RestController
@RequestMapping("/api/groups/{groupId}/clients")
class GroupClientController(
    private val groupClientService: GroupClientService
) {

    /*
     * Отримати активний склад групи.
     */
    @GetMapping
    fun getAll(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable groupId: Long
    ): List<GroupClientResponse> {

        return groupClientService.getAll(groupId, jwt)
    }


    /*
     * Додати клієнта до групи.
     *
     * Якщо клієнт раніше вже перебував
     * у групі, але був видалений,
     * його участь буде реактивована.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun addClient(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable groupId: Long,
        @Valid @RequestBody request: AddGroupClientRequest
    ): GroupClientResponse {
        return groupClientService.addClient(groupId, request, jwt)
    }


    /*
     * Прибрати клієнта з групи.
     *
     * Фізично GroupClient не видаляється:
     * status змінюється на false.
     */
    @DeleteMapping("/{clientId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun removeClient(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable groupId: Long,
        @PathVariable clientId: Long
    ) {
        groupClientService.removeClient(groupId, clientId, jwt)
    }
}