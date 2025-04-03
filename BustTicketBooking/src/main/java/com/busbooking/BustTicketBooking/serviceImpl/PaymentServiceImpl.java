package com.busbooking.BustTicketBooking.serviceImpl;

import com.busbooking.BustTicketBooking.exception.ResourceNotFoundException;
import com.busbooking.BustTicketBooking.model.Booking;
import com.busbooking.BustTicketBooking.model.Payment;
import com.busbooking.BustTicketBooking.repository.BookingRepository;
import com.busbooking.BustTicketBooking.repository.PaymentRepository;
import com.busbooking.BustTicketBooking.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private static final Logger logger = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @Override
    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
    }

    @Override
    public Payment createPayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    @Override
    public Payment updatePayment(Long id, Payment payment) {
        Payment existingPayment = getPaymentById(id);
        existingPayment.setAmount(payment.getAmount());
        existingPayment.setDate(payment.getDate());
        existingPayment.setStatus(payment.getStatus());
        existingPayment.setTransactionId(payment.getTransactionId());
        return paymentRepository.save(existingPayment);
    }

    @Override
    public void deletePayment(Long id) {
        Payment payment = getPaymentById(id);
        paymentRepository.delete(payment);
    }

    @Override
    public void processPayment(Long bookingId, double amount, String paymentProvider) {
        logger.info("Processing {} payment for booking id: {} with amount: {}", paymentProvider, bookingId, amount);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found for payment processing"));

        String transactionId = UUID.randomUUID().toString();
        String status;
        if ("stripe".equalsIgnoreCase(paymentProvider)) {
            logger.info("Integrating with Stripe API...");
            status = "SUCCESS";
        } else if ("razorpay".equalsIgnoreCase(paymentProvider)) {
            logger.info("Integrating with Razorpay API...");
            status = "SUCCESS";
        } else {
            logger.error("Unsupported payment provider: {}", paymentProvider);
            throw new IllegalArgumentException("Unsupported payment provider");
        }

        Payment payment = new Payment();
        payment.setTransactionId(transactionId);
        payment.setAmount(amount);
        payment.setStatus(status);
        payment.setBooking(booking);
        paymentRepository.save(payment);

        logger.info("Payment processed successfully. Transaction ID: {}", transactionId);
    }

    @Override
    public List<Payment> getAllPayments() {

        return paymentRepository.findAll();
    }
}
