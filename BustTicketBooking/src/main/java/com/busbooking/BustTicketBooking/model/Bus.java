package com.busbooking.BustTicketBooking.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "buses")
@Getter
@Setter
public class Bus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String busName;
    private String busNumber;
    private String routeFrom;
    private String routeTo;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private double price;

    @ManyToOne
    @JoinColumn(name = "city_from_id")
    private City cityFrom;

    @ManyToOne
    @JoinColumn(name = "city_to_id")
    private City cityTo;


    @OneToMany(mappedBy = "bus", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Seat> seats;


    @OneToMany(mappedBy = "bus", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Booking> bookings;
}
