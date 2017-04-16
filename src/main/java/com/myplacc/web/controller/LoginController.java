package com.myplacc.web.controller;


import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.fasterxml.jackson.databind.JsonNode;
import com.myplacc.config.WebSecurityContextRepository;
import com.myplacc.domain.user.Session;
import com.myplacc.domain.user.Useracc;
import com.myplacc.service.LoginService;
import com.myplacc.service.UserService;
import com.myplacc.service.impl.UserManager;
import com.myplacc.service.impl.UseraccDaoMapper;
import com.myplacc.util.HttpHelper;
import com.myplacc.util.MailHelper;
import com.myplacc.util.Md5Util;
import com.myplacc.util.RandomHelper;
import com.myplacc.web.exception.AuthException;
import com.myplacc.web.exception.BadRequest;
import com.myplacc.web.exception.BadSessionState;
import com.myplacc.web.exception.CheckException;
import com.myplacc.web.exception.ServerError;
import com.myplacc.web.exception.UserNotFound;

/**
 * LoginServiceController is meant to serve all login related requests 
 * @author barnabas.peter
 *
 */
@Controller
@RequestMapping("/api")
public class LoginController extends AbstractController{
	
	
	private static final String SESSION_USERACC_IS_NOT_EMTPY = "SESSION useracc is not emtpy";

	public static final String[] USER_SCOPE = new String[]{"ROLE_USER"};

	public static final String[] REGISTERED_SCOPES = new String[]{"ROLE_USER","ROLE_REGISTERED"};

	private static final String USER = "user";

	final Logger logger = LoggerFactory.getLogger(LoginController.class);
	
	@Autowired
	private WebSecurityContextRepository securityContextRepository;
	
	@Autowired
	private LoginService loginService;
	
	@Autowired
	UseraccDaoMapper userDaoMapper;	
	
	@Autowired(required=false)
	private UserService userService;
	
	@Autowired
	@Qualifier("userManager")
	UserManager userManager;
	
	@RequestMapping(value="/ping",method=RequestMethod.POST)
	@ResponseBody
	public Object loginTest(HttpServletRequest request,HttpServletResponse response){
		Session session=RequestWrapper.getSession();
		if(request.getParameter("1")!=null){
			session=loginService.updateFingerprint(session,request.getParameter("1"));
			session.setUseracc(createAnonymeUser());
			return createUserSessionMap(request,session);
		}
		return "OK";
	}

	@RequestMapping(value = "/token", method = RequestMethod.POST)
	@ResponseBody
	public Object createTokenByLoginName(HttpServletRequest request,
			@RequestParam(value = "username", required=false) String opCode,
			@RequestParam(value = "password", required=false) String password,
			Authentication auth) {
		if(auth!=null){
			log.debug("user is already authneticated, skip generate token");
		}else{
			if(opCode==null && password==null){
				log.debug("generate simple token");
				
				Useracc useracc=createAnonymeUser();
				
				Session session = createUserSession(request, useracc);
				loginService.insertSession(session);
				return createUserSessionMap(request,session);
			}else{
				log.debug("user[" + opCode + "] password[" + password + "]");
//				Useracc useracc = userAccDao.findByLoginAndPassword(opCode, password);
//				if (useracc == null || useracc.getStatus()==null || useracc.getStatus().equals(0)) {
//					return new ResponseEntity<String>("UNAUTHORIZED", null,
//							HttpStatus.UNAUTHORIZED);
//				}
//				Map<String, Object> result = createUserSession(request, useracc);
//				return result;
			}
		}
		return null;
	}

	public static com.myplacc.domain.user.Useracc createAnonymeUser() {
		com.myplacc.domain.user.Useracc useraacc=new Useracc();
		useraacc.setLogin("anonyme");
		useraacc.setName("Anonyme");
		useraacc.setScopes(USER_SCOPE);
		return useraacc;
	}
	
