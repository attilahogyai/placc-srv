package com.myplacc.web.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value=HttpStatus.BAD_REQUEST, reason="missing values")
public class MissingValuesException  extends RuntimeException{
	public MissingValuesException(String message){
		super(message);
	}
}
