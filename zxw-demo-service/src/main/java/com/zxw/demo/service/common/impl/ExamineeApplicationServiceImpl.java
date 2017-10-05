package com.zxw.demo.service.common.impl;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zxw.demo.dao.common.IExamineeApplicationDaoService;
import com.zxw.demo.service.common.IExamineeApplicationService;

import cmo.zxw.demo.util.BASE64Util;
import cmo.zxw.demo.util.CacheUtil;
import cmo.zxw.demo.util.EncodeQRCode;

@Service("examineeApplicationService")
public class ExamineeApplicationServiceImpl implements IExamineeApplicationService{
	private static final Logger LOGGER =  Logger.getLogger(ExamineeApplicationServiceImpl.class);

	@Autowired
	private IExamineeApplicationDaoService examineeApplicationDaoService;
	
	@Override
	public int insertExamineeApplication(Map<String,Object> params){
		LOGGER.info("insertExamineeApplication------"+params.toString());
		String examineeId = (String) params.get("examineeId");
		String workTypeId = (String) params.get("workTypeId");
		List<Map<String, Object>> subjectsList = CacheUtil.getExamSubjectsByWorkType(workTypeId);
		List<Map<String, Object>> paramList = new ArrayList<>();
		for (Map<String, Object> map : subjectsList) {
			Map<String, Object> tmpMap = new HashMap<>();
			String testType = (String) map.get("testType");
			String subjectId = (String) map.get("subjectId");
			String subjectName = (String) map.get("subjectName");
			String tmpStr = subjectId.substring(subjectId.length()-2);
			//封装考生试卷编码
			String applicationId = examineeId+testType+tmpStr;
			//加密考生试卷编码
			String encodeId = BASE64Util.encode(applicationId);
			//生成考生试卷二维码
			String sysPath = System.getProperty("user.dir");
			String file_separator = System.getProperty("file.separator");
			//TODO 有待确认
			String QRCodeURL = sysPath+file_separator+"QRCodeIMG"+file_separator+examineeId+file_separator+applicationId+".jpg";
			File file = new File(QRCodeURL);
			EncodeQRCode.getQRCodeImg(encodeId, "jpeg", file, encodeId, subjectName);
			tmpMap.put("applicationId", applicationId);
			tmpMap.put("examineeId", examineeId);
			tmpMap.put("workTypeId", workTypeId);
			tmpMap.put("subjectId", subjectId);
			tmpMap.put("QRCodeURL", QRCodeURL);
			paramList.add(tmpMap);
		}
		LOGGER.info("insertExamineeApplication:paramList------"+paramList.toString());
		int result = examineeApplicationDaoService.insertExamineeApplication(paramList);
		return result;
	}
	
	@Override
	public int delExamineeApplication(Map<String,Object> params){
		LOGGER.info("delExamineeApplication------"+params.toString());
		String examineeId = (String) params.get("examineeId");
		String workTypeId = (String) params.get("workTypeId");
		List<Map<String, Object>> subjectsList = CacheUtil.getExamSubjectsByWorkType(workTypeId);
		List<String> paramList = new ArrayList<>();
		for (Map<String, Object> map : subjectsList) {
			String testType = (String) map.get("testType");
			String subjectId = (String) map.get("subjectId");
			String tmpStr = subjectId.substring(subjectId.length()-2);
			//封装考生试卷编码
			String applicationId = examineeId+testType+tmpStr;
			paramList.add(applicationId);
		}
		LOGGER.info("delExamineeApplication:paramList------"+paramList.toString());
		int result = examineeApplicationDaoService.delExamineeApplication(paramList);
		return result;
	}
}
