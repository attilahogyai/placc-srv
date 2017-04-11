package com.myplacc.domain;

public class Metadata implements io.katharsis.response.MetaInformation{
	private Long count;
	private Long totalPages;
	public Long getCount() {
		return count;
	}
	public void setCount(Long count) {
		this.count = count;
	}
	public Long getTotalPages() {
		return totalPages;
	}
	public void setTotalPages(Long totalPages) {
		this.totalPages = totalPages;
	}
	
}
