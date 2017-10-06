package cmo.zxw.demo.action;

import java.util.Map;

import org.apache.log4j.Logger;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.DisabledAccountException;
import org.apache.shiro.authc.ExpiredCredentialsException;
import org.apache.shiro.authc.IncorrectCredentialsException;
import org.apache.shiro.authc.LockedAccountException;
import org.apache.shiro.authc.UnknownAccountException;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.session.Session;
import org.apache.shiro.subject.Subject;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;
import cmo.zxw.demo.util.JsonUtil;
import cmo.zxw.demo.util.StringUtils;

/**
 * 
 * 
 */
public class LoginAction extends BaseAction {
	private static final long serialVersionUID = -3579032710235743396L;
    Logger logger = Logger.getLogger(LoginAction.class);  
	public String login() {
		logger.info("[=============LoginAction Start==============]:");
		MyOutpt outpt = new MyOutpt();
		String code = "0";
		String message;
		MyInput input  = new MyInput();
		this.getParams(input);
		// 获取用户名
		String userName = (String) input.getParams().get("staffId");
		// 获取密码
		String passWord = (String) input.getParams().get("password");
		// 判断用户名是否为空，若为空测返回
		if (StringUtils.isEmpty(userName)) {
			outpt.setReturnMessage("用户名为空");
		}
		// 判断用密码是否为空，若为空测返回
		if (StringUtils.isEmpty(passWord)) {
			outpt.setReturnMessage("密码为空");
		}
		try {
			// shiro登录验证
			UsernamePasswordToken token = new UsernamePasswordToken(userName, passWord);
			Subject currentUser = SecurityUtils.getSubject();
			outpt =  this.execute(input);
			currentUser.getSession().setAttribute("staffInfo",outpt);
			//调用自定义的realm
			currentUser.login(token);
			code = "0000";
			message = "登录成功";
			//登录成功把用户信息加载到session里面
		//	staffInfoService.queryStaffInfo(userName,inputObject.getLogParams().get("ip"));
			logger.info("[staffInfoService]  [ queryStaffInfo ]  [ userName = "+userName+" ]");
		} catch (UnknownAccountException e) {
			logger.info("[login error! = ]"+ e.toString());
			message = "账号或密码不正确";
		} catch (LockedAccountException e) {
			logger.info("[login error! = ]"+ e.toString());
			message = "账号被锁定,请稍后重试";
		} catch (DisabledAccountException e) {
			logger.info("[login error! = ]"+ e.toString());
			message = "工号账号无效,请重新输入";
		}catch (IncorrectCredentialsException e) {
			logger.info("[login error! = ]"+ e.toString());
			message = "账号或密码不正确";
		} catch (ExpiredCredentialsException e) {
			logger.info("[login error! = ]"+ e.toString());
			message = "密码过期，请重新输入";
		} catch (Exception e) {
			logger.info("[login error! = ]"+ e.toString());
			message = "系统异常";
		}
		outpt.setReturnCode(code);
		outpt.setReturnMessage(message);
		logger.info("[login success]"+" : [" + outpt.toString() + "]");
		// 调用登录日志的方法
		this.sendJson(JsonUtil.JsonToMyOutput(outpt));
		logger.info("[=============LoginAction end==============]:");
		return null;
	}
	public String staffInfo() {
		logger.info("[=============staffInfo Start==============]:");
		MyOutpt MyOutpt = new MyOutpt();
		Subject currentUser = SecurityUtils.getSubject();
		Session  session = currentUser.getSession();
		Map<String, Object> staffInfo = (Map<String, Object>)session.getAttribute("staffInfo");
		MyOutpt.setBean(staffInfo);
		logger.info("[login success]"+" : [" + MyOutpt.toString() + "]");
		// 调用登录日志的方法
		this.sendJson(JsonUtil.JsonToMyOutput(MyOutpt));
		return null;
	}
	public String logout() {
		logger.info("[=============logout Start==============]:");
		MyOutpt MyOutpt = new MyOutpt();
		Subject subject = SecurityUtils.getSubject(); 
		  if (subject.isAuthenticated()) {
				Session  session = subject.getSession();
				Map<String, Object> staffInfo = (Map<String, Object>)session.getAttribute("staffInfo");
				subject.logout();
				logger.info("[logOut success] :" + "[" + staffInfo.toString() + "]");
		        subject.logout(); // session 会销毁，在SessionListener监听session销毁，清理权限缓存  
		    }
		// 调用登录日志的方法
		  this.sendJson(JsonUtil.JsonToMyOutput(MyOutpt));
		return null;
	}
}
