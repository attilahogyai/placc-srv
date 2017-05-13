package com.myplacc.domain.company;

import java.sql.Timestamp;
import java.util.List;

import com.myplacc.domain.AbstractEntity;

import io.katharsis.resource.annotations.JsonApiIncludeByDefault;
import io.katharsis.resource.annotations.JsonApiResource;
import io.katharsis.resource.annotations.JsonApiToMany;

@JsonApiResource(type="company")
public class Company extends AbstractEntity {
	private String name;
	private String img;
	private Integer status;
	@JsonApiIncludeByDefault
	@JsonApiToMany
	private List<Building> building;

	private Timestamp createdt;
	
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
	public Timestamp getCreatedt() {
		return createdt;
	}
	public void setCreatedt(Timestamp createdt) {
		this.createdt = createdt;
	}
	public Integer getStatus() {
		return status;
	}
	public void setStatus(Integer status) {
		this.status = status;
	}
	
	
}
