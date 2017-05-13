package com.myplacc.web.controller;


import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

public class ThreadSetupFilter extends org.springframework.web.filter.CharacterEncodingFilter{
	private static Logger log = Logger.getLogger(ThreadSetupFilter.class);
	public static final String SERIALIZE_JUST_ID = "serialize_just_id";
	public static final String SERIALIZE_HIDDEN = "serialize_hidden";
	public static final String SERIALIZE_SKIP_CLASS = "skip_class";
	public static final String THREADLOCALS = "threadlocals";
	
	private static ThreadLocal<Map> config = new ThreadLocal<Map>() {
	};
	public static Map getThreadCache(){
		if(config.get()==null){
			log.debug("create ThreadCache for:"+Thread.currentThread().getName());
			config.set(initLocalConfig(new HashMap()));
		}
		return config.get();
	}
	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		//request.setCharacterEncoding("UTF-8");
		String ec=request.getCharacterEncoding();
		// init Thread locals
		log.debug("START PROCESS THREAD:"+Thread.currentThread().getName());
		initLocalConfig(getThreadCache());
		super.doFilterInternal(request, response, filterChain);
		log.debug("END PROCESS THREAD:"+Thread.currentThread().getName());
	}
	private static Map initLocalConfig(Map config) {
		config.put(SERIALIZE_JUST_ID, true);
		config.put(SERIALIZE_HIDDEN, false);
		config.put(SERIALIZE_SKIP_CLASS, new ArrayList());
		return config;
	}
	
}
