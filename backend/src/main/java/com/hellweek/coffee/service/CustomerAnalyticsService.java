package com.hellweek.coffee.service;

import com.hellweek.coffee.dto.CustomerAnalytics;
import com.hellweek.coffee.model.Customer;
import com.hellweek.coffee.model.Transaction;
import com.hellweek.coffee.model.TransactionItem;
import com.hellweek.coffee.repository.CustomerRepository;
import com.hellweek.coffee.repository.TransactionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerAnalyticsService {
    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public CustomerAnalytics generateCustomerAnalytics(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));

        List<Transaction> transactions = transactionRepository.findCustomerTransactionHistory(customerId);

        CustomerAnalytics analytics = new CustomerAnalytics();
        analytics.setCustomerId(customerId);
        analytics.setCustomerName(customer.getFirstName() + " " + customer.getLastName());
        analytics.setMembershipId(customer.getMembershipId());
        analytics.setMemberSince(customer.getCreatedAt());

        if (transactions.isEmpty()) {
            analytics.setTotalVisits(0);
            analytics.setTotalSpent(BigDecimal.ZERO);
            analytics.setAverageTransactionValue(BigDecimal.ZERO);
            analytics.setLoyaltyTier("BRONZE");
            analytics.setLoyaltyPoints(0);
            return analytics;
        }

        analytics.setTotalVisits(transactions.size());
        BigDecimal totalSpent = transactions.stream()
                .map(Transaction::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        analytics.setTotalSpent(totalSpent);
        analytics.setAverageTransactionValue(
            totalSpent.divide(BigDecimal.valueOf(transactions.size()), 2, RoundingMode.HALF_UP)
        );
        analytics.setLoyaltyTier(calculateLoyaltyTier(totalSpent));
        analytics.setLoyaltyPoints(calculateLoyaltyPoints(transactions));

        // Calculate preferred visit days
        Map<DayOfWeek, Long> visitDays = transactions.stream()
                .map(t -> t.getTransactionDate().getDayOfWeek())
                .collect(Collectors.groupingBy(
                        day -> day,
                        Collectors.counting()
                ));
        analytics.setPreferredVisitDays(visitDays);

        // Calculate preferred visit times
        Map<String, Long> visitTimes = transactions.stream()
                .map(t -> getTimeOfDay(t.getTransactionDate()))
                .collect(Collectors.groupingBy(
                        timeOfDay -> timeOfDay,
                        Collectors.counting()
                ));
        analytics.setPreferredVisitTimes(visitTimes);

        // Calculate preferred items
        Map<String, Long> itemFrequency = new HashMap<>();
        for (Transaction transaction : transactions) {
            for (TransactionItem item : transaction.getItems()) {
                String itemName = item.getItem().getName();
                itemFrequency.merge(itemName, (long) item.getQuantity(), Long::sum);
            }
        }

        List<String> preferredItems = itemFrequency.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        analytics.setPreferredItems(preferredItems);

        return analytics;
    }

    private String getTimeOfDay(LocalDateTime dateTime) {
        int hour = dateTime.getHour();
        if (hour >= 5 && hour < 12) return "Morning";
        if (hour >= 12 && hour < 17) return "Afternoon";
        if (hour >= 17 && hour < 22) return "Evening";
        return "Night";
    }

    private String calculateLoyaltyTier(BigDecimal totalSpent) {
        if (totalSpent.compareTo(BigDecimal.valueOf(5000)) >= 0) return "PLATINUM";
        if (totalSpent.compareTo(BigDecimal.valueOf(2500)) >= 0) return "GOLD";
        if (totalSpent.compareTo(BigDecimal.valueOf(1000)) >= 0) return "SILVER";
        return "BRONZE";
    }

    private int calculateLoyaltyPoints(List<Transaction> transactions) {
        return transactions.stream()
                .mapToInt(this::calculatePointsForTransaction)
                .sum();
    }

    private int calculatePointsForTransaction(Transaction transaction) {
        BigDecimal amount = transaction.getTotalAmount();
        return amount.divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN)
                .multiply(BigDecimal.valueOf(10))
                .intValue(); // 10 points for every 100 spent
    }
}
