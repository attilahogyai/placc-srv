package com.myplacc.service.impl;

import java.util.Properties;

import org.apache.ibatis.executor.Executor;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.plugin.Intercepts;
import org.apache.ibatis.plugin.Invocation;
import org.apache.ibatis.plugin.Plugin;
import org.apache.ibatis.plugin.Signature;
import org.apache.ibatis.session.ResultHandler;
import org.apache.ibatis.session.RowBounds;
import org.apache.log4j.Logger;

import com.myplacc.domain.AbstractRq;


/**
 * @author barnabas.peter
 * 
 *  Interceptor for MyBatis queries
 *
 */
@Intercepts({ @Signature(type = Executor.class, method = "query", args = {
		MappedStatement.class, Object.class, RowBounds.class,
		ResultHandler.class }) })
public class MyBatisQueryInterceptor implements Interceptor {

	private static final Logger logger = Logger
			.getLogger(MyBatisQueryInterceptor.class);

	@Override
	public Object intercept(Invocation invocation) throws Throwable {
		if (logger.isDebugEnabled()) {
			
			MappedStatement mp = (MappedStatement) invocation.getArgs()[0];
			logger.debug("Executing query:"
					+ mp.getSqlSource().getBoundSql(invocation.getArgs()[1])
							.getSql());
		}

		long startTime = System.nanoTime();
		Object result = invocation.proceed();
		Object [] args=invocation.getArgs();
		long stopTime = System.nanoTime();

		if (logger.isDebugEnabled()) {
			logger.debug("Query duration: " + (stopTime - startTime) / 1000000
					+ "ms");
		}
		
		AbstractRq rq=null;
		for (int i = 0; i < args.length; i++) {
			if(args[i] instanceof AbstractRq){
				rq=(AbstractRq)args[i];
				break;
			}
		}
//		if(result instanceof List){
//			Iterator<AbstractQDI> it=((List)result).iterator();
//			while (it.hasNext()) {
//				AbstractQDI o=it.next();
//				if(o instanceof IAuthorized && 
//						!rq.getAuthorizationInfo().getPermissions().contains(((IAuthorized)o).getRole())){
//					it.remove();
//				}
//			}
//		}
		return result;
	}

	@Override
	public Object plugin(Object target) {
		return Plugin.wrap(target, this);
	}

	@Override
	public void setProperties(Properties properties) {
		// TODO Auto-generated method stub

	}

}
