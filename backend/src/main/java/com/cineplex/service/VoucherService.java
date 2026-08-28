package com.cineplex.service;

import com.cineplex.dto.voucher.ApplyVoucherRequest;
import com.cineplex.dto.voucher.ApplyVoucherResponse;
import com.cineplex.dto.voucher.VoucherDto;

import java.util.List;

public interface VoucherService {
    ApplyVoucherResponse applyVoucher(ApplyVoucherRequest request);
    List<VoucherDto> getAvailableVouchers();
}
