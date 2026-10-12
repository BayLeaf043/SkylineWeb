package com.skyline.backend.service

import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import com.skyline.backend.exception.ConflictException
import com.skyline.backend.repository.AttendanceRepository
import com.skyline.backend.repository.SessionRepository
import com.skyline.backend.repository.ClientRepository
import com.skyline.backend.repository.CertificateRepository
import com.skyline.backend.dto.attendance.AttendanceResponse
import com.skyline.backend.dto.attendance.CreateAttendanceRequest
import com.skyline.backend.entity.SessionType
import com.skyline.backend.entity.PurchaseType
import com.skyline.backend.entity.CertificateType
import com.skyline.backend.entity.Attendance
import java.time.OffsetDateTime
import com.skyline.backend.entity.Session
import com.skyline.backend.entity.Certificate

@Service
class AttendanceService(

    private val attendanceRepository: AttendanceRepository,
    private val sessionRepository: SessionRepository,
    private val clientRepository: ClientRepository,
    private val certificateRepository: CertificateRepository,

    private val currentUserService: CurrentUserService

) {

    // =========================================================
    // GET ATTENDANCE BY SESSION
    // =========================================================

    @Transactional(readOnly = true)
    fun getAllBySession(jwt: Jwt, sessionId: Long): List<AttendanceResponse> {
        val clubId = requireCurrentClubId(jwt)
        findSession(sessionId, clubId)
        return attendanceRepository
            .findAllBySessionSessionIdOrderByClientUserLastNameAsc(sessionId)
            .map(::toResponse)
    }

    @Transactional(readOnly = true)
    fun getAllByClient(jwt: Jwt, clientId: Long): List<AttendanceResponse> {
        val clubId = requireCurrentClubId(jwt)
        clientRepository.findByClientIdAndUserClubClubId(clientId, clubId)
            ?: throw NoSuchElementException("Клієнта не знайдено")
        return attendanceRepository
            .findAllByClientClientIdAndSessionClubClubIdOrderBySessionStartAtDesc(clientId, clubId)
            .map(::toResponse)
    }

    @Transactional
    fun createAttendance(
        jwt: Jwt,
        sessionId: Long,
        request: CreateAttendanceRequest
    ): AttendanceResponse {
        val clubId = requireCurrentClubId(jwt)
        val session = sessionRepository.findLockedBySessionIdAndClubClubId(sessionId, clubId)
            ?: throw NoSuchElementException("Заняття не знайдено")
        validateSessionForAttendance(session)
        return registerAttendance(
            session = session,
            clientId = request.clientId ?: throw IllegalArgumentException("Клієнт є обов'язковим"),
            clubId = clubId,
            certificateId = request.certificateId
                ?: throw ConflictException("Необхідно обрати сертифікат для відвідування")
        )
    }

    /** Викликається тільки з транзакційного SessionService.completeSession(). */
    @Transactional
    fun registerAttendanceForSessionCompletion(
        session: Session,
        clientId: Long,
        clubId: Long,
        certificateId: Long
    ): AttendanceResponse {
        if (session.club.clubId != clubId) {
            throw NoSuchElementException("Заняття не знайдено")
        }
        validateSessionForAttendance(session)
        return registerAttendance(session, clientId, clubId, certificateId)
    }

    /** Єдина точка створення відвідування та списання одного заняття. */
    private fun registerAttendance(
        session: Session,
        clientId: Long,
        clubId: Long,
        certificateId: Long
    ): AttendanceResponse {
        val sessionId = requireNotNull(session.sessionId) { "Заняття не має ID" }
        val client = clientRepository.findByClientIdAndUserClubClubId(clientId, clubId)
            ?: throw NoSuchElementException("Клієнта не знайдено")
        val user = client.user ?: throw IllegalStateException("Для клієнта не знайдено користувача")

        if (!user.status) {
            throw ConflictException("Неможливо відмітити неактивного клієнта ${user.firstName} ${user.lastName}")
        }
        if (attendanceRepository.existsBySessionSessionIdAndClientClientId(sessionId, clientId)) {
            throw ConflictException("Відвідування клієнта ${user.firstName} ${user.lastName} вже зафіксовано")
        }

        val certificate = findAndValidateSelectedCertificate(certificateId, clientId, clubId, session)
        certificate.usedSessions += 1
        if (certificate.usedSessions == certificate.totalSessions) {
            certificate.type = CertificateType.USED
        }
        certificateRepository.save(certificate)

        val attendance = attendanceRepository.save(
            Attendance(session = session, client = client, certificate = certificate)
        )
        client.countOfVisits += 1
        if (client.lastVisit == null || session.startAt.isAfter(client.lastVisit)) {
            client.lastVisit = session.startAt
        }
        clientRepository.save(client)
        return toResponse(attendance)
    }

    private fun validateSessionForAttendance(session: Session) {
        when (session.type) {
            SessionType.CANCELLED ->
                throw ConflictException("Неможливо відмітити відвідування скасованого заняття")
            SessionType.COMPLETED ->
                throw ConflictException("Заняття вже завершено. Зміна відвідуваності неможлива")
            SessionType.PLANNED ->
                Unit
        }
        if (session.startAt.isAfter(OffsetDateTime.now())) {
            throw ConflictException("Неможливо відмітити відвідування майбутнього заняття")
        }
    }

    private fun findAndValidateSelectedCertificate(
        certificateId: Long,
        clientId: Long,
        clubId: Long,
        session: Session
    ): Certificate {
        val certificate = certificateRepository.findLockedByCertificateIdAndPurchaseClubClubId(certificateId, clubId)
            ?: throw NoSuchElementException("Сертифікат не знайдено")
        val purchase = certificate.purchase ?: throw IllegalStateException("Сертифікат не прив'язаний до покупки")
        val client = purchase.client ?: throw IllegalStateException("Сертифікат не прив'язаний до клієнта")
        if (client.clientId != clientId) {
            throw ConflictException("Сертифікат не належить цьому клієнту")
        }
        val service = purchase.service ?: throw IllegalStateException("Для сертифіката не знайдено послугу")
        if (!purchase.status || purchase.type != PurchaseType.COMPLETED) {
            throw ConflictException("Покупка сертифіката неактивна")
        }
        if (!certificate.status || certificate.type != CertificateType.ACTIVE) {
            throw ConflictException("Сертифікат неактивний")
        }
        val date = session.startAt.toLocalDate()
        if (date.isBefore(certificate.validFrom) || date.isAfter(certificate.validTo)) {
            throw ConflictException("Сертифікат не діє на дату цього заняття")
        }
        if (certificate.usedSessions >= certificate.totalSessions) {
            throw ConflictException("У сертифікаті не залишилося доступних занять")
        }
        if (service.category?.categoryId != session.category.categoryId) {
            throw ConflictException("Сертифікат не підходить для категорії цього заняття")
        }
        if (service.direction?.directionId != session.direction.directionId) {
            throw ConflictException("Сертифікат не підходить для напрямку цього заняття")
        }
        return certificate
    }

    private fun findSession(sessionId: Long, clubId: Long): Session =
        sessionRepository.findBySessionIdAndClubClubId(sessionId, clubId)
            ?: throw NoSuchElementException("Заняття не знайдено")

    private fun requireCurrentClubId(jwt: Jwt): Long =
        currentUserService.requireTrainerOrAdmin(jwt).club?.clubId
            ?: throw AccessDeniedException("Користувач не прив'язаний до спортивного клубу")

    private fun toResponse(attendance: Attendance): AttendanceResponse {
        val session = attendance.session ?: throw IllegalStateException("Для відвідування не знайдено заняття")
        val client = attendance.client ?: throw IllegalStateException("Для відвідування не знайдено клієнта")
        val user = client.user ?: throw IllegalStateException("Для клієнта не знайдено користувача")
        return AttendanceResponse(
            attendanceId = attendance.attendanceId,
            sessionId = requireNotNull(session.sessionId),
            clientId = client.clientId,
            clientFirstName = user.firstName,
            clientLastName = user.lastName,
            clientPhone = user.phone,
            certificateId = attendance.certificate?.certificateId,
            createdAt = attendance.createdAt
        )
    }
}



