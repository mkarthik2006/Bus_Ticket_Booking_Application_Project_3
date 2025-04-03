package com.busbooking.BustTicketBooking.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name="payments")
@Getter
@Setter
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String transactionId;
    private double amount;
    private String status; // e.g., SUCCESS, FAILED, PENDING

    private LocalDateTime date;

    @OneToOne
    @JoinColumn(name = "booking_id")
    @JsonBackReference
    private Booking booking;
}
