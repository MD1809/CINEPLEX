package com.cineplex.service;

import com.cineplex.dto.booking.BookingDetailResponse;

import java.util.List;

public interface CustomerBookingService {
    List<BookingDetailResponse> getCustomerBookings(Long userId);
    BookingDetailResponse getBookingDetail(Long userId, String bookingCode);
}
