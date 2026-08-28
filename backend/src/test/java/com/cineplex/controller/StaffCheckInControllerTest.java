package com.cineplex.controller;

import com.cineplex.dto.staff.PosCheckoutRequest;
import com.cineplex.dto.staff.PosCheckoutResponse;
import com.cineplex.dto.staff.TicketCheckInRequest;
import com.cineplex.entity.Seat;
import com.cineplex.entity.Showtime;
import com.cineplex.entity.User;
import com.cineplex.entity.enums.PaymentMethod;
import com.cineplex.repository.SeatRepository;
import com.cineplex.repository.ShowtimeRepository;
import com.cineplex.repository.UserRepository;
import com.cineplex.security.JwtTokenProvider;
import com.cineplex.security.UserPrincipal;
import com.cineplex.service.StaffService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class StaffCheckInControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private StaffService staffService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Autowired
    private SeatRepository seatRepository;

    private String getStaffToken() {
        User staff = userRepository.findByEmail("staff@cineplex.vn").orElseThrow();
        UserPrincipal principal = UserPrincipal.create(staff);
        return jwtTokenProvider.generateAccessToken(principal);
    }

    private String getCustomerToken() {
        User customer = userRepository.findByEmail("customer@gmail.com").orElseThrow();
        UserPrincipal principal = UserPrincipal.create(customer);
        return jwtTokenProvider.generateAccessToken(principal);
    }

    @Test
    @DisplayName("POST /api/v1/staff/tickets/check-in - Valid QR Token returns 200 with ticket and seat details")
    void testCheckInWithValidQrToken() throws Exception {
        User staff = userRepository.findByEmail("staff@cineplex.vn").orElseThrow();
        Showtime showtime = showtimeRepository.findAll().getFirst();
        List<Seat> availableSeats = seatRepository.findByRoomId(showtime.getRoom().getId());
        Seat testSeat = availableSeats.get(0);

        // 1. Create a confirmed ticket at POS
        PosCheckoutRequest buyReq = PosCheckoutRequest.builder()
                .showtimeId(showtime.getId())
                .seatIds(List.of(testSeat.getId()))
                .paymentMethod(PaymentMethod.CASH)
                .cashReceived(new BigDecimal("200000.00"))
                .customerName("Khách Check-In Test")
                .build();
        PosCheckoutResponse buyRes = staffService.checkoutCash(staff.getId(), buyReq);
        String qrToken = buyRes.getTickets().get(0).getQrCodeToken();

        // 2. Scan and check in with Staff token
        TicketCheckInRequest checkInReq = TicketCheckInRequest.builder()
                .tokenOrCode(qrToken)
                .build();

        mockMvc.perform(post("/api/v1/staff/tickets/check-in")
                        .header("Authorization", "Bearer " + getStaffToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkInReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.valid", is(true)))
                .andExpect(jsonPath("$.data.seatCode", is(testSeat.getSeatCode())))
                .andExpect(jsonPath("$.data.movieTitle", is(showtime.getMovie().getTitle())))
                .andExpect(jsonPath("$.data.roomName", is(showtime.getRoom().getName())))
                .andExpect(jsonPath("$.data.staffName", is(staff.getFullName())))
                .andExpect(jsonPath("$.data.checkedInAt", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/v1/staff/tickets/check-in - Duplicate check-in with same QR token returns valid: false")
    void testCheckInDuplicateQrToken() throws Exception {
        User staff = userRepository.findByEmail("staff@cineplex.vn").orElseThrow();
        Showtime showtime = showtimeRepository.findAll().getFirst();
        List<Seat> availableSeats = seatRepository.findByRoomId(showtime.getRoom().getId());
        Seat testSeat = availableSeats.get(1);

        // 1. Create ticket
        PosCheckoutRequest buyReq = PosCheckoutRequest.builder()
                .showtimeId(showtime.getId())
                .seatIds(List.of(testSeat.getId()))
                .paymentMethod(PaymentMethod.CASH)
                .cashReceived(new BigDecimal("200000.00"))
                .build();
        PosCheckoutResponse buyRes = staffService.checkoutCash(staff.getId(), buyReq);
        String qrToken = buyRes.getTickets().get(0).getQrCodeToken();

        // 2. First check-in -> valid
        TicketCheckInRequest checkInReq = TicketCheckInRequest.builder()
                .tokenOrCode(qrToken)
                .build();

        mockMvc.perform(post("/api/v1/staff/tickets/check-in")
                        .header("Authorization", "Bearer " + getStaffToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkInReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.valid", is(true)));

        // 3. Second check-in -> already checked in (valid: false)
        mockMvc.perform(post("/api/v1/staff/tickets/check-in")
                        .header("Authorization", "Bearer " + getStaffToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkInReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.valid", is(false)))
                .andExpect(jsonPath("$.data.message", containsString("CHECK-IN")));
    }

    @Test
    @DisplayName("POST /api/v1/staff/tickets/check-in - Fallback manual check-in by ticket code string succeeds")
    void testCheckInWithTicketCodeString() throws Exception {
        User staff = userRepository.findByEmail("staff@cineplex.vn").orElseThrow();
        Showtime showtime = showtimeRepository.findAll().getFirst();
        List<Seat> availableSeats = seatRepository.findByRoomId(showtime.getRoom().getId());
        Seat testSeat = availableSeats.get(2);

        PosCheckoutRequest buyReq = PosCheckoutRequest.builder()
                .showtimeId(showtime.getId())
                .seatIds(List.of(testSeat.getId()))
                .paymentMethod(PaymentMethod.CASH)
                .cashReceived(new BigDecimal("200000.00"))
                .build();
        PosCheckoutResponse buyRes = staffService.checkoutCash(staff.getId(), buyReq);
        String ticketCode = buyRes.getTickets().get(0).getTicketCode();

        TicketCheckInRequest checkInReq = TicketCheckInRequest.builder()
                .tokenOrCode(ticketCode)
                .build();

        mockMvc.perform(post("/api/v1/staff/tickets/check-in")
                        .header("Authorization", "Bearer " + getStaffToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkInReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.valid", is(true)))
                .andExpect(jsonPath("$.data.seatCode", is(testSeat.getSeatCode())));
    }

    @Test
    @DisplayName("POST /api/v1/staff/tickets/check-in - Non-existent QR token returns valid: false")
    void testCheckInWithInvalidToken() throws Exception {
        TicketCheckInRequest checkInReq = TicketCheckInRequest.builder()
                .tokenOrCode("INVALID_RANDOM_QR_TOKEN_123456789")
                .build();

        mockMvc.perform(post("/api/v1/staff/tickets/check-in")
                        .header("Authorization", "Bearer " + getStaffToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkInReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.valid", is(false)))
                .andExpect(jsonPath("$.data.message", containsString("Không tìm thấy")));
    }

    @Test
    @DisplayName("POST /api/v1/staff/tickets/check-in - Customer role is Forbidden (403)")
    void testCheckInForbiddenForCustomer() throws Exception {
        TicketCheckInRequest checkInReq = TicketCheckInRequest.builder()
                .tokenOrCode("ANY_TOKEN")
                .build();

        mockMvc.perform(post("/api/v1/staff/tickets/check-in")
                        .header("Authorization", "Bearer " + getCustomerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(checkInReq)))
                .andExpect(status().isForbidden());
    }
}
