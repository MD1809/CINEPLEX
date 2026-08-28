package com.cineplex.service;

import com.cineplex.dto.booking.OnlineCheckoutRequest;
import com.cineplex.dto.booking.OnlineCheckoutResponse;
import com.cineplex.dto.payment.PaymentResultDto;
import com.cineplex.dto.payment.VnpayIpnResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface PaymentService {
    OnlineCheckoutResponse createOnlineCheckout(Long userId, OnlineCheckoutRequest request, HttpServletRequest httpRequest);
    VnpayIpnResponse processVnpayIpn(Map<String, String> vnpParams);
    PaymentResultDto processVnpayReturn(Map<String, String> vnpParams);
}
