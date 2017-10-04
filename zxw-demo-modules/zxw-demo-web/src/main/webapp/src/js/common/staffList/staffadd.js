require(['Util'],function(Util){
	//定义全局容器
	var  $el;
	var eventInit = function(){
		$el = $('#staffaddContent');
		$('.staffaddbtn').click($.proxy(staffadd,this));
	};
	var staffadd =function(){
		var result = getForm();
		var roleName = $("#addStaffSelect").find("option:selected").text();
		$.extend(result,{"roleName":roleName});
		var param={
				service:"staffInfoService",
				method:"saveStaffInfo",
				params:JSON.stringify(result)
		};
		Util.ajax.postJson('/zxw-demo-web/staffInfoAction!addStaff.action',param,function(result,status){
			if(result.returnCode=="0000" && result.bean.result !=0){
				alert("新增人员成功");
			}
		},true);
	};
	var getForm= function(){
		var $form = $('#staffaddContent form');
		var result = Util.form_amd.serialize($form);
		return result;
	};
	$(function() {
		//页面加载完成后执行初始化事件函数
		eventInit();
	});
});