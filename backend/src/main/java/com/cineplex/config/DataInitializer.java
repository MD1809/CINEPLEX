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
        initMovies();
        initShowtimes();

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

    private void initMovies() {
        if (movieRepository.count() > 0) return;

        Genre action = genreRepository.findBySlug("hanh-dong").orElse(null);
        Genre sciFi = genreRepository.findBySlug("khoa-hoc-vien-tuong").orElse(null);
        Genre animation = genreRepository.findBySlug("hoat-hinh").orElse(null);
        Genre horror = genreRepository.findBySlug("kinh-di").orElse(null);
        Genre romance = genreRepository.findBySlug("tinh-cam").orElse(null);

        List<Movie> movies = List.of(
                Movie.builder()
                        .title("Dune: Hành Tinh Cát - Phần 2")
                        .originalTitle("Dune: Part Two")
                        .slug("dune-hanh-tinh-cat-phan-2")
                        .director("Denis Villeneuve")
                        .cast("Timothée Chalamet, Zendaya, Rebecca Ferguson")
                        .synopsis("Paul Atreides hợp lực cùng Chani và người Fremen trên hành trình báo thù những kẻ đã hủy hoại gia đình mình.")
                        .durationMinutes(166)
                        .releaseDate(LocalDate.now().minusDays(10))
                        .endDate(LocalDate.now().plusMonths(1))
                        .ageRating(AgeRating.T16)
                        .posterUrl("https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80")
                        .bannerUrl("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80")
                        .trailerUrl("https://www.youtube.com/watch?v=Way9Dexny3w")
                        .status(MovieStatus.NOW_SHOWING)
                        .genres(action != null && sciFi != null ? Set.of(action, sciFi) : Set.of())
                        .build(),
                Movie.builder()
                        .title("Mai")
                        .originalTitle("Mai")
                        .slug("mai-tran-thanh")
                        .director("Trấn Thành")
                        .cast("Phương Anh Đào, Tuấn Trần, Trấn Thành")
                        .synopsis("Câu chuyện tình yêu đầy trắc trở giữa Mai - người phụ nữ massage chịu nhiều tổn thương và Dương - chàng trai trẻ đào hoa.")
                        .durationMinutes(131)
                        .releaseDate(LocalDate.now().minusDays(15))
                        .endDate(LocalDate.now().plusWeeks(3))
                        .ageRating(AgeRating.T18)
                        .posterUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80")
                        .bannerUrl("https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&auto=format&fit=crop&q=80")
                        .trailerUrl("https://www.youtube.com/watch?v=kY3Su_h7u8Y")
                        .status(MovieStatus.NOW_SHOWING)
                        .genres(romance != null ? Set.of(romance) : Set.of())
                        .build(),
                Movie.builder()
                        .title("Kung Fu Panda 4")
                        .originalTitle("Kung Fu Panda 4")
                        .slug("kung-fu-panda-4")
                        .director("Mike Mitchell")
                        .cast("Jack Black, Awkwafina, Viola Davis")
                        .synopsis("Po được chọn trở thành Thủ lĩnh Tinh thần của Thung lũng Bình Yên và phải tìm kiếm một Thần Long Đại Hiệp mới.")
                        .durationMinutes(94)
                        .releaseDate(LocalDate.now().minusDays(5))
                        .endDate(LocalDate.now().plusMonths(2))
                        .ageRating(AgeRating.P)
                        .posterUrl("https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80")
                        .bannerUrl("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80")
                        .trailerUrl("https://www.youtube.com/watch?v=_inKs4eeHiI")
                        .status(MovieStatus.NOW_SHOWING)
                        .genres(animation != null && action != null ? Set.of(animation, action) : Set.of())
                        .build(),
                Movie.builder()
                        .title("Deadpool & Wolverine")
                        .originalTitle("Deadpool & Wolverine")
                        .slug("deadpool-and-wolverine")
                        .director("Shawn Levy")
                        .cast("Ryan Reynolds, Hugh Jackman, Emma Corrin")
                        .synopsis("Deadpool gia nhập Vũ trụ Điện ảnh Marvel cùng Wolverine trong chuyến hành trình hỗn loạn xuyên đa vũ trụ.")
                        .durationMinutes(128)
                        .releaseDate(LocalDate.now().plusDays(14))
                        .endDate(LocalDate.now().plusMonths(3))
                        .ageRating(AgeRating.T18)
                        .posterUrl("https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80")
                        .bannerUrl("https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80")
                        .trailerUrl("https://www.youtube.com/watch?v=73_1biulkYk")
                        .status(MovieStatus.COMING_SOON)
                        .genres(action != null && sciFi != null ? Set.of(action, sciFi) : Set.of())
                        .build()
        );

        movieRepository.saveAll(movies);
        log.info("Seeded 4 sample movies (Now Showing & Coming Soon).");
    }

    private void initShowtimes() {
        if (showtimeRepository.count() > 0) return;

        Movie dune = movieRepository.findBySlug("dune-hanh-tinh-cat-phan-2").orElse(null);
        Movie mai = movieRepository.findBySlug("mai-tran-thanh").orElse(null);
        Movie panda = movieRepository.findBySlug("kung-fu-panda-4").orElse(null);

        Room room1 = roomRepository.findByName("Phòng Chiếu 1 (IMAX Laser)").orElse(null);
        Room room2 = roomRepository.findByName("Phòng Chiếu 2 (Standard 2D)").orElse(null);

        if (dune == null || mai == null || panda == null || room1 == null || room2 == null) {
            return;
        }

        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        LocalDate dayAfterTomorrow = today.plusDays(2);

        List<Showtime> showtimes = List.of(
                // Today Room 1 (IMAX)
                Showtime.builder()
                        .movie(dune)
                        .room(room1)
                        .startTime(today.atTime(10, 0))
                        .endTime(today.atTime(10, 0).plusMinutes(dune.getDurationMinutes()))
                        .basePrice(new BigDecimal("110000.00"))
                        .status(ShowtimeStatus.OPENING)
                        .build(),
                Showtime.builder()
                        .movie(panda)
                        .room(room1)
                        .startTime(today.atTime(14, 0))
                        .endTime(today.atTime(14, 0).plusMinutes(panda.getDurationMinutes()))
                        .basePrice(new BigDecimal("95000.00"))
                        .status(ShowtimeStatus.OPENING)
                        .build(),
                Showtime.builder()
                        .movie(dune)
                        .room(room1)
                        .startTime(today.atTime(19, 0))
                        .endTime(today.atTime(19, 0).plusMinutes(dune.getDurationMinutes()))
                        .basePrice(new BigDecimal("120000.00"))
                        .status(ShowtimeStatus.OPENING)
                        .build(),

                // Today Room 2 (Standard)
                Showtime.builder()
                        .movie(mai)
                        .room(room2)
                        .startTime(today.atTime(13, 30))
                        .endTime(today.atTime(13, 30).plusMinutes(mai.getDurationMinutes()))
                        .basePrice(new BigDecimal("85000.00"))
                        .status(ShowtimeStatus.OPENING)
                        .build(),
                Showtime.builder()
                        .movie(mai)
                        .room(room2)
                        .startTime(today.atTime(18, 0))
                        .endTime(today.atTime(18, 0).plusMinutes(mai.getDurationMinutes()))
                        .basePrice(new BigDecimal("90000.00"))
                        .status(ShowtimeStatus.OPENING)
                        .build(),

                // Tomorrow Room 1
                Showtime.builder()
                        .movie(dune)
                        .room(room1)
                        .startTime(tomorrow.atTime(10, 30))
                        .endTime(tomorrow.atTime(10, 30).plusMinutes(dune.getDurationMinutes()))
                        .basePrice(new BigDecimal("110000.00"))
                        .status(ShowtimeStatus.OPENING)
                        .build(),
                Showtime.builder()
                        .movie(panda)
                        .room(room1)
                        .startTime(tomorrow.atTime(15, 0))
                        .endTime(tomorrow.atTime(15, 0).plusMinutes(panda.getDurationMinutes()))
                        .basePrice(new BigDecimal("95000.00"))
                        .status(ShowtimeStatus.OPENING)
                        .build(),
                Showtime.builder()
                        .movie(dune)
                        .room(room1)
                        .startTime(tomorrow.atTime(19, 30))
                        .endTime(tomorrow.atTime(19, 30).plusMinutes(dune.getDurationMinutes()))
                        .basePrice(new BigDecimal("120000.00"))
                        .status(ShowtimeStatus.OPENING)
                        .build(),

                // Day After Tomorrow Room 1 & 2
                Showtime.builder()
                        .movie(panda)
                        .room(room1)
                        .startTime(dayAfterTomorrow.atTime(10, 0))
                        .endTime(dayAfterTomorrow.atTime(10, 0).plusMinutes(panda.getDurationMinutes()))
                        .basePrice(new BigDecimal("95000.00"))
                        .status(ShowtimeStatus.OPENING)
                        .build(),
                Showtime.builder()
                        .movie(mai)
                        .room(room2)
                        .startTime(dayAfterTomorrow.atTime(14, 0))
                        .endTime(dayAfterTomorrow.atTime(14, 0).plusMinutes(mai.getDurationMinutes()))
                        .basePrice(new BigDecimal("85000.00"))
                        .status(ShowtimeStatus.OPENING)
                        .build()
        );

        showtimeRepository.saveAll(showtimes);
        log.info("Seeded 10 showtimes across 3 days.");
    }
}
