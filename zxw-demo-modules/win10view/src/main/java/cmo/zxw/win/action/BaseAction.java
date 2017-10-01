package cmo.zxw.win.action;

import java.io.IOException;
import java.lang.reflect.Method;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apache.struts2.ServletActionContext;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.BeanFactoryAware;

import com.alibaba.fastjson.JSON;
import com.opensymphony.xwork2.ActionSupport;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;
import cmo.zxw.demo.util.BeanUtil;
import cmo.zxw.demo.util.ConstantsUtil;
import cmo.zxw.demo.util.WebUtil;
public class BaseAction extends ActionSupport implements BeanFactoryAware{
	private BeanFactory factory;
    protected HttpServletRequest request;

    protected HttpServletResponse response;
    Logger logger = Logger.getLogger(BaseAction.class);  
	private static final long serialVersionUID = 3012485993546819990L;

	public void writeJson(Object object) {
		try {
			String json = JSON.toJSONStringWithDateFormat(object, "yyyy-MM-dd HH:mm:ss");
			ServletActionContext.getResponse().setContentType("text/html;charset=utf-8");
			ServletActionContext.getResponse().getWriter().write(json);
			ServletActionContext.getResponse().getWriter().flush();
			ServletActionContext.getResponse().getWriter().close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	public void sendJson(String json) {
		long start = System.currentTimeMillis();
		try {
			ServletActionContext.getResponse().setContentType("application/json");
			ServletActionContext.getResponse().setCharacterEncoding("utf-8");
			ServletActionContext.getResponse().getWriter().print(json);
		} catch (IOException e) {
			logger.info("sendJson is error e = "+e.toString());
		}
		long end = System.currentTimeMillis();
		logger.info("INVOKE SECCESS! COST=" + (end - start) + "ms"+"");
	}
	
	protected  MyOutpt execute(MyInput input) {
		MyOutpt output = null;
		try {
			if (input.getService()!=null&&input.getMethod()!=null) {//CMS
				Object object = factory.getBean(input.getService());
				Method mth = object.getClass().getMethod(input.getMethod(),MyInput.class);
				output = (MyOutpt) mth.invoke(object,input);
				output.setReturnCode(ConstantsUtil.SUCCESS_CODE);
				output.setReturnMessage(ConstantsUtil.SUCCESS_RETURN_MESSION);
			} else {// WEBSERVICE
				output.setReturnCode(ConstantsUtil.FAIL_CODE);
				output.setReturnMessage("Service Or Method is null input = " +input.toString());
				logger.error("execute mth.invoke errror "+"inputObject is = " + input.toString());
			}
		} catch (Exception e) {
			output.setReturnCode(ConstantsUtil.FAIL_CODE);
			output.setReturnMessage(ConstantsUtil.FAIL_RETURN_MESSION+"Invoke Service Error. "+input.getService() + "." + input.getMethod()+e.getMessage());
			logger.error("Invoke Service Error. "+input.getService() + "." + input.getMethod(), e);
		}
		return output;
	}
	
	

	@SuppressWarnings("rawtypes")
	protected Map getParams() {
        return WebUtil.getParameterMap(getHttpRequest());
    }
	
	protected void getParams(Object bean) {
        BeanUtil.copyProperties(bean, getParams());
    }
	
	protected HttpServletRequest getHttpRequest() {
        request = ServletActionContext.getRequest();
        return request;
    }
	public void setBeanFactory(BeanFactory factory) {
		this.factory = factory;
	}
}
