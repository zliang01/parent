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
		var param={
				service:"queryExamineeService",
				method:"queryExamineeInfo",
				page:"10",
				params:JSON.stringify(result)
		}
		$("#perListTable").dataTable({
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
	            {ColumnName: "number", title: "序号", width: ""},
	            {ColumnName: "code", title: "编码", width: ""},//设置img:true,后台数据反回url这一列就生成图片显示
	            {ColumnName: "company",title: "单位", width: ""},
	            {ColumnName: "name", title: "姓名", width: ""},
	            {ColumnName: "sex", title: "性别", width: ""},	       
	            {ColumnName: "idCard",title: "身份证", width: ""},
	            {ColumnName: "examineeJob", title: "职务", width: ""},
	            {ColumnName: "workType",title: "工种", width: ""},
	            {ColumnName: "applySubject", title: "报考科目", width: ""},
	            {ColumnName: "applySubjectCode", title: "科目编码", width: ""},
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
		var result = Util.form_amd.serialize($form);
		return result;
	}
	$(function() {
		//页面加载完成后执行初始化事件函数
		eventInit();
	});
});