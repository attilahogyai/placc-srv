package com.myplacc.web.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;


@ResponseStatus(value=HttpStatus.CONFLICT,reason="check error")
public class CheckException extends RuntimeException{
	public CheckException(String message){
		super(message);
	}
}
