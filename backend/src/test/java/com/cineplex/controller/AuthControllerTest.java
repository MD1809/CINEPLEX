package com.cineplex.controller;

import com.cineplex.dto.auth.LoginRequest;
import com.cineplex.dto.auth.RefreshTokenRequest;
import com.cineplex.dto.auth.RegisterRequest;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("POST /api/v1/auth/register - Register new customer successfully")
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("test.customer@gmail.com")
                .password("Customer@123")
                .fullName("Trần Thị Khách Hàng")
                .phoneNumber("0987654321")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.statusCode", is(201)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.data.user.email", is("test.customer@gmail.com")))
                .andExpect(jsonPath("$.data.user.role", is("CUSTOMER")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - Reject duplicate email")
    void testRegisterDuplicateEmail() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("admin@cineplex.vn") // Already seeded in DB
                .password("Password123")
                .fullName("Quản Trị")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Email đã được sử dụng")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Login admin account successfully")
    void testLoginSuccess() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("admin@cineplex.vn")
                .password("Admin@123")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.user.email", is("admin@cineplex.vn")))
                .andExpect(jsonPath("$.data.user.role", is("ADMIN")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Reject invalid password")
    void testLoginWrongPassword() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("admin@cineplex.vn")
                .password("WrongPass@123")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me - Retrieve current user profile with valid Bearer token")
    void testGetCurrentUserWithToken() throws Exception {
        // Build mock principal for admin
        UserPrincipal principal = UserPrincipal.builder()
                .id(1L)
                .email("admin@cineplex.vn")
                .fullName("Quản Trị Viên")
                .build();

        String token = jwtTokenProvider.generateAccessToken(principal);

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is("admin@cineplex.vn")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/refresh-token - Refresh token successfully")
    void testRefreshTokenSuccess() throws Exception {
        UserPrincipal principal = UserPrincipal.builder()
                .id(1L)
                .email("admin@cineplex.vn")
                .fullName("Quản Trị Viên")
                .build();

        String refreshToken = jwtTokenProvider.generateRefreshToken(principal);

        RefreshTokenRequest request = RefreshTokenRequest.builder()
                .refreshToken(refreshToken)
                .build();

        mockMvc.perform(post("/api/v1/auth/refresh-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()));
    }
}
