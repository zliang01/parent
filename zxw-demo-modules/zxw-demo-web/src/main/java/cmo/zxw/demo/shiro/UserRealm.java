package cmo.zxw.demo.shiro;

import org.apache.log4j.Logger;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.session.Session;
import org.apache.shiro.subject.PrincipalCollection;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.util.ByteSource;

import cmo.zxw.demo.bean.MyInput;
import cmo.zxw.demo.bean.MyOutpt;

/**
 *重写shiro的Realm，具体的验证逻辑
 */
public class UserRealm extends AuthorizingRealm {
    Logger logger = Logger.getLogger(UserRealm.class);  
	protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken authenticationtoken)
			throws AuthenticationException {
		UsernamePasswordToken upToken = (UsernamePasswordToken) authenticationtoken;
		String staffId = upToken.getUsername();
		MyInput input = new MyInput();
		Subject currentUser = SecurityUtils.getSubject();
		Session  session = currentUser.getSession();
		MyOutpt out = new MyOutpt();
		out =  (MyOutpt)session.getAttribute("staffInfo");
		// 如果身份认证验证成功，返回一个AuthenticationInfo实现；
		SimpleAuthenticationInfo simpleAuthenticationInfo= new SimpleAuthenticationInfo(staffId,out.getBeans().get(0).get("password"), ByteSource.Util.bytes(staffId + out.getBeans().get(0).get("salt")), getName());
		session.setAttribute("staffId", staffId);
		return simpleAuthenticationInfo;
	}

	@Override
	protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection arg0) {
		return null;
	}

}
