/**
*	@author: zhangxuewei
*	@date: 2017-06-11
* 	@desc: 弹出框
*/
define(['jqueryAlert',
        'text!../../../../src/moudlehtml/utilhtml/showAlert.html'
        ], function(Jquery){
	var html ;
	$(function(){
		debugger;
		objClass();
	});
	var objClass = function(){
		debugger;
		var w,h,className;
		html = '../../../src/moudlehtml/utilhtml/demoalert.html'
		$el =$("#wrapper");
		window.onresize = function(){  
			alert('onresize');
			getSrceenWH();
		} 
		$(window).resize(function() {
			alert('resize');
			getSrceenWH();
			});
		//加载初始化方法事件
		eventInit();

	}
	
	//事件初始化，由JS初始化时自动调用
	var eventInit = function(){
		debugger;
		alert('eventInit');
		showSrceen();
	}
	function showSrceen(){
		alert('showSrceen');
		getSrceenWH();
		$el.find('#dialogHtml').load(html);
		//显示弹框
			alert('显示弹框');
			className = 'animatedbounceIn';
			$('#dialogBg').fadeIn(300);
			$('#dialog').removeAttr('class').addClass(className).fadeIn();
		
		//关闭弹窗
		$('.claseDialogBtn').click(function(){
			alert('关闭弹窗');
			$('#dialogBg').fadeOut(300,function(){
				$('#dialog').addClass('bounceOutUp').fadeOut();
			});
		});
		
	}
	
	
	
	
	function getSrceenWH(){
		w = $(window).width();
		h = $(window).height();
		$('#dialogBg').width(w).height(h);
	}
/*	var showAlert = {
			eventInit();	
			
			
		claseDialog : function() {
			$('#dialogBg').fadeOut(300,function(){
				$('#dialog').addClass('bounceOutUp').fadeOut();
			});
			
			
		},

		showDialog : function() {
			debugger;
			className = $(this).attr('class');
			$('#dialogBg').fadeIn(300);
			$('#dialog').removeAttr('class').addClass('animatedbounceIn').fadeIn();
		}
	};*/
	return objClass;
});