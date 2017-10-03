package com.zxw.demo.service.common;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;

public interface IQueryMsgService {
	public MyOutpt queryMsgInfo(MyInput input) throws Exception;
	public MyOutpt insertMsgInfo(MyInput input) throws Exception;
}
