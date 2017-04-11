package com.myplacc.web.controller;

import java.util.UUID;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.beanutils.BeanUtilsBean;
import org.apache.commons.beanutils.BeanUtilsBean2;
import org.aspectj.lang.JoinPoint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;

import com.myplacc.config.SessionCache;
import com.myplacc.config.WebSecurityContextRepository;
import com.myplacc.domain.AbstractEntity;
import com.myplacc.domain.AbstractRq;
import com.myplacc.domain.user.Session;
/**
 * Aspect which finds AbstractWTDI arguments for method of classes which contains the Service in class name.
 * @author hoa
 *
 */
public class PrepareRequestAspect {
	BeanUtilsBean beanUtils=BeanUtilsBean.getInstance();
	
	final Logger logger = LoggerFactory.getLogger(PrepareRequestAspect.class);
	public void assignId(JoinPoint  joinpont) throws Throwable {
		HttpServletRequest httpRequest=RequestWrapper.httpRequest.get();
		if(joinpont.getTarget().getClass().getSimpleName().indexOf("Service")>-1){ 
			Object[] arguments=joinpont.getArgs();
			AbstractRq request=null;
			Authentication auth=null;
			for (Object object : arguments) {
				if(object instanceof AbstractRq){
					request=((AbstractRq)object);
				}else if(object instanceof Authentication){
					auth=((Authentication)object);
				}else if(object instanceof AbstractEntity){ // set session object for entity
					Session session=(Session)httpRequest.getAttribute(WebSecurityContextRepository.WTS_SESSION);
					if(session!=null){
						beanUtils.setProperty(object, "session", session);
					}
				}
			}
			// prepares the request for controllers
			if(request!=null){
				String id=UUID.randomUUID().toString();
				request.setRequestId(id);
				logger.debug("assign Id :"+id);
				if(auth!=null && auth.getPrincipal()!=null){
					request.setLang(((SessionCache)auth.getPrincipal()).getLanguage());
					request.setAuthorizationInfo(((SessionCache)auth.getPrincipal()).getAuthorizationInfo());
				}
			}
		}
		
    }
}
