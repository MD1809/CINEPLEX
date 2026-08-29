package com.cineplex.controller;

import com.cineplex.entity.User;
import com.cineplex.repository.UserRepository;
import com.cineplex.security.JwtTokenProvider;
import com.cineplex.security.UserPrincipal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminAnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String getAdminToken() {
        User admin = userRepository.findByEmail("admin@cineplex.vn")
                .orElseThrow(() -> new IllegalStateException("Sample admin seed user not found"));
        UserPrincipal principal = UserPrincipal.create(admin);
        return jwtTokenProvider.generateAccessToken(principal);
    }

    private String getCustomerToken() {
        User customer = userRepository.findByEmail("customer@gmail.com")
                .orElseThrow(() -> new IllegalStateException("Sample customer seed user not found"));
        UserPrincipal principal = UserPrincipal.create(customer);
        return jwtTokenProvider.generateAccessToken(principal);
    }

    @Test
    @DisplayName("Admin get dashboard metrics - Success 200")
    void testGetDashboardMetrics_Success() throws Exception {
        String token = getAdminToken();

        mockMvc.perform(get("/api/v1/admin/analytics/metrics")
                        .param("period", "7days")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalRevenue").exists())
                .andExpect(jsonPath("$.data.totalTicketsSold").exists())
                .andExpect(jsonPath("$.data.totalActiveMovies").exists())
                .andExpect(jsonPath("$.data.roomOccupancyRate").exists());
    }

    @Test
    @DisplayName("Admin get revenue chart - Success 200")
    void testGetRevenueChart_Success() throws Exception {
        String token = getAdminToken();

        mockMvc.perform(get("/api/v1/admin/analytics/revenue-chart")
                        .param("period", "7days")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$.data[0].date").exists())
                .andExpect(jsonPath("$.data[0].totalRevenue").exists());
    }

    @Test
    @DisplayName("Admin get top movies - Success 200")
    void testGetTopMovies_Success() throws Exception {
        String token = getAdminToken();

        mockMvc.perform(get("/api/v1/admin/analytics/top-movies")
                        .param("limit", "5")
                        .param("period", "month")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Admin get payment stats - Success 200")
    void testGetPaymentStats_Success() throws Exception {
        String token = getAdminToken();

        mockMvc.perform(get("/api/v1/admin/analytics/payment-stats")
                        .param("period", "month")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(3)));
    }

    @Test
    @DisplayName("Admin get sold tickets - Success 200")
    void testGetSoldTickets_Success() throws Exception {
        String token = getAdminToken();

        mockMvc.perform(get("/api/v1/admin/analytics/sold-tickets")
                        .param("period", "month")
                        .param("limit", "20")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("Customer access admin analytics - Forbidden 403")
    void testCustomerAccessAnalytics_Forbidden() throws Exception {
        String token = getCustomerToken();

        mockMvc.perform(get("/api/v1/admin/analytics/metrics")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
