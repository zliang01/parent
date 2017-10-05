package com.zxw.demo.dao.common;

import java.util.List;
import java.util.Map;

public interface IExamineeApplicationDaoService {
	public int  insertExamineeApplication(List<Map<String,Object>> params);
	public int  delExamineeApplication(List<String> params);
}
