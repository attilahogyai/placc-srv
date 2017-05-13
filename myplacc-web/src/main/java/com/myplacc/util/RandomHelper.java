package com.myplacc.util;

import java.util.Random;

public class RandomHelper {
	private static Random random=new Random();
    private static final String ALPHA_NUM =  
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
	public static long getRandomLong(long max){
		double rn=random.nextDouble()*max;
		return Math.abs(new Double(rn).longValue());
	}
	public static int getRandomInt(long max){
		double rn=random.nextDouble()*max;
		return Math.abs(new Double(rn).intValue());
	}
    public static String getAlphaNumeric(int len) {  
       StringBuffer sb = new StringBuffer(len);  
       for (int i=0;  i<len;  i++) {  
          int ndx = (int)(getRandomLong(ALPHA_NUM.length()));  
          sb.append(ALPHA_NUM.charAt(ndx));  
       }  
       return sb.toString();  
    }
	
}
