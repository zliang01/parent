require(['Util'],function(Util){
	//定义全局容器
	var $el;
	var params=null;
	var eventInit = function(){
		$el=$("#pereditContent");
		$el.find('.pereditbtnadd').click($.proxy(pereditbtnadd,this));
		getCache();
	};
	
	var pereditbtnadd=function(){
		var boolean = confirm('是否确认修改?');
		if(boolean){
			debugger;
			var result = getForm();
			var workType = $("#editSelect").find("option:selected").text();
			$.extend(result,{"workType":workType});
			var param={
					service:"examineeService",
					method:"editExamineeInfo",
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
		Util.ajax.postJson('/zxw-demo-web/cacheAction!getCache.action',{},function(result,status){
			if(result.returnCode=="0000" && result.bean.param){
				var params = result.bean.param;
				$el.find("#number").val(params.number);
				$el.find("#code").val(params.code);
				$el.find("#company").val(params.company);
				$el.find("#name").val(params.name);
				$el.find("#sex").val(params.sex);
				$el.find("#idCard").val(params.idCard);
				$el.find("#examineeJob").val(params.examineeJob);
				$("#editSelect").find("option:selected").text(params.workType);
				$el.find("#applySubject").val(params.applySubject);
				$el.find("#applySubjectCode").val(params.applySubjectCode);
			}
		},true);
	};
	
	
	var getForm= function(){
		var $form = $('#pereditContent form');
		var result = Util.form_amd.serialize($form);
		return result;
	};
	$(function() {
		//页面加载完成后执行初始化事件函数
		eventInit();
	});
});