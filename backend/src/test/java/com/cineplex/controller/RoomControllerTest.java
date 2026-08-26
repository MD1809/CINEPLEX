package com.cineplex.controller;

import com.cineplex.dto.room.SeatBatchUpdateRequest;
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

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("GET /api/v1/rooms - Public access to all rooms")
    void testGetAllRooms() throws Exception {
        mockMvc.perform(get("/api/v1/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    @DisplayName("GET /api/v1/rooms/1 - Get room details with seat matrix")
    void testGetRoomById() throws Exception {
        mockMvc.perform(get("/api/v1/rooms/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", containsString("IMAX")))
                .andExpect(jsonPath("$.data.seats", hasSize(60)));
    }

    @Test
    @DisplayName("GET /api/v1/rooms/seat-types - Get all seat types")
    void testGetAllSeatTypes() throws Exception {
        mockMvc.perform(get("/api/v1/rooms/seat-types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(3))));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/rooms/1/seats - Admin batch updates seats successfully")
    void testBatchUpdateSeatsAsAdmin() throws Exception {
        UserPrincipal admin = UserPrincipal.builder()
                .id(1L)
                .email("admin@cineplex.vn")
                .fullName("Quản Trị Viên")
                .role(Role.ADMIN)
                .build();

        String token = jwtTokenProvider.generateAccessToken(admin);

        SeatBatchUpdateRequest request = SeatBatchUpdateRequest.builder()
                .seatIds(List.of(1L, 2L))
                .seatTypeId(2) // VIP
                .isActive(true)
                .build();

        mockMvc.perform(put("/api/v1/admin/rooms/1/seats")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(2)));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/rooms/1/seats - Reject customer from batch updating seats")
    void testBatchUpdateSeatsAsCustomerForbidden() throws Exception {
        UserPrincipal customer = UserPrincipal.builder()
                .id(2L)
                .email("customer@gmail.com")
                .fullName("Khách Hàng")
                .role(Role.CUSTOMER)
                .build();

        String token = jwtTokenProvider.generateAccessToken(customer);

        SeatBatchUpdateRequest request = SeatBatchUpdateRequest.builder()
                .seatIds(List.of(1L))
                .seatTypeId(1)
                .build();

        mockMvc.perform(put("/api/v1/admin/rooms/1/seats")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
