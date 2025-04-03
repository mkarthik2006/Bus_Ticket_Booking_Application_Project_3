package com.busbooking.BustTicketBooking.serviceImpl;

import com.busbooking.BustTicketBooking.dto.BookingRequestDto;
import com.busbooking.BustTicketBooking.dto.PassengerDto;
import com.busbooking.BustTicketBooking.exception.ResourceNotFoundException;
import com.busbooking.BustTicketBooking.model.*;
import com.busbooking.BustTicketBooking.repository.BookingRepository;
import com.busbooking.BustTicketBooking.repository.BusRepository;
import com.busbooking.BustTicketBooking.repository.SeatRepository;
import com.busbooking.BustTicketBooking.service.BookingService;
import com.busbooking.BustTicketBooking.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingServiceImpl.class);

    private final BookingRepository bookingRepository;
    private final BusRepository busRepository;
    private final SeatRepository seatRepository;
    private final PaymentService paymentService;

    @Override
    public Booking createBooking(Booking booking) {
        if (booking.getBookingTime() == null) {
            booking.setBookingTime(LocalDateTime.now());
        }
        return bookingRepository.save(booking);
    }
    @Override
    @Transactional
    public Booking createBooking(BookingRequestDto dto, User user) {
        logger.info("Creating booking for bus id: {}", dto.getBusId());

        // Fetch the bus
        Bus bus = busRepository.findById(dto.getBusId())
                .orElseThrow(() -> new ResourceNotFoundException("Bus", "id", dto.getBusId()));

        // Pre-check for duplicate seat numbers in the request
        if (dto.getPassengers() != null) {
            Set<String> seatNumbersSet = new HashSet<>();
            for (PassengerDto pDto : dto.getPassengers()) {
                if (pDto.getSeatNumber() != null && !pDto.getSeatNumber().isBlank()) {
                    if (!seatNumbersSet.add(pDto.getSeatNumber())) {
                        throw new IllegalArgumentException("Duplicate seat number in request: " + pDto.getSeatNumber());
                    }
                }
            }
        }

        // Build booking
        Booking booking = new Booking();
        booking.setBoardingPoint(dto.getBoardingPoint());
        booking.setDroppingPoint(dto.getDroppingPoint());
        booking.setBookingTime(LocalDateTime.now());
        booking.setBus(bus);
        booking.setUser(user);

        List<Passenger> passengerList = new ArrayList<>();
        double totalAmount = 0.0;
        if (dto.getPassengers() != null) {
            for (PassengerDto pDto : dto.getPassengers()) {
                Passenger passenger = new Passenger();
                passenger.setName(pDto.getName());
                passenger.setGender(pDto.getGender());
                passenger.setPhoneNumber(pDto.getPhoneNumber());
                passenger.setEmail(pDto.getEmail());
                // Link passenger to booking
                passenger.setBooking(booking);

                // If a seat number is provided, assign the seat to this passenger
                if (pDto.getSeatNumber() != null && !pDto.getSeatNumber().isBlank()) {
                    Seat seat = seatRepository.findByBusAndSeatNumber(bus, pDto.getSeatNumber())
                            .orElseThrow(() -> new ResourceNotFoundException("Seat", "seatNumber", pDto.getSeatNumber()));
                    // Check if the seat is already allocated
                    if (seat.getPassenger() != null) {
                        throw new IllegalStateException("Seat " + pDto.getSeatNumber() + " is already allocated.");
                    }
                    seat.setStatus(SeatStatus.BOOKED);
                    seat.setPassenger(passenger);
                    passenger.setSeat(seat);
                }
                totalAmount += bus.getPrice();
                passengerList.add(passenger);
            }
        }

        booking.setPassengers(passengerList);
        booking.setTotalAmount(totalAmount);

        // Save the complete booking with passengers (cascade persist handles passengers and updates seat associations)
        return bookingRepository.save(booking);
    }

    @Override
    public Booking getBookingById(Long id) {
        logger.info("Fetching booking with id: {}", id);
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
    }

    @Override
    public Booking updateBooking(Long id, Booking booking) {
        Booking existingBooking = getBookingById(id);
        existingBooking.setBoardingPoint(booking.getBoardingPoint());
        existingBooking.setDroppingPoint(booking.getDroppingPoint());
        existingBooking.setBookingTime(booking.getBookingTime());
        existingBooking.setTotalAmount(booking.getTotalAmount());
        existingBooking.setStatus(booking.getStatus());
        return bookingRepository.save(existingBooking);
    }

    @Override
    public Booking updateBooking(Long id, BookingRequestDto dto, User user) {
        Booking existingBooking = getBookingById(id);
        existingBooking.setBoardingPoint(dto.getBoardingPoint());
        existingBooking.setDroppingPoint(dto.getDroppingPoint());
        if (dto.getBusId() != null) {
            Bus bus = busRepository.findById(dto.getBusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bus", "id", dto.getBusId()));
            existingBooking.setBus(bus);
        }
        return bookingRepository.save(existingBooking);
    }

    @Override
    @Transactional
    public void deleteBooking(Long id) {
        Booking booking = getBookingById(id);
        if (booking.getPassengers() != null) {
            booking.getPassengers().forEach(passenger -> {
                Seat seat = passenger.getSeat();
                if (seat != null) {
                    seat.setStatus(SeatStatus.AVAILABLE);
                    seat.setPassenger(null);
                    seatRepository.save(seat);
                }
            });
        }
        bookingRepository.delete(booking);
    }

    @Override
    public List<Booking> getBookingsByUser(User user) {
        return bookingRepository.findByUser(user);
    }

    @Override
    public List<com.busbooking.BustTicketBooking.dto.BookingResponseDto> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAllWithBusAndUser();
        logger.info("Total bookings fetched: {}", bookings.size());
        return bookings.stream()
                .map(this::mapToDto)
                .toList();
    }

    private com.busbooking.BustTicketBooking.dto.BookingResponseDto mapToDto(Booking booking) {
        com.busbooking.BustTicketBooking.dto.BookingResponseDto dto =
                new com.busbooking.BustTicketBooking.dto.BookingResponseDto();
        dto.setId(booking.getId());
        dto.setBoardingPoint(booking.getBoardingPoint());
        dto.setDroppingPoint(booking.getDroppingPoint());
        dto.setBookingTime(booking.getBookingTime());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setStatus(booking.getStatus());
        if (booking.getBus() != null) {
            dto.setBusId(booking.getBus().getId());
            dto.setBusName(booking.getBus().getBusName());
            dto.setBusNumber(booking.getBus().getBusNumber());
        }
        if (booking.getUser() != null) {
            dto.setUserId(booking.getUser().getId());
            dto.setUserName(booking.getUser().getName());
        }
        return dto;
    }
}
