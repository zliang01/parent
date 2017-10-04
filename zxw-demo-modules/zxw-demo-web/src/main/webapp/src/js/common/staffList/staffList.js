require(['list','Util'],function(List,Util){
	//定义全局容器
	var  $el;
	var _dialog = null;
	var eventInit = function(){
		$el = $('#staffListContent');
		$('.staffListbtnSearch').click($.proxy(staffListbtnSearch,this));
		$('.staffListbtnadd').click($.proxy(staffListbtnadd,this));
		$('.staffListbtnClear').click($.proxy(staffListbtnClear,this));
		//首次加载执行一次查询
		staffListbtnSearch();
	}
	//搜索方法
	var staffListbtnSearch = function (){
		var result = getForm();
		var param={
				service:"staffInfoService",
				method:"queryStaffInfo",
				params:JSON.stringify(result)
		};
		$("#staffListTable").dataTable({
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
	            {ColumnName: "staffId", title: "员工ID", width: ""},
	            {ColumnName: "staffName", title: "员工姓名", width: ""},//设置img:true,后台数据反回url这一列就生成图片显示
	            {ColumnName: "staffEmployee",title: "员工部门", width: ""},
	            {ColumnName: "roleName", title: "员工角色", width: ""},
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
		        	delstaffList(row);
	        	};
	        },
	        showClick: function (row) {
	        }
	        
	    });
	};
	var staffListbtnClear = function(){
		$el.find("#staffId").val("");
		$el.find("#staffName").val("");
		$el.find("#staffEmployee").val("");
		$el.find("#roleName").val("");
	};
	var saveStaffList=function(row){
		debugger;
		var param={
				service:"",
				method:"",
				params:JSON.stringify(row)
		}
		Util.ajax.postJson('/zxw-demo-web/cacheAction!saveCache.action',param,function(result,status){	
		},false);
	};
	//修改人员信息
	var editPerList = function(row){
		//储存修改的人员信息
		saveStaffList(row);
		var param = {};
		 Util.showDialog.showDialog({
		 title:'人员信息修改',   //弹出窗标题
		 modal : true,
      	 show : true,
		 url:'../../moudlehtml/staffList/staffedit.html',    //要加载的模块
		 param:param,    //要传递的参数，可以是json对象
		 width:900,  //对话框宽度
		 height:270  //对话框高度
	});
};
	
function importIPlan(){
    var pathName = document.getElementById("excelFile").value;
    var suffix = pathName.substring(pathName.lastIndexOf('.')+1, pathName.length);
    if((suffix != "xls") && (suffix != "xlsx")){
        alert("请选择excel文件！");
        document.getElementById("usermanage").reset();//表单内容设置为空
        return;
    };
    
    importIcPlan(pathName);
    
};
function importIcPlan(pathName){
    var startIndex = pathName.lastIndexOf('\\');
    var endIndex = pathName.lastIndexOf('.');
    var fileName = pathName.substring(startIndex+1, endIndex);
    var strs= new Array(); //定义一数组
    strs = fileName.split("_");
    if((strs.length != 2) && (strs[0] != "All") && (strs[1] != "User")){
        alert("对不起！请选择正确的excel文件，文件名如：All_User.xlsx");
        document.getElementById("usermanage").reset();
        return;
    }
    //如果不对文件名进行限制的话只需要下面两句话 实现跳转就可以
    document.getElementById("usermanage").action="importUsers.action";
    document.getElementById("usermanage").submit();
    
}	
	//删除人员信息
	var delstaffList = function(row){
		var param={
				service:"staffInfoService",
				method:"delStaffInfoById",
				params:JSON.stringify({
					staffId:row.staffId
				})
		}
		Util.ajax.postJson('/zxw-demo-web/commonAction!execute.action',param,function(result,status){
			if(result.returnCode=="0000" && result.bean.result != "0"){
				alert("删除成功,人员编号:"+row.staffId);
				//刷新list
				staffListbtnSearch();
			}else{
				alert("删除失败,人员编号:"+row.staffId);
			}
			
			
		},true);
	};
	//新增人员信息
	var staffListbtnadd = function(){
		 Util.showDialog.showDialog({
			 title:'新增人员信息',   //弹出窗标题
			 modal : true,
	      	 show : true,
			 url:'../../moudlehtml/staffList/staffadd.html',    //要加载的模块
			 width:900,  //对话框宽度
			 height:270  //对话框高度
		});
/*			window.top.addTab('src/moudlehtml/personnelList/personadd.html','通讯录2');
			return false;*/
	};
	//获取输入框参数
	var getForm= function(){
		var $form = $('#staffListContent form');
		var result = Util.form_amd.serialize($form);
		return result;
	};
	$(function() {
		//页面加载完成后执行初始化事件函数
		eventInit();
	});
});