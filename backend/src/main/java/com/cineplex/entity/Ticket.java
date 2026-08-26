package com.cineplex.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets", uniqueConstraints = {
    @UniqueConstraint(name = "uk_booking_seat", columnNames = {"booking_id", "seat_id"})
}, indexes = {
    @Index(name = "idx_ticket_code", columnList = "ticket_code", unique = true),
    @Index(name = "idx_ticket_qr_token", columnList = "qr_code_token", unique = true),
    @Index(name = "idx_ticket_checkin", columnList = "is_checked_in")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "ticket_code", nullable = false, unique = true, length = 50)
    private String ticketCode;

    @Column(name = "qr_code_token", nullable = false, unique = true, length = 100)
    private String qrCodeToken;

    @Column(name = "is_checked_in", nullable = false)
    @Builder.Default
    private Boolean isCheckedIn = false;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checked_in_by")
    private User checkedInBy;
}
