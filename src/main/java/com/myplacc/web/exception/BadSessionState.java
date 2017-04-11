package com.myplacc.web.exception;

public class BadSessionState extends RuntimeException{

	private static final long serialVersionUID = -4897423723413109747L;
	
	public BadSessionState (String message){
		super(message);
	}
	
}
