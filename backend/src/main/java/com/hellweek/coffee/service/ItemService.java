package com.hellweek.coffee.service;

import com.hellweek.coffee.dto.ItemRequest;
import com.hellweek.coffee.model.Category;
import com.hellweek.coffee.model.Customization;
import com.hellweek.coffee.model.Item;
import com.hellweek.coffee.model.ItemType;
import com.hellweek.coffee.repository.CategoryRepository;
import com.hellweek.coffee.repository.CustomizationRepository;
import com.hellweek.coffee.repository.ItemRepository;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ItemService {
    private static final Logger logger = LoggerFactory.getLogger(ItemService.class);
    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final CustomizationRepository customizationRepository;

    @PostConstruct
    @Transactional
    public void initializeDefaultItems() {
        try {
            logger.info("Checking if default items need to be initialized...");
            // Only initialize if there are no items
            if (itemRepository.count() == 0) {
                logger.info("No items found. Creating defaults...");
                
                // Find or create the general category
                Category generalCategory = categoryRepository.findById("GENERAL")
                    .orElseGet(() -> {
                        Category newCategory = new Category();
                        newCategory.setId("GENERAL");
                        newCategory.setName("General");
                        newCategory.setType(ItemType.ESPRESSO_DRINK);
                        newCategory.setActive(true);
                        return categoryRepository.save(newCategory);
                    });
                logger.info("Using category: {}", generalCategory.getId());

                // Create default items if they don't exist
                if (itemRepository.findById("ESP001").isEmpty()) {
                    createDefaultItem(
                        "ESP001",
                        "Espresso",
                        "Classic espresso shot",
                        generalCategory,
                        120.00,
                        ItemType.ESPRESSO_DRINK
                    );
                }

                if (itemRepository.findById("ESP002").isEmpty()) {
                    createDefaultItem(
                        "ESP002",
                        "Cappuccino",
                        "Espresso with steamed milk and foam",
                        generalCategory,
                        150.00,
                        ItemType.ESPRESSO_DRINK
                    );
                }

                if (itemRepository.findById("ESP003").isEmpty()) {
                    createDefaultItem(
                        "ESP003",
                        "Cafe Latte",
                        "Espresso with steamed milk",
                        generalCategory,
                        150.00,
                        ItemType.ESPRESSO_DRINK
                    );
                }
                logger.info("Default items created successfully");
            } else {
                logger.info("Items already exist. Skipping initialization.");
            }
        } catch (Exception e) {
            logger.error("Error initializing default items: {}", e.getMessage(), e);
            // Don't throw the exception - just log it
        }
    }

    private Item createDefaultItem(
        String code,
        String name,
        String description,
        Category category,
        Double basePrice,
        ItemType type
    ) {
        Item item = new Item();
        item.setCode(code);
        item.setName(name);
        item.setDescription(description);
        item.setCategory(category);
        item.setBasePrice(basePrice);
        item.setType(type);
        item.setActive(true);
        item.setSizePrices(new HashMap<>());
        return itemRepository.save(item);
    }

    @Transactional
    public Item createItem(ItemRequest request) {
        try {
            logger.info("Creating new item with name: {}", request.getName());
            
            Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> {
                    logger.error("Category not found with ID: {}", request.getCategoryId());
                    return new EntityNotFoundException("Category not found: " + request.getCategoryId());
                });
            logger.info("Found category: {}", category.getId());

            Item item = new Item();
            String code = generateItemCode(request.getType());
            item.setCode(code);
            item.setName(request.getName());
            item.setDescription(request.getDescription());
            item.setBasePrice(request.getBasePrice());
            item.setCategory(category);
            item.setSizePrices(request.getSizePrices() != null ? request.getSizePrices() : new HashMap<>());
            item.setType(request.getType());
            item.setActive(true);
            
            if (request.getAvailableCustomizations() != null) {
                Set<Customization> customizations = new HashSet<>(
                    customizationRepository.findAllById(request.getAvailableCustomizations())
                );
                item.setAvailableCustomizations(customizations);
            }

            Item savedItem = itemRepository.save(item);
            logger.info("Item created successfully with code: {}", savedItem.getCode());
            return savedItem;
        } catch (Exception e) {
            logger.error("Error creating item: {}", e.getMessage(), e);
            throw e;
        }
    }

    private String generateItemCode(ItemType type) {
        long count = itemRepository.countByType(type);
        String prefix = switch (type) {
            case ESPRESSO_DRINK -> "ESP";
            case BLENDED_DRINK -> "BLD";
            case TEA -> "TEA";
            case OTHER_DRINK -> "DRK";
            case PASTRY -> "PST";
            case CAKE -> "CAK";
            case SANDWICH -> "SND";
            case PASTA -> "PST";
            case OTHER_FOOD -> "FOD";
            case TSHIRT -> "TSH";
            case BAG -> "BAG";
            case MUG -> "MUG";
            case OTHER_MERCHANDISE -> "MER";
        };
        return String.format("%s%03d", prefix, count + 1);
    }

    @Transactional(readOnly = true)
    public List<Item> getAllItems(Boolean active, String categoryId) {
        try {
            logger.info("Fetching all items. Active: {}, CategoryId: {}", active, categoryId);
            List<Item> items;
            if (active != null && categoryId != null) {
                items = itemRepository.findByActiveAndCategoryId(active, categoryId);
            } else if (active != null) {
                items = itemRepository.findByActive(active);
            } else if (categoryId != null) {
                items = itemRepository.findByCategoryId(categoryId);
            } else {
                items = itemRepository.findAll();
            }
            logger.info("Found {} items", items.size());
            return items;
        } catch (Exception e) {
            logger.error("Error fetching items: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public Item getItemByCode(String code) {
        return itemRepository.findById(code)
            .orElseThrow(() -> new EntityNotFoundException("Item not found"));
    }

    @Transactional
    public Item updateItem(String code, ItemRequest request) {
        Item item = getItemByCode(code);
        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setBasePrice(request.getBasePrice());
        item.setCategory(category);
        item.setSizePrices(request.getSizePrices());
        item.setType(request.getType());
        
        if (request.getAvailableCustomizations() != null) {
            Set<Customization> customizations = new HashSet<>(
                customizationRepository.findAllById(request.getAvailableCustomizations())
            );
            item.setAvailableCustomizations(customizations);
        }

        return itemRepository.save(item);
    }

    @Transactional
    public void deleteItem(String code) {
        try {
            logger.info("Deleting item with code: {}", code);
            Item item = getItemByCode(code);
            itemRepository.delete(item);
            logger.info("Item deleted successfully: {}", code);
        } catch (Exception e) {
            logger.error("Error deleting item {}: {}", code, e.getMessage(), e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<Item> getItemsByType(ItemType type) {
        return itemRepository.findByType(type);
    }
}
