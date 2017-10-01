package com.zxw.demo.service.common;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;

/**
 * 
 * @author 张学伟
 *获取系统菜单接口
 */
public interface ISysMenuService {
	  public MyOutpt initSysMenu(MyInput input) throws Exception;
}
