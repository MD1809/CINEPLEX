package com.cineplex.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seats", uniqueConstraints = {
    @UniqueConstraint(name = "uk_room_seat", columnNames = {"room_id", "seat_code"})
}, indexes = {
    @Index(name = "idx_seat_room", columnList = "room_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seat_type_id", nullable = false)
    private SeatType seatType;

    @Column(name = "row_code", nullable = false, length = 5)
    private String rowCode; // A, B, C...

    @Column(name = "col_number", nullable = false)
    private Integer colNumber; // 1, 2, 3...

    @Column(name = "seat_code", nullable = false, length = 10)
    private String seatCode; // A1, B5, H1-H2...

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
