package com.zxw.demo.service.common.impl;

import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zxw.demo.dao.common.IStaffInfoDaoService;
import com.zxw.demo.service.common.IStaffInfoService;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;

@Service("staffInfoService")
public class StaffInfoServiceImpl implements IStaffInfoService {
	private static final Logger logger =  Logger.getLogger(StaffInfoServiceImpl.class);
	private static final int DEFAULT_TOTAL = 0;
	@Autowired
	private IStaffInfoDaoService staffInfoDaoService;
	@Override
	public MyOutpt queryStaffInfo(MyInput input) throws Exception {
		long startTime  = System.currentTimeMillis();
		logger.info("queryStaffInfo start startTime = "+startTime);
		int total = DEFAULT_TOTAL;
		input.getParams().put("page", Integer.parseInt(input.getPage()));
		input.getParams().put("pageCapacity",Integer.parseInt(input.getPageCapacity()));
		List<Map<String, Object>> result = staffInfoDaoService.queryStaffInfo(input.getParams());
		total = staffInfoDaoService.queryStaffInfoTotal(input.getParams());
		long endTime  = System.currentTimeMillis();
		MyOutpt out = new MyOutpt(result);
		out.getBean().put("total", total);
		logger.info("queryStaffInfo end  endTime = "+(endTime-startTime)+"ms");
		return out;
	}
	@Override
	public MyOutpt delStaffInfoById(MyInput input) throws Exception {
		long startTime  = System.currentTimeMillis();
		logger.info("delStaffInfoById start startTime = "+startTime);
		int num  = staffInfoDaoService.delStaffById(input.getParams());
		long endTime  = System.currentTimeMillis();
		MyOutpt out = new MyOutpt();
		if(num==0){
			out.setBusiCode("-9999");
			logger.info("delStaffInfoById is 0 = Params"+input.getParams().toString());
		}
		out.getBean().put("result", num);
		logger.info("delStaffInfoById end  endTime = "+(endTime-startTime)+"ms");
		return out;
	}
	@Override
	public MyOutpt editStaffInfo(MyInput input) throws Exception {
		long startTime  = System.currentTimeMillis();
		logger.info("editStaffInfo start startTime = "+startTime);
		int num  = staffInfoDaoService.editStaffById(input.getParams());
		long endTime  = System.currentTimeMillis();
		MyOutpt out = new MyOutpt();
		if(num==0){
			out.setBusiCode("-9999");
			logger.info("editStaffInfo is 0 = Params"+input.getParams().toString());
		}
		out.getBean().put("result", num);
		logger.info("editStaffInfo end  endTime = "+(endTime-startTime)+"ms");
		return out;
	}
	@Override
	public MyOutpt saveStaffInfo(MyInput input) throws Exception {
		long startTime  = System.currentTimeMillis();
		logger.info("addStaffInfo start startTime = "+startTime);
		int num  = staffInfoDaoService.addStaffInfo(input.getParams());
		long endTime  = System.currentTimeMillis();
		MyOutpt out = new MyOutpt();
		if(num==0){
			out.setBusiCode("-9999");
			logger.info("addStaffInfo is 0 = Params"+input.getParams().toString());
		}
		out.getBean().put("result", num);
		logger.info("addStaffInfo end  endTime = "+(endTime-startTime)+"ms");
		return out; 
	}
	
	

}
