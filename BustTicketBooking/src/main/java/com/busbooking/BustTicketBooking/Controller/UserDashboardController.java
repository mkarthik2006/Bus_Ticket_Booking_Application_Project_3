package com.busbooking.BustTicketBooking.Controller;

import com.busbooking.BustTicketBooking.model.Booking;
import com.busbooking.BustTicketBooking.model.User;
import com.busbooking.BustTicketBooking.security.CustomUserDetails;
import com.busbooking.BustTicketBooking.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserDashboardController {

    private final BookingService bookingService;

    public UserDashboardController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> userDashboard(Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();


        User user = new User();
        user.setId(userDetails.getId());


        List<Booking> bookings = bookingService.getBookingsByUser(user);


        return ResponseEntity.ok(Map.of(
                "userName", userDetails.getUsername(),
                "bookings", bookings
        ));
    }
}
