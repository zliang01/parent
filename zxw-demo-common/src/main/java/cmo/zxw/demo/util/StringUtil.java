package cmo.zxw.demo.util;

import java.math.BigDecimal;

public class StringUtil {

	/**
	 * 判断是否是有效的字符串，空串为无效串
	 * 
	 * @param str
	 * @return
	 */
	public static boolean isValidStr(String str) {
		
		return str != null && str.trim().length() > 0;
	}
	/**
	 * 判断字符串是否非null && 非空字符 
	 * 
	 * @param param
	 * @return
	 */
	public static boolean isNotEmpty(String param) {
		return param != null && !"".equals(param.trim());
	}

	/**
	 * convert String object to BigDecimal
	 * 
	 * @param str
	 * @return
	 */
	public static BigDecimal getStrToBigDecimal(String str) {
		BigDecimal result = new BigDecimal(0);
		if (!isValidStr(str)) {
			return result;
		}
		try {
			result = new BigDecimal(str);
		} catch (NumberFormatException e) {
		    e.printStackTrace();
		}
		return result;
	}

   
}
