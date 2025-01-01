package com.hellweek.coffee.controller;

import com.hellweek.coffee.service.TransactionAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransactionAnalyticsController {
    private final TransactionAnalyticsService analyticsService;

    @GetMapping("/daily")
    public ResponseEntity<Map<String, Object>> getDailySalesReport(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date
    ) {
        return ResponseEntity.ok(analyticsService.generateDailySalesReport(date));
    }
}
