package com.myplacc.domain;

public class AbstractRq extends AbstractQDI{
	private String lang;
	private int offset;
	private int limit;
	private AuthorizationInfo authorizationInfo;
	public String getLang() {
		return lang;
	}

	public void setLang(String language) {
		this.lang = language;
	}

	public AuthorizationInfo getAuthorizationInfo() {
		return authorizationInfo;
	}

	public void setAuthorizationInfo(AuthorizationInfo authorizationInfo) {
		this.authorizationInfo = authorizationInfo;
	}

	public int getOffset() {
		return offset;
	}

	public void setOffset(int offset) {
		this.offset = offset;
	}

	public int getLimit() {
		return limit;
	}

	public void setLimit(int limit) {
		this.limit = limit;
	}
}
