package com.myplacc.domain;

import io.katharsis.resource.annotations.JsonApiId;


public class AbstractEntity {
	@JsonApiId
	protected Long id;
	private static final long serialVersionUID = 1L;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	
}
