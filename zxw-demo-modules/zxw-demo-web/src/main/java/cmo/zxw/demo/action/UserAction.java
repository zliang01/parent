package cmo.zxw.demo.action;

import cmo.zxw.demo.bean.MyInput;

public class UserAction extends BaseAction {
	
	private static final long serialVersionUID = -3675623781845348379L;
	public String execute(){
		return SUCCESS;
	}
	
	public String getUserAll(){
		MyInput input  = new MyInput();
		this.getParams(input);
		System.out.println("this.is UserAction");
		return null;
	}


}
