package com.myplacc.web.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value=HttpStatus.METHOD_NOT_ALLOWED, reason="unauthorized client")
public class PermissionDenied extends RuntimeException{
	public PermissionDenied(){}
	public PermissionDenied(String m){
		super(m);
	}
}
