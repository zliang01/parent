package com.zxw.demo.service.common;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;

public interface IQueryUserMenuService {
	public MyOutpt queryUserMenu(MyInput input) throws Exception;
	public MyOutpt queryUserSysMenu(MyInput input) throws Exception;
}
