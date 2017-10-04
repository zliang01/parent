package cmo.zxw.demo.action;

import java.util.Map;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;
import cmo.zxw.demo.util.JsonUtil;
import cmo.zxw.demo.util.PasswordHelper;

public class StaffInfoAction extends BaseAction{
	private static final long serialVersionUID = -3675623434845348379L;
	public String execute(){
		MyInput input  = new MyInput();
		this.getParams(input);
		MyOutpt out = this.execute(input);
		this.sendJson(JsonUtil.JsonToMyOutput(out));
		return null;
	}
	public String addStaff(){
		MyInput input  = new MyInput();
		this.getParams(input);
		String staffId =  (String)input.getParams().get("staffId");
		Map<String, Object> passWoedInfo = PasswordHelper.encryptPassword("111111", staffId, "");
		input.getParams().putAll(passWoedInfo);
		MyOutpt out = this.execute(input);
		this.sendJson(JsonUtil.JsonToMyOutput(out));
		return null;
	}
}
