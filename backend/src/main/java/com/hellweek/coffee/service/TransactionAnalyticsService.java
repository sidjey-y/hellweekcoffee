package com.hellweek.coffee.service;

import com.hellweek.coffee.model.*;
import com.hellweek.coffee.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionAnalyticsService {
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> generateDailySalesReport(LocalDateTime date) {
        LocalDateTime startOfDay = date.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        List<Transaction> transactions = transactionRepository
            .findCompletedTransactionsInDateRange(startOfDay, endOfDay);

        Map<String, Object> report = new HashMap<>();
        report.put("date", date.toLocalDate());
        report.put("totalTransactions", transactions.size());
        report.put("totalRevenue", calculateTotalRevenue(transactions));
        report.put("averageTransactionValue", calculateAverageTransactionValue(transactions));
        report.put("itemsSold", calculateItemsSold(transactions));
        report.put("popularItems", findPopularItems(transactions));
        report.put("paymentMethods", analyzePaymentMethods(transactions));
        report.put("hourlyRevenue", analyzeHourlyRevenue(transactions));

        return report;
    }

    private double calculateTotalRevenue(List<Transaction> transactions) {
        return transactions.stream()
            .mapToDouble(Transaction::getTotal)
            .sum();
    }

    private double calculateAverageTransactionValue(List<Transaction> transactions) {
        if (transactions.isEmpty()) return 0.0;
        return calculateTotalRevenue(transactions) / transactions.size();
    }

    private Map<String, Integer> calculateItemsSold(List<Transaction> transactions) {
        Map<String, Integer> itemsSold = new HashMap<>();
        
        for (Transaction transaction : transactions) {
            for (OrderItem item : transaction.getItems()) {
                String itemName = item.getMenuItem().getName();
                itemsSold.merge(itemName, item.getQuantity(), Integer::sum);
            }
        }
        
        return itemsSold;
    }

    private List<Map<String, Object>> findPopularItems(List<Transaction> transactions) {
        Map<MenuItem, Integer> itemFrequency = new HashMap<>();
        Map<MenuItem, Double> itemRevenue = new HashMap<>();

        for (Transaction transaction : transactions) {
            for (OrderItem item : transaction.getItems()) {
                MenuItem menuItem = item.getMenuItem();
                itemFrequency.merge(menuItem, item.getQuantity(), Integer::sum);
                itemRevenue.merge(menuItem, item.getUnitPrice() * item.getQuantity(), Double::sum);
            }
        }

        return itemFrequency.entrySet().stream()
            .map(entry -> {
                Map<String, Object> itemStats = new HashMap<>();
                MenuItem menuItem = entry.getKey();
                itemStats.put("name", menuItem.getName());
                itemStats.put("quantity", entry.getValue());
                itemStats.put("revenue", itemRevenue.get(menuItem));
                return itemStats;
            })
            .sorted((a, b) -> ((Integer) b.get("quantity")).compareTo((Integer) a.get("quantity")))
            .limit(10)
            .collect(Collectors.toList());
    }

    private Map<PaymentMethod, Double> analyzePaymentMethods(List<Transaction> transactions) {
        return transactions.stream()
            .collect(Collectors.groupingBy(
                Transaction::getPaymentMethod,
                Collectors.summingDouble(Transaction::getTotal)
            ));
    }

    private Map<Integer, Double> analyzeHourlyRevenue(List<Transaction> transactions) {
        return transactions.stream()
            .collect(Collectors.groupingBy(
                t -> t.getTransactionDate().getHour(),
                Collectors.summingDouble(Transaction::getTotal)
            ));
    }
}
