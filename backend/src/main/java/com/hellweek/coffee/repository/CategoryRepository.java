package com.hellweek.coffee.repository;

import com.hellweek.coffee.model.Category;
import com.hellweek.coffee.model.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    List<Category> findByActive(boolean active);
    List<Category> findByItemType(ItemType itemType);
    List<Category> findByActiveAndItemType(boolean active, ItemType itemType);
}
