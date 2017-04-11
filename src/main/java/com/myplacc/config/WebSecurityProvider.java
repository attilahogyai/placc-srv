package com.myplacc.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
@Component
public class WebSecurityProvider implements AuthenticationProvider {
	
	@Override
	public Authentication authenticate(Authentication authentication)
			throws AuthenticationException {
		String loginname = (String) authentication.getPrincipal();
		String password = (String) authentication.getCredentials();
		if(loginname.equals("teszt")){
			List<GrantedAuthority> grantedAuths = new ArrayList<>();
			grantedAuths.add(new SimpleGrantedAuthority("ROLE_USER"));
			return new UsernamePasswordAuthenticationToken(loginname,password,grantedAuths);
		}else{
			throw new BadCredentialsException("user not found");
		}
	}

	@Override
	public boolean supports(Class<?> authentication) {
		return authentication.equals(UsernamePasswordAuthenticationToken.class);
	}

}