	private Session createUserSession(HttpServletRequest request, Useracc useracc) {
		Session session = new Session();
		session.setUseracc(useracc);
		session.setValid(1);
		Timestamp t=new Timestamp(new Date().getTime());
		session.setRemoteIp(RequestWrapper.getRemoteIP(request));
		session.setUserAgent(request.getHeader("user-agent"));
		String token = System.currentTimeMillis() + "-"
				+ request.getSession(true).getId();
		session.setCode(token);
		session.setHash(Md5Util.md5Hex(token));
		return session;
	}
	private Map<String, Object> createUserSessionMap(HttpServletRequest request,Session session ) {
		// create Token
	
		Useracc useracc=session.getUseracc();
		
		Map<String, Object> result = new HashMap<String, Object>();
		result.put("access_token", session.getCode());
		result.put("prevLogin", useracc.getLastLogin());
		
		useracc.setLastLogin(new Date());
		//userAccDao.merge(useracc);
		result.put("scope", session.getScopes());
		result.put("name", useracc.getName());
		result.put("login", useracc.getLogin());
		
		result.put("userid", useracc.getId());
		result.put("modifyDt", useracc.getModifyDt());
		result.put("hash",session.getHash());
		result.put("user", useracc);
		useracc.setSensible(false);
		useracc.setPassword(null);
		return result;
	}	
	@RequestMapping(value="/login",method=RequestMethod.POST)
	@ResponseBody
	public Object login(HttpServletRequest request,HttpServletResponse response,
			@RequestParam(value = "login") String login,
			@RequestParam(value = "password") String password){

		if(login!=null && password!=null){
//			lrq.setIpAddress(request.getHeader("HTTP_X_FORWARDED_FOR"));
//			if (lrq.getIpAddress() == null) {
//				lrq.setIpAddress(request.getRemoteAddr());
//			}
			Useracc useracc=loginService.getUseraccByEmail(login.toLowerCase());
			boolean valid=false;
			if(useracc!=null){
				String encoded=userDaoMapper.checkPassword(password, useracc.getPassword());
				valid=useracc.getPassword().equals(encoded);
			}
			if(!valid){
				useracc=loginService.getUseraccByLogin(login);
				if(useracc!=null){
					String encoded=userDaoMapper.checkPassword(password, useracc.getPassword());
					valid=useracc.getPassword().equals(encoded);
				}
			}
			if(valid){
				Session existingSession=loginService.getSessionForUser(useracc.getId());
				existingSession.setUseracc(useracc);
				loginService.updateSession(existingSession);
				Map userSession=createUserSessionMap(request, existingSession);
				return userSession;
			}else{
				throw new AuthException();
				
			}
		}
		throw new BadRequest("login or password missing");
	}
	

	@RequestMapping(value = "/googlelogin", method = RequestMethod.POST)
	public void googleLogin(HttpServletRequest request,HttpServletResponse response){
		this.userManager.oAuthLogin("google", request, response);
	}
	@RequestMapping(value = "/oauth2callback", method = RequestMethod.GET)
	public String googleOuth2Callback(HttpServletRequest request,HttpServletResponse response,
			@RequestParam(value = "code",required=false) String authToken,@RequestParam(value = "state", required=false) String state, @RequestParam(value = "error", required=false) String error) {
		if(error!=null){
			log.debug("authToken[" + authToken + "]");
			String forwardTo=parseDomain()+"/profile/index";
			return "redirect:"+forwardTo; 
		}else{
			log.debug("authToken[" + authToken + "]");
			String forwardTo=parseDomain()+parseLocationType()+"/oauth2callback/"+HttpHelper.urlEncode(authToken)+"/"+HttpHelper.urlEncode(state);
			return "redirect:"+forwardTo; 
		}
	}
	@RequestMapping(value = "/oauth2tokencheck", method = RequestMethod.POST)
	@ResponseBody
	public Object googleOuth2Token(HttpServletRequest request,@RequestParam(value = "code") String authToken) {
		Session session=RequestWrapper.getSession();
		if(session.getUseracc()!=null){
			throw new BadSessionState(SESSION_USERACC_IS_NOT_EMTPY);
		}		
		Useracc useracc=userManager.checkGoogleOAuth(authToken);
		if (useracc == null || useracc.getStatus()==null || useracc.getStatus().equals(0)) {
			return new ResponseEntity<String>("UNAUTHORIZED", null,
					HttpStatus.UNAUTHORIZED);
		}
		
		return handleSession(request, useracc);

	}
	private Object handleSession(HttpServletRequest request, Useracc useracc) {
		Session session=loginService.getSessionForUser(useracc.getId());
		if(session==null){
			session=RequestWrapper.getSession();
			attachUserToSession(useracc, session);
		}
		session.setScopes(useracc.getScopes());
		session.setUseracc(useracc); // there is no mapping in mybatis xml for useracc that is why i added it to it
		loginService.updateSession(session);
		Map<String, Object> result = createUserSessionMap(request, session); 
		return result;
	}	
	
