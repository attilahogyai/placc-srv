package com.myplacc.domain;

public class PagingFilter {

	long perPage;
	long offset;
	long limit;
	long id;
	String query;
	String language;
	boolean popular;
	boolean international;
	String countryCode;
	String filterLanguage;
	
	public PagingFilter(String country){
		if(country==null){
			throw new RuntimeException("country cannot be null");
		}
		this.countryCode=country;
	}
	
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}
	public long getOffset() {
		return offset;
	}

	public void setOffset(long offset) {
		this.offset = offset;
	}

	public long getLimit() {
		return limit;
	}

	public void setLimit(long limit) {
		this.limit = limit;
	}

	public long getPerPage() {
		return perPage;
	}

	public void setPerPage(long perPage) {
		this.perPage = perPage;
	}

	public String getQuery() {
		return query;
	}

	public void setQuery(String query) {
		this.query = query;
	}

	public boolean isPopular() {
		return popular;
	}

	public void setPopular(boolean popular) {
		this.popular = popular;
	}

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public boolean isInternational() {
		
		return international;
	}

	public void setInternational(boolean international) {
		this.international = international;
	}

	public String getCountryCode() {
		return countryCode;
	}

	public void setCountryCode(String countryCode) {
		this.countryCode = countryCode;
	}

	public String getFilterLanguage() {
		return filterLanguage;
	}

	public void setFilterLanguage(String filterLanguage) {
		this.filterLanguage = filterLanguage;
	}

}
