package com.myplacc.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.myplacc.domain.company.Building;

import io.katharsis.queryParams.QueryParams;
import io.katharsis.repository.ResourceRepository;

@Component(value="buildingServiceImpl")
public class BuildingServiceImpl extends AbstractService implements ResourceRepository<Building, Long>{
	@Autowired
	private PlaccDaoMapper companyDaoMapper;
	@Override
	public void delete(Long arg0) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public Iterable<Building> findAll(QueryParams arg0) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Iterable<Building> findAll(Iterable<Long> arg0, QueryParams arg1) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Building findOne(Long id, QueryParams arg1) {
		return companyDaoMapper.findOneBuilding(id);
	}

	@Override
	public <S extends Building> S save(S arg0) {
		// TODO Auto-generated method stub
		return null;
	}

}
