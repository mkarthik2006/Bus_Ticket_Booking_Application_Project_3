package com.busbooking.BustTicketBooking.Controller;

import com.busbooking.BustTicketBooking.model.Bus;
import com.busbooking.BustTicketBooking.model.Seat;
import com.busbooking.BustTicketBooking.service.BusService;
import com.busbooking.BustTicketBooking.service.SeatService;
import com.busbooking.BustTicketBooking.repository.SeatRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/buses")
public class SeatController {

    private final BusService busService;
    private final SeatRepository seatRepository;
    private final SeatService seatService;

    public SeatController(BusService busService,
                          SeatRepository seatRepository,
                          SeatService seatService) {
        this.busService = busService;
        this.seatRepository = seatRepository;
        this.seatService = seatService;
    }

    // Endpoint to fetch seat table data for a bus
    @GetMapping("/{busId}/seats")
    public ResponseEntity<?> viewSeats(@PathVariable Long busId) {
        Bus bus = busService.getBusById(busId);
        List<Seat> seats = seatRepository.findByBusWithPassengerOrdered(bus);
        // Check if no seats exist and create default seats if needed.
        if (seats.isEmpty()) {
            seatService.createDefaultSeatsForBus(bus);
            seats = seatRepository.findByBusWithPassengerOrdered(bus);
        }
        bus.setSeats(null);
        int maxRows = 7;  // adjust this value as needed
        return ResponseEntity.ok(Map.of("bus", bus, "seats", seats, "maxRows", maxRows));
    }

    // Endpoint to book seats for a bus
    @PostMapping("/{busId}/seats/book")
    public ResponseEntity<?> bookSeats(@PathVariable Long busId,
                                       @RequestParam("selectedSeats") String selectedSeats) {
        String[] seatNumbers = selectedSeats.split(",");
        seatService.bookSeats(busId, seatNumbers);
        return ResponseEntity.ok("Seats booked successfully");
    }
}
