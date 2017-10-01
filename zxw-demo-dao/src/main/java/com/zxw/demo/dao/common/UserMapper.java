package com.zxw.demo.dao.common;

import java.util.List;
import java.util.Map;

public interface UserMapper {
	public List<Map<String, Object>> selectByPrimaryKey(Map<String,Object> params);
}