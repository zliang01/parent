require(['list','Util'],function(List,Util){
	//定义全局容器
	var  $el;
	var _dialog = null;
	var eventInit = function(){
		$el = $('#perListContent');
		$('.perListbtnSearch').click($.proxy(perListbtnSearch,this));
		$('.perListbtnadd').click($.proxy(perListbtnadd,this));
		//首次加载执行一次查询
		perListbtnSearch();
	}
	//搜索方法
	var perListbtnSearch = function (){
		var result = getForm();
		$("#perListTable").dataTable({
	        debug: true,
	        check: true,
	        pageCapacity:10,
	        dataForm:result,
	        loading:true,
	        oddEven:true,
	        url: "../../../front/sh/common!execute?uid=login",
	        style: {"font-size": "12px", "width": ""},
	        align:"center",
	        ButtonStyle:{fontColor:"#ffffff",backgroundColor:"#10AA9C"},
	        columns: [
	            {ColumnName: "staffId", title: "员工编号", width: ""},
	            {ColumnName: "staffName", title: "员工姓名", width: ""},//设置img:true,后台数据反回url这一列就生成图片显示
	            {ColumnName: "url", img:true,title: "员工头像", width: ""},
	            {ColumnName: "staffOrg", title: "员工部门", width: ""},
	           /* {title: "查看", button: "show", buttonName: "查看", width: 50},*/
	            {title: "编辑", button: "edit", buttonName: "编辑", width: "50"},
	            {title: "删除", button: "del", buttonName: "删除", width: "50"}
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
	}
	
	//新增人员信息
	var perListbtnadd = function(){
			window.top.addTab('src/moudlehtml/personnelList/personadd.html','通讯录2');
			return false;
	};
	
	
	var getForm= function(){
		 var param = {
				 "width": '50',
				 "height": '60'
		 };
/*		 Util.showDialog.showDialog({
			 title:'图片',   //弹出窗标题
			 modal : true,
//			show : true,
			 url:'../../moudlehtml/utilhtml/demoalert.html',    //要加载的模块
			 param:param,    //要传递的参数，可以是json对象
			 width:224,  //对话框宽度
			 height:218  //对话框高度
		});*/
		var $form = $('#perListContent form');
		var result = Util.form.serialize($form);
		return result;
	}
	$(function() {
		//页面加载完成后执行初始化事件函数
		eventInit();
	});
});