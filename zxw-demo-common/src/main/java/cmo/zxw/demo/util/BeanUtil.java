package cmo.zxw.demo.util;
import java.lang.reflect.InvocationTargetException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.sql.Time;
import java.sql.Timestamp;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.beanutils.ConvertUtils;
import org.apache.commons.beanutils.converters.BigDecimalConverter;
import org.apache.commons.beanutils.converters.BigIntegerConverter;
import org.apache.commons.beanutils.converters.BooleanConverter;
import org.apache.commons.beanutils.converters.DateConverter;
import org.apache.commons.beanutils.converters.DoubleConverter;
import org.apache.commons.beanutils.converters.FloatConverter;
import org.apache.commons.beanutils.converters.IntegerConverter;
import org.apache.commons.beanutils.converters.LongConverter;
import org.apache.commons.beanutils.converters.ShortConverter;
import org.apache.commons.beanutils.converters.SqlDateConverter;
import org.apache.commons.beanutils.converters.SqlTimeConverter;
import org.apache.commons.beanutils.converters.SqlTimestampConverter;
import org.apache.commons.beanutils.converters.StringConverter;

public class BeanUtil extends BeanUtils {
    
    static {
        SqlTimestampConverter dtConverter = new SqlTimestampConverter(null);
        dtConverter.setPatterns(new String[]{"yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd","MM/dd/yyyy","MM/dd/yyyy HH:mm:ss"});
        
        ConvertUtils.register(new StringConverter(), String.class);
        // date
        ConvertUtils.register(new DateConverter(null), java.util.Date.class);
        ConvertUtils.register(new SqlDateConverter(null), java.sql.Date.class);
        ConvertUtils.register(new SqlTimeConverter(null), Time.class);
        //ConvertUtils.register(dtConverter, Timestamp.class);
        ConvertUtils.register(dtConverter, Timestamp.class);
        
        // number
        ConvertUtils.register(new BooleanConverter(null), Boolean.class);
        ConvertUtils.register(new ShortConverter(null), Short.class);
        ConvertUtils.register(new IntegerConverter(null), Integer.class);
        ConvertUtils.register(new LongConverter(null), Long.class);
        ConvertUtils.register(new FloatConverter(null), Float.class);
        ConvertUtils.register(new DoubleConverter(null), Double.class);
        ConvertUtils.register(new BigDecimalConverter(null), BigDecimal.class);
        ConvertUtils.register(new BigIntegerConverter(null), BigInteger.class);
    }

    public static void copyProperties(Object target, Object source) {
        try {
            BeanUtils.copyProperties(target, source);
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        }
    }
	
    /**
     * 两个值进行比较
     * @param oldObj
     * @param newObj
     * @return 相同返回true 不同返回false
     */
    @SuppressWarnings("unused")
	private static Boolean compareValue(Object oldObj,Object newObj){
    	 if(null == oldObj && null == newObj){
    		 return true;
		//属性类型为bigdecimal时 
		 }else if(
				 //防止旧值为null
				 (oldObj == null ? newObj.getClass() : oldObj.getClass() ).equals(BigDecimal.class) && 
				 	//如果旧值为null时给一个0
    				(  oldObj == null ? new BigDecimal(0) : (BigDecimal)oldObj  ).compareTo(
    					//新值为null时给一个0	
    				   newObj == null ? new BigDecimal(0) : (BigDecimal)newObj 
    				)==0
		         ){
			 return true;
		//属性类型为Timestamp
		 }else if((oldObj == null ? newObj.getClass() : oldObj.getClass() ).equals(Timestamp.class)
				 //避免出现null.eal的情况
				 &&  (oldObj == null ? newObj.equals(oldObj) : oldObj.equals(newObj)) ){
			 return true;
		 }else{
			 oldObj = oldObj==null?"":oldObj;
			 newObj = newObj==null?"":newObj;
			 if((oldObj).equals(newObj)){
				 return true;
			 }
			 return false;
		 }
    }
    
    
    
    
    
    
    
    
    
    
    
}
