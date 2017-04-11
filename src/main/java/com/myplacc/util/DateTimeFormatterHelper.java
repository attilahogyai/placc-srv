package com.myplacc.util;

import java.util.Date;
import java.util.Locale;

import org.joda.time.LocalDate;
import org.joda.time.LocalDateTime;
import org.joda.time.LocalTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

public class DateTimeFormatterHelper {
	DateTimeFormatter mediumDate=null;
	DateTimeFormatter mediumDateTime=null;
	DateTimeFormatter mediumTime=null;
	DateTimeFormatter shortTime=null;
	public DateTimeFormatterHelper(Locale l){
		mediumDate=DateTimeFormat.mediumDate().withLocale(l);
		mediumDateTime=DateTimeFormat.mediumDateTime().withLocale(l);
		mediumTime=DateTimeFormat.mediumTime();
		shortTime=DateTimeFormat.shortTime();
	}
	public String date(Date date){
		LocalDate ld=new LocalDate(date);
		return ld.toString(mediumDate);
	}
	public String dateTime(Date date){
		LocalDateTime ld=new LocalDateTime(date);
		return ld.toString(mediumDateTime);
	}
	public String time(Date date){
		LocalTime ld=new LocalTime(date);
		return ld.toString(shortTime);
	}
	
}
