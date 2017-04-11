package com.myplacc.web.controller;

import java.io.UnsupportedEncodingException;

import javax.annotation.PostConstruct;
import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import io.katharsis.invoker.KatharsisInvoker;
import io.katharsis.invoker.KatharsisInvokerBuilder;
import io.katharsis.invoker.KatharsisInvokerContext;
import io.katharsis.locator.JsonServiceLocator;
import io.katharsis.servlet.KatharsisProperties;
import io.katharsis.servlet.ServletKatharsisInvokerContext;

@Controller
public class KatharsisController extends AbstractController{

	private static Logger log = LoggerFactory.getLogger(KatharsisController.class);

	private String resourceSearchPackage = "com.myplacc";
	private String resourceDefaultDomain = "http://localhost:8888";
	private KatharsisInvoker invoker;
	
	
	@Autowired
	ServletContext servletContext;
	@Autowired
    private ApplicationContext applicationContext;

	private String filterBasePath="/japi/";
	
	
	@PostConstruct
	public void init() {
		KatharsisInvokerBuilder builder = createKatharsisInvokerBuilder();
		try {
			invoker = builder.build();
		} catch (Exception e) {
			log.error("init katharis failed", e);
		}
	}

	@RequestMapping(value = "/japi/**", method = {RequestMethod.GET,RequestMethod.POST,RequestMethod.PATCH,RequestMethod.PUT,RequestMethod.DELETE})
	public void katharsisResult(HttpServletRequest request, HttpServletResponse response)
			throws UnsupportedEncodingException {
		try{
			request.setCharacterEncoding("UTF-8");
			KatharsisInvokerContext invokerContext = createKatharsisInvokerContext(request, response);
			invoker.invoke(invokerContext);
		}catch(Exception e){
			log.error("katharsisResult",e);
			throw e;
		}
	}
	public void init(FilterConfig filterConfig) throws ServletException {
		servletContext = filterConfig.getServletContext();
		filterBasePath = filterConfig.getInitParameter(KatharsisProperties.WEB_PATH_PREFIX);
	}


	public String getFilterBasePath() {
		return filterBasePath;
	}

	public void setFilterBasePath(String filterBasePath) {
		this.filterBasePath = filterBasePath;
	}

	protected ServletContext getServletContext() {
		return servletContext;
	}

	protected KatharsisInvokerContext createKatharsisInvokerContext(HttpServletRequest request,
			HttpServletResponse response) {
		return new ServletKatharsisInvokerContext(getServletContext(), request, response) {
			@Override
			public String getRequestPath() {
				String path = super.getRequestPath();

				if (filterBasePath != null && path.startsWith(filterBasePath)) {
					path = path.substring(filterBasePath.length());
				}

				return path;
			}

		};
	}

	protected KatharsisInvoker createKatharsisInvoker() throws Exception {
		return createKatharsisInvokerBuilder().build();
	}

	protected KatharsisInvokerBuilder createKatharsisInvokerBuilder() {
		return new KatharsisInvokerBuilder().resourceSearchPackage(this.resourceSearchPackage)
				.resourceDefaultDomain(this.resourceDefaultDomain).jsonServiceLocator(new JsonServiceLocator() {
					@Override
					public <T> T getInstance(Class<T> clazz) {
						String beanName = clazz.getSimpleName();
						beanName = beanName.substring(0, 1).toLowerCase().concat(beanName.substring(1));
						return (T) applicationContext.getBean(
								beanName);
					}
				});
	}

}
