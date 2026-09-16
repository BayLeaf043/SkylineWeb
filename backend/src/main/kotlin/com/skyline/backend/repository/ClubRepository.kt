package com.skyline.backend.repository

import com.skyline.backend.entity.Club
import org.springframework.data.jpa.repository.JpaRepository

interface ClubRepository : JpaRepository<Club, Long>
