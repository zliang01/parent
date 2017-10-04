package cmo.zxw.demo.util;
import java.util.HashMap;
import java.util.Map;
import org.apache.shiro.crypto.RandomNumberGenerator;
import org.apache.shiro.crypto.SecureRandomNumberGenerator;
import org.apache.shiro.crypto.hash.SimpleHash;
import org.apache.shiro.util.ByteSource;
public class PasswordHelper {
	/*
	*1.若只传入密码和账号，返回账号，生成的盐值，和加密后的密码
	*2.若传入的有盐值和账号，返回与该盐值和账号对应的密码，可作为密码比交。
	*/
	public static Map<String,Object> encryptPassword(String password,String staffId,String salts) {
		 RandomNumberGenerator randomNumberGenerator = new SecureRandomNumberGenerator();
		 String algorithmName = "SHA-256";
		 int hashIterations = 2;
		 String salt;
		 if(StringUtils.isNotEmpty(salts)){
			 salt =  salts;
		 }else{
			 salt = randomNumberGenerator.nextBytes().toHex();
		 }
		String passwordNew = new SimpleHash(algorithmName, password,
				ByteSource.Util.bytes(staffId + salt), hashIterations).toHex();
		Map<String,Object> map  = new HashMap<>();
		map.put("password", passwordNew);
		map.put("staffId", staffId);
		map.put("salt", salt);
		return map;
	}
}
