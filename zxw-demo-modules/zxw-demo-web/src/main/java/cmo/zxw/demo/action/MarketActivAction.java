package cmo.zxw.demo.action;

import java.io.File;
import java.io.FileInputStream;
import java.util.ArrayList;

import javax.servlet.http.HttpServletResponse;

import org.apache.struts2.ServletActionContext;
import org.apache.struts2.interceptor.ServletResponseAware;

import com.opensymphony.xwork2.ActionSupport;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;
import cmo.zxw.demo.util.ExcelUtil;
import cmo.zxw.demo.util.JsonUtil;

public class MarketActivAction extends  BaseAction implements ServletResponseAware{
	private static final long serialVersionUID = -3675623434845348379L;

    private javax.servlet.http.HttpServletResponse response;  
    // 获得HttpServletResponse对象  
    @Override  
    public void setServletResponse(HttpServletResponse response)  
    {  
        this.response = response;  
    } 
	private File excel; //上传的文件
    private String excelFileName; //上传文件的名称 固定写法：上传的文件+FileNameexcel和excelFileName的set、get方法
    private String excelContentType; //文件类型
	public File getExcel() {
		return excel;
	}
	public void setExcel(File excel) {
		this.excel = excel;
	}
	public String getExcelFileName() {
		return excelFileName;
	}
	public void setExcelFileName(String excelFileName) {
		this.excelFileName = excelFileName;
	}
	public String getExcelContentType() {
		return excelContentType;
	}
	public void setExcelContentType(String excelContentType) {
		this.excelContentType = excelContentType;
	}
	public String uploadMarkActive(){
		MyInput input =  new MyInput();
		input.setService("staffInfoService");
		input.setMethod("saveBatchStaffInfo");
		MyOutpt out = null;
        //先定义一个临时文件夹，存放用户上传的Excel文件
        String tempDir = "/Excel";
        //获取临时文件夹的全路径
        String tempDirRealPath = ServletActionContext.getServletContext().getRealPath(tempDir);
        //创建上传文件对象
        File target = new File(tempDirRealPath);
			ArrayList<ArrayList<String>> list;
			try {
				FileInputStream inputStream = new FileInputStream(excel);
				list = ExcelUtil.readExcel(inputStream);
				input.getParams().put("Excel", list);
				out = this.execute(input);
				response.sendRedirect("src/moudlehtml/staffList/staffList.html?<script>alert("+list.size()+")</script>");
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        //删除之前上传的旧文件
        if(target.exists()){
             target.delete();
        }
        return null;
    }
}
