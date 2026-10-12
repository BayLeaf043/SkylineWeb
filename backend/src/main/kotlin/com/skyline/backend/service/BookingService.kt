package com.skyline.backend.service

import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import com.skyline.backend.exception.ConflictException
import com.skyline.backend.repository.BookingRepository
import com.skyline.backend.dto.booking.BookingResponse
import com.skyline.backend.dto.booking.CreateBookingRequest
import com.skyline.backend.entity.BookingType
import com.skyline.backend.repository.SessionRepository
import com.skyline.backend.repository.ClientRepository
import com.skyline.backend.entity.Booking
import com.skyline.backend.entity.Session
import com.skyline.backend.entity.Client
import com.skyline.backend.entity.SessionType
import com.skyline.backend.repository.CertificateRepository
import com.skyline.backend.dto.booking.UpdateBookingCertificateRequest
import com.skyline.backend.entity.Certificate
import com.skyline.backend.entity.PurchaseType
import com.skyline.backend.entity.CertificateType
import com.skyline.backend.repository.AttendanceRepository

@Service
class BookingService(
    private val bookingRepository: BookingRepository,
    private val sessionRepository: SessionRepository,
    private val clientRepository: ClientRepository,
    private val attendanceRepository: AttendanceRepository,
    private val certificateRepository: CertificateRepository,
    private val currentUserService: CurrentUserService
) {

    // =========================================================
    // GET ACTIVE BOOKINGS BY SESSION
    // =========================================================
    @Transactional(readOnly = true)
    fun getAllBySession(jwt: Jwt, sessionId: Long): List<BookingResponse> {
        val clubId = getCurrentClubId(jwt)
        findSession(sessionId, clubId)
        return bookingRepository
            .findAllBySessionSessionIdAndTypeOrderByClientUserLastNameAsc(
                sessionId, BookingType.BOOKED
            )
            .map { it.toResponse() }
    }

    // =========================================================
    // CREATE / RESTORE BOOKING
    // =========================================================
    @Transactional
    fun createBooking(
        jwt: Jwt,
        sessionId: Long,
        request: CreateBookingRequest
    ): BookingResponse {
        val clubId = getCurrentClubId(jwt)
        val session = findLockedSession(sessionId, clubId)
        validateSessionAllowsBooking(session)

        val client = findClient(request.clientId, clubId)
        validateClientIsActive(client)

        val existing = bookingRepository.findBySessionSessionIdAndClientClientId(
            sessionId, request.clientId
        )
        if (existing?.type == BookingType.BOOKED) {
            throw ConflictException("Клієнт уже записаний на це заняття")
        }

        validateSessionCapacity(session)

        if (existing != null) {
            existing.type = BookingType.BOOKED
            // Повторний запис потребує нового явного вибору сертифіката.
            existing.certificate = null
            return bookingRepository.save(existing).toResponse()
        }

        return bookingRepository.save(
            Booking(session = session, client = client, type = BookingType.BOOKED)
        ).toResponse()
    }


    @Transactional
    fun updateBookingCertificate(
        jwt: Jwt,
        sessionId: Long,
        bookingId: Long,
        request: UpdateBookingCertificateRequest
    ): BookingResponse {
        val clubId = getCurrentClubId(jwt)
        val session = findLockedSession(sessionId, clubId)
        validateSessionAllowsBooking(session)
        val booking = findBooking(bookingId, sessionId, clubId)

        if (booking.type != BookingType.BOOKED) {
            throw ConflictException("Неможливо змінити сертифікат скасованого бронювання")
        }

        val client = booking.client
            ?: throw IllegalStateException("Бронювання не прив'язане до клієнта")

        val selectedCertificate = request.certificateId?.let { certificateId ->
            val certificate = certificateRepository.findById(certificateId)
                .orElseThrow { NoSuchElementException("Сертифікат не знайдено") }
            validateCertificateForBooking(certificate, client, session, clubId)
            certificate
        }

        val clientId = client.clientId
        if (attendanceRepository.existsBySessionSessionIdAndClientClientId(sessionId, clientId)) {
            throw ConflictException("Сертифікат уже зафіксований у відвідуванні")
        }

        booking.certificate = selectedCertificate
        return bookingRepository.save(booking).toResponse()
    }


    @Transactional
    fun cancelBooking(jwt: Jwt, sessionId: Long, bookingId: Long): BookingResponse {
        val clubId = getCurrentClubId(jwt)
        val session = findLockedSession(sessionId, clubId)
        validateSessionAllowsBooking(session)
        val booking = findBooking(bookingId, sessionId, clubId)

        if (booking.type == BookingType.CANCELLED) {
            throw ConflictException("Бронювання вже скасовано")
        }

        val clientId = booking.client?.clientId
            ?: throw IllegalStateException("Бронювання не прив'язане до клієнта")
        if (attendanceRepository.existsBySessionSessionIdAndClientClientId(sessionId, clientId)) {
            throw ConflictException("Неможливо скасувати бронювання після реєстрації відвідування")
        }

        booking.type = BookingType.CANCELLED
        booking.certificate = null
        return bookingRepository.save(booking).toResponse()
    }

    private fun getCurrentClubId(jwt: Jwt): Long {
        val user = currentUserService.requireTrainerOrAdmin(jwt)
        return user.club?.clubId
            ?: throw AccessDeniedException("Користувач не прив'язаний до спортивного клубу")
    }

    private fun findSession(sessionId: Long, clubId: Long): Session =
        sessionRepository.findBySessionIdAndClubClubId(sessionId, clubId)
            ?: throw NoSuchElementException("Заняття не знайдено")

    private fun findLockedSession(sessionId: Long, clubId: Long): Session =
        sessionRepository.findLockedBySessionIdAndClubClubId(sessionId, clubId)
            ?: throw NoSuchElementException("Заняття не знайдено")

    private fun findClient(clientId: Long, clubId: Long): Client =
        clientRepository.findByClientIdAndUserClubClubId(clientId, clubId)
            ?: throw NoSuchElementException("Клієнта не знайдено")

    private fun findBooking(bookingId: Long, sessionId: Long, clubId: Long): Booking {
        val booking = bookingRepository.findByBookingIdAndSessionClubClubId(bookingId, clubId)
            ?: throw NoSuchElementException("Бронювання не знайдено")
        if (booking.session?.sessionId != sessionId) {
            throw NoSuchElementException("Бронювання не знайдено для цього заняття")
        }
        return booking
    }

    private fun validateSessionAllowsBooking(session: Session) {
        when (session.type) {
            SessionType.PLANNED -> Unit
            SessionType.COMPLETED -> throw ConflictException(
                "Неможливо змінювати бронювання завершеного заняття"
            )
            SessionType.CANCELLED -> throw ConflictException(
                "Неможливо змінювати бронювання скасованого заняття"
            )
        }
    }

    private fun validateClientIsActive(client: Client) {
        val user = client.user
            ?: throw IllegalStateException("Клієнт не прив'язаний до користувача")
        if (!user.status) {
            throw ConflictException("Неможливо записати неактивного клієнта")
        }
    }

    private fun validateSessionCapacity(session: Session) {
        val sessionId = requireNotNull(session.sessionId)
        val bookedCount = bookingRepository.countBySessionSessionIdAndType(
            sessionId, BookingType.BOOKED
        )
        if (bookedCount >= session.capacity.toLong()) {
            throw ConflictException("На занятті немає вільних місць")
        }
    }

    private fun validateCertificateForBooking(
        certificate: Certificate,
        client: Client,
        session: Session,
        clubId: Long
    ) {
        val purchase = certificate.purchase
            ?: throw ConflictException("Сертифікат не прив'язаний до покупки")

        if (purchase.client?.clientId != client.clientId) {
            throw ConflictException("Сертифікат не належить цьому клієнту")
        }
        if (purchase.club?.clubId != clubId) {
            throw ConflictException("Сертифікат належить іншому спортивному клубу")
        }
        if (!purchase.status || purchase.type != PurchaseType.COMPLETED) {
            throw ConflictException("Покупка сертифіката неактивна")
        }
        if (!certificate.status || certificate.type != CertificateType.ACTIVE) {
            throw ConflictException("Сертифікат неактивний")
        }
        if (certificate.usedSessions >= certificate.totalSessions) {
            throw ConflictException("У сертифікаті не залишилося доступних занять")
        }

        val sessionDate = session.startAt.toLocalDate()
        if (sessionDate.isBefore(certificate.validFrom) ||
            sessionDate.isAfter(certificate.validTo)
        ) {
            throw ConflictException("Сертифікат не діє на дату цього заняття")
        }

        val service = purchase.service
            ?: throw ConflictException("Для сертифіката не знайдено послугу")
        if (service.category?.categoryId != session.category.categoryId) {
            throw ConflictException("Сертифікат не підходить для категорії цього заняття")
        }
        if (service.direction?.directionId != session.direction.directionId) {
            throw ConflictException("Сертифікат не підходить для напрямку цього заняття")
        }
    }

    private fun Booking.toResponse(): BookingResponse {
        val bookingSession = session
            ?: throw IllegalStateException("Бронювання не прив'язане до заняття")
        val bookingClient = client
            ?: throw IllegalStateException("Бронювання не прив'язане до клієнта")
        val user = bookingClient.user
            ?: throw IllegalStateException("Клієнт не прив'язаний до користувача")

        return BookingResponse(
            bookingId = bookingId,
            sessionId = requireNotNull(bookingSession.sessionId),
            clientId = bookingClient.clientId,
            clientFirstName = user.firstName,
            clientLastName = user.lastName,
            clientPhone = user.phone,
            certificateId = certificate?.certificateId,
            type = type,
            createdAt = createdAt
        )
    }
}

