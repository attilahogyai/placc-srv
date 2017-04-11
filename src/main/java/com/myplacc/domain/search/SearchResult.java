package com.myplacc.domain.search;

import com.myplacc.domain.AbstractEntity;

import io.katharsis.resource.annotations.JsonApiResource;
@JsonApiResource(type="searchresult")
public class SearchResult extends AbstractEntity {

	private static final long serialVersionUID = 7593130181919351109L;
	private String type;
	private String title;
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	@Override
	public boolean equals(Object obj) {
		if(!(obj instanceof SearchResult)) return false;
		if(obj == null || ((SearchResult)obj).title==null) return false;
		return ((SearchResult)obj).title.equals(this.title);
	}
	@Override
	public int hashCode() {
		return type.length();
	}
	
}
