package com.myplacc.util;

import java.io.Serializable;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;

import com.google.common.base.Joiner;



public class HttpHelper {
	private static final Logger logger = LoggerFactory
			.getLogger(HttpHelper.class);
	
	private static final String PNG = ".PNG";
	private static final String JPG = ".JPG";
	public static final String COOCKIENAME="loginName";
	public static final String PUBLICIMAGELIST="publicImageList";
	public static final String PUBLICIMAGELISTPAGE="publicImageListPage";
	public static final String SITEACCESS="siteaccess";
	
	static Pattern comaSpaces=Pattern.compile(",");
	static Pattern comaSpaces2=Pattern.compile("[ ]{1,},");
	static Pattern manySpaces=Pattern.compile("[ ]{2,}");
	static Pattern openTag=Pattern.compile("<");
	static Pattern closeTag=Pattern.compile(">");
	
	static Pattern smile=Pattern.compile(":\\)|:-\\)");
	static Pattern leer=Pattern.compile(";\\)|;-\\)");
	static Pattern sad=Pattern.compile(":\\(|:-\\(");
	static Pattern link=Pattern.compile("(https?:\\/\\/?[\\da-z\\.-]+\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?)");

	
	public static String replacetoAsciiChars(String string){
		String result=string.replaceAll("[óőö]", "o");
		result=result.replaceAll("[ ]", "");
		result=result.replaceAll("[üűú]", "u");
		result=result.replaceAll("[í]", "i");
		result=result.replaceAll("[á]", "a");
		result=result.replaceAll("[é]", "e");
		result=result.replaceAll("[ÓŐÖ]", "O");
		result=result.replaceAll("[ÜŰÚ]", "U");
		result=result.replaceAll("[Í]", "I");
		result=result.replaceAll("[Á]", "A");
		result=result.replaceAll("[É]", "E");
		result=result.replaceAll("[\\s]", "_");
		result=result.replaceAll("[/\\\\]", "_");
		return result;
	}
	public static String getExt(String path){
		if(path!=null && path.lastIndexOf(".")>-1){
			String ext=path.substring(path.lastIndexOf("."));
			return ext;
		}
		return "";
	}
	public static boolean isFileImageExt(String path){
		return isImageExt(getExt(path));
	}
	public static boolean isImageExt(String ext){
		if(ext!=null && ext.length()>0){
			return ext.toUpperCase().endsWith(JPG) || ext.toUpperCase().endsWith(PNG);
		}
		return false;
	}
	public static String getContentType(String filename){
		if(filename.toLowerCase().endsWith(".png")){
			return MediaType.IMAGE_PNG_VALUE;
		}else if(filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")){
			return MediaType.IMAGE_JPEG_VALUE;			
		}else if(filename.toLowerCase().endsWith(".gif")){
			return MediaType.IMAGE_GIF_VALUE;
		}
		return MediaType.IMAGE_JPEG_VALUE;			// default
	}
	
	public static class PublicImageDesc implements Serializable{
		private static final long serialVersionUID = 7134330843652322888L;
		public Integer id=0;
		public String name=null;
		public String path=null;
		public Integer getId() {
			return id;
		}
		public void setId(Integer id) {
			this.id = id;
		}
		public String getName() {
			return name;
		}
		public void setName(String name) {
			this.name = name;
		}
		public String getPath() {
			return path;
		}
		public void setPath(String path) {
			this.path = path;
		}
	}
	
	public static String getDisplayFormat(Long size){
		if(size==null){
			size=0L;
		}
		DecimalFormat myFormatter = new DecimalFormat("##,###.#");
		double s=size/1024;
		String unit="Kb";
		if(s>1024){
			s=s/1024;
			unit="Mb";
			if(s>1024){
				s=s/1024;
				unit="Gb";
			}
		}
		return myFormatter.format(s)+unit;
	}

	public static String getAlbumUrl(String album){
		return getAlbumUrl(null,album);
	}
	public static String getAlbumUrl(String startUri,String album){
		if(startUri==null){
			startUri="_gallery_album_";
		}if(startUri.endsWith(".zul")){
			return startUri;
		}else{
			return startUri+replacetoAsciiChars(album);
		}
	}

	public static String textBeautifier(String text){
		text=openTag.matcher(text).replaceAll("&lt;");
		text=closeTag.matcher(text).replaceAll("&gt;");
		text=comaSpaces.matcher(text).replaceAll(", ");
		text=comaSpaces2.matcher(text).replaceAll(", ");
		text=manySpaces.matcher(text).replaceAll(" ");
		return text; 
	}
	public static String textHtmlFormatter(String text){
		text=smile.matcher(text).replaceAll("<img src='img/icon2/feel/smile.png' style='vertical-align:middle;width:15xp;height:15px;'/>");
		text=sad.matcher(text).replaceAll("<img src='img/icon2/feel/sad.png' style='vertical-align:middle;width:15xp;height:15px;'/>");
		text=leer.matcher(text).replaceAll("<img src='img/icon2/feel/leer.png' style='vertical-align:middle;width:15xp;height:15px;'/>");
		text=link.matcher(text).replaceAll("<a href='$1' target='blank'>$1</a>");
		
		return text; 
	}
	
	public static Map<String,String> getUrlParameters(String url){
		Map<String,String> values=new HashMap<String,String>();
		String []variables=url.split("&");
		for (String v : variables) {
			String [] urlv=v.split("=");
			if(urlv.length==2){
				values.put(urlv[0], urlv[1]);
			}else{
				logger.debug("parse error :"+v);
			}
		}
		return values;
	}
	public static String textToHtml(String comment){
		if(comment!=null){
			return comment.replaceAll("\\n", "<br>");
		}
		return comment;
	}
	public static String encodeParameters(Map<String, String> params) {
	    Map<String, String> escapedParams = new LinkedHashMap();
	    for (Map.Entry<String, String> entry : params.entrySet()) {
	      try {
	        escapedParams.put(URLEncoder.encode(entry.getKey(), "UTF-8"),
	                          URLEncoder.encode(entry.getValue(), "UTF-8"));
	      } catch (UnsupportedEncodingException e) {
	        // this should not happen
	        throw new RuntimeException("platform does not support UTF-8", e);
	      }
	    }
	    return Joiner.on("&").withKeyValueSeparator("=").join(escapedParams);
	}
	public static String urlEncode(String s){
		try {
			return URLEncoder.encode(s,"UTF-8");
		} catch (UnsupportedEncodingException e) {
			logger.error("error",e);
			return null;
		}
	}
	
}