package com.myplacc.web.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus( value=HttpStatus.INTERNAL_SERVER_ERROR,reason="/general/mail_error")
public class MailingException extends RuntimeException {
	public MailingException(String message,Exception e){
		super(message,e);
	}
}
