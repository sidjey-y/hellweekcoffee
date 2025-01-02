package com.hellweek.coffee.repository;

import com.hellweek.coffee.model.Item;
import com.hellweek.coffee.model.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, String> {
    List<Item> findByActive(boolean active);
    List<Item> findByCategoryId(String categoryId);
    List<Item> findByActiveAndCategoryId(boolean active, String categoryId);
    List<Item> findByType(ItemType type);
    long countByType(ItemType type);
}
