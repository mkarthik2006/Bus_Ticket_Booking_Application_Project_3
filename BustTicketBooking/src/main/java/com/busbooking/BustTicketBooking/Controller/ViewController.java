package com.busbooking.BustTicketBooking.Controller;

import com.busbooking.BustTicketBooking.dto.PassengerDto;
import com.busbooking.BustTicketBooking.exception.ResourceNotFoundException;
import com.busbooking.BustTicketBooking.model.Booking;
import com.busbooking.BustTicketBooking.model.Bus;
import com.busbooking.BustTicketBooking.repository.BookingRepository;
import com.busbooking.BustTicketBooking.repository.BusRepository;
import com.busbooking.BustTicketBooking.repository.CityRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/view")
public class ViewController {

    private final BookingRepository bookingRepository;
    private final BusRepository busRepository;
    private final CityRepository cityRepository;

    public ViewController(BookingRepository bookingRepository, BusRepository busRepository, CityRepository cityRepository) {
        this.bookingRepository = bookingRepository;
        this.busRepository = busRepository;
        this.cityRepository = cityRepository;
    }

    @GetMapping("/")
    public ResponseEntity<?> home() {

        return ResponseEntity.ok(Map.of("message", "Welcome to Bus Ticket Booking"));
    }

    @GetMapping("/login")
    public ResponseEntity<?> loginPage() {
        return ResponseEntity.ok(Map.of("page", "login"));
    }

    @GetMapping("/register")
    public ResponseEntity<?> registerPage() {
        return ResponseEntity.ok(Map.of("page", "register"));
    }

    @GetMapping("/booking")
    public ResponseEntity<?> bookingPage(@RequestParam("busId") Long busId) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new ResourceNotFoundException("Bus", "id", busId));

        return ResponseEntity.ok(Map.of("bus", bus, "passenger", new PassengerDto()));
    }

    @GetMapping("/payment")
    public ResponseEntity<?> paymentPage(@RequestParam("bookingId") Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        return ResponseEntity.ok(Map.of("booking", booking));
    }

    @GetMapping("/searchPage")
    public ResponseEntity<?> searchPage() {

        return ResponseEntity.ok(Map.of("page", "searchResults"));
    }
}
