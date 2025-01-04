package com.hellweek.coffee.model;

import com.hellweek.coffee.model.User.Role;
import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;
import java.time.LocalDate;

@StaticMetamodel(User.class)
@Generated("org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
public abstract class User_ {

	
	/**
	 * @see com.hellweek.coffee.model.User#firstName
	 **/
	public static volatile SingularAttribute<User, String> firstName;
	
	/**
	 * @see com.hellweek.coffee.model.User#lastName
	 **/
	public static volatile SingularAttribute<User, String> lastName;
	
	/**
	 * @see com.hellweek.coffee.model.User#password
	 **/
	public static volatile SingularAttribute<User, String> password;
	
	/**
	 * @see com.hellweek.coffee.model.User#role
	 **/
	public static volatile SingularAttribute<User, Role> role;
	
	/**
	 * @see com.hellweek.coffee.model.User#phone
	 **/
	public static volatile SingularAttribute<User, String> phone;
	
	/**
	 * @see com.hellweek.coffee.model.User#active
	 **/
	public static volatile SingularAttribute<User, Boolean> active;
	
	/**
	 * @see com.hellweek.coffee.model.User#id
	 **/
	public static volatile SingularAttribute<User, Long> id;
	
	/**
	 * @see com.hellweek.coffee.model.User
	 **/
	public static volatile EntityType<User> class_;
	
	/**
	 * @see com.hellweek.coffee.model.User#birthDate
	 **/
	public static volatile SingularAttribute<User, LocalDate> birthDate;
	
	/**
	 * @see com.hellweek.coffee.model.User#email
	 **/
	public static volatile SingularAttribute<User, String> email;
	
	/**
	 * @see com.hellweek.coffee.model.User#username
	 **/
	public static volatile SingularAttribute<User, String> username;

	public static final String FIRST_NAME = "firstName";
	public static final String LAST_NAME = "lastName";
	public static final String PASSWORD = "password";
	public static final String ROLE = "role";
	public static final String PHONE = "phone";
	public static final String ACTIVE = "active";
	public static final String ID = "id";
	public static final String BIRTH_DATE = "birthDate";
	public static final String EMAIL = "email";
	public static final String USERNAME = "username";

}

