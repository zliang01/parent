package com.zxw.demo.service.common.impl;

import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zxw.demo.dao.common.IInsertWorkRecordDaoService;
import com.zxw.demo.service.common.IInsertWorkRecordService;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;

/**
 * 
 * @author 张学伟
 *获取人员工作内容
 */
@Service("insertWorkRecordService")
public class InsertWorkRecordServiceImpl implements IInsertWorkRecordService {
	private static final Logger logger =  Logger.getLogger(InsertWorkRecordServiceImpl.class);
	@Autowired
	private IInsertWorkRecordDaoService insertWorkRecordDaoService;
	@Override
	public MyOutpt insertWorkRecord(MyInput input) throws Exception {
		long startTime  = System.currentTimeMillis();
		logger.info("insertWorkRecord start  startTime = "+startTime);
		List<Map<String, Object>> result = insertWorkRecordDaoService.insertWorkRecord(input.getParams());
		long endTime  = System.currentTimeMillis();
		MyOutpt out = new MyOutpt(result);
		logger.info("insertWorkRecord end endTime = "+(endTime-startTime)+"ms");
		return out;
	}



}
