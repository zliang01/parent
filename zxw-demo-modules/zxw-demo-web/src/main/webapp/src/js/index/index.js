require(['kandtabs',
         'autoheight',
         'easing',
         'assets/common/ajax_amd'
         ],
	function(Dandtabs,Autoheight,Easing,ajax){
	var spans=[];
	var iocs = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r'];
	var eventInit = function(){
		$('.logout').click($.proxy(logout,this));
		$('#logout').click($.proxy(logout,this));
		$('#quit').click($.proxy(logout,this));
		//初始化菜单
		initSysMenu();
		initExamMsg();
	}
	var initExamMsg = function(){
		var params = {
				service:"queryMsgService",
				method:"queryMsgInfo"
		}
		s=getid("exam_msg_div1");
		s2=getid("exam_msg_div2");
		s3=getid("exam_msg_div3");
		$.ajax({
			url: "/zxw-demo-web/commonAction!execute.action",
			data:params,
			success:function(result){
				s2.innerHTML = result.beans[0].msgInfo;
			}
		})
		s3.innerHTML=s2.innerHTML;
		timer=setInterval(mar,30000)
	}
	function mar(){
		var params = {
				service:"queryMsgService",
				method:"queryMsgInfo"
		}
		$.ajax({
			url: "/zxw-demo-web/commonAction!execute.action",
			data:params,
			success:function(result){
				s2.innerHTML = result.beans[0].msgInfo;
			}
		})
		s3.innerHTML=s2.innerHTML;
		if(s2.offsetWidth<=s.scrollLeft){
			s.scrollLeft-=s2.offsetWidth;
		}else{
			s.scrollLeft++;
		}
	}
	function getid(id){
		return document.getElementById(id);
	}
	var initSysMenu = function(){
		var params={
				service:"sysMenuService",
				method:"initSysMenu",
		}
		var param = {
				staffId:"zhangxuewei"
		}
		ajax.postJson('/zxw-demo-web/commonAction!execute.action',params,function(result,status){
			//菜单数组长度
			var menuLen = result.beans.length;
			for(var i=0;i<menuLen;i++){
				var firstMenuSpans=[];
				var firstMenus = result.beans[i].firstMenu;
				var firstMenuLen = 0;
				if(firstMenus){
					firstMenuLen=firstMenus.length;
				}
				for(var j=0;j<firstMenuLen;j++ ){
					firstMenuSpans.push('<li><a href="#" onclick="parent.addTab(\''+firstMenus[j].url+'\',\''+firstMenus[j].menuName+'\')" title='+firstMenus[j].menuName+'>'+firstMenus[j].menuName+'</a></li>');
				}
				var menuName = result.beans[i].menuName;
				
				if(i>menuLen/2){
					spans.push('<li><a href="#" class="icon_'+iocs[i]+'">'+menuName+'</a>'
							+'<ul>'
							+firstMenuSpans.join("")
							+' </ul></li>'
					);
				}else{
					spans.push('<li><a href="#" class="icon_'+iocs[i]+'">'+menuName+'</a>'
							+'<ul style="position:relative; bottom:30px;">'
							+firstMenuSpans.join("")
							+' </ul></li>'
					);
				}

			}
			$("#sysMenu").html(spans.join(""));
		},true);
	};
	var logout=function(){
		var relust=confirm("是否注销")
		if(relust){
			ajax.postJson('/zxw-web/front/sh/login!logout?uid=logout01',{},function(result,status){
				window.location.href="/zxw-web/login.html";
			},true);
		}
	}
	/**
	 * 1. 初始化选项开
	 * 1.基本结构
           $(function(){
              $("dl").KandyTabs();
            })
	 * 
	 */
    $(function() {
	    tab=$("#slide").KandyTabs({
	    del:true,//是否启用删除Tab选项功能；默认不启用；启用后会在Tab的每个选项按钮右上方显示一个“x”。
	    scroll:true,//Tab选项个数超出Tab的宽度时启用卷轴功能，以避免选项按钮变成两行影响美观；默认不启用；启用后会在Tab选项按钮后追加一对“< >”。
	    trigger:'click',//"mouseover"	Tab触发的方式，支持默认事件及自定义事件。
	    custom:function(b,c,i){//function($btn,$cont,index,$tab,this){}	自定义效果，即切换后自定义的动画效果，效果见Slide效果演示三；
	    	//btn=选项卡按钮、cont=选项卡内容、index=当前索引、tab=当前选项卡；this=当前选项卡实例化对象；请按顺序匹配。
			$("p",c).fadeOut();
			//c.seq(i).find("p").slideDown(1500);
			index=i;
		},
	    done: function(btn,cont,tab){//function($btn,$cont,$tab,this){}	Tab完成后回调函数；
	    	//btn=选项卡按钮、cont=选项卡内容、tab=当前选项卡；this=当前选项卡实例化对象；请按顺序匹配。
	    	$("#slide .tabbtn").each(function(i)
	    	{
	    	if($(this).text().indexOf("我的桌面")>-1)//如果当前选项卡是我的桌面
	    	{
			$(this).css({"background":"#027be4","border-bottom":"1px solid #027be4","font-weight":"bold","color":"#ffffff"});//修改选项景色
	        $(this).find('.tabdel').text("");//	去除关闭按钮
	    	}	
	    	});
	      setIframeH();//前台设定IFRAME高度 最好在在登录时把高度获取存放到session供其他IFRAME使用
	    }
      });
  });
	$(function() {
		eventInit();
	});

});
