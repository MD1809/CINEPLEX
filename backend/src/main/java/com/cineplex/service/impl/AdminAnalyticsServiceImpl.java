package com.cineplex.service.impl;

import com.cineplex.dto.admin.DashboardMetricsResponse;
import com.cineplex.dto.admin.PaymentStatsDto;
import com.cineplex.dto.admin.RevenueChartDto;
import com.cineplex.dto.admin.SoldTicketDto;
import com.cineplex.dto.admin.TopMovieRevenueDto;
import com.cineplex.entity.Booking;
import com.cineplex.entity.BookingSnack;
import com.cineplex.entity.Movie;
import com.cineplex.entity.Ticket;
import com.cineplex.entity.enums.BookingChannel;
import com.cineplex.entity.enums.BookingStatus;
import com.cineplex.entity.enums.MovieStatus;
import com.cineplex.entity.enums.PaymentMethod;
import com.cineplex.repository.BookingRepository;
import com.cineplex.repository.MovieRepository;
import com.cineplex.repository.SeatRepository;
import com.cineplex.repository.ShowtimeRepository;
import com.cineplex.service.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAnalyticsServiceImpl implements AdminAnalyticsService {

    private final BookingRepository bookingRepository;
    private final MovieRepository movieRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DISPLAY_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM");
    private static final DateTimeFormatter HOUR_FORMATTER = DateTimeFormatter.ofPattern("HH:00");

    @Override
    public DashboardMetricsResponse getDashboardMetrics(String period, String startDate, String endDate) {
        TimeRange range = resolveTimeRange(period, startDate, endDate);
        List<Booking> bookings = bookingRepository.findByStatusAndCreatedAtBetween(
                BookingStatus.CONFIRMED, range.start, range.end
        );

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal ticketRevenue = BigDecimal.ZERO;
        BigDecimal snackRevenue = BigDecimal.ZERO;
        long totalTicketsSold = 0;

        for (Booking booking : bookings) {
            if (booking.getFinalAmount() != null) {
                totalRevenue = totalRevenue.add(booking.getFinalAmount());
            }

            if (booking.getTickets() != null) {
                for (Ticket ticket : booking.getTickets()) {
                    if (ticket.getPrice() != null) {
                        ticketRevenue = ticketRevenue.add(ticket.getPrice());
                    }
                    totalTicketsSold++;
                }
            }

            if (booking.getBookingSnacks() != null) {
                for (BookingSnack snack : booking.getBookingSnacks()) {
                    if (snack.getTotalPrice() != null) {
                        snackRevenue = snackRevenue.add(snack.getTotalPrice());
                    } else if (snack.getUnitPrice() != null && snack.getQuantity() != null) {
                        snackRevenue = snackRevenue.add(snack.getUnitPrice().multiply(BigDecimal.valueOf(snack.getQuantity())));
                    }
                }
            }
        }

        long totalActiveMovies = movieRepository.findByStatus(MovieStatus.NOW_SHOWING).size();
        long totalOrders = bookings.size();

        // Calculate occupancy rate
        double occupancyRate = calculateOccupancyRate(bookings);

        return DashboardMetricsResponse.builder()
                .totalRevenue(totalRevenue)
                .ticketRevenue(ticketRevenue)
                .snackRevenue(snackRevenue)
                .totalTicketsSold(totalTicketsSold)
                .totalActiveMovies(totalActiveMovies)
                .roomOccupancyRate(occupancyRate)
                .totalOrders(totalOrders)
                .period(range.periodLabel)
                .build();
    }

    @Override
    public List<RevenueChartDto> getRevenueChart(String period, String startDate, String endDate) {
        TimeRange range = resolveTimeRange(period, startDate, endDate);
        List<Booking> bookings = bookingRepository.findByStatusAndCreatedAtBetween(
                BookingStatus.CONFIRMED, range.start, range.end
        );

        if ("today".equalsIgnoreCase(period)) {
            // Group by hour
            Map<Integer, List<Booking>> hourMap = bookings.stream()
                    .collect(Collectors.groupingBy(b -> b.getCreatedAt().getHour()));

            List<RevenueChartDto> chartData = new ArrayList<>();
            for (int h = 8; h <= 23; h++) {
                String hourStr = String.format("%02d:00", h);
                List<Booking> hourBookings = hourMap.getOrDefault(h, Collections.emptyList());

                BigDecimal totalRev = BigDecimal.ZERO;
                BigDecimal ticketRev = BigDecimal.ZERO;
                BigDecimal snackRev = BigDecimal.ZERO;
                long tickets = 0;

                for (Booking b : hourBookings) {
                    if (b.getFinalAmount() != null) totalRev = totalRev.add(b.getFinalAmount());
                    if (b.getTickets() != null) {
                        for (Ticket t : b.getTickets()) {
                            if (t.getPrice() != null) ticketRev = ticketRev.add(t.getPrice());
                            tickets++;
                        }
                    }
                    if (b.getBookingSnacks() != null) {
                        for (BookingSnack s : b.getBookingSnacks()) {
                            if (s.getTotalPrice() != null) {
                                snackRev = snackRev.add(s.getTotalPrice());
                            } else if (s.getUnitPrice() != null && s.getQuantity() != null) {
                                snackRev = snackRev.add(s.getUnitPrice().multiply(BigDecimal.valueOf(s.getQuantity())));
                            }
                        }
                    }
                }

                chartData.add(RevenueChartDto.builder()
                        .date(hourStr)
                        .displayDate(hourStr)
                        .totalRevenue(totalRev)
                        .ticketRevenue(ticketRev)
                        .snackRevenue(snackRev)
                        .ticketsCount(tickets)
                        .orderCount(hourBookings.size())
                        .build());
            }
            return chartData;
        } else {
            // Group by date
            Map<LocalDate, List<Booking>> dateMap = bookings.stream()
                    .collect(Collectors.groupingBy(b -> b.getCreatedAt().toLocalDate()));

            List<RevenueChartDto> chartData = new ArrayList<>();
            LocalDate current = range.start.toLocalDate();
            LocalDate end = range.end.toLocalDate();

            while (!current.isAfter(end)) {
                String dateStr = current.format(DATE_FORMATTER);
                String displayDateStr = current.format(DISPLAY_DATE_FORMATTER);
                List<Booking> dayBookings = dateMap.getOrDefault(current, Collections.emptyList());

                BigDecimal totalRev = BigDecimal.ZERO;
                BigDecimal ticketRev = BigDecimal.ZERO;
                BigDecimal snackRev = BigDecimal.ZERO;
                long tickets = 0;

                for (Booking b : dayBookings) {
                    if (b.getFinalAmount() != null) totalRev = totalRev.add(b.getFinalAmount());
                    if (b.getTickets() != null) {
                        for (Ticket t : b.getTickets()) {
                            if (t.getPrice() != null) ticketRev = ticketRev.add(t.getPrice());
                            tickets++;
                        }
                    }
                    if (b.getBookingSnacks() != null) {
                        for (BookingSnack s : b.getBookingSnacks()) {
                            if (s.getTotalPrice() != null) {
                                snackRev = snackRev.add(s.getTotalPrice());
                            } else if (s.getUnitPrice() != null && s.getQuantity() != null) {
                                snackRev = snackRev.add(s.getUnitPrice().multiply(BigDecimal.valueOf(s.getQuantity())));
                            }
                        }
                    }
                }

                chartData.add(RevenueChartDto.builder()
                        .date(dateStr)
                        .displayDate(displayDateStr)
                        .totalRevenue(totalRev)
                        .ticketRevenue(ticketRev)
                        .snackRevenue(snackRev)
                        .ticketsCount(tickets)
                        .orderCount(dayBookings.size())
                        .build());

                current = current.plusDays(1);
            }
            return chartData;
        }
    }

    @Override
    public List<TopMovieRevenueDto> getTopMovies(int limit, String period) {
        TimeRange range = resolveTimeRange(period, null, null);
        List<Booking> bookings = bookingRepository.findByStatusAndCreatedAtBetween(
                BookingStatus.CONFIRMED, range.start, range.end
        );

        Map<Movie, List<Booking>> movieBookings = bookings.stream()
                .filter(b -> b.getShowtime() != null && b.getShowtime().getMovie() != null)
                .collect(Collectors.groupingBy(b -> b.getShowtime().getMovie()));

        List<TopMovieRevenueDto> list = new ArrayList<>();

        for (Map.Entry<Movie, List<Booking>> entry : movieBookings.entrySet()) {
            Movie movie = entry.getKey();
            List<Booking> bList = entry.getValue();

            BigDecimal movieRevenue = BigDecimal.ZERO;
            long ticketsSold = 0;

            for (Booking b : bList) {
                if (b.getFinalAmount() != null) movieRevenue = movieRevenue.add(b.getFinalAmount());
                if (b.getTickets() != null) ticketsSold += b.getTickets().size();
            }

            double occupancyRate = calculateOccupancyRate(bList);

            list.add(TopMovieRevenueDto.builder()
                    .movieId(movie.getId())
                    .title(movie.getTitle())
                    .posterUrl(movie.getPosterUrl())
                    .durationMinutes(movie.getDurationMinutes())
                    .ageRating(movie.getAgeRating() != null ? movie.getAgeRating().name() : "P")
                    .ticketsSold(ticketsSold)
                    .totalRevenue(movieRevenue)
                    .occupancyRate(occupancyRate)
                    .build());
        }

        // Also include active movies that might have 0 revenue so admin sees them if list is short
        if (list.size() < limit) {
            List<Movie> activeMovies = movieRepository.findByStatus(MovieStatus.NOW_SHOWING);
            Set<Long> existingIds = list.stream().map(TopMovieRevenueDto::getMovieId).collect(Collectors.toSet());
            for (Movie m : activeMovies) {
                if (!existingIds.contains(m.getId())) {
                    list.add(TopMovieRevenueDto.builder()
                            .movieId(m.getId())
                            .title(m.getTitle())
                            .posterUrl(m.getPosterUrl())
                            .durationMinutes(m.getDurationMinutes())
                            .ageRating(m.getAgeRating() != null ? m.getAgeRating().name() : "P")
                            .ticketsSold(0)
                            .totalRevenue(BigDecimal.ZERO)
                            .occupancyRate(0.0)
                            .build());
                }
            }
        }

        // Sort descending by totalRevenue, then ticketsSold
        list.sort((a, b) -> {
            int comp = b.getTotalRevenue().compareTo(a.getTotalRevenue());
            if (comp != 0) return comp;
            return Long.compare(b.getTicketsSold(), a.getTicketsSold());
        });

        return list.stream().limit(limit > 0 ? limit : 5).collect(Collectors.toList());
    }

    @Override
    public List<PaymentStatsDto> getPaymentStats(String period) {
        TimeRange range = resolveTimeRange(period, null, null);
        List<Booking> bookings = bookingRepository.findByStatusAndCreatedAtBetween(
                BookingStatus.CONFIRMED, range.start, range.end
        );

        BigDecimal grandTotal = bookings.stream()
                .map(b -> b.getFinalAmount() != null ? b.getFinalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, List<Booking>> methodMap = new HashMap<>();

        for (Booking b : bookings) {
            String methodKey = "VNPAY";
            if (b.getPayment() != null && b.getPayment().getPaymentMethod() != null) {
                methodKey = b.getPayment().getPaymentMethod().name();
            } else if (b.getChannel() == BookingChannel.POS) {
                methodKey = "CASH";
            }
            methodMap.computeIfAbsent(methodKey, k -> new ArrayList<>()).add(b);
        }

        List<PaymentStatsDto> stats = new ArrayList<>();
        String[] allMethods = {"VNPAY", "CASH", "BANK_TRANSFER"};
        Map<String, String> names = Map.of(
                "VNPAY", "VNPAY Online",
                "CASH", "Tiền Mặt Tại Quầy",
                "BANK_TRANSFER", "Chuyển Khoản QR"
        );

        for (String m : allMethods) {
            List<Booking> list = methodMap.getOrDefault(m, Collections.emptyList());
            BigDecimal amount = list.stream()
                    .map(b -> b.getFinalAmount() != null ? b.getFinalAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double pct = 0.0;
            if (grandTotal.compareTo(BigDecimal.ZERO) > 0) {
                pct = amount.divide(grandTotal, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            }

            stats.add(PaymentStatsDto.builder()
                    .method(m)
                    .methodName(names.getOrDefault(m, m))
                    .amount(amount)
                    .transactionCount(list.size())
                    .percentage(Math.round(pct * 10.0) / 10.0)
                    .build());
        }

        return stats;
    }

    @Override
    public List<SoldTicketDto> getSoldTickets(String period, String search, int limit) {
        TimeRange range = resolveTimeRange(period, null, null);
        List<Booking> bookings = bookingRepository.findByStatusAndCreatedAtBetween(
                BookingStatus.CONFIRMED, range.start, range.end
        );

        List<SoldTicketDto> dtoList = new ArrayList<>();

        for (Booking booking : bookings) {
            if (booking.getTickets() == null) continue;

            String movieTitle = booking.getShowtime() != null && booking.getShowtime().getMovie() != null
                    ? booking.getShowtime().getMovie().getTitle() : "Phim CINEPLEX";
            String posterUrl = booking.getShowtime() != null && booking.getShowtime().getMovie() != null
                    ? booking.getShowtime().getMovie().getPosterUrl() : null;
            String screenType = booking.getShowtime() != null && booking.getShowtime().getRoom() != null
                    ? booking.getShowtime().getRoom().getScreenType().name() : "STANDARD_2D";
            String roomName = booking.getShowtime() != null && booking.getShowtime().getRoom() != null
                    ? booking.getShowtime().getRoom().getName() : "Phòng Chiếu";
            LocalDateTime stStart = booking.getShowtime() != null ? booking.getShowtime().getStartTime() : null;
            LocalDateTime stEnd = booking.getShowtime() != null ? booking.getShowtime().getEndTime() : null;

            String customerName = booking.getUser() != null ? booking.getUser().getFullName() : "Khách Vãng Lai";
            String staffName = booking.getStaff() != null ? booking.getStaff().getFullName() : null;
            String channel = booking.getChannel() != null ? booking.getChannel().name() : "ONLINE";

            String paymentMethod = "VNPAY";
            if (booking.getPayment() != null && booking.getPayment().getPaymentMethod() != null) {
                paymentMethod = booking.getPayment().getPaymentMethod().name();
            } else if (booking.getChannel() == BookingChannel.POS) {
                paymentMethod = "CASH";
            }

            for (Ticket t : booking.getTickets()) {
                String seatCode = t.getSeat() != null ? t.getSeat().getSeatCode() : "N/A";
                String seatType = t.getSeat() != null && t.getSeat().getSeatType() != null 
                        ? t.getSeat().getSeatType().getName() : "STANDARD";

                // Filter search query if present
                if (search != null && !search.trim().isEmpty()) {
                    String query = search.trim().toLowerCase();
                    boolean match = (t.getTicketCode() != null && t.getTicketCode().toLowerCase().contains(query))
                            || (booking.getBookingCode() != null && booking.getBookingCode().toLowerCase().contains(query))
                            || (movieTitle.toLowerCase().contains(query))
                            || (customerName.toLowerCase().contains(query))
                            || (seatCode.toLowerCase().contains(query));
                    if (!match) continue;
                }

                dtoList.add(SoldTicketDto.builder()
                        .ticketId(t.getId())
                        .ticketCode(t.getTicketCode())
                        .bookingCode(booking.getBookingCode())
                        .movieTitle(movieTitle)
                        .posterUrl(posterUrl)
                        .screenType(screenType)
                        .roomName(roomName)
                        .seatCode(seatCode)
                        .seatType(seatType)
                        .price(t.getPrice() != null ? t.getPrice() : BigDecimal.ZERO)
                        .showtimeStart(stStart)
                        .showtimeEnd(stEnd)
                        .bookingChannel(channel)
                        .paymentMethod(paymentMethod)
                        .customerName(customerName)
                        .staffName(staffName)
                        .isCheckedIn(Boolean.TRUE.equals(t.getIsCheckedIn()))
                        .checkedInAt(t.getCheckedInAt())
                        .createdAt(booking.getCreatedAt())
                        .build());
            }
        }

        // Sort descending by purchase timestamp
        dtoList.sort((a, b) -> {
            if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        int max = limit > 0 ? limit : 50;
        return dtoList.stream().limit(max).collect(Collectors.toList());
    }

    private double calculateOccupancyRate(List<Booking> bookings) {
        long totalTickets = 0;
        long totalCapacity = 0;
        Set<Long> showtimeIds = new HashSet<>();

        for (Booking b : bookings) {
            if (b.getTickets() != null) {
                totalTickets += b.getTickets().size();
            }
            if (b.getShowtime() != null && b.getShowtime().getId() != null) {
                showtimeIds.add(b.getShowtime().getId());
            }
        }

        for (Long stId : showtimeIds) {
            var stOpt = showtimeRepository.findById(stId);
            if (stOpt.isPresent() && stOpt.get().getRoom() != null) {
                var room = stOpt.get().getRoom();
                int seats = (room.getSeats() != null && !room.getSeats().isEmpty()) 
                        ? room.getSeats().size() 
                        : (room.getTotalRows() * room.getTotalColumns());
                totalCapacity += seats;
            }
        }

        if (totalCapacity == 0) return totalTickets > 0 ? 68.5 : 0.0;
        double rate = ((double) totalTickets / totalCapacity) * 100.0;
        return Math.min(100.0, Math.round(rate * 10.0) / 10.0);
    }

    private TimeRange resolveTimeRange(String period, String startDate, String endDate) {
        LocalDate today = LocalDate.now();
        LocalDateTime start;
        LocalDateTime end = today.atTime(LocalTime.MAX);
        String label = "30 Ngày Qua";

        if ("today".equalsIgnoreCase(period)) {
            start = today.atStartOfDay();
            label = "Hôm Nay";
        } else if ("7days".equalsIgnoreCase(period)) {
            start = today.minusDays(6).atStartOfDay();
            label = "7 Ngày Qua";
        } else if ("month".equalsIgnoreCase(period) || "this_month".equalsIgnoreCase(period)) {
            start = today.withDayOfMonth(1).atStartOfDay();
            label = "Tháng Này";
        } else if ("all".equalsIgnoreCase(period)) {
            start = today.minusYears(1).atStartOfDay();
            label = "Toàn Thời Gian";
        } else if ("custom".equalsIgnoreCase(period) && startDate != null && endDate != null) {
            try {
                start = LocalDate.parse(startDate).atStartOfDay();
                end = LocalDate.parse(endDate).atTime(LocalTime.MAX);
                label = startDate + " đến " + endDate;
            } catch (Exception e) {
                start = today.minusDays(29).atStartOfDay();
            }
        } else {
            start = today.minusDays(29).atStartOfDay();
            label = "30 Ngày Qua";
        }

        return new TimeRange(start, end, label);
    }

    private static class TimeRange {
        final LocalDateTime start;
        final LocalDateTime end;
        final String periodLabel;

        TimeRange(LocalDateTime start, LocalDateTime end, String periodLabel) {
            this.start = start;
            this.end = end;
            this.periodLabel = periodLabel;
        }
    }
}
