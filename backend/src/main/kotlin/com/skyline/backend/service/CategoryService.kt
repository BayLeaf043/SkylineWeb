package com.skyline.backend.service

import com.skyline.backend.dto.category.CreateCategoryRequest
import com.skyline.backend.dto.category.CategoryResponse
import com.skyline.backend.dto.category.UpdateCategoryRequest
import com.skyline.backend.dto.category.UpdateCategoryStatusRequest
import com.skyline.backend.entity.Category
import com.skyline.backend.exception.ConflictException
import com.skyline.backend.repository.CategoryRepository
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CategoryService(
    private val categoryRepository: CategoryRepository,
    private val currentUserService: CurrentUserService
) {

    @Transactional
    fun createCategory(
        jwt: Jwt,
        request: CreateCategoryRequest
    ): CategoryResponse {

        val user = currentUserService.requireAdmin(jwt)

        val club = user.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val title = request.title.trim()

        if (
            categoryRepository.existsByClubClubIdAndTitleIgnoreCase(
                club.clubId,
                title
            )
        ) {
            throw ConflictException(
                "Категорія з такою назвою вже існує"
            )
        }

        val category = Category(
            club = club,
            title = title,
            status = true
        )

        val savedCategory = categoryRepository.save(category)

        return savedCategory.toResponse()
    }


    @Transactional(readOnly = true)
    fun getAll(jwt: Jwt): List<CategoryResponse> {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        return categoryRepository
            .findAllByClubClubIdOrderByTitleAsc(clubId)
            .map { it.toResponse() }
    }


    @Transactional(readOnly = true)
    fun getById(
        jwt: Jwt,
        categoryId: Long
    ): CategoryResponse {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val category = categoryRepository
            .findByCategoryIdAndClubClubId(categoryId, clubId)
            ?: throw NoSuchElementException(
                "Категорію не знайдено"
            )

        return category.toResponse()
    }


    @Transactional
    fun updateCategory(
        jwt: Jwt,
        categoryId: Long,
        request: UpdateCategoryRequest
    ): CategoryResponse {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val category = categoryRepository
            .findByCategoryIdAndClubClubId(categoryId, clubId)
            ?: throw NoSuchElementException(
                "Категорію не знайдено"
            )

        val title = request.title.trim()

        if (
            categoryRepository
                .existsByClubClubIdAndTitleIgnoreCaseAndCategoryIdNot(
                    clubId,
                    title,
                    categoryId
                )
        ) {
            throw ConflictException(
                "Категорію з такою назвою вже існує"
            )
        }

        category.title = title

        val savedCategory = categoryRepository.save(category)

        return savedCategory.toResponse()
    }


    @Transactional
    fun updateCategoryStatus(
        categoryId: Long,
        request: UpdateCategoryStatusRequest,
        jwt: Jwt
    ): CategoryResponse {

        val currentAdmin =
            currentUserService.requireAdmin(jwt)

        val clubId = currentAdmin.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val category = categoryRepository
            .findByCategoryIdAndClubClubId(
                categoryId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Категорію не знайдено"
            )

        category.status = request.status

        return categoryRepository
            .save(category)
            .toResponse()
    }


    @Transactional
    fun deleteCategory(
        jwt: Jwt,
        categoryId: Long
    ) {

        val user = currentUserService.requireAdmin(jwt)

        val club = user.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val category = categoryRepository
            .findByCategoryIdAndClubClubId(
                categoryId,
                club.clubId
            )
            ?: throw NoSuchElementException(
                "Категорію не знайдено"
            )

        /*
         * TODO:
         * Before deleting the category, check whether
         * it is used by any services.
         *
         * If the category is used:
         * - physical deletion must be prohibited;
         * - administrator should set status = false instead.
         */

        categoryRepository.delete(category)
    }


    private fun Category.toResponse(): CategoryResponse {
        return CategoryResponse(
            categoryId = requireNotNull(categoryId),
            title = title,
            status = status,
            createdAt = createdAt
        )
    }
}