package com.zxw.demo.service.common.impl;

import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zxw.demo.dao.common.IQueryUserMenuDaoService;
import com.zxw.demo.service.common.IQueryUserMenuService;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;

@Service("queryUserMenuService")
public class QueryUserMenuServiceImpl implements IQueryUserMenuService{
	Logger logger = Logger.getLogger(QueryUserMenuServiceImpl.class);
	@Autowired
	private IQueryUserMenuDaoService userMenuDaoService;
	@Override
	public MyOutpt queryUserMenu(MyInput input) throws Exception {
		logger.info("queryUserMenu statr  inputObject = " + input.toString());
		List<Map<String, Object>> list = userMenuDaoService.queryUserMenu(input.getParams());
		MyOutpt out =new MyOutpt();
		out.setBeans(list);
		return out;
	}
	
	@Override
	public MyOutpt queryUserSysMenu(MyInput input) throws Exception {
		logger.info("queryUserSysMenu statr  inputObject = " + input.toString());
		List<Map<String, Object>> list = userMenuDaoService.queryUserSysMenu(input.getParams());
		MyOutpt out =new MyOutpt();
		out.setBeans(list);
		return out;
	}
	
}
