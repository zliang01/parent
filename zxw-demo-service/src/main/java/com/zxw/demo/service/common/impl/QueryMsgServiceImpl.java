package com.zxw.demo.service.common.impl;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zxw.demo.dao.common.IQueryMsgDaoService;
import com.zxw.demo.service.common.IQueryMsgService;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;
import cmo.zxw.demo.util.DateUtil;

@Service("queryMsgService")
public class QueryMsgServiceImpl implements IQueryMsgService{
	Logger logger = Logger.getLogger(QueryUserMenuServiceImpl.class);
	@Autowired
	private IQueryMsgDaoService msgDaoService;
	@Override
	public MyOutpt queryMsgInfo(MyInput input) throws Exception {
		logger.info("queryMsgInfo statr  inputObject = " + input.toString());
		List<Map<String, Object>> list = msgDaoService.queryMsgInfo();
		MyOutpt out =new MyOutpt();
		out.setBeans(list);
		return out;
	}

	@Override
	public MyOutpt insertMsgInfo(MyInput input) throws Exception {
		logger.info("insertMsgInfo statr  inputObject = " + input.toString());
		Map<String,Object> params = input.getParams();
		params.put("status", "0");
		params.put("createTime", DateUtil.getDateStrByFmt(new Date(), "yyyy-MM-dd HH:mm:ss"));
		msgDaoService.updateMsgStatus();
		msgDaoService.insertMsgInfo(params);
		MyOutpt out =new MyOutpt();
		return out;
	}  
	
}
  
