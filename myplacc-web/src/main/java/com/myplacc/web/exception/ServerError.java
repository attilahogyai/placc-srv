package com.myplacc.web.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus( value=HttpStatus.INTERNAL_SERVER_ERROR,reason="/general/server_error")
public class ServerError  extends RuntimeException {
	public ServerError(String message,Exception e){
		super(message,e);
	}
	public ServerError(String message){
		super(message);
	}
}
