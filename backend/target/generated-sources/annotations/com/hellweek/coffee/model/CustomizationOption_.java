package com.hellweek.coffee.model;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

@StaticMetamodel(CustomizationOption.class)
@Generated("org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
public abstract class CustomizationOption_ {

	
	/**
	 * @see com.hellweek.coffee.model.CustomizationOption#customization
	 **/
	public static volatile SingularAttribute<CustomizationOption, Customization> customization;
	
	/**
	 * @see com.hellweek.coffee.model.CustomizationOption#price
	 **/
	public static volatile SingularAttribute<CustomizationOption, Double> price;
	
	/**
	 * @see com.hellweek.coffee.model.CustomizationOption#name
	 **/
	public static volatile SingularAttribute<CustomizationOption, String> name;
	
	/**
	 * @see com.hellweek.coffee.model.CustomizationOption#id
	 **/
	public static volatile SingularAttribute<CustomizationOption, Long> id;
	
	/**
	 * @see com.hellweek.coffee.model.CustomizationOption
	 **/
	public static volatile EntityType<CustomizationOption> class_;

	public static final String CUSTOMIZATION = "customization";
	public static final String PRICE = "price";
	public static final String NAME = "name";
	public static final String ID = "id";

}

