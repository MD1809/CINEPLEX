package com.cineplex.service;

import com.cineplex.dto.showtime.ShowtimeResponse;
import com.cineplex.dto.staff.*;

import java.util.List;

public interface StaffService {
    PosCheckoutResponse checkoutCash(Long staffId, PosCheckoutRequest request);
    PosTransferResponse checkoutTransfer(Long staffId, PosCheckoutRequest request);
    PosCheckoutResponse confirmTransfer(Long staffId, String bookingCode);
    TicketCheckInResponse checkInTicket(Long staffId, TicketCheckInRequest request);
    ShiftReportResponse getShiftReport(Long staffId);
    List<ShowtimeResponse> getTodayShowtimes();
}
