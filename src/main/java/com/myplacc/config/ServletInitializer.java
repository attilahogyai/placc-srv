package com.myplacc.config;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;

import com.myplacc.MyplaccWebApplication;
/**
 * It is needed just in case you want to deploy as a classic WAR to application server.
 * @author Attila
 *
 */
public class ServletInitializer extends SpringBootServletInitializer {

	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(MyplaccWebApplication.class);
	}

}
