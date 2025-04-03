package com.busbooking.BustTicketBooking.Controller;

import com.busbooking.BustTicketBooking.dto.AdminDashboardStats;
import com.busbooking.BustTicketBooking.dto.BookingRequestDto;
import com.busbooking.BustTicketBooking.dto.BookingResponseDto;
import com.busbooking.BustTicketBooking.exception.ResourceNotFoundException;
import com.busbooking.BustTicketBooking.model.*;
import com.busbooking.BustTicketBooking.repository.CityRepository;
import com.busbooking.BustTicketBooking.service.BookingService;
import com.busbooking.BustTicketBooking.service.BusService;
import com.busbooking.BustTicketBooking.service.PaymentService;
import com.busbooking.BustTicketBooking.service.SeatService;
import com.busbooking.BustTicketBooking.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final BusService busService;
    private final SeatService seatService;
    private final UserService userService;
    private final BookingService bookingService;
    private final PaymentService paymentService;
    private final CityRepository cityRepository;

    public AdminController(BusService busService,
                           SeatService seatService,
                           UserService userService,
                           BookingService bookingService,
                           PaymentService paymentService,
                           CityRepository cityRepository) {
        this.busService = busService;
        this.seatService = seatService;
        this.userService = userService;
        this.bookingService = bookingService;
        this.paymentService = paymentService;
        this.cityRepository = cityRepository;
    }

    // ----- ADMIN DASHBOARD DATA -----
    @GetMapping("/dashboard")
    public ResponseEntity<?> adminDashboardPage(Authentication authentication) {
        List<Bus> buses = busService.getAllBuses();
        long totalBuses = buses.size();
        long totalUsers = userService.getAllUsers().size();
        long totalBookings = bookingService.getAllBookings().size(); // returns enriched DTOs

        AdminDashboardStats stats = new AdminDashboardStats(totalBuses, totalUsers, totalBookings);
        HashMap<String, Object> response = new HashMap<>();
        response.put("adminName", authentication.getName());
        response.put("stats", stats);
        response.put("buses", buses);
        return ResponseEntity.ok(response);
    }

    // ----- CITY MANAGEMENT -----
    @GetMapping("/cities")
    public ResponseEntity<List<City>> listCities() {
        return ResponseEntity.ok(cityRepository.findAll());
    }

    @GetMapping("/cities/{id}")
    public ResponseEntity<City> getCityById(@PathVariable Long id) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("City", "id", id));
        return ResponseEntity.ok(city);
    }

    @PostMapping("/cities")
    public ResponseEntity<City> createCity(@RequestBody City city) {
        City savedCity = cityRepository.save(city);
        return ResponseEntity.ok(savedCity);
    }

    @PutMapping("/cities/{id}")
    public ResponseEntity<City> updateCity(@PathVariable Long id, @RequestBody City updatedCity) {
        City existingCity = cityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("City", "id", id));
        existingCity.setName(updatedCity.getName());
        City savedCity = cityRepository.save(existingCity);
        return ResponseEntity.ok(savedCity);
    }

    @DeleteMapping("/cities/{id}")
    public ResponseEntity<String> deleteCity(@PathVariable Long id) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("City", "id", id));
        cityRepository.delete(city);
        return ResponseEntity.ok("City deleted successfully");
    }

    // -----BUS MANAGEMENT  -----
    @GetMapping("/buses")
    public ResponseEntity<List<Bus>> listBuses() {

        return ResponseEntity.ok(busService.getAllBuses());
    }

    @GetMapping("/buses/{id}")
    public ResponseEntity<Bus> getBusById(@PathVariable Long id) {
        Bus bus = busService.getBusById(id);
        if (bus == null) {
            throw new ResourceNotFoundException("Bus", "id", id);
        }
        return ResponseEntity.ok(bus);
    }

    @PostMapping("/buses")
    public ResponseEntity<Bus> createBus(@RequestBody HashMap<String, Object> payload) {
        String busName = (String) payload.get("busName");
        String busNumber = (String) payload.get("busNumber");
        String routeFrom = (String) payload.get("routeFrom");
        String routeTo = (String) payload.get("routeTo");
        double price = Double.parseDouble(payload.get("price").toString());
        Long cityFromId = Long.valueOf(payload.get("cityFromId").toString());
        Long cityToId = Long.valueOf(payload.get("cityToId").toString());
        City fromCity = cityRepository.findById(cityFromId)
                .orElseThrow(() -> new ResourceNotFoundException("City", "id", cityFromId));
        City toCity = cityRepository.findById(cityToId)
                .orElseThrow(() -> new ResourceNotFoundException("City", "id", cityToId));
        String departureStr = (String) payload.get("departure");
        String arrivalStr = (String) payload.get("arrival");
        LocalTime depTime = LocalDateTime.parse(departureStr).toLocalTime();
        LocalTime arrTime = LocalDateTime.parse(arrivalStr).toLocalTime();
        LocalDate baseDate = LocalDate.of(LocalDate.now().getYear(), 1, 1);
        Bus bus = new Bus();
        bus.setBusName(busName);
        bus.setBusNumber(busNumber);
        bus.setRouteFrom(routeFrom);
        bus.setRouteTo(routeTo);
        bus.setCityFrom(fromCity);
        bus.setCityTo(toCity);
        bus.setDepartureTime(LocalDateTime.of(baseDate, depTime));
        bus.setArrivalTime(LocalDateTime.of(baseDate, arrTime));
        bus.setPrice(price);
        Bus savedBus = busService.createBus(bus);
        seatService.createDefaultSeatsForBus(savedBus);
        return ResponseEntity.ok(savedBus);
    }

    @PutMapping("/buses/{id}")
    public ResponseEntity<Bus> updateBus(@PathVariable Long id, @RequestBody HashMap<String, Object> payload) {
        Bus existingBus = busService.getBusById(id);
        if (existingBus == null) {
            throw new ResourceNotFoundException("Bus", "id", id);
        }
        existingBus.setBusName((String) payload.get("busName"));
        existingBus.setBusNumber((String) payload.get("busNumber"));
        existingBus.setRouteFrom((String) payload.get("routeFrom"));
        existingBus.setRouteTo((String) payload.get("routeTo"));
        Long cityFromId = Long.valueOf(payload.get("cityFromId").toString());
        Long cityToId = Long.valueOf(payload.get("cityToId").toString());
        City fromCity = cityRepository.findById(cityFromId)
                .orElseThrow(() -> new ResourceNotFoundException("City", "id", cityFromId));
        City toCity = cityRepository.findById(cityToId)
                .orElseThrow(() -> new ResourceNotFoundException("City", "id", cityToId));
        existingBus.setCityFrom(fromCity);
        existingBus.setCityTo(toCity);
        String departureStr = (String) payload.get("departure");
        String arrivalStr = (String) payload.get("arrival");
        LocalTime depTime = LocalDateTime.parse(departureStr).toLocalTime();
        LocalTime arrTime = LocalDateTime.parse(arrivalStr).toLocalTime();
        LocalDate baseDate = LocalDate.of(LocalDate.now().getYear(), 1, 1);
        existingBus.setDepartureTime(LocalDateTime.of(baseDate, depTime));
        existingBus.setArrivalTime(LocalDateTime.of(baseDate, arrTime));
        double price = Double.parseDouble(payload.get("price").toString());
        existingBus.setPrice(price);
        busService.updateBus(id, existingBus);
        return ResponseEntity.ok(existingBus);
    }

    @DeleteMapping("/buses/{id}")
    public ResponseEntity<String> deleteBus(@PathVariable Long id) {
        busService.deleteBus(id);
        return ResponseEntity.ok("Bus deleted successfully");
    }

    // -----BOOKING MANAGEMENT -----
    // UPDATED: Return enriched DTOs for bookings
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponseDto>> listAllBookings() {
        List<BookingResponseDto> dtos = bookingService.getAllBookings();
        dtos.forEach(dto -> System.out.println("Booking DTO: " + dto));
        return ResponseEntity.ok(dtos);
    }


    @PostMapping("/bookings")
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequestDto bookingDto) {

        User user = userService.getUserById(bookingDto.getUserId());
        if(user == null) {
            throw new ResourceNotFoundException("User", "id", bookingDto.getUserId());
        }
        Booking savedBooking = bookingService.createBooking(bookingDto, user);
        return ResponseEntity.ok(savedBooking);
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        Booking booking = bookingService.getBookingById(id);
        if (booking == null) {
            throw new ResourceNotFoundException("Booking", "id", id);
        }
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/bookings/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable Long id, @RequestBody Booking updatedBooking) {
        Booking existingBooking = bookingService.getBookingById(id);
        if (existingBooking == null) {
            throw new ResourceNotFoundException("Booking", "id", id);
        }
        existingBooking.setStatus(updatedBooking.getStatus());
        existingBooking.setBookingTime(updatedBooking.getBookingTime());
        existingBooking.setTotalAmount(updatedBooking.getTotalAmount());
        Booking savedBooking = bookingService.updateBooking(id, existingBooking);
        return ResponseEntity.ok(savedBooking);
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<String> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok("Booking deleted successfully");
    }

    @PostMapping("/bookings/{bookingId}/confirm")
    public ResponseEntity<String> confirmBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok("Booking confirmed");
    }

    @PostMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<String> cancelBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok("Booking canceled");
    }

    // ----- USER MANAGEMENT -----
    @GetMapping("/users")
    public ResponseEntity<List<User>> listAllUsers() {

        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        if (user == null) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User newUser) {
        User savedUser = userService.createUser(newUser);
        return ResponseEntity.ok(savedUser);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        User existingUser = userService.getUserById(id);
        if (existingUser == null) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setName(updatedUser.getName());
        existingUser.setRole(updatedUser.getRole());
        User savedUser = userService.updateUser(id, existingUser);
        return ResponseEntity.ok(savedUser);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // -----PAYMENT MANAGEMENT-----
    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> listAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/payments/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        Payment payment = paymentService.getPaymentById(id);
        if (payment == null) {
            throw new ResourceNotFoundException("Payment", "id", id);
        }
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/payments")
    public ResponseEntity<Payment> createPayment(@RequestBody Payment newPayment) {
        Payment savedPayment = paymentService.createPayment(newPayment);
        return ResponseEntity.ok(savedPayment);
    }

    @PutMapping("/payments/{id}")
    public ResponseEntity<Payment> updatePayment(@PathVariable Long id, @RequestBody Payment updatedPayment) {
        Payment existingPayment = paymentService.getPaymentById(id);
        if (existingPayment == null) {
            throw new ResourceNotFoundException("Payment", "id", id);
        }
        existingPayment.setAmount(updatedPayment.getAmount());
        existingPayment.setDate(updatedPayment.getDate());
        existingPayment.setStatus(updatedPayment.getStatus());
        Payment savedPayment = paymentService.updatePayment(id, existingPayment);
        return ResponseEntity.ok(savedPayment);
    }

    @DeleteMapping("/payments/{id}")
    public ResponseEntity<String> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.ok("Payment deleted successfully");
    }
}
