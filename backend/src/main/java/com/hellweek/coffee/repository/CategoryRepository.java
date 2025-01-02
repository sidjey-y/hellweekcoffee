package com.hellweek.coffee.repository;

import com.hellweek.coffee.model.Category;
import com.hellweek.coffee.model.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    List<Category> findByActive(boolean active);
    Optional<Category> findByType(CategoryType type);
}
