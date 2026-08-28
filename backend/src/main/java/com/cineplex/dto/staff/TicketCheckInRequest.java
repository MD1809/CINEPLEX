package com.cineplex.dto.staff;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketCheckInRequest {

    @NotBlank(message = "Mã QR hoặc mã vé không được để trống")
    @JsonAlias({"qrCodeTokenOrTicketCode", "tokenOrCode", "ticketCode", "qrCodeToken", "code"})
    private String tokenOrCode;

    private Long currentShowtimeId; // Optional: To verify ticket is for currently entering showtime
}
