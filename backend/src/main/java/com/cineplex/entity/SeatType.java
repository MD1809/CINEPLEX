package com.cineplex.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "seat_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 50)
    private String name; // REGULAR, VIP, SWEETBOX

    @Column(name = "surcharge_price", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal surchargePrice = BigDecimal.ZERO;

    @Column(name = "color_code", length = 20)
    private String colorCode; // e.g., #64748b, #e9c349, #ec4899
}
