package com.myplacc.domain.comment;

import java.sql.Timestamp;

import com.myplacc.domain.AbstractQDI;
import com.myplacc.domain.user.Useracc;

import io.katharsis.resource.annotations.JsonApiId;
import io.katharsis.resource.annotations.JsonApiIncludeByDefault;
import io.katharsis.resource.annotations.JsonApiResource;
import io.katharsis.resource.annotations.JsonApiToOne;
@JsonApiResource(type="comment")
public class Comment extends AbstractQDI {
	private static final long serialVersionUID = 6078958491970530963L;
	@JsonApiId
	private Long id;
	private String comment;
	
	private String session;
	@JsonApiIncludeByDefault
	@JsonApiToOne
	private Useracc useracc;

	@JsonApiToOne
	private Comment original;
	private Integer status;
	private Timestamp createdt;
	public Comment() {
		// TODO Auto-generated constructor stub
	}
	public boolean isSerialVersionUID(){
		return true;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getComment() {
		return comment;
	}
	public void setComment(String comment) {
		this.comment = comment;
	}

	public Integer getStatus() {
		return status;
	}
	public void setStatus(Integer status) {
		this.status = status;
	}


	public String getSession() {
		return session;
	}
	public void setSession(String session) {
		this.session = session;
	}
	public Useracc getUseracc() {
		return useracc;
	}
	public void setUseracc(Useracc useracc) {
		this.useracc = useracc;
	}
	public Timestamp getCreatedt() {
		return createdt;
	}
	public void setCreatedt(Timestamp createdt) {
		this.createdt = createdt;
	}
	public Comment getOriginal() {
		return original;
	}
	public void setOriginal(Comment original) {
		this.original = original;
	}


}
