package com.cineplex.controller;

import com.cineplex.dto.admin.RoomCreateUpdateRequest;
import com.cineplex.dto.room.SeatBatchUpdateRequest;
import com.cineplex.entity.enums.Role;
import com.cineplex.entity.enums.RoomStatus;
import com.cineplex.entity.enums.ScreenType;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminRoomControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String getAdminToken() {
        UserPrincipal admin = UserPrincipal.builder()
                .id(1L)
                .email("admin@cineplex.vn")
                .fullName("Quản Trị Viên")
                .role(Role.ADMIN)
                .build();
        return jwtTokenProvider.generateAccessToken(admin);
    }

    private String getCustomerToken() {
        UserPrincipal customer = UserPrincipal.builder()
                .id(2L)
                .email("customer@gmail.com")
                .fullName("Khách Hàng")
                .role(Role.CUSTOMER)
                .build();
        return jwtTokenProvider.generateAccessToken(customer);
    }

    @Test
    @DisplayName("GET /api/v1/rooms - Get all rooms")
    void testGetAllRooms() throws Exception {
        mockMvc.perform(get("/api/v1/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", isA(Iterable.class)));
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
    @DisplayName("POST /api/v1/admin/rooms - Admin creates new room and auto generates seat matrix")
    void testCreateRoomAsAdmin() throws Exception {
        String token = getAdminToken();

        RoomCreateUpdateRequest request = RoomCreateUpdateRequest.builder()
                .name("Phòng chiếu VIP Gold Class")
                .screenType(ScreenType.FOUR_DX)
                .totalRows(4)
                .totalColumns(6)
                .status(RoomStatus.ACTIVE)
                .build();

        mockMvc.perform(post("/api/v1/admin/rooms")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Phòng chiếu VIP Gold Class")))
                .andExpect(jsonPath("$.data.totalRows", is(4)))
                .andExpect(jsonPath("$.data.totalColumns", is(6)))
                .andExpect(jsonPath("$.data.seats", hasSize(24)));
    }

    @Test
    @DisplayName("POST /api/v1/admin/rooms - Reject Customer from creating room")
    void testCreateRoomAsCustomerForbidden() throws Exception {
        String token = getCustomerToken();

        RoomCreateUpdateRequest request = RoomCreateUpdateRequest.builder()
                .name("Hacked Room")
                .screenType(ScreenType.STANDARD_2D)
                .totalRows(2)
                .totalColumns(2)
                .build();

        mockMvc.perform(post("/api/v1/admin/rooms")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PATCH /api/v1/admin/rooms/{id}/status - Admin updates room status")
    void testUpdateRoomStatusAsAdmin() throws Exception {
        String token = getAdminToken();

        mockMvc.perform(patch("/api/v1/admin/rooms/1/status")
                        .param("status", "MAINTENANCE")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("MAINTENANCE")));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/rooms/{id}/seats - Admin batch updates seat types")
    void testBatchUpdateSeatsAsAdmin() throws Exception {
        String token = getAdminToken();

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
}
