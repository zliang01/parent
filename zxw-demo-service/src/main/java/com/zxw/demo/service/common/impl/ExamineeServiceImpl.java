package com.zxw.demo.service.common.impl;

import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zxw.demo.dao.common.IExamineerDaoService;
import com.zxw.demo.service.common.IExamineeService;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;

@Service("examineeService")
public class ExamineeServiceImpl implements IExamineeService {
	private static final Logger logger =  Logger.getLogger(ExamineeServiceImpl.class);
	private static final int DEFAULT_TOTAL = 0;
	@Autowired
	private IExamineerDaoService examineerDaoService;
	@Override
	public MyOutpt queryExamineeInfo(MyInput input) throws Exception {
		long startTime  = System.currentTimeMillis();
		logger.info("queryExamineeService start startTime = "+startTime);
		int total = DEFAULT_TOTAL;
		input.getParams().put("page", Integer.parseInt(input.getPage()));
		input.getParams().put("pageCapacity",Integer.parseInt(input.getPageCapacity()));
		 total = examineerDaoService.queryExamineeInfoTotal(input.getParams());
		List<Map<String, Object>> result = examineerDaoService.queryExamineeInfo(input.getParams());
		long endTime  = System.currentTimeMillis();
		MyOutpt out = new MyOutpt(result);
		out.getBean().put("total", total);
		logger.info("queryExamineeService end  endTime = "+(endTime-startTime)+"ms");
		return out;
	}
	@Override
	public MyOutpt delExamineeInfoByIdCard(MyInput input) throws Exception {
		long startTime  = System.currentTimeMillis();
		logger.info("delExamineeInfoByIdCard start startTime = "+startTime);
		int num  = examineerDaoService.delExamineeByIdCard(input.getParams());
		long endTime  = System.currentTimeMillis();
		MyOutpt out = new MyOutpt();
		if(num==0){
			out.setBusiCode("-9999");
			logger.info("delExamineeInfoByIdCard is 0 = Params"+input.getParams().toString());
		}
		out.getBean().put("result", num);
		logger.info("delExamineeInfoByIdCard end  endTime = "+(endTime-startTime)+"ms");
		return out;
	}
	@Override
	public MyOutpt editExamineeInfo(MyInput input) throws Exception {
		long startTime  = System.currentTimeMillis();
		logger.info("editExamineeInfo start startTime = "+startTime);
		int num  = examineerDaoService.editExamineeByIdCard(input.getParams());
		long endTime  = System.currentTimeMillis();
		MyOutpt out = new MyOutpt();
		if(num==0){
			out.setBusiCode("-9999");
			logger.info("editExamineeInfo is 0 = Params"+input.getParams().toString());
		}
		out.getBean().put("result", num);
		logger.info("editExamineeInfo end  endTime = "+(endTime-startTime)+"ms");
		return out;
	}

}
