package com.myplacc.util;


import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.Serializable;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.activation.FileDataSource;
import javax.mail.Address;
import javax.mail.Authenticator;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.apache.log4j.Logger;

import com.myplacc.web.exception.MailingException;

public class MailHelper {
	static Pattern imageFinder = Pattern.compile("^.*?<img.*?src=\"(.*?)\"", Pattern.MULTILINE);
	static String mailPicDir=System.getProperty("mailsender.pic.dir","mailsender-pic");
	
	public static final String DEFAULT_REGISTRATION_SENDER = "attila.hogyai@gmail.com";
	
	public static final String[] DEFAULT_SENDER = new String[]{"message@damocles.hu","MyPlacc"};
	public static class AuthProps implements Serializable{

		/**
		 * 
		 */
		private static final long serialVersionUID = 4037919332504319818L;

		private boolean authenticaton_flag = false;
		private String username = "";
		private String password = "";
		
		public AuthProps(boolean authentication_flag, String username, String password) {
			
			this.authenticaton_flag = authentication_flag;
			this.username = username;
			this.password = password;
			
		}
		
		public boolean isAuthenticaton_flag() {
			return authenticaton_flag;
		}
		public void setAuthenticaton_flag(boolean authenticatonFlag) {
			authenticaton_flag = authenticatonFlag;
		}
		public String getUsername() {
			return username;
		}
		public void setUsername(String username) {
			this.username = username;
		}
		public String getPassword() {
			return password;
		}
		public void setPassword(String password) {
			this.password = password;
		}
		
	}

	
	
	public static final String INFO_MAIL_ADDRESS="info@xprtroom.com";
	public static final String INFO_MAIL_NAME="MyFotoRoom";
	
	
	public static final String REGISTRATION_EMAIL="registration";
	
	public static final String FORGOTPASSWORD_EMAIL="forgotpassword";
	
	public static final String NOTIFYHOST_EMAIL="notify_host";
	public static final String NOTIFYINITIATOR_EMAIL="notify_initiator";

	public static final String REQUEST_RANKING="request_ranking";
	
	public static final String REQUESTAPPOINTMENT_EMAIL="request_appointment";
	public static final String UPDATEAPPOINTMENT_EMAIL="update_appointment";

	public static final String NEW_COMMENT="new_comment";
	
	private static final Logger log = Logger.getLogger(MailHelper.class);

	public static final String CONTENTTYPE ="text/html; charset=UTF-8";

	public static void sendMail(List<String> recipientList, String templateName, String sender[], String subject,
			boolean singlePart, String contentType, Map mailArguments) throws Exception{
		
		sendMail(recipientList, templateName, sender, subject, singlePart, contentType, mailArguments,null );
	}

	
	

	private static List<File> downloadImages(String path,Map<String, String> fileMap) {
		
		
		// Create a new trust manager that trust all certificates
		TrustManager[] trustAllCerts = new TrustManager[]{
		    new X509TrustManager() {
		        public java.security.cert.X509Certificate[] getAcceptedIssuers() {
		            return null;
		        }
		        public void checkClientTrusted(
		            java.security.cert.X509Certificate[] certs, String authType) {
		        }
		        public void checkServerTrusted(
		            java.security.cert.X509Certificate[] certs, String authType) {
		        }
		    }
		};

		// Activate the new trust manager
		try {
		    SSLContext sc = SSLContext.getInstance("SSL");
		    sc.init(null, trustAllCerts, new java.security.SecureRandom());
		    HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
		} catch (Exception e) {
		}
		
		List <File> files=new ArrayList<File>();
		for (Map.Entry<String, String> entry : fileMap.entrySet()) {
			URL url;
			try {
				url = new URL(entry.getKey());
				InputStream in = new BufferedInputStream(url.openStream());
				if(!new File(path).exists()){
					if(new File(path).mkdirs()){
						log.warn("not able to create dir for images: "+path);
					}else{
						log.debug("directory created for images: "+path);
					}
				}
				File f=new File(path+entry.getValue());
				if(!f.exists()){
					FileOutputStream out = new FileOutputStream(f);
					byte[] buf = new byte[1024];
					int n = 0;
					while (-1 != (n = in.read(buf))) {
						out.write(buf, 0, n);
					}
					out.close();
					in.close();
					log.debug("file created and downloaded: "+f);
				}
				log.debug("file added: "+f);
				files.add(f);
			} catch (Exception e) {
				log.warn("download file error",e);
				
			}
		}
		return files;
	}

	public static StringBuffer parseImages(String page,Map<String, String> fileMap) {
		
		Matcher m = imageFinder.matcher(page);
		int i = 1;
		StringBuffer sb = new StringBuffer(page);
		StringBuffer result = new StringBuffer();
		while (m.find()) {
			fileMap.put(m.group(1), "file-" + i);
			result.append(sb.substring(0, m.start(1))).append("cid:").append(
					fileMap.get(m.group(1)));
			sb.replace(0, m.end(1), "");
			m.reset(sb.toString());
			i++;
		}
		result.append(sb);
		return result;
	}
	
	
	
