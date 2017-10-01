package com.zxw.demo.service.common.impl;

import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zxw.demo.dao.common.IQueryUserDaoService;
import com.zxw.demo.service.common.IQueryUserService;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;

@Service("queryUserService")
public class QueryUserServiceImpl implements IQueryUserService {
	private static final Logger logger =  Logger.getLogger(QueryUserServiceImpl.class);
	@Autowired
	private IQueryUserDaoService queryUserDaoService;
	@Override
	public MyOutpt queryUserService(MyInput input) throws Exception {
		long startTime  = System.currentTimeMillis();
		logger.info("queryUserService start startTime = "+startTime);
		List<Map<String, Object>> result = queryUserDaoService.queryUserInfo(input.getParams());
		long endTime  = System.currentTimeMillis();
		MyOutpt out = new MyOutpt(result);
		logger.info("queryUserService end  endTime = "+(endTime-startTime)+"ms");
		return out;
	}


}
