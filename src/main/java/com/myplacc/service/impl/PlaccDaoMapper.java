package com.myplacc.service.impl;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.myplacc.domain.company.Building;
import com.myplacc.domain.company.Company;
import com.myplacc.domain.company.Level;
import com.myplacc.domain.reservation.Reservation;

public interface PlaccDaoMapper {
	public Company findOneCompany(Long id);
	public List<Company> findAllCompany();
	public Building findOneBuilding(Long id);
	public Level findOneLevel(@Param("levelId") Long id,@Param("userId") Long userid);
	
	public List<Reservation> listReservationsForLevel(Long level);
	public List<Reservation> listReservationsForSeat(@Param("seatId") Long seat,@Param("userId") Long userId);
	public List<Reservation> listReservationsForUser(Long userid);
	
	public void prepareReservation(Reservation reservation);
	public void finishReservation(Reservation reservation);
	public Reservation findOneReservation(Long id);
	public void deleteReservation(Long id);
	
}
