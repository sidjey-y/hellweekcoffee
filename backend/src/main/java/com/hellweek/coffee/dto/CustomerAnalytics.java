package com.hellweek.coffee.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class CustomerAnalytics {
    private Long customerId;
    private String customerName;
    private String membershipId;
    private LocalDateTime memberSince;
    private int totalVisits;
    private BigDecimal totalSpent;
    private BigDecimal averageTransactionValue;
    private int loyaltyPoints;
    private String loyaltyTier;
    private List<String> preferredItems;
    private Map<DayOfWeek, Long> preferredVisitDays;
    private Map<String, Long> preferredVisitTimes;

    // Loyalty tiers based on spending
    public static String calculateLoyaltyTier(BigDecimal totalSpent) {
        if (totalSpent.compareTo(BigDecimal.valueOf(50000)) >= 0) return "PLATINUM";
        if (totalSpent.compareTo(BigDecimal.valueOf(25000)) >= 0) return "GOLD";
        if (totalSpent.compareTo(BigDecimal.valueOf(10000)) >= 0) return "SILVER";
        return "BRONZE";
    }

    // Points calculation rules
    public static int calculatePoints(BigDecimal amount) {
        return amount.divide(BigDecimal.valueOf(50.0)).intValue(); // 1 point per 50 pesos spent
    }

    // Tier benefits
    public static BigDecimal getTierDiscount(String tier) {
        switch (tier) {
            case "PLATINUM": return BigDecimal.valueOf(0.15); // 15% discount
            case "GOLD": return BigDecimal.valueOf(0.10);     // 10% discount
            case "SILVER": return BigDecimal.valueOf(0.05);   // 5% discount
            default: return BigDecimal.ZERO;                  // No discount
        }
    }

    public static int getTierPointsMultiplier(String tier) {
        switch (tier) {
            case "PLATINUM": return 2; // 2x points
            case "GOLD": return 1;     // 1.5x points
            case "SILVER": return 1;   // 1.25x points
            default: return 1;         // Normal points
        }
    }
}
