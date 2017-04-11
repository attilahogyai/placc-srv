package com.myplacc.web.controller;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.myplacc.service.impl.LangtextServiceImpl;

@RequestMapping("/common")
@Controller
public class LangtextController extends AbstractController{
	@Autowired
	LangtextServiceImpl langtextService;
	
	@RequestMapping(value="/langtext",method = RequestMethod.GET)
	@ResponseBody
	public Object findObject(HttpServletRequest request){
		return langtextService.findAll(null);
	}
	@RequestMapping(value="/langlist",method = RequestMethod.GET)
	@ResponseBody
	public Object langList(HttpServletRequest request){
		return this.languageMap;
	}
}

