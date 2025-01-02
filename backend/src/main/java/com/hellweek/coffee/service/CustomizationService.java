package com.hellweek.coffee.service;

import com.hellweek.coffee.model.Customization;
import com.hellweek.coffee.model.CustomizationOption;
import com.hellweek.coffee.model.CategoryType;
import com.hellweek.coffee.repository.CustomizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.annotation.PostConstruct;

import java.util.List;
import java.util.Set;
import java.util.Map;

@Service
public class CustomizationService {
    private final CustomizationRepository customizationRepository;

    public CustomizationService(CustomizationRepository customizationRepository) {
        this.customizationRepository = customizationRepository;
    }

    @PostConstruct
    @Transactional
    public void initializeCustomizations() {
        if (customizationRepository.count() > 0) {
            return;
        }

        // Drink customizations
        Map<String, Double> milkOptions = Map.of(
            "Soy Milk", 35.0,
            "Oat Milk", 40.0,
            "Almond Milk", 35.0
        );
        createCustomization("MILK", "Milk Options", milkOptions, CategoryType.ESPRESSO_DRINKS);

        Map<String, Double> syrupOptions = Map.of(
            "Vanilla", 25.0,
            "Caramel", 25.0,
            "Hazelnut", 25.0
        );
        createCustomization("SYRUP", "Flavored Syrup", syrupOptions, CategoryType.ESPRESSO_DRINKS);

        Map<String, Double> sauceOptions = Map.of(
            "Caramel", 30.0,
            "Mocha", 30.0,
            "White Mocha", 35.0
        );
        createCustomization("SAUCE", "Sauce Add-On", sauceOptions, CategoryType.BLENDED_DRINKS);

        Map<String, Double> toppingOptions = Map.of(
            "Whipped Cream", 20.0,
            "Chocolate Chips", 25.0,
            "Caramel Drizzle", 20.0
        );
        createCustomization("TOPPINGS", "Extra Toppings", toppingOptions, CategoryType.BLENDED_DRINKS);

        // Food customizations
        Map<String, Double> riceOptions = Map.of(
            "Garlic Rice", 20.0,
            "Yang Chow Rice", 30.0,
            "Brown Rice", 25.0
        );
        createCustomization("RICE", "Rice Options", riceOptions, CategoryType.SANDWICHES);

        Map<String, Double> extraOptions = Map.of(
            "Extra Cheese", 30.0,
            "Extra Bacon", 40.0,
            "Extra Vegetables", 20.0
        );
        createCustomization("EXTRAS", "Extra Add-ons", extraOptions, CategoryType.SANDWICHES);

        Map<String, Double> pastaOptions = Map.of(
            "Extra Sauce", 25.0,
            "Extra Cheese", 30.0,
            "Extra Meatballs", 45.0
        );
        createCustomization("PASTA_EXTRAS", "Pasta Add-ons", pastaOptions, CategoryType.PASTAS);
    }

    private void createCustomization(String code, String name, Map<String, Double> optionsWithPrices, CategoryType categoryType) {
        Customization customization = new Customization();
        customization.setCode(code);
        customization.setName(name);
        customization.setCategoryType(categoryType);
        customization.setActive(true);

        // Create and add CustomizationOption entities
        optionsWithPrices.forEach((optionName, price) -> {
            CustomizationOption option = new CustomizationOption();
            option.setName(optionName);
            option.setPrice(price);
            customization.addOption(option);
        });

        customizationRepository.save(customization);
    }

    public Set<Customization> getCustomizationsByCategory(CategoryType categoryType) {
        return customizationRepository.findByCategoryTypeAndActive(categoryType, true);
    }

    @Transactional(readOnly = true)
    public List<Customization> getAllCustomizations() {
        return customizationRepository.findByActive(true);
    }
}
