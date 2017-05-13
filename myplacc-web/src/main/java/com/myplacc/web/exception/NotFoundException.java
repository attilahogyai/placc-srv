package com.myplacc.web.exception;

public class NotFoundException  extends RuntimeException {
	private static final long serialVersionUID = -8081090408414742219L;
	public NotFoundException(String message,Exception e){
		super(message,e);
	}
	public NotFoundException(String message){
		super(message);
	}
}