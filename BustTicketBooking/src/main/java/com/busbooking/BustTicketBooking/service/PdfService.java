package com.busbooking.BustTicketBooking.service;

import com.busbooking.BustTicketBooking.exception.ResourceNotFoundException;
import com.busbooking.BustTicketBooking.model.Booking;
import com.busbooking.BustTicketBooking.model.Passenger;
import com.busbooking.BustTicketBooking.repository.BookingRepository;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PdfService {

    private final BookingRepository bookingRepository;

    public PdfService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public byte[] generateBookingPdf(Long bookingId) throws DocumentException {
        // Fetch the booking; this should load bus and payment eagerly.
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        // Force lazy loading of passengers if not already loaded.
        if (booking.getPassengers() != null) {
            booking.getPassengers().size();
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(document, baos);
        document.open();

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

        // ----- HEADER / TITLE -----
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.BLACK);
        Paragraph title = new Paragraph("Bus Ticket Information", titleFont);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" ")); // Spacer

        // Determine booking status; default to "Pending" if null.
        String bookingStatus = (booking.getStatus() != null) ? booking.getStatus() : "Pending";

        // ----- TICKET / BOOKING DETAILS -----
        PdfPTable bookingTable = new PdfPTable(2);
        bookingTable.setWidthPercentage(100f);
        bookingTable.setSpacingBefore(10f);

        PdfPCell labelCell = createCell("Booking ID:", Font.BOLD);
        PdfPCell valueCell = createCell(String.valueOf(booking.getId()), Font.NORMAL);
        bookingTable.addCell(labelCell);
        bookingTable.addCell(valueCell);

        if (booking.getBus() != null) {
            labelCell = createCell("Bus Name:", Font.BOLD);
            valueCell = createCell(booking.getBus().getBusName(), Font.NORMAL);
            bookingTable.addCell(labelCell);
            bookingTable.addCell(valueCell);

            labelCell = createCell("Bus Number:", Font.BOLD);
            valueCell = createCell(booking.getBus().getBusNumber(), Font.NORMAL);
            bookingTable.addCell(labelCell);
            bookingTable.addCell(valueCell);

            labelCell = createCell("Journey From - To:", Font.BOLD);
            String route = booking.getBus().getRouteFrom() + " → " + booking.getBus().getRouteTo();
            valueCell = createCell(route, Font.NORMAL);
            bookingTable.addCell(labelCell);
            bookingTable.addCell(valueCell);

            if (booking.getBus().getDepartureTime() != null) {
                labelCell = createCell("Departure:", Font.BOLD);
                String depStr = booking.getBus().getDepartureTime().format(dateFormatter);
                valueCell = createCell(depStr, Font.NORMAL);
                bookingTable.addCell(labelCell);
                bookingTable.addCell(valueCell);
            }

            if (booking.getBus().getArrivalTime() != null) {
                labelCell = createCell("Arrival:", Font.BOLD);
                String arrStr = booking.getBus().getArrivalTime().format(dateFormatter);
                valueCell = createCell(arrStr, Font.NORMAL);
                bookingTable.addCell(labelCell);
                bookingTable.addCell(valueCell);
            }

            labelCell = createCell("Ticket Price (per seat):", Font.BOLD);
            valueCell = createCell(String.valueOf(booking.getBus().getPrice()), Font.NORMAL);
            bookingTable.addCell(labelCell);
            bookingTable.addCell(valueCell);
        }

        if (booking.getBookingTime() != null) {
            labelCell = createCell("Booking Time:", Font.BOLD);
            String bookingTimeStr = booking.getBookingTime().format(dateFormatter);
            valueCell = createCell(bookingTimeStr, Font.NORMAL);
            bookingTable.addCell(labelCell);
            bookingTable.addCell(valueCell);
        }

        labelCell = createCell("Boarding Point:", Font.BOLD);
        valueCell = createCell(booking.getBoardingPoint(), Font.NORMAL);
        bookingTable.addCell(labelCell);
        bookingTable.addCell(valueCell);

        labelCell = createCell("Dropping Point:", Font.BOLD);
        valueCell = createCell(booking.getDroppingPoint(), Font.NORMAL);
        bookingTable.addCell(labelCell);
        bookingTable.addCell(valueCell);

        labelCell = createCell("Booking Status:", Font.BOLD);
        valueCell = createCell(bookingStatus, Font.NORMAL);
        bookingTable.addCell(labelCell);
        bookingTable.addCell(valueCell);

        labelCell = createCell("Total Amount:", Font.BOLD);
        valueCell = createCell(String.valueOf(booking.getTotalAmount()), Font.NORMAL);
        bookingTable.addCell(labelCell);
        bookingTable.addCell(valueCell);

        document.add(bookingTable);
        document.add(new Paragraph(" "));

        // ----- PAYMENT DETAILS -----
        if (booking.getPayment() != null) {
            Paragraph payHeader = new Paragraph("Payment Details", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14));
            payHeader.setSpacingBefore(10f);
            document.add(payHeader);

            PdfPTable paymentTable = new PdfPTable(2);
            paymentTable.setWidthPercentage(100f);
            paymentTable.setSpacingBefore(5f);

            paymentTable.addCell(createCell("Transaction ID:", Font.BOLD));
            paymentTable.addCell(createCell(booking.getPayment().getTransactionId(), Font.NORMAL));

            paymentTable.addCell(createCell("Amount:", Font.BOLD));
            paymentTable.addCell(createCell(String.valueOf(booking.getPayment().getAmount()), Font.NORMAL));

            paymentTable.addCell(createCell("Status:", Font.BOLD));
            paymentTable.addCell(createCell(booking.getPayment().getStatus(), Font.NORMAL));

            if (booking.getPayment().getDate() != null) {
                paymentTable.addCell(createCell("Payment Date:", Font.BOLD));
                paymentTable.addCell(createCell(booking.getPayment().getDate().format(dateFormatter), Font.NORMAL));
            }
            document.add(paymentTable);
            document.add(new Paragraph(" "));
        }

        // ----- PASSENGER DETAILS -----
        List<Passenger> passengers = booking.getPassengers();
        if (passengers != null && !passengers.isEmpty()) {
            Paragraph passHeader = new Paragraph("Passenger Details", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14));
            passHeader.setSpacingBefore(10f);
            document.add(passHeader);

            PdfPTable passengerTable = new PdfPTable(5);
            passengerTable.setWidthPercentage(100f);
            passengerTable.setSpacingBefore(5f);

            passengerTable.addCell(headerCell("Name"));
            passengerTable.addCell(headerCell("Gender"));
            passengerTable.addCell(headerCell("Phone"));
            passengerTable.addCell(headerCell("Email"));
            passengerTable.addCell(headerCell("Seat"));

            for (Passenger p : passengers) {
                passengerTable.addCell(bodyCell(p.getName() != null ? p.getName() : "N/A"));
                passengerTable.addCell(bodyCell(p.getGender() != null ? p.getGender().name() : "N/A"));
                passengerTable.addCell(bodyCell(p.getPhoneNumber() != null ? p.getPhoneNumber() : "N/A"));
                passengerTable.addCell(bodyCell(p.getEmail() != null ? p.getEmail() : "N/A"));
                String seatNum = (p.getSeat() != null && p.getSeat().getSeatNumber() != null)
                        ? p.getSeat().getSeatNumber() : "Not allocated";
                passengerTable.addCell(bodyCell(seatNum));
            }
            document.add(passengerTable);
            document.add(new Paragraph(" "));
        }

        // ----- FOOTER -----
        Paragraph footer = new Paragraph("Thank you for booking with MyBusBooking. Safe journey!",
                FontFactory.getFont(FontFactory.HELVETICA, 12, Font.ITALIC, Color.GRAY));
        footer.setSpacingBefore(20f);
        footer.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }

    // Helper method to create a cell with no border
    private PdfPCell createCell(String content, int fontStyle) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA, 11, fontStyle);
        PdfPCell cell = new PdfPCell(new Phrase(content, font));
        cell.setBorder(Rectangle.NO_BORDER);
        return cell;
    }

    // Helper method for passenger table header cells
    private PdfPCell headerCell(String text) {
        Font bold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
        PdfPCell cell = new PdfPCell(new Phrase(text, bold));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(new Color(230, 230, 230));
        return cell;
    }

    // Helper method for passenger table body cells, now ensuring non-null display
    private PdfPCell bodyCell(String text) {
        Font normal = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
        PdfPCell cell = new PdfPCell(new Phrase(text, normal));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        return cell;
    }
}
