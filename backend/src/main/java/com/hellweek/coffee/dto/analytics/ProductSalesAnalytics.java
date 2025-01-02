package com.hellweek.coffee.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductSalesAnalytics {
    private String productName;
    private int quantitySold;
    private BigDecimal totalRevenue;
}
