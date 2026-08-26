package com.cineplex.dto.room;

import com.cineplex.entity.Room;
import com.cineplex.entity.enums.RoomStatus;
import com.cineplex.entity.enums.ScreenType;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomResponse {
    private Long id;
    private String name;
    private Integer totalRows;
    private Integer totalColumns;
    private Integer totalSeats;
    private ScreenType screenType;
    private RoomStatus status;
    private List<SeatResponse> seats;

    public static RoomResponse fromEntity(Room room, boolean includeSeats) {
        List<SeatResponse> seatResponses = null;
        if (includeSeats && room.getSeats() != null) {
            seatResponses = room.getSeats().stream()
                    .map(SeatResponse::fromEntity)
                    .collect(Collectors.toList());
        }

        int seatCount = room.getSeats() != null ? room.getSeats().size() : (room.getTotalRows() * room.getTotalColumns());

        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .totalRows(room.getTotalRows())
                .totalColumns(room.getTotalColumns())
                .totalSeats(seatCount)
                .screenType(room.getScreenType())
                .status(room.getStatus())
                .seats(seatResponses)
                .build();
    }
}
