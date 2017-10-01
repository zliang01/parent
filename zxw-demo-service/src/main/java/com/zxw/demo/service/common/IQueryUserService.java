package com.zxw.demo.service.common;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;

/**
 * 
 * @author 张学伟
 *获取人员工作内容接口
 */
public interface IQueryUserService {
	  public MyOutpt queryUserService(MyInput input) throws Exception;


}
