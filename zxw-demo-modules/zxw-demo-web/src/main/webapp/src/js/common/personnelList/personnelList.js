require(['list','Util'],function(List,Util){
	//定义全局容器
	var  $el;
	var _dialog = null;
	var eventInit = function(){
		$el = $('#perListContent');
		$('.perListbtnSearch').click($.proxy(perListbtnSearch,this));
		$('.perListbtnadd').click($.proxy(perListbtnadd,this));
		$('.perListbtnClear').click($.proxy(perListbtnClear,this));
		//首次加载执行一次查询
		perListbtnSearch();
	}
	//搜索方法
	var perListbtnSearch = function (){
		var result = getForm();
		var param={
				service:"examineeService",
				method:"queryExamineeInfo",
				params:JSON.stringify(result)
		};
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
	        	editPerList(row);
	        }
	        ,
	        delClick: function (row) {
	        	var boolean = confirm('是否确认删除?');
	        	if(boolean){
		        	delPerList(row);
	        	};
	        },
	        showClick: function (row) {
	        }
	        
	    });
	};
	var perListbtnClear = function(){
		$el.find("#number").val("");
		$el.find("#code").val("");
		$el.find("#company").val("");
		$el.find("#name").val("");
		$el.find("#sex").val("");
		$el.find("#idCard").val("");
		$el.find("#examineeJob").val("");
		//$("#perListSelect").find("option[text='']").attr("selected",true);
		$el.find("#applySubject").val("");
		$el.find("#applySubjectCode").val("");
	};
	var savePerList=function(row){
		var param={
				service:"",
				method:"",
				params:JSON.stringify(row)
		}
		Util.ajax.postJson('/zxw-demo-web/cacheAction!saveCache.action',param,function(result,status){	
		},true);
	};
	//修改人员信息
	var editPerList = function(row){
		//储存修改的人员信息
		savePerList(row);
		var param = {};
		 Util.showDialog.showDialog({
		 title:'人员信息修改',   //弹出窗标题
		 modal : true,
      	 show : true,
		 url:'../../moudlehtml/personnelList/personedit.html',    //要加载的模块
		 param:param,    //要传递的参数，可以是json对象
		 width:1000,  //对话框宽度
		 height:300  //对话框高度
	});
};
	
	
	
	
	//删除人员信息
	var delPerList = function(row){
		var param={
				service:"examineeService",
				method:"delExamineeInfoByIdCard",
				params:JSON.stringify({
					code:row.code
				})
		}
		Util.ajax.postJson('/zxw-demo-web/commonAction!execute.action',param,function(result,status){
			if(result.returnCode=="0000" && result.bean.result != "0"){
				alert("删除成功,人员编号:"+row.code);
				//刷新list
				perListbtnSearch();
			}else{
				alert("删除失败,人员编号:"+row.code);
			}
			
			
		},true);
	};
	//新增人员信息
	var perListbtnadd = function(){
			window.top.addTab('src/moudlehtml/personnelList/personadd.html','通讯录2');
			return false;
	};
	//获取输入框参数
	var getForm= function(){
		var $form = $('#perListContent form');
		var result = Util.form_amd.serialize($form);
		return result;
	};
	$(function() {
		//页面加载完成后执行初始化事件函数
		eventInit();
	});
});