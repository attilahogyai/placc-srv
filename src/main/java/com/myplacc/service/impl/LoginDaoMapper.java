package com.myplacc.service.impl;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.myplacc.domain.user.Session;
import com.myplacc.domain.user.Useracc;

public interface LoginDaoMapper {
	public Session getSession(String code);
	public void insertSession(Session session);
	public void updateSession(Session session);
	
	public void updateFingerprint(Session session);
	public Session getSessionFingerprint(String fingerprint);
	public Useracc getUseraccByLogin(@Param("login") String login);
	public Useracc getUseraccByEmail(@Param("email") String login);
	
	public List<Session> getSessionWithoutLocation();
	
	public Session getSessionForUser(Long id);
	
}
