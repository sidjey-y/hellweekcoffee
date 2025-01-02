package com.hellweek.coffee.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductSalesAnalytics {
    private String productName;
    private int quantitySold;
    private double totalRevenue;
}
