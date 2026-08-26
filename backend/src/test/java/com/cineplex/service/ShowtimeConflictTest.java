package com.cineplex.service;

import com.cineplex.dto.showtime.ShowtimeCreateRequest;
import com.cineplex.entity.Movie;
import com.cineplex.entity.Room;
import com.cineplex.entity.Showtime;
import com.cineplex.entity.enums.MovieStatus;
import com.cineplex.entity.enums.RoomStatus;
import com.cineplex.entity.enums.ScreenType;
import com.cineplex.entity.enums.ShowtimeStatus;
import com.cineplex.exception.BadRequestException;
import com.cineplex.repository.MovieRepository;
import com.cineplex.repository.RoomRepository;
import com.cineplex.repository.ShowtimeRepository;
import com.cineplex.service.impl.ShowtimeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShowtimeConflictTest {

    @Mock
    private ShowtimeRepository showtimeRepository;

    @Mock
    private MovieRepository movieRepository;

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private ShowtimeServiceImpl showtimeService;

    private Movie testMovie;
    private Room testRoom;

    @BeforeEach
    void setUp() {
        testMovie = Movie.builder()
                .id(1L)
                .title("Dune: Part Two")
                .durationMinutes(120) // 2 hours
                .status(MovieStatus.NOW_SHOWING)
                .build();

        testRoom = Room.builder()
                .id(1L)
                .name("Phòng 1 (IMAX)")
                .screenType(ScreenType.IMAX)
                .status(RoomStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Reject showtime that overlaps within 15-minute cleaning buffer of existing showtime")
    void testShowtimeCollisionWithinCleaningBuffer() {
        // Existing showtime: 10:00 -> 12:00. Cleaning buffer until 12:15.
        LocalDateTime existingStart = LocalDateTime.of(2026, 8, 28, 10, 0);
        LocalDateTime existingEnd = existingStart.plusMinutes(120);

        Showtime existingShowtime = Showtime.builder()
                .id(100L)
                .movie(testMovie)
                .room(testRoom)
                .startTime(existingStart)
                .endTime(existingEnd)
                .status(ShowtimeStatus.OPENING)
                .build();

        when(movieRepository.findById(1L)).thenReturn(Optional.of(testMovie));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(showtimeRepository.findByRoomIdAndStartTimeBetween(eq(1L), any(), any()))
                .thenReturn(List.of(existingShowtime));

        // Candidate showtime starts at 12:10 (only 10 mins after movie end, encroaching 15 min buffer)
        ShowtimeCreateRequest candidateRequest = ShowtimeCreateRequest.builder()
                .movieId(1L)
                .roomId(1L)
                .startTime(LocalDateTime.of(2026, 8, 28, 12, 10))
                .basePrice(new BigDecimal("100000.00"))
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                showtimeService.createShowtime(candidateRequest));

        assertTrue(ex.getMessage().contains("Xung đột lịch chiếu"));
        verify(showtimeRepository, never()).save(any(Showtime.class));
    }

    @Test
    @DisplayName("Allow showtime starting after existing showtime + 15 minutes buffer")
    void testShowtimeAllowedAfterCleaningBuffer() {
        // Existing showtime: 10:00 -> 12:00. Cleaning buffer until 12:15.
        LocalDateTime existingStart = LocalDateTime.of(2026, 8, 28, 10, 0);
        LocalDateTime existingEnd = existingStart.plusMinutes(120);

        Showtime existingShowtime = Showtime.builder()
                .id(100L)
                .movie(testMovie)
                .room(testRoom)
                .startTime(existingStart)
                .endTime(existingEnd)
                .status(ShowtimeStatus.OPENING)
                .build();

        when(movieRepository.findById(1L)).thenReturn(Optional.of(testMovie));
        when(roomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(showtimeRepository.findByRoomIdAndStartTimeBetween(eq(1L), any(), any()))
                .thenReturn(List.of(existingShowtime));

        // Candidate showtime starts at 12:15 (exact 15 min clean buffer passed)
        LocalDateTime validStart = LocalDateTime.of(2026, 8, 28, 12, 15);
        ShowtimeCreateRequest candidateRequest = ShowtimeCreateRequest.builder()
                .movieId(1L)
                .roomId(1L)
                .startTime(validStart)
                .basePrice(new BigDecimal("100000.00"))
                .build();

        when(showtimeRepository.save(any(Showtime.class))).thenAnswer(i -> {
            Showtime s = i.getArgument(0);
            s.setId(200L);
            return s;
        });

        assertDoesNotThrow(() -> showtimeService.createShowtime(candidateRequest));
        verify(showtimeRepository, times(1)).save(any(Showtime.class));
    }
}