	@RequestMapping(value = "/facebooklogin", method = RequestMethod.POST)
	public void facebookLogin(HttpServletRequest request,HttpServletResponse response){
		this.userManager.oAuthLogin("facebook", request, response);
	}	
	@RequestMapping(value = "/foauth2callback", method = RequestMethod.GET)
	public String facebookOuth2Callback(HttpServletRequest request,HttpServletResponse response,
			@RequestParam(value = "code",required=false) String authToken, 
			@RequestParam(value = "error_message",required=false) String errorMessage) {
		if(authToken==null){
			authToken="error";
			log.error("message error:"+errorMessage);
		}
		log.debug("authToken[" + authToken + "]");
		String forwardTo=parseDomain()+parseLocationType()+"/foauth2callback/"+HttpHelper.urlEncode(authToken);
		return "redirect:"+forwardTo; 
	}	
	@RequestMapping(value = "/foauth2tokencheck", method = RequestMethod.POST)
	@ResponseBody
	public Object facebookOuth2Token(HttpServletRequest request,@RequestParam(value = "code") String authToken) {
		Session session=RequestWrapper.getSession();
		if(session.getUseracc()!=null){
			throw new BadSessionState(SESSION_USERACC_IS_NOT_EMTPY);
		}
		Useracc useracc=userManager.checkFacebookOAuth(authToken);
		if (useracc == null || useracc.getStatus()==null || useracc.getStatus().equals(0)) {
			return new ResponseEntity<String>("UNAUTHORIZED", null,
					HttpStatus.UNAUTHORIZED);
		}
		return handleSession(request, useracc);
	}		
	
	@RequestMapping(value = "/useracc/{id}", method = RequestMethod.GET)
	@ResponseStatus(HttpStatus.OK)
	@ResponseBody
	public Object getUseraccById(@PathVariable Long id,Authentication authentication) {
		Useracc useracc=null;
		if(id.equals(0)){
			useracc=checkForAuth(authentication);
		}else{
			useracc=userDaoMapper.findOne(id);
		}
		setSerializeHidden(false);
		return wrapPayload("useracc", useracc);
	}	
	
	@RequestMapping(value = "/user/{id}", method = RequestMethod.GET)
	@ResponseStatus(HttpStatus.OK)
	@ResponseBody
	public Object getUserById(@PathVariable Integer id,Authentication authentication) {
		Useracc user=checkForAuth(authentication);
		if(user.getEmail()==null){ // maybe just the id is loaded
			user=userDaoMapper.findOne(user.getId());
		}
		setSerializeHidden(true);
		user.setSensible(false);
		return jsonApiPayload(USER, user);
	}
	@RequestMapping(value = "/user", method = RequestMethod.GET)
	@ResponseStatus(HttpStatus.OK)
	@ResponseBody
	public Object getUser(Authentication authentication) {
		return getUserById(0,authentication);
	}
	
