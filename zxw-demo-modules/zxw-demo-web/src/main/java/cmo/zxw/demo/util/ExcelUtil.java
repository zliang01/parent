package cmo.zxw.demo.util;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;

import org.apache.log4j.Logger;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFDataValidation;
import org.apache.poi.hssf.usermodel.HSSFDateUtil;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;

import cmo.zxw.demo.action.BaseAction;

public  class ExcelUtil {
    Logger logger = Logger.getLogger(BaseAction.class);
    private static StringBuffer errorMessage;  //解析Excel文件时遇到的错误信息，用于存储错误单元格的位置信息和错误原因
    /**
     * 读入Excel文件，解析单元格内容，并存入二维数组
     * @param fileInputStream
     * @return String类型的二维数组
     * @throws ExcelException 
     */
    public static ArrayList<ArrayList<String>>  readExcel(FileInputStream fileInputStream) throws Exception {

        //声明并初始化一个工作薄对象
    	Workbook wb = null;
        //存储解析后的Excel中的内容的二维数组
        ArrayList<ArrayList<String>> list = new ArrayList<ArrayList<String>>();

        try {
            //生成Excel工作薄对象
            wb = WorkbookFactory.create(fileInputStream);
            
            //获得工作薄中的第一个工作表
            Sheet sheet = wb.getSheetAt(0);

            //调用readRows方法，逐行解析工作表中内容
            list = readRows(sheet); 

            //解析Excel文件结束后，关闭输入流
            fileInputStream.close();
        }catch(IOException e){
            throw (new Exception("导入失败，请重新尝试！"));
        } catch(Exception e){
            throw (new Exception("文件类型不合法！"));
        }

        return list;
    }

    /**
     * 逐行解析工作表中的内容
     * @param sheet
     * @return 解析工作表后生成的二维数组
     * @throws Exception
     */
    private static ArrayList<ArrayList<String>> readRows(Sheet sheet) {

        //声明并初始化String类型的二维数组，用于存储解析后的工作表中的内容
        ArrayList<ArrayList<String>> list= new ArrayList<ArrayList<String>>();

        //获得该工作表的行数
        int rows = sheet.getPhysicalNumberOfRows();
        int rowIndex = 0;        //每行索引
        int notnullRowIndex = 0; //非空行索引
        while (notnullRowIndex < rows) {
            //解析该行中的每个单元格
            Row row = sheet.getRow(rowIndex);
            rowIndex++;
            if (row != null) {
                //将每行解析出的一维数组加入到list中
                list.add(readCells(row));
                notnullRowIndex++;
            }
        }
        return list;
    }
    /**
     * 解析工作表中的一行数据
     * @param row
     * @return 本行解析后的一维数组
     * @throws Exception
     */
    private static ArrayList<String> readCells(Row row) {

        //获得本行所有单元格
        int cells  = row.getPhysicalNumberOfCells();
        int cellIndex = 0;         //单元格索引
        int notnullCellIndex = 0;  //非空单元格索引

        //声明并初始化一个一维数组，用于存储改行解析后的数据
        ArrayList<String> rowlist = new ArrayList<String>();

        //逐个解析该行的单元格
        while(notnullCellIndex < cells) {

            //取得一个单元格
            Cell cell = row.getCell(cellIndex);
            

            cellIndex++;
            if (cell != null) {
                String value = null;

                //根据单元格内容的类型分别处理
                switch (cell.getCellType()) {                                   
                case Cell.CELL_TYPE_FORMULA:   
                    value = cell.getCellFormula();   
                    break; 
                case Cell.CELL_TYPE_NUMERIC:{

                    //若该单元格内容为数值类型，则判断是否为日期类型
                    if(cell.getCellStyle().getDataFormatString().equals("yyyy\"年\"m\"月\";@") || HSSFDateUtil.isCellDateFormatted(cell)){                            
                        try{
                            //若转换发生异常，则记录下单元格的位置，并跳过该行的读取
                            value = String.valueOf(cell.getDateCellValue());
                        }catch(Exception e){
                            errorMessage.append(row.getRowNum()+"行"+notnullCellIndex+"列"+"日期格式错误;");
                            return null;
                        }

                    }else{
                        try {
                            //将数字类型转换为字符串类型，若为浮点类型数据，则去除掉小数点后的内容
                            value = String.valueOf(cell.getNumericCellValue());
                        }catch(Exception e){
                            //若转换发生异常，则记录下单元格的位置，并跳过该行的读取
                            errorMessage.append(row.getRowNum()+"行"+notnullCellIndex+"列"+"数字格式错误;");
                            return null;
                        }
                    }
                    break; 
                }
                case Cell.CELL_TYPE_STRING:   
                    value = cell.getStringCellValue();   
                    break;                
                case Cell.CELL_TYPE_BLANK:   
                    value = "";                            
                    break;
                default: {
                    //若单元格内容的格式与常规类型不符，则记录下单元格位置，并跳过该行的读取，继续解析下一行
                    errorMessage.append(row.getRowNum()+"行"+notnullCellIndex+"列"+"格式与常规类型不符;");
                    return null;
                }  
                }   
                notnullCellIndex++;
                //将该单元格的内容存入一维数组
                rowlist.add(value); 
            }
        } 
        return rowlist;
    }

    /**
     * 根据传入的list和文件名生成Excel文件
     * 保存到target/temp文件夹中，下载完毕后删除临时文件
     * 并设置数据的有效性
     * 崔
     * @param list
     */
    public HSSFWorkbook writeExcel(ArrayList<ArrayList<String>> list,HSSFDataValidation dataValidation){
        // 取得规则  
        //实例化工作薄对象
        HSSFWorkbook wb = new HSSFWorkbook();  
        //创建一个工作表
        HSSFSheet sheet = wb.createSheet();  
        //设置单元格的格式
        sheet.addValidationData(dataValidation);
        HSSFCellStyle style = wb.createCellStyle();
        style.setFillPattern(HSSFCellStyle.NO_FILL);
        
        for(int i = 0;i < list.size();i++){
            //创建一行
            HSSFRow row = sheet.createRow(i);
            
            ArrayList<String> rowlist = list.get(i);
            for(int j = 0;j < rowlist.size();j++){
                //创建一个单元格，并根据数组中的内容填充该单元格
                HSSFCell cell = row.createCell(j);
                cell.setCellType(Cell.CELL_TYPE_STRING);
                cell.setCellStyle(style);
                cell.setCellValue(rowlist.get(j));
            }
        }
        
        return wb;
    }
    public static void main(String[] args) {
    	File file = new File("C:/Users/张学伟/Desktop/系统菜单.xlsx");
    	FileInputStream input;
		try {
			input = new FileInputStream(file);
			ArrayList<ArrayList<String>> list = ExcelUtil.readExcel(input);
			System.out.println(list.toString());
		} catch (Exception e) {
			
			e.printStackTrace();
		}
	}
}
