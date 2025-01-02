package com.hellweek.coffee.repository;

import com.hellweek.coffee.model.Item;
import com.hellweek.coffee.model.CategoryType;
import com.hellweek.coffee.model.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, String> {
    long countByCategory_Type(CategoryType type);
    List<Item> findByActive(boolean active);
    List<Item> findByCategory_Id(String categoryId);
    List<Item> findByActiveAndCategory_Id(boolean active, String categoryId);
    List<Item> findByType(ItemType type);
}
