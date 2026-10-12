package com.skyline.backend.service

import com.skyline.backend.dto.category.CreateCategoryRequest
import com.skyline.backend.dto.category.CategoryResponse
import com.skyline.backend.dto.category.UpdateCategoryRequest
import com.skyline.backend.dto.category.UpdateCategoryStatusRequest
import com.skyline.backend.entity.Category
import com.skyline.backend.entity.Club
import com.skyline.backend.exception.ConflictException
import com.skyline.backend.repository.CategoryRepository
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import com.skyline.backend.repository.ServiceRepository
import com.skyline.backend.repository.SessionRepository

@Service
class CategoryService(
    private val categoryRepository: CategoryRepository,
    private val currentUserService: CurrentUserService,
    private val serviceRepository: ServiceRepository,
    private val sessionRepository: SessionRepository,
) {


    // =========================================================
    // ОТРИМАННЯ КАТЕГОРІЙ
    // =========================================================

    @Transactional(readOnly = true)
    fun getAll(jwt: Jwt): List<CategoryResponse> {
        val club = requireAdminClub(jwt)

        return categoryRepository
            .findAllByClubClubIdOrderByTitleAsc(club.clubId)
            .map { it.toResponse() }
    }

    @Transactional(readOnly = true)
    fun getById(
        jwt: Jwt,
        categoryId: Long
    ): CategoryResponse {
        val club = requireAdminClub(jwt)
        return findCategory(categoryId, club.clubId).toResponse()
    }


    // =========================================================
    // СТВОРЕННЯ ТА РЕДАГУВАННЯ
    // =========================================================

    @Transactional
    fun createCategory(
        jwt: Jwt,
        request: CreateCategoryRequest
    ): CategoryResponse {
        val club = requireAdminClub(jwt)
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

        return categoryRepository.save(category).toResponse()
    }

    @Transactional
    fun updateCategory(
        jwt: Jwt,
        categoryId: Long,
        request: UpdateCategoryRequest
    ): CategoryResponse {
        val club = requireAdminClub(jwt)
        val category = findCategory(categoryId, club.clubId)
        val title = request.title.trim()

        if (
            categoryRepository
                .existsByClubClubIdAndTitleIgnoreCaseAndCategoryIdNot(
                    club.clubId,
                    title,
                    categoryId
                )
        ) {
            throw ConflictException(
                "Категорія з такою назвою вже існує"
            )
        }

        category.title = title

        return categoryRepository.save(category).toResponse()
    }


    // =========================================================
    // АКТИВАЦІЯ ТА ДЕАКТИВАЦІЯ
    // =========================================================

    @Transactional
    fun updateCategoryStatus(
        categoryId: Long,
        request: UpdateCategoryStatusRequest,
        jwt: Jwt
    ): CategoryResponse {
        val club = requireAdminClub(jwt)
        val category = findCategory(categoryId, club.clubId)

        category.status = request.status

        return categoryRepository.save(category).toResponse()
    }


    // =========================================================
    // ВИДАЛЕННЯ
    // =========================================================
    /**
     * Фізичне видалення можливе лише тоді, коли категорія
     * не використовується послугами або заняттями.
     */
    @Transactional
    fun deleteCategory(
        jwt: Jwt,
        categoryId: Long
    ) {
        val club = requireAdminClub(jwt)
        val category = findCategory(categoryId, club.clubId)

        val usedByServices =
            serviceRepository.existsByCategoryCategoryId(categoryId)

        val usedBySessions =
            sessionRepository.existsByCategoryCategoryId(categoryId)

        if (usedByServices || usedBySessions) {
            throw ConflictException(
                "Неможливо видалити категорію, оскільки вона " +
                        "використовується в системі. " +
                        "Деактивуйте категорію замість видалення"
            )
        }

        categoryRepository.delete(category)
    }


    // Допоміжні методи

    private fun requireAdminClub(jwt: Jwt): Club {
        val user = currentUserService.requireAdmin(jwt)

        return user.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )
    }

    private fun findCategory(
        categoryId: Long,
        clubId: Long
    ): Category {
        return categoryRepository
            .findByCategoryIdAndClubClubId(categoryId, clubId)
            ?: throw NoSuchElementException(
                "Категорію не знайдено"
            )
    }

    private fun Category.toResponse() = CategoryResponse(
        categoryId = requireNotNull(categoryId),
        title = title,
        status = status,
        createdAt = createdAt
    )
}