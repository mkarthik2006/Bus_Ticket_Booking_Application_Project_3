package com.busbooking.BustTicketBooking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class BookingRequestDto {
    @NotNull(message = "Bus ID is required")
    private Long busId;


    private Long userId;

    private String boardingPoint;
    private String droppingPoint;

    private List<PassengerDto> passengers;
}
