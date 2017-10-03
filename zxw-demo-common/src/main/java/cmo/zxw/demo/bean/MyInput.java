package cmo.zxw.demo.bean;

import java.util.HashMap;
import java.util.Map;

public class MyInput {
	  private String service;
	  private String method;
	  private String page;
	  private String pageCapacity;
	  private String busiCode;
	  private Map<String, Object> params = new HashMap<String, Object>();
	  public MyInput() {}
	  public MyInput(String service, String method, Map<String, Object> params, String pageCapacity, String page){
	    this.service = service;
	    this.method = method;
	    this.params = params;
	    this.page = page;
	    this.pageCapacity = pageCapacity;
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
	  public String getPage() {
		return page;
	}
	public void setPage(String page) {
		this.page = page;
	}
	  public String getPageCapacity() {
		return pageCapacity;
	}
	public void setPageCapacity(String pageCapacity) {
		this.pageCapacity = pageCapacity;
	}
	public Map<String, Object> getParams() {
		return params;
	}
	public void setParams(Map<String, Object> params) {
		this.params = params;
	}
	@Override
	public String toString() {
		return "MyInput [service=" + service + ", method=" + method + ", page=" + page + ", pageCapacity="
				+ pageCapacity + ", busiCode=" + busiCode + ", params=" + params + "]";
	}

	  

}
