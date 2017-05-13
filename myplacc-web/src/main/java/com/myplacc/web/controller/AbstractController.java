package com.myplacc.web.controller;

import java.beans.PropertyDescriptor;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.beanutils.PropertyUtilsBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myplacc.config.MyPlaccObjectMapper;
import com.myplacc.domain.AbstractEntity;
import com.myplacc.domain.AbstractQDI;
import com.myplacc.domain.user.Session;
import com.myplacc.domain.user.Useracc;
import com.myplacc.service.impl.LangtextDaoMapper;
import com.myplacc.util.Constants;
import com.myplacc.util.DateTimeFormatterHelper;
import com.myplacc.util.HttpHelper;
import com.myplacc.util.MailHelper;
import com.myplacc.util.VelocityHelper;
import com.myplacc.web.exception.AccessDenied;
import com.myplacc.web.exception.AuthException;
import com.myplacc.web.exception.BadSessionState;
import com.myplacc.web.exception.CheckException;
import com.myplacc.web.exception.MissingValuesException;
import com.myplacc.web.exception.NotFoundException;
import com.myplacc.web.exception.UserNotFound;

public class AbstractController {
	private static final Logger logger = LoggerFactory.getLogger(AbstractController.class);

	ExecutorService executorService = Executors.newFixedThreadPool(4);
	protected HttpHelper httpHelper = new HttpHelper();
	@Autowired
	LangtextDaoMapper dictionaryDaoMapper;

	final Logger log = LoggerFactory.getLogger(AbstractController.class);
	private static PropertyUtilsBean propertyUtils = new PropertyUtilsBean();

	@Autowired
	ObjectMapper objectMapper;
	public static final String DEFAULTLANGUAGE="english";
	protected static Map<String,String>  languageMap=new HashMap<String,String>(); 
	protected static Map<String,String>  invLanguageMap=new HashMap<String,String>(); 
	
	static{
		languageMap.put("en","english");
		languageMap.put("hu","hungarian");
		languageMap.put("it","italian");
		languageMap.put("da","danish");
		languageMap.put("fi","finnish");
		languageMap.put("pt","portuguese");
		languageMap.put("tr","turkish");
		languageMap.put("sv","swedish");
		languageMap.put("nl","dutch");
		languageMap.put("fr","french");
		languageMap.put("ru","russian");
		languageMap.put("de","german");
		languageMap.put("nb","norwegian");
		languageMap.put("es","spanish");
		
		for (String key : languageMap.keySet()) {
			invLanguageMap.put(languageMap.get(key), key);
		}
		
	}
	public static String searchLanguageByCode(String language) {
		String searchLanguage="english";
		if(languageMap.get(language)!=null){
			searchLanguage=languageMap.get(language);
		}
		return searchLanguage;
	}
	public static String searchLanguageByDesc(String language) {
		String searchLanguage="en";
		if(language!=null && invLanguageMap.get(language)!=null){
			searchLanguage=invLanguageMap.get(language);
		}
		return searchLanguage;
	}
	
	
	protected <T> T extractFromJson(JsonNode node, Class<T> clazz) {
		return objectMapper.convertValue(node, clazz);
	}

