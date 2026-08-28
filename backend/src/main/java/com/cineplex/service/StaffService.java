package com.cineplex.service;

import com.cineplex.dto.common.PageResponse;
import com.cineplex.dto.showtime.ShowtimeResponse;
import com.cineplex.dto.staff.*;
import com.cineplex.entity.enums.PaymentMethod;

import java.time.LocalDate;
import java.util.List;

public interface StaffService {
    PosCheckoutResponse checkoutCash(Long staffId, PosCheckoutRequest request);
    PosTransferResponse checkoutTransfer(Long staffId, PosCheckoutRequest request);
    PosCheckoutResponse confirmTransfer(Long staffId, String bookingCode);
    TicketCheckInResponse checkInTicket(Long staffId, TicketCheckInRequest request);
    ShiftReportResponse getShiftReport(Long staffId);
    ShiftReportResponse getShiftReportCustom(Long staffId, LocalDate startDate, LocalDate endDate);
    PageResponse<StaffOrderSummaryDto> getStaffOrdersHistory(Long staffId, LocalDate startDate, LocalDate endDate, PaymentMethod paymentMethod, String search, int page, int size);
    PosCheckoutResponse getBookingReceipt(String bookingCode);
    List<ShowtimeResponse> getTodayShowtimes();
}
