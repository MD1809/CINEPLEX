package com.cineplex.service;

import com.cineplex.dto.booking.HoldSeatsRequest;
import com.cineplex.dto.booking.HoldSeatsResponse;
import com.cineplex.dto.booking.ReleaseSeatsRequest;
import com.cineplex.dto.booking.SeatMapResponse;
import com.cineplex.exception.ConflictException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.List;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
class RedisSeatHoldConcurrencyTest {

    @Autowired
    private SeatHoldService seatHoldService;

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final Long TEST_SHOWTIME_ID = 1L;
    private static final List<Long> TEST_SEAT_IDS = List.of(1L, 2L);

    @AfterEach
    void cleanUpRedis() {
        Set<String> keys = redisTemplate.keys("seat_hold:" + TEST_SHOWTIME_ID + ":*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    @Test
    @DisplayName("Concurrency: 10 simultaneous threads try to hold the same seats -> Exactly 1 succeeds, 9 fail with ConflictException")
    void testConcurrentSeatHolding() throws InterruptedException {
        int numberOfThreads = 10;
        ExecutorService executorService = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch readyLatch = new CountDownLatch(numberOfThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(numberOfThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        for (int i = 0; i < numberOfThreads; i++) {
            final long userId = 100L + i;
            executorService.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await(); // Wait for simultaneous start signal
                    HoldSeatsRequest request = HoldSeatsRequest.builder()
                            .showtimeId(TEST_SHOWTIME_ID)
                            .seatIds(TEST_SEAT_IDS)
                            .build();

                    HoldSeatsResponse response = seatHoldService.holdSeats(userId, request);
                    if (response != null && response.getHoldSessionId() != null) {
                        successCount.incrementAndGet();
                    }
                } catch (ConflictException ce) {
                    conflictCount.incrementAndGet();
                } catch (Exception e) {
                    // unexpected error
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        readyLatch.await();
        startLatch.countDown(); // Fire all 10 threads simultaneously
        finishLatch.await();
        executorService.shutdown();

        // Exactly 1 thread must succeed, and 9 must receive 409 Conflict
        assertThat(successCount.get()).isEqualTo(1);
        assertThat(conflictCount.get()).isEqualTo(9);

        // Verify Redis has the keys set
        Boolean seat1Held = redisTemplate.hasKey("seat_hold:" + TEST_SHOWTIME_ID + ":1");
        Boolean seat2Held = redisTemplate.hasKey("seat_hold:" + TEST_SHOWTIME_ID + ":2");
        assertThat(seat1Held).isTrue();
        assertThat(seat2Held).isTrue();
    }

    @Test
    @DisplayName("Seat Hold Lifecycle: Hold 5-min -> Extend 10-min -> Release -> Status returns to AVAILABLE")
    void testSeatHoldLifecycle() {
        HoldSeatsRequest holdReq = HoldSeatsRequest.builder()
                .showtimeId(TEST_SHOWTIME_ID)
                .seatIds(List.of(3L, 4L))
                .build();

        HoldSeatsResponse holdRes = seatHoldService.holdSeats(1L, holdReq);
        assertThat(holdRes).isNotNull();
        assertThat(holdRes.getRemainingSeconds()).isEqualTo(300L);
        assertThat(holdRes.getSelectedSeats()).hasSize(2);

        String sessionId = holdRes.getHoldSessionId();

        // Check seat map status
        SeatMapResponse seatMap = seatHoldService.getSeatMap(TEST_SHOWTIME_ID, sessionId);
        assertThat(seatMap.getSeats()).anyMatch(s -> s.getId().equals(3L) && "SELECTED_BY_ME".equals(s.getStatus()));

        // Extend hold by 600s (10 mins) for checkout
        seatHoldService.extendSeatHold(sessionId, TEST_SHOWTIME_ID, List.of(3L, 4L), 600L);
        Long ttl = redisTemplate.getExpire("seat_hold:" + TEST_SHOWTIME_ID + ":3");
        assertThat(ttl).isGreaterThan(300L);

        // Release seats
        ReleaseSeatsRequest releaseReq = ReleaseSeatsRequest.builder()
                .holdSessionId(sessionId)
                .showtimeId(TEST_SHOWTIME_ID)
                .seatIds(List.of(3L, 4L))
                .build();
        seatHoldService.releaseSeats(1L, releaseReq);

        // Seat map should now be AVAILABLE
        SeatMapResponse seatMapAfterRelease = seatHoldService.getSeatMap(TEST_SHOWTIME_ID, null);
        assertThat(seatMapAfterRelease.getSeats()).anyMatch(s -> s.getId().equals(3L) && "AVAILABLE".equals(s.getStatus()));
    }
}
