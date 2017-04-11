package com.myplacc.domain.user;

import io.katharsis.resource.annotations.JsonApiId;
import io.katharsis.resource.annotations.JsonApiResource;

import java.sql.Timestamp;
import java.util.Arrays;
import java.util.Date;

@JsonApiResource(type="Session")
public class Session {
	@JsonApiId
	private String code;
	private Useracc useracc;
	private String[] scopes;
	private Integer valid;
	private String userAgent;
	private Timestamp expireDate;
	private Date createDt;
	private Date lastPing;
	private String language;
	private String remoteIp;
	private String remoteHost;
	private String country;
	
	
	private Long location;
	private String fingerprint;
	private String hash;
	private String city;
	private Float lon;
	private Float lat;
	public Useracc getUseracc() {
		return useracc;
	}
	public void setUseracc(Useracc useracc) {
		if(useracc.getScopes()!=null){
			setScopes(useracc.getScopes());
		}
		this.useracc = useracc;
	}
	public String[] getScopes() {
		return scopes;
	}
	public void setScopes(String[] scopes) {
		this.scopes = scopes;
		Arrays.sort(scopes);
	}
	public Integer getValid() {
		return valid;
	}
	public void setValid(Integer valid) {
		this.valid = valid;
	}
	public String getUserAgent() {
		return userAgent;
	}
	public void setUserAgent(String userAgent) {
		this.userAgent = userAgent;
	}
	public Timestamp getExpireDate() {
		return expireDate;
	}
	public void setExpireDate(Timestamp expireDate) {
		this.expireDate = expireDate;
	}
	public String getLanguage() {
		return language;
	}
	public void setLanguage(String language) {
		this.language = language;
	}
	public Date getCreateDt() {
		return createDt;
	}
	public void setCreateDt(Date createDt) {
		this.createDt = createDt;
	}
	public Date getLastPing() {
		return lastPing;
	}
	public void setLastPing(Date lastPing) {
		this.lastPing = lastPing;
	}
	public String getRemoteIp() {
		return remoteIp;
	}
	public void setRemoteIp(String remoteIp) {
		this.remoteIp = remoteIp;
	}
	public String getRemoteHost() {
		return remoteHost;
	}
	public void setRemoteHost(String remoteHost) {
		this.remoteHost = remoteHost;
	}
	public String getCountry() {
		return country;
	}
	public void setCountry(String country) {
		this.country = country;
	}
	public Long getLocation() {
		return location;
	}
	public void setLocation(Long location) {
		this.location = location;
	}
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public String getFingerprint() {
		return fingerprint;
	}
	public void setFingerprint(String fingerprint) {
		this.fingerprint = fingerprint;
	}
	public String getHash() {
		return hash;
	}
	public void setHash(String hash) {
		this.hash = hash;
	}
	public String getCity() {
		return city;
	}
	public void setCity(String city) {
		this.city = city;
	}
	public Float getLon() {
		return lon;
	}
	public void setLon(Float lon) {
		this.lon = lon;
	}
	public Float getLat() {
		return lat;
	}
	public void setLat(Float lat) {
		this.lat = lat;
	}
	public boolean isAdmin(){
		if(scopes!=null){
			return Arrays.binarySearch(scopes, "ROLE_ADMIN")>=0;
		}
		return false;
	}
	public boolean isRegistered(){
		if(scopes!=null){
			return Arrays.binarySearch(scopes, "ROLE_REGISTERED")>=0;
		}
		return false;
	}
	public boolean isCustomer(){
		if(scopes!=null){
			return Arrays.binarySearch(scopes, "ROLE_CUSTOMER")>=0;
		}
		return false;
	}
}
