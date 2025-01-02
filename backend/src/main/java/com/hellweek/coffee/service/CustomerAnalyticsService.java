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
            analytics.setTotalSpent(0.0);
            analytics.setAverageTransactionValue(0.0);
            analytics.setLoyaltyTier("BRONZE");
            analytics.setLoyaltyPoints(0);
            return analytics;
        }

        analytics.setTotalVisits(transactions.size());
        double totalSpent = transactions.stream()
                .mapToDouble(Transaction::getTotal)
                .sum();
        analytics.setTotalSpent(totalSpent);
        analytics.setAverageTransactionValue(totalSpent / transactions.size());
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

    private String calculateLoyaltyTier(double totalSpent) {
        if (totalSpent >= 5000) return "PLATINUM";
        if (totalSpent >= 2500) return "GOLD";
        if (totalSpent >= 1000) return "SILVER";
        return "BRONZE";
    }

    private int calculateLoyaltyPoints(List<Transaction> transactions) {
        return transactions.stream()
                .mapToInt(this::calculatePointsForTransaction)
                .sum();
    }

    private int calculatePointsForTransaction(Transaction transaction) {
        double total = transaction.getTotal();
        // Base points: 1 point per 20 pesos spent
        int basePoints = (int) (total / 20);

        // Bonus points for large transactions
        if (total >= 1000) basePoints *= 2;
        else if (total >= 500) basePoints += (int)(basePoints * 0.5);

        return basePoints;
    }
}
