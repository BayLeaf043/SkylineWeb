package com.skyline.backend.repository

import com.skyline.backend.entity.Client
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface ClientRepository : JpaRepository<Client, Long> {

    fun findAllByUserClubClubId(
        clubId: Long
    ): List<Client>

    fun findByClientIdAndUserClubClubId(
        clientId: Long,
        clubId: Long
    ): Client?

    @Query(
        """
    SELECT c
    FROM Client c
    JOIN c.user u
    WHERE u.club.clubId = :clubId
      AND (
          :search = ''
          OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
          OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
          OR LOWER(CONCAT(u.firstName, ' ', u.lastName))
              LIKE LOWER(CONCAT('%', :search, '%'))
          OR LOWER(CONCAT(u.lastName, ' ', u.firstName))
              LIKE LOWER(CONCAT('%', :search, '%'))
      )
    """
    )
    fun findPageByClubIdAndSearch(
        @Param("clubId")
        clubId: Long,

        @Param("search")
        search: String,

        pageable: Pageable
    ): Page<Client>

}