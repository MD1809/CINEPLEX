package com.cineplex.service;

import com.cineplex.dto.admin.DashboardMetricsResponse;
import com.cineplex.dto.admin.PaymentStatsDto;
import com.cineplex.dto.admin.RevenueChartDto;
import com.cineplex.dto.admin.TopMovieRevenueDto;

import com.cineplex.dto.admin.SoldTicketDto;

import java.util.List;

public interface AdminAnalyticsService {
    DashboardMetricsResponse getDashboardMetrics(String period, String startDate, String endDate);
    List<RevenueChartDto> getRevenueChart(String period, String startDate, String endDate);
    List<TopMovieRevenueDto> getTopMovies(int limit, String period);
    List<PaymentStatsDto> getPaymentStats(String period);
    List<SoldTicketDto> getSoldTickets(String period, String search, int limit);
}
