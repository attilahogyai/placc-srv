package com.myplacc.service.impl;

import org.apache.ibatis.annotations.Param;

import com.myplacc.domain.user.Useracc;

public interface UseraccDaoMapper {
	public Useracc findByLoginAndPassword(String opCode, String password);
	public Useracc findUserByGoogleRequestToken(String token);
	public void insertUser(Useracc useracc);
	public void updateUser(Useracc useracc);
	
	public Useracc getUserAccForLogin(String token);
	public Useracc findOne(Long id);
	public Useracc getUserAccForLoginAndPwRequest(@Param("email") String email,@Param("pwChangeRequestId") String pwChangeRequestId);
	public Useracc findByPrivateCodeAndEmail(@Param("privateCode") String code, @Param("email") String email);
	public Useracc findByPrivateCode(@Param("privateCode") String code);
	
	public String encodePassword(@Param("password") String password); 
	public String checkPassword(@Param("password") String password, @Param("encPassword") String encPassword); 
	
	public void delete(Useracc user);
	public Useracc findUserForEmail(@Param("email") String email,@Param("eid") Integer eid);
	public Useracc findUserForLogin(@Param("login") String login,@Param("eid") Integer eid);
	
}
