package com.myplacc.web.config.serializer;

import java.beans.PropertyDescriptor;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.core.JsonGenerator;

public class DateSerializer extends Serializer{
	
	private SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
	
	@Override
	public void serilaize(JsonGenerator jgen, PropertyDescriptor pd, Object v,
			List<String> names) throws IOException {
		String vstring = null;
		if(v!= null){
			vstring = dateFormat.format((Date)v);
		}	
		jgen.writeStringField(pd.getName(), vstring);
		names.add(pd.getName());
	}

}
