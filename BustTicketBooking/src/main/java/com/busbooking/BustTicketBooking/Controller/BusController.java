package com.busbooking.BustTicketBooking.Controller;

import com.busbooking.BustTicketBooking.model.Bus;
import com.busbooking.BustTicketBooking.service.BusService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buses")
public class BusController {
    private final BusService busService;

    public BusController(BusService busService) {
        this.busService = busService;
    }

    @GetMapping
    public ResponseEntity<List<Bus>> getAllBuses() {
        return ResponseEntity.ok(busService.getAllBuses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bus> getBusById(@PathVariable Long id) {
        return ResponseEntity.ok(busService.getBusById(id));
    }

    @PostMapping
    public ResponseEntity<Bus> createBus(@Valid @RequestBody Bus bus) {
        return ResponseEntity.ok(busService.createBus(bus));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bus> updateBus(@PathVariable Long id, @Valid @RequestBody Bus bus) {
        return ResponseEntity.ok(busService.updateBus(id, bus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBus(@PathVariable Long id) {
        busService.deleteBus(id);
        return ResponseEntity.ok("Bus deleted successfully");
    }

    @GetMapping("/search")
    public ResponseEntity<List<Bus>> searchBuses(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(required = false) String date
    ) {

        List<Bus> buses = busService.searchBuses(from, to);
        return ResponseEntity.ok(buses);
    }
}
