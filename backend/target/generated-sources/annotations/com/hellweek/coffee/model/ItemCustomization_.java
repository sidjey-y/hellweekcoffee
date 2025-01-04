package com.hellweek.coffee.model;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.ListAttribute;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;
import java.math.BigDecimal;

@StaticMetamodel(ItemCustomization.class)
@Generated("org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
public abstract class ItemCustomization_ {

	
	/**
	 * @see com.hellweek.coffee.model.ItemCustomization#transactionItem
	 **/
	public static volatile SingularAttribute<ItemCustomization, TransactionItem> transactionItem;
	
	/**
	 * @see com.hellweek.coffee.model.ItemCustomization#customization
	 **/
	public static volatile SingularAttribute<ItemCustomization, Customization> customization;
	
	/**
	 * @see com.hellweek.coffee.model.ItemCustomization#price
	 **/
	public static volatile SingularAttribute<ItemCustomization, BigDecimal> price;
	
	/**
	 * @see com.hellweek.coffee.model.ItemCustomization#selectedOptions
	 **/
	public static volatile ListAttribute<ItemCustomization, CustomizationOption> selectedOptions;
	
	/**
	 * @see com.hellweek.coffee.model.ItemCustomization#id
	 **/
	public static volatile SingularAttribute<ItemCustomization, Long> id;
	
	/**
	 * @see com.hellweek.coffee.model.ItemCustomization
	 **/
	public static volatile EntityType<ItemCustomization> class_;

	public static final String TRANSACTION_ITEM = "transactionItem";
	public static final String CUSTOMIZATION = "customization";
	public static final String PRICE = "price";
	public static final String SELECTED_OPTIONS = "selectedOptions";
	public static final String ID = "id";

}

