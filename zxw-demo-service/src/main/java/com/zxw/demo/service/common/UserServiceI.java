package com.zxw.demo.service.common;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;

public interface UserServiceI {
	
	public MyOutpt save(MyInput input) throws Exception;
}
