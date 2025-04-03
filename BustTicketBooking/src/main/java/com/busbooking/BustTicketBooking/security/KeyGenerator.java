package com.busbooking.BustTicketBooking.security;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;

public class KeyGenerator {
    public static void main(String[] args) {
        var key = Keys.secretKeyFor(SignatureAlgorithm.HS512);
        String base64Key = Encoders.BASE64.encode(key.getEncoded());
        System.out.println("Your Base64-encoded key: " + base64Key);
    }
}
