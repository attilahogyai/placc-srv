package com.myplacc.service.oauth;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.openid4java.consumer.ConsumerManager;
import org.openid4java.consumer.VerificationResult;
import org.openid4java.discovery.DiscoveryInformation;
import org.openid4java.discovery.Identifier;
import org.openid4java.message.AuthRequest;
import org.openid4java.message.ParameterList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.myplacc.domain.user.Useracc;
import com.myplacc.service.impl.UseraccDaoMapper;
import com.myplacc.util.Constants;
import com.myplacc.util.HttpHelper;

public class GoolgeOAuthServices implements IOAuthService {
	//private static final String oAuthScope = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://docs.google.com/feeds/";
	private static final String oAuthScope = "https://www.googleapis.com/auth/userinfo.profile "
			+ "https://www.googleapis.com/auth/userinfo.email ";
			//+ "https://www.googleapis.com/auth/calendar.readonly "
			//+ "https://www.googleapis.com/auth/calendar";
	private RestTemplate restTemplate=new RestTemplate();
	private static final Logger logger = LoggerFactory
			.getLogger(GoolgeOAuthServices.class);
	
	private static final String clientID = Constants.GOOGLE_OAUTH_CLIENTID;
	private static final String clientSecret = Constants.GOOGLE_OAUTH_CLIENTSECRET;
	private static final String oAuthRedirectURL = Constants.GOOGLE_OAUTH_OAUTHREDIRECTURL;
	
	
	String OAuthAuthURL = "https://accounts.google.com/o/oauth2/auth";
	String OAuthTokenURL = "https://accounts.google.com/o/oauth2/token";
	
	@Autowired
	private UseraccDaoMapper userDaoMapper;
	
	@Override
	public void oAuthLoginRequest(HttpServletRequest request,
			HttpServletResponse response) {
		Map<String,String> parameters=new HashMap<String,String>();
		parameters.put("response_type", "code");
		parameters.put("client_id", clientID);
		parameters.put("redirect_uri", oAuthRedirectURL);
		parameters.put("scope", oAuthScope);
		parameters.put("state", "ok");
		parameters.put("access_type", "offline");
		
		String paramter=HttpHelper.encodeParameters(parameters);
		String forwardUrl=OAuthAuthURL+"?"+paramter;
		try {
			response.sendRedirect(forwardUrl);
		} catch (IOException e) {
			logger.debug("send redirect error",e);
		}
	}

	@Override
	public String[] requestForRefreshAndAccessToken(String authToken) throws Exception{
		GoogleAuthorizationCodeTokenRequest authRequest=new GoogleAuthorizationCodeTokenRequest(new NetHttpTransport(),
				new JacksonFactory(),clientID, clientSecret, authToken, oAuthRedirectURL);
		//authRequest.useBasicAuthorization = false;
		
		GoogleTokenResponse authResponse=null;
		try {
			authResponse = authRequest.execute();
		} catch (IOException e3) {
			logger.error("requestForAccessToken",e3);
			throw e3;
		}
		return new String[]{authResponse.getRefreshToken(),authResponse.getAccessToken()};

	}
	@Override
	public String requestForAccessToken(String refreshToken) throws Exception{
		
		HttpHeaders headers=new HttpHeaders();  
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
		Map<String,String> parameters=new LinkedHashMap<String,String>();
		parameters.put("client_secret", clientSecret);
		parameters.put("grant_type", "refresh_token");
		parameters.put("refresh_token", refreshToken);
		parameters.put("client_id", clientID);
		
		String paramString=HttpHelper.encodeParameters(parameters);

		if(logger.isDebugEnabled())logger.debug("HttpEntity ["+paramString+"] "+headers);
		
		HttpEntity<String> entity = new HttpEntity<String>(paramString,headers);
		
		String response=restTemplate.postForObject(OAuthTokenURL, entity,String.class);
		
		ObjectMapper mapper = new ObjectMapper();
		Map<?,?> rootAsMap = mapper.readValue(response, Map.class);
		String accessToken=(String)rootAsMap.get("access_token");
		if(accessToken==null){
			logger.debug("access not found in reponse ["+rootAsMap+"]");
		}
		return accessToken;
	}
	
	
	@Override
	public String requestEmail(String accessToken) throws Exception{
		HttpGet get=new HttpGet("https://www.googleapis.com/oauth2/v1/userinfo?access_token="+URLEncoder.encode(accessToken));
		DefaultHttpClient client=new DefaultHttpClient ();
		HttpResponse response;
		StringBuffer sb=new StringBuffer();
		try {
			response = client.execute(get);
			String line=null;
			BufferedReader reader=new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
			while((line=reader.readLine())!=null){
				sb.append(line);
			}
		} catch (Exception e) {
			logger.error("requestUserData", e);
			throw e;
		}
		logger.debug("requestUserData result:"+sb.toString());
		JSONParser jp=new JSONParser(); 
		Object object=jp.parse(sb.toString());
		JSONObject jo=(JSONObject)object;	
		String email=(String)jo.get("email");
		Boolean verified=(Boolean)jo.get("verified_email");
		if(verified==null || verified.equals("false")){
			throw new Exception("authentication exception");
		}
		return email;
	}
	public Map<String,Object> requestUserData(String accessToken) throws Exception{
		HttpGet get=new HttpGet("https://www.googleapis.com/oauth2/v2/userinfo?access_token="+URLEncoder.encode(accessToken));
		DefaultHttpClient client=new DefaultHttpClient ();
		HttpResponse response;
		StringBuffer sb=new StringBuffer();
		try {
			response = client.execute(get);
			String line=null;
			BufferedReader reader=new BufferedReader(new InputStreamReader(response.getEntity().getContent(),"UTF-8"));
			while((line=reader.readLine())!=null){
				sb.append(line);
			}
			reader.close();
			get.completed();
		} catch (Exception e) {
			logger.error("requestUserData", e);
			throw e;
		}
		logger.debug("requestUserData result:"+sb.toString());
		JSONParser jp=new JSONParser(); 
		Map data=(Map)jp.parse(sb.toString());
		if(data.get("picture")!=null){
			String url=(String)data.get("picture");
			int li=url.lastIndexOf(".");
			String ext=url.substring(li);
			URL picture=new URL(url);
			data.put("pict_stream", picture.openStream());
			data.put("pict_ext", ext);
		}
		return data;
	}
	
	
	
