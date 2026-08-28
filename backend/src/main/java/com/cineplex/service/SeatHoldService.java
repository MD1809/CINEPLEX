package com.cineplex.service;

import com.cineplex.dto.booking.HoldSeatsRequest;
import com.cineplex.dto.booking.HoldSeatsResponse;
import com.cineplex.dto.booking.ReleaseSeatsRequest;
import com.cineplex.dto.booking.SeatMapResponse;

import java.util.List;

public interface SeatHoldService {

    /**
     * Get real-time seat map with BOOKED and Redis HOLD status
     */
    SeatMapResponse getSeatMap(Long showtimeId, String currentHoldSessionId);

    /**
     * Atomically lock requested seats in Redis for 300 seconds (5 minutes)
     */
    HoldSeatsResponse holdSeats(Long userId, HoldSeatsRequest request);

    /**
     * Release held seats from Redis when user unselects or cancels
     */
    void releaseSeats(Long userId, ReleaseSeatsRequest request);

    /**
     * Dynamically extend Redis hold TTL (e.g., 600s / 10 minutes) when moving to payment gateway
     */
    void extendSeatHold(String holdSessionId, Long showtimeId, List<Long> seatIds, long additionalSeconds);

    /**
     * Check if a specific seat is held by a given holdSessionId
     */
    boolean isSeatHeldBySession(String holdSessionId, Long showtimeId, Long seatId);
}
