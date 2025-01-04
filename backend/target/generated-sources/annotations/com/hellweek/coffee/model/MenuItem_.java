package com.hellweek.coffee.model;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.MapAttribute;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

@StaticMetamodel(MenuItem.class)
@Generated("org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
public abstract class MenuItem_ {

	
	/**
	 * @see com.hellweek.coffee.model.MenuItem#code
	 **/
	public static volatile SingularAttribute<MenuItem, String> code;
	
	/**
	 * @see com.hellweek.coffee.model.MenuItem#imageUrl
	 **/
	public static volatile SingularAttribute<MenuItem, String> imageUrl;
	
	/**
	 * @see com.hellweek.coffee.model.MenuItem#name
	 **/
	public static volatile SingularAttribute<MenuItem, String> name;
	
	/**
	 * @see com.hellweek.coffee.model.MenuItem#available
	 **/
	public static volatile SingularAttribute<MenuItem, Boolean> available;
	
	/**
	 * @see com.hellweek.coffee.model.MenuItem#description
	 **/
	public static volatile SingularAttribute<MenuItem, String> description;
	
	/**
	 * @see com.hellweek.coffee.model.MenuItem#id
	 **/
	public static volatile SingularAttribute<MenuItem, Long> id;
	
	/**
	 * @see com.hellweek.coffee.model.MenuItem#category
	 **/
	public static volatile SingularAttribute<MenuItem, String> category;
	
	/**
	 * @see com.hellweek.coffee.model.MenuItem
	 **/
	public static volatile EntityType<MenuItem> class_;
	
	/**
	 * @see com.hellweek.coffee.model.MenuItem#sizePriceAdjustments
	 **/
	public static volatile MapAttribute<MenuItem, String, Double> sizePriceAdjustments;
	
	/**
	 * @see com.hellweek.coffee.model.MenuItem#customizationPriceAdjustments
	 **/
	public static volatile MapAttribute<MenuItem, String, Double> customizationPriceAdjustments;
	
	/**
	 * @see com.hellweek.coffee.model.MenuItem#basePrice
	 **/
	public static volatile SingularAttribute<MenuItem, Double> basePrice;

	public static final String CODE = "code";
	public static final String IMAGE_URL = "imageUrl";
	public static final String NAME = "name";
	public static final String AVAILABLE = "available";
	public static final String DESCRIPTION = "description";
	public static final String ID = "id";
	public static final String CATEGORY = "category";
	public static final String SIZE_PRICE_ADJUSTMENTS = "sizePriceAdjustments";
	public static final String CUSTOMIZATION_PRICE_ADJUSTMENTS = "customizationPriceAdjustments";
	public static final String BASE_PRICE = "basePrice";

}

