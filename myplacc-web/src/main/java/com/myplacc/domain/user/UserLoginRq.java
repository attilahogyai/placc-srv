package com.myplacc.domain.user;

import com.myplacc.domain.AbstractRq;
import com.myplacc.domain.AuthorizationInfo;

public class UserLoginRq extends AbstractRq{
	private String login;
	private String password;
	private String ipAddress; 
	public String getLogin() {
		return login;
	}
	public void setLogin(String login) {
		this.login = login;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getIpAddress() {
		return ipAddress;
	}
	public void setIpAddress(String ipAddress) {
		this.ipAddress = ipAddress;
	}
}
