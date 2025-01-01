package com.hellweek.coffee.repository;

import com.hellweek.coffee.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByMembershipId(String membershipId);
    boolean existsByMembershipId(String membershipId);
}
