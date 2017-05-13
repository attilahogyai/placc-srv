package com.myplacc.service.impl;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.myplacc.domain.dictionary.Langtext;

public interface LangtextDaoMapper {
	public Langtext findOne(Long id);
	public String getText(@Param("type") String type,@Param("code") String code,@Param("lang") String lang);
	public long getCount();
	public List<Langtext> findAll();
	public void update(Langtext l);
	public void insert(Langtext l);
	public void delete(Long l);
}
