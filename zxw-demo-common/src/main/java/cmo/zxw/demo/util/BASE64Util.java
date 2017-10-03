package cmo.zxw.demo.util;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

import org.apache.log4j.Logger;

import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

public final class BASE64Util {
	private static final Logger LOGGER =  Logger.getLogger(BASE64Util.class);
	/**
	 * 编码
	 * @param str
	 * @return String
	 * @throws UnsupportedEncodingException 
	 */
	public static String encode(String str){
		if(str==null) {
			return null;
		}
		byte[] bStr = null;
		try {
			bStr = str.getBytes("UTF-8");
		} catch (UnsupportedEncodingException e) {
			LOGGER.error("BASE64Util UnsupportedEncodingException", e);
		}
		BASE64Encoder encoder = new BASE64Encoder();
		return encoder.encode(bStr);
	}

	/**
	 * 解码
	 * 
	 * @param str
	 * @return string
	 */
	public static String decode(String str) {
		if(str==null) {
			return null;
		}
		byte[] bt = null;
		try {
			BASE64Decoder decoder = new BASE64Decoder();
			bt = decoder.decodeBuffer(str);
		} catch (IOException e) {
			LOGGER.error("BASE64Util IOException", e);
		}
		return new String(bt);
	}
//	public static void main(String[] args) {
//		String text = null;
//		LOGGER.info(encode(text));
//		LOGGER.info(decode(encode(text)));
//	}
}
