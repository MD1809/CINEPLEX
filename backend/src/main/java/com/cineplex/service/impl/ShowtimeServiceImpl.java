package com.cineplex.service.impl;

import com.cineplex.dto.movie.MovieResponse;
import com.cineplex.dto.showtime.ShowtimeCreateRequest;
import com.cineplex.dto.showtime.ShowtimeMovieGroupResponse;
import com.cineplex.dto.showtime.ShowtimeResponse;
import com.cineplex.dto.showtime.ShowtimeUpdateRequest;
import com.cineplex.entity.Movie;
import com.cineplex.entity.Room;
import com.cineplex.entity.Showtime;
import com.cineplex.entity.enums.ShowtimeStatus;
import com.cineplex.exception.BadRequestException;
import com.cineplex.exception.ResourceNotFoundException;
import com.cineplex.repository.MovieRepository;
import com.cineplex.repository.RoomRepository;
import com.cineplex.repository.ShowtimeRepository;
import com.cineplex.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShowtimeServiceImpl implements ShowtimeService {

    private static final int CLEANING_BUFFER_MINUTES = 15;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getShowtimes(LocalDate date, Long movieId, Long roomId) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        LocalDateTime startOfDay = queryDate.atStartOfDay();
        LocalDateTime endOfDay = queryDate.atTime(LocalTime.MAX);

        List<Showtime> showtimes;
        if (movieId != null && roomId != null) {
            showtimes = showtimeRepository.findByMovieIdAndStartTimeBetween(movieId, startOfDay, endOfDay).stream()
                    .filter(s -> s.getRoom().getId().equals(roomId))
                    .collect(Collectors.toList());
        } else if (movieId != null) {
            showtimes = showtimeRepository.findByMovieIdAndStartTimeBetween(movieId, startOfDay, endOfDay);
        } else if (roomId != null) {
            showtimes = showtimeRepository.findByRoomIdAndStartTimeBetween(roomId, startOfDay, endOfDay);
        } else {
            showtimes = showtimeRepository.findByStartTimeBetween(startOfDay, endOfDay);
        }

        return showtimes.stream()
                .filter(s -> s.getStatus() != ShowtimeStatus.CANCELLED)
                .sorted(Comparator.comparing(Showtime::getStartTime))
                .map(ShowtimeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeMovieGroupResponse> getShowtimesGroupedByMovie(LocalDate date) {
        List<ShowtimeResponse> showtimes = getShowtimes(date, null, null);

        Map<Long, List<ShowtimeResponse>> grouped = showtimes.stream()
                .filter(s -> s.getMovie() != null)
                .collect(Collectors.groupingBy(s -> s.getMovie().getId(), LinkedHashMap::new, Collectors.toList()));

        List<ShowtimeMovieGroupResponse> result = new ArrayList<>();
        for (Map.Entry<Long, List<ShowtimeResponse>> entry : grouped.entrySet()) {
            if (!entry.getValue().isEmpty()) {
                MovieResponse movie = entry.getValue().get(0).getMovie();
                result.add(ShowtimeMovieGroupResponse.builder()
                        .movie(movie)
                        .showtimes(entry.getValue())
                        .build());
            }
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public ShowtimeResponse getShowtimeById(Long id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Suất chiếu", "id", id));
        return ShowtimeResponse.fromEntity(showtime);
    }

    @Override
    @Transactional
    public ShowtimeResponse createShowtime(ShowtimeCreateRequest request) {
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new ResourceNotFoundException("Phim", "id", request.getMovieId()));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Phòng chiếu", "id", request.getRoomId()));

        LocalDateTime startTime = request.getStartTime();
        LocalDateTime endTime = startTime.plusMinutes(movie.getDurationMinutes());

        validateShowtimeConflict(room.getId(), startTime, endTime, null);

        Showtime showtime = Showtime.builder()
                .movie(movie)
                .room(room)
                .startTime(startTime)
                .endTime(endTime)
                .basePrice(request.getBasePrice())
                .status(ShowtimeStatus.OPENING)
                .build();

        Showtime savedShowtime = showtimeRepository.save(showtime);
        log.info("Created showtime ID: {} for movie: '{}' in room: '{}' from {} to {}",
                savedShowtime.getId(), movie.getTitle(), room.getName(), startTime, endTime);

        return ShowtimeResponse.fromEntity(savedShowtime);
    }

    @Override
    @Transactional
    public ShowtimeResponse updateShowtime(Long id, ShowtimeUpdateRequest request) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Suất chiếu", "id", id));

        Movie movie = showtime.getMovie();
        if (request.getMovieId() != null && !request.getMovieId().equals(movie.getId())) {
            movie = movieRepository.findById(request.getMovieId())
                    .orElseThrow(() -> new ResourceNotFoundException("Phim", "id", request.getMovieId()));
        }

        Room room = showtime.getRoom();
        if (request.getRoomId() != null && !request.getRoomId().equals(room.getId())) {
            room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Phòng chiếu", "id", request.getRoomId()));
        }

        LocalDateTime startTime = request.getStartTime();
        LocalDateTime endTime = startTime.plusMinutes(movie.getDurationMinutes());

        if (request.getStatus() != ShowtimeStatus.CANCELLED) {
            validateShowtimeConflict(room.getId(), startTime, endTime, id);
        }

        showtime.setMovie(movie);
        showtime.setRoom(room);
        showtime.setStartTime(startTime);
        showtime.setEndTime(endTime);
        showtime.setBasePrice(request.getBasePrice());
        showtime.setStatus(request.getStatus());

        Showtime updated = showtimeRepository.save(showtime);
        log.info("Updated showtime ID: {} with new status: {}", updated.getId(), updated.getStatus());

        return ShowtimeResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteShowtime(Long id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Suất chiếu", "id", id));

        try {
            showtimeRepository.delete(showtime);
            log.info("Permanently deleted showtime ID: {}", id);
        } catch (Exception e) {
            log.warn("Cannot delete showtime ID {} directly, setting status to CANCELLED: {}", id, e.getMessage());
            showtime.setStatus(ShowtimeStatus.CANCELLED);
            showtimeRepository.save(showtime);
        }
    }

    /**
     * Showtime Collision Detection Engine:
     * Calculates occupied interval = [startTime, endTime + 15 min cleaning buffer].
     * Two showtimes conflict in the same room if:
     * Candidate.startTime < Existing.occupiedUntil AND Candidate.occupiedUntil > Existing.startTime
     */
    private void validateShowtimeConflict(Long roomId, LocalDateTime newStart, LocalDateTime newEnd, Long excludeId) {
        LocalDateTime newOccupiedUntil = newEnd.plusMinutes(CLEANING_BUFFER_MINUTES);

        // Fetch all active showtimes for the room on candidate day and neighbouring days (+-1 day)
        LocalDateTime searchStart = newStart.minusDays(1);
        LocalDateTime searchEnd = newEnd.plusDays(1);

        List<Showtime> existingShowtimes = showtimeRepository.findByRoomIdAndStartTimeBetween(roomId, searchStart, searchEnd);

        for (Showtime existing : existingShowtimes) {
            if (excludeId != null && existing.getId().equals(excludeId)) {
                continue;
            }
            if (existing.getStatus() == ShowtimeStatus.CANCELLED) {
                continue;
            }

            LocalDateTime existingOccupiedUntil = existing.getEndTime().plusMinutes(CLEANING_BUFFER_MINUTES);

            boolean isOverlap = newStart.isBefore(existingOccupiedUntil) && newOccupiedUntil.isAfter(existing.getStartTime());

            if (isOverlap) {
                String existingMovieTitle = existing.getMovie() != null ? existing.getMovie().getTitle() : "Phim khác";
                String msg = String.format(
                        "Xung đột lịch chiếu tại phòng chiếu này! Đã có suất chiếu '%s' (%s - %s, bao gồm %d phút dọn phòng tới %s).",
                        existingMovieTitle,
                        existing.getStartTime().format(TIME_FORMATTER),
                        existing.getEndTime().format(TIME_FORMATTER),
                        CLEANING_BUFFER_MINUTES,
                        existingOccupiedUntil.format(TIME_FORMATTER)
                );
                throw new BadRequestException(msg);
            }
        }
    }
}
