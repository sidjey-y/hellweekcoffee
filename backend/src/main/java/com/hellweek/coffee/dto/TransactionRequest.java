package com.hellweek.coffee.dto;

import com.hellweek.coffee.model.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.util.List;

@Data
public class TransactionRequest {
    private String membershipId; // null for guest customers
    private String guestFirstName; // required for guest customers

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @Valid
    @NotNull(message = "Items are required")
    private List<TransactionItemRequest> items;

    @Data
    public static class TransactionItemRequest {
        @NotNull(message = "Item code is required")
        private String itemCode;

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be positive")
        private Integer quantity;

        private String size; // required for drinks
        private List<String> customizations;
        private String notes;
    }
}
