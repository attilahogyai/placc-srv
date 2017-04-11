package com.myplacc.service;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.util.List;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import com.myplacc.domain.dictionary.Langtext;
import com.myplacc.domain.dictionary.LangtextRq;
import com.myplacc.service.impl.LangtextDaoMapper;


public class LangtextDaoTest extends AbstractTest {

	@Before
	public void before() {
		super.before(LangtextDaoMapper.class);
	}
	
	@Test
	public void testGetDictionaryItems() throws Exception {
		LangtextRq request = new LangtextRq();
		request.setLang("en");
		LangtextDaoMapper mapper=(LangtextDaoMapper)getMapper(LangtextDaoMapper.class);
		List<Langtext> items = mapper.findAll();
		assertTrue(items.size() > 1);
		assertNotNull(items);
	}
	@Test
	public void parserTest(){
		LangtextDaoMapper mapper=(LangtextDaoMapper)getMapper(LangtextDaoMapper.class);
		String s=mapper.getText("email", "header", "en");
		Assert.assertNotNull(s);
	}
	
}
