package com.busbooking.BustTicketBooking.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "seats")
@Getter
@Setter
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String seatNumber;
    private Integer seatRow;
    private Integer seatCol;
    private String deck;

    @Enumerated(EnumType.STRING)
    private SeatStatus status;

    @ManyToOne
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @OneToOne(mappedBy = "seat", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // Prevent infinite recursion by not serializing the Passenger reference
    private Passenger passenger;
}
