require(['jquery1',
         'cfcoda',
         'assets/common/ajax_amd'
         ],function(Jquery1,Cfcoda,ajax){
	var staffInfo=null;
	var eventInit = function(){
		//初始化菜单
		initQuickMenu();
	};
	var getCache = function(){
		var param={
				service:"",
				method:"staffInfo",
				params:JSON.stringify({})
		};
		ajax.postJson('/zxw-demo-web/cacheAction!getCache.action',param,function(result,status){
			staffInfo=null;
			if(result.returnCode=="0000" && result.bean.param.beans[0]){
				staffInfo = result.bean.param.beans[0];
			}
		},true);
	};
	
	var initQuickMenu = function(){
		var params={
				service:"quickMenuService",
				method:"initquickMenu",
		}
		var param = {
				staffId:"zhangxuewei"
		}
		ajax.postJson('/zxw-demo-web/commonAction!execute.action',params,function(result,status){
			var mainMenus=[];
			var pageMenu1=[];
			var pageMenu2=[];
			for(var i=0;i<result.beans.length;i++){
				switch(result.beans[i].menutype){
				case "0":
					debugger;
					if(result.beans[i].menuname=="人员管理" && staffInfo.roleId=="101" ){
						result.beans[i].menuurl="src/moudlehtml/staffList/staffList.html";
					};
					mainMenus.push('<li><p>'+result.beans[i].menuname+'</p><a href="#" onclick="parent.addTab(\''+result.beans[i].menuurl+'\',\''+result.beans[i].menuname+'\')"><img src="'+result.beans[i].menuico+'" width="'+result.beans[i].icowidth+'" height="'+result.beans[i].icoheight+'" /></a></li>');
					break;
				case "1":
					pageMenu1.push('<li><p>'+result.beans[i].menuname+'</p><a href="#" onclick="parent.addTab(\''+result.beans[i].menuurl+'\',\''+result.beans[i].menuname+'\')"><img src="'+result.beans[i].menuico+'" width="'+result.beans[i].icowidth+'" height="'+result.beans[i].icoheight+'" /></a></li>');
					break;
				case "2":
					pageMenu2.push('<li><p>'+result.beans[i].menuname+'</p><a href="#" onclick="parent.addTab(\''+result.beans[i].menuurl+'\',\''+result.beans[i].menuname+'\')"><img src="'+result.beans[i].menuico+'" width="'+result.beans[i].icowidth+'" height="'+result.beans[i].icoheight+'" /></a></li>');
				break;
				default:
				  
				}
			}
			$(".desktop_wrap").html(mainMenus.join(""));
			$("#pane-1 #page_1").html(pageMenu1.join(""));
			$("#pane-2 #page_2").html(pageMenu2.join(""));
		},true);
	}

	$(function() {
		getCache();
		//页面加载完成后执行初始化事件函数
		eventInit();
	});	
});