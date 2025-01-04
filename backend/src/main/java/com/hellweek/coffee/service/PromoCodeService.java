package com.hellweek.coffee.service;

import com.hellweek.coffee.model.PromoCode;
import com.hellweek.coffee.repository.PromoCodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class PromoCodeService {
    private final PromoCodeRepository promoCodeRepository;

    public PromoCodeService(PromoCodeRepository promoCodeRepository) {
        this.promoCodeRepository = promoCodeRepository;
    }

    @PostConstruct
    @Transactional
    public void initializePromoCodes() {
        // Only initialize if no promo codes exist
        if (promoCodeRepository.count() > 0) {
            return;
        }

        // Set validity period for all codes (1 year)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endOfYear = now.plusYears(1);

        // Create default promo codes
        PromoCode[] defaultCodes = {
            createPromoCodeObject("WELCOME25", 25.0, now, endOfYear),  // 25% off for new customers
            createPromoCodeObject("COFFEE10", 10.0, now, endOfYear),   // 10% off any coffee
            createPromoCodeObject("STUDENT15", 15.0, now, endOfYear),  // 15% off for students
            createPromoCodeObject("BDAY20", 20.0, now, endOfYear),     // 20% off birthday special
            createPromoCodeObject("MEMBER5", 5.0, now, endOfYear),     // 5% off for members
            createPromoCodeObject("HOLIDAY30", 30.0, now, endOfYear),  // 30% off holiday special
            createPromoCodeObject("MONDAY10", 10.0, now, endOfYear)    // 10% off Monday blues
        };

        // Save all promo codes
        Arrays.stream(defaultCodes).forEach(this::createPromoCode);
    }

    private PromoCode createPromoCodeObject(String code, double discountPercent, LocalDateTime validFrom, LocalDateTime validUntil) {
        PromoCode promoCode = new PromoCode();
        promoCode.setCode(code);
        promoCode.setDiscountPercent(discountPercent);
        promoCode.setValidFrom(validFrom);
        promoCode.setValidUntil(validUntil);
        promoCode.setActive(true);
        return promoCode;
    }

    @Transactional(readOnly = true)
    public PromoCode validatePromoCode(String code) {
        LocalDateTime now = LocalDateTime.now();
        return promoCodeRepository.findByCodeAndActiveIsTrueAndValidFromBeforeAndValidUntilAfter(
            code.toUpperCase(),
            now,
            now
        ).orElseThrow(() -> new RuntimeException("Invalid or expired promo code"));
    }

    @Transactional
    public PromoCode createPromoCode(PromoCode promoCode) {
        promoCode.setCode(promoCode.getCode().toUpperCase());
        promoCode.setActive(true);
        return promoCodeRepository.save(promoCode);
    }

    @Transactional(readOnly = true)
    public List<PromoCode> getAllPromoCodes() {
        return promoCodeRepository.findAll();
    }
} 