package com.zxw.demo.service.common;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;

/**
 * 
 * @author 张学伟
 *获取人员工作内容接口
 */
public interface IExamineeService {
	  public MyOutpt queryExamineeInfo(MyInput input) throws Exception;
	  public MyOutpt delExamineeInfoByIdCard(MyInput input) throws Exception;
	  public MyOutpt editExamineeInfo(MyInput input) throws Exception;

}
