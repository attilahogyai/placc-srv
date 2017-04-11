package com.myplacc.config;
import java.util.LinkedList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RequestLog {

	private static Logger LOG = LoggerFactory.getLogger(RequestLog.class);

	private int minReqCount;
	private int thresholdInMs;
	private LinkedList<Long> requestTimes = new LinkedList<Long>();
	
	public RequestLog(int minReqCount, int thresholdInNanos) {
		this.minReqCount = minReqCount;
		if (minReqCount < 2) {
			throw new IllegalArgumentException("The minReqCount must be at least 2");
		}
		this.thresholdInMs = thresholdInNanos;
	}

	public void addEntry() {
		if (requestTimes.size() >= minReqCount) {
			requestTimes.poll();
		}
		long msTime = System.currentTimeMillis();
		Long peekLast = requestTimes.peekLast();
		if (peekLast != null && peekLast > msTime) {
			//Sometimes the new nanotime is less than the last nanotime (the timer restart between the two call)
			//in this situations we reset the buffer
			requestTimes.clear();
		}
		requestTimes.add(msTime);
	}

	public boolean isDos() {
		if (requestTimes.size() < minReqCount) {
			return false;
		}
		int cnt = 0;
		long sumDiff = 0;
		long last = requestTimes.get(0);
		for (int i = 1;i<requestTimes.size();i++) {
			long act = requestTimes.get(i);
			sumDiff += act - last;
			last = act;
			cnt++;
		}
		double avgDiff = sumDiff / (double)cnt;
		LOG.debug("avgDiff: ["+avgDiff+"] < thresholdInMs ["+thresholdInMs+"]");
		if (avgDiff > 0 && avgDiff < thresholdInMs) {
			LOG.warn("DoS detected. avgDiff: " + avgDiff + " Request times (in ms): " + requestTimes+" thresholdInMs:"+thresholdInMs);
			return true;
		}
		return false;
	}

	@Override
	public String toString() {
		return "RequestLog [minReqCount=" + minReqCount + ", thresholdInMillis=" + thresholdInMs + ", requestTimes=" + requestTimes + "]";
	}
	
}
