package com.cineplex.service;

import com.cineplex.dto.staff.*;
import com.cineplex.entity.*;
import com.cineplex.entity.enums.*;
import com.cineplex.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
@DirtiesContext
class StaffServiceTest {

    @Autowired
    private StaffService staffService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Test
    @DisplayName("Verify POS cash checkout calculates change and marks booking CONFIRMED")
    void testCheckoutCashSuccess() {
        User staff = userRepository.findByEmail("staff@cineplex.vn").orElseThrow();
        Showtime showtime = showtimeRepository.findAll().getFirst();
        List<Seat> availableSeats = seatRepository.findByRoomId(showtime.getRoom().getId());
        Seat seat1 = availableSeats.get(0);

        PosCheckoutRequest request = PosCheckoutRequest.builder()
                .showtimeId(showtime.getId())
                .seatIds(List.of(seat1.getId()))
                .paymentMethod(PaymentMethod.CASH)
                .cashReceived(new BigDecimal("500000.00"))
                .customerName("Khách Mua Tại Quầy")
                .build();

        PosCheckoutResponse response = staffService.checkoutCash(staff.getId(), request);

        assertThat(response).isNotNull();
        assertThat(response.getBookingCode()).startsWith("CPX-");
        assertThat(response.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(response.getTickets()).hasSize(1);
        assertThat(response.getTickets().get(0).getQrCodeBase64()).isNotBlank();
        assertThat(response.getCashReceived()).isEqualByComparingTo("500000.00");
        assertThat(response.getChangeAmount()).isGreaterThanOrEqualTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Verify POS transfer checkout generates QR and confirms transfer")
    void testCheckoutTransferAndConfirm() {
        User staff = userRepository.findByEmail("staff@cineplex.vn").orElseThrow();
        Showtime showtime = showtimeRepository.findAll().getFirst();
        List<Seat> availableSeats = seatRepository.findByRoomId(showtime.getRoom().getId());
        Seat seat2 = availableSeats.get(1);

        PosCheckoutRequest request = PosCheckoutRequest.builder()
                .showtimeId(showtime.getId())
                .seatIds(List.of(seat2.getId()))
                .paymentMethod(PaymentMethod.BANK_TRANSFER)
                .customerName("Khách Chuyển Khoản")
                .build();

        PosTransferResponse transferRes = staffService.checkoutTransfer(staff.getId(), request);

        assertThat(transferRes).isNotNull();
        assertThat(transferRes.getBookingCode()).isNotBlank();
        assertThat(transferRes.getQrCodeBase64()).startsWith("data:image/png;base64,");
        assertThat(transferRes.getStatus()).isEqualTo(BookingStatus.PENDING);

        // Staff confirms transfer
        PosCheckoutResponse confirmedRes = staffService.confirmTransfer(staff.getId(), transferRes.getBookingCode());
        assertThat(confirmedRes.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(confirmedRes.getPaymentMethod()).isEqualTo(PaymentMethod.BANK_TRANSFER);
    }

    @Test
    @DisplayName("Verify Ticket QR Check-in lifecycle (Valid -> Duplicate Prevention)")
    void testTicketCheckInLifecycle() {
        User staff = userRepository.findByEmail("staff@cineplex.vn").orElseThrow();
        Showtime showtime = showtimeRepository.findAll().getFirst();
        List<Seat> availableSeats = seatRepository.findByRoomId(showtime.getRoom().getId());
        Seat seat3 = availableSeats.get(2);

        // 1. Buy ticket
        PosCheckoutRequest request = PosCheckoutRequest.builder()
                .showtimeId(showtime.getId())
                .seatIds(List.of(seat3.getId()))
                .paymentMethod(PaymentMethod.CASH)
                .cashReceived(new BigDecimal("200000.00"))
                .build();
        PosCheckoutResponse buyRes = staffService.checkoutCash(staff.getId(), request);
        String qrToken = buyRes.getTickets().get(0).getQrCodeToken();

        // 2. First check-in -> SUCCESS
        TicketCheckInRequest checkInReq = TicketCheckInRequest.builder()
                .tokenOrCode(qrToken)
                .build();
        TicketCheckInResponse checkInRes1 = staffService.checkInTicket(staff.getId(), checkInReq);

        assertThat(checkInRes1.isValid()).isTrue();
        assertThat(checkInRes1.getStatusCode()).isEqualTo("SUCCESS");
        assertThat(checkInRes1.getSeatCode()).isEqualTo(seat3.getSeatCode());

        // 3. Second check-in -> ALREADY_CHECKED_IN
        TicketCheckInResponse checkInRes2 = staffService.checkInTicket(staff.getId(), checkInReq);
        assertThat(checkInRes2.isValid()).isFalse();
        assertThat(checkInRes2.getStatusCode()).isEqualTo("ALREADY_CHECKED_IN");
    }

    @Test
    @DisplayName("Verify check-in with invalid token returns NOT_FOUND")
    void testTicketCheckInNotFound() {
        User staff = userRepository.findByEmail("staff@cineplex.vn").orElseThrow();
        TicketCheckInRequest checkInReq = TicketCheckInRequest.builder()
                .tokenOrCode("NON_EXISTENT_QR_TOKEN_123456")
                .build();

        TicketCheckInResponse res = staffService.checkInTicket(staff.getId(), checkInReq);
        assertThat(res.isValid()).isFalse();
        assertThat(res.getStatusCode()).isEqualTo("NOT_FOUND");
    }

    @Test
    @DisplayName("Verify shift report calculates orders, tickets and revenue")
    void testShiftReport() {
        User staff = userRepository.findByEmail("staff@cineplex.vn").orElseThrow();
        ShiftReportResponse report = staffService.getShiftReport(staff.getId());

        assertThat(report).isNotNull();
        assertThat(report.getStaffEmail()).isEqualTo("staff@cineplex.vn");
        assertThat(report.getTotalOrders()).isGreaterThanOrEqualTo(0);
        assertThat(report.getTotalRevenue()).isGreaterThanOrEqualTo(BigDecimal.ZERO);
    }
}
