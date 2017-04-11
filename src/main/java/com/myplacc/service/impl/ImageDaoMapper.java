package com.myplacc.service.impl;

import java.util.List;

import com.myplacc.domain.image.Image;
import com.myplacc.domain.image.ImageFilter;

public interface ImageDaoMapper {
	public Image findOne(Long id);
	public Image findByPath(String path);

	
	public List<Image> findAll();
	public List<Image> findForQuery(ImageFilter filter);
	public List<Image> findDefault(ImageFilter filter);
		
	public int insertImage(Image image);
	public int updateImage(Image image);
	
}
