package com.zxw.demo.dao.common;

import java.util.List;
import java.util.Map;

public interface IQueryUserDaoService {
	  public List<Map<String, Object>>  queryUserInfo(Map<String,Object> params) throws Exception;

}
