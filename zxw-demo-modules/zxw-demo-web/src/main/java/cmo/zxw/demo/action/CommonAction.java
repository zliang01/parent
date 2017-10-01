package cmo.zxw.demo.action;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;
import cmo.zxw.demo.util.JsonUtil;

public class CommonAction extends BaseAction{
	private static final long serialVersionUID = -3675623434845348379L;
	public String execute(){
		MyInput input  = new MyInput();
		this.getParams(input);
		MyOutpt out = this.execute(input);
		this.sendJson(JsonUtil.JsonToMyOutput(out));
		return null;
	}

}
