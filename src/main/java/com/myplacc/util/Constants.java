package com.myplacc.util;

public class Constants {
	public static String IM4JAVA_USEGM=null;
	public static String SEARCHPATH=null;
	public static String TEMPDIR=null;
	public static String STOREDIR=null;
	public static String IMPORTDIR=null;
	
	public static final String PROFILEPATH="profile/";
	
	public static final String QUESTIONFILEPATH="question/";
	
	
	public static final String MEDIUMPATH="medium/";
	public static final String PREVIEWPATH="preview/";
	public static final String THUMBPATH="thumb/";
	public static final String ORIGINALPATH="original/";
	public static final String PNGPATH="png/";
	public static final String WORKPNGPATH="work/";
	public static final String TMPPATH="tmp/";
	
	
	public static final boolean TESTMODE=Boolean.parseBoolean(System.getProperty("testenv", "false"));
	public static boolean UNITTESTMODE=Boolean.parseBoolean(System.getProperty("unittest","false"));

	public static final boolean DISABLE_EMAILS = Boolean.parseBoolean(System.getProperty("disable.emails", "false"));
	public static final boolean DOWNLOAD_MAIL_MESSAGES = Boolean.parseBoolean(System.getProperty("download.mail.messages", "false"));
	
	public static String GOOGLE_OAUTH_CLIENTID = null;
	public static String GOOGLE_OAUTH_CLIENTSECRET = null;
	public static String GOOGLE_OAUTH_OAUTHREDIRECTURL = null;
	public static String GOOGLE_API_KEY = null;
	
	
	public static String FACEBOOK_OAUTH_CLIENTID = null;
	public static String FACEBOOK_OAUTH_CLIENTSECRET = null;
	public static String FACEBOOK_OAUTH_OAUTHREDIRECTURL = null;
	
	public static Long STORAGELIMIT=0L;
	
	public static String HTTPDOMAIN = System.getProperty("qumla.httpdomain", "http://mail.damocles.hu:8888/");
	public static String LOCATIONTYPE = System.getProperty("qumla.locationType", "");
	
	
	
	
	static{
		System.setProperty("im4java.useGM", "true");
		loadConstants();
	}	
	public static final void loadConstants(){
		IM4JAVA_USEGM=System.getProperty("im4java.useGM", "true");
		SEARCHPATH=System.getProperty("bin.searchPath", "d:/prog/GraphicsMagick-1.3.16-Q8/;c:/Program Files (x86)/GraphicsMagick-1.3.12-Q8/;d:/prog/exiftool-8.61/;d:/prog/");
		TEMPDIR=System.getProperty("img.tempdir","tmp/");
		STOREDIR=System.getProperty("img.store","store/");
		STORAGELIMIT=Long.parseLong(System.getProperty("storageLimit","16106127360"));
		
		GOOGLE_OAUTH_CLIENTID = System.getProperty("google.oauth.clientid", null);
		GOOGLE_OAUTH_CLIENTSECRET = System.getProperty("google.oauth.clientsecret", null);
		GOOGLE_OAUTH_OAUTHREDIRECTURL = System.getProperty("google.oauth.authredirecturl", null);
		GOOGLE_API_KEY = System.getProperty("google.api.key", null);
		
		IMPORTDIR = System.getProperty("img.importdir", null);
		
		/** Myfotoroom keys
		*private static final String oAuthRedirectURL = "http://myfotoroom.com/foauthcallback.zul";
		*private static final String clientID = "669238629770881";
		*private static final String clientSecret = "1703424682d9885b628228b4ca70d30f";
		*/
		/** bbsitter test keys
		*private static final String oAuthRedirectURL = "http://localhost:8888/foauthcallback.zul";
		*private static final String clientID = "1425640941097414";
		*private static final String clientSecret = "e11248e76cb40174d2aad3e040024605";
		*/
		
		
		FACEBOOK_OAUTH_CLIENTID = System.getProperty("facebook.oauth.clientid", null);
		FACEBOOK_OAUTH_CLIENTSECRET = System.getProperty("facebook.oauth.clientsecret", null);
		FACEBOOK_OAUTH_OAUTHREDIRECTURL = System.getProperty("facebook.oauth.authredirecturl", null);

	}
		
		
}