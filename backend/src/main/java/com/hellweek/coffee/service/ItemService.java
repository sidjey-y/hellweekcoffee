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

    @Transactional
    public void reinitializeItems() {
        // Clear all existing items
        itemRepository.deleteAll();
        
        // Now initialize items
        initializeItems();
    }

    @Transactional
    public void initializeItems() {
        if (itemRepository.count() > 0) {
            return;
        }

        try {
            // Drinks
            createItem("Cappuccino", CategoryType.ESPRESSO_DRINKS, 110.0, "Espresso with steamed milk and foam");
            createItem("Latte", CategoryType.ESPRESSO_DRINKS, 120.0, "Espresso with steamed milk");
            createItem("Americano", CategoryType.ESPRESSO_DRINKS, 90.0, "Espresso with hot water");
            createItem("Flat White", CategoryType.ESPRESSO_DRINKS, 90.0, "Bold ristretto shots of espresso");
            
            createItem("Caramel Frappuccino", CategoryType.BLENDED_DRINKS, 180.0, "Blended coffee with caramel");
            createItem("Strawberry Shortcake Frapuccino", CategoryType.BLENDED_DRINKS, 180.0, "Blended coffee with strawberry, topped with real fruits");
            
            createItem("Chai Tea Latte", CategoryType.TEA, 130.0, "Black tea infused with cinnamon, clove, and other warming spices");
            createItem("Chamomile Tea", CategoryType.TEA, 130.0, "Herbal tea with chamomile");
            
            createItem("Hot Apple Cider", CategoryType.OTHER_DRINKS, 140.0, "Fresh apple cider");

            // Food
            createItem("Danish", CategoryType.PASTRIES, 90.0, "Fruit danish pastry");
            createItem("Bagel", CategoryType.PASTRIES, 90.0, "Bagel with cream cheese");
            
            createItem("Chocolate Cake", CategoryType.CAKES, 150.0, "Rich chocolate cake");
            createItem("Cupcake", CategoryType.CAKES, 120.0, "Cupcake with frosting");
            
            createItem("Grilled Cheese", CategoryType.SANDWICHES, 140.0, "Classic grilled cheese");
            createItem("BLT", CategoryType.SANDWICHES, 140.0, "Bacon, lettuce, and tomato sandwich");
            
            createItem("Bolognese", CategoryType.PASTAS, 190.0, "Pasta with meat sauce");
            
            createItem("HWC Salad", CategoryType.OTHER_FOOD, 190.0, "Salad with mixed greens");

            // Merchandise
            createItem("HWC Jacket", CategoryType.TSHIRTS, 899.0, "Hell Week Coffee Logo Jacket");
            createItem("HWC T-Shirt", CategoryType.TSHIRTS, 699.0, "Hell Week Coffee Logo T-Shirt");
            createItem("Laptop Bag", CategoryType.BAGS, 999.0, "Coffee shop laptop bag");
            createItem("Coffee Mug", CategoryType.MUGS, 300.0, "Ceramic coffee mug");
            createItem("Travel Mug", CategoryType.MUGS, 400.0, "Stainless steel travel mug");
            createItem("Stainless Straw", CategoryType.OTHER_MERCHANDISE, 150.0, "Stainless steel straw");

        } catch (Exception e) {
            System.err.println("Error initializing items: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String generateImageUrl(String code, CategoryType categoryType) {
        String category = switch (categoryType) {
            case ESPRESSO_DRINKS, BLENDED_DRINKS, TEA, OTHER_DRINKS -> "drinks";
            case PASTRIES, CAKES, SANDWICHES, PASTAS, OTHER_FOOD -> "food";
            case TSHIRTS, BAGS, MUGS, OTHER_MERCHANDISE -> "merchandise";
        };
        return String.format("/images/items/%s/%s.png", category.toLowerCase(), code);
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
        
        // Set image URL based on code and category type
        item.setImageUrl(generateImageUrl(item.getCode(), category.getType()));
        
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

        item = itemRepository.save(item);

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
        
        if (isDrinkCategory(category.getType()) || category.getType() == CategoryType.TSHIRTS) {
            Map<Size, Double> sizePrices = new EnumMap<>(Size.class);
            sizePrices.put(Size.SMALL, request.getBasePrice() * 0.8);
            sizePrices.put(Size.MEDIUM, request.getBasePrice());
            sizePrices.put(Size.LARGE, request.getBasePrice() * 1.2 + 20);
            item.setSizePrices(sizePrices);
        }

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
        try {
            Item item = new Item();
            item.setCode(generateItemCode(categoryType, name));
            item.setName(name);
            Category category = categoryService.getCategoryByType(categoryType);
            if (category == null) {
                System.err.println("Category not found: " + categoryType);
                return;
            }
            item.setCategory(category);
            item.setType(getItemTypeFromCategory(categoryType));
            item.setBasePrice(basePrice);
            item.setDescription(description);
            item.setActive(true);
            item.setQuantity(10);
            
            if (isDrinkCategory(categoryType) || categoryType == CategoryType.TSHIRTS) {
                Map<Size, Double> sizePrices = new EnumMap<>(Size.class);
                sizePrices.put(Size.SMALL, basePrice * 0.8);
                sizePrices.put(Size.MEDIUM, basePrice);
                sizePrices.put(Size.LARGE, basePrice * 1.2);
                item.setSizePrices(sizePrices);
            } else {
                Map<Size, Double> sizePrices = new EnumMap<>(Size.class);
                sizePrices.put(Size.SMALL, 0.0);
                sizePrices.put(Size.MEDIUM, 0.0);
                sizePrices.put(Size.LARGE, 0.0);
                item.setSizePrices(sizePrices);
            }

            // Save the item first
            item = itemRepository.save(item);
            System.out.println("Created item: " + item.getCode() + " - " + item.getName());

            // Add customizations after item is saved
            Set<Customization> customizations = customizationService.getCustomizationsByCategory(categoryType);
            item.setAvailableCustomizations(customizations);
            itemRepository.save(item);

        } catch (Exception e) {
            System.err.println("Error creating item " + name + ": " + e.getMessage());
            e.printStackTrace();
        }
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