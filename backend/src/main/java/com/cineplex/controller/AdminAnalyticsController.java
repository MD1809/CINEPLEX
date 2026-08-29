package com.cineplex.controller;

import com.cineplex.dto.admin.DashboardMetricsResponse;
import com.cineplex.dto.admin.PaymentStatsDto;
import com.cineplex.dto.admin.RevenueChartDto;
import com.cineplex.dto.admin.TopMovieRevenueDto;
import com.cineplex.dto.common.ApiResponse;
import com.cineplex.service.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<DashboardMetricsResponse>> getMetrics(
            @RequestParam(defaultValue = "7days") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        log.info("Admin fetching dashboard metrics for period: {}, range: {} to {}", period, startDate, endDate);
        DashboardMetricsResponse metrics = adminAnalyticsService.getDashboardMetrics(period, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(metrics));
    }

    @GetMapping("/revenue-chart")
    public ResponseEntity<ApiResponse<List<RevenueChartDto>>> getRevenueChart(
            @RequestParam(defaultValue = "7days") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        log.info("Admin fetching revenue chart for period: {}", period);
        List<RevenueChartDto> chart = adminAnalyticsService.getRevenueChart(period, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(chart));
    }

    @GetMapping("/top-movies")
    public ResponseEntity<ApiResponse<List<TopMovieRevenueDto>>> getTopMovies(
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(defaultValue = "month") String period
    ) {
        log.info("Admin fetching top {} movies for period: {}", limit, period);
        List<TopMovieRevenueDto> topMovies = adminAnalyticsService.getTopMovies(limit, period);
        return ResponseEntity.ok(ApiResponse.ok(topMovies));
    }

    @GetMapping("/payment-stats")
    public ResponseEntity<ApiResponse<List<PaymentStatsDto>>> getPaymentStats(
            @RequestParam(defaultValue = "month") String period
    ) {
        log.info("Admin fetching payment stats for period: {}", period);
        List<PaymentStatsDto> stats = adminAnalyticsService.getPaymentStats(period);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/sold-tickets")
    public ResponseEntity<ApiResponse<List<com.cineplex.dto.admin.SoldTicketDto>>> getSoldTickets(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "50") int limit
    ) {
        log.info("Admin fetching sold tickets for period: {}, search: {}, limit: {}", period, search, limit);
        List<com.cineplex.dto.admin.SoldTicketDto> tickets = adminAnalyticsService.getSoldTickets(period, search, limit);
        return ResponseEntity.ok(ApiResponse.ok(tickets));
    }
}
