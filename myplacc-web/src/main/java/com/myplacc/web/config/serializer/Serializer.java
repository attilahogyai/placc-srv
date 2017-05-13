package com.myplacc.web.config.serializer;

import java.beans.PropertyDescriptor;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonGenerator;
import com.myplacc.domain.AbstractEntity;
import com.myplacc.domain.dictionary.Langtext;

public abstract class Serializer {
	final Logger log = LoggerFactory.getLogger(Serializer.class);
	public static final Map<Class,Serializer> typeMap = new HashMap<Class,Serializer>();
	static {
		typeMap.put(String.class,new StringSerializer());
		typeMap.put(Date.class,new DateSerializer());
		typeMap.put(BigDecimal.class,new BigDecimalSerializer());
		typeMap.put(Timestamp.class,new ObjectSerializer());
		typeMap.put(java.lang.Integer.class,new IntegerSerializer());
		typeMap.put(java.lang.Long.class,new LongSerializer());
		typeMap.put(String[].class,new StringArraySerializer());
		typeMap.put(Integer[].class,new IntegerArraySerializer());
		typeMap.put(Float.class,new FloatSerializer());
		typeMap.put(List.class,new StringListSerializer());
		typeMap.put(ArrayList.class,new StringListSerializer());
		typeMap.put(Boolean.class,new BooleanSerializer());
		typeMap.put(boolean.class,new BooleanSerializer());
		
	}
	public static Serializer get(Class<?> type){
		if(typeMap.containsKey(type)){
			return typeMap.get(type);
		}
		return null;
	}
	public abstract void serilaize(JsonGenerator jgen,PropertyDescriptor pd, Object v,List<String> names) throws IOException;
	public void serilaize(Object originalValue,JsonGenerator jgen) throws IOException {
		
	}
	protected void fillJsonFromEntity(JsonGenerator jgen,
			PropertyDescriptor property, Object v,List<String> names)
			throws IOException {
		AbstractEntity entity=((AbstractEntity) v);
		setId(jgen,property,entity,names);
// TODO refactor with common bean utils 
		//		if(log.isTraceEnabled()){
//			log.trace("set name "+property.getName()+"="+entity.getCode());
//		}
//		jgen.writeStringField(property.getName(),entity.getCode());
		names.add(property.getName());
	}
	protected void setId(JsonGenerator jgen,PropertyDescriptor property, AbstractEntity e,List<String> names) throws IOException{
		// get by reflection I had to remove ID from abstractentity bacause of Katharsis jsonapi
//		if(e.getId()!=null){
//			if(log.isTraceEnabled()){
//				log.trace("set id "+property.getName()+"Id="+e.getId());
//			}
//			String name=property.getName().concat("Id");
//			names.add(name);
//			jgen.writeNumberField(name,e.getId());
//		}else{
//			if(log.isTraceEnabled()){
//				log.trace("set null "+property.getName()+"Id");
//			}
//			jgen.writeNullField(property.getName()+"Id");
//		}
	}
}
