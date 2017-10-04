package cmo.zxw.demo.util;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public final class CacheUtil {
	private static final List<Map<String,Object>> WORKTYPEMAP = new ArrayList<>();
	private static final List<Map<String,Object>> DEPTMAP = new ArrayList<>();
	private static final List<Map<String,Object>> EXAMSUBJECTSMAP = new ArrayList<>();
	public CacheUtil() {}
	@SuppressWarnings("unchecked")
	public CacheUtil(Map<String, Object> result) {
		List<Map<String,Object>> commonContantsList = (List<Map<String, Object>>) result.get(ConstantsUtil.COMMONCONTANTS);
		List<Map<String,Object>> examSubjectsList = (List<Map<String, Object>>) result.get(ConstantsUtil.EXAMSUBJECTS);
		for (Map<String, Object> map : commonContantsList) {
			if("001".equals(map.get("type"))) {
				map.remove("type");
				DEPTMAP.add(map);
			}
			if("002".equals(map.get("type"))) {
				map.remove("type");
				WORKTYPEMAP.add(map);
			}
		}
		EXAMSUBJECTSMAP.addAll(examSubjectsList);
	}
	/**
	 * 获取工种列表
	 * @return
	 */
	public static List<Map<String,Object>> getWorkType(){
		return WORKTYPEMAP;
	}
	/**
	 * 根据工种ID获取工种名称
	 * @param dataId
	 * @return
	 */
	public static String getWorkType(String dataId){
		for (Map<String, Object> map : WORKTYPEMAP) {
			if(dataId.equals(map.get("dataId"))) {
				return (String) map.get("dataName");
			}
		}
		return null;
	}
	/**
	 * 获取部门列表
	 * @return
	 */
	public static List<Map<String,Object>> getDept(){
		return DEPTMAP;
	}
	/**
	 * 根据部门ID获取部门名称
	 * @param dataId
	 * @return
	 */
	public static String getDept(String dataId){
		for (Map<String, Object> map : DEPTMAP) {
			if(dataId.equals(map.get("dataId"))) {
				return (String) map.get("dataName");
			}
		}
		return null;
	}
	/**
	 * 获取考试科目列表
	 * @return
	 */
	public static List<Map<String,Object>> getExamSubjects(){
		return EXAMSUBJECTSMAP;
	}
	/**
	 * 根据工种ID获取考试科目列表
	 * @param workTypeId
	 * @return
	 */
	public static List<Map<String,Object>> getExamSubjectsByWorkType(String workTypeId){
		List<Map<String,Object>> tempList = new ArrayList<>();
		for (Map<String, Object> map : EXAMSUBJECTSMAP) {
			if(workTypeId.equals(map.get("workTypeId"))) {
				tempList.add(map);
			}
		}
		return tempList;
	}
	/**
	 * 根据科目ID获取科目信息
	 * @param subjectId
	 * @return
	 */
	public static Map<String,Object> getExamSubjects(String subjectId){
		for (Map<String, Object> map : EXAMSUBJECTSMAP) {
			if(subjectId.equals(map.get("subjectId"))) {
				return map;
			}
		}
		return null;
	}
}
