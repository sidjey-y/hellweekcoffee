package com.hellweek.coffee.repository;

import com.hellweek.coffee.model.Customization;
import com.hellweek.coffee.model.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Set;
import java.util.List;

@Repository
public interface CustomizationRepository extends JpaRepository<Customization, Long> {
    Set<Customization> findByCategoryTypeAndActive(CategoryType categoryType, boolean active);
    List<Customization> findByActive(boolean active);
}
