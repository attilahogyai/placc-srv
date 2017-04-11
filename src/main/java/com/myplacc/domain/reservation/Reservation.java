package com.myplacc.domain.reservation;

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
	@JsonApiIncludeByDefault
	@JsonApiToOne
	private Useracc useracc;

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
}
