package com.busbooking.BustTicketBooking.dto;

import com.busbooking.BustTicketBooking.model.Gender;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class PassengerDto {
    @NotEmpty(message = "Passenger name is required")
    private String name;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String phoneNumber;
    private String email;

    private String seatNumber;
}
