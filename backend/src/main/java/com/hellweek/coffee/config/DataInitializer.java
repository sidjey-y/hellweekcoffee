package com.hellweek.coffee.config;

import com.hellweek.coffee.service.CategoryService;
import com.hellweek.coffee.service.CustomizationService;
import com.hellweek.coffee.service.ItemService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {
    @Bean
    public CommandLineRunner initializeData(
            CategoryService categoryService,
            CustomizationService customizationService,
            ItemService itemService
    ) {
        return args -> {
            categoryService.initializeCategories();
            customizationService.initializeCustomizations();
            itemService.initializeItems();
        };
    }
} 