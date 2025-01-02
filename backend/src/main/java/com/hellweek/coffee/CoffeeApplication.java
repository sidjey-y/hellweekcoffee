package com.hellweek.coffee;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EntityScan("com.hellweek.coffee.model")
@EnableJpaRepositories("com.hellweek.coffee.repository")
@ComponentScan(basePackages = {
    "com.hellweek.coffee.config",
    "com.hellweek.coffee.controller",
    "com.hellweek.coffee.service",
    "com.hellweek.coffee.security"
})
public class CoffeeApplication {
    public static void main(String[] args) {
        SpringApplication.run(CoffeeApplication.class, args);
    }
}
