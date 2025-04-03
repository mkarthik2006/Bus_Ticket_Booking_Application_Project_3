# Bus_Ticket_Booking_Application_Project_3
## Overview
This project is a full-stack bus ticket booking system. The backend is built using Spring Boot, and the frontend uses React. The system supports user registration, login, bus and city management, booking, payment processing, seat selection, and PDF generation for receipts.

## Table of Contents
- [Setup and Installation](#setup-and-installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Data Validation Rules](#data-validation-rules)

## Setup and Installation

### Prerequisites
- **Java 11+**
- **Maven** (for building the backend)
- **Node.js and npm** (for building the frontend)
- **Relational Database** (MySQL)

### Backend Setup
1. **Clone the Repository:**
   git clone https://github.com/yourusername/bus-ticket-booking.git
   cd bus-ticket-booking

Configure Application Properties: Edit src/main/resources/application.properties:

spring.datasource.url=jdbc:mysql://localhost:3306/your_database
spring.datasource.username=your_username
spring.datasource.password=your_password

app.jwtSecret=YourBase64EncodedSecretKey
app.jwtExpirationInMs=604800000
Build the Project:
mvn clean install
Run the Backend:
mvn spring-boot:run
The backend will run at http://localhost:8080.
Frontend Setup
Navigate to the Frontend Directory:
cd frontend
Install Dependencies:
npm install
Start the Frontend Server:
npm start
The frontend will run at http://localhost:3000.
Running the Tests
Execute all tests with Maven:
mvn test
This command runs unit tests (e.g., for controllers and services) as demonstrated in the sample test classes above.
API Documentation
1. Authentication
Register User
Endpoint: /api/users/register
Method: POST
Request Body:
{
  "name": "Karthik",
  "email": "karthik@gmail.com",
  "password": "password123",
  "role": "USER"
}
Response: Success message with user details.
Login User
Endpoint: /api/users/login
Method: POST
Request Body:
{
  "email": "karthik@gmail.com",
  "password": "password123"
}
Response:
{
  "accessToken": "jwt-token",
  "tokenType": "Bearer"
}
2. Bus Management (Admin)
List All Buses
Endpoint: /api/admin/buses
Method: GET
Response: Array of bus objects.
Create Bus
Endpoint: /api/admin/buses
Method: POST
Request Body:
{
  "busName": "Express Bus",
  "busNumber": "EX-123",
  "routeFrom": "City A",
  "routeTo": "City B",
  "departure": "2025-04-10T08:00:00",
  "arrival": "2025-04-10T10:00:00",
  "price": 50.0,
  "cityFromId": 1,
  "cityToId": 2
}
Response: Created bus object.
3. City Management (Admin)
List Cities
Endpoint: /api/admin/cities
Method: GET
Response: Array of city objects.
Create City
Endpoint: /api/admin/cities
Method: POST
Request Body:
{
  "name": "City Name"
}
Response: Created city object.
Update/Delete City: Similar endpoints exist with appropriate HTTP methods (PUT for update, DELETE for removal).
4. Booking Management
Create Booking
Endpoint: /api/bookings
Method: POST
Request Body:
{
  "busId": 1,
  "boardingPoint": "City A",
  "droppingPoint": "City B",
  "passengers": [
    {
      "name": "Alice"
    }
  ]
}
Response: Booking confirmation including booking ID.
Get Booking by ID
Endpoint: /api/bookings/{id}
Method: GET
Response: Booking object.
Update and Delete Booking: Endpoints using PUT and DELETE are available.
5. Payment Management
Process Payment
Endpoint: /api/payments
Method: POST
Request Body:
{
  "bookingId": 1,
  "amount": 50.0,
  "paymentProvider": "stripe"
}
Response: Payment status message.
6. Seat Management
View Seats
Endpoint: /api/buses/{busId}/seats
Method: GET
Response: JSON object containing the bus, seat list, and maximum rows.
Book Seats
Endpoint: /api/buses/{busId}/seats/book
Method: POST
Query Parameter: selectedSeats (comma-separated list)
Response: Confirmation message.
7. PDF Generation
Download Booking PDF
Endpoint: /api/bookings/{bookingId}/pdf
Method: GET
Response: PDF file as a binary stream with appropriate headers.
Data Validation Rules
User Registration: Name, email, and password are mandatory; email must be valid.
Login: Email and password are required.
Booking Request: busId is required; passenger names are mandatory.
Payment Request: bookingId, amount, and paymentProvider must be provided.
City and Bus Data: Essential fields (e.g., city name, bus name, bus number) are required. Date/time fields must be ISO-formatted.
