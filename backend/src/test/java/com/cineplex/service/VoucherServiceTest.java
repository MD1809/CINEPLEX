package com.cineplex.service;

import com.cineplex.dto.voucher.ApplyVoucherRequest;
import com.cineplex.dto.voucher.ApplyVoucherResponse;
import com.cineplex.dto.voucher.VoucherDto;
import com.cineplex.entity.Voucher;
import com.cineplex.entity.enums.DiscountType;
import com.cineplex.exception.BadRequestException;
import com.cineplex.repository.VoucherRepository;
import com.cineplex.service.impl.VoucherServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VoucherServiceTest {

    @Mock
    private VoucherRepository voucherRepository;

    @InjectMocks
    private VoucherServiceImpl voucherService;

    private Voucher percentVoucher;
    private Voucher fixedVoucher;

    @BeforeEach
    void setUp() {
        percentVoucher = Voucher.builder()
                .id(1L)
                .code("CINEPLEX20")
                .description("Giảm 20% tối đa 50k")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("20.00"))
                .minOrderAmount(new BigDecimal("100000.00"))
                .maxDiscountAmount(new BigDecimal("50000.00"))
                .startDate(LocalDateTime.now().minusDays(2))
                .endDate(LocalDateTime.now().plusDays(30))
                .usageLimit(100)
                .usedCount(5)
                .isActive(true)
                .build();

        fixedVoucher = Voucher.builder()
                .id(2L)
                .code("CHAOBANMOI")
                .description("Giảm ngay 30k")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(new BigDecimal("30000.00"))
                .minOrderAmount(new BigDecimal("80000.00"))
                .maxDiscountAmount(new BigDecimal("30000.00"))
                .startDate(LocalDateTime.now().minusDays(1))
                .endDate(LocalDateTime.now().plusDays(15))
                .usageLimit(50)
                .usedCount(0)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Apply Percentage Voucher - 20% on 200k order = 40k discount")
    void testApplyPercentageVoucherNormal() {
        when(voucherRepository.findByCodeAndIsActiveTrue("CINEPLEX20")).thenReturn(Optional.of(percentVoucher));

        ApplyVoucherRequest request = ApplyVoucherRequest.builder()
                .voucherCode("CINEPLEX20")
                .orderAmount(new BigDecimal("200000.00"))
                .build();

        ApplyVoucherResponse response = voucherService.applyVoucher(request);
        assertThat(response).isNotNull();
        assertThat(response.getDiscountAmount()).isEqualByComparingTo(new BigDecimal("40000.00"));
        assertThat(response.getFinalAmount()).isEqualByComparingTo(new BigDecimal("160000.00"));
    }

    @Test
    @DisplayName("Apply Percentage Voucher - Cap at maxDiscountAmount 50k on 500k order")
    void testApplyPercentageVoucherCapped() {
        when(voucherRepository.findByCodeAndIsActiveTrue("CINEPLEX20")).thenReturn(Optional.of(percentVoucher));

        ApplyVoucherRequest request = ApplyVoucherRequest.builder()
                .voucherCode("CINEPLEX20")
                .orderAmount(new BigDecimal("500000.00"))
                .build();

        ApplyVoucherResponse response = voucherService.applyVoucher(request);
        assertThat(response.getDiscountAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(response.getFinalAmount()).isEqualByComparingTo(new BigDecimal("450000.00"));
    }

    @Test
    @DisplayName("Apply Fixed Voucher - 30k discount on 100k order = 70k final")
    void testApplyFixedVoucher() {
        when(voucherRepository.findByCodeAndIsActiveTrue("CHAOBANMOI")).thenReturn(Optional.of(fixedVoucher));

        ApplyVoucherRequest request = ApplyVoucherRequest.builder()
                .voucherCode("CHAOBANMOI")
                .orderAmount(new BigDecimal("100000.00"))
                .build();

        ApplyVoucherResponse response = voucherService.applyVoucher(request);
        assertThat(response.getDiscountAmount()).isEqualByComparingTo(new BigDecimal("30000.00"));
        assertThat(response.getFinalAmount()).isEqualByComparingTo(new BigDecimal("70000.00"));
    }

    @Test
    @DisplayName("Reject when order amount is below minOrderAmount")
    void testRejectBelowMinOrderAmount() {
        when(voucherRepository.findByCodeAndIsActiveTrue("CINEPLEX20")).thenReturn(Optional.of(percentVoucher));

        ApplyVoucherRequest request = ApplyVoucherRequest.builder()
                .voucherCode("CINEPLEX20")
                .orderAmount(new BigDecimal("50000.00")) // < 100k
                .build();

        assertThrows(BadRequestException.class, () -> voucherService.applyVoucher(request));
    }

    @Test
    @DisplayName("Reject expired voucher")
    void testRejectExpiredVoucher() {
        percentVoucher.setEndDate(LocalDateTime.now().minusDays(1));
        when(voucherRepository.findByCodeAndIsActiveTrue("CINEPLEX20")).thenReturn(Optional.of(percentVoucher));

        ApplyVoucherRequest request = ApplyVoucherRequest.builder()
                .voucherCode("CINEPLEX20")
                .orderAmount(new BigDecimal("200000.00"))
                .build();

        assertThrows(BadRequestException.class, () -> voucherService.applyVoucher(request));
    }
}
