package cmo.zxw.demo.util;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.EnumMap;

import javax.imageio.ImageIO;

import org.apache.log4j.Logger;

import com.google.zxing.Binarizer;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.DecodeHintType;
import com.google.zxing.LuminanceSource;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.NotFoundException;
import com.google.zxing.Result;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
/**
 * 通过google的zxing解析二维码
 * @author tskk
 * @version 2015-6-26 13:30:20
 * 注：此代码，不能解析：L纠错级别带logo和H级别的解析
 * */
public final class DecodeQRCode {
	private static final Logger LOGGER =  Logger.getLogger(DecodeQRCode.class);
	//二维码格式参数
	private static final EnumMap<DecodeHintType, Object> hints = new EnumMap<DecodeHintType, Object>(DecodeHintType.class);
	static{
		hints.put(DecodeHintType.CHARACTER_SET, "UTF-8");
	}
	/**
	 * 解析二维码，使用google的zxing
	 * @param imgPath 二维码路径
	 * @return content 二维码内容
	 * */
	public static String decodeImg(File imgFile){
		String content = null;
		if(!imgFile.isFile()){
			LOGGER.error("输入非文件");
			return null;
		}
		try {
			BufferedImage image = ImageIO.read(imgFile);
			LuminanceSource source = new BufferedImageLuminanceSource(image);
			Binarizer binarizer = new HybridBinarizer(source);
			BinaryBitmap binaryBitmap = new BinaryBitmap(binarizer);
			MultiFormatReader reader = new MultiFormatReader();
			Result result = reader.decode(binaryBitmap, hints);
			content = result.getText();
//			LOGGER.info("二维码结果："+":"+result.toString()+"，"+result.getBarcodeFormat()+"，"+result.getText());
		} catch (NotFoundException e) {
			LOGGER.error("DecodeQRCode NotFoundException", e);
		} catch (IOException e) {
			LOGGER.error("DecodeQRCode IOException", e);
		}
		return content;
	}
}
