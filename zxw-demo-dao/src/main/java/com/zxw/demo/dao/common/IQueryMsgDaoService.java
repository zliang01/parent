package com.zxw.demo.dao.common;

import java.util.List;
import java.util.Map;

public interface IQueryMsgDaoService {
	public List<Map<String, Object>> queryMsgInfo() throws Exception;
	public void updateMsgStatus() throws Exception;
	public void insertMsgInfo(Map<String,Object> params) throws Exception;
}
