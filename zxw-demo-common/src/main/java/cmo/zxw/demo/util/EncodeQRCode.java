package cmo.zxw.demo.util;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.Shape;
import java.awt.geom.RoundRectangle2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.util.EnumMap;

import javax.imageio.ImageIO;

import org.apache.log4j.Logger;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
/**
 * 通过google的zxing实现二维码(加入logo图片)
 * @author tskk
 * @version 2015-6-26 13:30:20
 * */
public final class EncodeQRCode {
	private static final Logger LOGGER =  Logger.getLogger(EncodeQRCode.class);
	//二维码颜色
	private static final int BLACK = 0xFF000000;//0xFFFF0000，红色
	//二维码背景色
	private static final int WHITE = 0xFFFFFFFF;//0xFF0000FF，蓝色
	//注：二维码颜色色差大，扫描快，但如果"BLACK'设置为黑色外其他颜色，可能无法扫描
	//二维码图片大小
	private static final int QRCODE_SIZE = 350;
	private static final int BLANK_SIZE = 50;
	private static final int HALF_BLANK_SIZE = BLANK_SIZE/2;
	//LOGO显示大小
	private static final int LOGO_SIZE = 60;
	//二维码格式参数
	private static final EnumMap<EncodeHintType, Object> hints = new EnumMap<EncodeHintType, Object>(EncodeHintType.class);
	static{
		/*二维码的纠错级别(排错率),4个级别：
		 L (7%)、
		 M (15%)、
		 Q (25%)、
		 H (30%)(最高H)
		 纠错信息同样存储在二维码中，纠错级别越高，纠错信息占用的空间越多，那么能存储的有用讯息就越少；共有四级；
		 选择M，扫描速度快。
		 */
		hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
		// 二维码边界空白大小 1,2,3,4 (4为默认,最大)
		hints.put(EncodeHintType.MARGIN, 1);
		hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
		hints.put(EncodeHintType.MAX_SIZE, 350);
		hints.put(EncodeHintType.MIN_SIZE, 150);
	}
	/**
	 * 绘制二维码
	 * @param contents 二维码内容  
	 * @return image 二维码图片
	 * */
	private static BufferedImage encodeImg(String contents,File file){
		if(file!=null) {
			FontImage.mkdirs(file.getAbsolutePath());
		}
		BufferedImage image = null;
		try{
			BitMatrix matrix = new MultiFormatWriter().encode(contents, BarcodeFormat.QR_CODE, QRCODE_SIZE-BLANK_SIZE, QRCODE_SIZE-BLANK_SIZE, hints);
			image = new BufferedImage(QRCODE_SIZE, QRCODE_SIZE, BufferedImage.TYPE_INT_RGB);
			for(int x = 0; x < image.getWidth(); x++){
				for(int y =0;y < image.getHeight(); y++){
					image.setRGB(x, y, WHITE);
				}
			}
			int width = matrix.getWidth();
			int height = matrix.getHeight();
			for(int x = 0; x < width; x++){
				for(int y =0;y < height; y++){
					image.setRGB(x+HALF_BLANK_SIZE, y+HALF_BLANK_SIZE, matrix.get(x, y) ? BLACK : WHITE);
				}
			}
		}catch(Exception e){
			LOGGER.error("二维码写入文件失败", e);
		}
		return image;
	}
	/**  
     *  插入Logo图片  
     * @param source    图片操作对象  
     * @param imgPath   Logo图片地址  
     * @param needCompress 是否压缩Logo大小  
     * @throws Exception  
     */    
    private static void insertImage(BufferedImage source,BufferedImage logoImage, boolean needCompress){
        int width = logoImage.getWidth(null);
        int height = logoImage.getHeight(null);
            
        Image src =logoImage;    
        if (needCompress) {
            if (width > LOGO_SIZE) {    
                width = LOGO_SIZE;    
            }    
            if (height > LOGO_SIZE) {    
                height = LOGO_SIZE;    
            }    

            Image  image = logoImage.getScaledInstance(width, height,    
            Image.SCALE_SMOOTH);    
            BufferedImage tag = new BufferedImage(width, height,    
                    BufferedImage.TYPE_INT_RGB);
            Graphics g = tag.getGraphics();    
            g.drawImage(image, 0, 0, null);   
            g.dispose();    
            src = image;    
        }    
        Graphics2D graph = source.createGraphics();    
        int x = (QRCODE_SIZE - width) / 2;    
        int y = (QRCODE_SIZE - height) / 2;    
        graph.drawImage(src, x, y, width, height, null);     
        Shape shape = new RoundRectangle2D.Float(x, y, width, width, 6, 6);    
        graph.setStroke(new BasicStroke(3f));    
        graph.draw(shape);    
        graph.dispose();    
    }
	
