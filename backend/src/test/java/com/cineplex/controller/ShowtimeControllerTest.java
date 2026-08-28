package com.cineplex.controller;

import com.cineplex.dto.showtime.ShowtimeCreateRequest;
import com.cineplex.entity.enums.Role;
import com.cineplex.security.JwtTokenProvider;
import com.cineplex.security.UserPrincipal;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ShowtimeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("GET /api/v1/showtimes - Public access to showtime listings")
    void testGetShowtimes() throws Exception {
        mockMvc.perform(get("/api/v1/showtimes")
                        .param("date", LocalDate.now().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("GET /api/v1/showtimes/group-by-movie - Public access to showtimes grouped by movie")
    void testGetShowtimesGroupedByMovie() throws Exception {
        mockMvc.perform(get("/api/v1/showtimes/group-by-movie")
                        .param("date", LocalDate.now().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", isA(Iterable.class)));
    }

    @Test
    @DisplayName("GET /api/v1/showtimes/1 - Get showtime detail by ID")
    void testGetShowtimeById() throws Exception {
        mockMvc.perform(get("/api/v1/showtimes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(1)))
                .andExpect(jsonPath("$.data.basePrice", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/v1/admin/showtimes - Admin schedules showtime on empty future slot")
    void testCreateShowtimeAsAdmin() throws Exception {
        UserPrincipal admin = UserPrincipal.builder()
                .id(1L)
                .email("admin@cineplex.vn")
                .fullName("Quản Trị Viên")
                .role(Role.ADMIN)
                .build();

        String token = jwtTokenProvider.generateAccessToken(admin);

        // Schedule far in future with dynamic offset to guarantee idempotency across multiple test runs
        long dayOffset = 50 + (System.currentTimeMillis() % 10000);
        LocalDateTime futureStart = LocalDate.now().plusDays(dayOffset).atTime(10, 0);

        ShowtimeCreateRequest request = ShowtimeCreateRequest.builder()
                .movieId(1L)
                .roomId(1L)
                .startTime(futureStart)
                .basePrice(new BigDecimal("100000.00"))
                .build();

        mockMvc.perform(post("/api/v1/admin/showtimes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.basePrice", is(100000.00)));
    }

    @Test
    @DisplayName("POST /api/v1/admin/showtimes - Reject regular customer from scheduling showtimes")
    void testCreateShowtimeAsCustomerForbidden() throws Exception {
        UserPrincipal customer = UserPrincipal.builder()
                .id(2L)
                .email("customer@gmail.com")
                .fullName("Khách Hàng")
                .role(Role.CUSTOMER)
                .build();

        String token = jwtTokenProvider.generateAccessToken(customer);

        ShowtimeCreateRequest request = ShowtimeCreateRequest.builder()
                .movieId(1L)
                .roomId(1L)
                .startTime(LocalDateTime.now().plusDays(40).withHour(10).withMinute(0))
                .basePrice(new BigDecimal("100000.00"))
                .build();

        mockMvc.perform(post("/api/v1/admin/showtimes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
