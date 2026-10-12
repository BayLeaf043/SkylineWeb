package com.skyline.backend.service

import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.OffsetDateTime
import com.skyline.backend.repository.SessionRepository
import com.skyline.backend.repository.AttendanceRepository
import com.skyline.backend.repository.GroupRepository
import com.skyline.backend.repository.DirectionRepository
import com.skyline.backend.repository.CategoryRepository
import com.skyline.backend.repository.TrainerRepository
import com.skyline.backend.repository.HallRepository
import com.skyline.backend.dto.session.SessionResponse
import com.skyline.backend.dto.session.CreateSessionRequest
import com.skyline.backend.dto.session.UpdateSessionRequest
import com.skyline.backend.dto.session.UpdateSessionTypeRequest
import com.skyline.backend.entity.Session
import com.skyline.backend.entity.SessionType
import com.skyline.backend.exception.ConflictException
import com.skyline.backend.entity.Hall
import com.skyline.backend.entity.Trainer
import com.skyline.backend.entity.Group
import com.skyline.backend.entity.Direction
import com.skyline.backend.entity.Category
import com.skyline.backend.repository.BookingRepository
import com.skyline.backend.entity.BookingType

@Service
class SessionService(
    private val sessionRepository: SessionRepository,
    private val groupRepository: GroupRepository,
    private val directionRepository: DirectionRepository,
    private val categoryRepository: CategoryRepository,
    private val trainerRepository: TrainerRepository,
    private val hallRepository: HallRepository,
    private val bookingRepository: BookingRepository,
    private val attendanceService: AttendanceService,
    private val currentUserService: CurrentUserService,
    private val attendanceRepository: AttendanceRepository,
) {

    // =========================================================
    // GET ALL BY DATE RANGE
    // =========================================================
    @Transactional(readOnly = true)
    fun getAll(
        jwt: Jwt,
        from: OffsetDateTime,
        to: OffsetDateTime
    ): List<SessionResponse> {

        val clubId = getCurrentClubId(jwt)

        validateDateRange(from, to)

        return sessionRepository
            .findAllByClubClubIdAndStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(
                clubId,
                from,
                to
            )
            .map { it.toResponse() }
    }

    // =========================================================
    // GET BY ID
    // =========================================================
    @Transactional(readOnly = true)
    fun getById(
        jwt: Jwt,
        sessionId: Long
    ): SessionResponse {

        val clubId = getCurrentClubId(jwt)

        val session = findSession(
            sessionId,
            clubId
        )

        return session.toResponse()
    }

    // =========================================================
    // GET BY TRAINER
    // =========================================================
    @Transactional(readOnly = true)
    fun getByTrainer(
        jwt: Jwt,
        trainerId: Long,
        from: OffsetDateTime,
        to: OffsetDateTime
    ): List<SessionResponse> {

        val clubId = getCurrentClubId(jwt)

        validateDateRange(from, to)

        trainerRepository
            .findByTrainerIdAndUserClubClubId(
                trainerId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Тренера не знайдено"
            )

        return sessionRepository
            .findAllByClubClubIdAndTrainerTrainerIdAndStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(
                clubId,
                trainerId,
                from,
                to
            )
            .map { it.toResponse() }
    }

    // =========================================================
    // GET BY GROUP
    // =========================================================
    @Transactional(readOnly = true)
    fun getByGroup(
        jwt: Jwt,
        groupId: Long,
        from: OffsetDateTime,
        to: OffsetDateTime
    ): List<SessionResponse> {

        val clubId = getCurrentClubId(jwt)

        validateDateRange(from, to)

        groupRepository
            .findByGroupIdAndClubClubId(
                groupId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Групу не знайдено"
            )

        return sessionRepository
            .findAllByClubClubIdAndGroupGroupIdAndStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(
                clubId,
                groupId,
                from,
                to
            )
            .map { it.toResponse() }
    }

    // =========================================================
    // GET BY HALL
    // =========================================================
    @Transactional(readOnly = true)
    fun getByHall(
        jwt: Jwt,
        hallId: Long,
        from: OffsetDateTime,
        to: OffsetDateTime
    ): List<SessionResponse> {

        val clubId = getCurrentClubId(jwt)

        validateDateRange(from, to)

        hallRepository
            .findByHallIdAndClubClubId(
                hallId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Зал не знайдено"
            )

        return sessionRepository
            .findAllByClubClubIdAndHallHallIdAndStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(
                clubId,
                hallId,
                from,
                to
            )
            .map { it.toResponse() }
    }

    // =========================================================
    // CREATE
    // =========================================================
    @Transactional
    fun createSession(
        jwt: Jwt,
        request: CreateSessionRequest
    ): SessionResponse {

        val user = currentUserService.requireTrainerOrAdmin(jwt)

        val club = user.club
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )

        val clubId = club.clubId

        validateSessionTime(
            request.startAt,
            request.endAt
        )

        val direction = findActiveDirection(
            request.directionId,
            clubId
        )

        val category = findActiveCategory(
            request.categoryId,
            clubId
        )

        val hall = findActiveHall(
            request.hallId,
            clubId
        )

        val trainer = request.trainerId?.let {
            findActiveTrainer(
                it,
                clubId
            )
        }

        val group = request.groupId?.let {
            findActiveGroup(
                it,
                clubId
            )
        }

        validateGroupRelations(
            group = group,
            direction = direction,
            trainer = trainer
        )

        validateCapacity(
            capacity = request.capacity,
            hall = hall
        )

        validateCreateConflicts(
            clubId = clubId,
            hallId = requireNotNull(hall.hallId),
            trainerId = trainer?.trainerId,
            startAt = request.startAt,
            endAt = request.endAt
        )

        val session = Session(
            club = club,
            group = group,
            direction = direction,
            category = category,
            trainer = trainer,
            hall = hall,
            startAt = request.startAt,
            endAt = request.endAt,
            capacity = request.capacity,
            type = SessionType.PLANNED,
            comment = request.comment
                ?.trim()
                ?.takeIf { it.isNotEmpty() }
        )

        return sessionRepository
            .save(session)
            .toResponse()
    }

    // =========================================================
    // UPDATE
    // =========================================================
    @Transactional
    fun updateSession(
        jwt: Jwt,
        sessionId: Long,
        request: UpdateSessionRequest
    ): SessionResponse {

        val clubId = getCurrentClubId(jwt)

        val session = sessionRepository.findLockedBySessionIdAndClubClubId(sessionId, clubId)
            ?: throw NoSuchElementException("Заняття не знайдено")

        /*
         * Завершену або скасовану подію
         * звичайним PUT уже не редагуємо.
         */
        if (session.type != SessionType.PLANNED) {
            throw ConflictException(
                "Редагувати можна лише заплановане заняття"
            )
        }

        validateSessionTime(
            request.startAt,
            request.endAt
        )

        val activeBookingsCount = bookingRepository.countBySessionSessionIdAndType(
            sessionId, BookingType.BOOKED
        )
        if (request.capacity < activeBookingsCount) {
            throw ConflictException(
                "Місткість заняття не може бути меншою за кількість активних бронювань ($activeBookingsCount)"
            )
        }

        if (activeBookingsCount > 0 && (
                    request.directionId != session.direction.directionId ||
                            request.categoryId != session.category.categoryId ||
                            request.groupId != session.group?.groupId
                    )) {
            throw ConflictException(
                "За наявності активних бронювань не можна змінювати напрямок, категорію або групу заняття"
            )
        }

        val direction = findActiveDirection(
            request.directionId, clubId,
            allowInactive = request.directionId == session.direction.directionId
        )

        val category = findActiveCategory(
            request.categoryId, clubId,
            allowInactive = request.categoryId == session.category.categoryId
        )

        val hall = findActiveHall(
            request.hallId, clubId,
            allowInactive = request.hallId == session.hall.hallId
        )

        val trainer = request.trainerId?.let {
            findActiveTrainer(
                it, clubId,
                allowInactive = it == session.trainer?.trainerId
            )
        }

        val group = request.groupId?.let {
            findActiveGroup(
                it, clubId,
                allowInactive = it == session.group?.groupId
            )
        }

        validateGroupRelations(
            group = group,
            direction = direction,
            trainer = trainer
        )

        validateCapacity(
            capacity = request.capacity,
            hall = hall
        )

        validateUpdateConflicts(
            clubId = clubId,
            sessionId = sessionId,
            hallId = requireNotNull(hall.hallId),
            trainerId = trainer?.trainerId,
            startAt = request.startAt,
            endAt = request.endAt
        )

        session.group = group
        session.direction = direction
        session.category = category
        session.trainer = trainer
        session.hall = hall

        session.startAt = request.startAt
        session.endAt = request.endAt

        session.capacity = request.capacity

        session.comment = request.comment
            ?.trim()
            ?.takeIf { it.isNotEmpty() }

        session.updatedAt = OffsetDateTime.now()

        return sessionRepository
            .save(session)
            .toResponse()
    }

    // =========================================================
    // UPDATE TYPE
    // =========================================================
    @Transactional
    fun updateSessionType(
        jwt: Jwt,
        sessionId: Long,
        request: UpdateSessionTypeRequest
    ): SessionResponse {

        val clubId = getCurrentClubId(jwt)

        val session = sessionRepository.findLockedBySessionIdAndClubClubId(sessionId, clubId)
            ?: throw NoSuchElementException("Заняття не знайдено")

        if (session.type == request.type) {
            return session.toResponse()
        }

        when (request.type) {

            SessionType.PLANNED -> {
                throw ConflictException(
                    "Неможливо повернути заняття у статус PLANNED"
                )
            }

            SessionType.CANCELLED -> {

                if (session.type != SessionType.PLANNED) {
                    throw ConflictException(
                        "Скасувати можна лише заплановане заняття"
                    )
                }

                if (attendanceRepository.existsBySessionSessionId(sessionId)) {
                    throw ConflictException("Не можна скасувати заняття із зареєстрованою відвідуваністю")
                }

                session.type = SessionType.CANCELLED
                session.closedAt = null
            }

            SessionType.COMPLETED -> {

                /*
                 * Поки НЕ закриваємо заняття через цей метод.
                 *
                 * Завершення заняття пізніше буде окремою
                 * операцією closeSession(...), тому що вона
                 * повинна атомарно:
                 *
                 * - зафіксувати attendance;
                 * - перевірити сертифікати;
                 * - списати заняття;
                 * - оновити lastVisit;
                 * - оновити countOfVisits;
                 * - встановити COMPLETED;
                 * - встановити closedAt.
                 */

                throw ConflictException(
                    "Для завершення заняття використовується окрема операція закриття"
                )
            }
        }

        session.updatedAt = OffsetDateTime.now()

        return sessionRepository
            .save(session)
            .toResponse()
    }

    // =========================================================
    // DELETE
    // =========================================================
    @Transactional
    fun deleteSession(
        jwt: Jwt,
        sessionId: Long
    ) {
        val clubId = getCurrentClubId(jwt)

        val session = sessionRepository.findLockedBySessionIdAndClubClubId(sessionId, clubId)
            ?: throw NoSuchElementException("Заняття не знайдено")

        if (session.type == SessionType.COMPLETED) {
            throw ConflictException(
                "Завершене заняття неможливо видалити"
            )
        }

        val hasBookings =
            bookingRepository.existsBySessionSessionId(
                sessionId
            )

        if (hasBookings) {
            throw ConflictException(
                "Неможливо видалити заняття, оскільки " +
                        "для нього існують бронювання, " +
                        "зокрема скасовані"
            )
        }

        val hasAttendance =
            attendanceRepository.existsBySessionSessionId(
                sessionId
            )

        if (hasAttendance) {
            throw ConflictException(
                "Неможливо видалити заняття, " +
                        "для якого вже зареєстровано відвідування"
            )
        }

        sessionRepository.delete(session)
    }


    // =========================================================
    // CURRENT CLUB
    // =========================================================
    private fun getCurrentClubId(
        jwt: Jwt
    ): Long {

        val user = currentUserService.requireTrainerOrAdmin(jwt)

        return user.club?.clubId
            ?: throw AccessDeniedException(
                "Користувач не прив'язаний до спортивного клубу"
            )
    }

    // =========================================================
    // FIND SESSION
    // =========================================================
    private fun findSession(
        sessionId: Long,
        clubId: Long
    ): Session {

        return sessionRepository
            .findBySessionIdAndClubClubId(
                sessionId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Заняття не знайдено"
            )
    }

    // =========================================================
    // FIND ACTIVE GROUP
    // =========================================================
    private fun findActiveGroup(
        groupId: Long,
        clubId: Long,
        allowInactive: Boolean = false
    ): Group {

        val group = groupRepository
            .findByGroupIdAndClubClubId(
                groupId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Групу не знайдено"
            )

        if (!allowInactive && !group.status) {
            throw ConflictException(
                "Неможливо створити заняття для неактивної групи"
            )
        }

        return group
    }

    // =========================================================
    // FIND ACTIVE DIRECTION
    // =========================================================
    private fun findActiveDirection(
        directionId: Long,
        clubId: Long,
        allowInactive: Boolean = false
    ): Direction {

        val direction = directionRepository
            .findByDirectionIdAndClubClubId(
                directionId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Напрямок не знайдено"
            )

        if (!allowInactive && !direction.status) {
            throw ConflictException(
                "Неможливо використати неактивний напрямок"
            )
        }

        return direction
    }

    // =========================================================
    // FIND ACTIVE CATEGORY
    // =========================================================
    private fun findActiveCategory(
        categoryId: Long,
        clubId: Long,
        allowInactive: Boolean = false
    ): Category {

        val category = categoryRepository
            .findByCategoryIdAndClubClubId(
                categoryId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Категорію не знайдено"
            )

        if (!allowInactive && !category.status) {
            throw ConflictException(
                "Неможливо використати неактивну категорію"
            )
        }

        return category
    }

    // =========================================================
    // FIND ACTIVE TRAINER
    // =========================================================
    private fun findActiveTrainer(
        trainerId: Long,
        clubId: Long,
        allowInactive: Boolean = false
    ): Trainer {

        val trainer = trainerRepository
            .findByTrainerIdAndUserClubClubId(
                trainerId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Тренера не знайдено"
            )

        val trainerUser = trainer.user
            ?: throw IllegalStateException(
                "Тренер не прив'язаний до користувача"
            )

        if (!allowInactive && !trainerUser.status) {
            throw ConflictException(
                "Неможливо призначити неактивного тренера"
            )
        }

        return trainer
    }

    // =========================================================
    // FIND ACTIVE HALL
    // =========================================================
    private fun findActiveHall(
        hallId: Long,
        clubId: Long,
        allowInactive: Boolean = false
    ): Hall {

        val hall = hallRepository
            .findByHallIdAndClubClubId(
                hallId,
                clubId
            )
            ?: throw NoSuchElementException(
                "Зал не знайдено"
            )

        if (!allowInactive && !hall.status) {
            throw ConflictException(
                "Неможливо використати неактивний зал"
            )
        }

        return hall
    }

    // =========================================================
    // GROUP RELATIONS
    // =========================================================
    private fun validateGroupRelations(
        group: Group?,
        direction: Direction,
        trainer: Trainer?
    ) {

        if (group == null) {
            return
        }

        val groupDirectionId =
            requireNotNull(group.direction.directionId)

        val directionId =
            requireNotNull(direction.directionId)

        if (groupDirectionId != directionId) {
            throw ConflictException(
                "Напрямок заняття повинен відповідати напрямку групи"
            )
        }

        if (trainer == null) {
            throw ConflictException(
                "Для групового заняття необхідно обрати тренера"
            )
        }

        if (group.trainer.trainerId != trainer.trainerId) {
            throw ConflictException(
                "Тренер заняття повинен відповідати тренеру групи"
            )
        }
    }

    // =========================================================
    // CAPACITY
    // =========================================================
    private fun validateCapacity(
        capacity: Int,
        hall: Hall
    ) {

        if (capacity > hall.capacity) {
            throw ConflictException(
                "Місткість заняття не може перевищувати місткість залу (${hall.capacity})"
            )
        }
    }

    // =========================================================
    // SESSION TIME
    // =========================================================
    private fun validateSessionTime(
        startAt: OffsetDateTime,
        endAt: OffsetDateTime
    ) {

        if (!endAt.isAfter(startAt)) {
            throw IllegalArgumentException(
                "Час завершення заняття повинен бути пізніше часу початку"
            )
        }
    }

    // =========================================================
    // DATE RANGE
    // =========================================================
    private fun validateDateRange(
        from: OffsetDateTime,
        to: OffsetDateTime
    ) {

        if (!to.isAfter(from)) {
            throw IllegalArgumentException(
                "Кінцева дата повинна бути пізніше початкової"
            )
        }
    }

    // =========================================================
    // CREATE CONFLICTS
    // =========================================================
    private fun validateCreateConflicts(
        clubId: Long,
        hallId: Long,
        trainerId: Long?,
        startAt: OffsetDateTime,
        endAt: OffsetDateTime
    ) {

        val hallConflict =
            sessionRepository.existsHallConflict(
                clubId = clubId,
                hallId = hallId,
                startAt = startAt,
                endAt = endAt,
                cancelledType = SessionType.CANCELLED
            )

        if (hallConflict) {
            throw ConflictException(
                "У вибраному залі вже заплановане інше заняття на цей час"
            )
        }

        if (trainerId != null) {

            val trainerConflict =
                sessionRepository.existsTrainerConflict(
                    clubId = clubId,
                    trainerId = trainerId,
                    startAt = startAt,
                    endAt = endAt,
                    cancelledType = SessionType.CANCELLED
                )

            if (trainerConflict) {
                throw ConflictException(
                    "У тренера вже заплановане інше заняття на цей час"
                )
            }
        }
    }

    // =========================================================
    // UPDATE CONFLICTS
    // =========================================================
    private fun validateUpdateConflicts(
        clubId: Long,
        sessionId: Long,
        hallId: Long,
        trainerId: Long?,
        startAt: OffsetDateTime,
        endAt: OffsetDateTime
    ) {

        val hallConflict =
            sessionRepository
                .existsHallConflictExcludingSession(
                    clubId = clubId,
                    hallId = hallId,
                    sessionId = sessionId,
                    startAt = startAt,
                    endAt = endAt,
                    cancelledType = SessionType.CANCELLED
                )

        if (hallConflict) {
            throw ConflictException(
                "У вибраному залі вже заплановане інше заняття на цей час"
            )
        }

        if (trainerId != null) {

            val trainerConflict =
                sessionRepository
                    .existsTrainerConflictExcludingSession(
                        clubId = clubId,
                        trainerId = trainerId,
                        sessionId = sessionId,
                        startAt = startAt,
                        endAt = endAt,
                        cancelledType = SessionType.CANCELLED
                    )

            if (trainerConflict) {
                throw ConflictException(
                    "У тренера вже заплановане інше заняття на цей час"
                )
            }
        }
    }

    // =========================================================
    // COMPLETE SESSION
    // =========================================================
    @Transactional
    fun completeSession(
        jwt: Jwt,
        sessionId: Long
    ): SessionResponse {

        // Завершувати заняття може виключно ADMIN.
        val admin = currentUserService.requireAdmin(jwt)
        val clubId = admin.club?.clubId
            ?: throw AccessDeniedException("Користувач не прив'язаний до спортивного клубу")

        val session = sessionRepository.findLockedBySessionIdAndClubClubId(sessionId, clubId)
            ?: throw NoSuchElementException("Заняття не знайдено")

        // -----------------------------------------------------
        // VALIDATE SESSION STATE
        // -----------------------------------------------------
        when (session.type) {

            SessionType.COMPLETED -> {
                throw ConflictException(
                    "Заняття вже завершено"
                )
            }

            SessionType.CANCELLED -> {
                throw ConflictException(
                    "Неможливо завершити скасоване заняття"
                )
            }

            SessionType.PLANNED -> {
                // Можна завершувати.
            }
        }

        /*
         * Не дозволяємо завершувати заняття,
         * яке ще не почалося.
         *
         * Після початку заняття лише адміністратор
         * може завершити його вручну.
         */
        if (session.startAt.isAfter(OffsetDateTime.now())) {
            throw ConflictException(
                "Неможливо завершити заняття, яке ще не розпочалося"
            )
        }

        // -----------------------------------------------------
        // ACTIVE BOOKINGS
        // -----------------------------------------------------
        val bookings =
            bookingRepository
                .findAllBySessionSessionIdAndTypeOrderByClientUserLastNameAsc(
                    sessionId,
                    BookingType.BOOKED
                )

        // -----------------------------------------------------
        // VALIDATE CERTIFICATES AND REGISTER ONLY MISSING ATTENDANCE
        // -----------------------------------------------------
        // Already registered attendance must not be charged again.
        val pendingBookings = bookings.filter { booking ->
            val clientId = booking.client?.clientId
                ?: throw IllegalStateException("Бронювання не прив'язане до клієнта")
            !attendanceRepository.existsBySessionSessionIdAndClientClientId(sessionId, clientId)
        }

        pendingBookings.forEach { booking ->
            val client = booking.client
                ?: throw IllegalStateException("Бронювання не прив'язане до клієнта")
            val certificateId = booking.certificate?.certificateId
                ?: run {
                    val user = client.user
                        ?: throw IllegalStateException("Клієнт не має користувача")
                    throw ConflictException(
                        "Для клієнта ${user.lastName} ${user.firstName} не обрано сертифікат"
                    )
                }

            attendanceService.registerAttendanceForSessionCompletion(
                session = session,
                clientId = client.clientId,
                clubId = clubId,
                certificateId = certificateId
            )
        }

        // -----------------------------------------------------
        // COMPLETE SESSION
        // -----------------------------------------------------
        session.type = SessionType.COMPLETED
        session.closedAt = OffsetDateTime.now()
        session.updatedAt = OffsetDateTime.now()

        return sessionRepository
            .save(session)
            .toResponse()
    }

    // =========================================================
    // RESPONSE
    // =========================================================
    private fun Session.toResponse(): SessionResponse {

        val group = group
        val trainer = trainer

        val trainerUser = trainer?.user

        return SessionResponse(
            sessionId = requireNotNull(sessionId),

            groupId = group?.groupId,
            groupTitle = group?.title,

            directionId =
                requireNotNull(direction.directionId),
            directionTitle =
                direction.title,

            categoryId =
                requireNotNull(category.categoryId),
            categoryTitle =
                category.title,

            trainerId =
                trainer?.trainerId,
            trainerFirstName =
                trainerUser?.firstName,
            trainerLastName =
                trainerUser?.lastName,

            hallId =
                requireNotNull(hall.hallId),
            hallTitle =
                hall.title,

            startAt = startAt,
            endAt = endAt,

            capacity = capacity,

            type = type,

            comment = comment,

            createdAt = createdAt,
            updatedAt = updatedAt,

            closedAt = closedAt
        )
    }
}
