package com.hellweek.coffee.dto.analytics;

import com.hellweek.coffee.model.Transaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodAnalytics {
    private Transaction.PaymentMethod paymentMethod;
    private int transactionCount;
    private BigDecimal totalAmount;
}
