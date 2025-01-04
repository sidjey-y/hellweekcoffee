package com.hellweek.coffee.service;

import com.hellweek.coffee.dto.CategoryRequest;
import com.hellweek.coffee.model.Category;
import com.hellweek.coffee.model.CategoryType;
import com.hellweek.coffee.repository.CategoryRepository;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @PostConstruct
    @Transactional
    public void initializeCategories() {
        if (categoryRepository.count() > 0) {
            return;
        }

        createCategory("ESPRESSO_DRINKS", "Espresso Drinks", CategoryType.ESPRESSO_DRINKS);
        createCategory("BLENDED_DRINKS", "Blended Drinks", CategoryType.BLENDED_DRINKS);
        createCategory("TEA", "Tea", CategoryType.TEA);
        createCategory("OTHER_DRINKS", "Other Drinks", CategoryType.OTHER_DRINKS);

        createCategory("PASTRIES", "Pastries", CategoryType.PASTRIES);
        createCategory("CAKES", "Cakes", CategoryType.CAKES);
        createCategory("SANDWICHES", "Sandwiches", CategoryType.SANDWICHES);
        createCategory("PASTAS", "Pastas", CategoryType.PASTAS);
        createCategory("OTHER_FOOD", "Other Food", CategoryType.OTHER_FOOD);

        createCategory("TSHIRTS", "T-Shirts", CategoryType.TSHIRTS);
        createCategory("BAGS", "Bags", CategoryType.BAGS);
        createCategory("MUGS", "Mugs", CategoryType.MUGS);
        createCategory("OTHER_MERCHANDISE", "Other Merchandise", CategoryType.OTHER_MERCHANDISE);
    }

    @Transactional
    public void reinitializeCategories() {
        // Clear all existing categories
        categoryRepository.deleteAll();
        
        // Initialize categories
        createCategory("ESPRESSO_DRINKS", "Espresso Drinks", CategoryType.ESPRESSO_DRINKS);
        createCategory("BLENDED_DRINKS", "Blended Drinks", CategoryType.BLENDED_DRINKS);
        createCategory("TEA", "Tea", CategoryType.TEA);
        createCategory("OTHER_DRINKS", "Other Drinks", CategoryType.OTHER_DRINKS);

        createCategory("PASTRIES", "Pastries", CategoryType.PASTRIES);
        createCategory("CAKES", "Cakes", CategoryType.CAKES);
        createCategory("SANDWICHES", "Sandwiches", CategoryType.SANDWICHES);
        createCategory("PASTAS", "Pastas", CategoryType.PASTAS);
        createCategory("OTHER_FOOD", "Other Food", CategoryType.OTHER_FOOD);

        createCategory("TSHIRTS", "T-Shirts", CategoryType.TSHIRTS);
        createCategory("BAGS", "Bags", CategoryType.BAGS);
        createCategory("MUGS", "Mugs", CategoryType.MUGS);
        createCategory("OTHER_MERCHANDISE", "Other Merchandise", CategoryType.OTHER_MERCHANDISE);
    }

    @Transactional
    public Category createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setId(request.getCategoryId());
        category.setName(request.getName());
        category.setType(CategoryType.valueOf(request.getCategoryId()));
        category.setActive(true);
        return categoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public List<Category> getAllCategories(Boolean active) {
        if (active != null) {
            return categoryRepository.findByActive(active);
        }
        return categoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Category getCategoryById(String id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found: " + id));
    }

    @Transactional
    public Category updateCategory(String id, CategoryRequest request) {
        Category category = getCategoryById(id);
        category.setName(request.getName());
        category.setType(CategoryType.valueOf(request.getCategoryId()));
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(String id) {
        Category category = getCategoryById(id);
        category.setActive(false);
        categoryRepository.save(category);
    }

    private void createCategory(String id, String name, CategoryType type) {
        Category category = new Category();
        category.setId(id);
        category.setName(name);
        category.setType(type);
        category.setActive(true);
        categoryRepository.save(category);
    }

    public Category getCategoryByType(CategoryType type) {
        return categoryRepository.findByType(type)
                .orElseThrow(() -> new RuntimeException("Category not found for type: " + type));
    }
} 