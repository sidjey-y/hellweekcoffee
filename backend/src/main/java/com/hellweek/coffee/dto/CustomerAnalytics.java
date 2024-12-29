package com.hellweek.coffee.dto;

import lombok.Data;
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
    private double totalSpent;
    private double averageTransactionValue;
    private int loyaltyPoints;
    private String loyaltyTier;
    private List<String> preferredItems;
    private Map<DayOfWeek, Long> preferredVisitDays;
    private Map<String, Long> preferredVisitTimes;

    // Loyalty tiers based on spending
    public static String calculateLoyaltyTier(double totalSpent) {
        if (totalSpent >= 50000) return "PLATINUM";
        if (totalSpent >= 25000) return "GOLD";
        if (totalSpent >= 10000) return "SILVER";
        return "BRONZE";
    }

    // Points calculation rules
    public static int calculatePoints(double amount) {
        return (int) (amount / 50.0); // 1 point per 50 pesos spent
    }

    // Tier benefits
    public static double getTierDiscount(String tier) {
        switch (tier) {
            case "PLATINUM": return 0.15; // 15% discount
            case "GOLD": return 0.10;     // 10% discount
            case "SILVER": return 0.05;   // 5% discount
            default: return 0.0;          // No discount
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
