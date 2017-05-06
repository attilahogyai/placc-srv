package com.myplacc.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.myplacc.domain.company.Level;
import com.myplacc.domain.user.Session;
import com.myplacc.web.controller.RequestWrapper;

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
		Session session=RequestWrapper.getSession();
		Long userid=0L;
		if(session.getUseracc()!=null){
			userid=(Long)session.getUseracc().getId();
		}
		return placcDaoMapper.findOneLevel(id,userid);
	}

	@Override
	public <S extends Level> S save(S arg0) {
		// TODO Auto-generated method stub
		return null;
	}

}
