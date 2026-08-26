package com.cineplex;

import com.cineplex.entity.User;
import com.cineplex.entity.enums.Role;
import com.cineplex.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class DatabaseSchemaAndSeedingTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GenreRepository genreRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private SeatTypeRepository seatTypeRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private SnackRepository snackRepository;

    @Autowired
    private VoucherRepository voucherRepository;

    @Test
    @DisplayName("Verify that 13 tables are mapped and DataInitializer seeded sample data")
    void testDataSeedingAndRepositories() {
        // 1. Verify Users Seeding
        assertThat(userRepository.count()).isGreaterThanOrEqualTo(3);
        User admin = userRepository.findByEmail("admin@cineplex.vn").orElse(null);
        assertThat(admin).isNotNull();
        assertThat(admin.getRole()).isEqualTo(Role.ADMIN);

        // 2. Verify Seat Types
        assertThat(seatTypeRepository.count()).isGreaterThanOrEqualTo(3);
        assertThat(seatTypeRepository.findByName("VIP")).isPresent();
        assertThat(seatTypeRepository.findByName("SWEETBOX")).isPresent();

        // 3. Verify Genres
        assertThat(genreRepository.count()).isGreaterThanOrEqualTo(5);

        // 4. Verify Rooms and Seats
        assertThat(roomRepository.count()).isGreaterThanOrEqualTo(2);
        assertThat(seatRepository.count()).isGreaterThanOrEqualTo(100);

        // 5. Verify Snacks
        assertThat(snackRepository.count()).isGreaterThanOrEqualTo(5);

        // 6. Verify Vouchers
        assertThat(voucherRepository.count()).isGreaterThanOrEqualTo(2);
        assertThat(voucherRepository.findByCode("CINEPLEX20")).isPresent();
    }
}
