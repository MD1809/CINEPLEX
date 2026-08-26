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
    List<Showtime> findByMovieIdAndStartTimeBetween(Long movieId, LocalDateTime start, LocalDateTime end);
    List<Showtime> findByStatus(ShowtimeStatus status);

    @Query("SELECT s FROM Showtime s WHERE s.room.id = :roomId AND s.id <> :excludeId " +
           "AND ((s.startTime < :endTime AND s.endTime > :startTime))")
    List<Showtime> findConflictingShowtimes(
        @Param("roomId") Long roomId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        @Param("excludeId") Long excludeId
    );
}
