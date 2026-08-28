package com.cineplex.service.impl;

import com.cineplex.config.VnpayConfig;
import com.cineplex.dto.booking.OnlineCheckoutRequest;
import com.cineplex.dto.booking.OnlineCheckoutResponse;
import com.cineplex.dto.booking.SnackOrderItemDto;
import com.cineplex.dto.payment.PaymentResultDto;
import com.cineplex.dto.payment.VnpayIpnResponse;
import com.cineplex.dto.voucher.ApplyVoucherRequest;
import com.cineplex.dto.voucher.ApplyVoucherResponse;
import com.cineplex.entity.*;
import com.cineplex.entity.enums.BookingChannel;
import com.cineplex.entity.enums.BookingStatus;
import com.cineplex.entity.enums.PaymentMethod;
import com.cineplex.entity.enums.PaymentStatus;
import com.cineplex.exception.BadRequestException;
import com.cineplex.exception.ConflictException;
import com.cineplex.exception.ResourceNotFoundException;
import com.cineplex.repository.*;
import com.cineplex.service.PaymentService;
import com.cineplex.service.SeatHoldService;
import com.cineplex.service.VoucherService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final VnpayConfig vnpayConfig;
    private final SeatHoldService seatHoldService;
    private final VoucherService voucherService;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final BookingSnackRepository bookingSnackRepository;
    private final PaymentRepository paymentRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final SnackRepository snackRepository;
    private final VoucherRepository voucherRepository;
    private final UserRepository userRepository;
    private final StringRedisTemplate redisTemplate;

    @Override
    @Transactional
    public OnlineCheckoutResponse createOnlineCheckout(Long userId, OnlineCheckoutRequest request, HttpServletRequest httpRequest) {
        log.info("Creating online checkout for user ID: {}, showtime ID: {}, seats: {}",
                userId, request.getShowtimeId(), request.getSeatIds());

        // 1. Fetch User
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin tài khoản người dùng"));
        }

        // 2. Fetch Showtime
        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy suất chiếu ID: " + request.getShowtimeId()));

        // 3. Extend Seat Hold to 10 mins (600s)
        seatHoldService.extendSeatHold(request.getHoldSessionId(), request.getShowtimeId(), request.getSeatIds(), 600);

        // 4. Fetch Seats and calculate ticket price
        List<Seat> seats = seatRepository.findAllById(request.getSeatIds());
        if (seats.size() != request.getSeatIds().size()) {
            throw new BadRequestException("Một số ghế trong danh sách không tồn tại.");
        }

        BigDecimal totalSeatsAmount = BigDecimal.ZERO;
        List<Ticket> tickets = new ArrayList<>();
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String bookingCode = "CPX-" + datePrefix + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        for (Seat seat : seats) {
            BigDecimal extraFee = (seat.getSeatType() != null && seat.getSeatType().getSurchargePrice() != null)
                    ? seat.getSeatType().getSurchargePrice()
                    : BigDecimal.ZERO;
            BigDecimal seatPrice = showtime.getBasePrice().add(extraFee);
            totalSeatsAmount = totalSeatsAmount.add(seatPrice);

            String ticketCode = "TK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            String qrToken = UUID.randomUUID().toString();

            Ticket ticket = Ticket.builder()
                    .seat(seat)
                    .price(seatPrice)
                    .ticketCode(ticketCode)
                    .qrCodeToken(qrToken)
                    .isCheckedIn(false)
                    .build();
            tickets.add(ticket);
        }

        // 5. Calculate Snacks if any
        BigDecimal totalSnacksAmount = BigDecimal.ZERO;
        List<BookingSnack> bookingSnacks = new ArrayList<>();
        if (request.getSnacks() != null && !request.getSnacks().isEmpty()) {
            for (SnackOrderItemDto item : request.getSnacks()) {
                Snack snack = snackRepository.findById(item.getSnackId())
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bắp nước ID: " + item.getSnackId()));

                BigDecimal itemTotal = snack.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                totalSnacksAmount = totalSnacksAmount.add(itemTotal);

                BookingSnack bs = BookingSnack.builder()
                        .snack(snack)
                        .quantity(item.getQuantity())
                        .unitPrice(snack.getPrice())
                        .totalPrice(itemTotal)
                        .build();
                bookingSnacks.add(bs);
            }
        }

        BigDecimal subtotal = totalSeatsAmount.add(totalSnacksAmount);

        // 6. Voucher validation and calculation
        BigDecimal discountAmount = BigDecimal.ZERO;
        Voucher voucher = null;
        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            ApplyVoucherResponse voucherRes = voucherService.applyVoucher(ApplyVoucherRequest.builder()
                    .voucherCode(request.getVoucherCode())
                    .orderAmount(subtotal)
                    .build());

            discountAmount = voucherRes.getDiscountAmount();
            voucher = voucherRepository.findByCode(request.getVoucherCode().trim().toUpperCase()).orElse(null);
        }

        BigDecimal finalAmount = subtotal.subtract(discountAmount).max(BigDecimal.ZERO);

        // 7. Save Booking entity
        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .user(user)
                .showtime(showtime)
                .voucher(voucher)
                .totalAmount(subtotal)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .status(BookingStatus.PENDING)
                .channel(BookingChannel.ONLINE)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Link parent booking to tickets and snacks
        for (Ticket t : tickets) {
            t.setBooking(savedBooking);
        }
        ticketRepository.saveAll(tickets);

        for (BookingSnack bs : bookingSnacks) {
            bs.setBooking(savedBooking);
        }
        bookingSnackRepository.saveAll(bookingSnacks);

        // 8. Create Payment Record
        Payment payment = Payment.builder()
                .booking(savedBooking)
                .paymentMethod(PaymentMethod.VNPAY)
                .amount(finalAmount)
                .status(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        // 9. Build VNPAY Sandbox URL
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        String vnpCreateDate = VnpayConfig.formatDate(cld);

        cld.add(Calendar.MINUTE, 10); // 10 minutes sync with Redis
        String vnpExpireDate = VnpayConfig.formatDate(cld);
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

        long vnpAmount = finalAmount.multiply(new BigDecimal(100)).longValue();
        String ipAddress = getClientIp(httpRequest);

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", VnpayConfig.VNP_VERSION);
        vnpParams.put("vnp_Command", VnpayConfig.VNP_COMMAND);
        vnpParams.put("vnp_TmnCode", vnpayConfig.getTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(vnpAmount));
        vnpParams.put("vnp_CurrCode", VnpayConfig.VNP_CURR_CODE);
        vnpParams.put("vnp_TxnRef", bookingCode);
        vnpParams.put("vnp_OrderInfo", "Thanh toan don dat ve CINEPLEX " + bookingCode);
        vnpParams.put("vnp_OrderType", VnpayConfig.VNP_ORDER_TYPE);
        vnpParams.put("vnp_Locale", VnpayConfig.VNP_LOCALE);
        vnpParams.put("vnp_ReturnUrl", vnpayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr", ipAddress);
        vnpParams.put("vnp_CreateDate", vnpCreateDate);
        vnpParams.put("vnp_ExpireDate", vnpExpireDate);

        String secureHash = VnpayConfig.hashAllFields(vnpParams, vnpayConfig.getHashSecret());
        String queryUrl = VnpayConfig.buildQueryUrl(vnpParams) + "&vnp_SecureHash=" + secureHash;
        String paymentUrl = vnpayConfig.getUrl() + "?" + queryUrl;

        log.info("Generated VNPAY payment URL for booking {}: {}", bookingCode, paymentUrl);

        return OnlineCheckoutResponse.builder()
                .bookingCode(bookingCode)
                .paymentUrl(paymentUrl)
                .totalAmount(subtotal)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .expiresAt(expiresAt)
                .message("Tạo URL thanh toán VNPAY thành công")
                .build();
    }

    @Override
    @Transactional
    public VnpayIpnResponse processVnpayIpn(Map<String, String> vnpParams) {
        log.info("Processing VNPAY IPN webhook with params: {}", vnpParams);

        Map<String, String> fields = new HashMap<>(vnpParams);
        String vnpSecureHash = fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");

        // 1. Verify Checksum
        String expectedHash = VnpayConfig.hashAllFields(fields, vnpayConfig.getHashSecret());
        if (vnpSecureHash == null || !expectedHash.equalsIgnoreCase(vnpSecureHash)) {
            log.warn("Invalid VNPAY IPN signature! expected: {}, got: {}", expectedHash, vnpSecureHash);
            return VnpayIpnResponse.builder().rspCode("97").message("Invalid Checksum").build();
        }

        // 2. Find Booking
        String bookingCode = vnpParams.get("vnp_TxnRef");
        Booking booking = bookingRepository.findByBookingCode(bookingCode).orElse(null);
        if (booking == null) {
            log.warn("Booking not found for code: {}", bookingCode);
            return VnpayIpnResponse.builder().rspCode("01").message("Order not found").build();
        }

        // 3. Check duplicate update
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            log.info("Booking {} already confirmed", bookingCode);
            return VnpayIpnResponse.builder().rspCode("02").message("Order already confirmed").build();
        }

        // 4. Verify Amount
        long vnpAmount = Long.parseLong(vnpParams.getOrDefault("vnp_Amount", "0"));
        long expectedAmount = booking.getFinalAmount().multiply(new BigDecimal(100)).longValue();
        if (vnpAmount != expectedAmount) {
            log.warn("Amount mismatch for {}: expected {}, received {}", bookingCode, expectedAmount, vnpAmount);
            return VnpayIpnResponse.builder().rspCode("04").message("Invalid Amount").build();
        }

        // 5. Check Transaction Status
        String responseCode = vnpParams.get("vnp_ResponseCode");
        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);

        if ("00".equals(responseCode)) {
            // Payment SUCCESS
            booking.setStatus(BookingStatus.CONFIRMED);

            if (payment != null) {
                payment.setStatus(PaymentStatus.SUCCESS);
                payment.setTransactionId(vnpParams.get("vnp_TransactionNo"));
                payment.setVnpTransactionNo(vnpParams.get("vnp_TransactionNo"));
                payment.setVnpBankCode(vnpParams.get("vnp_BankCode"));
                payment.setPaidAt(LocalDateTime.now());
                paymentRepository.save(payment);
            }

            // Update voucher used count if voucher was applied
            if (booking.getVoucher() != null) {
                Voucher voucher = booking.getVoucher();
                voucher.setUsedCount(voucher.getUsedCount() + 1);
                voucherRepository.save(voucher);
            }

            bookingRepository.save(booking);

            // Clean up Redis seat locks for confirmed seats
            List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
            for (Ticket t : tickets) {
                String key = "seat_hold:" + booking.getShowtime().getId() + ":" + t.getSeat().getId();
                redisTemplate.delete(key);
            }

            log.info("Successfully confirmed booking {} and finalized payment {}", bookingCode, payment != null ? payment.getId() : null);
            return VnpayIpnResponse.builder().rspCode("00").message("Confirm Success").build();
        } else {
            // Payment FAILED / CANCELLED
            booking.setStatus(BookingStatus.CANCELLED);
            if (payment != null) {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
            }
            bookingRepository.save(booking);

            log.info("Booking {} marked as CANCELLED due to VNPAY response code: {}", bookingCode, responseCode);
            return VnpayIpnResponse.builder().rspCode("00").message("Confirm Success").build();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResultDto processVnpayReturn(Map<String, String> vnpParams) {
        Map<String, String> fields = new HashMap<>(vnpParams);
        String vnpSecureHash = fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");

        String expectedHash = VnpayConfig.hashAllFields(fields, vnpayConfig.getHashSecret());
        boolean isValidSignature = vnpSecureHash != null && expectedHash.equalsIgnoreCase(vnpSecureHash);

        String bookingCode = vnpParams.get("vnp_TxnRef");
        String responseCode = vnpParams.get("vnp_ResponseCode");
        String transactionNo = vnpParams.get("vnp_TransactionNo");
        String bankCode = vnpParams.get("vnp_BankCode");
        long vnpAmount = Long.parseLong(vnpParams.getOrDefault("vnp_Amount", "0")) / 100;

        PaymentStatus status = (isValidSignature && "00".equals(responseCode))
                ? PaymentStatus.SUCCESS
                : PaymentStatus.FAILED;

        String message = isValidSignature
                ? ("00".equals(responseCode) ? "Giao dịch thanh toán thành công!" : "Giao dịch thanh toán không thành công.")
                : "Chữ ký xác thực VNPAY không hợp lệ.";

        return PaymentResultDto.builder()
                .bookingCode(bookingCode)
                .transactionId(transactionNo)
                .vnpBankCode(bankCode)
                .vnpTransactionNo(transactionNo)
                .amount(BigDecimal.valueOf(vnpAmount))
                .status(status)
                .responseCode(responseCode)
                .message(message)
                .paidAt(LocalDateTime.now())
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        if ("0:0:0:0:0:0:0:1".equals(ipAddress)) {
            ipAddress = "127.0.0.1";
        }
        return ipAddress != null ? ipAddress.split(",")[0].trim() : "127.0.0.1";
    }
}
