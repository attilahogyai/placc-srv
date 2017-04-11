package com.myplacc.config;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.myplacc.web.controller.RequestWrapper;


public class DFilter implements Filter {

	private static final Logger log = LoggerFactory.getLogger(DFilter.class);

	private final Map<String, Object> userLocks = new ConcurrentHashMap<String, Object>();
	private final Map<String, RequestLog> requestLogForUser = new ConcurrentHashMap<String, RequestLog>();
	
	private int minTimeMs = 10000;
	private int requestLogLength = 30;
	private static final boolean dFilter=Boolean.parseBoolean(System.getProperty("DFilter", "true"));
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		if(dFilter){
			HttpServletRequest httpServletRequest = (HttpServletRequest)request;
			String user = getUser(httpServletRequest);
			if (user == null) {
				log.warn("no user or ip");
				chain.doFilter(request, response);
				return;
			}
			addUserIfNeeded(user);
			if (isEnoughTimeElapsedFromLastRequest(user) == false) {
				((HttpServletResponse)response).setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
				log.warn("Too many requests. User: " + user);
				return;
			} 
		}
		chain.doFilter(request, response);
	}

	private String getUser(HttpServletRequest httpServletRequest) {
		String auth=httpServletRequest.getHeader("Authentiction");
		if(auth!=null){
			return auth;
		}
		return RequestWrapper.getRemoteIP(httpServletRequest);
	}

	private void addUserIfNeeded(String user) {
		if (userLocks.containsKey(user) == false) {
			synchronized(userLocks) {
				if (userLocks.containsKey(user) == false) {
					userLocks.put(user, new Object());
				}
			}
		}
	}
	
	private boolean isEnoughTimeElapsedFromLastRequest(String user) {
		Object object = userLocks.get(user);
		if (object == null) {
			return true;
		}
		synchronized (object) {
			RequestLog log = requestLogForUser.get(user);
			if (log == null) {
				log = new RequestLog(requestLogLength, minTimeMs);
				requestLogForUser.put(user, log);
			}
			log.addEntry();
			return log.isDos() == false;
		}
	}

	public void init(FilterConfig fConfig) throws ServletException {
		String maxTimeMsStr = fConfig.getInitParameter("minTimeInMsBetweenTwoRequests");
		minTimeMs = Integer.valueOf(maxTimeMsStr);
		String requestLogLengthStr = fConfig.getInitParameter("requestLogLength");
		requestLogLength = Integer.valueOf(requestLogLengthStr);
		log.info("DoS prevent filter starting..");
		log.info("Min time between two request (ms): " + minTimeMs);
		log.info("Size of the request window: " + requestLogLength);
	}

	public void destroy() {
		log.info("DoS prevent filter stopping...");
	}
}
