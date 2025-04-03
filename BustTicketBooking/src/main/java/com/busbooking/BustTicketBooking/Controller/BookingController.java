package com.busbooking.BustTicketBooking.Controller;

import com.busbooking.BustTicketBooking.dto.BookingRequestDto;
import com.busbooking.BustTicketBooking.model.Booking;
import com.busbooking.BustTicketBooking.model.User;
import com.busbooking.BustTicketBooking.security.CustomUserDetails;
import com.busbooking.BustTicketBooking.service.BookingService;
import com.busbooking.BustTicketBooking.service.PdfService;
import com.busbooking.BustTicketBooking.service.UserService;
import com.lowagie.text.DocumentException;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;
    private final PdfService pdfService;

    public BookingController(BookingService bookingService, UserService userService, PdfService pdfService) {
        this.bookingService = bookingService;
        this.userService = userService;
        this.pdfService = pdfService;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(
            @Valid @RequestBody BookingRequestDto dto,
            Authentication authentication
    ) {

        if (authentication != null && authentication.isAuthenticated()) {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            dto.setUserId(userDetails.getId());
        }


        User user = null;
        if (dto.getUserId() != null) {
            user = new User();
            user.setId(dto.getUserId());
        }

        Booking booking = bookingService.createBooking(dto, user);

        return ResponseEntity.ok(Map.of("id", booking.getId(), "message", "Booking created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        Booking booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingRequestDto bookingRequestDto,
            Authentication authentication
    ) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = new User();
        user.setId(userDetails.getId());
        Booking booking = bookingService.updateBooking(id, bookingRequestDto, user);
        return ResponseEntity.ok(booking);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok("Booking deleted successfully");
    }

    @GetMapping("/user")
    public ResponseEntity<List<Booking>> getUserBookings(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = new User();
        user.setId(userDetails.getId());
        List<Booking> bookings = bookingService.getBookingsByUser(user);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{bookingId}/pdf")
    public ResponseEntity<byte[]> downloadBookingPdf(@PathVariable Long bookingId) {
        try {
            byte[] pdfBytes = pdfService.generateBookingPdf(bookingId);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename("booking_" + bookingId + ".pdf")
                    .build());
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (DocumentException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
