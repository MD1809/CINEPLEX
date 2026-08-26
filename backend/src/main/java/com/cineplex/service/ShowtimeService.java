package com.cineplex.service;

import com.cineplex.dto.showtime.ShowtimeCreateRequest;
import com.cineplex.dto.showtime.ShowtimeMovieGroupResponse;
import com.cineplex.dto.showtime.ShowtimeResponse;
import com.cineplex.dto.showtime.ShowtimeUpdateRequest;

import java.time.LocalDate;
import java.util.List;

public interface ShowtimeService {

    List<ShowtimeResponse> getShowtimes(LocalDate date, Long movieId, Long roomId);

    List<ShowtimeMovieGroupResponse> getShowtimesGroupedByMovie(LocalDate date);

    ShowtimeResponse getShowtimeById(Long id);

    ShowtimeResponse createShowtime(ShowtimeCreateRequest request);

    ShowtimeResponse updateShowtime(Long id, ShowtimeUpdateRequest request);

    void deleteShowtime(Long id);
}
