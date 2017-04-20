package com.myplacc.domain.reservation;


import java.sql.Timestamp;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.myplacc.domain.AbstractEntity;
import com.myplacc.domain.company.Seat;
import com.myplacc.domain.user.Useracc;

import io.katharsis.resource.annotations.JsonApiIncludeByDefault;
import io.katharsis.resource.annotations.JsonApiResource;
import io.katharsis.resource.annotations.JsonApiToOne;

@JsonApiResource(type="reservation")
public class Reservation extends AbstractEntity {
	@JsonApiIncludeByDefault
	@JsonApiToOne
	private Seat seat;	
	private Integer status;
	private Timestamp targetDate;
	
	private Timestamp createDt;
	
	@JsonApiToOne
	private Useracc useracc;
	private Long userId;
	
	public Useracc getUseracc() {
		return useracc;
	}

	public void setUseracc(Useracc useracc) {
		this.useracc = useracc;
	}

	public Seat getSeat() {
		return seat;
	}

	public void setSeat(Seat seat) {
		this.seat = seat;
	}

	public Integer getStatus() {
		return status;
	}

	public void setStatus(Integer status) {
		this.status = status;
	}

	public Timestamp getCreateDt() {
		return createDt;
	}

	public void setCreateDt(Timestamp createDt) {
		this.createDt = createDt;
	}

	public Timestamp getTargetDate() {
		return targetDate;
	}

	public void setTargetDate(Timestamp targetDate) {
		this.targetDate = targetDate;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}
}
