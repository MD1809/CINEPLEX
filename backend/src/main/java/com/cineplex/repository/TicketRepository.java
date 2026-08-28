package com.cineplex.repository;

import com.cineplex.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByTicketCode(String ticketCode);
    Optional<Ticket> findByQrCodeToken(String qrCodeToken);
    Optional<Ticket> findByQrCodeTokenOrTicketCode(String qrCodeToken, String ticketCode);
    List<Ticket> findByBookingId(Long bookingId);
    boolean existsByBookingIdAndSeatId(Long bookingId, Long seatId);

    @Query("SELECT t.seat.id FROM Ticket t WHERE t.booking.showtime.id = :showtimeId AND t.booking.status != 'CANCELLED'")
    List<Long> findBookedSeatIdsByShowtimeId(@Param("showtimeId") Long showtimeId);
}
