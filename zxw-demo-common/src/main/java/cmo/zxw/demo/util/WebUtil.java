package cmo.zxw.demo.util;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

public class WebUtil {
	public static Map<Object, Object> getParameterMap(HttpServletRequest request) {
		Map<Object, Object> paraMap = new HashMap<Object, Object>();
		if (request == null) {
			return paraMap;
		}
		
		Enumeration<?> names = request.getParameterNames();
		while (names.hasMoreElements()) {
			String name = (String) names.nextElement();
			String[] values = request.getParameterValues(name);

			/**
			 * be careful of this code. because empty string in oracle is null
			 * value but is empty string in mysql
			 */
			if (values.length == 1) {
				if (StringUtil.isValidStr(values[0])) {
					paraMap.put(name, values[0]);
				} else {
					paraMap.put(name, null);
				}
			} else {
				paraMap.put(name, values);
			}
		}
		
		paraMap.put("session_id", request.getSession().getId());
		
		return paraMap;
	}
	
}
