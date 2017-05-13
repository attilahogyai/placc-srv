package com.myplacc.util;

import java.io.IOException;
import java.net.URLEncoder;
import java.security.KeyManagementException;
import java.security.cert.CertificateException;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.ssl.SSLContexts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myplacc.domain.user.Session;

import se.walkercrou.places.GooglePlaces;

public class TranslationUtil {

	private static final Logger log = LoggerFactory.getLogger(TranslationUtil.class);

	private CloseableHttpClient httpClient = HttpClients.createMinimal();
	private CloseableHttpClient httpsClient = null;

	private SSLConnectionSocketFactory sslsf = null;
	GooglePlaces googleLocationClient = new GooglePlaces(Constants.GOOGLE_API_KEY, new PlacesRequestHandler());

	public TranslationUtil() {
		try {
			sslsf = new SSLConnectionSocketFactory(createSSLContext(),
					SSLConnectionSocketFactory.getDefaultHostnameVerifier());
		} catch (KeyManagementException e) {
			log.error("KeyManagementException", e);
		}
		httpsClient = HttpClients.custom().setSSLSocketFactory(sslsf).build();
	}

	private SSLContext createSSLContext() throws KeyManagementException {
		SSLContext sslcontext = SSLContexts.createDefault();
		TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {

			@Override
			public void checkClientTrusted(java.security.cert.X509Certificate[] arg0, String arg1)
					throws CertificateException {
			}

			@Override
			public void checkServerTrusted(java.security.cert.X509Certificate[] arg0, String arg1)
					throws CertificateException {
			}

			@Override
			public java.security.cert.X509Certificate[] getAcceptedIssuers() {
				return null;
			}
		} };
		sslcontext.init(null, trustAllCerts, new java.security.SecureRandom());
		return sslcontext;
	}

	public String translateText(final String text, final String source) {
		try {
			HttpGet rq = new HttpGet("https://www.googleapis.com/language/translate/v2?key=" + Constants.GOOGLE_API_KEY
					+ "&q=" + URLEncoder.encode(text, "UTF-8") + "&source=" + source + "&target=en");
			HttpResponse resp = httpClient.execute(rq);
			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode node = objectMapper.readTree(resp.getEntity().getContent());
			JsonNode data = node.get("data");
			if (data != null) {
				JsonNode transalations = data.get("translations");
				JsonNode translation = transalations.get(0);
				String translated = translation.get("translatedText").asText();
				return translated;
			}
		} catch (Exception e) {
			log.error("unable to translate", e);
		}
		return null;
	}

}
