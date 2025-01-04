package com.hellweek.coffee.controller;

import com.hellweek.coffee.model.PromoCode;
import com.hellweek.coffee.service.PromoCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/promos")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true", maxAge = 3600)
public class PromoCodeController {
    private static final Logger logger = LoggerFactory.getLogger(PromoCodeController.class);
    private final PromoCodeService promoCodeService;

    public PromoCodeController(PromoCodeService promoCodeService) {
        this.promoCodeService = promoCodeService;
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validatePromoCode(@RequestBody Map<String, String> request) {
        try {
            logger.info("Validating promo code: {}", request.get("code"));
            String code = request.get("code");
            if (code == null || code.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "valid", false,
                    "message", "Please enter a promo code"
                ));
            }
            PromoCode promoCode = promoCodeService.validatePromoCode(code);
            logger.info("Promo code {} is valid with {}% discount", code, promoCode.getDiscountPercent());
            return ResponseEntity.ok(Map.of(
                "valid", true,
                "discountPercent", promoCode.getDiscountPercent()
            ));
        } catch (Exception e) {
            logger.error("Error validating promo code: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "valid", false,
                "message", "There is no such promo code. Please try again."
            ));
        }
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllPromoCodes() {
        try {
            return ResponseEntity.ok(Map.of(
                "promoCodes", promoCodeService.getAllPromoCodes()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    @PostMapping
    public ResponseEntity<PromoCode> createPromoCode(@RequestBody PromoCode promoCode) {
        return ResponseEntity.ok(promoCodeService.createPromoCode(promoCode));
    }
} 