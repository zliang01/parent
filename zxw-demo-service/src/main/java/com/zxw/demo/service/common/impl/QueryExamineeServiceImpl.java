package com.zxw.demo.service.common.impl;

import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zxw.demo.dao.common.IQueryExamineerDaoService;
import com.zxw.demo.service.common.IQueryExamineeService;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;

@Service("queryExamineeService")
public class QueryExamineeServiceImpl implements IQueryExamineeService {
	private static final Logger logger =  Logger.getLogger(QueryExamineeServiceImpl.class);
	@Autowired
	private IQueryExamineerDaoService queryExamineerDaoService;
	@Override
	public MyOutpt queryExamineeInfo(MyInput input) throws Exception {
		long startTime  = System.currentTimeMillis();
		logger.info("queryExamineeService start startTime = "+startTime);
		
		input.getParams().put("page", Integer.parseInt(input.getPage()));
		input.getParams().put("pageCapacity",Integer.parseInt(input.getPageCapacity()));
		List<Map<String, Object>> result = queryExamineerDaoService.queryExamineeInfo(input.getParams());
		long endTime  = System.currentTimeMillis();
		MyOutpt out = new MyOutpt(result);
		logger.info("queryExamineeService end  endTime = "+(endTime-startTime)+"ms");
		return out;
	}


}
