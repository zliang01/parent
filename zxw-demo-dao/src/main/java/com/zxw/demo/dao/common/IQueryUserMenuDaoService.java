package com.zxw.demo.dao.common;

import java.util.List;
import java.util.Map;

public interface IQueryUserMenuDaoService {
	public List<Map<String, Object>> queryUserMenu(Map<String, Object> params) throws Exception;
	public List<Map<String, Object>> queryUserSysMenu(Map<String, Object> params) throws Exception;
}
