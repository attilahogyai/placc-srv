package com.myplacc.domain.company;

import com.myplacc.domain.AbstractEntity;

import io.katharsis.resource.annotations.JsonApiResource;
import io.katharsis.resource.annotations.JsonApiToOne;

@JsonApiResource(type="seat")
public class Seat extends AbstractEntity {
	@JsonApiToOne
	private Level level;
	private Integer capacity;
	private String name;
	private String img;
	private Integer code;
	private Integer reservationCount;
	private Integer myReservationCount;

	public Seat(){
		
	}
	public Seat(Long id){
		this.id = id;
	}	
	public Level getLevel() {
		return level;
	}
	public void setLevel(Level level) {
		this.level = level;
	}
	public Integer getCapacity() {
		return capacity;
	}
	public void setCapacity(Integer capacity) {
		this.capacity = capacity;
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
	public Integer getReservationCount() {
		return reservationCount;
	}
	public void setReservationCount(Integer reservationCount) {
		this.reservationCount = reservationCount;
	}
	public Integer getCode() {
		return code;
	}
	public void setCode(Integer code) {
		this.code = code;
	}
	public Integer getMyReservationCount() {
		return myReservationCount;
	}
	public void setMyReservationCount(Integer myReservationCount) {
		this.myReservationCount = myReservationCount;
	}
}
