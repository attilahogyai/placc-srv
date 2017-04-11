package com.myplacc.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.myplacc.domain.company.Level;

import io.katharsis.queryParams.QueryParams;
import io.katharsis.repository.ResourceRepository;
@Component(value="levelServiceImpl")
public class LevelServiceImpl extends AbstractService implements ResourceRepository<Level, Long>{
	@Autowired
	private PlaccDaoMapper placcDaoMapper;
	
	@Override
	public void delete(Long arg0) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public Iterable<Level> findAll(QueryParams arg0) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Iterable<Level> findAll(Iterable<Long> arg0, QueryParams arg1) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Level findOne(Long id, QueryParams arg1) {
		return placcDaoMapper.findOneLevel(id);
	}

	@Override
	public <S extends Level> S save(S arg0) {
		// TODO Auto-generated method stub
		return null;
	}

}
