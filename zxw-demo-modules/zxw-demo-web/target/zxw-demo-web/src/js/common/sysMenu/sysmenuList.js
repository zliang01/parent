require(['list','Util','zTree'],function(List,Util,zTree){
	//定义全局容器
	var  $el;
	var _dialog = null;
	var eventInit = function(){
		$el = $('#sysMenuContent');
		$('.sysMenubtnSearch').click($.proxy(sysMenubtnSearch,this));
		$('.sysMenubtnadd').click($.proxy(sysMenubtnadd,this));
		$('.sysMenubtnClear').click($.proxy(sysMenubtnClear,this));
		//首次加载执行一次查询
		sysMenubtnSearch();
		//初始化树数据
		initZtree();
	}
	//搜索方法
	var sysMenubtnSearch = function (){
		var result = getForm();
		$("#sysMenuTable").dataTable({
	        debug: true,
	        check: true,
	        pageCapacity:10,
	        dataForm:result,
	        loading:true,
	        oddEven:true,
	        url: "../../../front/sh/common!execute?uid=sysmenuMaintain01",
	        style: {"font-size": "12px", "width": ""},
	        align:"center",
	        ButtonStyle:{fontColor:"#ffffff",backgroundColor:"#10AA9C"},
	        columns: [
	            {ColumnName: "menuid", title: "菜单编码", width: "50"},
	            {ColumnName: "parentid", title: "父节点编号", width: "50"},
	            {ColumnName: "menuname", title: "菜单名称", width: "50"},
	            {ColumnName: "menuurl", title: "菜单地址", width: "50"},//设置img:true,后台数据反回url这一列就生成图片显示
	            {ColumnName: "menuauth", title: "菜单权限", width: "50"},
	            {title: "编辑", button: "edit", buttonName: "编辑", width: "30"},
	            {title: "删除", button: "del", buttonName: "删除", width: "30"}
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
	var sysMenubtnClear = function (){	
		var $form = $('#sysMenuContent form');
		var result = Util.form.formClear($el,$form);
	}
	
	//新增人员信息
	var sysMenubtnadd = function(){

	};
	
	
	var getForm= function(){
		var $form = $('#sysMenuContent form');
		var result = Util.form.serialize($form);
		return result;
	}
	
	var initZtree = function(){
		var setting = {
				data: {
					simpleData: {
						enable: true
					}
				}
			};

		var zNodes =[
		 			{ name:"pNode 01", open:true,
		 				children: [
		 					{ name:"pNode 11",
		 						children: [
		 							{ name:"leaf111"},
		 							{ name:"leaf112"},
		 							{ name:"leaf113"},
		 							{ name:"leaf114"}
		 						]},
		 					{ name:"pNode 12",
		 						children: [
		 							{ name:"leaf121"},
		 							{ name:"leaf122"},
		 							{ name:"leaf123"},
		 							{ name:"124"}
		 						]},
		 					{ name:"pNode 13", isParent:true}
		 				]},
		 			{ name:"pNode 02",
		 				children: [
		 					{ name:"pNode 21", open:true,
		 						children: [
		 							{ name:"211"},
		 							{ name:"212"},
		 							{ name:"213"},
		 							{ name:"214"}
		 						]},
		 					{ name:"pNode 22",
		 						children: [
		 							{ name:"221"},
		 							{ name:"222"},
		 							{ name:"223"},
		 							{ name:"224"}
		 						]},
		 					{ name:"pNode 23",
		 						children: [
		 							{ name:"231"},
		 							{ name:"232"},
		 							{ name:"233"},
		 							{ name:"34"}
		 						]}
		 				]},
		 			{ name:"pNode 3", isParent:true}

		 		];
		
		 zTreeObj = $.fn.zTree.init($("#ST_zTree"), setting, zNodes);
	}
	
	$(function() {
		//页面加载完成后执行初始化事件函数
		eventInit();
	});
});