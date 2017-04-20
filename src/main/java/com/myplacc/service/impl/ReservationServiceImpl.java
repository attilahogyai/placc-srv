package com.myplacc.service.impl;

import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.myplacc.domain.reservation.Reservation;
import com.myplacc.domain.user.Session;
import com.myplacc.web.controller.RequestWrapper;
import com.myplacc.web.exception.AuthException;
import com.myplacc.web.exception.PermissionDenied;

import io.katharsis.queryParams.QueryParams;
import io.katharsis.repository.ResourceRepository;

@Component(value="reservationServiceImpl")
public class ReservationServiceImpl extends AbstractService implements  ResourceRepository<Reservation, Long>{
	@Autowired
	private PlaccDaoMapper placcDaoMapper;
	
	@Override
	public void delete(Long arg0) {
		Session session=RequestWrapper.getSession();
		if(session.isRegistered()){
			Reservation r=placcDaoMapper.findOneReservation(arg0);
			Long id=session.getUseracc().getId();
			if(!id.equals(r.getUseracc().getId())){
				throw new PermissionDenied("BELONGS TO OTHER USER");
			}
			
			placcDaoMapper.deleteReservation(arg0);
		}else{
			throw new AuthException("NOT AUTHORIZED");
		}
			
	}

	@Override
	public Iterable<Reservation> findAll(QueryParams query) {
		Set<String> r=query.getFilters().getParams().get("seat").getParams().get("");
		if(r==null || r.size()==0) return null;
		return placcDaoMapper.listReservationsForSeat(Long.parseLong(r.toArray(new String[r.size()])[0]));
	}

	@Override
	public Iterable<Reservation> findAll(Iterable<Long> arg0, QueryParams arg1) {
		
		return null;
	}

	@Override
	public Reservation findOne(Long arg0, QueryParams arg1) {
		return placcDaoMapper.findOneReservation(arg0);
	}

	@Override
	public <S extends Reservation> S save(S arg0) {
		// TODO Auto-generated method stub
		return null;
	}

}
