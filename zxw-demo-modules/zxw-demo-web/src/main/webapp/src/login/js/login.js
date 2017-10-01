//2016 12 12 by xuexiangqian
define(['assets/common/ajax_amd','jquery1'],function(ajax,Jquery1){
	var username;
	var password;
	var objClass = function(){
		//加载初始化方法事件
		eventInit();
	}
	//事件初始化，由JS初始化时自动调用
	var eventInit = function(){
		//登陆点击事件
		$('#login_zxw').click($.proxy(login,this));
		initLogin();
	}
	var login = function(){
		username = null;
		password=null;
		username =  $('#username').val();
		password = $('#password').val();
		var booleanU = isNotNull(username);
		var booleanP = isNotNull(password);
		if(!booleanU){
			alert("用户名不能为空");
			return;
		}
		if(!booleanP){
			alert("密码不能为空");
			return;
		}
		//进行后台用户名和密码校验
		checkLogin();
		
	}
	//进行后台用户名和密码校验
	var checkLogin = function(){
		var param={
			staffid:username,
			password:password
		};
		ajax.postJson('/zxw-web/front/sh/login!index?uid=login01',param,function(result,status){
		if(result.returnCode=="0000"){
			window.location.href="/zxw-web/index.html";
		}else{
			alert("登陆异常，请重新登陆:"+result.returnMessage);
		}
		
		},true);
	}
	
	//初始化登陆逻辑
	var initLogin = function(){
		$("#password").focus(function() {
			$("#left_hand").animate({
				left : "150",
				top : " -38"
			}, {
				step : function() {
					if (parseInt($("#left_hand").css("left")) > 140) {
						$("#left_hand").attr("class", "left_hand");
					}
				}
			}, 2000);
			$("#right_hand").animate({
				right : "-64",
				top : "-38px"
			}, {
				step : function() {
					if (parseInt($("#right_hand").css("right")) > -70) {
						$("#right_hand").attr("class", "right_hand");
					}
				}
			}, 2000);
		});
		//失去焦点
		$("#password").blur(function() {
			$("#left_hand").attr("class", "initial_left_hand");
			$("#left_hand").attr("style", "left:100px;top:-12px;");
			$("#right_hand").attr("class", "initial_right_hand");
			$("#right_hand").attr("style", "right:-112px;top:-12px");
		});
	}
	
	
	
    //定义判断非空的方法
 	var isNotNull = function(str){
    	var result = true;
    	if(str == "" || str == undefined || str == null || "undefined" == str){
    		result = false;
    	}
    	return result;
    };

    //定义登录的方法
 	var  goIndex = function(){};         

 	 return objClass();
});


   