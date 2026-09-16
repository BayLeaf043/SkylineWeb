package com.skyline.backend.controller

import com.skyline.backend.entity.Club
import com.skyline.backend.repository.ClubRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/clubs")
class ClubController(
    private val clubRepository: ClubRepository
) {

    @GetMapping
    fun getAllClubs(): List<Club> {
        return clubRepository.findAll()
    }
}