	@RequestMapping(value="/user/{id}",method = RequestMethod.PUT)
	@ResponseBody
	public Object updateUser(@PathVariable Long id,@RequestBody JsonNode inputJson,Authentication authentication){
		JsonNode userNode=inputJson.get("data").get("attributes");
		hasEmpty(userNode);
		Useracc user=checkForAuth(authentication);
		Useracc source=this.extractFromJson(userNode, Useracc.class);
		Useracc detail=userDaoMapper.findOne(id);
		if(id==0){
			detail=userDaoMapper.findOne(user.getId());
		}
		
		checkOwner(authentication, detail);
		BeanUtils.copyProperties(source, detail,new String[]{"storageLimit", "gender", "privateCode", 
				"useraccDatas", "language", "email", "provider", "status", "lastLogin",  "image", "hash",
				"newsletter", "useraccPrefs", "password", "id", "imagec"});
		userDaoMapper.updateUser(detail);
		return jsonApiPayload(USER, detail);
	}
	@RequestMapping(value="/activateuser/{code}/{email}",method = RequestMethod.GET)
	@ResponseBody
	public Object activateUser(@PathVariable String code,@PathVariable String email){
		Useracc detail=userDaoMapper.findByPrivateCode(code);
		if(detail==null){
			throw new UserNotFound();
		}
		detail.setStatus(1);
		userDaoMapper.updateUser(detail);
		return wrapPayload(USER, detail);
	}
	@RequestMapping(value = "/signup", method = RequestMethod.POST)
	@ResponseStatus(HttpStatus.OK)
	@ResponseBody
	public Object signupUser(HttpServletRequest request,
			@RequestParam(required=true,value="l") String language,
			@RequestBody JsonNode userJson) {
		JsonNode userNode=userJson.get("data").get("attributes");
		hasEmpty(userNode);
		
		String name = userNode.get("name").asText();
		String login = null;
		String email = userNode.get("email").asText();
		String password = userNode.get("password").asText();
		//String target = userNode.get("profession").asText();
		hasEmpty(email, password);
		
		
		Useracc ua = new Useracc();
		ua.setEmail(email.toLowerCase());
		ua.setName(name);
		//ua.setStatus(0);
		ua.setStatus(1);
		ua.setScopes(REGISTERED_SCOPES);
		String ep=userDaoMapper.encodePassword(password);
		log.debug("password:"+ep);
		ua.setPassword(ep);
		ua.setProvider(10);
		ua.setPrivateCode(Long.toString(System.currentTimeMillis())
				+ Long.toString(RandomHelper.getRandomLong(1000000)));
		
		userManager.newUserInit(ua);
		/*
		try {
			Map arguments = new HashMap();
			arguments.put("addressee", ua);
			Locale l=getLocale(request);
			sendEmail(l, MailHelper.REGISTRATION_EMAIL, ua.getEmail(), arguments);
			try{
				sendEmail(l, MailHelper.REGISTRATION_EMAIL, MailHelper.DEFAULT_REGISTRATION_SENDER, arguments);
			}catch(Throwable e){
				log.error("sending registration admin email error:"+e.getMessage());
			}
		} catch (Exception e) {
			Useracc user= userDaoMapper.findOne(ua.getId());
			if(user!=null){ // remove user in case of email sending error
				userDaoMapper.delete(user);
			}
			log.error("send mail error:", e);
			throw e;
		}
		*/
		ua.setSensible(true);
		
		Session session=RequestWrapper.getSession();
		attachUserToSession(ua, session);
		loginService.updateSession(session);
		return jsonApiPayload(USER, ua);
	}
	private void attachUserToSession(Useracc ua, Session session) {
		session.setUseracc(ua);
		session.setFingerprint(null);
	}
	@RequestMapping(value = "/forgot", method = RequestMethod.POST)
	@ResponseStatus(HttpStatus.OK)
	@ResponseBody
	public Object forgotPassword(HttpServletRequest request,@RequestParam(required=true,value="email") String email,
			@RequestParam(required=true,value="l") String language) {
		Useracc user=userDaoMapper.findUserForEmail(email, 0);
		if(user==null){
			throw new UserNotFound();
		}
		String passwordChangeRequest = RandomHelper.getAlphaNumeric(8);
		log.debug("password: "+passwordChangeRequest);
		user.setPwChangeRequest(passwordChangeRequest);
		userDaoMapper.updateUser(user);
		
		Map additionArgs=new HashMap();
		additionArgs.put("addressee", user);
		additionArgs.put("requestid", passwordChangeRequest);
		sendEmail(getLocale(request), MailHelper.FORGOTPASSWORD_EMAIL, user.getEmail(), additionArgs);
		return wrapPayload("status", "ok");
	}
	@RequestMapping(value = "/forgotchange", method = RequestMethod.POST)
	@ResponseStatus(HttpStatus.OK)
	@ResponseBody
	public Object changeForgotPassword(HttpServletRequest request,@RequestParam(required=true,value="email") String email,
			@RequestParam(required=true,value="requestid") String requestid,
			@RequestParam(required=true,value="new_password") String newPassword) {
		Useracc user=userDaoMapper.getUserAccForLoginAndPwRequest(email,requestid);
		if(user==null){
			throw new UserNotFound();
		}
		user.setPassword(newPassword);
		user.setPwChangeRequest(null);
		String pass=userDaoMapper.encodePassword(user.getPassword());
		user.setPassword(pass);
		userDaoMapper.updateUser(user);
		return wrapPayload("status", "ok");
	}
	

