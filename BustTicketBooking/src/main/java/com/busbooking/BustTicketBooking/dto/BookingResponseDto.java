package com.busbooking.BustTicketBooking.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingResponseDto {
    private Long id;
    private String boardingPoint;
    private String droppingPoint;
    private LocalDateTime bookingTime;
    private double totalAmount;
    private String status;


    private Long busId;
    private Long userId;


    private String busName;
    private String busNumber;
    private String userName;
}