	public ConsumerManager manager;
	public void openIDLoginRequest(HttpServletRequest request,HttpServletResponse response) {
		try{
			manager = new ConsumerManager();
			String userSuppliedString = "https://www.google.com/accounts/o8/id";
			
			List discoveries = manager.discover(userSuppliedString);
			
			DiscoveryInformation discovered = manager.associate(discoveries);

			request.getSession().setAttribute("discovered", discovered);
			AuthRequest authReq = manager.authenticate(discovered, oAuthRedirectURL);
			Map <String,String>parameters=authReq.getParameterMap();
			
			
			parameters.put("openid.ns", "http://specs.openid.net/auth/2.0");
			parameters.put("openid.claimed_id", "http://specs.openid.net/auth/2.0/identifier_select");
			parameters.put("openid.identity", "http://specs.openid.net/auth/2.0/identifier_select");
			parameters.put("openid.return_to", oAuthRedirectURL);
			parameters.put("openid.realm", "http://myfotoroom.com/");
			
			parameters.put("openid.mode", "checkid_setup");
			parameters.put("openid.ns.ext2", "http://specs.openid.net/extensions/oauth/1.0");
			parameters.put("openid.ext2.consumer", "http://myfotoroom.com/");
			parameters.put("openid.ext2.scope", "https://www.googleapis.com/oauth2/v1/userinfo");
			
			parameters.put("openid.ns.ui", "http://specs.openid.net/extensions/ui/1.0");
			parameters.put("openid.ui.icon", "true");
			String destURL = authReq.getDestinationUrl(true);
			
			int start=destURL.indexOf('?');
			destURL=destURL.substring(0, start);
			String paramter=HttpHelper.encodeParameters(parameters);
			destURL+="?"+paramter;
			logger.debug("redirect to:" + destURL);
			response.sendRedirect(destURL);
		}catch(Exception e){
			logger.error("googleLogin", e);
		}
	}
	public void verifyOpenIDLogin(HttpServletRequest request){
		//extract the parameters from the authentication response
		// (which comes in as a HTTP request from the OpenID provider)
		
		ParameterList openidResp = new ParameterList(request.getParameterMap());

		// retrieve the previously stored discovery information
		DiscoveryInformation discovered = (DiscoveryInformation) request.getSession().getAttribute("discovered");

		// extract the receiving URL from the HTTP request
		StringBuffer receivingURL = request.getRequestURL();
		String queryString = request.getQueryString();
		receivingURL=new StringBuffer("http://myfotoroom.com/oauthcallback.zul");
		if (queryString != null && queryString.length() > 0)
		    receivingURL.append("?").append(request.getQueryString());

		// verify the response
		VerificationResult verification=null;
		Identifier verified = null;
		try {
			verification = manager.verify(receivingURL.toString(), openidResp, discovered);
			verified = verification.getVerifiedId();
			
		} catch (Exception e) {
			logger.error("googleLogin", e);
		}

		// examine the verification result and extract the verified identifier
		String identifier = null;
		if (verified != null){
			identifier=verified.getIdentifier();
		}else{
			
		}
	}	
	public Integer getProviderId(){
		return 1;
	}
	public String getProviderName(){
		return "google";
	}

	@Override
	public void setUserPrefs(Useracc useracc,String accessToken,String refreshToken) {
		useracc.setGoogleAccessToken(accessToken);
		useracc.setGoogleRefreshToken(refreshToken);
	}

	@Override
	public Useracc getUserForAccessToken(String accessToken) {
		return userDaoMapper.findUserByGoogleRequestToken(accessToken);
	}
}
