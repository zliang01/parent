package com.zxw.demo.dao.common;

import java.util.List;
import java.util.Map;

public interface ICommonConstantsDaoService {
	public List<Map<String, Object>>  queryCommonConstants() throws Exception;
	public List<Map<String, Object>>  queryExamSubjects() throws Exception;
}
