package com.cineplex.service;

import com.cineplex.dto.admin.StaffCreateRequest;
import com.cineplex.dto.admin.UserAdminResponse;
import com.cineplex.dto.admin.UserBookingHistoryResponse;
import com.cineplex.dto.admin.UserUpdateRequest;
import com.cineplex.entity.enums.Role;

import java.util.List;

public interface AdminUserService {
    List<UserAdminResponse> getUsers(Role role, String search);
    UserAdminResponse getUserById(Long id);
    UserAdminResponse createStaff(StaffCreateRequest request);
    UserAdminResponse updateUser(Long id, UserUpdateRequest request, Long currentAdminId);
    UserAdminResponse toggleUserStatus(Long id, Boolean isActive, Long currentAdminId);
    List<UserBookingHistoryResponse> getUserBookingHistory(Long userId);
    void sendPasswordResetEmail(Long id);
}
