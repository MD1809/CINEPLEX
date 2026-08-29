package com.cineplex.service.impl;

import com.cineplex.entity.*;
import com.cineplex.repository.BookingRepository;
import com.cineplex.repository.BookingSnackRepository;
import com.cineplex.repository.TicketRepository;
import com.cineplex.service.EmailNotificationService;
import com.cineplex.service.QrCodeService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationServiceImpl implements EmailNotificationService {

    private final JavaMailSender mailSender;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final BookingSnackRepository bookingSnackRepository;
    private final QrCodeService qrCodeService;

    @Value("${spring.mail.username:cineplex.cinema.vn@gmail.com}")
    private String fromEmail;

    @Override
    @Async
    @Transactional(readOnly = true)
    public void sendBookingConfirmationEmail(Long bookingId) {
        log.info("Preparing to send booking confirmation email for booking ID: {}", bookingId);

        try {
            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking == null) {
                log.warn("Cannot send email: Booking not found with ID {}", bookingId);
                return;
            }

            String recipientEmail = null;
            String recipientName = "Quý khách";
            if (booking.getUser() != null) {
                recipientEmail = booking.getUser().getEmail();
                if (booking.getUser().getFullName() != null) {
                    recipientName = booking.getUser().getFullName();
                }
            }

            if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
                log.info("No recipient email found for booking {}", booking.getBookingCode());
                return;
            }

            List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
            List<BookingSnack> snacks = bookingSnackRepository.findByBookingId(booking.getId());

            String htmlBody = buildHtmlEmailContent(booking, tickets, snacks, recipientName);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "CINEPLEX Cinema");
            helper.setTo(recipientEmail);
            helper.setSubject("🎬 [CINEPLEX] Xác nhận đặt vé thành công #" + booking.getBookingCode());
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Successfully sent booking confirmation email to {} for booking {}", recipientEmail, booking.getBookingCode());

        } catch (Exception ex) {
            log.error("Failed to send booking confirmation email for booking ID {}: {}", bookingId, ex.getMessage());
            // Do not rethrow in order to not disrupt background processes
        }
    }

    @Override
    @Async
    public void sendPasswordResetEmail(String toEmail, String recipientName) {
        log.info("Sending password reset email to {}", toEmail);
        try {
            String name = (recipientName != null && !recipientName.trim().isEmpty()) ? recipientName : "Quý khách";
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "CINEPLEX Cinema");
            helper.setTo(toEmail);
            helper.setSubject("🔐 [CINEPLEX] Yêu cầu đặt lại mật khẩu tài khoản");

            String html = String.format("""
                <!DOCTYPE html>
                <html>
                <head><meta charset="utf-8" /></head>
                <body style="margin: 0; padding: 20px; background-color: #0f1015; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e2e8f0;">
                    <div style="max-width: 550px; margin: 0 auto; background: #121317; border-radius: 16px; overflow: hidden; border: 1px solid #222;">
                        <div style="background: linear-gradient(135deg, #e50914 0%%, #b80710 100%%); padding: 20px; text-align: center; color: #fff;">
                            <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 2px;">CINEPLEX CINEMAS</h1>
                            <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Yêu Cầu Thiết Lập Lại Mật Khẩu</p>
                        </div>
                        <div style="padding: 24px;">
                            <p style="font-size: 14px;">Xin chào <strong>%s</strong>,</p>
                            <p style="font-size: 13px; color: #aaa; line-height: 1.6;">
                                Ban Quản trị hệ thống CINEPLEX đã gửi cho bạn yêu cầu đặt lại mật khẩu cho tài khoản <strong>%s</strong>.
                            </p>
                            <div style="background: #18191e; border: 1px solid #282930; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
                                <p style="font-size: 12px; color: #888; margin-top: 0;">Vui lòng truy cập trang đăng nhập để cập nhật mật khẩu mới của bạn:</p>
                                <a href="http://localhost:5173/login" style="display: inline-block; background: #f59e0b; color: #0f172a; font-weight: bold; font-size: 13px; text-decoration: none; padding: 10px 24px; border-radius: 8px; margin-top: 6px;">
                                    Đến Trang Đăng Nhập CINEPLEX
                                </a>
                            </div>
                            <p style="font-size: 11px; color: #777; line-height: 1.5;">
                                * Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email hoặc liên hệ với bộ phận hỗ trợ khách hàng của CINEPLEX.
                            </p>
                        </div>
                        <div style="background: #0b0c0e; padding: 12px; text-align: center; font-size: 11px; color: #555; border-top: 1px solid #1a1b20;">
                            © 2026 CINEPLEX Vietnam. All rights reserved.
                        </div>
                    </div>
                </body>
                </html>
            """, name, toEmail);

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Successfully sent password reset email to {}", toEmail);
        } catch (Exception ex) {
            log.error("Failed to send password reset email to {}: {}", toEmail, ex.getMessage());
        }
    }

    private String buildHtmlEmailContent(Booking booking, List<Ticket> tickets, List<BookingSnack> snacks, String recipientName) {
        Showtime showtime = booking.getShowtime();
        Movie movie = showtime.getMovie();
        Room room = showtime.getRoom();

        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String showtimeStr = showtime.getStartTime().format(timeFmt) + " ~ " +
                showtime.getEndTime().format(timeFmt) + " (" + showtime.getStartTime().format(dateFmt) + ")";

        NumberFormat currencyFmt = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

        StringBuilder ticketsHtml = new StringBuilder();
        for (Ticket t : tickets) {
            String qrBase64 = qrCodeService.generateQrCodeBase64(t.getQrCodeToken(), 200, 200);
            ticketsHtml.append(String.format("""
                <div style="background: #1e1f25; border: 1px solid #333; border-radius: 12px; padding: 16px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <div style="font-size: 11px; color: #888; text-transform: uppercase;">Mã Vé / Ghế Ngồi</div>
                        <div style="font-size: 18px; font-weight: bold; color: #fff; margin-top: 4px;">Ghế: <span style="color: #e50914;">%s</span> (%s)</div>
                        <div style="font-size: 12px; color: #aaa; margin-top: 2px;">Mã vé: <code style="color: #e50914; font-weight: bold;">%s</code></div>
                        <div style="font-size: 13px; color: #fff; font-weight: bold; margin-top: 4px;">Giá: %s</div>
                    </div>
                    <div style="text-align: center; margin-left: 16px;">
                        <img src="%s" width="100" height="100" style="border-radius: 8px; border: 2px solid #e50914;" alt="QR Checkin" />
                        <div style="font-size: 10px; color: #888; margin-top: 4px;">Quét mã tại rạp</div>
                    </div>
                </div>
            """,
                    t.getSeat().getSeatCode(),
                    t.getSeat().getSeatType() != null ? t.getSeat().getSeatType().getName() : "Standard",
                    t.getTicketCode(),
                    currencyFmt.format(t.getPrice()),
                    qrBase64
            ));
        }

        StringBuilder snacksHtml = new StringBuilder();
        if (snacks != null && !snacks.isEmpty()) {
            snacksHtml.append("<div style='margin-top: 16px; padding: 12px; background: #18191e; border-radius: 8px;'>");
            snacksHtml.append("<div style='font-size: 12px; font-weight: bold; color: #e50914; margin-bottom: 8px;'>🍿 BẮP NƯỚC & COMBO ĐÃ ĐẶT</div>");
            for (BookingSnack bs : snacks) {
                snacksHtml.append(String.format("""
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #ccc; margin-bottom: 4px;">
                        <span>%s &times; <strong>%d</strong></span>
                        <span style="font-weight: bold; color: #fff;">%s</span>
                    </div>
                """, bs.getSnack().getName(), bs.getQuantity(), currencyFmt.format(bs.getTotalPrice())));
            }
            snacksHtml.append("</div>");
        }

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>CINEPLEX - Vé Xem Phim Điện Tử</title>
            </head>
            <body style="margin: 0; padding: 20px; background-color: #0f1015; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
                <div style="max-width: 600px; margin: 0 auto; background: #121317; border-radius: 16px; overflow: hidden; border: 1px solid #222; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #e50914 0%%, #b80710 100%%); padding: 24px; text-align: center; color: #fff;">
                        <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">CINEPLEX</h1>
                        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Xác Nhận Đặt Vé & Thanh Toán Thành Công</p>
                    </div>

                    <!-- Body -->
                    <div style="padding: 24px;">
                        <p style="font-size: 14px; margin-top: 0;">Xin chào <strong>%s</strong>,</p>
                        <p style="font-size: 13px; color: #aaa; line-height: 1.6;">
                            Cảm ơn bạn đã lựa chọn <strong>CINEPLEX</strong>! Đơn đặt vé của bạn đã được xác nhận thanh toán thành công. Dưới đây là thông tin vé điện tử và mã QR để check-in tại quầy soát vé:
                        </p>

                        <!-- Movie Info Card -->
                        <div style="background: #18191e; border: 1px solid #282930; border-radius: 12px; padding: 16px; margin: 20px 0;">
                            <div style="font-size: 11px; color: #e50914; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Mã đơn: %s</div>
                            <h2 style="font-size: 20px; font-weight: 800; color: #fff; margin: 6px 0 12px 0;">%s</h2>
                            <table style="width: 100%%; font-size: 13px; color: #ccc; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 4px 0; color: #888;">Phòng chiếu:</td>
                                    <td style="padding: 4px 0; font-weight: bold; color: #fff; text-align: right;">%s (%s)</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0; color: #888;">Suất chiếu:</td>
                                    <td style="padding: 4px 0; font-weight: bold; color: #fff; text-align: right;">%s</td>
                                </tr>
                            </table>
                        </div>

                        <!-- Tickets List with QR -->
                        <h3 style="font-size: 14px; color: #fff; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">🎟️ Danh Sách Vé Của Bạn</h3>
                        %s

                        <!-- Snacks List -->
                        %s

                        <!-- Total Payment Summary -->
                        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px dashed #333; text-align: right;">
                            <div style="font-size: 13px; color: #888;">Tổng tiền thanh toán (Đã bao gồm VAT):</div>
                            <div style="font-size: 22px; font-weight: 900; color: #e50914; margin-top: 4px;">%s</div>
                            <div style="font-size: 11px; color: #4ade80; margin-top: 2px;">✔ Đã thanh toán qua Cổng VNPAY</div>
                        </div>

                        <!-- Notes -->
                        <div style="margin-top: 24px; padding: 14px; background: #16171d; border-radius: 8px; font-size: 11px; color: #888; line-height: 1.6;">
                            ⚠️ <strong>Lưu ý:</strong> Vui lòng có mặt tại rạp trước giờ chiếu 15 phút. Bạn có thể xuất trình mã QR trên email này hoặc ứng dụng CINEPLEX tại lối vào phòng chiếu để nhân viên quét vé.
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background: #0b0c0e; padding: 16px; text-align: center; font-size: 11px; color: #555; border-top: 1px solid #1a1b20;">
                        © 2026 CINEPLEX Vietnam. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
        """,
                recipientName,
                booking.getBookingCode(),
                movie.getTitle(),
                room.getName(),
                room.getScreenType(),
                showtimeStr,
                ticketsHtml.toString(),
                snacksHtml.toString(),
                currencyFmt.format(booking.getFinalAmount())
        );
    }
}
