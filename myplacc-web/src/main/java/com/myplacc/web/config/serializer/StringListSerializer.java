package com.myplacc.web.config.serializer;

import java.beans.PropertyDescriptor;
import java.io.IOException;
import java.util.List;

import com.fasterxml.jackson.core.JsonGenerator;

public class StringListSerializer extends Serializer {

	@Override
	public void serilaize(JsonGenerator jgen, PropertyDescriptor pd, Object v,List<String> names)
			throws IOException {
		List<String> list = (List<String>) v;
		jgen.writeArrayFieldStart(pd.getName());
		if(list!=null){
			for (String s:list) {
				jgen.writeString(s);
			}
		}
		jgen.writeEndArray();
		names.add(pd.getName());
	}

}
