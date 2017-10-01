require(['list','Util',
         'Xheditor',
         'jqueryMin'
         ],function(List,Util,Xheditor,jqueryMin){
	//定义全局容器
	var  $el;
	var staffId="";
	var staffName="";
	var Util;
	var _dialog = null;
	var eventInit = function(){
		$el = $('#workRecordEditContent');
		$('.workRecordEditbtnadd').click($.proxy(workRecordEditbtnadd,this));
		$('.workRecordEditbtnClear').click($.proxy(workRecordEditbtnClear,this));
debugger;
	}
	//情况输入框数据
	var workRecordEditbtnClear = function (){	
		$('#elm3').val("");
	}
	
	//新增人员工作日志
	var workRecordEditbtnadd = function(){
		var flg=true;
		var workContent=$('#elm3').val();
		
		var param={
				service:"queryWorkRecordService",
				method:"queryWorkRecord",
				params:{
					staffId:staffId,
					staffName:staffName,
					workContent:workContent
				}
		}
		
		Util.ajax.postJson('/zxw-web/front/sh/common!execute?uid=insertWorkRecord',parm,function(result,status){
			if(result.returnCode=="0000"){
				debugger;
				var relust=confirm("日报添加成功，是否继续添加");
				if(!relust){
					$(".ui-dialog-close").trigger("onclick");
				}else{
					$('#elm3').val("");
					flg=true;
				}
			}else{
				flg=true;
			}
			
			
		},true);
	};
	
	$(function() {
		$('#elm3').xheditor({tools:'simple'});
		Util.ajax.postJson('/zxw-web/front/sh/login!staffInfo?uid=staffInfo01',{},function(result,status){
			staffId = result.bean.staffId;
			staffName = result.bean.staffName;
			eventInit();
		},true);
	});
});