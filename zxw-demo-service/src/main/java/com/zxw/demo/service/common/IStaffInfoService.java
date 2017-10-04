package com.zxw.demo.service.common;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;

/**
 * 
 * @author 张学伟
 *获取人员工作内容接口
 */
public interface IStaffInfoService {
	  public MyOutpt queryStaffInfo(MyInput input) throws Exception;
	  public MyOutpt delStaffInfoById(MyInput input) throws Exception;
	  public MyOutpt editStaffInfo(MyInput input) throws Exception;
	  public MyOutpt saveStaffInfo(MyInput input) throws Exception;

}
