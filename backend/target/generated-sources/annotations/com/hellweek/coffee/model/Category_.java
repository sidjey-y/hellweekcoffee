package com.hellweek.coffee.model;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

@StaticMetamodel(Category.class)
@Generated("org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
public abstract class Category_ {

	
	/**
	 * @see com.hellweek.coffee.model.Category#name
	 **/
	public static volatile SingularAttribute<Category, String> name;
	
	/**
	 * @see com.hellweek.coffee.model.Category#active
	 **/
	public static volatile SingularAttribute<Category, Boolean> active;
	
	/**
	 * @see com.hellweek.coffee.model.Category#id
	 **/
	public static volatile SingularAttribute<Category, String> id;
	
	/**
	 * @see com.hellweek.coffee.model.Category#type
	 **/
	public static volatile SingularAttribute<Category, CategoryType> type;
	
	/**
	 * @see com.hellweek.coffee.model.Category
	 **/
	public static volatile EntityType<Category> class_;

	public static final String NAME = "name";
	public static final String ACTIVE = "active";
	public static final String ID = "id";
	public static final String TYPE = "type";

}

