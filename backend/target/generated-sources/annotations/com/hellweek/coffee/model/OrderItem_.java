package com.hellweek.coffee.model;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.ListAttribute;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;

@StaticMetamodel(OrderItem.class)
@Generated("org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
public abstract class OrderItem_ {

	
	/**
	 * @see com.hellweek.coffee.model.OrderItem#unitPrice
	 **/
	public static volatile SingularAttribute<OrderItem, Double> unitPrice;
	
	/**
	 * @see com.hellweek.coffee.model.OrderItem#quantity
	 **/
	public static volatile SingularAttribute<OrderItem, Integer> quantity;
	
	/**
	 * @see com.hellweek.coffee.model.OrderItem#notes
	 **/
	public static volatile SingularAttribute<OrderItem, String> notes;
	
	/**
	 * @see com.hellweek.coffee.model.OrderItem#size
	 **/
	public static volatile SingularAttribute<OrderItem, String> size;
	
	/**
	 * @see com.hellweek.coffee.model.OrderItem#id
	 **/
	public static volatile SingularAttribute<OrderItem, Long> id;
	
	/**
	 * @see com.hellweek.coffee.model.OrderItem#menuItem
	 **/
	public static volatile SingularAttribute<OrderItem, MenuItem> menuItem;
	
	/**
	 * @see com.hellweek.coffee.model.OrderItem
	 **/
	public static volatile EntityType<OrderItem> class_;
	
	/**
	 * @see com.hellweek.coffee.model.OrderItem#transaction
	 **/
	public static volatile SingularAttribute<OrderItem, Transaction> transaction;
	
	/**
	 * @see com.hellweek.coffee.model.OrderItem#customizations
	 **/
	public static volatile ListAttribute<OrderItem, String> customizations;

	public static final String UNIT_PRICE = "unitPrice";
	public static final String QUANTITY = "quantity";
	public static final String NOTES = "notes";
	public static final String SIZE = "size";
	public static final String ID = "id";
	public static final String MENU_ITEM = "menuItem";
	public static final String TRANSACTION = "transaction";
	public static final String CUSTOMIZATIONS = "customizations";

}

