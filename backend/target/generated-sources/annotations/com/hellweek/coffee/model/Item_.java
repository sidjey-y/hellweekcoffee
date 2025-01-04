package com.hellweek.coffee.model;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.MapAttribute;
import jakarta.persistence.metamodel.SetAttribute;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

@StaticMetamodel(Item.class)
@Generated("org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
public abstract class Item_ {

	
	/**
	 * @see com.hellweek.coffee.model.Item#code
	 **/
	public static volatile SingularAttribute<Item, String> code;
	
	/**
	 * @see com.hellweek.coffee.model.Item#quantity
	 **/
	public static volatile SingularAttribute<Item, Integer> quantity;
	
	/**
	 * @see com.hellweek.coffee.model.Item#sizePrices
	 **/
	public static volatile MapAttribute<Item, Size, Double> sizePrices;
	
	/**
	 * @see com.hellweek.coffee.model.Item#imageUrl
	 **/
	public static volatile SingularAttribute<Item, String> imageUrl;
	
	/**
	 * @see com.hellweek.coffee.model.Item#name
	 **/
	public static volatile SingularAttribute<Item, String> name;
	
	/**
	 * @see com.hellweek.coffee.model.Item#description
	 **/
	public static volatile SingularAttribute<Item, String> description;
	
	/**
	 * @see com.hellweek.coffee.model.Item#active
	 **/
	public static volatile SingularAttribute<Item, Boolean> active;
	
	/**
	 * @see com.hellweek.coffee.model.Item#availableCustomizations
	 **/
	public static volatile SetAttribute<Item, Customization> availableCustomizations;
	
	/**
	 * @see com.hellweek.coffee.model.Item#category
	 **/
	public static volatile SingularAttribute<Item, Category> category;
	
	/**
	 * @see com.hellweek.coffee.model.Item#type
	 **/
	public static volatile SingularAttribute<Item, ItemType> type;
	
	/**
	 * @see com.hellweek.coffee.model.Item
	 **/
	public static volatile EntityType<Item> class_;
	
	/**
	 * @see com.hellweek.coffee.model.Item#basePrice
	 **/
	public static volatile SingularAttribute<Item, Double> basePrice;

	public static final String CODE = "code";
	public static final String QUANTITY = "quantity";
	public static final String SIZE_PRICES = "sizePrices";
	public static final String IMAGE_URL = "imageUrl";
	public static final String NAME = "name";
	public static final String DESCRIPTION = "description";
	public static final String ACTIVE = "active";
	public static final String AVAILABLE_CUSTOMIZATIONS = "availableCustomizations";
	public static final String CATEGORY = "category";
	public static final String TYPE = "type";
	public static final String BASE_PRICE = "basePrice";

}

