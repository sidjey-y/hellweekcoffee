package com.hellweek.coffee.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.util.List;

@Data
public class TransactionRequest {
    @NotEmpty(message = "Order items cannot be empty")
    private List<OrderItemRequest> items;

    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be positive")
    private Double total;

    @NotNull(message = "Customer type is required")
    private String customerType; // "guest" or "member"

    // For guest customers
    private String firstName;

    // For member customers
    private String membershipId;
}
