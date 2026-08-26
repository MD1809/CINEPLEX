package com.cineplex.dto.showtime;

import com.cineplex.dto.movie.MovieResponse;
import com.cineplex.dto.room.RoomResponse;
import com.cineplex.entity.Showtime;
import com.cineplex.entity.enums.ShowtimeStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowtimeResponse {
    private Long id;
    private MovieResponse movie;
    private RoomResponse room;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal basePrice;
    private ShowtimeStatus status;

    public static ShowtimeResponse fromEntity(Showtime showtime) {
        return ShowtimeResponse.builder()
                .id(showtime.getId())
                .movie(showtime.getMovie() != null ? MovieResponse.fromEntity(showtime.getMovie()) : null)
                .room(showtime.getRoom() != null ? RoomResponse.fromEntity(showtime.getRoom(), false) : null)
                .startTime(showtime.getStartTime())
                .endTime(showtime.getEndTime())
                .basePrice(showtime.getBasePrice())
                .status(showtime.getStatus())
                .build();
    }
}