	/** 
     * 添加 底部图片文字 
     * @param source   图片源 
     * @param declareText 文字本文 
     */  
    private static void addFontImage(BufferedImage source, String declareText,boolean flag) {
        BufferedImage textImage = FontImage.getImage(declareText, QRCODE_SIZE, HALF_BLANK_SIZE);  
        Graphics2D graph = source.createGraphics();  
          
        int width = textImage.getWidth(null);
        int height = textImage.getHeight(null);
            
        Image src =textImage;
        if(flag==true) {
        	graph.drawImage(src, 0, 0, width, height, null);
        }else {
        	graph.drawImage(src, 0, QRCODE_SIZE - HALF_BLANK_SIZE, width, height, null);
        }
        graph.setColor(Color.BLACK);
        graph.dispose();    
    }
    /**
	 * 二维码输出到文件，顶部和底部有文字
	 * 	@param contents 二维码内容
	 * @param format 图片格式
	 * @param file 输出文件
	 * @param topDes 顶部文字
	 * @param bottomDes 底部文字
	 * */
	public static void getQRCodeImg(String contents,String format,File file,String bottomDes,String topDes){
		BufferedImage image = encodeImg(contents,file);
		try {
			addFontImage(image,bottomDes,false);
			addFontImage(image,topDes,true);
			ImageIO.write(image, format, file);
		} catch (IOException e) {
			LOGGER.error("二维码写入文件失败", e);
		}
	}
	/**
	 * 二维码输出到文件
	 * 	@param contents 二维码内容
	 * @param format 图片格式
	 * @param file 输出文件
	 * */
	public static void writeToFile(String contents,String format,File file){
		BufferedImage image = encodeImg(contents,file);
		try {
			ImageIO.write(image, format, file);
		} catch (IOException e) {
			LOGGER.error("二维码写入文件失败", e);
		}
	}
	/**
	 * 二维码输出到文件,带logo
	 * 	@param contents 二维码内容
	 * @param format 图片格式
	 * @param logoImgPath Logo图片地址
	 * @param file 输出文件
	 * */
	public static void writeToFile(String contents,String format,String logoImgPath,File file){
		BufferedImage image = encodeImg(contents,file);
		File logoImg = new File(logoImgPath);
		try {
			BufferedImage src = ImageIO.read(logoImg);
			insertImage(image,src,true);
			ImageIO.write(image, format, file);
		} catch (IOException e) {
			LOGGER.error("二维码写入文件失败", e);
		}
	}
	/**
	 * 二维码输出到文件，底部有文字
	 * 	@param contents 二维码内容
	 * @param format 图片格式
	 * @param file 输出文件
	 * @param bottomDes 底部文字
	 * */
	public static void writeToFile(String contents,String format,File file,String bottomDes){
		BufferedImage image = encodeImg(contents,file);
		try {
			addFontImage(image,bottomDes,false);
			ImageIO.write(image, format, file);
		} catch (IOException e) {
			LOGGER.error("二维码写入文件失败", e);
		}
	}
	/**
	 * 二维码输出到文件,带logo且底部有文字
	 * 	@param contents 二维码内容
	 * @param format 图片格式
	 * @param logoImgPath Logo图片地址
	 * @param file 输出文件
	 * @param bottomDes 底部文字
	 * */
	public static void writeToFile(String contents,String format,String logoImgPath ,File file,String bottomDes){
		BufferedImage image = encodeImg(contents,file);
		File logoImg = new File(logoImgPath);
		try {
			BufferedImage src = ImageIO.read(logoImg);
			insertImage(image,src,true);
			addFontImage(image,bottomDes,false);
			ImageIO.write(image, format, file);
		} catch (IOException e) {
			LOGGER.error("二维码写入文件失败", e);
		}
	}
	/**
	 * 二维码流式输出
	 * 	@param contents 二维码内容
	 * @param format 图片格式
	 * @param stream 输出流
	 * */
	public static void writeToStream(String contents,String format,OutputStream stream){
		BufferedImage image = encodeImg(contents,null);
		try {
			ImageIO.write(image, format, stream);
		} catch (IOException e) {
			LOGGER.error("二维码写入流失败", e);
		}
	}
	
}