package com.zxw.demo.service.common;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;

public interface ICommonConstantsService {
	public void  queryCommonConstants() throws Exception;
	public MyOutpt  getCommonConstants(MyInput input) throws Exception;
}
