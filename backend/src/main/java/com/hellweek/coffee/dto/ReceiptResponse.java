package com.hellweek.coffee.dto;

import lombok.Data;
import java.util.List;

@Data
public class ReceiptResponse {
    private String transactionId;
    private String transactionDate;
    private String cashier;
    private String customerName; // null for guest
    private String membershipId; // null for guest
    private List<ReceiptItem> items;
    private double subtotal;
    private double tax;
    private double total;
    private String paymentMethod;

    @Data
    public static class ReceiptItem {
        private String itemName;
        private int quantity;
        private double unitPrice;
        private double subtotal;
        private String notes; // Customization notes
    }
}
