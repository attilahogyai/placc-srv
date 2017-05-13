package com.myplacc.web.controller;

import javax.servlet.http.HttpServletRequest;

import com.myplacc.config.WebSecurityContextRepository;
import com.myplacc.domain.user.Session;
import com.myplacc.util.Constants;

public class RequestWrapper {
	static Session session=null;
    public static ThreadLocal<HttpServletRequest> httpRequest = new ThreadLocal<HttpServletRequest>() {
    };
    public static Session getSession(){
    	if(Constants.UNITTESTMODE) {
    		if(session!=null) {
    			return session;
    		}
    		Session s=new Session();
    		s.setCode("testtoken");
    		s.setCountry("HU");
    		return s;
    	}
    	if(session!=null){
    		return session;
    	}else{
        	return (Session)httpRequest.get().getAttribute(WebSecurityContextRepository.WTS_SESSION);
    	}
    }
    public static void setSession(Session session){
    	RequestWrapper.session=session;    }
    public static String getRemoteIP(HttpServletRequest request){
		String ip = request.getHeader("X-Forwarded-For");
		if(ip==null){
			ip = request.getRemoteAddr();
		}else{
			String ips[] = ip.trim().split(" ");
			if(ips.length==1){
				ips=ip.trim().split(",");				
			}
			ip=ips[ips.length-1].trim();
		}
		return ip;
    }
}
