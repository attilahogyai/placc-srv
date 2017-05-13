package com.myplacc.domain.image;

import com.myplacc.domain.AbstractEntity;

import io.katharsis.resource.annotations.JsonApiId;
import io.katharsis.resource.annotations.JsonApiResource;
@JsonApiResource(type="image")
public class Image extends AbstractEntity {

	private static final long serialVersionUID = 2783831027552946943L;
	@JsonApiId
	private Long id;
	private String path;
	private String title;
	private String dominant;
	private Integer type;
	private Integer status;
	private String tag;
	private Integer width;
	private Integer height;
	public boolean isSerialVersionUID(){
		return true;
	}
	public String getPath() {
		return path;
	}
	public void setPath(String path) {
		this.path = path;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getDominant() {
		return dominant;
	}
	public void setDominant(String dominant) {
		this.dominant = dominant;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Integer getType() {
		return type;
	}
	public void setType(Integer type) {
		this.type = type;
	}
	public Integer getStatus() {
		return status;
	}
	public void setStatus(Integer status) {
		this.status = status;
	}
	public String getTag() {
		return tag;
	}
	public void setTag(String tag) {
		this.tag = tag;
	}
	public Integer getWidth() {
		return width;
	}
	public void setWidth(Integer width) {
		this.width = width;
	}
	public Integer getHeight() {
		return height;
	}
	public void setHeight(Integer height) {
		this.height = height;
	}
	

}
