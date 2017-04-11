package com.myplacc.service.impl;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.myplacc.domain.user.Useracc;
import com.myplacc.image.ImageConfig;
import com.myplacc.image.ImageTools;
import com.myplacc.service.oauth.IOAuthService;
import com.myplacc.util.HttpHelper;
import com.myplacc.web.controller.LoginController;
import com.myplacc.web.exception.ServerError;

public class UserManager {
private static Logger log = LoggerFactory.getLogger(UserManager.class);
	
	@Autowired
	private Map<String,IOAuthService> oAuthServiceMap=null;
	
	@Autowired
	private UseraccDaoMapper useraccDaoMapper;

	
	
	public void oAuthLogin(String provider,HttpServletRequest request,HttpServletResponse response) {
		if(oAuthServiceMap.get(provider)!=null){
			oAuthServiceMap.get(provider).oAuthLoginRequest(request, response);
		}else{
			log.error("provider ["+provider+"] not found");
		}
	}	

	public Map<String, IOAuthService> getoAuthServiceMap() {
		return oAuthServiceMap;
	}

	public void setoAuthServiceMap(Map<String, IOAuthService> oAuthServiceMap) {
		this.oAuthServiceMap = oAuthServiceMap;
	}	
	public Useracc checkFacebookOAuth(String authCode){
		return checkOAuth("facebook",authCode);
	}
	public Useracc checkGoogleOAuth(String authCode){
		return checkOAuth("google",authCode);
	}
	private static boolean deleteFile(Path p) {
		if (!p.toFile().delete()) {
			log.error("unable to delete file:" + p, new IOException(
					"unable to delete "));
			return false;
		}
		return true;
	}

	public Path getProfilePicture(String id) {
		Path p1=Paths.get(ImageConfig.PROFILECONFIG.getPath(id+"-profile.png"));
		Path p2=Paths.get(ImageConfig.PROFILECONFIG.getPath(id+"-profile.jpg"));
		Path p3=Paths.get(ImageConfig.PROFILECONFIG.getPath(id+"-profile.jpeg"));
		if(p1.toFile().exists()){
			return p1;
		}else if(p2.toFile().exists()){
			return p2;
		}else if(p3.toFile().exists()){
			return p3;
		}else{
			return Paths.get(ImageConfig.PROFILECONFIG.getPath("profile.png"));
		}
	}
	
	public File storePicture(Useracc user, String ext, InputStream is)
			throws IOException {
		Path tmpTarget=Paths.get(ImageConfig.TMPCONFIG.getPath(user.getId()+"-profile"+ext.toLowerCase()));
		log.debug("moveTo picture to tmp:"+tmpTarget);
		Files.copy(is, tmpTarget, StandardCopyOption.REPLACE_EXISTING);
		try {
			Path p=getProfilePicture(Long.toString(user.getId()));
			if(!p.endsWith("profile.png")){
				deleteFile(p);
			}
			ImageTools.resizeImages(ImageConfig.PROFILECONFIG.width,ImageConfig.PROFILECONFIG.height,ImageConfig.THUMBCONFIG.quality,
					new File(ImageConfig.PROFILECONFIG.getPath(".")), true, tmpTarget.toString());
			deleteFile(tmpTarget);					
			user.setImage(true);
			if(user.getImagec()==null){
				user.setImagec(1);
			}else{
				user.setImagec(user.getImagec()+1);
			}
			return new File(ImageConfig.PROFILECONFIG.getPath(tmpTarget.getFileName().toString()));
		} catch (Exception e) {
			log.error("error processing image",e);
			throw new ServerError(e.getMessage(),e); 
		}
	}	
	private Useracc checkOAuth(String provider,String authCode){
		IOAuthService service=this.oAuthServiceMap.get(provider);
        if(authCode!=null){
        	String accessToken=null;
        	String refreshToken=null;
        	try{
        		String []tokens=service.requestForRefreshAndAccessToken(authCode);
        		refreshToken=tokens[0];
        		accessToken=tokens[1];
        	}catch(Exception e){
        		log.debug("get access Token error try refresh token",e);
        		// refresh
        	}
        	try {
        		if(accessToken!=null){
        			Map userData=service.requestUserData(accessToken);
        			String email=(String)userData.get("email");
        			if(email==null){
        				throw new Exception("email not found");
        			}
        			String gender=(String)userData.get("gender");
        			String name=(String)userData.get("name");
					Useracc user=useraccDaoMapper.findUserForEmail(email, 0);
					if(user!=null){
						user.setPrivateCode(authCode);
						log.debug("external user exists in DB");
					}else{
						log.debug("user not found in database create record for user");
						user=new Useracc();
						user.setProvider(service.getProviderId());
						user.setEmail(email);
						user.setName(name);
						user.setPrivateCode(authCode);
						user.setStatus(1);
						// save session // make login
						if(gender!=null){
							user.setGender(gender.equals("mail")?1:2);
						}
						newUserInit(user);
						//user.setLogin(HttpHelper.replacetoAsciiChars(name)+user.getId());
					}
					if(userData.get("pict_stream")!=null){
						InputStream stream=(InputStream)userData.get("pict_stream");
						File f = storePicture(user, (String)userData.get("pict_ext"), stream);
						stream.close();
						if(f.length()==1401){
							f.delete();
							user.setImage(false);
						}else{
							user.setImage(true);
							user.incrementImagec();
						}
						
						useraccDaoMapper.updateUser(user);
					}
					
					service.setUserPrefs(user, accessToken, refreshToken);
					user.setSensible(false);
					user.setPassword(null);
					return user;
        		}
			} catch (Exception e) {
				log.error("checkAuth",e);
			}
        }
       	return null;
	}	
	public void newUserInit(Useracc user) {
		user.setScopes(LoginController.REGISTERED_SCOPES);
		useraccDaoMapper.insertUser(user);
	}
}
