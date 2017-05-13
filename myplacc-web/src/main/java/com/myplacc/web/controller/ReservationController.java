package com.myplacc.web.controller;

import java.util.Date;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.myplacc.domain.company.Seat;
import com.myplacc.domain.reservation.Reservation;
import com.myplacc.domain.user.Useracc;
import com.myplacc.service.impl.PlaccDaoMapper;
import com.myplacc.web.exception.BadRequest;

@RequestMapping("/api")
@Controller
public class ReservationController extends AbstractController{
	final Logger logger = LoggerFactory.getLogger(ReservationController.class);

	@Autowired
	private PlaccDaoMapper placcDaoMapper;
	
	@RequestMapping(value="/prepareReservation",method=RequestMethod.POST)
	@ResponseBody	
	public Object prepareReservation(Authentication auth, @RequestParam("sid") Long seatId, @RequestParam("date") @DateTimeFormat(pattern="yyyy-MM-dd HH:mm:ss.SSSZZ") Date date){
		Useracc user=checkForAuth(auth);
		
		Reservation r=new Reservation();
		r.setSeat(new Seat(seatId));
		r.setTargetDate(new Timestamp(date.getTime()));
		long now=new Date().getTime();
		if(now>r.getTargetDate().getTime()){
			throw new BadRequest("RESERVATION_BACK_IN_TIME");
		}
		r.setCreateDt(new Timestamp(now));
		r.setUseracc(user);
		placcDaoMapper.prepareReservation(r);
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		logger.debug("targetDate"+sdf.format(r.getTargetDate()));
		Reservation rr=placcDaoMapper.findOneReservation(r.getId());
		return rr;
	}
	

}
