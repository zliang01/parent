package com.zxw.demo.service.common;

import java.util.Map;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;

public interface IExamineeApplicationService {
	public int  insertExamineeApplication(Map<String,Object> params);
	public int  delExamineeApplication(Map<String,Object> params);
	public MyOutpt queryExamineeApplication(MyInput myInput);
}
