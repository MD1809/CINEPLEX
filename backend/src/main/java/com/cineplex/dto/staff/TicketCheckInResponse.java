package com.cineplex.dto.staff;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketCheckInResponse {
    private boolean valid;
    private String statusCode; // SUCCESS, ALREADY_CHECKED_IN, INVALID_SHOWTIME, NOT_FOUND
    private String message;
    private String ticketCode;
    private String movieTitle;
    private String moviePosterUrl;
    private String roomName;
    private String screenType;
    private String seatCode;
    private String seatType;

    @JsonProperty("startTime")
    @JsonAlias("showtimeStart")
    private LocalDateTime startTime;

    @JsonProperty("endTime")
    @JsonAlias("showtimeEnd")
    private LocalDateTime endTime;

    private String customerName;
    private LocalDateTime checkedInAt;
    private String staffName;

    @JsonProperty("showtimeStart")
    public LocalDateTime getShowtimeStart() {
        return startTime;
    }

    @JsonProperty("showtimeEnd")
    public LocalDateTime getShowtimeEnd() {
        return endTime;
    }
}
