package com.myplacc.domain;

import java.util.ArrayList;
import java.util.List;

public class AuthorizationInfo {
	
	private String user;
	private String client;
	private List<String> permissions;
	private List<String> groups;
	public AuthorizationInfo() {
		super();
		permissions=new ArrayList<String>();
		groups=new ArrayList<String>();
	}

	/**
	 * Authenticated user on the application.
	 * 
	 * @return
	 */
	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}

	/**
	 * The client or mandator client of the user.
	 * 
	 * @return
	 */
	public String getClient() {
		return client;
	}

	public void setClient(String client) {
		this.client = client;
	}

	/**
	 * List of user roles which have to be applied when an operation for client or mandator is performed.
	 * 
	 * @return
	 */
	
	public List<String> getPermissions() {
		return permissions;
	}
	public void setPermissions(List<String> permissions) {
		this.permissions = permissions;
	}
	public List<String> getGroups() {
		return groups;
	}
	public void setGroups(List<String> groups) {
		this.groups = groups;
	}
}
