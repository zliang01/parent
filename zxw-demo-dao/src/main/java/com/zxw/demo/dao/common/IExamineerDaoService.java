package com.zxw.demo.dao.common;

import java.util.List;
import java.util.Map;

public interface IExamineerDaoService {
	  public List<Map<String, Object>>  queryExamineeInfo(Map<String,Object> params) throws Exception;
	  public Integer  queryExamineeInfoTotal(Map<String,Object> params) throws Exception;
	  public int  delExamineeByIdCard(Map<String,Object> params) throws Exception;
	  public int  editExamineeByIdCard(Map<String,Object> params) throws Exception;
}
