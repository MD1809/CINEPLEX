package com.cineplex.repository;

import com.cineplex.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByTicketCode(String ticketCode);
    Optional<Ticket> findByQrCodeToken(String qrCodeToken);
    List<Ticket> findByBookingId(Long bookingId);
    boolean existsByBookingIdAndSeatId(Long bookingId, Long seatId);
}
