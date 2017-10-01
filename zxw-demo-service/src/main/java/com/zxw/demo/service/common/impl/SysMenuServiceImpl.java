package com.zxw.demo.service.common.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zxw.demo.dao.common.ISysMenuDaoService;
import com.zxw.demo.service.common.ISysMenuService;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;
@Service("sysMenuService")
public class SysMenuServiceImpl implements ISysMenuService {
    Logger logger = Logger.getLogger(SysMenuServiceImpl.class);  
    @Autowired
    private ISysMenuDaoService sysMenuDaoService;
	@Override
	public MyOutpt initSysMenu(MyInput input) throws Exception {
		logger.info("initSysMenu statr  inputObject = " + input.toString());
		List<Map<String,Object>> result =  sysMenuDaoService.querySysMenuInfo(input.getParams());
		List<Map<String, Object>> sysMenu = getMenu(result,"000",0);
		MyOutpt out =new MyOutpt();
		out.setBeans(sysMenu);
		return out;
	}
	/*
	 * 1.list存放该员工过滤后的所拥有的权限 
	 * 2.parentId属于父节点Id，默认父节点（即根节点是"000"）
	 * 3.1,2,3..属于对应的菜单级数 
	 * 4.每次循环采用递归的方式，把父类Id传入
	 */
	public static List<Map<String, Object>> getMenu(List<Map<String, Object>> list, String parentId, int i) {
		Map<Integer, String> numMap = new HashMap<>();
		numMap.put(1, "first");
		numMap.put(2, "second");
		numMap.put(3, "third");
		numMap.put(4, "forth");
		List<Map<String, Object>> menu = new ArrayList<>();
		for (Map<String, Object> map : list) {
			String pId = map.get("parentid").toString();
			if (parentId.equals(pId)) {
				Map<String, Object> m = new HashMap<>();
				String menuId = map.get("menuid").toString();
				m.put("menuId", map.get("menuid"));
				m.put("menuName", map.get("menuname"));
				if (map.get("menuid") != null) {
					int n = i + 1;
					List<Map<String, Object>> l = getMenu(list, menuId, n);
					if (l != null && !l.isEmpty()) {
						m.put(numMap.get(n) + "Menu", getMenu(list, menuId, n));
					} else {
						m.put("url", map.get("menuurl"));
					}
				}
				menu.add(m);
			}
		}
		return menu;
	}
	
}
