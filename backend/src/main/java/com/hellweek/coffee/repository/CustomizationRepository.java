package com.hellweek.coffee.repository;

import com.hellweek.coffee.model.Customization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomizationRepository extends JpaRepository<Customization, Long> {
    List<Customization> findByApplicableType(Customization.ItemType type);
    boolean existsByName(String name);
}
