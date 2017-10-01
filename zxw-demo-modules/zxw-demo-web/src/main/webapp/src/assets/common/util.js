/*
*	@author: zhangxuewei
*	@date:2017-06-11
*	@desc:全局公用模块
*		大部分业务模块都会用到，业务模块只需引用此公用模块，无需单个添加。
*/
define([
	'cookie',
	'ajax',
	'form_amd',
	'dialog',
	'showDialog',
	'underscore'

], function(cookie, ajax, form_amd,dialog,showDialog) {
	return {
		cookie:cookie,
		ajax: ajax,
		form_amd:form_amd,
		dialog:dialog,
		showDialog:showDialog
	}
});
