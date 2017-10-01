package com.zxw.demo.service.common.impl;

import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zxw.demo.dao.common.UserMapper;
import com.zxw.demo.service.common.UserServiceI;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;


@Service("userService")
public class UserServiceImpl implements UserServiceI {
    Logger logger = Logger.getLogger(UserServiceImpl.class); 
    @Autowired
    private UserMapper userMapper;
	@Override
	public MyOutpt save(MyInput input) throws Exception{
		logger.info("UserServiceImpl============================start"+input.toString());
		MyOutpt out = new MyOutpt();
		List<Map<String, Object>> result = null;
		try {
			Map<String, Object> params = input.getParams();
			params.put("staffId", "zhangxuewei");
			result= userMapper.selectByPrimaryKey(params);
		} catch (Exception e) {
			logger.error("save is error e= "+e.getMessage());
			throw e;
			
		}
		if(result ==null){
			logger.error("save is error result is null");
		}
		//out.getBeans().addAll(result);
		return out;
	}
}
