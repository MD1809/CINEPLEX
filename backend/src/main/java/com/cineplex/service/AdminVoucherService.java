package com.cineplex.service;

import com.cineplex.dto.admin.VoucherAdminResponse;
import com.cineplex.dto.admin.VoucherCreateUpdateRequest;

import java.util.List;

public interface AdminVoucherService {
    List<VoucherAdminResponse> getAllVouchers();
    VoucherAdminResponse getVoucherById(Long id);
    VoucherAdminResponse createVoucher(VoucherCreateUpdateRequest request);
    VoucherAdminResponse updateVoucher(Long id, VoucherCreateUpdateRequest request);
    VoucherAdminResponse toggleVoucherStatus(Long id, Boolean isActive);
    void deleteVoucher(Long id);
}
