package com.myplacc.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.myplacc.domain.user.Session;
import com.myplacc.domain.user.Useracc;
import com.myplacc.service.LoginService;

import io.katharsis.queryspec.QuerySpec;
import io.katharsis.repository.ResourceRepositoryV2;
import io.katharsis.resource.list.ResourceList;
@Component
public class LoginServiceImpl implements LoginService , 
ResourceRepositoryV2<Session, Long>{
	final Logger logger = LoggerFactory.getLogger(LoginServiceImpl.class);
	
	@Autowired
	private LoginDaoMapper loginServiceMapper;
	@Autowired
	private UseraccDaoMapper userDaoMapper;
	
	
	@Override
	public Useracc getUseraccByLogin(String login) {
		return loginServiceMapper.getUseraccByLogin(login);
	}
	@Override
	public Useracc getUseraccByEmail(String login) {
		return loginServiceMapper.getUseraccByEmail(login);
	}

	@Override
	public Session getSession(String code) {
		return loginServiceMapper.getSession(code);
	}
	@Override
	public void insertSession(Session session){
		loginServiceMapper.insertSession(session);
	}
	@Override
	public void updateSession(Session session){
		loginServiceMapper.updateSession(session);
	}	
	
	@Override
	public Session updateFingerprint(Session session,String fingerPrint){
		if(fingerPrint!=null){
			Session s=loginServiceMapper.getSessionFingerprint(fingerPrint);
			if(s!=null){ // session already exist for fingerprint 
				logger.debug("move from session["+session.getCode()+"] to ["+s.getCode()+"]");
				session=s;
			}
			if(session.getFingerprint()==null){ // we do not update an existing session fingerprint
				session.setFingerprint(fingerPrint);
				loginServiceMapper.updateFingerprint(session);
			}
		}
		return session;
	}

	@Override
	public void createUser(Useracc user) {
		userDaoMapper.insertUser(user);
	}



	@Override
	public Session findOne(Long id, QuerySpec requestParams) {
		// TODO Auto-generated method stub
		throw new UnsupportedOperationException();
	}

	@Override
	public ResourceList<Session> findAll(QuerySpec requestParams) {
		// TODO Auto-generated method stub
		throw new UnsupportedOperationException();
	}

	@Override
	public ResourceList<Session> findAll(Iterable<Long> ids,
			QuerySpec requestParams) {
		// TODO Auto-generated method stub
		throw new UnsupportedOperationException();
	}

	@Override
	public <S extends Session> S save(S entity) {
		// TODO Auto-generated method stub
		throw new UnsupportedOperationException();
	}

	@Override
	public void delete(Long id) {
		// TODO Auto-generated method stub
		throw new UnsupportedOperationException();
		
		
	}
	@Override
	public Session getSessionForUser(Long id) {
		return loginServiceMapper.getSessionForUser(id);
	}
	@Override
	public Class<Session> getResourceClass() {
		// TODO Auto-generated method stub
		return Session.class;
	}
	@Override
	public <S extends Session> S create(S entity) {
		// TODO Auto-generated method stub
		return null;
	}	
	
}
