package com.busbooking.BustTicketBooking.Controller;

import com.busbooking.BustTicketBooking.dto.UserRegistrationDto;
import com.busbooking.BustTicketBooking.dto.LoginRequest;
import com.busbooking.BustTicketBooking.dto.JwtAuthenticationResponse;
import com.busbooking.BustTicketBooking.security.CustomUserDetails;
import com.busbooking.BustTicketBooking.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationDto dto) {
        userService.registerUser(dto);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }


    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JwtAuthenticationResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        String token = userService.authenticateUser(loginRequest);
        return ResponseEntity.ok(new JwtAuthenticationResponse(token));
    }


    @GetMapping("/current")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(Map.of("id", userDetails.getId(), "email", userDetails.getUsername()));
    }


    @PostMapping(value = "/updateProfile", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UserRegistrationDto dto, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        userService.updateUser(userDetails.getId(), dto);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }
}
