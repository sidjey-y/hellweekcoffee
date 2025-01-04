package com.hellweek.coffee.model;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.ListAttribute;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;
import java.time.LocalDate;
import java.time.LocalDateTime;

@StaticMetamodel(Customer.class)
@Generated("org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
public abstract class Customer_ {

	
	/**
	 * @see com.hellweek.coffee.model.Customer#firstName
	 **/
	public static volatile SingularAttribute<Customer, String> firstName;
	
	/**
	 * @see com.hellweek.coffee.model.Customer#lastName
	 **/
	public static volatile SingularAttribute<Customer, String> lastName;
	
	/**
	 * @see com.hellweek.coffee.model.Customer#createdAt
	 **/
	public static volatile SingularAttribute<Customer, LocalDateTime> createdAt;
	
	/**
	 * @see com.hellweek.coffee.model.Customer#phone
	 **/
	public static volatile SingularAttribute<Customer, String> phone;
	
	/**
	 * @see com.hellweek.coffee.model.Customer#member
	 **/
	public static volatile SingularAttribute<Customer, Boolean> member;
	
	/**
	 * @see com.hellweek.coffee.model.Customer#active
	 **/
	public static volatile SingularAttribute<Customer, Boolean> active;
	
	/**
	 * @see com.hellweek.coffee.model.Customer#dateOfBirth
	 **/
	public static volatile SingularAttribute<Customer, LocalDate> dateOfBirth;
	
	/**
	 * @see com.hellweek.coffee.model.Customer#id
	 **/
	public static volatile SingularAttribute<Customer, Long> id;
	
	/**
	 * @see com.hellweek.coffee.model.Customer#membershipId
	 **/
	public static volatile SingularAttribute<Customer, String> membershipId;
	
	/**
	 * @see com.hellweek.coffee.model.Customer#transactions
	 **/
	public static volatile ListAttribute<Customer, Transaction> transactions;
	
	/**
	 * @see com.hellweek.coffee.model.Customer
	 **/
	public static volatile EntityType<Customer> class_;
	
	/**
	 * @see com.hellweek.coffee.model.Customer#email
	 **/
	public static volatile SingularAttribute<Customer, String> email;

	public static final String FIRST_NAME = "firstName";
	public static final String LAST_NAME = "lastName";
	public static final String CREATED_AT = "createdAt";
	public static final String PHONE = "phone";
	public static final String MEMBER = "member";
	public static final String ACTIVE = "active";
	public static final String DATE_OF_BIRTH = "dateOfBirth";
	public static final String ID = "id";
	public static final String MEMBERSHIP_ID = "membershipId";
	public static final String TRANSACTIONS = "transactions";
	public static final String EMAIL = "email";

}

