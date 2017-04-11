package com.myplacc.web.controller;

import java.util.HashMap;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class SearchController extends AbstractController{
		
	@RequestMapping(value="/search",method=RequestMethod.POST)
	@ResponseBody
	public Object getLocationResult(@RequestParam("query") String query,@RequestParam("l") String language){
		
		return wrapResult(new HashMap<>());
	}


}
