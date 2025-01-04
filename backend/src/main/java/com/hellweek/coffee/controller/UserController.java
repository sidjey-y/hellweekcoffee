package com.hellweek.coffee.controller;

import com.hellweek.coffee.dto.ChangePasswordRequest;
import com.hellweek.coffee.service.UserService;
import com.hellweek.coffee.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityNotFoundException;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true", maxAge = 3600)
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthService authService;

    @DeleteMapping("/username/{username}")
    public ResponseEntity<?> deleteUserByUsername(@PathVariable String username) {
        try {
            userService.deleteUserByUsername(username);
            return ResponseEntity.ok().body("User deleted successfully");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error deleting user: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().body("User deleted successfully");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error deleting user: " + e.getMessage());
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            Authentication authentication,
            @RequestBody ChangePasswordRequest request) {
        try {
            String username = authentication.getName();
            userService.changePasswordByUsername(username, request);
            return ResponseEntity.ok().body("Password changed successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error changing password");
        }
    }
} 