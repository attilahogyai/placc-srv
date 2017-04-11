package com.myplacc.web.config.serializer;

import java.beans.PropertyDescriptor;
import java.io.IOException;
import java.util.List;

import com.fasterxml.jackson.core.JsonGenerator;

public class StringArraySerializer extends Serializer {

	@Override
	public void serilaize(JsonGenerator jgen, PropertyDescriptor pd, Object v,List<String> names)
			throws IOException {
		String[] iarray = (String[]) v;
		jgen.writeArrayFieldStart(pd.getName());
		for (int j = 0; j < iarray.length; j++) {
			jgen.writeString(iarray[j]);
		}
		jgen.writeEndArray();
		names.add(pd.getName());
	}

}
