package com.myplacc.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.myplacc.domain.AbstractEntity;
import com.myplacc.domain.dictionary.Langtext;
import com.myplacc.domain.user.Useracc;


@Component
public class MyPlaccObjectMapper extends ObjectMapper {
	public static List<Class<? extends AbstractEntity>> hanledObjects=new ArrayList<Class<? extends AbstractEntity>>();
	static{
		hanledObjects.add(Langtext.class);
		hanledObjects.add(Useracc.class);
		
	}


	private static final long serialVersionUID = -1944677974443954566L;

	public MyPlaccObjectMapper() {
		SimpleModule module = new SimpleModule();
		MyPlaccModelSerializer serializer = new MyPlaccModelSerializer();
		for (Class<? extends AbstractEntity> clazz : hanledObjects) {
			module.addSerializer(clazz, serializer);
		}
		this.registerModule(module);
		this.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
	}
}
