package com.myplacc.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.myplacc.domain.company.Company;

import io.katharsis.queryParams.QueryParams;
import io.katharsis.repository.ResourceRepository;
@Component("companyServiceImpl")
public class CompanyServiceImpl extends AbstractService implements ResourceRepository<Company, Long>{
	@Autowired
	private PlaccDaoMapper placcDaoMapper;
	@Override
	public Company findOne(Long id, QueryParams queryParams) {
		return placcDaoMapper.findOneCompany(id);
	}

	@Override
	public Iterable<Company> findAll(QueryParams queryParams) {
		return placcDaoMapper.findAllCompany();
	}

	@Override
	public Iterable<Company> findAll(Iterable<Long> ids, QueryParams queryParams) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public <S extends Company> S save(S entity) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void delete(Long id) {
		// TODO Auto-generated method stub
		
	}

}
