package com.cineplex.service.impl;

import com.cineplex.dto.booking.BookingDetailResponse;
import com.cineplex.dto.booking.BookingSnackDetailDto;
import com.cineplex.dto.booking.TicketDetailDto;
import com.cineplex.entity.*;
import com.cineplex.exception.ResourceNotFoundException;
import com.cineplex.repository.BookingRepository;
import com.cineplex.repository.BookingSnackRepository;
import com.cineplex.repository.PaymentRepository;
import com.cineplex.repository.TicketRepository;
import com.cineplex.service.CustomerBookingService;
import com.cineplex.service.QrCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerBookingServiceImpl implements CustomerBookingService {

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final BookingSnackRepository bookingSnackRepository;
    private final PaymentRepository paymentRepository;
    private final QrCodeService qrCodeService;

    @Override
    @Transactional(readOnly = true)
    public List<BookingDetailResponse> getCustomerBookings(Long userId) {
        log.info("Fetching customer booking history for user ID: {}", userId);
        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return bookings.stream()
                .map(this::mapToDetailResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingDetailResponse getBookingDetail(Long userId, String bookingCode) {
        log.info("Fetching booking detail for code: {} and user ID: {}", bookingCode, userId);
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng mã: " + bookingCode));

        return mapToDetailResponse(booking);
    }

    private BookingDetailResponse mapToDetailResponse(Booking booking) {
        Showtime showtime = booking.getShowtime();
        Movie movie = showtime.getMovie();
        Room room = showtime.getRoom();
        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);

        List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
        List<TicketDetailDto> ticketDtos = new ArrayList<>();
        for (Ticket t : tickets) {
            String qrBase64 = qrCodeService.generateQrCodeBase64(t.getQrCodeToken(), 250, 250);
            ticketDtos.add(TicketDetailDto.builder()
                    .id(t.getId())
                    .ticketCode(t.getTicketCode())
                    .qrCodeToken(t.getQrCodeToken())
                    .qrCodeBase64(qrBase64)
                    .seatCode(t.getSeat().getSeatCode())
                    .seatType(t.getSeat().getSeatType() != null ? t.getSeat().getSeatType().getName() : "STANDARD")
                    .price(t.getPrice())
                    .isCheckedIn(t.getIsCheckedIn())
                    .checkedInAt(t.getCheckedInAt())
                    .build());
        }

        List<BookingSnack> snacks = bookingSnackRepository.findByBookingId(booking.getId());
        List<BookingSnackDetailDto> snackDtos = snacks.stream()
                .map(s -> BookingSnackDetailDto.builder()
                        .snackName(s.getSnack().getName())
                        .quantity(s.getQuantity())
                        .unitPrice(s.getUnitPrice())
                        .totalPrice(s.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        return BookingDetailResponse.builder()
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .movieTitle(movie.getTitle())
                .moviePosterUrl(movie.getPosterUrl())
                .movieAgeRating(movie.getAgeRating() != null ? movie.getAgeRating().name() : "P")
                .durationMinutes(movie.getDurationMinutes())
                .roomName(room.getName())
                .screenType(room.getScreenType() != null ? room.getScreenType().name() : "STANDARD_2D")
                .startTime(showtime.getStartTime())
                .endTime(showtime.getEndTime())
                .status(booking.getStatus())
                .channel(booking.getChannel())
                .totalAmount(booking.getTotalAmount())
                .discountAmount(booking.getDiscountAmount())
                .finalAmount(booking.getFinalAmount())
                .voucherCode(booking.getVoucher() != null ? booking.getVoucher().getCode() : null)
                .paymentMethod(payment != null ? payment.getPaymentMethod() : null)
                .paymentStatus(payment != null ? payment.getStatus() : null)
                .paidAt(payment != null ? payment.getPaidAt() : null)
                .createdAt(booking.getCreatedAt())
                .tickets(ticketDtos)
                .snacks(snackDtos)
                .build();
    }
}
