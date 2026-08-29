package com.cineplex.controller;

import com.cineplex.dto.admin.StaffCreateRequest;
import com.cineplex.dto.admin.UserUpdateRequest;
import com.cineplex.entity.User;
import com.cineplex.entity.enums.Role;
import com.cineplex.repository.UserRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String rootAdminToken;
    private String secondAdminToken;
    private String customerToken;

    @BeforeEach
    void setUp() {
        // Ensure second admin exists in db
        User secondAdminUser = userRepository.findByEmail("second.admin@cineplex.vn")
                .orElseGet(() -> userRepository.save(User.builder()
                        .fullName("Quản Trị Viên Phụ")
                        .email("second.admin@cineplex.vn")
                        .passwordHash(passwordEncoder.encode("Pass@123"))
                        .role(Role.ADMIN)
                        .isActive(true)
                        .build()));

        UserPrincipal rootAdmin = UserPrincipal.builder()
                .id(1L)
                .email("admin@cineplex.vn")
                .fullName("Quản Trị Viên Root")
                .role(Role.ADMIN)
                .build();

        UserPrincipal secondAdmin = UserPrincipal.builder()
                .id(secondAdminUser.getId())
                .email(secondAdminUser.getEmail())
                .fullName(secondAdminUser.getFullName())
                .role(Role.ADMIN)
                .build();

        UserPrincipal customer = UserPrincipal.builder()
                .id(2L)
                .email("customer@gmail.com")
                .fullName("Khách Hàng")
                .role(Role.CUSTOMER)
                .build();

        rootAdminToken = jwtTokenProvider.generateAccessToken(rootAdmin);
        secondAdminToken = jwtTokenProvider.generateAccessToken(secondAdmin);
        customerToken = jwtTokenProvider.generateAccessToken(customer);
    }

    @Test
    @DisplayName("GET /api/v1/admin/users - Admin can list all users")
    void testGetUsers() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + rootAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("GET /api/v1/admin/users?role=STAFF - Admin can filter by role")
    void testGetUsersByRole() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + rootAdminToken)
                        .param("role", "STAFF"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    @DisplayName("POST /api/v1/admin/users/staff - Admin can provision new staff")
    void testCreateStaff() throws Exception {
        String uniqueEmail = "staff_" + System.currentTimeMillis() + "@cineplex.vn";
        StaffCreateRequest request = StaffCreateRequest.builder()
                .fullName("Nhân Viên Quầy Test")
                .email(uniqueEmail)
                .phoneNumber("0987654321")
                .password("Staff@123456")
                .role(Role.STAFF)
                .build();

        mockMvc.perform(post("/api/v1/admin/users/staff")
                        .header("Authorization", "Bearer " + rootAdminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is(uniqueEmail)))
                .andExpect(jsonPath("$.data.role", is("STAFF")));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/users/{id} - Admin can update non-root user role")
    void testUpdateUserRole() throws Exception {
        UserUpdateRequest request = UserUpdateRequest.builder()
                .role(Role.STAFF)
                .build();

        mockMvc.perform(put("/api/v1/admin/users/2")
                        .header("Authorization", "Bearer " + rootAdminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.role", is("STAFF")));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/users/1 - Root Admin can update Root account info")
    void testRootAdminCanUpdateRootInfo() throws Exception {
        UserUpdateRequest request = UserUpdateRequest.builder()
                .fullName("Tổng Quản Trị Hệ Thống")
                .phoneNumber("0909999888")
                .role(Role.ADMIN)
                .build();

        mockMvc.perform(put("/api/v1/admin/users/1")
                        .header("Authorization", "Bearer " + rootAdminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.fullName", is("Tổng Quản Trị Hệ Thống")))
                .andExpect(jsonPath("$.data.isRoot", is(true)));
    }

    @Test
    @DisplayName("PUT /api/v1/admin/users/1 - Non-root Admin CANNOT update Root account")
    void testNonRootAdminCannotUpdateRoot() throws Exception {
        UserUpdateRequest request = UserUpdateRequest.builder()
                .fullName("Hacker Admin")
                .role(Role.STAFF)
                .build();

        mockMvc.perform(put("/api/v1/admin/users/1")
                        .header("Authorization", "Bearer " + secondAdminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PATCH /api/v1/admin/users/{id}/status - Cannot lock Root account")
    void testCannotLockRootAccount() throws Exception {
        mockMvc.perform(patch("/api/v1/admin/users/1/status")
                        .header("Authorization", "Bearer " + rootAdminToken)
                        .param("isActive", "false"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/v1/admin/users/{id}/bookings - Admin can view booking/work history")
    void testGetUserBookingHistory() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users/2/bookings")
                        .header("Authorization", "Bearer " + rootAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    @DisplayName("POST /api/v1/admin/users/{id}/send-reset-password-email - Trigger reset email")
    void testSendPasswordResetEmail() throws Exception {
        mockMvc.perform(post("/api/v1/admin/users/2/send-reset-password-email")
                        .header("Authorization", "Bearer " + rootAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    @DisplayName("GET /api/v1/admin/users - Customer is forbidden")
    void testCustomerForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());
    }
}
