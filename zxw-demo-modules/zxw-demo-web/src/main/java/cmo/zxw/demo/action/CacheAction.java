package cmo.zxw.demo.action;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.session.Session;
import org.apache.shiro.subject.Subject;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;
import cmo.zxw.demo.util.JsonUtil;

public class CacheAction extends BaseAction{
	private static final long serialVersionUID = -3675623434845348379L;
	public String saveCache(){
		MyInput input  = new MyInput();
		this.getParams(input);
		Subject currentUser = SecurityUtils.getSubject();
		Session  session = currentUser.getSession();
		session.setAttribute("tem_cache", input.getParams());
		return null;
	}
	public String getCache(){
		MyOutpt out = new MyOutpt();
		MyInput input =new MyInput();
		this.getParams(input);
		Subject currentUser = SecurityUtils.getSubject();
		Session  session = currentUser.getSession();
		Object obj= session.getAttribute(input.getMethod());
		out.getBean().put("param", obj);
		out.setReturnCode("0000");
		this.sendJson(JsonUtil.JsonToMyOutput(out));
		return null;
	}

}
