package com.hellweek.coffee.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CustomerRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    private LocalDate dateOfBirth;

    @Email(message = "Invalid email format")
    private String email;

    @Pattern(regexp = "^[0-9+() -]{7,20}$", message = "Phone number must be between 7 and 20 digits")
    private String phone;

    private boolean member = false;

    private String membershipId;
}
