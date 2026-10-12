package com.skyline.backend.repository

import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.Lock
import com.skyline.backend.entity.Session
import com.skyline.backend.entity.SessionType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.OffsetDateTime

interface SessionRepository : JpaRepository<Session, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Session s WHERE s.sessionId = :sessionId AND s.club.clubId = :clubId")
    fun findLockedBySessionIdAndClubClubId(
        @Param("sessionId") sessionId: Long,
        @Param("clubId") clubId: Long
    ): Session?

    fun findBySessionIdAndClubClubId(
        sessionId: Long,
        clubId: Long
    ): Session?

    fun findAllByClubClubIdAndStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(
        clubId: Long,
        from: OffsetDateTime,
        to: OffsetDateTime
    ): List<Session>

    fun findAllByClubClubIdAndTrainerTrainerIdAndStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(
        clubId: Long,
        trainerId: Long,
        from: OffsetDateTime,
        to: OffsetDateTime
    ): List<Session>

    fun findAllByClubClubIdAndGroupGroupIdAndStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(
        clubId: Long,
        groupId: Long,
        from: OffsetDateTime,
        to: OffsetDateTime
    ): List<Session>

    fun findAllByClubClubIdAndHallHallIdAndStartAtGreaterThanEqualAndStartAtLessThanOrderByStartAtAsc(
        clubId: Long,
        hallId: Long,
        from: OffsetDateTime,
        to: OffsetDateTime
    ): List<Session>

    @Query(
        """
        SELECT COUNT(s) > 0
        FROM Session s
        WHERE s.club.clubId = :clubId
          AND s.hall.hallId = :hallId
          AND s.type <> :cancelledType
          AND s.startAt < :endAt
          AND s.endAt > :startAt
        """
    )
    fun existsHallConflict(
        @Param("clubId")
        clubId: Long,

        @Param("hallId")
        hallId: Long,

        @Param("startAt")
        startAt: OffsetDateTime,

        @Param("endAt")
        endAt: OffsetDateTime,

        @Param("cancelledType")
        cancelledType: SessionType
    ): Boolean

    @Query(
        """
        SELECT COUNT(s) > 0
        FROM Session s
        WHERE s.club.clubId = :clubId
          AND s.trainer.trainerId = :trainerId
          AND s.type <> :cancelledType
          AND s.startAt < :endAt
          AND s.endAt > :startAt
        """
    )
    fun existsTrainerConflict(
        @Param("clubId")
        clubId: Long,

        @Param("trainerId")
        trainerId: Long,

        @Param("startAt")
        startAt: OffsetDateTime,

        @Param("endAt")
        endAt: OffsetDateTime,

        @Param("cancelledType")
        cancelledType: SessionType
    ): Boolean


    @Query(
        """
    SELECT COUNT(s) > 0
    FROM Session s
    WHERE s.club.clubId = :clubId
      AND s.hall.hallId = :hallId
      AND s.sessionId <> :sessionId
      AND s.type <> :cancelledType
      AND s.startAt < :endAt
      AND s.endAt > :startAt
    """
    )
    fun existsHallConflictExcludingSession(
        @Param("clubId")
        clubId: Long,

        @Param("hallId")
        hallId: Long,

        @Param("sessionId")
        sessionId: Long,

        @Param("startAt")
        startAt: OffsetDateTime,

        @Param("endAt")
        endAt: OffsetDateTime,

        @Param("cancelledType")
        cancelledType: SessionType
    ): Boolean

    @Query(
        """
    SELECT COUNT(s) > 0
    FROM Session s
    WHERE s.club.clubId = :clubId
      AND s.trainer.trainerId = :trainerId
      AND s.sessionId <> :sessionId
      AND s.type <> :cancelledType
      AND s.startAt < :endAt
      AND s.endAt > :startAt
    """
    )
    fun existsTrainerConflictExcludingSession(
        @Param("clubId")
        clubId: Long,

        @Param("trainerId")
        trainerId: Long,

        @Param("sessionId")
        sessionId: Long,

        @Param("startAt")
        startAt: OffsetDateTime,

        @Param("endAt")
        endAt: OffsetDateTime,

        @Param("cancelledType")
        cancelledType: SessionType
    ): Boolean

    fun existsByCategoryCategoryId(
        categoryId: Long
    ): Boolean

    fun existsByDirectionDirectionId(
        directionId: Long
    ): Boolean

    fun existsByTrainerTrainerId(
        trainerId: Long
    ): Boolean

    fun existsByGroupGroupId(
        groupId: Long
    ): Boolean

    fun existsByHallHallId(
        hallId: Long
    ): Boolean
}