	protected Session checkSession(Authentication auth) {
		boolean authenticated = false;
		if (auth != null) {
			Session session = ((Session) auth.getPrincipal());
			if (session == null) {
				throw new AuthException();
			}
			return session;
		}
		throw new AuthException();
	}
	protected Useracc checkOwner(Authentication auth, Useracc compareTo) {
		Useracc user = checkForAuth(auth);
		if (compareTo == null || !compareTo.getId().equals(user.getId())) {
			throw new AccessDenied();
		}
		return user;
	}
	@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR, reason = "internal workflow exception")
	@ExceptionHandler({ Throwable.class })
	public String runtimeError(HttpServletRequest req, Exception exception) {
		log.error("InternalException", exception);
		return exception.getMessage();
	}
	@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "user_not_found")
	@ExceptionHandler({ UserNotFound.class })
	public String userNotFound(HttpServletRequest req, Exception exception) {
		log.warn("UserNotFound", exception);
		return exception.getMessage();
	}
	@ResponseStatus(value = HttpStatus.FORBIDDEN, reason = "access denied")
	@ExceptionHandler({ AccessDenied.class, AuthException.class })
	public void accessDenied(HttpServletRequest req, Exception exception) {
		log.error("InternalException", exception);
	}
	
	
	@ResponseStatus(value = HttpStatus.CONFLICT)
	@ExceptionHandler({ CheckException.class })
	@ResponseBody
	public String checkException(HttpServletRequest req, Exception exception) {
		log.error("checkException", exception.getMessage());
		return exception.getMessage();
	}
	
	@ResponseStatus(value = HttpStatus.EXPECTATION_FAILED)
	@ExceptionHandler({ BadSessionState.class })
	@ResponseBody
	public String badSessionState(HttpServletRequest req, Exception exception) {
		log.error("badSessionState", exception.getMessage());
		return exception.getMessage();
	}
	@ResponseStatus(value = HttpStatus.NOT_FOUND)
	@ExceptionHandler({ NotFoundException.class })
	@ResponseBody
	public String notFound(HttpServletRequest req, Exception exception) {
		log.warn("NOT FOUND", exception.getMessage());
		return exception.getMessage();
	}
	
	@ResponseStatus(value = HttpStatus.BAD_REQUEST)
	@ExceptionHandler({ DuplicateKeyException.class })
	@ResponseBody
	public String databaseError(Exception exception) {
		String message = exception.getMessage();
		String code = "DBC_";
		if (message.indexOf("\"") > -1) {
			int s = message.indexOf("\"");
			int e = message.indexOf("\"", s + 1);
			code += message.substring(s+1, e);
		}
		return code.toUpperCase();
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	protected Collection<AbstractQDI> wrapResult(Object result) {
		if (!(result instanceof Collection)) {
			List list = new ArrayList();
			list.add(result);
			return list;
		}
		return (Collection<AbstractQDI>) result;
	}

	protected static String parseDomain() {
		return Constants.HTTPDOMAIN;
	}
	protected static String parseLocationType() {
		return Constants.LOCATIONTYPE;
	}
	protected Useracc checkForAuth(Authentication auth) {
		boolean authenticated = false;
		if (auth != null) {
			Session session = ((Session) auth.getPrincipal());
			
			if (session != null && session.getUseracc() != null) {
				setSerializeHidden(true);
				return session.getUseracc();
			}
		}
		throw new AuthException();
	}

	protected void setSerializeJustId(boolean v) {
		ThreadSetupFilter.getThreadCache().put(ThreadSetupFilter.SERIALIZE_JUST_ID, v);
	}

	protected void setSerializeHidden(boolean v) {
		ThreadSetupFilter.getThreadCache().put(ThreadSetupFilter.SERIALIZE_HIDDEN, v);
	}

	protected Map<String, Object> jsonApiPayload(String name, AbstractEntity o) {
		Map result = new HashMap();
		HashMap m = new HashMap();
		m.put("id", o.getId());
		m.put("type", name);
		m.put("attributes", o);
		result.put("data", m);
		return result;
	}

	protected Map<String, Object> wrapPayload(String name, Object o) {
		Map result = new HashMap();
		if (o instanceof List) {
			for (Object item : (List) o) {
				mergeObjectToMap(result, item);
			}
			if (result.size() == 0) {
				result.put(name, new ArrayList<Object>());
			}
		} else if (o instanceof Set) {
			for (Object item : (Set) o) {
				mergeObjectToMap(result, item);
			}
			if (result.size() == 0) {
				result.put(name, new HashSet<Object>());
			}
		} else {
			mergeObjectToMap(result, o);
		}
		return result;
	}

	protected void mergeObjectToMap(Map resultMap, Object o) {
		mergeObjectToMap(resultMap, o, false, null);
	}

	protected void mergeObjectToMap(Map resultMap, Object o, boolean skipProp) {
		if (!skipProp)
			throw new UnsupportedOperationException("should not call this method if skipProp is false");
		mergeObjectToMap(resultMap, o, skipProp, null);
	}

	protected List getSerializeSkipClass() {
		if (log.isTraceEnabled()) {
			log.trace("thread local: " + ThreadSetupFilter.getThreadCache());
		}
		return (List) ThreadSetupFilter.getThreadCache().get(ThreadSetupFilter.SERIALIZE_SKIP_CLASS);
	}

	protected void mergeObjectToMap(Map resultMap, Object o, boolean skipProp, List<String> skipProperties) {
		if (o == null)
			return;
		if (getSerializeSkipClass().contains(o.getClass())) {
			log.debug("serializable skip class");
			return;
		}
		boolean collection = false;
		String className = o.getClass().getSimpleName();
		// int proxyOffset=className.indexOf("_$$");
		// if(proxyOffset>-1){
		// className=className.substring(0,proxyOffset);
		// }

		if (o instanceof List) {
			List l = (List) o;
			if (l.size() == 0)
				return;
			collection = true;
			className = l.get(0).getClass().getSimpleName();
		}
		String propertyName = className.substring(0, 3).toLowerCase() + className.substring(3);

		Set l = new LinkedHashSet();
		if (resultMap.containsKey(propertyName)) {
			l = ((Set) resultMap.get(propertyName));
		} else {
			resultMap.put(propertyName, l);
		}
		if (collection) {
			l.addAll((List) o);
		} else {
			l.add(o);
		}
		if (!skipProp) {
			if (o instanceof List) {
				for (Object object : l) {
					inspectObject(resultMap, object, skipProperties);
				}
			} else {
				inspectObject(resultMap, o, skipProperties);
			}

		}
	}

	protected boolean hasEmpty(Object... args) {
		for (int i = 0; i < args.length; i++) {
			if (args[i] == null) {
				throw new MissingValuesException(i + "th value is null or empty");
			}
		}
		return false;
	}

	protected boolean hasEmpty(String... args) {
		for (int i = 0; i < args.length; i++) {
			if (args[i] == null || args[i].length() == 0 || args[i].equals("null")) {
				throw new MissingValuesException(i + "th value is null or empty");
			}
		}
		return false;
	}

	private void inspectObject(Map resultMap, Object o, List<String> skipProperties) {
		PropertyDescriptor[] properties = PropertyUtils.getPropertyDescriptors(o.getClass());
		for (int i = 0; i < properties.length; i++) {
			if (skipProperties != null && skipProperties.contains(properties[i].getName())) {
				continue;
			}
			Method getMethod = properties[i].getReadMethod();
			Class type = properties[i].getPropertyType();
			if (MyPlaccObjectMapper.hanledObjects.indexOf(type) > -1) {
				try {
					mergeObjectToMap(resultMap, propertyUtils.getProperty(o, properties[i].getName()));
				} catch (Exception e) {
					log.error("error during serialization", e);
					e.printStackTrace();
				}
			}
		}
	}

	protected static Locale getLocale(HttpServletRequest request) {
		String language = request.getParameter("l");
		if (language == null) {
			language = "en";
		}
		Locale l = Locale.forLanguageTag(language);
		request.setAttribute("locale", l);
		return l;
	}

	public void sendEmailAsync(final Locale locale, final String templateCode, final String adressee,
			final Map additionArgs) {
		executorService.execute(new Runnable() {
			@Override
			public void run() {
				sendEmail(locale, templateCode, adressee, additionArgs);
			}
		});
	}

	public void sendEmail(final Locale locale, final String templateCode, final String adressee, final Map additionArgs) {
		List userlist = new ArrayList();
		userlist.add(adressee);
		final Map arguments = buildBaseEmailArguments(locale);
		arguments.putAll(additionArgs);
		try {

			// merge subject
			String subjectVelo = getText("email", templateCode + "_subject", locale.getLanguage().toLowerCase());
			String subjectText = VelocityHelper.mergeString(subjectVelo, arguments);

			MailHelper.sendHtmlMail(MailHelper.DEFAULT_SENDER, userlist, subjectText,
					getText("email", templateCode, locale.getLanguage().toLowerCase()), arguments);
		} catch (Exception e) {
			log.error("send mail error:", e);
			throw new RuntimeException(e);
		}
	}

	public Map buildBaseEmailArguments(Locale locale) {
		final Map arguments = new HashMap();
		DateTimeFormatterHelper dtf = new DateTimeFormatterHelper(locale);
		arguments.put("dtf", dtf);
		String domain = parseDomain();
		arguments.put("domain", domain);
		arguments.put("sendingTime", new Date());
		arguments.put("l", locale.getLanguage().toLowerCase());
		arguments.put("helper", httpHelper);
		
		arguments.put("logoUrl", "http://mail.damocles.hu:8888/assets/images/placc_logo1.png");
		arguments.put("homePage", "http://mail.damocles.hu:8888/");

		
		
		VelocityHelper th = new VelocityHelper(dictionaryDaoMapper, locale, arguments);
		arguments.put("th", th);

		return arguments;
	}
	public Map<String,?> buildMap(Object ... list){
		Map n=new HashMap();
		for (int i = 0; i < list.length; i=i+2) {
			n.put(list[i], list[i+1]);
		}
		return n;
	}
	protected String getText(String type, String code, String lang) {
		String text = dictionaryDaoMapper.getText(type, code, lang);
		if(text == null){
			logger.warn("text not found for type["+type+"], code["+code+"], lang["+lang+"]");
		}
		return dictionaryDaoMapper.getText(type, code, lang);
	}
}
