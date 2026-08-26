package com.cineplex.entity;

import com.cineplex.entity.enums.SnackCategory;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "snacks", indexes = {
    @Index(name = "idx_snack_category", columnList = "category"),
    @Index(name = "idx_snack_available", columnList = "is_available")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Snack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SnackCategory category;

    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;
}
