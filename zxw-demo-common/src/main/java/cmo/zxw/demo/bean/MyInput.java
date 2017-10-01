package cmo.zxw.demo.bean;

import java.util.HashMap;
import java.util.Map;

public class MyInput {
	  private String service;
	  private String method;
	  private String busiCode;
	  private Map<String, Object> params = new HashMap<String, Object>();
	  public MyInput() {}
	  public MyInput(String service, String method, Map<String, Object> params){
	    this.service = service;
	    this.method = method;
	    this.params = params;
	  }
	public String getService() {
		return service;
	}
	public void setService(String service) {
		this.service = service;
	}
	public String getMethod() {
		return method;
	}
	public void setMethod(String method) {
		this.method = method;
	}
	public String getBusiCode() {
		return busiCode;
	}
	public void setBusiCode(String busiCode) {
		this.busiCode = busiCode;
	}
	public Map<String, Object> getParams() {
		return params;
	}
	public void setParams(Map<String, Object> params) {
		this.params = params;
	}
	@Override
	public String toString() {
		return "MyInput [service=" + service + ", method=" + method + ", busiCode=" + busiCode + ", params=" + params
				+ "]";
	}
	  

}
