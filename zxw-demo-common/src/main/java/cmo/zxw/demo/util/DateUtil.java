package cmo.zxw.demo.util;

import java.text.SimpleDateFormat;
import java.util.Date;

public class DateUtil {

    public static long millionSecondsOfDay = 86400000;

    /**
     * convert Date to String by special foramt
     * 
     * @param date
     * @param format
     * @return
     */
    public static String getDateStrByFmt(Date date, String format) {
        if (date == null) {
            return "";
        }
        SimpleDateFormat sdf = new SimpleDateFormat(format);
        return sdf.format(date);
    }



}