package com.zxw.demo.service.common.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zxw.demo.dao.common.ICommonConstantsDaoService;
import com.zxw.demo.service.common.ICommonConstantsService;

import cmo.zxw.demo.util.CacheUtil;
import cmo.zxw.demo.util.ConstantsUtil;

@Service("commonConstantsService")
public class CommonConstantsServiceImpl implements ICommonConstantsService{
	private static final Logger LOGGER =  Logger.getLogger(CommonConstantsServiceImpl.class);
	@Autowired
	private ICommonConstantsDaoService commonConstantsDao;
	@Override
	@PostConstruct
	public void queryCommonConstants() throws Exception {
		LOGGER.info("------加载静态数据Start------");
		Map<String, Object> result = new HashMap<>();
		List<Map<String, Object>> result1 = commonConstantsDao.queryCommonConstants();
		List<Map<String, Object>> result2 = commonConstantsDao.queryExamSubjects();
		result.put(ConstantsUtil.COMMONCONTANTS, result1);
		result.put(ConstantsUtil.EXAMSUBJECTS, result2);
		new CacheUtil(result);
		LOGGER.info("------加载静态数据End------");
	}

}
