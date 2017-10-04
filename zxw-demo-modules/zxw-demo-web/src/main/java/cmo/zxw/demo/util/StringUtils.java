package cmo.zxw.demo.util;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 字符串工具类
 * 
 */
public final class StringUtils {
	/** Private Constructor **/
	private StringUtils() {
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
	 * 判断字符串是否为null || 空字符串
	 * 
	 * @param param
	 * @return
	 */
	public static boolean isEmpty(String param) {
		return param == null || "".equals(param.trim());
	}
	
	/**
	 * 判断是否为数�?
	 * @param str
	 * @return True为数�?
	 */
	public static boolean isNum(String str) {
		String regex = "^(-?\\d+)(\\.\\d+)?$";
		return matchRegex(str, regex);
	}
	
	private static boolean matchRegex(String value, String regex) {
		Pattern pattern = Pattern.compile(regex);
		Matcher matcher = pattern.matcher(value);
		return matcher.matches();
	}
	
	public  static String listToJson(List<Map<String,Object>> list) {

	StringBuilder sb = new StringBuilder();
	        sb.append("[");
	   for(Map<String,Object> map:list){
		   sb.append("{");
		   Iterator<Entry<String, Object>> iterator = map.entrySet().iterator();
		   while(iterator.hasNext()){
			   Entry<String, Object> entry = iterator.next();
 		sb.append("\"").append(entry.getKey()).append("\":\"").append(entry.getValue())
	                    .append("\"").append(",");
		   }
	        sb.deleteCharAt(sb.lastIndexOf(","));
	        sb.append("},");
	}
	        sb.deleteCharAt(sb.lastIndexOf(","));
	        sb.append("]");
	        return sb.toString();
}

}