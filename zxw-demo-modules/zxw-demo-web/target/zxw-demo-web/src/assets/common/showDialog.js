/**
*	@author: zhangxuewei
*	@date: 2017-06-11
* 	@desc: 弹出框
*/
define([''], function(){
	var _dialog = null;	//移除模块弹框
	var showDialog = {
			
			//打开显示模块弹框
			showDialog :function(title, url, param){
				var dialogUrl = '../../../js/index/dialog';
				require.undef(dialogUrl);
				require([dialogUrl], $.proxy(function(Dialog){
					var config = {};
					if (typeof(title) == 'object'){
						config = title;
						config.businessOptions = title.param;
					}else{
						config = {
							title:title,
							url:url,
							businessOptions:param,
						}
					}
					_dialog = new Dialog(config);
				},this));
			},
			//移除模块弹框
			destroyDialog:function(){
				_dialog.dialog.remove();
				_dialog = null;
			}
	};
	return showDialog;
});