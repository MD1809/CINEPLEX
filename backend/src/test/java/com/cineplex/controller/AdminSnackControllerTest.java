package com.cineplex.controller;

import com.cineplex.dto.admin.SnackCreateUpdateRequest;
import com.cineplex.entity.enums.Role;
import com.cineplex.entity.enums.SnackCategory;
import com.cineplex.security.JwtTokenProvider;
import com.cineplex.security.UserPrincipal;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminSnackControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String adminToken;
    private String customerToken;

    @BeforeEach
    void setUp() {
        UserPrincipal admin = UserPrincipal.builder()
                .id(1L)
                .email("admin@cineplex.vn")
                .fullName("Quản Trị Viên")
                .role(Role.ADMIN)
                .build();

        UserPrincipal customer = UserPrincipal.builder()
                .id(2L)
                .email("customer@gmail.com")
                .fullName("Khách Hàng")
                .role(Role.CUSTOMER)
                .build();

        adminToken = jwtTokenProvider.generateAccessToken(admin);
        customerToken = jwtTokenProvider.generateAccessToken(customer);
    }

    @Test
    @DisplayName("GET /api/v1/admin/snacks - Admin can get all concessions")
    void testGetAllSnacksForAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/admin/snacks")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("POST /api/v1/admin/snacks - Admin can create a new snack item")
    void testCreateSnackAsAdmin() throws Exception {
        SnackCreateUpdateRequest request = SnackCreateUpdateRequest.builder()
                .name("Bắp Phô Mai Đặc Biệt Test")
                .description("Bắp ngô nổ giòn rụm phủ bột phô mai Cheddar hảo hạng")
                .price(new BigDecimal("79000.00"))
                .imageUrl("https://images.unsplash.com/photo-1578849278619-e73505e9610f")
                .category(SnackCategory.POPCORN)
                .isAvailable(true)
                .build();

        mockMvc.perform(post("/api/v1/admin/snacks")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Bắp Phô Mai Đặc Biệt Test")))
                .andExpect(jsonPath("$.data.category", is("POPCORN")))
                .andExpect(jsonPath("$.data.price", is(79000.00)));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/snacks/{id} - Admin can update snack information")
    void testUpdateSnackAsAdmin() throws Exception {
        SnackCreateUpdateRequest request = SnackCreateUpdateRequest.builder()
                .name("Combo 1 Bắp 1 Nước Update Test")
                .description("Bắp lớn kèm 1 ly nước ngọt 32oz mát lạnh")
                .price(new BigDecimal("95000.00"))
                .category(SnackCategory.COMBO)
                .isAvailable(true)
                .build();

        mockMvc.perform(put("/api/v1/admin/snacks/1")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.price", is(95000.00)));
    }

    @Test
    @DisplayName("PATCH /api/v1/admin/snacks/{id}/availability - Admin can toggle availability")
    void testToggleAvailabilityAsAdmin() throws Exception {
        mockMvc.perform(patch("/api/v1/admin/snacks/1/availability")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("isAvailable", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.isAvailable", is(false)));
    }

    @Test
    @DisplayName("POST /api/v1/admin/snacks - Customer is forbidden")
    void testCreateSnackAsCustomerForbidden() throws Exception {
        SnackCreateUpdateRequest request = SnackCreateUpdateRequest.builder()
                .name("Hacker Snack")
                .price(new BigDecimal("1000.00"))
                .category(SnackCategory.DRINK)
                .build();

        mockMvc.perform(post("/api/v1/admin/snacks")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/snacks/{id} - Admin can delete a snack without booking history")
    void testDeleteSnackWithoutBookings() throws Exception {
        // Create a temporary snack
        SnackCreateUpdateRequest request = SnackCreateUpdateRequest.builder()
                .name("Snack Temp To Delete")
                .price(new BigDecimal("30000.00"))
                .category(SnackCategory.DRINK)
                .isAvailable(true)
                .build();

        String responseStr = mockMvc.perform(post("/api/v1/admin/snacks")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long createdId = objectMapper.readTree(responseStr).path("data").path("id").asLong();

        // Delete it
        mockMvc.perform(delete("/api/v1/admin/snacks/" + createdId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }
}
