package com.zxw.demo.service.common.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zxw.demo.dao.common.IStaffInfoDaoService;
import com.zxw.demo.service.common.IStaffInfoService;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;
import cmo.zxw.demo.util.PasswordHelper;

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
	@Override
	public MyOutpt saveBatchStaffInfo(MyInput input) throws Exception {
		long startTime  = System.currentTimeMillis();
		logger.info("saveBatchStaffInfo start startTime = "+startTime);
		ArrayList<ArrayList<String>> listParam = (ArrayList<ArrayList<String>>)input.getParams().get("Excel");
		 List<Map<String,String>> params = getParams(listParam);
		 if(params.size()>0){
			 params.remove(0);
		 }
		int num  = staffInfoDaoService.saveBatchStaffInfo(params);
		long endTime  = System.currentTimeMillis();
		MyOutpt out = new MyOutpt();
		if(num==0){
			out.setBusiCode("-9999");
			logger.info("saveBatchStaffInfo is 0 = Params"+input.getParams().toString());
		}
		out.getBean().put("result", num);
		logger.info("saveBatchStaffInfo end  endTime = "+(endTime-startTime)+"ms");
		return out; 
	}
	private  List<Map<String,String>> getParams (ArrayList<ArrayList<String>> params) {
		List<Map<String,String>> param = new ArrayList<Map<String,String>>();
		Map<String,String> mapRole =new HashMap<String,String>();
		mapRole.put("系统管理员", "101");
		mapRole.put("评审组", "102");
		mapRole.put("组委会", "103");
		for(ArrayList<String> list:params){
			Map<String,String> map =new HashMap<String,String>();
			if(list.size()!=4){
				continue;	
			}
			map.put("staffId",list.get(0));
			map.put("staffName",list.get(1));
			map.put("staffEmployee",list.get(2));
			map.put("roleId",mapRole.get(list.get(3)));
			map.putAll(PasswordHelper.encryptPassword("111111", list.get(0), ""));
			param.add(map);
		};
		return param;
		
	}
	@Override
	public MyOutpt queryLoginInfoByStaffId(MyInput input) throws Exception {
		long startTime  = System.currentTimeMillis();
		logger.info("queryLoginInfoByStaffId start startTime = "+startTime);
		List<Map<String, Object>> result = staffInfoDaoService.queryLoginInfoByStaffId(input.getParams());
		long endTime  = System.currentTimeMillis();
		MyOutpt out = new MyOutpt(result);
		logger.info("queryStaffInfo end  endTime = "+(endTime-startTime)+"ms");
		return out;
	}
}
