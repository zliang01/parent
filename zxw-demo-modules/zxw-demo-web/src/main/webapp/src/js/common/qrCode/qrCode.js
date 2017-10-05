require(['Util','list'],function(Util,List){
	//定义全局容器
	var  $el;
	var _dialog = null;
	var eventInit = function(){
		$el = $('#qrCodeContent');
		$('.qrCodeSearch').click($.proxy(qrCodeSearch,this));
		$('.qrCodeClear').click($.proxy(qrCodeClear,this));
		//首次加载执行一次查询
		selectInit("001","deptId");
		selectInit("002","workTypeId");
		selectInit("003","subjectId");
	}
	var selectInit = function(type,htmlId){
		var param1 = {
				service:"commonConstantsService",
				method:"getCommonConstants",
				params:JSON.stringify({
					"type": type
				})
		}
		Util.ajax.postJson('/zxw-demo-web/commonAction!execute.action',param1,function(result,status){
			var html = "<option value=''>请选择</option>";
			if("003"==type){
				$.each(result.beans,function(index,value){
					html+='<option value="'+value.subjectId+'">'+value.subjectName+'</option>'
				});
			}else{
				$.each(result.beans,function(index,value){
					html+='<option value="'+value.dataId+'">'+value.dataName+'</option>'
				});
			}
			$("#"+htmlId).html(html);
		},true);
	}
	//搜索方法
	var qrCodeSearch = function (){
		var result = getForm();
		var param={
				service:"examineeApplicationService",
				method:"queryExamineeApplication",
				params:JSON.stringify(result)
		};
		$("#qrCodeListTable").dataTable({
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
	            {ColumnName: "applicationId", title: "考生试卷ID", width: ""},
	            {ColumnName: "deptName", title: "员工部门", width: ""},
	            {ColumnName: "workTypeName",title: "工种类别", width: ""},
	            {ColumnName: "subjectName",title: "报考科目", width: ""},
	            {ColumnName: "examineeId", title: "考生编号", width: ""},
	            {ColumnName: "QRCodeURL", title: "二维码", width: "",img:true}//设置img:true,后台数据反回url这一列就生成图片显示
	           /* {title: "查看", button: "show", buttonName: "查看", width: 50},*/
	        ],
	        doubleClick: function (row) {
	        }
	    });
	};
	var qrCodeClear = function(){};
	
	//获取输入框参数
	var getForm= function(){
		var $form = $('#qrCodeContent form');
		var result = Util.form_amd.serialize($form);
		return result;
	};
	$(function() {
		//页面加载完成后执行初始化事件函数
		eventInit();
	});
});