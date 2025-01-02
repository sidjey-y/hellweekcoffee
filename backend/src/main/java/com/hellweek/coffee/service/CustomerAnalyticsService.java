package com.hellweek.coffee.service;

import com.hellweek.coffee.model.Customer;
import com.hellweek.coffee.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerAnalyticsService {
    private final CustomerRepository customerRepository;

    public Map<String, Long> getCustomerGrowthByMonth() {
        List<Customer> customers = customerRepository.findAll();
        
        return customers.stream()
            .collect(Collectors.groupingBy(
                customer -> customer.getCreatedAt().getYear() + "-" + 
                           String.format("%02d", customer.getCreatedAt().getMonthValue()),
                Collectors.counting()
            ));
    }

    public long getNewCustomersInLastDays(int days) {
        LocalDateTime cutoffDate = LocalDateTime.now().minus(days, ChronoUnit.DAYS);
        return customerRepository.countByCreatedAtAfter(cutoffDate);
    }

    public double getMembershipConversionRate() {
        long totalCustomers = customerRepository.count();
        if (totalCustomers == 0) return 0.0;
        
        long memberCount = customerRepository.countByMemberTrue();
        return (double) memberCount / totalCustomers * 100;
    }
}
