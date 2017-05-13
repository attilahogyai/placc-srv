package com.myplacc.service;

import com.myplacc.domain.user.Session;
import com.myplacc.domain.user.Useracc;

public interface LoginService {
	public void createUser(Useracc user);
	public Useracc getUseraccByLogin(String name);
	public Useracc getUseraccByEmail(String name);
	
	public Session getSession(String code);
	public void insertSession(Session session);
	public void updateSession(Session session);
	
	public Session updateFingerprint(Session session, String fingerprint);
	public Session getSessionForUser(Long id);
}
