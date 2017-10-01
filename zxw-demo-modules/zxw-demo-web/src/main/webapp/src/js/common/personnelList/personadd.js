require(['Util'],function(Util){
	//定义全局容器
	var  $el;
	var _dialog = null;
	var eventInit = function(){
		alert(111);
	}
	
	var getForm= function(){
		var $form = $('#perListContent form');
		var result = Util.form.serialize($form);
		return result;
	}
	$(function() {
		//页面加载完成后执行初始化事件函数
		eventInit();
	});
});