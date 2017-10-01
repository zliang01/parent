package com.zxw.demo.service.common.impl;

import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zxw.demo.dao.common.ISysMenuMaintainDaoService;
import com.zxw.demo.service.common.ISysMenuMaintainService;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;
@Service("sysMenuMaintainService")
public class SysMenuMaintainServiceImpl implements ISysMenuMaintainService{
    Logger logger = Logger.getLogger(SysMenuMaintainServiceImpl.class);
    @Autowired
    private ISysMenuMaintainDaoService sysMenuMaintainDaoService;
	@Override
	public MyOutpt querySysMenu(MyInput input) throws Exception {
		long startTime  = System.currentTimeMillis();
		logger.info("querySysMenu start startTime = "+startTime);
		List<Map<String, Object>>  result = sysMenuMaintainDaoService.querySysMenuMaintain(input.getParams());
		long endTime  = System.currentTimeMillis();
		MyOutpt out = new MyOutpt();
		out.setBeans(result);
		logger.info("querySysMenu end endTime = "+(endTime-startTime)+"ms");
		return out;
	}
}
