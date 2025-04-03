package com.busbooking.BustTicketBooking.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "passengers")
@Getter
@Setter
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Passenger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String phoneNumber;
    private String email;

    @OneToOne
    @JoinColumn(name = "seat_id")
    // Optionally, if you need to break the cycle here too:
    // @JsonIdentityReference(alwaysAsId = true)
    private Seat seat;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "booking_id")
    private Booking booking;
}
