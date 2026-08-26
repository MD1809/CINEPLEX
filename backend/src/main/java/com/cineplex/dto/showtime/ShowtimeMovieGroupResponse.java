package com.cineplex.dto.showtime;

import com.cineplex.dto.movie.MovieResponse;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowtimeMovieGroupResponse {
    private MovieResponse movie;
    private List<ShowtimeResponse> showtimes;
}
