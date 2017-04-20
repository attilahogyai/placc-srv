package com.myplacc.web.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value=HttpStatus.UNAUTHORIZED, reason="unauthorized client")
public class AuthException extends RuntimeException{
	public AuthException(){
		
	}
	public AuthException(String m){
		super(m);
	}
}
