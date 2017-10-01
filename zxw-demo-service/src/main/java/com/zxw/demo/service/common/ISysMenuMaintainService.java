package com.zxw.demo.service.common;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;

public interface ISysMenuMaintainService {
	 public MyOutpt querySysMenu(MyInput input) throws Exception;
}
