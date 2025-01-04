package com.hellweek.coffee.model;

import com.hellweek.coffee.model.Transaction.PaymentMethod;
import com.hellweek.coffee.model.Transaction.TransactionStatus;
import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.ListAttribute;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@StaticMetamodel(Transaction.class)
@Generated("org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
public abstract class Transaction_ {

	
	/**
	 * @see com.hellweek.coffee.model.Transaction#totalAmount
	 **/
	public static volatile SingularAttribute<Transaction, BigDecimal> totalAmount;
	
	/**
	 * @see com.hellweek.coffee.model.Transaction#isGuestOrder
	 **/
	public static volatile SingularAttribute<Transaction, Boolean> isGuestOrder;
	
	/**
	 * @see com.hellweek.coffee.model.Transaction#paymentMethod
	 **/
	public static volatile SingularAttribute<Transaction, PaymentMethod> paymentMethod;
	
	/**
	 * @see com.hellweek.coffee.model.Transaction#id
	 **/
	public static volatile SingularAttribute<Transaction, Long> id;
	
	/**
	 * @see com.hellweek.coffee.model.Transaction#membershipId
	 **/
	public static volatile SingularAttribute<Transaction, String> membershipId;
	
	/**
	 * @see com.hellweek.coffee.model.Transaction#transactionDate
	 **/
	public static volatile SingularAttribute<Transaction, LocalDateTime> transactionDate;
	
	/**
	 * @see com.hellweek.coffee.model.Transaction
	 **/
	public static volatile EntityType<Transaction> class_;
	
	/**
	 * @see com.hellweek.coffee.model.Transaction#items
	 **/
	public static volatile ListAttribute<Transaction, TransactionItem> items;
	
	/**
	 * @see com.hellweek.coffee.model.Transaction#customer
	 **/
	public static volatile SingularAttribute<Transaction, Customer> customer;
	
	/**
	 * @see com.hellweek.coffee.model.Transaction#status
	 **/
	public static volatile SingularAttribute<Transaction, TransactionStatus> status;

	public static final String TOTAL_AMOUNT = "totalAmount";
	public static final String IS_GUEST_ORDER = "isGuestOrder";
	public static final String PAYMENT_METHOD = "paymentMethod";
	public static final String ID = "id";
	public static final String MEMBERSHIP_ID = "membershipId";
	public static final String TRANSACTION_DATE = "transactionDate";
	public static final String ITEMS = "items";
	public static final String CUSTOMER = "customer";
	public static final String STATUS = "status";

}

