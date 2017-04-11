package com.myplacc.domain.user;

import java.util.Date;

import com.myplacc.domain.AbstractEntity;

import io.katharsis.resource.annotations.JsonApiResource;

@JsonApiResource(type="subscription")
public class Subscription extends AbstractEntity{
	private Session session;
	private String email;
	private Integer useracc;
	private Integer question;
	private String category;
	private Date lastChangeDt;
	private Date lastNotificationSentDt;

	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public Integer getUseracc() {
		return useracc;
	}
	public void setUseracc(Integer useracc) {
		this.useracc = useracc;
	}
	public Integer getQuestion() {
		return question;
	}
	public void setQuestion(Integer question) {
		this.question = question;
	}
	public String getCategory() {
		return category;
	}
	public void setCategory(String category) {
		this.category = category;
	}
	public Date getLastChangeDt() {
		return lastChangeDt;
	}
	public void setLastChangeDt(Date lastChangeDt) {
		this.lastChangeDt = lastChangeDt;
	}
	public Date getLastNotificationSentDt() {
		return lastNotificationSentDt;
	}
	public void setLastNotificationSentDt(Date lastNotificationSentDt) {
		this.lastNotificationSentDt = lastNotificationSentDt;
	}
	public Session getSession() {
		return session;
	}
	public void setSession(Session session) {
		this.session = session;
	}
}
