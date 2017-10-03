package cmo.zxw.demo.action;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;
import cmo.zxw.demo.util.JsonUtil;

public class CacheAction extends BaseAction{
	private static final long serialVersionUID = -3675623434845348379L;
	public String saveCache(){
		MyInput input  = new MyInput();
		this.getParams(input);
		this.getHttpRequest().getSession().setAttribute("cache", input.getParams());
		return null;
	}
	public String getCache(){
		MyOutpt out = new MyOutpt();
		Object obj= this.getHttpRequest().getSession().getAttribute("cache");
		out.getBean().put("param", obj);
		out.setReturnCode("0000");
		this.sendJson(JsonUtil.JsonToMyOutput(out));
		return null;
	}

}
