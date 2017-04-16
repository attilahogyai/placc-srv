package com.myplacc.web.controller;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.myplacc.domain.company.Seat;
import com.myplacc.domain.reservation.Reservation;
import com.myplacc.service.impl.PlaccDaoMapper;

@RequestMapping("/api")
public class ReservationController extends AbstractController{
	@Autowired
	private PlaccDaoMapper placcDaoMapper;
	
	@RequestMapping(value="/prepareReservation",method=RequestMethod.POST)
	@ResponseBody	
	public Object prepareReservation(Authentication auth, @RequestParam("sid") Long seatId, @RequestParam("date") Date date){
		checkSession(auth);
		
		Reservation r=new Reservation();
		r.setSeat(new Seat(seatId));
		r.setTargetDate(date);
		placcDaoMapper.prepareReservation(r);
		
		return r;
	}
	

}
