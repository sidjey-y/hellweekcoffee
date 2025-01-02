package com.hellweek.coffee.service;

import com.hellweek.coffee.dto.CategoryRequest;
import com.hellweek.coffee.model.Category;
import com.hellweek.coffee.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    @Transactional
    public Category createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setId(UUID.randomUUID().toString());
        category.setName(request.getName());
        category.setType(request.getType());
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
            .orElseThrow(() -> new EntityNotFoundException("Category not found"));
    }

    @Transactional
    public Category updateCategory(String id, CategoryRequest request) {
        Category category = getCategoryById(id);
        category.setName(request.getName());
        category.setType(request.getType());
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(String id) {
        Category category = getCategoryById(id);
        category.setActive(false);
        categoryRepository.save(category);
    }

    @Transactional
    public void initializeDefaultCategories() {
        if (categoryRepository.count() == 0) {
            // Create default categories
            createCategory(new CategoryRequest("Hot Drinks", "ESPRESSO_DRINK"));
            createCategory(new CategoryRequest("Cold Drinks", "BLENDED_DRINK"));
            createCategory(new CategoryRequest("Teas", "TEA"));
            createCategory(new CategoryRequest("Pastries", "PASTRY"));
            createCategory(new CategoryRequest("Cakes", "CAKE"));
            createCategory(new CategoryRequest("Sandwiches", "SANDWICH"));
            createCategory(new CategoryRequest("Merchandise", "OTHER_MERCHANDISE"));
        }
    }
} 