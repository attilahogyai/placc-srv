package com.myplacc.domain.company;

import java.util.List;

import com.myplacc.domain.AbstractEntity;

import io.katharsis.resource.annotations.JsonApiIncludeByDefault;
import io.katharsis.resource.annotations.JsonApiResource;
import io.katharsis.resource.annotations.JsonApiToMany;

@JsonApiResource(type="company")
public class Company extends AbstractEntity {
	private String name;
	private String img;
	@JsonApiIncludeByDefault
	@JsonApiToMany
	private List<Building> building;
	public List<Building> getBuilding() {
		return building;
	}
	public void setBuilding(List<Building> building) {
		this.building = building;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getImg() {
		return img;
	}
	public void setImg(String img) {
		this.img = img;
	}
	
	
}