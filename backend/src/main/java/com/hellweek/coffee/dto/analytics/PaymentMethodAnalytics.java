package com.hellweek.coffee.dto.analytics;

import com.hellweek.coffee.model.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodAnalytics {
    private PaymentMethod paymentMethod;
    private int transactionCount;
    private double totalAmount;
}
