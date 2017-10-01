package com.zxw.demo.service.common.impl;

import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zxw.demo.dao.common.IQuickMenuDaoService;
import com.zxw.demo.service.common.IQuikMenuService;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;
@Service("quickMenuService")
public class QuickMenuServiceImpl implements IQuikMenuService {
	private static final Logger logger =  Logger.getLogger(QuickMenuServiceImpl.class);
	@Autowired
	private IQuickMenuDaoService quickMenuDaoService;
	@Override
	public MyOutpt initquickMenu(MyInput input) throws Exception {
		long startTime  = System.currentTimeMillis();
		logger.info("initquickMenu start  startTime = "+startTime);
		List<Map<String, Object>> result =quickMenuDaoService.queryQuickMenuInfo(input.getParams());
		long endTime  = System.currentTimeMillis();
		logger.info("initquickMenu end endTime = "+(endTime-startTime)+"ms");
		MyOutpt out = new MyOutpt(result);
		return out;
	}


}
