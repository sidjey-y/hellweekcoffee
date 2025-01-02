package com.hellweek.coffee.controller;

import com.hellweek.coffee.service.CustomerAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/analytics/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class CustomerAnalyticsController {
    private final CustomerAnalyticsService analyticsService;

    @GetMapping("/growth")
    public ResponseEntity<Map<String, Long>> getCustomerGrowth() {
        return ResponseEntity.ok(analyticsService.getCustomerGrowthByMonth());
    }

    @GetMapping("/new")
    public ResponseEntity<Long> getNewCustomers(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getNewCustomersInLastDays(days));
    }

    @GetMapping("/conversion-rate")
    public ResponseEntity<Map<String, Object>> getMembershipConversionRate() {
        double rate = analyticsService.getMembershipConversionRate();
        Map<String, Object> response = new HashMap<>();
        response.put("rate", rate);
        response.put("formatted", String.format("%.2f%%", rate));
        return ResponseEntity.ok(response);
    }
}
