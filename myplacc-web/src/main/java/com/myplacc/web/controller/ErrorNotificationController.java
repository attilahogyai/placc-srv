package com.myplacc.web.controller;

import java.util.concurrent.atomic.AtomicInteger;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.myplacc.domain.user.Session;

@Controller
public class ErrorNotificationController extends AbstractController{
	private AtomicInteger errorCounter=new AtomicInteger();
	private static Logger log = LoggerFactory.getLogger(ErrorNotificationController.class);

	@RequestMapping(value = "/error-notification", method = RequestMethod.POST)
	@ResponseBody
	public Object errorNotification(Authentication authentication, HttpServletRequest request) {
		Session session=null;
		try{
			session=((Session)authentication.getPrincipal());
		}catch(NullPointerException e){}
		int counter=errorCounter.incrementAndGet();
		if(session!=null){
			log.error("CLIENT ERROR("+counter+") email:"+session.getRemoteIp()+" id:"+session.getUserAgent());
		}
		log.error("CLIENT ERROR JSON:"+request.getParameter("stack"));
		return null;
	}

	
}
