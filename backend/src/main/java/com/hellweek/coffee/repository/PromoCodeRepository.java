package com.hellweek.coffee.repository;

import com.hellweek.coffee.model.PromoCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PromoCodeRepository extends JpaRepository<PromoCode, Long> {
    Optional<PromoCode> findByCodeAndActiveIsTrueAndValidFromBeforeAndValidUntilAfter(
        String code,
        LocalDateTime now,
        LocalDateTime now2
    );
} 