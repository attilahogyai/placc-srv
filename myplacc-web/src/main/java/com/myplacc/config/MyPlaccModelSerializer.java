package com.myplacc.config;

import java.beans.PropertyDescriptor;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.beanutils.PropertyUtilsBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.myplacc.domain.AbstractEntity;
import com.myplacc.domain.AbstractQDI;
import com.myplacc.domain.Hidden;
import com.myplacc.domain.Sensible;
import com.myplacc.web.config.serializer.Serializer;

public class MyPlaccModelSerializer extends JsonSerializer<AbstractEntity> {
	private static final Logger log = LoggerFactory.getLogger(MyPlaccModelSerializer.class);
	private PropertyUtilsBean propertyUtils = new PropertyUtilsBean();
	
//	public static final Set<Class> simpleSet = new HashSet<Class>();
//	static {
//		simpleSet.add(String.class);
//		simpleSet.add(Date.class);
//		simpleSet.add(BigDecimal.class);
//		simpleSet.add(Timestamp.class);
//		simpleSet.add(java.util.Date.class);
//		simpleSet.add(java.lang.Integer.class);
//		simpleSet.add(java.lang.Long.class);
//		simpleSet.add(String[].class);
//		simpleSet.add(Integer[].class);
//		simpleSet.add(Float.class);
//	}

	protected void serializeSimpleProperties(Object value, JsonGenerator jgen,
			SerializerProvider provider) throws JsonGenerationException,
			IllegalAccessException, InvocationTargetException,
			NoSuchMethodException, IOException {

		if(log.isTraceEnabled()){
			log.trace("serialize [" + value.getClass() + "] ");
		}
		PropertyDescriptor[] properties = PropertyUtils
				.getPropertyDescriptors(value.getClass());
	
		
		List <String> notEmptyFields= new ArrayList<String>();
		boolean sensible=false;
		if(value instanceof Sensible){
			sensible=((Sensible)value).isSensible();
		}
		for (int i = 0; i < properties.length; i++) {
			Class type = properties[i].getPropertyType();
			Object v = propertyUtils
					.getProperty(value, properties[i].getName());
			Hidden hidden=null;
			try {
				hidden = value.getClass().getDeclaredField(properties[i].getName()).getAnnotation(Hidden.class);
			} catch (NoSuchFieldException e) {
			} catch (SecurityException e) {
			}
			if(sensible && hidden!=null){
				continue;
			}
			if (v == null) {
				if(!notEmptyFields.contains(properties[i].getName())){
					if(log.isTraceEnabled()){
						log.trace("set null for [" + properties[i].getName() + "] ");
					}
					jgen.writeNullField(properties[i].getName());
				}
				continue;
			}
			Serializer serializer=Serializer.get(type);
			if(serializer!=null){
				serializer.serilaize(jgen, properties[i], v,notEmptyFields);
			}
		}
	}
	
	@Override
	public void serialize(AbstractEntity value, JsonGenerator jgen,
			SerializerProvider provider) throws IOException,
			JsonProcessingException {
		jgen.writeStartObject();
		try {
			serializeSimpleProperties(value, jgen, provider);
		} catch (Exception e) {
			log.error("error",e);
		}
        jgen.writeEndObject();
	}
	
}
