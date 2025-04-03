package com.busbooking.BustTicketBooking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRequestDto {
    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotNull(message = "Amount is required")
    private Double amount;

    @NotNull(message = "Payment provider is required")
    private String paymentProvider; // e.g., "stripe", "razorpay"
}
