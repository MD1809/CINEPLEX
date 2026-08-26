package com.cineplex.config;

import com.cineplex.entity.*;
import com.cineplex.entity.enums.*;
import com.cineplex.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final GenreRepository genreRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;
    private final SeatTypeRepository seatTypeRepository;
    private final SeatRepository seatRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SnackRepository snackRepository;
    private final VoucherRepository voucherRepository;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking and initializing sample seed data...");

        initUsers();
        SeatType[] seatTypes = initSeatTypes();
        initGenres();
        initRoomsAndSeats(seatTypes);
        initSnacks();
        initVouchers();

        log.info("Database seeding completed successfully!");
    }

    private void initUsers() {
        if (userRepository.count() > 0) return;

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        User admin = User.builder()
                .email("admin@cineplex.vn")
                .passwordHash(encoder.encode("Admin@123"))
                .fullName("Quản Trị Viên Hệ Thống")
                .phoneNumber("0901234567")
                .role(Role.ADMIN)
                .isActive(true)
                .build();

        User staff = User.builder()
                .email("staff@cineplex.vn")
                .passwordHash(encoder.encode("Staff@123"))
                .fullName("Nhân Viên Thu Ngân")
                .phoneNumber("0902345678")
                .role(Role.STAFF)
                .isActive(true)
                .build();

        User customer = User.builder()
                .email("customer@gmail.com")
                .passwordHash(encoder.encode("Customer@123"))
                .fullName("Nguyễn Văn Khách")
                .phoneNumber("0903456789")
                .role(Role.CUSTOMER)
                .isActive(true)
                .build();

        userRepository.saveAll(List.of(admin, staff, customer));
        log.info("Seeded 3 default users (Admin, Staff, Customer).");
    }

    private SeatType[] initSeatTypes() {
        SeatType regular = seatTypeRepository.findByName("REGULAR").orElseGet(() ->
                seatTypeRepository.save(SeatType.builder()
                        .name("REGULAR")
                        .surchargePrice(BigDecimal.ZERO)
                        .colorCode("#64748b")
                        .build())
        );

        SeatType vip = seatTypeRepository.findByName("VIP").orElseGet(() ->
                seatTypeRepository.save(SeatType.builder()
                        .name("VIP")
                        .surchargePrice(new BigDecimal("20000.00"))
                        .colorCode("#e9c349")
                        .build())
        );

        SeatType sweetbox = seatTypeRepository.findByName("SWEETBOX").orElseGet(() ->
                seatTypeRepository.save(SeatType.builder()
                        .name("SWEETBOX")
                        .surchargePrice(new BigDecimal("60000.00"))
                        .colorCode("#ec4899")
                        .build())
        );

        return new SeatType[]{regular, vip, sweetbox};
    }

    private void initGenres() {
        if (genreRepository.count() > 0) return;

        List<Genre> genres = List.of(
                Genre.builder().name("Hành Động").slug("hanh-dong").build(),
                Genre.builder().name("Khoa Học Viễn Tưởng").slug("khoa-hoc-vien-tuong").build(),
                Genre.builder().name("Hoạt Hình").slug("hoat-hinh").build(),
                Genre.builder().name("Kinh Dị").slug("kinh-di").build(),
                Genre.builder().name("Tình Cảm").slug("tinh-cam").build()
        );

        genreRepository.saveAll(genres);
        log.info("Seeded 5 movie genres.");
    }

    private void initRoomsAndSeats(SeatType[] seatTypes) {
        if (roomRepository.count() > 0) return;

        SeatType regular = seatTypes[0];
        SeatType vip = seatTypes[1];
        SeatType sweetbox = seatTypes[2];

        // Room 1: IMAX (6 rows x 10 cols = 60 seats)
        Room imaxRoom = Room.builder()
                .name("Phòng chiếu 1 (IMAX Laser)")
                .totalRows(6)
                .totalColumns(10)
                .screenType(ScreenType.IMAX)
                .status(RoomStatus.ACTIVE)
                .build();
        roomRepository.save(imaxRoom);

        List<Seat> imaxSeats = new ArrayList<>();
        char[] rowCodes = {'A', 'B', 'C', 'D', 'E', 'F'};

        for (int r = 0; r < rowCodes.length; r++) {
            char row = rowCodes[r];
            SeatType typeForThisRow;
            if (row == 'A' || row == 'B') {
                typeForThisRow = regular;
            } else if (row == 'C' || row == 'D' || row == 'E') {
                typeForThisRow = vip;
            } else {
                typeForThisRow = sweetbox;
            }

            for (int col = 1; col <= 10; col++) {
                String code = String.valueOf(row) + col;
                imaxSeats.add(Seat.builder()
                        .room(imaxRoom)
                        .seatType(typeForThisRow)
                        .rowCode(String.valueOf(row))
                        .colNumber(col)
                        .seatCode(code)
                        .isActive(true)
                        .build());
            }
        }
        seatRepository.saveAll(imaxSeats);

        // Room 2: Standard 2D (5 rows x 8 cols = 40 seats)
        Room standardRoom = Room.builder()
                .name("Phòng chiếu 2 (Standard 2D)")
                .totalRows(5)
                .totalColumns(8)
                .screenType(ScreenType.STANDARD_2D)
                .status(RoomStatus.ACTIVE)
                .build();
        roomRepository.save(standardRoom);

        List<Seat> standardSeats = new ArrayList<>();
        char[] stdRows = {'A', 'B', 'C', 'D', 'E'};

        for (int r = 0; r < stdRows.length; r++) {
            char row = stdRows[r];
            SeatType currentType = (row == 'A' || row == 'B') ? regular : ((row == 'C' || row == 'D') ? vip : sweetbox);

            for (int col = 1; col <= 8; col++) {
                String code = String.valueOf(row) + col;
                standardSeats.add(Seat.builder()
                        .room(standardRoom)
                        .seatType(currentType)
                        .rowCode(String.valueOf(row))
                        .colNumber(col)
                        .seatCode(code)
                        .isActive(true)
                        .build());
            }
        }
        seatRepository.saveAll(standardSeats);

        log.info("Seeded 2 Cinema Rooms with 100 seats.");
    }

    private void initSnacks() {
        if (snackRepository.count() > 0) return;

        List<Snack> snacks = List.of(
                Snack.builder()
                        .name("Bắp Rang Bơ (60oz)")
                        .description("Bắp nổ tươi giòn thơm bơ truyền thống")
                        .price(new BigDecimal("45000.00"))
                        .category(SnackCategory.POPCORN)
                        .isAvailable(true)
                        .build(),
                Snack.builder()
                        .name("Bắp Rang Phô Mai (60oz)")
                        .description("Bắp lắc bột phô mai Cheddar béo ngậy")
                        .price(new BigDecimal("50000.00"))
                        .category(SnackCategory.POPCORN)
                        .isAvailable(true)
                        .build(),
                Snack.builder()
                        .name("Coca-Cola Tươi (32oz)")
                        .description("Nước ngọt có gas ướp lạnh sảng khoái")
                        .price(new BigDecimal("30000.00"))
                        .category(SnackCategory.DRINK)
                        .isAvailable(true)
                        .build(),
                Snack.builder()
                        .name("Combo Solo (1 Bắp 60oz + 1 Nước 32oz)")
                        .description("Trọn gói ưu đãi cho 1 người xem phim")
                        .price(new BigDecimal("70000.00"))
                        .category(SnackCategory.COMBO)
                        .isAvailable(true)
                        .build(),
                Snack.builder()
                        .name("Combo Couple (1 Bắp 60oz + 2 Nước 32oz)")
                        .description("Combo hoàn hảo cho cặp đôi xem phim ngọt ngào")
                        .price(new BigDecimal("95000.00"))
                        .category(SnackCategory.COMBO)
                        .isAvailable(true)
                        .build()
        );

        snackRepository.saveAll(snacks);
        log.info("Seeded 5 snacks and combos.");
    }

    private void initVouchers() {
        if (voucherRepository.count() > 0) return;

        List<Voucher> vouchers = List.of(
                Voucher.builder()
                        .code("CINEPLEX20")
                        .description("Giảm 20% tổng đơn hàng (Tối đa 50k)")
                        .discountType(DiscountType.PERCENTAGE)
                        .discountValue(new BigDecimal("20.00"))
                        .minOrderAmount(new BigDecimal("100000.00"))
                        .maxDiscountAmount(new BigDecimal("50000.00"))
                        .startDate(LocalDateTime.now().minusDays(1))
                        .endDate(LocalDateTime.now().plusMonths(3))
                        .usageLimit(500)
                        .usedCount(0)
                        .isActive(true)
                        .build(),
                Voucher.builder()
                        .code("CHAOBANMOI")
                        .description("Giảm ngay 30.000đ cho đơn hàng từ 80.000đ")
                        .discountType(DiscountType.FIXED_AMOUNT)
                        .discountValue(new BigDecimal("30000.00"))
                        .minOrderAmount(new BigDecimal("80000.00"))
                        .maxDiscountAmount(new BigDecimal("30000.00"))
                        .startDate(LocalDateTime.now().minusDays(1))
                        .endDate(LocalDateTime.now().plusMonths(1))
                        .usageLimit(1000)
                        .usedCount(0)
                        .isActive(true)
                        .build()
        );

        voucherRepository.saveAll(vouchers);
        log.info("Seeded 2 promotional vouchers.");
    }
}
