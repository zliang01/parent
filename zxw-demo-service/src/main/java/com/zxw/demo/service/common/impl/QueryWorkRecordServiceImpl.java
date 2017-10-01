package com.zxw.demo.service.common.impl;

import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zxw.demo.dao.common.IQueryWorkRecordDaoService;
import com.zxw.demo.service.common.IQueryWorkRecordService;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;

/**
 * 
 * @author 张学伟
 *获取人员工作内容
 */
@Service("queryWorkRecordService")
public class QueryWorkRecordServiceImpl implements IQueryWorkRecordService {
	private static final Logger logger =  Logger.getLogger(QueryWorkRecordServiceImpl.class);
	@Autowired
	private IQueryWorkRecordDaoService queryWorkRecordDaoService;
	@Override
	public MyOutpt queryWorkRecord(MyInput input) throws Exception {
		long startTime  = System.currentTimeMillis();
		logger.info("queryWorkRecord start  startTime = "+startTime);
		List<Map<String, Object>>  result = queryWorkRecordDaoService.queryWorkRecord(input.getParams());
		long endTime  = System.currentTimeMillis();
		MyOutpt out = new MyOutpt(result);
		logger.info("queryWorkRecord end endTime = "+(endTime-startTime)+"ms");
		return out;
	}

}
