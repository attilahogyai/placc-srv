package com.myplacc.domain.company;

import java.util.List;

import com.myplacc.domain.AbstractEntity;

import io.katharsis.resource.annotations.JsonApiId;
import io.katharsis.resource.annotations.JsonApiIncludeByDefault;
import io.katharsis.resource.annotations.JsonApiResource;
import io.katharsis.resource.annotations.JsonApiToMany;
import io.katharsis.resource.annotations.JsonApiToOne;

@JsonApiResource(type="building")
public class Building extends AbstractEntity {
	@JsonApiId
	private Long id;
	private String name;
	private String img;
	private String address;
	private String city;
	@JsonApiIncludeByDefault
    @JsonApiToOne
	private Company company;
	@JsonApiIncludeByDefault
	@JsonApiToMany
	private List<Level> level;
	private Integer status;
	
	public Company getCompany() {
		return company;
	}
	public void setCompany(Company company) {
		this.company = company;
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
	public List<Level> getLevel() {
		return level;
	}
	public void setLevel(List<Level> level) {
		this.level = level;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String getCity() {
		return city;
	}
	public void setCity(String city) {
		this.city = city;
	}
	public Integer getStatus() {
		return status;
	}
	public void setStatus(Integer status) {
		this.status = status;
	}
}
