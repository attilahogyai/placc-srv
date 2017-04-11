package com.myplacc.web.controller;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/api")
public class PageController extends AbstractController{

	@RequestMapping(value = "/profile/setup", method = RequestMethod.GET)
	@ResponseBody
    public Map<String,?> getProfileSetup(Authentication auth) {
		checkSession(auth);
		return buildMap("reservations", 0);
	}
}

