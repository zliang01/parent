package com.zxw.demo.dao.common;

import java.util.List;
import java.util.Map;

public interface IQuickMenuDaoService {
	  public List<Map<String, Object>> queryQuickMenuInfo(Map<String,Object> params) throws Exception;

}
