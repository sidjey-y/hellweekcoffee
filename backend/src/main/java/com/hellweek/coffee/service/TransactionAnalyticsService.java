package com.hellweek.coffee.service;

import com.hellweek.coffee.dto.analytics.*;
import com.hellweek.coffee.model.*;
import com.hellweek.coffee.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionAnalyticsService {
    private final TransactionRepository transactionRepository;

    public List<Transaction> getTransactionsInDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return transactionRepository.findByTransactionDateBetweenAndStatus(
                startDate,
                endDate,
                Transaction.TransactionStatus.COMPLETED
        );
    }

    public SalesAnalytics getSalesAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        List<Transaction> transactions = getTransactionsInDateRange(startDate, endDate);

        BigDecimal totalRevenue = transactions.stream()
                .map(Transaction::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalOrders = transactions.size();

        BigDecimal averageOrderValue = totalOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new SalesAnalytics(totalRevenue, totalOrders, averageOrderValue);
    }

    public List<ProductSalesAnalytics> getProductSalesAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        List<Transaction> transactions = getTransactionsInDateRange(startDate, endDate);

        Map<Item, ProductSalesData> productSalesMap = new HashMap<>();

        transactions.stream()
                .flatMap(transaction -> transaction.getItems().stream())
                .forEach(item -> {
                    Item menuItem = item.getItem();
                    productSalesMap.computeIfAbsent(menuItem, k -> new ProductSalesData())
                            .addSale(item.getQuantity(), item.getTotalPrice());
                });

        return productSalesMap.entrySet().stream()
                .map(entry -> new ProductSalesAnalytics(
                        entry.getKey().getName(),
                        entry.getValue().getQuantitySold(),
                        entry.getValue().getTotalRevenue()
                ))
                .sorted(Comparator.comparing(ProductSalesAnalytics::getTotalRevenue).reversed())
                .collect(Collectors.toList());
    }

    public List<PaymentMethodAnalytics> getPaymentMethodAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        List<Transaction> transactions = getTransactionsInDateRange(startDate, endDate);

        Map<Transaction.PaymentMethod, PaymentMethodData> paymentMethodMap = new HashMap<>();

        transactions.forEach(transaction -> {
            Transaction.PaymentMethod method = transaction.getPaymentMethod();
            paymentMethodMap.computeIfAbsent(method, k -> new PaymentMethodData())
                    .addTransaction(transaction.getTotalAmount());
        });

        return paymentMethodMap.entrySet().stream()
                .map(entry -> new PaymentMethodAnalytics(
                        entry.getKey(),
                        entry.getValue().getTransactionCount(),
                        entry.getValue().getTotalAmount()
                ))
                .sorted(Comparator.comparing(PaymentMethodAnalytics::getTotalAmount).reversed())
                .collect(Collectors.toList());
    }

    @RequiredArgsConstructor
    private static class ProductSalesData {
        private int quantitySold = 0;
        private BigDecimal totalRevenue = BigDecimal.ZERO;

        public void addSale(int quantity, BigDecimal revenue) {
            quantitySold += quantity;
            totalRevenue = totalRevenue.add(revenue);
        }

        public int getQuantitySold() {
            return quantitySold;
        }

        public BigDecimal getTotalRevenue() {
            return totalRevenue;
        }
    }

    @RequiredArgsConstructor
    private static class PaymentMethodData {
        private int transactionCount = 0;
        private BigDecimal totalAmount = BigDecimal.ZERO;

        public void addTransaction(BigDecimal amount) {
            transactionCount++;
            totalAmount = totalAmount.add(amount);
        }

        public int getTransactionCount() {
            return transactionCount;
        }

        public BigDecimal getTotalAmount() {
            return totalAmount;
        }
    }
}
