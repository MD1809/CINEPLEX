package com.cineplex.service.impl;

import com.cineplex.dto.booking.BookingSnackDetailDto;
import com.cineplex.dto.booking.SnackOrderItemDto;
import com.cineplex.dto.booking.TicketDetailDto;
import com.cineplex.dto.common.PageResponse;
import com.cineplex.dto.showtime.ShowtimeResponse;
import com.cineplex.dto.staff.*;
import com.cineplex.dto.voucher.ApplyVoucherRequest;
import com.cineplex.entity.*;
import com.cineplex.entity.enums.*;
import com.cineplex.exception.BadRequestException;
import com.cineplex.exception.ResourceNotFoundException;
import com.cineplex.repository.*;
import com.cineplex.service.QrCodeService;
import com.cineplex.service.StaffService;
import com.cineplex.service.VoucherService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StaffServiceImpl implements StaffService {

    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final SnackRepository snackRepository;
    private final VoucherRepository voucherRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final BookingSnackRepository bookingSnackRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final QrCodeService qrCodeService;
    private final VoucherService voucherService;

    private static final String POS_BANK_NAME = "MB Bank (Ngân hàng Quân Đội)";
    private static final String POS_BANK_ACCOUNT_NO = "999988886666";
    private static final String POS_ACCOUNT_HOLDER = "CINEPLEX CINEMA VN";

    @Override
    @Transactional
    public PosCheckoutResponse checkoutCash(Long staffId, PosCheckoutRequest request) {
        log.info("Staff ID {} performing CASH checkout for showtime ID {}", staffId, request.getShowtimeId());
        User staff = getStaffUser(staffId);

        BookingPreparation prep = prepareBooking(staff, request, PaymentMethod.CASH, BookingStatus.CONFIRMED);
        Booking booking = prep.booking;
        Payment payment = Payment.builder()
                .booking(booking)
                .paymentMethod(PaymentMethod.CASH)
                .amount(booking.getFinalAmount())
                .status(PaymentStatus.SUCCESS)
                .paidAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);
        booking.setPayment(payment);

        BigDecimal cashReceived = request.getCashReceived() != null ? request.getCashReceived() : booking.getFinalAmount();
        if (cashReceived.compareTo(booking.getFinalAmount()) < 0) {
            throw new BadRequestException("Số tiền khách đưa (" + cashReceived + ") không đủ thanh toán đơn hàng (" + booking.getFinalAmount() + ")");
        }
        BigDecimal changeAmount = cashReceived.subtract(booking.getFinalAmount());

        return buildPosCheckoutResponse(booking, cashReceived, changeAmount, PaymentMethod.CASH);
    }

    @Override
    @Transactional
    public PosTransferResponse checkoutTransfer(Long staffId, PosCheckoutRequest request) {
        log.info("Staff ID {} performing BANK_TRANSFER checkout for showtime ID {}", staffId, request.getShowtimeId());
        User staff = getStaffUser(staffId);

        BookingPreparation prep = prepareBooking(staff, request, PaymentMethod.BANK_TRANSFER, BookingStatus.PENDING);
        Booking booking = prep.booking;
        Payment payment = Payment.builder()
                .booking(booking)
                .paymentMethod(PaymentMethod.BANK_TRANSFER)
                .amount(booking.getFinalAmount())
                .status(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);
        booking.setPayment(payment);

        // Generate dynamic transfer QR Code
        String transferContent = booking.getBookingCode();
        String qrPayload = String.format("https://img.vietqr.io/image/MB-999988886666-compact2.png?amount=%s&addInfo=%s&accountName=CINEPLEX%%20CINEMA",
                booking.getFinalAmount().toPlainString(), transferContent);
        String qrBase64 = qrCodeService.generateQrCodeBase64(qrPayload, 300, 300);

        return PosTransferResponse.builder()
                .bookingCode(booking.getBookingCode())
                .finalAmount(booking.getFinalAmount())
                .qrCodeBase64(qrBase64)
                .bankName(POS_BANK_NAME)
                .bankAccountNo(POS_BANK_ACCOUNT_NO)
                .accountHolder(POS_ACCOUNT_HOLDER)
                .transferContent(transferContent)
                .status(booking.getStatus())
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .message("Tạo mã QR chuyển khoản thành công. Mời khách quét mã thanh toán.")
                .build();
    }

    @Override
    @Transactional
    public PosCheckoutResponse confirmTransfer(Long staffId, String bookingCode) {
        log.info("Staff ID {} confirming transfer for booking {}", staffId, bookingCode);
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng mã: " + bookingCode));

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            log.info("Booking {} already confirmed", bookingCode);
        } else {
            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

            Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
            if (payment != null) {
                payment.setStatus(PaymentStatus.SUCCESS);
                payment.setPaidAt(LocalDateTime.now());
                paymentRepository.save(payment);
            }
        }

        return buildPosCheckoutResponse(booking, booking.getFinalAmount(), BigDecimal.ZERO, PaymentMethod.BANK_TRANSFER);
    }

    @Override
    @Transactional
    public TicketCheckInResponse checkInTicket(Long staffId, TicketCheckInRequest request) {
        String token = request.getTokenOrCode().trim();
        log.info("Staff ID {} attempting to check in ticket with token/code: {}", staffId, token);
        User staff = getStaffUser(staffId);

        Ticket ticket = ticketRepository.findByQrCodeTokenOrTicketCode(token, token)
                .orElse(null);

        if (ticket == null) {
            return TicketCheckInResponse.builder()
                    .valid(false)
                    .statusCode("NOT_FOUND")
                    .message("Không tìm thấy vé trong hệ thống. Vui lòng kiểm tra lại mã vé!")
                    .build();
        }

        Booking booking = ticket.getBooking();
        Showtime showtime = booking.getShowtime();
        Movie movie = showtime.getMovie();
        Room room = showtime.getRoom();
        Seat seat = ticket.getSeat();

        // 1. Check if already checked in
        if (Boolean.TRUE.equals(ticket.getIsCheckedIn())) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy");
            String checkinTimeStr = ticket.getCheckedInAt() != null ? ticket.getCheckedInAt().format(formatter) : "trước đó";
            return TicketCheckInResponse.builder()
                    .valid(false)
                    .statusCode("ALREADY_CHECKED_IN")
                    .message("VÉ ĐÃ ĐƯỢC CHECK-IN vào lúc " + checkinTimeStr + "! Không thể sử dụng lại.")
                    .ticketCode(ticket.getTicketCode())
                    .movieTitle(movie.getTitle())
                    .moviePosterUrl(movie.getPosterUrl())
                    .roomName(room.getName())
                    .screenType(room.getScreenType().name())
                    .seatCode(seat.getSeatCode())
                    .seatType(seat.getSeatType() != null ? seat.getSeatType().getName() : "STANDARD")
                    .startTime(showtime.getStartTime())
                    .endTime(showtime.getEndTime())
                    .customerName(booking.getUser() != null ? booking.getUser().getFullName() : "Khách mua tại quầy")
                    .checkedInAt(ticket.getCheckedInAt())
                    .staffName(ticket.getCheckedInBy() != null ? ticket.getCheckedInBy().getFullName() : "N/A")
                    .build();
        }

        // 2. Check if specific showtime requested
        if (request.getCurrentShowtimeId() != null && !showtime.getId().equals(request.getCurrentShowtimeId())) {
            return TicketCheckInResponse.builder()
                    .valid(false)
                    .statusCode("INVALID_SHOWTIME")
                    .message("SAI SUẤT CHIẾU! Vé này thuộc suất chiếu khác: " + showtime.getStartTime())
                    .ticketCode(ticket.getTicketCode())
                    .movieTitle(movie.getTitle())
                    .roomName(room.getName())
                    .seatCode(seat.getSeatCode())
                    .startTime(showtime.getStartTime())
                    .build();
        }

        // 3. Valid Check-in
        ticket.setIsCheckedIn(true);
        ticket.setCheckedInAt(LocalDateTime.now());
        ticket.setCheckedInBy(staff);
        ticketRepository.save(ticket);

        return TicketCheckInResponse.builder()
                .valid(true)
                .statusCode("SUCCESS")
                .message("CHECK-IN HỢP LỆ! Mời khách vào phòng chiếu.")
                .ticketCode(ticket.getTicketCode())
                .movieTitle(movie.getTitle())
                .moviePosterUrl(movie.getPosterUrl())
                .roomName(room.getName())
                .screenType(room.getScreenType().name())
                .seatCode(seat.getSeatCode())
                .seatType(seat.getSeatType() != null ? seat.getSeatType().getName() : "STANDARD")
                .startTime(showtime.getStartTime())
                .endTime(showtime.getEndTime())
                .customerName(booking.getUser() != null ? booking.getUser().getFullName() : "Khách mua tại quầy")
                .checkedInAt(ticket.getCheckedInAt())
                .staffName(staff.getFullName())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ShiftReportResponse getShiftReport(Long staffId) {
        return getShiftReportCustom(staffId, LocalDate.now(), LocalDate.now());
    }

    @Override
    @Transactional(readOnly = true)
    public ShiftReportResponse getShiftReportCustom(Long staffId, LocalDate startDate, LocalDate endDate) {
        User staff = getStaffUser(staffId);
        LocalDate start = startDate != null ? startDate : LocalDate.now();
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.atTime(LocalTime.MAX);

        List<Booking> staffBookings = bookingRepository.findByStaffIdAndCreatedAtBetween(staffId, startDateTime, endDateTime);

        long totalOrders = 0;
        long totalTicketsSold = 0;
        BigDecimal cashRevenue = BigDecimal.ZERO;
        BigDecimal transferRevenue = BigDecimal.ZERO;

        for (Booking b : staffBookings) {
            if (b.getStatus() == BookingStatus.CONFIRMED) {
                totalOrders++;
                totalTicketsSold += b.getTickets().size();
                Payment p = b.getPayment();
                if (p != null && p.getStatus() == PaymentStatus.SUCCESS) {
                    if (p.getPaymentMethod() == PaymentMethod.CASH) {
                        cashRevenue = cashRevenue.add(b.getFinalAmount());
                    } else if (p.getPaymentMethod() == PaymentMethod.BANK_TRANSFER) {
                        transferRevenue = transferRevenue.add(b.getFinalAmount());
                    }
                }
            }
        }

        BigDecimal totalRevenue = cashRevenue.add(transferRevenue);

        return ShiftReportResponse.builder()
                .staffId(staff.getId())
                .staffName(staff.getFullName())
                .staffEmail(staff.getEmail())
                .totalOrders(totalOrders)
                .totalTicketsSold(totalTicketsSold)
                .cashRevenue(cashRevenue)
                .transferRevenue(transferRevenue)
                .totalRevenue(totalRevenue)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StaffOrderSummaryDto> getStaffOrdersHistory(
            Long staffId,
            LocalDate startDate,
            LocalDate endDate,
            PaymentMethod paymentMethod,
            String search,
            int page,
            int size
    ) {
        Specification<Booking> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (staffId != null) {
                predicates.add(cb.equal(root.get("staff").get("id"), staffId));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate.atStartOfDay()));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate.atTime(LocalTime.MAX)));
            }

            if (paymentMethod != null) {
                predicates.add(cb.equal(root.get("payment").get("paymentMethod"), paymentMethod));
            }

            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Predicate codeMatch = cb.like(cb.lower(root.get("bookingCode")), term);
                Predicate movieMatch = cb.like(cb.lower(root.get("showtime").get("movie").get("title")), term);
                predicates.add(cb.or(codeMatch, movieMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Booking> bookingPage = bookingRepository.findAll(spec, pageRequest);

        List<StaffOrderSummaryDto> content = bookingPage.getContent().stream()
                .map(b -> {
                    List<String> seatCodes = b.getTickets().stream()
                            .map(t -> t.getSeat().getSeatCode())
                            .collect(Collectors.toList());
                    int snacksCount = b.getBookingSnacks().stream()
                            .mapToInt(BookingSnack::getQuantity)
                            .sum();

                    return StaffOrderSummaryDto.builder()
                            .id(b.getId())
                            .bookingCode(b.getBookingCode())
                            .movieTitle(b.getShowtime().getMovie().getTitle())
                            .moviePosterUrl(b.getShowtime().getMovie().getPosterUrl())
                            .roomName(b.getShowtime().getRoom().getName())
                            .screenType(b.getShowtime().getRoom().getScreenType().name())
                            .showtimeStart(b.getShowtime().getStartTime())
                            .ticketsCount(b.getTickets().size())
                            .seatCodes(seatCodes)
                            .snacksCount(snacksCount)
                            .totalAmount(b.getTotalAmount())
                            .discountAmount(b.getDiscountAmount())
                            .finalAmount(b.getFinalAmount())
                            .paymentMethod(b.getPayment() != null ? b.getPayment().getPaymentMethod() : PaymentMethod.CASH)
                            .status(b.getStatus())
                            .createdAt(b.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());

        return PageResponse.<StaffOrderSummaryDto>builder()
                .content(content)
                .pageNumber(bookingPage.getNumber())
                .pageSize(bookingPage.getSize())
                .totalElements(bookingPage.getTotalElements())
                .totalPages(bookingPage.getTotalPages())
                .last(bookingPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PosCheckoutResponse getBookingReceipt(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng mã: " + bookingCode));
        Payment payment = booking.getPayment();
        PaymentMethod pm = payment != null ? payment.getPaymentMethod() : PaymentMethod.CASH;
        return buildPosCheckoutResponse(booking, booking.getFinalAmount(), BigDecimal.ZERO, pm);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getTodayShowtimes() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        List<Showtime> showtimes = showtimeRepository.findByStartTimeBetween(startOfDay, endOfDay);
        return showtimes.stream()
                .map(ShowtimeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Helper methods
    private User getStaffUser(Long staffId) {
        if (staffId == null) return null;
        return userRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên ID: " + staffId));
    }

    private static class BookingPreparation {
        Booking booking;
        List<Ticket> tickets;
        List<BookingSnack> snacks;
    }

    private BookingPreparation prepareBooking(User staff, PosCheckoutRequest request, PaymentMethod paymentMethod, BookingStatus initialStatus) {
        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy suất chiếu ID: " + request.getShowtimeId()));

        List<Long> bookedSeatIds = ticketRepository.findBookedSeatIdsByShowtimeId(showtime.getId());
        for (Long seatId : request.getSeatIds()) {
            if (bookedSeatIds.contains(seatId)) {
                throw new BadRequestException("Ghế ID " + seatId + " đã có người mua. Vui lòng chọn ghế khác!");
            }
        }

        List<Seat> seats = seatRepository.findAllById(request.getSeatIds());
        if (seats.size() != request.getSeatIds().size()) {
            throw new BadRequestException("Một số ghế đã chọn không tồn tại trong hệ thống");
        }

        // 1. Calculate seats price
        BigDecimal basePrice = showtime.getBasePrice();
        BigDecimal totalSeatsAmount = BigDecimal.ZERO;
        List<Ticket> tickets = new ArrayList<>();

        for (Seat seat : seats) {
            BigDecimal seatPrice = basePrice;
            if (seat.getSeatType() != null && seat.getSeatType().getSurchargePrice() != null) {
                seatPrice = seatPrice.add(seat.getSeatType().getSurchargePrice());
            }
            totalSeatsAmount = totalSeatsAmount.add(seatPrice);

            String ticketCode = "TK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            String qrToken = UUID.randomUUID().toString().replace("-", "");

            tickets.add(Ticket.builder()
                    .seat(seat)
                    .price(seatPrice)
                    .ticketCode(ticketCode)
                    .qrCodeToken(qrToken)
                    .isCheckedIn(false)
                    .build());
        }

        // 2. Calculate snacks price
        BigDecimal totalSnacksAmount = BigDecimal.ZERO;
        List<BookingSnack> bookingSnacks = new ArrayList<>();
        if (request.getSnacks() != null && !request.getSnacks().isEmpty()) {
            for (SnackOrderItemDto item : request.getSnacks()) {
                if (item.getQuantity() != null && item.getQuantity() > 0) {
                    Snack snack = snackRepository.findById(item.getSnackId())
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bắp nước ID: " + item.getSnackId()));
                    BigDecimal itemTotal = snack.getPrice().multiply(new BigDecimal(item.getQuantity()));
                    totalSnacksAmount = totalSnacksAmount.add(itemTotal);

                    bookingSnacks.add(BookingSnack.builder()
                            .snack(snack)
                            .quantity(item.getQuantity())
                            .unitPrice(snack.getPrice())
                            .totalPrice(itemTotal)
                            .build());
                }
            }
        }

        BigDecimal subtotal = totalSeatsAmount.add(totalSnacksAmount);

        // 3. Voucher
        BigDecimal discountAmount = BigDecimal.ZERO;
        Voucher voucher = null;
        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            voucher = voucherRepository.findByCode(request.getVoucherCode().trim().toUpperCase()).orElse(null);
            if (voucher != null) {
                discountAmount = voucherService.applyVoucher(ApplyVoucherRequest.builder()
                        .voucherCode(voucher.getCode())
                        .orderAmount(subtotal)
                        .build()).getDiscountAmount();
            }
        }

        BigDecimal finalAmount = subtotal.subtract(discountAmount).max(BigDecimal.ZERO);
        String bookingCode = "CPX-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .user(null) // POS anonymous/guest
                .staff(staff)
                .showtime(showtime)
                .voucher(voucher)
                .totalAmount(subtotal)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .status(initialStatus)
                .channel(BookingChannel.POS)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        for (Ticket t : tickets) {
            t.setBooking(savedBooking);
        }
        ticketRepository.saveAll(tickets);

        for (BookingSnack bs : bookingSnacks) {
            bs.setBooking(savedBooking);
        }
        bookingSnackRepository.saveAll(bookingSnacks);

        BookingPreparation prep = new BookingPreparation();
        prep.booking = savedBooking;
        prep.tickets = tickets;
        prep.snacks = bookingSnacks;
        return prep;
    }

    private PosCheckoutResponse buildPosCheckoutResponse(Booking booking, BigDecimal cashReceived, BigDecimal changeAmount, PaymentMethod paymentMethod) {
        Showtime showtime = booking.getShowtime();
        Movie movie = showtime.getMovie();
        Room room = showtime.getRoom();

        List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
        List<TicketDetailDto> ticketDtos = tickets.stream()
                .map(t -> TicketDetailDto.builder()
                        .id(t.getId())
                        .ticketCode(t.getTicketCode())
                        .qrCodeToken(t.getQrCodeToken())
                        .qrCodeBase64(qrCodeService.generateQrCodeBase64(t.getQrCodeToken(), 250, 250))
                        .seatCode(t.getSeat().getSeatCode())
                        .seatType(t.getSeat().getSeatType() != null ? t.getSeat().getSeatType().getName() : "STANDARD")
                        .price(t.getPrice())
                        .isCheckedIn(t.getIsCheckedIn())
                        .checkedInAt(t.getCheckedInAt())
                        .build())
                .collect(Collectors.toList());

        List<BookingSnack> snacks = bookingSnackRepository.findByBookingId(booking.getId());
        List<BookingSnackDetailDto> snackDtos = snacks.stream()
                .map(s -> BookingSnackDetailDto.builder()
                        .snackName(s.getSnack().getName())
                        .quantity(s.getQuantity())
                        .unitPrice(s.getUnitPrice())
                        .totalPrice(s.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        return PosCheckoutResponse.builder()
                .bookingCode(booking.getBookingCode())
                .movieTitle(movie.getTitle())
                .roomName(room.getName())
                .screenType(room.getScreenType().name())
                .startTime(showtime.getStartTime())
                .endTime(showtime.getEndTime())
                .totalAmount(booking.getTotalAmount())
                .discountAmount(booking.getDiscountAmount())
                .finalAmount(booking.getFinalAmount())
                .cashReceived(cashReceived)
                .changeAmount(changeAmount)
                .paymentMethod(paymentMethod)
                .status(booking.getStatus())
                .staffName(booking.getStaff() != null ? booking.getStaff().getFullName() : "Nhân viên quầy")
                .createdAt(booking.getCreatedAt())
                .tickets(ticketDtos)
                .snacks(snackDtos)
                .build();
    }
}
