package com.skyline.backend.dto.session

import jakarta.validation.constraints.NotNull
import java.time.OffsetDateTime
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Size

data class UpdateSessionRequest(

    val groupId: Long? = null,

    @field:NotNull(
        message = "Напрямок необхідно обрати"
    )
    val directionId: Long,

    @field:NotNull(
        message = "Категорію необхідно обрати"
    )
    val categoryId: Long,

    val trainerId: Long? = null,

    @field:NotNull(
        message = "Зал необхідно обрати"
    )
    val hallId: Long,

    @field:NotNull(
        message = "Вкажіть дату та час початку заняття"
    )
    val startAt: OffsetDateTime,

    @field:NotNull(
        message = "Вкажіть дату та час завершення заняття"
    )
    val endAt: OffsetDateTime,

    @field:Min(
        value = 1,
        message = "Місткість заняття повинна бути не менше 1"
    )
    val capacity: Int,

    @field:Size(
        max = 1000,
        message = "Коментар не може містити більше 1000 символів"
    )
    val comment: String? = null
)