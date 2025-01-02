package com.hellweek.coffee.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Pattern(regexp = "[A-Z0-9]{5}", message = "Membership ID must be exactly 5 alphanumeric characters (uppercase)")
    @Column(unique = true)
    private String membershipId;

    @NotBlank(message = "First name is required")
    @Column(nullable = false)
    private String firstName;

    private String lastName;

    @Email(message = "Invalid email format")
    private String email;

    @Pattern(regexp = "^(\\+\\d{1,3}[- ]?)?\\d{10}$", message = "Invalid phone number format")
    private String phone;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "is_member", nullable = false)
    private boolean isMember = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "customer")
    private List<Transaction> transactions;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        validateContactInfo();
    }

    @PreUpdate
    protected void onUpdate() {
        validateContactInfo();
    }

    private void validateContactInfo() {
        if (isMember) {
            if (lastName == null || lastName.trim().isEmpty()) {
                throw new IllegalStateException("Full name is required for members");
            }
            if (dateOfBirth == null) {
                throw new IllegalStateException("Date of birth is required for members");
            }
            if ((email == null || email.trim().isEmpty()) && (phone == null || phone.trim().isEmpty())) {
                throw new IllegalStateException("Either email or phone number must be provided for members");
            }
            if (membershipId == null || !membershipId.matches("[A-Z0-9]{5}")) {
                throw new IllegalStateException("Valid membership ID is required for members");
            }
        } else {
            // For guests, only first name is required
            if (firstName == null || firstName.trim().isEmpty()) {
                throw new IllegalStateException("First name is required for guests");
            }
        }
    }
}
