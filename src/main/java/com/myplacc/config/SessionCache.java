package com.myplacc.config;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;

import com.myplacc.domain.AuthorizationInfo;

public class SessionCache {
	private String id;
	private String client;
	private String language; //="HU";
	private Date valueDate=new Date();
	private List <GrantedAuthority> grantedAuthorities=new ArrayList<GrantedAuthority>();
	private AuthorizationInfo authorizationInfo=null;
	public SessionCache(String id){
		this.id=id;
	}

	public List<GrantedAuthority> getGrantedAuthorities() {
		return grantedAuthorities;
	}
	public void setGrantedAuthorities(List <GrantedAuthority> grantedAuthorities) {
		this.grantedAuthorities = grantedAuthorities;
	}
	@Override
	public int hashCode() {
		return id.length();
	}
	@Override
	public boolean equals(Object obj) {
		if(obj==null || !(obj instanceof SessionCache)){
			return false;
		}
		return ((SessionCache)obj).id.equals(this.id);
	}
	public String getClient() {
		return client;
	}
	public void setClient(String client) {
		this.client = client;
	}
	

	public String getLanguage() {
		return language;
	}
	public void setLanguage(String language) {
		this.language = language;
	}
	public Date getValueDate() {
		return valueDate;
	}
	public void setValueDate(Date valueDate) {
		this.valueDate = valueDate;
	}

	public AuthorizationInfo getAuthorizationInfo() {
		return authorizationInfo;
	}

	public void setAuthorizationInfo(AuthorizationInfo authorizationInfo) {
		this.authorizationInfo = authorizationInfo;
	}

}