	@RequestMapping(value = "/changepassword", method = RequestMethod.POST)
	@ResponseStatus(HttpStatus.OK)
	@ResponseBody
	public Object changePassword(HttpServletRequest request,@RequestParam(required=true,value="password") String password,
			@RequestParam(required=true,value="new_password") String newPassword,
			Authentication authentication) {
		Useracc user=checkForAuth(authentication);
		
		Useracc checkUser=userDaoMapper.findOne(user.getId());
		if(checkUser==null){
			throw new CheckException("wrong old password was given");
		}
		String encoded=userDaoMapper.checkPassword(password, checkUser.getPassword());
		boolean valid=checkUser.getPassword().equals(encoded);
		if(!valid){
			throw new CheckException("PASSWORD_DOES_NOT_MATCH");
		}
		String encPassword=userDaoMapper.encodePassword(newPassword);
		checkUser.setPassword(encPassword);
		userDaoMapper.updateUser(checkUser);
		return wrapPayload("status", "ok");
	}	
	
	
	
	@RequestMapping(value = "/uploadprofileimage", method = RequestMethod.POST)
    public @ResponseBody
    Useracc uploadFileHandler(Authentication authentication,HttpServletRequest request) {
		Useracc user=checkForAuth(authentication);
		// refressh from DB
		user = userDaoMapper.findOne(user.getId());
		
		DiskFileItemFactory factory = new DiskFileItemFactory();
		org.apache.commons.fileupload.servlet.ServletFileUpload.isMultipartContent(request);
		ServletContext servletContext = request.getServletContext();
		File repository = (File) servletContext.getAttribute("javax.servlet.context.tempdir");
		factory.setRepository(repository);
		
		// Create a new file upload handler
		ServletFileUpload upload = new ServletFileUpload(factory);
		// Parse the request
		List<FileItem> items=null;
		try {
			items = upload.parseRequest(request);
		} catch (FileUploadException e) {
			e.printStackTrace();
		}
		try {		
			for (FileItem fileItem : items) {
				if(fileItem.getFieldName().equals("file")){
					String ext=HttpHelper.getExt(fileItem.getName());
					InputStream is=fileItem.getInputStream();
					
					userManager.storePicture(user, ext, is);
					
					userDaoMapper.updateUser(user);
				}
			}
		} catch (IOException e) {
			log.error("IOError",e);
			throw new ServerError(e.getMessage(),e); 
		}
		return user; 
    }
	@RequestMapping(value = "/profileimage", method = RequestMethod.GET)
    public @ResponseBody
    void getFileHandler(Authentication authentication,
    		@RequestParam(required=false,value="u") String userid,
    		HttpServletResponse response) {
		if(userid==null){
			Useracc user=checkForAuth(authentication);
			userid=Long.toString(user.getId());
		}
		try {
			response.setContentType("image/jpeg");
			Files.copy(userManager.getProfilePicture(userid), response.getOutputStream());
		} catch (IOException e) {
			log.error("error returning image file",e);
		}
    }
	@RequestMapping(value = "/common/check/email", method = RequestMethod.GET)
    public @ResponseBody String checkEmailField(Authentication authentication, @RequestParam String email, @RequestParam Integer eId) {
		Useracc user=userDaoMapper.findUserForEmail(email, eId);
		return check(user);
    }
	@RequestMapping(value = "/common/check/login", method = RequestMethod.GET)
    public @ResponseBody String checkLoginField(Authentication authentication, @RequestParam String login, @RequestParam Integer eId) {
		Useracc user=userDaoMapper.findUserForLogin(login, eId);
		return check(user);
    }
	private String check(Useracc user) {
		if(user!=null){
			return "FOUND";
		}else{
			return "NULL";
		}
	}
	
	
	private static final String [] exts=new String[]{"jpg","jpeg","png","gif"};
	private boolean removeImage(String path) {
		for (int i = 0; i < exts.length; i++) {
			Path p=Paths.get(path,exts[i]);
			if(p.toFile().delete()){
				return true;
			}
		}
		return false;
	}	
	
}
