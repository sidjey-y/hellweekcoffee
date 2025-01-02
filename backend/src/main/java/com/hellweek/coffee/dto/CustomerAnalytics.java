package com.hellweek.coffee.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class CustomerAnalytics {
    private Map<String, Long> monthlyGrowth;
    private long newCustomersLast30Days;
    private double membershipConversionRate;
    private String formattedConversionRate;
}
