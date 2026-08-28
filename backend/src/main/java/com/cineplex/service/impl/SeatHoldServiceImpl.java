package com.cineplex.service.impl;

import com.cineplex.dto.booking.*;
import com.cineplex.entity.Room;
import com.cineplex.entity.Seat;
import com.cineplex.entity.Showtime;
import com.cineplex.entity.enums.ShowtimeStatus;
import com.cineplex.exception.BadRequestException;
import com.cineplex.exception.ConflictException;
import com.cineplex.exception.ResourceNotFoundException;
import com.cineplex.repository.SeatRepository;
import com.cineplex.repository.ShowtimeRepository;
import com.cineplex.repository.TicketRepository;
import com.cineplex.service.SeatHoldService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatHoldServiceImpl implements SeatHoldService {

    private final StringRedisTemplate redisTemplate;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final TicketRepository ticketRepository;

    private static final String SEAT_HOLD_PREFIX = "seat_hold:";
    private static final long DEFAULT_HOLD_TTL_SECONDS = 300L; // 5 minutes

    @Override
    @Transactional(readOnly = true)
    public SeatMapResponse getSeatMap(Long showtimeId, String currentHoldSessionId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy suất chiếu với ID: " + showtimeId));

        Room room = showtime.getRoom();
        List<Seat> roomSeats = seatRepository.findByRoomIdOrderByRowCodeAscColNumberAsc(room.getId());

        // Query booked seats from DB (Tickets)
        List<Long> bookedSeatIds = ticketRepository.findBookedSeatIdsByShowtimeId(showtimeId);
        Set<Long> bookedSeatSet = new HashSet<>(bookedSeatIds);

        // Map seats to SeatDto with real-time status
        List<SeatDto> seatDtos = roomSeats.stream().map(seat -> {
            String status;
            if (bookedSeatSet.contains(seat.getId())) {
                status = "BOOKED";
            } else {
                String redisKey = buildSeatHoldKey(showtimeId, seat.getId());
                String holdValue = redisTemplate.opsForValue().get(redisKey);

                if (holdValue != null) {
                    if (currentHoldSessionId != null && holdValue.startsWith(currentHoldSessionId)) {
                        status = "SELECTED_BY_ME";
                    } else {
                        status = "HOLD";
                    }
                } else {
                    status = Boolean.TRUE.equals(seat.getIsActive()) ? "AVAILABLE" : "BOOKED";
                }
            }

            BigDecimal surcharge = seat.getSeatType().getSurchargePrice() != null
                    ? seat.getSeatType().getSurchargePrice()
                    : BigDecimal.ZERO;
            BigDecimal price = showtime.getBasePrice().add(surcharge);

            return SeatDto.builder()
                    .id(seat.getId())
                    .seatCode(seat.getSeatCode())
                    .rowCode(seat.getRowCode())
                    .colNumber(seat.getColNumber())
                    .type(seat.getSeatType().getName())
                    .colorCode(seat.getSeatType().getColorCode())
                    .status(status)
                    .price(price)
                    .build();
        }).collect(Collectors.toList());

        return SeatMapResponse.builder()
                .showtimeId(showtime.getId())
                .movieId(showtime.getMovie().getId())
                .movieTitle(showtime.getMovie().getTitle())
                .movieSlug(showtime.getMovie().getSlug())
                .movieAgeRating(showtime.getMovie().getAgeRating() != null ? showtime.getMovie().getAgeRating().name() : "P")
                .moviePosterUrl(showtime.getMovie().getPosterUrl())
                .roomId(room.getId())
                .roomName(room.getName())
                .screenType(room.getScreenType() != null ? room.getScreenType().name() : "STANDARD_2D")
                .totalRows(room.getTotalRows())
                .totalColumns(room.getTotalColumns())
                .basePrice(showtime.getBasePrice())
                .startTime(showtime.getStartTime())
                .endTime(showtime.getEndTime())
                .seats(seatDtos)
                .build();
    }

    @Override
    public HoldSeatsResponse holdSeats(Long userId, HoldSeatsRequest request) {
        Long showtimeId = request.getShowtimeId();
        List<Long> seatIds = request.getSeatIds();

        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy suất chiếu với ID: " + showtimeId));

        if (showtime.getStatus() != ShowtimeStatus.OPENING && showtime.getStatus() != ShowtimeStatus.SCHEDULED) {
            throw new BadRequestException("Suất chiếu này hiện không mở bán vé.");
        }

        if (seatIds == null || seatIds.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn ít nhất một ghế.");
        }

        List<Seat> seats = seatRepository.findAllById(seatIds);
        if (seats.size() != seatIds.size()) {
            throw new BadRequestException("Một số ghế được chọn không tồn tại.");
        }

        // 1. Check if any seat is already booked in MySQL
        List<Long> bookedSeatIds = ticketRepository.findBookedSeatIdsByShowtimeId(showtimeId);
        Set<Long> bookedSet = new HashSet<>(bookedSeatIds);
        for (Seat seat : seats) {
            if (bookedSet.contains(seat.getId())) {
                throw new ConflictException("Ghế " + seat.getSeatCode() + " đã được đặt trước đó.");
            }
        }

        // 2. Generate or reuse holdSessionId
        String holdSessionId = (request.getHoldSessionId() != null && !request.getHoldSessionId().isBlank())
                ? request.getHoldSessionId()
                : "hs_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);

        String holdValue = holdSessionId + ":" + (userId != null ? userId : "guest");

        // 3. Atomically acquire lock on Redis for each seat
        List<String> newlyAcquiredKeys = new ArrayList<>();
        Map<Long, Seat> seatMap = seats.stream().collect(Collectors.toMap(Seat::getId, s -> s));

        try {
            for (Long seatId : seatIds) {
                String redisKey = buildSeatHoldKey(showtimeId, seatId);
                Boolean success = redisTemplate.opsForValue().setIfAbsent(
                        redisKey,
                        holdValue,
                        Duration.ofSeconds(DEFAULT_HOLD_TTL_SECONDS)
                );

                if (Boolean.TRUE.equals(success)) {
                    newlyAcquiredKeys.add(redisKey);
                } else {
                    // Check if the lock is already held by this same session
                    String existingValue = redisTemplate.opsForValue().get(redisKey);
                    if (existingValue != null && existingValue.startsWith(holdSessionId)) {
                        // Refresh TTL for our own held seat
                        redisTemplate.expire(redisKey, Duration.ofSeconds(DEFAULT_HOLD_TTL_SECONDS));
                    } else {
                        // Conflict! Someone else holds this seat.
                        Seat conflictingSeat = seatMap.get(seatId);
                        String seatCode = conflictingSeat != null ? conflictingSeat.getSeatCode() : String.valueOf(seatId);
                        throw new ConflictException("Ghế " + seatCode + " đang được giữ bởi khách hàng khác. Vui lòng chọn ghế khác.");
                    }
                }
            }
        } catch (Exception e) {
            // Rollback newly acquired keys on conflict or error
            for (String key : newlyAcquiredKeys) {
                String currentVal = redisTemplate.opsForValue().get(key);
                if (currentVal != null && currentVal.startsWith(holdSessionId)) {
                    redisTemplate.delete(key);
                }
            }
            if (e instanceof ConflictException) {
                throw e;
            }
            log.error("Lỗi khi khóa ghế trên Redis: ", e);
            throw new BadRequestException("Không thể hoàn tất giữ ghế. Vui lòng thử lại.");
        }

        // 4. Calculate prices and build response
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<SelectedSeatDto> selectedSeatDtos = new ArrayList<>();

        for (Seat seat : seats) {
            BigDecimal surcharge = seat.getSeatType().getSurchargePrice() != null
                    ? seat.getSeatType().getSurchargePrice()
                    : BigDecimal.ZERO;
            BigDecimal price = showtime.getBasePrice().add(surcharge);
            totalAmount = totalAmount.add(price);

            selectedSeatDtos.add(SelectedSeatDto.builder()
                    .id(seat.getId())
                    .seatCode(seat.getSeatCode())
                    .rowCode(seat.getRowCode())
                    .colNumber(seat.getColNumber())
                    .type(seat.getSeatType().getName())
                    .price(price)
                    .build());
        }

        log.info("Held {} seats under session '{}' for showtime ID: {}", seatIds.size(), holdSessionId, showtimeId);

        return HoldSeatsResponse.builder()
                .holdSessionId(holdSessionId)
                .showtimeId(showtimeId)
                .selectedSeats(selectedSeatDtos)
                .totalSeatsAmount(totalAmount)
                .holdExpiresAt(LocalDateTime.now().plusSeconds(DEFAULT_HOLD_TTL_SECONDS))
                .remainingSeconds(DEFAULT_HOLD_TTL_SECONDS)
                .build();
    }

    @Override
    public void releaseSeats(Long userId, ReleaseSeatsRequest request) {
        String holdSessionId = request.getHoldSessionId();
        Long showtimeId = request.getShowtimeId();

        if (request.getSeatIds() != null && !request.getSeatIds().isEmpty()) {
            for (Long seatId : request.getSeatIds()) {
                String key = buildSeatHoldKey(showtimeId, seatId);
                String val = redisTemplate.opsForValue().get(key);
                if (val != null && val.startsWith(holdSessionId)) {
                    redisTemplate.delete(key);
                }
            }
        } else {
            // Find all seats of this showtime and release if owned by session
            Set<String> keys = redisTemplate.keys(SEAT_HOLD_PREFIX + showtimeId + ":*");
            if (keys != null) {
                for (String key : keys) {
                    String val = redisTemplate.opsForValue().get(key);
                    if (val != null && val.startsWith(holdSessionId)) {
                        redisTemplate.delete(key);
                    }
                }
            }
        }
        log.info("Released seat hold for session: {}", holdSessionId);
    }

    @Override
    public void extendSeatHold(String holdSessionId, Long showtimeId, List<Long> seatIds, long additionalSeconds) {
        if (seatIds == null || seatIds.isEmpty()) return;

        for (Long seatId : seatIds) {
            String key = buildSeatHoldKey(showtimeId, seatId);
            String val = redisTemplate.opsForValue().get(key);
            if (val != null && val.startsWith(holdSessionId)) {
                redisTemplate.expire(key, Duration.ofSeconds(additionalSeconds));
            } else {
                throw new ConflictException("Phiên giữ ghế đã hết hạn hoặc không hợp lệ.");
            }
        }
        log.info("Extended seat hold for session: {} by {} seconds", holdSessionId, additionalSeconds);
    }

    @Override
    public boolean isSeatHeldBySession(String holdSessionId, Long showtimeId, Long seatId) {
        String key = buildSeatHoldKey(showtimeId, seatId);
        String val = redisTemplate.opsForValue().get(key);
        return val != null && val.startsWith(holdSessionId);
    }

    private String buildSeatHoldKey(Long showtimeId, Long seatId) {
        return SEAT_HOLD_PREFIX + showtimeId + ":" + seatId;
    }
}
