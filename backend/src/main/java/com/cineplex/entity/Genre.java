package com.cineplex.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "genres", indexes = {
    @Index(name = "idx_genre_slug", columnList = "slug", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Genre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;
}
