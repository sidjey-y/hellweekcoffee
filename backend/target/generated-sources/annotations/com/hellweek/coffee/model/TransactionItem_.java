package com.hellweek.coffee.model;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.ListAttribute;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;
import java.math.BigDecimal;

@StaticMetamodel(TransactionItem.class)
@Generated("org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
public abstract class TransactionItem_ {

	
	/**
	 * @see com.hellweek.coffee.model.TransactionItem#item
	 **/
	public static volatile SingularAttribute<TransactionItem, Item> item;
	
	/**
	 * @see com.hellweek.coffee.model.TransactionItem#quantity
	 **/
	public static volatile SingularAttribute<TransactionItem, Integer> quantity;
	
	/**
	 * @see com.hellweek.coffee.model.TransactionItem#size
	 **/
	public static volatile SingularAttribute<TransactionItem, String> size;
	
	/**
	 * @see com.hellweek.coffee.model.TransactionItem#totalPrice
	 **/
	public static volatile SingularAttribute<TransactionItem, BigDecimal> totalPrice;
	
	/**
	 * @see com.hellweek.coffee.model.TransactionItem#itemPrice
	 **/
	public static volatile SingularAttribute<TransactionItem, BigDecimal> itemPrice;
	
	/**
	 * @see com.hellweek.coffee.model.TransactionItem#id
	 **/
	public static volatile SingularAttribute<TransactionItem, Long> id;
	
	/**
	 * @see com.hellweek.coffee.model.TransactionItem
	 **/
	public static volatile EntityType<TransactionItem> class_;
	
	/**
	 * @see com.hellweek.coffee.model.TransactionItem#transaction
	 **/
	public static volatile SingularAttribute<TransactionItem, Transaction> transaction;
	
	/**
	 * @see com.hellweek.coffee.model.TransactionItem#customizations
	 **/
	public static volatile ListAttribute<TransactionItem, ItemCustomization> customizations;

	public static final String ITEM = "item";
	public static final String QUANTITY = "quantity";
	public static final String SIZE = "size";
	public static final String TOTAL_PRICE = "totalPrice";
	public static final String ITEM_PRICE = "itemPrice";
	public static final String ID = "id";
	public static final String TRANSACTION = "transaction";
	public static final String CUSTOMIZATIONS = "customizations";

}

