package com.zxw.demo.dao.common;

import java.util.List;
import java.util.Map;

public interface ISysMenuDaoService {
	  public List<Map<String, Object>>  querySysMenuInfo(Map<String,Object> params) throws Exception;
	  public List<Map<String, Object>>  querySysMenuInfoTotal(Map<String,Object> params) throws Exception;

}
