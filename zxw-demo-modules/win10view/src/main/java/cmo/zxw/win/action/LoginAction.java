package cmo.zxw.win.action;

import org.apache.log4j.Logger;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;
import cmo.zxw.demo.util.JsonUtil;

public class LoginAction extends BaseAction{
	private static final long serialVersionUID = -3675623434845348379L;
    Logger logger = Logger.getLogger(LoginAction.class);  
	public String login(){
		MyInput input  = new MyInput();
		this.getParams(input);
		logger.info("LoginAction start input" +input.toString());
		MyOutpt out = this.execute(input);
		this.sendJson(JsonUtil.JsonToMyOutput(out));
		return null;
	}

}
