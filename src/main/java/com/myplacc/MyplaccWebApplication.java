package com.myplacc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;
//@Configuration
//@EnableAutoConfiguration
@ComponentScan
@SpringBootApplication
@ImportResource("services.xml")
public class MyplaccWebApplication {

	public static void main(String[] args) {
		SpringApplication.run(MyplaccWebApplication.class, args);
	}
}
