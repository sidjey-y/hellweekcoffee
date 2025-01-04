package com.hellweek.coffee.model;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SetAttribute;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

@StaticMetamodel(Customization.class)
@Generated("org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
public abstract class Customization_ {

	
	/**
	 * @see com.hellweek.coffee.model.Customization#categoryType
	 **/
	public static volatile SingularAttribute<Customization, CategoryType> categoryType;
	
	/**
	 * @see com.hellweek.coffee.model.Customization#code
	 **/
	public static volatile SingularAttribute<Customization, String> code;
	
	/**
	 * @see com.hellweek.coffee.model.Customization#name
	 **/
	public static volatile SingularAttribute<Customization, String> name;
	
	/**
	 * @see com.hellweek.coffee.model.Customization#options
	 **/
	public static volatile SetAttribute<Customization, CustomizationOption> options;
	
	/**
	 * @see com.hellweek.coffee.model.Customization#active
	 **/
	public static volatile SingularAttribute<Customization, Boolean> active;
	
	/**
	 * @see com.hellweek.coffee.model.Customization#id
	 **/
	public static volatile SingularAttribute<Customization, Long> id;
	
	/**
	 * @see com.hellweek.coffee.model.Customization
	 **/
	public static volatile EntityType<Customization> class_;

	public static final String CATEGORY_TYPE = "categoryType";
	public static final String CODE = "code";
	public static final String NAME = "name";
	public static final String OPTIONS = "options";
	public static final String ACTIVE = "active";
	public static final String ID = "id";

}

