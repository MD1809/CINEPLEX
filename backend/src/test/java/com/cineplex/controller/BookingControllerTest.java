package com.cineplex.controller;

import com.cineplex.dto.booking.HoldSeatsRequest;
import com.cineplex.dto.booking.ReleaseSeatsRequest;
import com.cineplex.entity.enums.Role;
import com.cineplex.security.JwtTokenProvider;
import com.cineplex.security.UserPrincipal;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final Long TEST_SHOWTIME_ID = 1L;

    @AfterEach
    void cleanUpRedis() {
        Set<String> keys = redisTemplate.keys("seat_hold:" + TEST_SHOWTIME_ID + ":*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    private String generateCustomerToken() {
        UserPrincipal customer = UserPrincipal.builder()
                .id(2L)
                .email("customer@gmail.com")
                .fullName("Khách Hàng")
                .role(Role.CUSTOMER)
                .build();
        return jwtTokenProvider.generateAccessToken(customer);
    }

    @Test
    @DisplayName("GET /api/v1/showtimes/{id}/seat-map - Public access to room seat layout and status")
    void testGetSeatMapPublic() throws Exception {
        mockMvc.perform(get("/api/v1/showtimes/" + TEST_SHOWTIME_ID + "/seat-map"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.showtimeId", is(TEST_SHOWTIME_ID.intValue())))
                .andExpect(jsonPath("$.data.seats", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.data.roomName", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/v1/bookings/hold-seats - Reject unauthenticated guest")
    void testHoldSeatsUnauthenticated() throws Exception {
        HoldSeatsRequest request = HoldSeatsRequest.builder()
                .showtimeId(TEST_SHOWTIME_ID)
                .seatIds(List.of(5L, 6L))
                .build();

        mockMvc.perform(post("/api/v1/bookings/hold-seats")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/bookings/hold-seats - Authenticated customer locks seats successfully")
    void testHoldSeatsAuthenticatedCustomer() throws Exception {
        String token = generateCustomerToken();

        HoldSeatsRequest request = HoldSeatsRequest.builder()
                .showtimeId(TEST_SHOWTIME_ID)
                .seatIds(List.of(7L, 8L))
                .build();

        mockMvc.perform(post("/api/v1/bookings/hold-seats")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.holdSessionId", notNullValue()))
                .andExpect(jsonPath("$.data.remainingSeconds", is(300)))
                .andExpect(jsonPath("$.data.selectedSeats", hasSize(2)));
    }

    @Test
    @DisplayName("POST /api/v1/bookings/release-seats - Customer releases held seats")
    void testReleaseSeats() throws Exception {
        String token = generateCustomerToken();

        // 1. Hold seats first
        HoldSeatsRequest holdReq = HoldSeatsRequest.builder()
                .showtimeId(TEST_SHOWTIME_ID)
                .seatIds(List.of(9L))
                .build();

        String responseJson = mockMvc.perform(post("/api/v1/bookings/hold-seats")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(holdReq)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String holdSessionId = objectMapper.readTree(responseJson).path("data").path("holdSessionId").asText();

        // 2. Release seat
        ReleaseSeatsRequest releaseReq = ReleaseSeatsRequest.builder()
                .holdSessionId(holdSessionId)
                .showtimeId(TEST_SHOWTIME_ID)
                .seatIds(List.of(9L))
                .build();

        mockMvc.perform(post("/api/v1/bookings/release-seats")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(releaseReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("Hủy giữ ghế")));
    }
}
