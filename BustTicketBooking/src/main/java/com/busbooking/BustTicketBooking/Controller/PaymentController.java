package com.busbooking.BustTicketBooking.Controller;

import com.busbooking.BustTicketBooking.dto.PaymentRequestDto;
import com.busbooking.BustTicketBooking.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<?> processPayment(@Valid @RequestBody PaymentRequestDto paymentRequestDto) {
        paymentService.processPayment(
                paymentRequestDto.getBookingId(),
                paymentRequestDto.getAmount(),
                paymentRequestDto.getPaymentProvider()
        );
        return ResponseEntity.ok("Payment processed successfully");
    }
}
