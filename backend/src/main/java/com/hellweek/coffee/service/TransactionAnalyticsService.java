package com.hellweek.coffee.service;

import com.hellweek.coffee.dto.analytics.*;
import com.hellweek.coffee.model.*;
import com.hellweek.coffee.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionAnalyticsService {
    private final TransactionRepository transactionRepository;

    public List<Transaction> getTransactionsInDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return transactionRepository.findCompletedTransactionsInDateRange(
                TransactionStatus.COMPLETED,
                startDate,
                endDate
        );
    }

    public SalesAnalytics getSalesAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        List<Transaction> transactions = getTransactionsInDateRange(startDate, endDate);

        double totalRevenue = transactions.stream()
                .mapToDouble(Transaction::getTotal)
                .sum();

        int totalOrders = transactions.size();

        double averageOrderValue = totalOrders > 0
                ? totalRevenue / totalOrders
                : 0;

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
                            .addSale(item.getQuantity(), item.getSubtotal());
                });

        return productSalesMap.entrySet().stream()
                .map(entry -> new ProductSalesAnalytics(
                        entry.getKey().getName(),
                        entry.getValue().getQuantitySold(),
                        entry.getValue().getTotalRevenue()
                ))
                .sorted(Comparator.comparingDouble(ProductSalesAnalytics::getTotalRevenue).reversed())
                .collect(Collectors.toList());
    }

    public List<PaymentMethodAnalytics> getPaymentMethodAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        List<Transaction> transactions = getTransactionsInDateRange(startDate, endDate);

        Map<PaymentMethod, PaymentMethodData> paymentMethodMap = new HashMap<>();

        transactions.forEach(transaction -> {
            PaymentMethod method = transaction.getPaymentMethod();
            paymentMethodMap.computeIfAbsent(method, k -> new PaymentMethodData())
                    .addTransaction(transaction.getTotal());
        });

        return paymentMethodMap.entrySet().stream()
                .map(entry -> new PaymentMethodAnalytics(
                        entry.getKey(),
                        entry.getValue().getTransactionCount(),
                        entry.getValue().getTotalAmount()
                ))
                .sorted(Comparator.comparingDouble(PaymentMethodAnalytics::getTotalAmount).reversed())
                .collect(Collectors.toList());
    }

    @RequiredArgsConstructor
    private static class ProductSalesData {
        private int quantitySold = 0;
        private double totalRevenue = 0;

        public void addSale(int quantity, double revenue) {
            quantitySold += quantity;
            totalRevenue += revenue;
        }

        public int getQuantitySold() {
            return quantitySold;
        }

        public double getTotalRevenue() {
            return totalRevenue;
        }
    }

    @RequiredArgsConstructor
    private static class PaymentMethodData {
        private int transactionCount = 0;
        private double totalAmount = 0;

        public void addTransaction(double amount) {
            transactionCount++;
            totalAmount += amount;
        }

        public int getTransactionCount() {
            return transactionCount;
        }

        public double getTotalAmount() {
            return totalAmount;
        }
    }
}
