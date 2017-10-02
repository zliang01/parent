require(['list','Util'],function(List,Util){
	//定义全局容器
	var  $el;
	var _dialog = null;
	var eventInit = function(){
		$el = $('#workRecordContent');
		$('.workRecordbtnSearch').click($.proxy(workRecordbtnSearch,this));
		$('.workRecordbtnadd').click($.proxy(workRecordbtnadd,this));
		$('.workRecordbtnClear').click($.proxy(workRecordbtnClear,this));
		//首次加载执行一次查询
		//laydate({elem: '#beginTime'});
		//laydate({elem: '#endTime'});
		workRecordbtnSearch();
	}
	//搜索方法
	var workRecordbtnSearch = function (){
		var result = getForm();
		var param={
				service:"queryWorkRecordService",
				method:"queryWorkRecord",
				params:JSON.stringify({
					staffId:"zhangxuewei"
				})
		}
		var form = {
				params:result
		}
		$("#workRecordTable").dataTable({
	        debug: true,
	        check: true,
	        pageCapacity:10,
	        dataForm:param,
	        loading:true,
	        oddEven:true,
	        url: "/zxw-demo-web/commonAction!execute.action",
	        style: {"font-size": "12px", "width": ""},
	        align:"center",
	        ButtonStyle:{fontColor:"#ffffff",backgroundColor:"#10AA9C"},
	        columns: [
	            {ColumnName: "beginTime", title: "开始时间", width: "50"},
	            {ColumnName: "staffName", title: "员工姓名", width: "50"},
	            {ColumnName: "workContent", title: " 工作内容", width: "200"}//设置img:true,后台数据反回url这一列就生成图片显示
	           // {title: "编辑", button: "edit", buttonName: "编辑", width: "20"}
	            //{title: "删除", button: "del", buttonName: "删除", width: "30"}
	        ],
	        Click: function (row) {
	        },
	        doubleClick: function (row) {
	        }
	        ,
	        editClick: function (row) {
	        }
	        ,
	        delClick: function (row) {
	        },
	        showClick: function (row) {
	        }
	        
	    });
	};
	//情况输入框数据
	var workRecordbtnClear = function (){	
		var $form = $('#workRecordContent form');
		var result = Util.form_amd.formClear($el,$form);
	}
	
	//新增人员信息
	var workRecordbtnadd = function(){
		var result = getForm();
		var param = {form:result};
		 Util.showDialog.showDialog({
		 title:'添加工作内容',   //弹出窗标题
		 modal : true,
      	 show : true,
		 url:'../../moudlehtml/workRecord/workRecordEdit.html',    //要加载的模块
		 param:param,    //要传递的参数，可以是json对象
		 width:560,  //对话框宽度
		 height:460  //对话框高度
	});
};
	
	
	var getForm= function(){
		var $form = $('#workRecordContent form');
		var result = Util.form_amd.serialize($form);
		return result;
	}
	$(function() {
		//页面加载完成后执行初始化事件函数
		eventInit();
	});
});