	public static void sendMail(List<String> recipientList, String templateName, String sender[], String subject,
			boolean singlePart, String contentType, Map mailArguments,List<File> attachmentFiles ) throws Exception{
		
		if(!Constants.DISABLE_EMAILS){
			if(!recipientList.isEmpty()){
				for (Iterator<String> iterator = recipientList.iterator(); iterator.hasNext();) {
					String recipient = iterator.next();
					log.info("Recipient address: "+recipient);
				}
				String mailMessageText = null;
				log.debug("Arguments: "+mailArguments);
				

				Map <String,String> controllValues=new HashMap();
				mailArguments.put("cV", controllValues);

				
				
				mailMessageText = VelocityHelper.mergeFile(templateName, mailArguments);
				log.debug("Mail body: "+mailMessageText);
				String smtpHost=System.getProperty("smtp.host");
				String user=System.getProperty("email.user");
				String password=System.getProperty("email.password");
				log.debug("smtp host["+smtpHost+"] user["+user+"] password["+(password==null?"null":"is set")+"]");
				AuthProps authProps=new MailHelper.AuthProps(user!=null, user, password);
				if(smtpHost==null){
					throw new RuntimeException("smtpHost not set");
				}
				
				//Send mail
				try {
					if(controllValues.get("subject")!=null){
						subject=controllValues.get("subject");
					}
					MailHelper.sendMail(smtpHost, sender, recipientList, subject, mailMessageText, singlePart, contentType, authProps, attachmentFiles );
				} catch (Exception e) {
					log.error("SEND MAIL exception", e);
					if(e.getMessage()!=null && e.getMessage().indexOf("Invalid Addresses")>-1){
						throw new MailingException("error_sending_email_invalidaddress",e);
					}else{
						throw new MailingException("sending.email",e);
					}
				}
			}
		}else{
			log.warn("Email sending is disabled");
		}
	}
	public static void sendHtmlMail(String sender[], List<String> recipients, String subject, String message, Map arguments) throws AddressException, UnsupportedEncodingException, MessagingException {
		if(subject==null) {
			throw new RuntimeException("subject cannot be null");
		}
		sendTextMail(sender, recipients, subject, message, arguments, false, null, null);
	}
	public static void sendTextMail(String sender[], List<String> recipients, String subject, String message, Map arguments, boolean singlePart, String contentType, List<File> attachmentFiles) throws AddressException, UnsupportedEncodingException, MessagingException {
		if(!Constants.DISABLE_EMAILS){
			String smtpHost=System.getProperty("smtp.host","mail.atw.hu");
			String user=System.getProperty("email.user");
			String password=System.getProperty("email.password");
			AuthProps authProps=new MailHelper.AuthProps(user!=null, user, password);
			arguments.put("addresseeEmail", recipients.get(0));
			
			String mailMessageText = VelocityHelper.mergeString(message, arguments);	
			
			Map<String, String> fileMap = new HashMap<String, String>();
			
			if(Constants.DOWNLOAD_MAIL_MESSAGES){
				StringBuffer result = parseImages(mailMessageText,fileMap);
				mailMessageText = result.toString();
			}
			List<File> files=downloadImages(mailPicDir+"/"+HttpHelper.replacetoAsciiChars(subject)+"/",fileMap);
			if(attachmentFiles==null){
				attachmentFiles=files;
			}else{
				attachmentFiles.addAll(files);
			}
			log.debug("files:"+files.size());
			
			sendMail(smtpHost, sender, recipients, subject, mailMessageText, singlePart, contentType,authProps,  attachmentFiles);
		}else{
			log.info("send mail disabled");
		}
	}
	private static void sendMail(String smtpHost, String sender[], List<String> recipients, String subject, String message, boolean singlePart, String contentType,  final AuthProps authProps, List<File> attachmentFiles) throws AddressException, MessagingException, UnsupportedEncodingException{
		
		log.debug("Begin send mail, singlePart:" + singlePart + ", contentType:" + contentType);
		if (contentType == null || contentType.trim().length() == 0) {
			contentType = "text/html; charset=UTF-8";
			log.debug("contentType is blank use insted:" + contentType);
		}

		Properties props = System.getProperties();
		props.setProperty("mail.smtp.host", smtpHost);
		if(System.getProperty("mail.smtp.localhost")!=null){
			props.setProperty("mail.smtp.localhost", System.getProperty("mail.smtp.localhost"));
		}
		if(System.getProperty("smtp.ssl")!=null && System.getProperty("smtp.ssl").equals("true")){
			props.setProperty("mail.smtp.class", "com.sun.mail.smtp.SMTPSSLTransport");
			props.setProperty("mail.smtp.port", "465");
			props.setProperty("mail.smtp.socketFactory.port", "465");
			props.setProperty("mail.gm.class", "com.sun.mail.smtp.SMTPSSLTransport");
			props.setProperty("mail.gm.port", "465");
		}else{
			props.setProperty("mail.smtp.class", "com.sun.mail.smtp.SMTPTransport");
			props.setProperty("mail.smtp.port", "25");
			props.setProperty("mail.smtp.socketFactory.port", "25");
			props.setProperty("mail.gm.class", "com.sun.mail.smtp.SMTPTransport");
			props.setProperty("mail.gm.port", "25");
		}
		
		
		Session session = null;
		props.put("mail.debug", "true");

		if (authProps.isAuthenticaton_flag()) {

		    props.put("mail.smtp.auth", "true");
			session = Session.getDefaultInstance(props, new Authenticator() {
				protected PasswordAuthentication getPasswordAuthentication() {
					return new PasswordAuthentication(authProps.getUsername(), authProps.getPassword());
					}});

		} else {
			session = Session.getDefaultInstance(props, null);
		}
		MimeMessage msg = new MimeMessage(session);
		if(sender.length>1){
			msg.setFrom(new InternetAddress(sender[0],sender[1],"UTF-8"));
		}else{
			msg.setFrom(new InternetAddress(sender[0]));
		}
		List<Address> addresses = new ArrayList<Address>();
		for (Iterator iterator = recipients.iterator(); iterator.hasNext();) {
			addresses.add(InternetAddress.parse((String) iterator.next())[0]);
		}
		msg.setRecipients(Message.RecipientType.TO,addresses.toArray(new Address[0]));
		log.debug("recipient: " + addresses.toArray(new Address[0])[0]);
		log.debug("message: \r\n--------------------------------------------\r\n" + message+"\r\n-------------------------------------------------------");
        msg.setSubject(subject,"UTF-8");
        msg.setSentDate(new Date());

        if(! singlePart) {
	
        	// msg.setContent(message,"text/html; charset=ISO-8859-2");
	        MimeMultipart multipart = new MimeMultipart("related");
	
	        // first part  (the html)
	        BodyPart messageBodyPart = new MimeBodyPart();
	        messageBodyPart.setContent(message, contentType);
	        // add it
	        multipart.addBodyPart(messageBodyPart);
	        
	
			File files = mailPicDir == null ? null : new File(mailPicDir);
			if (files != null) {
				if(!files.exists()){
					files.mkdirs();
				}
				if (files.isDirectory()) {
					for (File file : files.listFiles()) {
						if(!file.isFile()) continue;
						String fileName = file.getName();
						if (message.indexOf("cid:" + fileName) > 0) {
							DataSource fds = new FileDataSource(file);
							BodyPart messageBodyPartt = new MimeBodyPart();
							messageBodyPartt.setDataHandler(new DataHandler(fds));
							messageBodyPartt.setHeader("Content-ID", "<" + fileName
									+ ">");
							multipart.addBodyPart(messageBodyPartt);
						}
					}
				} else {
						log.error("the file set in property as mailpicdir is not a directory");
				}
			}
			if(attachmentFiles!=null && !attachmentFiles.isEmpty()){
				for(File file :attachmentFiles){ 

					DataSource fds = new FileDataSource(file);
					BodyPart messageBodyPartt = new MimeBodyPart();
					messageBodyPartt.setDataHandler(new DataHandler(fds));
					messageBodyPartt.setHeader("Content-ID", "<" + HttpHelper.replacetoAsciiChars(file.getName()) + ">");
					multipart.addBodyPart(messageBodyPartt);
					log.debug("content file name part, fileName:" + file.getName());
				}
			}
	        msg.setContent(multipart);

        } else {
        	msg.setText(message, "utf-8","html");
        }

		if (authProps.isAuthenticaton_flag()) {

		    Transport t = session.getTransport("smtp");
		    log.info(sender +"  "+ authProps.getUsername() +"   "+authProps.getPassword());
	        t.connect(smtpHost, authProps.getUsername(), authProps.getPassword());
	        t.sendMessage(msg, msg.getAllRecipients());
	        t.close();

		} else {
			Transport t = session.getTransport("smtp");
			t.send(msg);

		}

		log.debug("Finish send mail, singlePart:" + singlePart);
        log.info("Message sent OK.");

	}
	public static void sendLogMail(String subject, String message){
		List l=new ArrayList();
		l.add("postmaster@bbsitter.hu");
		try {
			sendTextMail(new String []{"info@bbsitter.hu"}, l, "Admin :"+subject, message, new HashMap(), true, "text/plain",  null);
		} catch (Exception e) {
			log.error("error send admin message",e);
		}
	}	


}
