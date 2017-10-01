package cmo.zxw.demo.util;
import java.text.SimpleDateFormat;

import com.fasterxml.jackson.databind.ObjectMapper;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;
public final class JsonUtil {
	private static ObjectMapper objectMapper = new ObjectMapper();

	
	static {
		objectMapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
	}
	private JsonUtil() {
	}

	public static String convertObject2Json(Object object) {
		String method = "convertObject2Json";
		try {
			return objectMapper.writeValueAsString(object);
		} catch (Exception e) {
			System.out.println("convertObject2Json"+e.getMessage());
		}
		return null;
	}
	public static <T> T convertJson2Object(String json, Class<T> cls) {
		String method = "convertJson2Object";
		try {
			return objectMapper.readValue(json, cls);
		} catch (Exception e) {
			System.out.println("convertJson2Object"+e.getMessage());		}
		return null;
	}
	public static String inputObjectToJson(MyInput input) {
		String method = "inputToJson";
		try {
			return objectMapper.writeValueAsString(input);
		} catch (Exception e) {
			System.out.println("inputObject2Json"+e.getMessage());
		}
		return null;
	}
	public static String JsonToMyOutput(MyOutpt output) {
		String method = "MyOutputToJson";
		try {
			return objectMapper.writeValueAsString(output);
		} catch (Exception e) {
			System.out.println("MyOutputToJson"+e.getMessage());
		}
		return null;
	}

	public static MyInput json2InputObject(String json) {
		String method = "jsonToInput";
		try {
			return objectMapper.readValue(json, MyInput.class);
		} catch (Exception e) {
			System.out.println("json2InputObject"+e.getMessage());
		}
		return null;
	}
}
