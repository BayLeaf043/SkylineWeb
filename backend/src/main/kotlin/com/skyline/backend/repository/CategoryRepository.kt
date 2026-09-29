package com.skyline.backend.repository

import com.skyline.backend.entity.Category
import org.springframework.data.jpa.repository.JpaRepository

interface CategoryRepository : JpaRepository<Category, Long> {

    fun findAllByClubClubIdOrderByTitleAsc(
        clubId: Long
    ): List<Category>

    fun findByCategoryIdAndClubClubId(
        categoryId: Long,
        clubId: Long
    ): Category?

    fun existsByClubClubIdAndTitleIgnoreCase(
        clubId: Long,
        title: String
    ): Boolean

    fun existsByClubClubIdAndTitleIgnoreCaseAndCategoryIdNot(
        clubId: Long,
        title: String,
        categoryId: Long
    ): Boolean
}