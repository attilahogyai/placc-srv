package com.myplacc.service.impl;

import java.util.List;

import com.myplacc.domain.company.Building;
import com.myplacc.domain.company.Company;
import com.myplacc.domain.company.Level;
import com.myplacc.domain.reservation.Reservation;

public interface PlaccDaoMapper {
	public Company findOneCompany(Long id);
	public List<Company> findAllCompany();
	public Building findOneBuilding(Long id);
	public Level findOneLevel(Long id);
	
	public List<Reservation> listReservationsForLevel(Long level);
}
