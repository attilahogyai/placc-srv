package com.myplacc.domain;

import java.io.Serializable;

public abstract class AbstractQDI implements Serializable{
	private static final long serialVersionUID = 1L;
	private String requestId;

	public String getRequestId() {
		return requestId;
	}

	public void setRequestId(String requestId) {
		this.requestId = requestId;
	}

}
