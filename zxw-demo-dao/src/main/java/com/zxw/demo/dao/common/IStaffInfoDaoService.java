package com.zxw.demo.dao.common;

import java.util.List;
import java.util.Map;

public interface IStaffInfoDaoService {
	  public List<Map<String, Object>>  queryStaffInfo(Map<String,Object> params) throws Exception;
	  public Integer  queryStaffInfoTotal(Map<String,Object> params) throws Exception;
	  public int  delStaffById(Map<String,Object> params) throws Exception;
	  public int  editStaffById(Map<String,Object> params) throws Exception;
	  public int  addStaffInfo(Map<String,Object> params) throws Exception;
	  public int  saveBatchStaffInfo(List<Map<String,String>> params) throws Exception;
	  public List<Map<String, Object>>  queryStaffRoleId(Map<String,Object> params) throws Exception;
	  public List<Map<String, Object>>  queryLoginInfoByStaffId(Map<String,Object> params) throws Exception;
}
