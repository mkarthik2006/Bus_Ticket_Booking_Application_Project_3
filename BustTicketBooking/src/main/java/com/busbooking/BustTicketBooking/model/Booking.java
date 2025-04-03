package com.busbooking.BustTicketBooking.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "bookings")
@Getter
@Setter
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String boardingPoint;
    private String droppingPoint;
    private LocalDateTime bookingTime;
    private double totalAmount;

    private String status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bus_id")
    private Bus bus;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Passenger> passengers;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private Payment payment;
}
