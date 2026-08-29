package com.cineplex.repository;

import com.cineplex.entity.Booking;
import com.cineplex.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {
    Optional<Booking> findByBookingCode(String bookingCode);
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Booking> findByStaffIdOrderByCreatedAtDesc(Long staffId);
    List<Booking> findByStaffIdAndCreatedAtBetween(Long staffId, LocalDateTime start, LocalDateTime end);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByStatusAndCreatedAtBetween(BookingStatus status, LocalDateTime start, LocalDateTime end);
    List<Booking> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    boolean existsByVoucherId(Long voucherId);
}
