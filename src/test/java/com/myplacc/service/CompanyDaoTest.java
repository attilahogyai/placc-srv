package com.myplacc.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import org.junit.Before;
import org.junit.Test;

import com.myplacc.domain.company.Building;
import com.myplacc.domain.company.Company;
import com.myplacc.domain.company.Level;
import com.myplacc.domain.company.Seat;
import com.myplacc.domain.reservation.Reservation;
import com.myplacc.domain.user.Useracc;
import com.myplacc.service.impl.PlaccDaoMapper;

public class CompanyDaoTest extends AbstractTest {
	@Before
	public void before() {
		super.before(CompanyDaoTest.class);
	}
	
	@Test
	public void findAll() throws Exception {
		PlaccDaoMapper mapper=(PlaccDaoMapper)getMapper(PlaccDaoMapper.class);
		List<Company> items = mapper.findAllCompany();
		assertTrue(items.size() > 1);
		assertNotNull(items);
	}

	@Test
	public void findOne() throws Exception {
		PlaccDaoMapper mapper=(PlaccDaoMapper)getMapper(PlaccDaoMapper.class);
		
		// Company test
		Company c = mapper.findOneCompany(Long.valueOf(1));
		assertNotNull(c);
		assertEquals("Dorsum Zrt.", c.getName());
		assertNotNull(c.getImg());
		
		assertEquals(2, c.getBuilding().size());
		
		// Building test
		Building b = mapper.findOneBuilding(Long.valueOf(1));
		assertNotNull(b.getName());
		assertNotNull(b.getLevel());
		assertNotNull(b.getCity());
		assertNotNull(b.getAddress());
		
		
		// Level test
		Level l = mapper.findOneLevel(Long.valueOf(4));
		assertNotNull(l.getName());
		assertNotNull(l.getSeat());
		assertNotNull(l.getSeat().get(0).getName());
		assertNotNull(l.getStatus());
		
	}
	@Test
	public void testReservation(){
		PlaccDaoMapper mapper=(PlaccDaoMapper)getMapper(PlaccDaoMapper.class);
		Reservation r=new Reservation();
		r.setSeat(new Seat(1L));
		r.setUseracc(new Useracc(32L));
		r.setStatus(1);
		r.setCreateDt(new Timestamp((new Date()).getTime()));
		r.setTargetDate(new Timestamp((new Date()).getTime()));
		mapper.prepareReservation(r);
		List<Reservation> reserv=mapper.listReservationsForLevel(4L);
		assertNotNull(reserv);
		assertNotNull(reserv.get(0));
		Reservation re=mapper.findOneReservation(reserv.get(0).getId());
		assertEquals(reserv.get(0).getId(),re.getId());
		assertNotNull(re.getTargetDate());
	}
}
