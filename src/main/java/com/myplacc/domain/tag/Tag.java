package com.myplacc.domain.tag;

import com.myplacc.domain.AbstractEntity;

import io.katharsis.resource.annotations.JsonApiId;
import io.katharsis.resource.annotations.JsonApiResource;

@JsonApiResource(type="tag")
public class Tag  extends AbstractEntity {

	private static final long serialVersionUID = -2749572915582271780L;
	@JsonApiId
	private Long id;
	private String tag;
	private int type;
	private int count;
	private String country;
	private String language;
	public boolean isSerialVersionUID(){
		return true;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getTag() {
		return tag;
	}
	public void setTag(String tag) {
		this.tag = tag;
	}
	public int getType() {
		return type;
	}
	public void setType(int type) {
		this.type = type;
	}
	public int getCount() {
		return count;
	}
	public void setCount(int count) {
		this.count = count;
	}
	public String getCountry() {
		return country;
	}
	public void setCountry(String country) {
		this.country = country;
	}
	public String getLanguage() {
		return language;
	}
	public void setLanguage(String language) {
		this.language = language;
	}

}
