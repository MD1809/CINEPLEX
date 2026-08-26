package com.cineplex.repository;

import com.cineplex.entity.Showtime;
import com.cineplex.entity.enums.ShowtimeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByMovieId(Long movieId);
    List<Showtime> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Showtime> findByMovieIdAndStartTimeBetween(Long movieId, LocalDateTime start, LocalDateTime end);
    List<Showtime> findByRoomIdAndStartTimeBetween(Long roomId, LocalDateTime start, LocalDateTime end);
    List<Showtime> findByStatus(ShowtimeStatus status);

    @Query("SELECT s FROM Showtime s WHERE s.room.id = :roomId " +
           "AND (:excludeId IS NULL OR s.id <> :excludeId) " +
           "AND s.status <> com.cineplex.entity.enums.ShowtimeStatus.CANCELLED " +
           "AND (s.startTime < :occupiedUntil AND :startTime < s.endTime)")
    List<Showtime> findConflictingShowtimes(
        @Param("roomId") Long roomId,
        @Param("startTime") LocalDateTime startTime,
        @Param("occupiedUntil") LocalDateTime occupiedUntil,
        @Param("excludeId") Long excludeId
    );
}
