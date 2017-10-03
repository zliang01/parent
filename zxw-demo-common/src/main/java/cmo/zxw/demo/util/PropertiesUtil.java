package cmo.zxw.demo.util;

import java.util.MissingResourceException;
import java.util.ResourceBundle;

import org.apache.log4j.Logger;



/**
 * Parsing The Configuration File
 * 
 */
public final class PropertiesUtil {
	private static final Logger LOGGER =  Logger.getLogger(PropertiesUtil.class);

	private static final String BUNDLE_NAME = "config/serviceCore";
	private static final ResourceBundle RESOURCE_BUNDLE = ResourceBundle
			.getBundle(BUNDLE_NAME);

	private PropertiesUtil() {
	}

	/**
	 * 根据key获取值，key不存在则返回null
	 * 
	 * @param key
	 * @return
	 */
	public static String getString(String key) {
		try {
			return RESOURCE_BUNDLE.getString(key);
		} catch (MissingResourceException e) {
			LOGGER.error("getString is error" ,e);
			return null;
		}
	}

	/**
	 * 根据key获取
	 * 
	 * @param key
	 * @return
	 */
	public static int getInt(String key) {
		return Integer.parseInt(getString(key));
	}
}