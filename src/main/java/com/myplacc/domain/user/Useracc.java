package com.myplacc.domain.user;

import io.katharsis.resource.annotations.JsonApiResource;

import java.util.Date;

import com.myplacc.domain.AbstractEntity;
import com.myplacc.domain.Hidden;
import com.myplacc.domain.Sensible;
@JsonApiResource(type="useracc")
public class Useracc extends AbstractEntity implements Sensible {
		private static final long serialVersionUID = -7130151346959727437L;
		private transient boolean sensible=true;
		private String login;
		private String name;
		@Hidden
		private String email;
		@Hidden
		private String password;
		@Hidden
		private Integer status=0;
		@Hidden
		private String privateCode;
		@Hidden
		private Date lastLogin;
		@Hidden
		private Integer gender;
		@Hidden
		private Integer provider=0;
	
		@Hidden
		private Long usedStorage;
		@Hidden
		private Integer newsletter;
		@Hidden
		private String language;
		@Hidden
		private Date modifyDt;
		@Hidden
		private boolean image;
		@Hidden
		private String phone;
		
		private String[] scopes;
		@Hidden
		private String pwChangeRequest;
		
		private Integer imagec = 0;
		
		private Integer profession;
		
		private String hash;
		@Hidden
		private String facebookRefreshToken;
		@Hidden
		private String googleRefreshToken;
		@Hidden
		private String facebookAccessToken;
		@Hidden
		private String googleAccessToken;
		

		public String[] getScopes() {
			return scopes;
		}

		public void setScopes(String[] scopes) {
			this.scopes = scopes;
		}

		public Useracc() {
		}
		public Useracc(Long id) {
			this.id=id;
		}

		public Useracc(String login, String name, String email) {
			this.login = login;
			this.name = name;
			this.email = email;
		}

		public String getLogin() {
			return this.login;
		}

		public void setLogin(String login) {
			this.login = login;
		}

		public String getName() {
			return this.name;
		}

		public void setName(String name) {
			this.name = name;
		}

		public String getEmail() {
			return this.email;
		}

		public void setEmail(String email) {
			this.email = email;
		}
		public String getPassword() {
			return password;
		}

		public void setPassword(String password) {
			this.password = password;
		}
		public Integer getStatus() {
			return status;
		}

		public void setStatus(Integer status) {
			this.status = status;
		}
		public String getPrivateCode() {
			return privateCode;
		}

		public void setPrivateCode(String privateCode) {
			this.privateCode = privateCode;
		}
		public Date getLastLogin() {
			return lastLogin;
		}

		public void setLastLogin(Date lastLogin) {
			this.lastLogin = lastLogin;
		}
		public Integer getGender() {
			return gender;
		}

		public void setGender(Integer gender) {
			this.gender = gender;
		}
		public Integer getProvider() {
			return provider;
		}

		public void setProvider(Integer provider) {
			this.provider = provider;
		}
		
		public Integer getNewsletter() {
			return newsletter;
		}

		public void setNewsletter(Integer newletter) {
			this.newsletter = newletter;
		}
		public String getLanguage() {
			return language;
		}

		public void setLanguage(String language) {
			this.language = language;
		}
		public Long getUsedStorage() {
			return usedStorage;
		}

		public void setUsedStorage(Long usedStorage) {
			this.usedStorage = usedStorage;
		}
		
		public Date getModifyDt() {
			return modifyDt;
		}

		public void setModifyDt(Date modifyDt) {
			this.modifyDt = modifyDt;
		}

		
		public boolean isSensible() {
			return sensible;
		}
		public void setSensible(boolean sensible) {
			this.sensible = sensible;
		}
		public String getPwChangeRequest() {
			return pwChangeRequest;
		}

		public void setPwChangeRequest(String pwChangeRequest) {
			this.pwChangeRequest = pwChangeRequest;
		}

		public String getPhone() {
			return phone;
		}

		public void setPhone(String phone) {
			this.phone = phone;
		}

		public Integer getImagec() {
			return imagec;
		}
		
		public void incrementImagec(){
			this.imagec++;
		}
		public void setImagec(Integer imagec) {
			this.imagec = imagec;
		}

		public Integer getProfession() {
			return profession;
		}

		public void setProfession(Integer profession) {
			this.profession = profession;
		}

		public String getHash() {
			return hash;
		}

		public void setHash(String hash) {
			this.hash = hash;
		}

		public String getFacebookRefreshToken() {
			return facebookRefreshToken;
		}

		public void setFacebookRefreshToken(String facebookRefreshToken) {
			this.facebookRefreshToken = facebookRefreshToken;
		}

		public String getGoogleRefreshToken() {
			return googleRefreshToken;
		}

		public void setGoogleRefreshToken(String googleRefreshToken) {
			this.googleRefreshToken = googleRefreshToken;
		}

		public String getFacebookAccessToken() {
			return facebookAccessToken;
		}

		public void setFacebookAccessToken(String facebookAccessToken) {
			this.facebookAccessToken = facebookAccessToken;
		}

		public String getGoogleAccessToken() {
			return googleAccessToken;
		}

		public void setGoogleAccessToken(String googleAccessToken) {
			this.googleAccessToken = googleAccessToken;
		}

		public boolean getImage() {
			return image;
		}

		public void setImage(boolean image) {
			this.image = image;
		}

		
	}

