require(['Util'],function(Util){
	//定义全局容器
	var $el;
	var params=null;
	var eventInit = function(){
		$el=$("#staffeditContent");
		$el.find('.staffeditbtnadd').click($.proxy(staffeditbtnadd,this));
		getCache();
	};
	
	var staffeditbtnadd=function(){
		var boolean = confirm('是否确认修改?');
		if(boolean){
			var result = getForm();
			var roleName = $("#editStaffSelect").find("option:selected").val();;
			$.extend(result,{"roleName":roleName});
			var param={
					service:"staffInfoService",
					method:"editStaffInfo",
					params:JSON.stringify(result)
			};
			Util.ajax.postJson('/zxw-demo-web/commonAction!execute.action',param,function(result,status){
				if(result.returnCode=="0000" && result.bean.result !=0){
					alert("修改成功");
				}
			},true);
		}
	};

	var getCache = function(){
		var param={
				service:"",
				method:"tem_cache",
				params:JSON.stringify({})
		};
		Util.ajax.postJson('/zxw-demo-web/cacheAction!getCache.action',param,function(result,status){
			if(result.returnCode=="0000" && result.bean.param){
				var params = result.bean.param;
				$el.find("#staffId").val(params.staffId);
				$el.find("#staffName").val(params.staffName);
				$el.find("#staffEmployee").val(params.staffEmployee);
				$("#editStaffSelect").find("option:selected").text(params.roleName);
			}
		},true);
	};
	
	
	var getForm= function(){
		var $form = $('#staffeditContent form');
		var result = Util.form_amd.serialize($form);
		return result;
	};
	$(function() {
		//页面加载完成后执行初始化事件函数
		eventInit();
	});
});