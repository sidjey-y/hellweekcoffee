package com.hellweek.coffee.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class TransactionAnalytics {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private double totalRevenue;
    private int totalTransactions;
    private double averageTransactionValue;
    private List<ItemSalesData> topSellingItems;
    private Map<String, Integer> salesByCategory;
    private Map<String, Integer> salesByPaymentMethod;
    private List<CustomizationData> popularCustomizations;

    @Data
    public static class ItemSalesData {
        private String itemCode;
        private String itemName;
        private String category;
        private int quantity;
        private double revenue;
        private Map<String, Integer> sizeDistribution; // For drinks
    }

    @Data
    public static class CustomizationData {
        private String customizationName;
        private String optionName;
        private int count;
        private double revenue;
    }
}
