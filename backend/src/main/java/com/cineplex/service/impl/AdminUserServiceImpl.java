package com.cineplex.service.impl;

import com.cineplex.dto.admin.StaffCreateRequest;
import com.cineplex.dto.admin.UserAdminResponse;
import com.cineplex.dto.admin.UserBookingHistoryResponse;
import com.cineplex.dto.admin.UserUpdateRequest;
import com.cineplex.entity.Booking;
import com.cineplex.entity.User;
import com.cineplex.entity.enums.BookingStatus;
import com.cineplex.entity.enums.Role;
import com.cineplex.exception.BadRequestException;
import com.cineplex.exception.ResourceNotFoundException;
import com.cineplex.repository.BookingRepository;
import com.cineplex.repository.UserRepository;
import com.cineplex.service.AdminUserService;
import com.cineplex.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailNotificationService emailNotificationService;

    @Override
    @Transactional(readOnly = true)
    public List<UserAdminResponse> getUsers(Role role, String search) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        List<User> users = userRepository.searchUsers(role, cleanSearch);
        return users.stream().map(this::mapToAdminResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserAdminResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", id));
        return mapToAdminResponse(user);
    }

    @Override
    @Transactional
    public UserAdminResponse createStaff(StaffCreateRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email '" + email + "' đã tồn tại trên hệ thống!");
        }

        Role assignedRole = request.getRole() != null ? request.getRole() : Role.STAFF;
        if (assignedRole == Role.CUSTOMER) {
            assignedRole = Role.STAFF;
        }

        User staff = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .isActive(true)
                .build();

        User saved = userRepository.save(staff);
        log.info("Created new staff member: id={}, email={}, role={}", saved.getId(), saved.getEmail(), saved.getRole());
        return mapToAdminResponse(saved);
    }

    @Override
    @Transactional
    public UserAdminResponse updateUser(Long id, UserUpdateRequest request, Long currentAdminId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", id));

        boolean isTargetRoot = isRootUser(user);

        if (isTargetRoot) {
            // Only root user logged in can edit root account info
            if (!id.equals(currentAdminId)) {
                throw new BadRequestException("Chỉ tài khoản Root mới có quyền chỉnh sửa thông tin tài khoản Root!");
            }
            if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
                user.setFullName(request.getFullName().trim());
            }
            if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
                String newEmail = request.getEmail().trim().toLowerCase();
                if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                    throw new BadRequestException("Email '" + newEmail + "' đã tồn tại trên hệ thống!");
                }
                user.setEmail(newEmail);
            }
            if (request.getPhoneNumber() != null) {
                user.setPhoneNumber(request.getPhoneNumber().trim());
            }
            if (request.getNewPassword() != null && !request.getNewPassword().trim().isEmpty()) {
                if (request.getNewPassword().trim().length() < 6) {
                    throw new BadRequestException("Mật khẩu mới phải có tối thiểu 6 ký tự!");
                }
                user.setPasswordHash(passwordEncoder.encode(request.getNewPassword().trim()));
            }
            // Root role is always ADMIN
            user.setRole(Role.ADMIN);
        } else {
            // For other users/staff/customers, admin can only update role
            if (request.getRole() != null) {
                user.setRole(request.getRole());
            }
        }

        User updated = userRepository.save(user);
        log.info("Updated user id={}, isRoot={}, role={}", id, isTargetRoot, user.getRole());
        return mapToAdminResponse(updated);
    }

    @Override
    @Transactional
    public UserAdminResponse toggleUserStatus(Long id, Boolean isActive, Long currentAdminId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", id));

        if (isRootUser(user)) {
            throw new BadRequestException("Không thể khóa tài khoản Root của hệ thống!");
        }

        if (id.equals(currentAdminId) && Boolean.FALSE.equals(isActive)) {
            throw new BadRequestException("Bạn không thể tự khóa tài khoản quản trị của chính mình!");
        }

        user.setIsActive(isActive);
        User updated = userRepository.save(user);
        log.info("Toggled user id={} isActive to {}", id, isActive);
        return mapToAdminResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserBookingHistoryResponse> getUserBookingHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));

        List<Booking> bookings;
        if (user.getRole() == Role.STAFF) {
            // If staff, return POS sales history processed by this staff
            bookings = bookingRepository.findByStaffIdOrderByCreatedAtDesc(userId);
        } else {
            // If customer, return bookings made by customer
            bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }

        if (bookings.isEmpty()) {
            return Collections.emptyList();
        }

        return bookings.stream().map(b -> {
            List<String> seatCodes = (b.getTickets() != null)
                    ? b.getTickets().stream()
                    .filter(t -> t.getSeat() != null)
                    .map(t -> t.getSeat().getSeatCode())
                    .collect(Collectors.toList())
                    : Collections.emptyList();

            List<String> snackList = (b.getBookingSnacks() != null)
                    ? b.getBookingSnacks().stream()
                    .filter(bs -> bs.getSnack() != null)
                    .map(bs -> bs.getSnack().getName() + " x" + bs.getQuantity())
                    .collect(Collectors.toList())
                    : Collections.emptyList();

            return UserBookingHistoryResponse.builder()
                    .id(b.getId())
                    .bookingCode(b.getBookingCode())
                    .movieTitle(b.getShowtime() != null && b.getShowtime().getMovie() != null ? b.getShowtime().getMovie().getTitle() : "Phim N/A")
                    .posterUrl(b.getShowtime() != null && b.getShowtime().getMovie() != null ? b.getShowtime().getMovie().getPosterUrl() : null)
                    .roomName(b.getShowtime() != null && b.getShowtime().getRoom() != null ? b.getShowtime().getRoom().getName() : "Phòng N/A")
                    .showDate(b.getShowtime() != null ? b.getShowtime().getStartTime().toLocalDate() : null)
                    .startTime(b.getShowtime() != null ? b.getShowtime().getStartTime().toLocalTime() : null)
                    .endTime(b.getShowtime() != null ? b.getShowtime().getEndTime().toLocalTime() : null)
                    .seatNames(seatCodes)
                    .snacks(snackList)
                    .totalAmount(b.getTotalAmount())
                    .discountAmount(b.getDiscountAmount())
                    .finalAmount(b.getFinalAmount())
                    .status(b.getStatus())
                    .channel(b.getChannel())
                    .paymentMethod(b.getPayment() != null ? b.getPayment().getPaymentMethod() : null)
                    .createdAt(b.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public void sendPasswordResetEmail(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", id));

        emailNotificationService.sendPasswordResetEmail(user.getEmail(), user.getFullName());
        log.info("Triggered password reset email for user id={}, email={}", id, user.getEmail());
    }

    private boolean isRootUser(User user) {
        return user.getId() != null && (user.getId().equals(1L) || "admin@cineplex.vn".equalsIgnoreCase(user.getEmail()));
    }

    private UserAdminResponse mapToAdminResponse(User user) {
        int bookingsCount = 0;
        BigDecimal totalSpent = BigDecimal.ZERO;
        int staffOrdersCount = 0;

        if (user.getRole() == Role.CUSTOMER) {
            List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            bookingsCount = bookings.size();
            totalSpent = bookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
                    .map(Booking::getFinalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } else if (user.getRole() == Role.STAFF) {
            staffOrdersCount = bookingRepository.findByStaffIdOrderByCreatedAtDesc(user.getId()).size();
        }

        return UserAdminResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .isRoot(isRootUser(user))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .totalBookingsCount(bookingsCount)
                .totalSpentAmount(totalSpent)
                .totalStaffOrdersCount(staffOrdersCount)
                .build();
    }
}
