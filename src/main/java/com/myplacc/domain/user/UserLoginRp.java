package com.myplacc.domain.user;

import com.myplacc.domain.AbstractRp;

public class UserLoginRp extends AbstractRp{
	private String responseCode;

	public String getResponseCode() {
		return responseCode;
	}

	public void setResponseCode(String responseCode) {
		this.responseCode = responseCode;
	}
}
