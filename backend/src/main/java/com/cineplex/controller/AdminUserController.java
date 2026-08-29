package com.cineplex.controller;

import com.cineplex.dto.admin.StaffCreateRequest;
import com.cineplex.dto.admin.UserAdminResponse;
import com.cineplex.dto.admin.UserBookingHistoryResponse;
import com.cineplex.dto.admin.UserUpdateRequest;
import com.cineplex.dto.common.ApiResponse;
import com.cineplex.entity.enums.Role;
import com.cineplex.security.UserPrincipal;
import com.cineplex.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserAdminResponse>>> getUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) String search) {
        List<UserAdminResponse> users = adminUserService.getUsers(role, search);
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách người dùng thành công", users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserAdminResponse>> getUserById(@PathVariable Long id) {
        UserAdminResponse user = adminUserService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok("Lấy thông tin người dùng thành công", user));
    }

    @PostMapping("/staff")
    public ResponseEntity<ApiResponse<UserAdminResponse>> createStaff(
            @Valid @RequestBody StaffCreateRequest request) {
        UserAdminResponse created = adminUserService.createStaff(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Cấp tài khoản nhân viên thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserAdminResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long adminId = currentUser != null ? currentUser.getId() : -1L;
        UserAdminResponse updated = adminUserService.updateUser(id, request, adminId);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông tin tài khoản thành công", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserAdminResponse>> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam Boolean isActive,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Long adminId = currentUser != null ? currentUser.getId() : -1L;
        UserAdminResponse updated = adminUserService.toggleUserStatus(id, isActive, adminId);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái tài khoản thành công", updated));
    }

    @GetMapping("/{id}/bookings")
    public ResponseEntity<ApiResponse<List<UserBookingHistoryResponse>>> getUserBookingHistory(
            @PathVariable Long id) {
        List<UserBookingHistoryResponse> history = adminUserService.getUserBookingHistory(id);
        return ResponseEntity.ok(ApiResponse.ok("Lấy lịch sử mua vé thành công", history));
    }

    @PostMapping("/{id}/send-reset-password-email")
    public ResponseEntity<ApiResponse<Void>> sendPasswordResetEmail(@PathVariable Long id) {
        adminUserService.sendPasswordResetEmail(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã gửi email yêu cầu đặt lại mật khẩu đến người dùng", null));
    }
}
