package com.cineplex.repository;

import com.cineplex.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByRoomIdOrderByRowCodeAscColNumberAsc(Long roomId);
    Optional<Seat> findByRoomIdAndSeatCode(Long roomId, String seatCode);
}
