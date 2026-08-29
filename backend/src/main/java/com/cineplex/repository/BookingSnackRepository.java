package com.cineplex.repository;

import com.cineplex.entity.BookingSnack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingSnackRepository extends JpaRepository<BookingSnack, Long> {
    List<BookingSnack> findByBookingId(Long bookingId);
    boolean existsBySnackId(Long snackId);
}
