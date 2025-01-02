package com.hellweek.coffee.repository;

import com.hellweek.coffee.model.CustomizationOption;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomizationOptionRepository extends JpaRepository<CustomizationOption, Long> {
}
