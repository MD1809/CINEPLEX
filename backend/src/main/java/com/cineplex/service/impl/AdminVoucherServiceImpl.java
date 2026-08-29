package com.cineplex.service.impl;

import com.cineplex.dto.admin.VoucherAdminResponse;
import com.cineplex.dto.admin.VoucherCreateUpdateRequest;
import com.cineplex.entity.Voucher;
import com.cineplex.entity.enums.DiscountType;
import com.cineplex.exception.BadRequestException;
import com.cineplex.exception.ResourceNotFoundException;
import com.cineplex.repository.BookingRepository;
import com.cineplex.repository.VoucherRepository;
import com.cineplex.service.AdminVoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminVoucherServiceImpl implements AdminVoucherService {

    private final VoucherRepository voucherRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<VoucherAdminResponse> getAllVouchers() {
        return voucherRepository.findByIsDeletedFalseOrderByIdDesc().stream()
                .map(this::mapToAdminResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherAdminResponse getVoucherById(Long id) {
        Voucher voucher = voucherRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", "id", id));
        return mapToAdminResponse(voucher);
    }

    @Override
    @Transactional
    public VoucherAdminResponse createVoucher(VoucherCreateUpdateRequest request) {
        validateVoucherRequest(request, null);

        String normalizedCode = request.getCode().trim().toUpperCase();
        if (voucherRepository.existsByCodeIgnoreCaseAndIsDeletedFalse(normalizedCode)) {
            throw new BadRequestException("Mã voucher '" + normalizedCode + "' đã tồn tại trên hệ thống!");
        }

        Voucher voucher = Voucher.builder()
                .code(normalizedCode)
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO)
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .usageLimit(request.getUsageLimit())
                .usedCount(0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isDeleted(false)
                .build();

        Voucher saved = voucherRepository.save(voucher);
        log.info("Created new voucher: code={}, id={}", saved.getCode(), saved.getId());
        return mapToAdminResponse(saved);
    }

    @Override
    @Transactional
    public VoucherAdminResponse updateVoucher(Long id, VoucherCreateUpdateRequest request) {
        validateVoucherRequest(request, id);

        Voucher voucher = voucherRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", "id", id));

        String normalizedCode = request.getCode().trim().toUpperCase();
        if (voucherRepository.existsByCodeIgnoreCaseAndIdNotAndIsDeletedFalse(normalizedCode, id)) {
            throw new BadRequestException("Mã voucher '" + normalizedCode + "' đã tồn tại trên voucher khác!");
        }

        voucher.setCode(normalizedCode);
        voucher.setDescription(request.getDescription());
        voucher.setDiscountType(request.getDiscountType());
        voucher.setDiscountValue(request.getDiscountValue());
        voucher.setMinOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO);
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());
        voucher.setUsageLimit(request.getUsageLimit());
        if (request.getIsActive() != null) {
            voucher.setIsActive(request.getIsActive());
        }

        Voucher updated = voucherRepository.save(voucher);
        log.info("Updated voucher id={}, code={}", updated.getId(), updated.getCode());
        return mapToAdminResponse(updated);
    }

    @Override
    @Transactional
    public VoucherAdminResponse toggleVoucherStatus(Long id, Boolean isActive) {
        Voucher voucher = voucherRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", "id", id));

        voucher.setIsActive(isActive);
        Voucher updated = voucherRepository.save(voucher);
        log.info("Toggled voucher id={} isActive to {}", id, isActive);
        return mapToAdminResponse(updated);
    }

    @Override
    @Transactional
    public void deleteVoucher(Long id) {
        Voucher voucher = voucherRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", "id", id));

        boolean hasBookings = bookingRepository.existsByVoucherId(id);
        if (hasBookings) {
            voucher.setIsDeleted(true);
            voucher.setIsActive(false);
            voucherRepository.save(voucher);
            log.info("Voucher id={} has booking history, marked as isDeleted=true (soft delete)", id);
        } else {
            voucherRepository.delete(voucher);
            voucherRepository.flush();
            log.info("Permanently deleted voucher id={}", id);
        }
    }

    private void validateVoucherRequest(VoucherCreateUpdateRequest request, Long currentId) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Thời gian bắt đầu không được sau thời gian kết thúc!");
        }

        if (request.getDiscountType() == DiscountType.PERCENTAGE) {
            if (request.getDiscountValue().compareTo(new BigDecimal("100")) > 0) {
                throw new BadRequestException("Giá trị giảm theo phần trăm không được vượt quá 100%!");
            }
        }
    }

    private VoucherAdminResponse mapToAdminResponse(Voucher voucher) {
        LocalDateTime now = LocalDateTime.now();
        boolean isExpired = voucher.getEndDate().isBefore(now);
        boolean isOutOfUses = voucher.getUsedCount() >= voucher.getUsageLimit();
        int remaining = Math.max(0, voucher.getUsageLimit() - voucher.getUsedCount());

        String status;
        if (!voucher.getIsActive()) {
            status = "INACTIVE";
        } else if (isExpired) {
            status = "EXPIRED";
        } else if (isOutOfUses) {
            status = "OUT_OF_USES";
        } else {
            status = "ACTIVE";
        }

        return VoucherAdminResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .description(voucher.getDescription())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .minOrderAmount(voucher.getMinOrderAmount())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .usageLimit(voucher.getUsageLimit())
                .usedCount(voucher.getUsedCount())
                .remainingUsage(remaining)
                .isActive(voucher.getIsActive())
                .isExpired(isExpired)
                .status(status)
                .build();
    }
}
