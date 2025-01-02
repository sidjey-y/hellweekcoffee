package com.hellweek.coffee.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesAnalytics {
    private BigDecimal totalRevenue;
    private int totalOrders;
    private BigDecimal averageOrderValue;
}
