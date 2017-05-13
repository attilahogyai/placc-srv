package com.myplacc.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.myplacc.domain.image.Image;
import com.myplacc.util.TranslationUtil;

import io.katharsis.queryspec.QuerySpec;
import io.katharsis.repository.ResourceRepositoryV2;
import io.katharsis.resource.list.ResourceList;

@Component("imageServiceImpl")
public class ImageServiceImpl extends AbstractService implements ResourceRepositoryV2<Image, Long>{
	private TranslationUtil translationUtil = new TranslationUtil();
	
	@Autowired
	private ImageDaoMapper imageDaoMapper;
	
	@Override
	public Image findOne(Long id, QuerySpec requestParams) {
		return imageDaoMapper.findOne(id);		
	}
	@Override
	public ResourceList<Image> findAll(Iterable<Long> ids,
			QuerySpec requestParams) {
		throw new UnsupportedOperationException();
	}

	@Override
	public ResourceList<Image> findAll(QuerySpec requestParams) {
		return null;
	}

	@Override
	public <S extends Image> S save(S entity) {
		if(entity.getId()==null){
			if(entity.getType()==null){
				entity.setType(0);
			}
			if(entity.getStatus()==null){
				entity.setStatus(2);
			}
			imageDaoMapper.insertImage(entity);
		}else{
			imageDaoMapper.updateImage(entity);
		}
		return entity;
		
	}
	public Image findByPath(String path){
		return imageDaoMapper.findByPath(path);
	}

	@Override
	public void delete(Long id) {
		throw new UnsupportedOperationException();
		
		
	}
	@Override
	public Class<Image> getResourceClass() {
		return Image.class;
	}
	@Override
	public <S extends Image> S create(S entity) {
		// TODO Auto-generated method stub
		return null;
	}

}
