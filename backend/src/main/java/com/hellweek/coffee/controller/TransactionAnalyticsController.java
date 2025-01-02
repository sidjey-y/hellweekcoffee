package com.hellweek.coffee.controller;

import com.hellweek.coffee.dto.analytics.*;
import com.hellweek.coffee.service.TransactionAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransactionAnalyticsController {
    private final TransactionAnalyticsService analyticsService;

    @GetMapping("/sales")
    public ResponseEntity<SalesAnalytics> getSalesAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(analyticsService.getSalesAnalytics(startDate, endDate));
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductSalesAnalytics>> getProductSalesAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(analyticsService.getProductSalesAnalytics(startDate, endDate));
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<List<PaymentMethodAnalytics>> getPaymentMethodAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(analyticsService.getPaymentMethodAnalytics(startDate, endDate));
    }
}
