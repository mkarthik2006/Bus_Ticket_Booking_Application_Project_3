package com.busbooking.BustTicketBooking.service;

import com.busbooking.BustTicketBooking.model.Payment;
import java.util.List;

public interface PaymentService {
    Payment getPaymentById(Long id);
    Payment createPayment(Payment payment);
    Payment updatePayment(Long id, Payment payment);
    void deletePayment(Long id);
    void processPayment(Long bookingId, double amount, String paymentProvider);
    List<Payment> getAllPayments();
}
