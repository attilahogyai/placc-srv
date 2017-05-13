package com.myplacc.web.controller;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.myplacc.service.impl.LoginDaoMapper;

@Controller
public class AdminController {
	
	@Autowired
	LoginDaoMapper loginDaoMapper;
	
	private int imageLoadCount=0;
	
	public AdminController() {

	}
	
	@RequestMapping(value="/adminmanager",method=RequestMethod.GET)
	@ResponseBody
	public Object updateManager(HttpServletRequest request,HttpServletResponse response) throws Exception{
	
		String command = request.getParameter("command");
		String status = request.getParameter("status");
		if(command.equals("sessionlocation")){
			//updateSessionsWithoutLocation();
		}else if(command.equals("updatequestion")){
			String quid=request.getParameter("qid");
			String [] ids=null;
			
			if(quid.indexOf("-")>-1){
				String [] intervall=quid.split("-");
				List<String> intids=new ArrayList<String>(); 
				for (int i = Integer.parseInt(intervall[0]); i <= Integer.parseInt(intervall[1]); i++) {
					intids.add(Integer.toString(i));
				}
				ids=intids.toArray(new String[intids.size()]);
			}else{
				ids=quid.split(",");
			}
			//return updateQuestionAnswer(ids);
		}else if(command.equals("importimage")){
			if(imageLoadCount==0 && status==null){
				//createLoadImagesJob().start();
				return "started";
			}else if(status.equals("query")){
				return imageLoadCount==0?"Ready":"In proress:"+imageLoadCount;				
			}
		}
		return "OK";
	}	

}
