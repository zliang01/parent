require(['Util','ajax'],function(Util,ajax){
	var  $el;
	var eventInit = function(){
		document.getElementById("confirmMsg").onclick = function(){
			var msgInfo = $('#msgInfo').val();
			//需要获取到登录的用户名或staffId
			var params = {
					service:"queryMsgService",
					method:"insertMsgInfo",
					params:JSON.stringify({
						msgInfo:msgInfo,
						createUser:"wangweisong"
					})
			}
			if(msgInfo!='在此处填写要发布的信息'){
				ajax.postJson('/zxw-demo-web/commonAction!execute.action',params,function(result,status){
					if(result.returnCode=='0000'){
						alert('信息发布成功！');
						$('#msgInfo').val('');
					} else {
						alert('系统错误，信息发布失败！');
						$('#msgInfo').val('');
					}
				},true);
			}
		};
	}
	$(function() {
		//页面加载完成后执行初始化事件函数
		eventInit();
	});
});