package com.skyline.backend.service

import com.skyline.backend.dto.service.CreateServiceRequest
import com.skyline.backend.dto.service.ServiceResponse
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

@Service
class ServiceService(
    private val serviceRepository: ServiceRepository,
    private val categoryRepository: CategoryRepository,
    private val directionRepository: DirectionRepository,
    private val currentUserService: CurrentUserService
) {

    @Transactional(readOnly = true)
    fun getAll(jwt: Jwt): List<ServiceResponse> {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        return serviceRepository
            .findAllByClubClubIdOrderByTitleAsc(clubId)
            .map { it.toResponse() }
    }

    @Transactional(readOnly = true)
    fun getById(
        serviceId: Long,
        jwt: Jwt
    ): ServiceResponse {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val service = serviceRepository
            .findByServiceIdAndClubClubId(
                serviceId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Послугу не знайдено"
            )

        return service.toResponse()
    }

    @Transactional
    fun createService(
        request: CreateServiceRequest,
        jwt: Jwt
    ): ServiceResponse {

        val user = currentUserService.requireAdmin(jwt)

        val club = user.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val clubId = club.clubId
        val title = request.title.trim()

        if (
            serviceRepository.existsByClubClubIdAndTitleIgnoreCase(
                clubId,
                title
            )
        ) {
            throw ConflictException(
                "Послуга з такою назвою вже існує"
            )
        }

        // Шукаємо категорію тільки в межах клубу поточного ADMIN.
        val category = categoryRepository
            .findByCategoryIdAndClubClubId(
                request.categoryId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Категорію не знайдено"
            )

        if (!category.status) {
            throw ConflictException(
                "Неможливо створити послугу в неактивній категорії"
            )
        }


        val direction = directionRepository
            .findByDirectionIdAndClubClubId(
                request.directionId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Напрямок не знайдено"
            )

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
            description = request.description
                ?.trim()
                ?.takeIf { it.isNotEmpty() },
            price = request.price,
            sessionsCount = request.sessionsCount,
            validityDays = request.validityDays,
            status = true
        )

        return serviceRepository
            .save(service)
            .toResponse()
    }

    @Transactional
    fun updateService(
        serviceId: Long,
        request: UpdateServiceRequest,
        jwt: Jwt
    ): ServiceResponse {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val service = serviceRepository
            .findByServiceIdAndClubClubId(
                serviceId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Послугу не знайдено"
            )

        val title = request.title.trim()

        if (
            serviceRepository
                .existsByClubClubIdAndTitleIgnoreCaseAndServiceIdNot(
                    clubId,
                    title,
                    serviceId
                )
        ) {
            throw ConflictException(
                "Послуга з такою назвою вже існує"
            )
        }

        val category = categoryRepository
            .findByCategoryIdAndClubClubId(
                request.categoryId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Категорію не знайдено"
            )

        val direction = directionRepository
            .findByDirectionIdAndClubClubId(
                request.directionId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Напрямок не знайдено"
            )

        /*
         * Не дозволяємо переводити послугу в неактивну категорію.
         *
         * Виняток: якщо послуга вже знаходиться саме в цій категорії,
         * адмін повинен мати можливість редагувати інші її поля
         * або зробити саму послугу неактивною.
         */
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

        service.category = category
        service.direction = direction
        service.title = title
        service.description = request.description
            ?.trim()
            ?.takeIf { it.isNotEmpty() }

        service.price = request.price
        service.sessionsCount = request.sessionsCount
        service.validityDays = request.validityDays

        return serviceRepository
            .save(service)
            .toResponse()
    }

    @Transactional
    fun updateServiceStatus(
        serviceId: Long,
        request: UpdateServiceStatusRequest,
        jwt: Jwt
    ): ServiceResponse {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val service = serviceRepository
            .findByServiceIdAndClubClubId(
                serviceId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Послугу не знайдено"
            )

        /*
         * Активувати послугу можна лише тоді,
         * коли її категорія також активна.
         */
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

        return serviceRepository
            .save(service)
            .toResponse()
    }

    @Transactional
    fun deleteService(
        serviceId: Long,
        jwt: Jwt
    ) {

        val user = currentUserService.requireAdmin(jwt)

        val clubId = user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val service = serviceRepository
            .findByServiceIdAndClubClubId(
                serviceId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Послугу не знайдено"
            )

        /*
         * TODO:
         * Перед фізичним видаленням перевірити,
         * чи використовувалася послуга:
         *
         * - у придбаних абонементах;
         * - платежах;
         * - бронюваннях;
         * - інших історичних записах.
         *
         * Якщо використовується:
         * throw ConflictException(...)
         *
         * У такому випадку послугу потрібно
         * зробити неактивною через status = false.
         */

        serviceRepository.delete(service)
    }

    private fun ServiceEntity.toResponse(): ServiceResponse {

        val category = category
            ?: throw IllegalStateException(
                "Service category is missing"
            )

        val direction = direction
            ?: throw IllegalStateException(
                "Service direction is missing"
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