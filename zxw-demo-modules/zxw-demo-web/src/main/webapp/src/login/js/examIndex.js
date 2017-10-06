define(['assets/common/ajax_amd','jquery1'],function(ajax,Jquery1){
	var username;
	var password;
	var objClass = function(){
		//加载初始化方法事件
		eventInit();
	}
	//事件初始化，由JS初始化时自动调用
	var eventInit = function(){
	    $('.loginbox0').css({'position':'absolute','left':($(window).width()-810)/2});
		$(window).resize(function(){  
	    $('.loginbox0').css({'position':'absolute','left':($(window).width()-810)/2});
	    }) 
		//登陆点击事件
		examLogin();
	}
	var examLogin = function(){
		
		
	};
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


   