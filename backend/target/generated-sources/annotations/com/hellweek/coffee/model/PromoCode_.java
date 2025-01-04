package com.hellweek.coffee.model;

import jakarta.annotation.Generated;
import jakarta.persistence.metamodel.EntityType;
import jakarta.persistence.metamodel.SingularAttribute;
import jakarta.persistence.metamodel.StaticMetamodel;
import java.time.LocalDateTime;

@StaticMetamodel(PromoCode.class)
@Generated("org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
public abstract class PromoCode_ {

	
	/**
	 * @see com.hellweek.coffee.model.PromoCode#createdAt
	 **/
	public static volatile SingularAttribute<PromoCode, LocalDateTime> createdAt;
	
	/**
	 * @see com.hellweek.coffee.model.PromoCode#code
	 **/
	public static volatile SingularAttribute<PromoCode, String> code;
	
	/**
	 * @see com.hellweek.coffee.model.PromoCode#discountPercent
	 **/
	public static volatile SingularAttribute<PromoCode, Double> discountPercent;
	
	/**
	 * @see com.hellweek.coffee.model.PromoCode#validUntil
	 **/
	public static volatile SingularAttribute<PromoCode, LocalDateTime> validUntil;
	
	/**
	 * @see com.hellweek.coffee.model.PromoCode#active
	 **/
	public static volatile SingularAttribute<PromoCode, Boolean> active;
	
	/**
	 * @see com.hellweek.coffee.model.PromoCode#id
	 **/
	public static volatile SingularAttribute<PromoCode, Long> id;
	
	/**
	 * @see com.hellweek.coffee.model.PromoCode#validFrom
	 **/
	public static volatile SingularAttribute<PromoCode, LocalDateTime> validFrom;
	
	/**
	 * @see com.hellweek.coffee.model.PromoCode
	 **/
	public static volatile EntityType<PromoCode> class_;

	public static final String CREATED_AT = "createdAt";
	public static final String CODE = "code";
	public static final String DISCOUNT_PERCENT = "discountPercent";
	public static final String VALID_UNTIL = "validUntil";
	public static final String ACTIVE = "active";
	public static final String ID = "id";
	public static final String VALID_FROM = "validFrom";

}

