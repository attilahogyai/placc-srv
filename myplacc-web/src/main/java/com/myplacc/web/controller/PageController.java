package com.myplacc.web.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.myplacc.domain.reservation.Reservation;
import com.myplacc.domain.user.Session;
import com.myplacc.service.impl.PlaccDaoMapper;

@Controller
@RequestMapping("/api")
public class PageController extends AbstractController{
	
	@Autowired
	private PlaccDaoMapper placcDaoMapper;
	
	@RequestMapping(value = "/profile/setup", method = RequestMethod.GET)
	@ResponseBody
    public Map<String,?> getProfileSetup(Authentication auth) {
		Session session=checkSession(auth);
		List<Reservation> reservaition = new ArrayList<Reservation>();
		if(session!=null && session.getUseracc()!=null){
			reservaition=placcDaoMapper.listReservationsForUser(session.getUseracc().getId());
		}
		return buildMap("reservations", reservaition);
	}
}

