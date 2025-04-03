package com.busbooking.BustTicketBooking.Controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments/callback")
public class PaymentCallbackController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentCallbackController.class);

    @PostMapping
    public ResponseEntity<?> handlePaymentCallback(@RequestBody String callbackData) {
        logger.info("Received payment callback: {}", callbackData);
        return ResponseEntity.ok("Callback processed successfully");
    }
}
