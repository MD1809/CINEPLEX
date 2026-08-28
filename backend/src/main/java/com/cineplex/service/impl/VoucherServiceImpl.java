package com.cineplex.service.impl;

import com.cineplex.dto.voucher.ApplyVoucherRequest;
import com.cineplex.dto.voucher.ApplyVoucherResponse;
import com.cineplex.dto.voucher.VoucherDto;
import com.cineplex.entity.Voucher;
import com.cineplex.entity.enums.DiscountType;
import com.cineplex.exception.BadRequestException;
import com.cineplex.repository.VoucherRepository;
import com.cineplex.service.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;

    @Override
    @Transactional(readOnly = true)
    public ApplyVoucherResponse applyVoucher(ApplyVoucherRequest request) {
        String code = request.getVoucherCode().trim().toUpperCase();
        BigDecimal orderAmount = request.getOrderAmount();

        if (orderAmount == null || orderAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Giá trị đơn hàng không hợp lệ.");
        }

        Voucher voucher = voucherRepository.findByCodeAndIsActiveTrue(code)
                .orElseThrow(() -> new BadRequestException("Mã giảm giá '" + code + "' không tồn tại hoặc đã bị khóa."));

        LocalDateTime now = LocalDateTime.now();

        if (now.isBefore(voucher.getStartDate()) || now.isAfter(voucher.getEndDate())) {
            throw new BadRequestException("Mã giảm giá chưa đến đợt áp dụng hoặc đã hết hạn sử dụng.");
        }

        if (voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new BadRequestException("Mã giảm giá đã hết lượt sử dụng.");
        }

        if (voucher.getMinOrderAmount() != null && orderAmount.compareTo(voucher.getMinOrderAmount()) < 0) {
            String minStr = NumberFormat.getCurrencyInstance(new Locale("vi", "VN")).format(voucher.getMinOrderAmount());
            throw new BadRequestException("Đơn hàng phải từ " + minStr + " trở lên để áp dụng mã này.");
        }

        BigDecimal discountAmount;
        if (voucher.getDiscountType() == DiscountType.PERCENTAGE) {
            discountAmount = orderAmount.multiply(voucher.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            if (voucher.getMaxDiscountAmount() != null && discountAmount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discountAmount = voucher.getMaxDiscountAmount();
            }
        } else {
            discountAmount = voucher.getDiscountValue().min(orderAmount);
        }

        BigDecimal finalAmount = orderAmount.subtract(discountAmount).max(BigDecimal.ZERO);

        log.info("Applied voucher '{}' on order {}đ -> Discount: {}đ, Final: {}đ",
                code, orderAmount, discountAmount, finalAmount);

        return ApplyVoucherResponse.builder()
                .voucherId(voucher.getId())
                .voucherCode(voucher.getCode())
                .description(voucher.getDescription())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .message("Áp dụng mã giảm giá thành công!")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoucherDto> getAvailableVouchers() {
        LocalDateTime now = LocalDateTime.now();
        return voucherRepository.findAll().stream()
                .filter(v -> Boolean.TRUE.equals(v.getIsActive())
                        && now.isAfter(v.getStartDate())
                        && now.isBefore(v.getEndDate())
                        && v.getUsedCount() < v.getUsageLimit())
                .map(v -> VoucherDto.builder()
                        .id(v.getId())
                        .code(v.getCode())
                        .description(v.getDescription())
                        .discountType(v.getDiscountType())
                        .discountValue(v.getDiscountValue())
                        .minOrderAmount(v.getMinOrderAmount())
                        .maxDiscountAmount(v.getMaxDiscountAmount())
                        .endDate(v.getEndDate())
                        .build())
                .collect(Collectors.toList());
    }
}
