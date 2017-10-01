package cmo.zxw.demo.bean;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MyOutpt {
	private static final long serialVersionUID = -2434646456546547575L;
	private String busiCode;
	private String staffId;
	private String returnCode;
	private String returnMessage;
	private Map<String, Object> bean = new HashMap();
	private List<Map<String, Object>> beans = new ArrayList();
	private Object object;

	public MyOutpt() {
	}

	public MyOutpt(String returnCode) {
		setReturnCode(returnCode);
	}
	public MyOutpt(List<Map<String, Object>> beans) {
		setBeans(beans);
	}

	public MyOutpt(String returnCode, String returnMessage) {
		setReturnCode(returnCode);
		setReturnMessage(returnMessage);
	}


	public String getBusiCode() {
		return busiCode;
	}

	public void setBusiCode(String busiCode) {
		this.busiCode = busiCode;
	}

	public String getStaffId() {
		return staffId;
	}

	public void setStaffId(String staffId) {
		this.staffId = staffId;
	}

	public String getReturnCode() {
		return returnCode;
	}

	public void setReturnCode(String returnCode) {
		this.returnCode = returnCode;
	}

	public String getReturnMessage() {
		return returnMessage;
	}

	public void setReturnMessage(String returnMessage) {
		this.returnMessage = returnMessage;
	}

	public Map<String, Object> getBean() {
		return bean;
	}

	public void setBean(Map<String, Object> bean) {
		this.bean = bean;
	}

	public List<Map<String, Object>> getBeans() {
		return beans;
	}

	public void setBeans(List<Map<String, Object>> beans) {
		this.beans = beans;
	}

	public Object getObject() {
		return object;
	}

	public void setObject(Object object) {
		this.object = object;
	}

	@Override
	public String toString() {
		return "MyOutpt [busiCode=" + busiCode + ", staffId=" + staffId + ", returnCode=" + returnCode
				+ ", returnMessage=" + returnMessage + ", bean=" + bean + ", beans=" + beans + ", object=" + object
				+ "]";
	}

}
