package com.skyline.backend.service

import com.skyline.backend.dto.service.CreateServiceRequest
import com.skyline.backend.dto.service.ServiceResponse
import com.skyline.backend.entity.Club
import com.skyline.backend.entity.Category
import com.skyline.backend.entity.Direction
import com.skyline.backend.repository.DirectionRepository
import com.skyline.backend.dto.service.UpdateServiceStatusRequest
import com.skyline.backend.dto.service.UpdateServiceRequest
import com.skyline.backend.entity.Service as ServiceEntity
import com.skyline.backend.exception.ConflictException
import com.skyline.backend.repository.CategoryRepository
import com.skyline.backend.repository.ServiceRepository
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import com.skyline.backend.repository.PurchaseRepository

@Service
class ServiceService(
    private val serviceRepository: ServiceRepository,
    private val categoryRepository: CategoryRepository,
    private val directionRepository: DirectionRepository,
    private val purchaseRepository: PurchaseRepository,
    private val currentUserService: CurrentUserService
) {

    // =========================================================
    // ОТРИМАННЯ ПОСЛУГ
    // =========================================================
    @Transactional(readOnly = true)
    fun getAll(jwt: Jwt): List<ServiceResponse> {
        val club = requireAdminClub(jwt)

        return serviceRepository
            .findAllByClubClubIdOrderByTitleAsc(club.clubId)
            .map { it.toResponse() }
    }

    @Transactional(readOnly = true)
    fun getById(
        serviceId: Long,
        jwt: Jwt
    ): ServiceResponse {
        val club = requireAdminClub(jwt)

        return findService(serviceId, club.clubId).toResponse()
    }

    // =========================================================
    // СТВОРЕННЯ ТА РЕДАГУВАННЯ
    // =========================================================
    @Transactional
    fun createService(
        request: CreateServiceRequest,
        jwt: Jwt
    ): ServiceResponse {
        val club = requireAdminClub(jwt)
        val title = request.title.trim()

        validateUniqueTitle(club.clubId, title)

        val category = findCategory(request.categoryId, club.clubId)
        val direction = findDirection(request.directionId, club.clubId)

        if (!category.status) {
            throw ConflictException(
                "Неможливо створити послугу в неактивній категорії"
            )
        }

        if (!direction.status) {
            throw ConflictException(
                "Неможливо створити послугу в неактивному напрямку"
            )
        }

        val service = ServiceEntity(
            club = club,
            category = category,
            direction = direction,
            title = title,
            description = request.description.normalizeOptional(),
            price = request.price,
            sessionsCount = request.sessionsCount,
            validityDays = request.validityDays,
            status = true
        )

        return serviceRepository.save(service).toResponse()
    }

    @Transactional
    fun updateService(
        serviceId: Long,
        request: UpdateServiceRequest,
        jwt: Jwt
    ): ServiceResponse {
        val club = requireAdminClub(jwt)
        val service = findService(serviceId, club.clubId)
        val title = request.title.trim()

        validateUniqueTitle(club.clubId, title, serviceId)

        val category = findCategory(request.categoryId, club.clubId)
        val direction = findDirection(request.directionId, club.clubId)

        // Дозволяємо зберегти поточну неактивну категорію,
        // але забороняємо переносити послугу в іншу неактивну.
        if (
            !category.status &&
            service.category?.categoryId != category.categoryId
        ) {
            throw ConflictException(
                "Неможливо перемістити послугу в неактивну категорію"
            )
        }

        if (
            !direction.status &&
            service.direction?.directionId != direction.directionId
        ) {
            throw ConflictException(
                "Неможливо перемістити послугу в неактивний напрямок"
            )
        }

        service.apply {
            this.category = category
            this.direction = direction
            this.title = title
            description = request.description.normalizeOptional()
            price = request.price
            sessionsCount = request.sessionsCount
            validityDays = request.validityDays
        }

        return serviceRepository.save(service).toResponse()
    }

    // =========================================================
    // АКТИВАЦІЯ ТА ДЕАКТИВАЦІЯ
    // =========================================================
    @Transactional
    fun updateServiceStatus(
        serviceId: Long,
        request: UpdateServiceStatusRequest,
        jwt: Jwt
    ): ServiceResponse {
        val club = requireAdminClub(jwt)
        val service = findService(serviceId, club.clubId)

        if (request.status) {
            val category = service.category
                ?: throw IllegalStateException(
                    "Категорія послуги відсутня"
                )

            val direction = service.direction
                ?: throw IllegalStateException(
                    "Напрямок послуги відсутній"
                )

            if (!category.status) {
                throw ConflictException(
                    "Неможливо активувати послугу в неактивній категорії"
                )
            }

            if (!direction.status) {
                throw ConflictException(
                    "Неможливо активувати послугу в неактивному напрямку"
                )
            }
        }

        service.status = request.status

        return serviceRepository.save(service).toResponse()
    }

    // =========================================================
    // ВИДАЛЕННЯ
    // =========================================================
    /**
     * Послугу можна фізично видалити лише тоді,
     * коли вона не має історії покупок.
     */
    @Transactional
    fun deleteService(
        serviceId: Long,
        jwt: Jwt
    ) {
        val club = requireAdminClub(jwt)
        val service = findService(serviceId, club.clubId)

        if (purchaseRepository.existsByServiceServiceId(serviceId)) {
            throw ConflictException(
                "Неможливо видалити послугу, оскільки вона " +
                        "вже була придбана. Деактивуйте послугу " +
                        "замість видалення"
            )
        }

        serviceRepository.delete(service)
    }

    // =========================================================
    // ПЕРЕВІРКА ДОСТУПУ ТА ПОШУК
    // =========================================================
    private fun requireAdminClub(jwt: Jwt): Club {
        val user = currentUserService.requireAdmin(jwt)

        return user.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )
    }

    private fun findService(
        serviceId: Long,
        clubId: Long
    ): ServiceEntity =
        serviceRepository.findByServiceIdAndClubClubId(
            serviceId,
            clubId
        ) ?: throw NoSuchElementException(
            "Послугу не знайдено"
        )

    private fun findCategory(
        categoryId: Long,
        clubId: Long
    ): Category =
        categoryRepository.findByCategoryIdAndClubClubId(
            categoryId,
            clubId
        ) ?: throw NoSuchElementException(
            "Категорію не знайдено"
        )

    private fun findDirection(
        directionId: Long,
        clubId: Long
    ): Direction =
        directionRepository.findByDirectionIdAndClubClubId(
            directionId,
            clubId
        ) ?: throw NoSuchElementException(
            "Напрямок не знайдено"
        )

    private fun validateUniqueTitle(
        clubId: Long,
        title: String,
        excludeServiceId: Long? = null
    ) {
        val exists = if (excludeServiceId == null) {
            serviceRepository.existsByClubClubIdAndTitleIgnoreCase(
                clubId,
                title
            )
        } else {
            serviceRepository
                .existsByClubClubIdAndTitleIgnoreCaseAndServiceIdNot(
                    clubId,
                    title,
                    excludeServiceId
                )
        }

        if (exists) {
            throw ConflictException(
                "Послуга з такою назвою вже існує"
            )
        }
    }

    // =========================================================
    // ДОПОМІЖНІ МЕТОДИ
    // =========================================================
    private fun String?.normalizeOptional(): String? =
        this?.trim()?.takeIf { it.isNotEmpty() }

    private fun ServiceEntity.toResponse(): ServiceResponse {
        val category = category
            ?: throw IllegalStateException(
                "Категорія послуги відсутня"
            )

        val direction = direction
            ?: throw IllegalStateException(
                "Напрямок послуги відсутній"
            )

        return ServiceResponse(
            serviceId = requireNotNull(serviceId),
            categoryId = requireNotNull(category.categoryId),
            categoryTitle = category.title,
            directionId = requireNotNull(direction.directionId),
            directionTitle = direction.title,
            title = title,
            description = description,
            price = price,
            sessionsCount = sessionsCount,
            validityDays = validityDays,
            status = status,
            createdAt = createdAt
        )
    }
}