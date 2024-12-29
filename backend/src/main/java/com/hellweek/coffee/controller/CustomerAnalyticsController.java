package com.hellweek.coffee.controller;

import com.hellweek.coffee.dto.CustomerAnalytics;
import com.hellweek.coffee.service.CustomerAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerAnalyticsController {
    private final CustomerAnalyticsService analyticsService;

    @GetMapping("/{customerId}")
    public ResponseEntity<CustomerAnalytics> getCustomerAnalytics(@PathVariable Long customerId) {
        return ResponseEntity.ok(analyticsService.generateCustomerAnalytics(customerId));
    }

    @GetMapping("/tiers/{tier}/benefits")
    public ResponseEntity<Map<String, Object>> getTierBenefits(@PathVariable String tier) {
        Map<String, Object> benefits = new HashMap<>();
        benefits.put("discount", CustomerAnalytics.getTierDiscount(tier));
        benefits.put("pointsMultiplier", CustomerAnalytics.getTierPointsMultiplier(tier));
        return ResponseEntity.ok(benefits);
    }
}
