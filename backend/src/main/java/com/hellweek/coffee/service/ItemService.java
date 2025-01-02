package com.hellweek.coffee.service;

import com.hellweek.coffee.dto.ItemRequest;
import com.hellweek.coffee.model.*;
import com.hellweek.coffee.repository.ItemRepository;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ItemService {
    private final ItemRepository itemRepository;
    private final CategoryService categoryService;
    private final CustomizationService customizationService;

    public ItemService(
            ItemRepository itemRepository,
            CategoryService categoryService,
            CustomizationService customizationService
    ) {
        this.itemRepository = itemRepository;
        this.categoryService = categoryService;
        this.customizationService = customizationService;
    }

    private String generateItemCode(CategoryType categoryType, String itemName) {
        // Get first and last characters of category
        String categoryStr = categoryType.name();
        String categoryChars = String.format("%s%s", 
            categoryStr.charAt(0), 
            categoryStr.charAt(categoryStr.length() - 1)
        ).toUpperCase();
        
        // Get up to first four letters of name, or all if name is shorter
        String nameChars = itemName.length() >= 4 ? 
            itemName.substring(0, 4).toUpperCase() : 
            itemName.toUpperCase();
        
        // Count items in this category to generate sequence number
        long count = itemRepository.countByCategory_Type(categoryType);
        String sequenceNumber = String.format("%03d", count + 1);
        
        // Format: XX-YYY-ZZZ or XX-YYYY-ZZZ (depending on name length)
        return String.format("%s-%s-%s", categoryChars, nameChars, sequenceNumber);
    }

    @PostConstruct
    @Transactional
    public void initializeItems() {
        if (itemRepository.count() > 0) {
            return;
        }

        // Drinks
        createItem("Espresso", CategoryType.ESPRESSO_DRINKS, 120.0, "Classic espresso shot");
        createItem("Cappuccino", CategoryType.ESPRESSO_DRINKS, 150.0, "Espresso with steamed milk and foam");
        createItem("Latte", CategoryType.ESPRESSO_DRINKS, 160.0, "Espresso with steamed milk");
        createItem("Americano", CategoryType.ESPRESSO_DRINKS, 130.0, "Espresso with hot water");

        createItem("Mocha Frappuccino", CategoryType.BLENDED_DRINKS, 180.0, "Blended coffee with chocolate");
        createItem("Caramel Frappuccino", CategoryType.BLENDED_DRINKS, 180.0, "Blended coffee with caramel");

        createItem("Green Tea", CategoryType.TEA, 130.0, "Classic green tea");
        createItem("Earl Grey", CategoryType.TEA, 130.0, "Black tea with bergamot");

        createItem("Hot Chocolate", CategoryType.OTHER_DRINKS, 140.0, "Rich hot chocolate");

        // Food
        createItem("Croissant", CategoryType.PASTRIES, 80.0, "Butter croissant");
        createItem("Danish", CategoryType.PASTRIES, 90.0, "Fruit danish pastry");

        createItem("Chocolate Cake", CategoryType.CAKES, 150.0, "Rich chocolate cake");
        createItem("Cheesecake", CategoryType.CAKES, 180.0, "Classic cheesecake");

        createItem("Club Sandwich", CategoryType.SANDWICHES, 160.0, "Triple-decker sandwich");
        createItem("Grilled Cheese", CategoryType.SANDWICHES, 140.0, "Classic grilled cheese");

        createItem("Carbonara", CategoryType.PASTAS, 180.0, "Creamy pasta carbonara");
        createItem("Bolognese", CategoryType.PASTAS, 190.0, "Pasta with meat sauce");

        // Merchandise
        createItem("Logo T-Shirt", CategoryType.TSHIRTS, 599.0, "Coffee shop logo t-shirt");
        createItem("Staff T-Shirt", CategoryType.TSHIRTS, 699.0, "Staff uniform t-shirt");

        createItem("Tote Bag", CategoryType.BAGS, 299.0, "Canvas tote bag");
        createItem("Laptop Bag", CategoryType.BAGS, 899.0, "Coffee shop laptop bag");

        createItem("Coffee Mug", CategoryType.MUGS, 299.0, "Ceramic coffee mug");
        createItem("Travel Mug", CategoryType.MUGS, 399.0, "Stainless steel travel mug");
    }

    @Transactional
    public Item createItem(ItemRequest request) {
        Category category = categoryService.getCategoryByType(CategoryType.valueOf(request.getCategoryId()));
        
        Item item = new Item();
        item.setCode(generateItemCode(category.getType(), request.getName()));
        item.setName(request.getName());
        item.setType(getItemTypeFromCategory(category.getType()));
        item.setBasePrice(request.getBasePrice());
        item.setCategory(category);
        item.setDescription(request.getDescription());
        item.setActive(request.isActive());
        item.setQuantity(request.getQuantity());
        
        // Set size prices
        if (isDrinkCategory(category.getType()) || category.getType() == CategoryType.TSHIRTS) {
            Map<Size, Double> sizePrices = new EnumMap<>(Size.class);
            sizePrices.put(Size.SMALL, request.getBasePrice() * 0.8);
            sizePrices.put(Size.MEDIUM, request.getBasePrice());
            sizePrices.put(Size.LARGE, request.getBasePrice() * 1.2 + 20);
            item.setSizePrices(sizePrices);
        } else {
            Map<Size, Double> sizePrices = new EnumMap<>(Size.class);
            sizePrices.put(Size.SMALL, 0.0);
            sizePrices.put(Size.MEDIUM, 0.0);
            sizePrices.put(Size.LARGE, 0.0);
            item.setSizePrices(sizePrices);
        }

        // Add customizations
        Set<Customization> customizations = customizationService.getCustomizationsByCategory(category.getType());
        item.setAvailableCustomizations(customizations);

        return itemRepository.save(item);
    }

    @Transactional(readOnly = true)
    public List<Item> getAllItems(Boolean active, String categoryId) {
        if (active != null && categoryId != null) {
            return itemRepository.findByActiveAndCategory_Id(active, categoryId);
        } else if (active != null) {
            return itemRepository.findByActive(active);
        } else if (categoryId != null) {
            return itemRepository.findByCategory_Id(categoryId);
        }
        return itemRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Item getItemByCode(String code) {
        return itemRepository.findById(code)
                .orElseThrow(() -> new EntityNotFoundException("Item not found: " + code));
    }

    @Transactional
    public Item updateItem(String code, ItemRequest request) {
        Item item = getItemByCode(code);
        Category category = categoryService.getCategoryByType(CategoryType.valueOf(request.getCategoryId()));
        
        item.setName(request.getName());
        item.setType(getItemTypeFromCategory(category.getType()));
        item.setBasePrice(request.getBasePrice());
        item.setCategory(category);
        item.setDescription(request.getDescription());
        item.setActive(request.isActive());
        item.setQuantity(request.getQuantity());
        
        // Update size prices
        if (isDrinkCategory(category.getType()) || category.getType() == CategoryType.TSHIRTS) {
            Map<Size, Double> sizePrices = new EnumMap<>(Size.class);
            sizePrices.put(Size.SMALL, request.getBasePrice() * 0.8);
            sizePrices.put(Size.MEDIUM, request.getBasePrice());
            sizePrices.put(Size.LARGE, request.getBasePrice() * 1.2 + 20);
            item.setSizePrices(sizePrices);
        }

        // Update customizations
        Set<Customization> customizations = customizationService.getCustomizationsByCategory(category.getType());
        item.setAvailableCustomizations(customizations);

        return itemRepository.save(item);
    }

    @Transactional
    public void deleteItem(String code) {
        Item item = getItemByCode(code);
        itemRepository.delete(item);
    }

    @Transactional(readOnly = true)
    public List<Item> getItemsByType(ItemType type) {
        return itemRepository.findByType(type);
    }

    private void createItem(String name, CategoryType categoryType, Double basePrice, String description) {
        Item item = new Item();
        item.setCode(generateItemCode(categoryType, name));
        item.setName(name);
        item.setCategory(categoryService.getCategoryByType(categoryType));
        item.setType(getItemTypeFromCategory(categoryType));
        item.setBasePrice(basePrice);
        item.setDescription(description);
        item.setActive(true);
        item.setQuantity(10); // Default quantity
        
        // Set size prices for drinks and t-shirts
        if (isDrinkCategory(categoryType) || categoryType == CategoryType.TSHIRTS) {
            Map<Size, Double> sizePrices = new EnumMap<>(Size.class);
            sizePrices.put(Size.SMALL, basePrice * 0.8);
            sizePrices.put(Size.MEDIUM, basePrice);
            sizePrices.put(Size.LARGE, basePrice * 1.2 + 20);
            item.setSizePrices(sizePrices);
        } else {
            Map<Size, Double> sizePrices = new EnumMap<>(Size.class);
            sizePrices.put(Size.SMALL, 0.0);
            sizePrices.put(Size.MEDIUM, 0.0);
            sizePrices.put(Size.LARGE, 0.0);
            item.setSizePrices(sizePrices);
        }

        // Add customizations
        Set<Customization> customizations = customizationService.getCustomizationsByCategory(categoryType);
        item.setAvailableCustomizations(customizations);

        itemRepository.save(item);
    }

    private ItemType getItemTypeFromCategory(CategoryType categoryType) {
        return switch (categoryType) {
            case ESPRESSO_DRINKS, BLENDED_DRINKS, TEA, OTHER_DRINKS -> ItemType.DRINKS;
            case PASTRIES, CAKES, SANDWICHES, PASTAS, OTHER_FOOD -> ItemType.FOOD;
            case TSHIRTS, BAGS, MUGS, OTHER_MERCHANDISE -> ItemType.MERCHANDISE;
        };
    }

    private boolean isDrinkCategory(CategoryType categoryType) {
        return categoryType == CategoryType.ESPRESSO_DRINKS ||
               categoryType == CategoryType.BLENDED_DRINKS ||
               categoryType == CategoryType.TEA ||
               categoryType == CategoryType.OTHER_DRINKS;
    }
}
