package com.myplacc.web.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value=HttpStatus.NOT_FOUND, reason="object not found")
public class UserNotFound extends RuntimeException{
	public UserNotFound(){
		super("user_not_found");
	}
	public UserNotFound(String message){
		super(message);
	}
}
