
define(['Util','list'
         ], 
         function(Util,list){
	list;
	debugger;
	var _list ;
    var initialize = function(){
    	listInitNew();
    };
    
    var listInitNew = function(){
    	 var config = {
	                el:$('.jf-search-result')[0],
	                field:{
	                    key:'wrkfmId',
	                    items:[
	                       { text:'考试科目',
	                    	 name:'testTypeName'
	                       },
	                       { text:'试卷名称',name:'paperName' },
	                       { text:'答案名称',name:'answerName'},
	                       { text:'导入人',name:'creater' }
	                    ]
	                   
	                },
	               page:{  //分页设置
	            	  customPages: [2, 3, 5, 10, 15, 20, 30, 50],
                   perPage:8,     //每页显示多少条记录
	                  total:true,     //是否显示总记录数
	                  align:'right'  //分页条对齐方式
	              },
	                data:{
	                    url:'commonAction!execute.action'
	                }
            }
    	   _list = new list(config);
    	 debugger;
    	   _list.search({"aaa":"11",service:"testManagerService",method:"queryByPaperType"});
    	 	
    	 
    }
    
 	$(function() {
		//页面加载完成后执行初始化事件函数
		initialize();
	});

});
