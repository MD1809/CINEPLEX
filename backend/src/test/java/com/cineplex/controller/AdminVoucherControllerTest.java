package com.cineplex.controller;

import com.cineplex.dto.admin.VoucherCreateUpdateRequest;
import com.cineplex.entity.enums.DiscountType;
import com.cineplex.entity.enums.Role;
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
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminVoucherControllerTest {

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
    @DisplayName("GET /api/v1/admin/vouchers - Admin can get all vouchers")
    void testGetAllVouchersForAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/admin/vouchers")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("POST /api/v1/admin/vouchers - Admin can create percentage voucher")
    void testCreatePercentageVoucher() throws Exception {
        VoucherCreateUpdateRequest request = VoucherCreateUpdateRequest.builder()
                .code("SUPER25")
                .description("Giảm 25% tối đa 50.000đ cho đơn từ 150.000đ")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("25.00"))
                .minOrderAmount(new BigDecimal("150000.00"))
                .maxDiscountAmount(new BigDecimal("50000.00"))
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusDays(30))
                .usageLimit(500)
                .isActive(true)
                .build();

        mockMvc.perform(post("/api/v1/admin/vouchers")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.code", is("SUPER25")))
                .andExpect(jsonPath("$.data.discountType", is("PERCENTAGE")));
    }

    @Test
    @DisplayName("POST /api/v1/admin/vouchers - Reject when startDate is after endDate")
    void testCreateVoucherInvalidDates() throws Exception {
        VoucherCreateUpdateRequest request = VoucherCreateUpdateRequest.builder()
                .code("INVALIDDATE")
                .description("Invalid Date Voucher")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(new BigDecimal("20000.00"))
                .startDate(LocalDateTime.now().plusDays(10))
                .endDate(LocalDateTime.now().plusDays(5)) // before start date
                .usageLimit(100)
                .isActive(true)
                .build();

        mockMvc.perform(post("/api/v1/admin/vouchers")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/v1/admin/vouchers/{id} - Admin can delete voucher")
    void testDeleteVoucher() throws Exception {
        VoucherCreateUpdateRequest request = VoucherCreateUpdateRequest.builder()
                .code("TEMPDELETE")
                .description("Voucher to delete")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(new BigDecimal("10000.00"))
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusDays(7))
                .usageLimit(50)
                .isActive(true)
                .build();

        String response = mockMvc.perform(post("/api/v1/admin/vouchers")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(response).path("data").path("id").asLong();

        mockMvc.perform(delete("/api/v1/admin/vouchers/" + id)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    @DisplayName("POST /api/v1/admin/vouchers - Customer is forbidden")
    void testCustomerForbidden() throws Exception {
        VoucherCreateUpdateRequest request = VoucherCreateUpdateRequest.builder()
                .code("HACKVOUCHER")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("100"))
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusDays(30))
                .usageLimit(1000)
                .build();

        mockMvc.perform(post("/api/v1/admin/vouchers")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
