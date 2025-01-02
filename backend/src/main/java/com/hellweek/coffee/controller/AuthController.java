package com.hellweek.coffee.controller;

import com.hellweek.coffee.dto.ErrorResponse;
import com.hellweek.coffee.dto.LoginRequest;
import com.hellweek.coffee.dto.UserRequest;
import com.hellweek.coffee.model.User;
import com.hellweek.coffee.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class AuthController {
    private final AuthService authService;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            logger.info("Login attempt for username: {}", request.getUsername());
            User user = authService.authenticate(request);
            String token = authService.generateToken(user);
            logger.info("Login successful for user: {}, role: {}", user.getUsername(), user.getRole());
            
            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("token", token);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Login failed for username: {}, error: {}", request.getUsername(), e.getMessage());
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Invalid username or password"));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            logger.info("Token validation request received");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.error("Token validation failed: Invalid token format");
                return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid token format"));
            }

            String token = authHeader.substring(7).trim();
            String username = authService.validateToken(token);
            User user = authService.getUserByUsername(username);
            
            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("token", token);
            
            logger.info("Token validation successful for user: {}", username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Token validation failed: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Invalid token"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRequest request) {
        try {
            logger.info("Registration attempt for username: {}", request.getUsername());
            User user = authService.createUser(request);
            logger.info("Registration successful for user: {}", user.getUsername());
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            logger.error("Registration failed: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error during registration: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Registration failed. Please try again."));
        }
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody UserRequest request) {
        return ResponseEntity.ok(authService.createUser(request));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long userId,
            @RequestBody UserRequest request) {
        try {
            User updatedUser = authService.updateUser(userId, request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deactivateUser(@PathVariable Long userId) {
        try {
            authService.deactivateUser(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<User> getUser(@PathVariable Long userId) {
        return ResponseEntity.ok(authService.getUserById(userId));
    }
}
