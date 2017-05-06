package com.myplacc.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class StaticPageController {
	@RequestMapping(value="/profile/index",method=RequestMethod.GET)
	public String profile() throws Exception{
		return "forward:/";
	}
	@RequestMapping(value="/activate/*",method=RequestMethod.GET)
	public String activate() throws Exception{
		return "forward:/";
	}	
	@RequestMapping(value="/level/*",method=RequestMethod.GET)
	public String level() throws Exception{
		return "forward:/";
	}		
}
