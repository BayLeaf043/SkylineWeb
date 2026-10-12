package com.skyline.backend.controller

import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import com.skyline.backend.service.GroupService
import com.skyline.backend.dto.group.CreateGroupRequest
import com.skyline.backend.dto.group.GroupResponse
import com.skyline.backend.dto.group.UpdateGroupRequest
import com.skyline.backend.dto.group.UpdateGroupStatusRequest

@RestController
@RequestMapping("/api/groups")
class GroupController(
    private val groupService: GroupService
) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createGroup(
        @AuthenticationPrincipal jwt: Jwt,
        @Valid @RequestBody request: CreateGroupRequest
    ): GroupResponse {
        return groupService.createGroup(request, jwt)
    }


    @GetMapping
    fun getAll(
        @AuthenticationPrincipal jwt: Jwt
    ): List<GroupResponse> {
        return groupService.getAll(jwt)
    }

    @GetMapping("/my")
    fun getMyGroups(
        @AuthenticationPrincipal jwt: Jwt
    ): List<GroupResponse> {
        return groupService.getMyGroups(jwt)
    }

    @GetMapping("/{groupId}")
    fun getById(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable groupId: Long
    ): GroupResponse {
        return groupService.getById(groupId, jwt)
    }


    @PutMapping("/{groupId}")
    fun updateGroup(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable groupId: Long,
        @Valid @RequestBody request: UpdateGroupRequest
    ): GroupResponse {
        return groupService.updateGroup(groupId, request, jwt)
    }


    @PatchMapping("/{groupId}/status")
    fun updateGroupStatus(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable groupId: Long,
        @Valid @RequestBody request: UpdateGroupStatusRequest
    ): GroupResponse {
        return groupService.updateGroupStatus(groupId, request, jwt)
    }


    @DeleteMapping("/{groupId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteGroup(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable groupId: Long
    ) {
        groupService.deleteGroup(groupId, jwt)
    }
}