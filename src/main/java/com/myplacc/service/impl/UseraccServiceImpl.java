package com.myplacc.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.myplacc.domain.user.Session;
import com.myplacc.domain.user.Useracc;
import com.myplacc.web.controller.LoginController;
import com.myplacc.web.controller.RequestWrapper;

import io.katharsis.queryspec.QuerySpec;
import io.katharsis.repository.ResourceRepositoryV2;
import io.katharsis.resource.list.ResourceList;
@Component("useraccServiceImpl")
public class UseraccServiceImpl implements ResourceRepositoryV2<Useracc, Long>{
	@Autowired
	private UseraccDaoMapper userMapper;
	
	public UseraccServiceImpl() {
	}

	@Override
	public Useracc findOne(Long id, QuerySpec requestParams) {
		Session session=RequestWrapper.getSession();
		if(session.getUseracc()!=null && session.getUseracc().getId().equals(id)){
			return userMapper.findOne(id);
		}else{
			return LoginController.createAnonymeUser();
		}
	}

	@Override
	public ResourceList<Useracc> findAll(QuerySpec requestParams) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ResourceList<Useracc> findAll(Iterable<Long> ids,
			QuerySpec requestParams) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public <S extends Useracc> S save(S entity) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void delete(Long id) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public Class<Useracc> getResourceClass() {
		// TODO Auto-generated method stub
		return Useracc.class;
	}

	@Override
	public <S extends Useracc> S create(S entity) {
		// TODO Auto-generated method stub
		return null;
	}

}
