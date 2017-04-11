package com.myplacc.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.sql.Timestamp;
import java.util.Date;

import org.junit.Before;
import org.junit.Test;

import com.myplacc.domain.user.Session;
import com.myplacc.domain.user.Useracc;
import com.myplacc.service.impl.LoginDaoMapper;
import com.myplacc.service.impl.UseraccDaoMapper;

public class LoginDaoTest extends AbstractTest {

	@Before
	public void before() {
		super.before(LoginDaoMapper.class);
	}
	//@Test
	public void testGetSession() throws Exception {
		LoginDaoMapper mapper=(LoginDaoMapper)getMapper(LoginDaoMapper.class);
		UseraccDaoMapper useraccMapper=(UseraccDaoMapper)getMapper(UseraccDaoMapper.class);

		Session item = mapper.getSession("testtoken");
		assertNotNull(item);
		assertNotNull(item.getCode());
		assertNotNull(item.getExpireDate());
		assertNotNull(item.getRemoteIp());
		assertNotNull(item.getUserAgent());
		assertNotNull(item.getValid());
		assertNotNull(item.getCreateDt());
		assertEquals(1, item.getScopes().length);
		
		item.setCode(item.getCode()+"2");
		Date d=new Date();
		item.setCreateDt(d);
		Timestamp t=new Timestamp(new Date().getTime());
		item.setExpireDate(t);
		mapper.insertSession(item);
	    
		
		Useracc user=new Useracc();
		user.setEmail("text@test.hu");
		user.setLogin("testloginqumla");
		user.setScopes(new String[]{"SECUSER"});
		String encoded=useraccMapper.encodePassword("sdfsdfsdfsdf");
		user.setPassword(encoded);
		useraccMapper.insertUser(user);
		
		item.setUseracc(user);
		mapper.updateSession(item);
		
		item = mapper.getSession("testtoken2");
		assertNotNull(item);
		assertTrue(item.getUseracc().getId().equals(user.getId()));
		
		assertTrue(item.getExpireDate().equals(t));
	}
	//@Test
	public void testUser() throws Exception{
		LoginDaoMapper loginMapper=(LoginDaoMapper)getMapper(LoginDaoMapper.class);		
		UseraccDaoMapper useraccMapper=(UseraccDaoMapper)getMapper(UseraccDaoMapper.class);
		
		Useracc user=new Useracc();
		user.setEmail("text@test.hu");
		user.setLogin("testloginqumla");
		user.setScopes(new String[]{"SECUSER"});
		user.setStatus(1);
		String encoded=useraccMapper.encodePassword("sdfsdfsdfsdf");
		user.setPassword(encoded);
		useraccMapper.insertUser(user);

		
		Useracc useracc=loginMapper.getUseraccByLogin("testloginqumla");
		useracc.getPassword().equals(encoded);
		assertEquals(useracc.getScopes().length,1);
		assertEquals(useracc.getPassword(), encoded);
		assertNotNull(useracc);
		assertEquals("text@test.hu", useracc.getEmail());
		
		
		
	}
	
	
	
	
}
