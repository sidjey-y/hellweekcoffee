package com.hellweek.coffee.service;

import com.hellweek.coffee.dto.ItemRequest;
import com.hellweek.coffee.model.Category;
import com.hellweek.coffee.model.Customization;
import com.hellweek.coffee.model.Item;
import com.hellweek.coffee.model.ItemType;
import com.hellweek.coffee.repository.CategoryRepository;
import com.hellweek.coffee.repository.CustomizationRepository;
import com.hellweek.coffee.repository.ItemRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ItemService {
    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final CustomizationRepository customizationRepository;

    @Transactional
    public Item createItem(ItemRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        Item item = new Item();
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

    @Transactional(readOnly = true)
    public List<Item> getAllItems(Boolean active, String categoryId) {
        if (active != null && categoryId != null) {
            return itemRepository.findByActiveAndCategoryId(active, categoryId);
        } else if (active != null) {
            return itemRepository.findByActive(active);
        } else if (categoryId != null) {
            return itemRepository.findByCategoryId(categoryId);
        }
        return itemRepository.findAll();
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
        Item item = getItemByCode(code);
        item.setActive(false);
        itemRepository.save(item);
    }

    @Transactional(readOnly = true)
    public List<Item> getItemsByType(ItemType type) {
        return itemRepository.findByType(type);
    }
}
