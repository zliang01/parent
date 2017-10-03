package cmo.zxw.demo.util;
import java.text.SimpleDateFormat;

import org.apache.log4j.Logger;

import com.fasterxml.jackson.databind.ObjectMapper;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;
public final class JsonUtil {
	private static final Logger LOGGER =  Logger.getLogger(JsonUtil.class);
	private static ObjectMapper objectMapper = new ObjectMapper();

	
	static {
		objectMapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
	}
	private JsonUtil() {
	}

	public static String convertObject2Json(Object object) {
		try {
			return objectMapper.writeValueAsString(object);
		} catch (Exception e) {
			LOGGER.error("convertObject2Json",e);
		}
		return null;
	}
	public static <T> T convertJson2Object(String json, Class<T> cls) {
		try {
			return objectMapper.readValue(json, cls);
		} catch (Exception e) {
			LOGGER.error("convertJson2Object",e);
		}
		return null;
	}
	public static String inputObjectToJson(MyInput input) {
		try {
			return objectMapper.writeValueAsString(input);
		} catch (Exception e) {
			LOGGER.error("inputObjectToJson",e);
		}
		return null;
	}
	public static String JsonToMyOutput(MyOutpt output) {
		try {
			return objectMapper.writeValueAsString(output);
		} catch (Exception e) {
			LOGGER.error("JsonToMyOutput",e);
		}
		return null;
	}

	public static MyInput json2InputObject(String json) {
		try {
			return objectMapper.readValue(json, MyInput.class);
		} catch (Exception e) {
			LOGGER.error("json2InputObject",e);
		}
		return null;
	}
}
