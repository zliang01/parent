
/*
*   @author: zhangxuewei
*   @date: 2016-01-18
*/
define(['jquery'],function(){

    var config = {
        serialize:function($form){
        	debugger;
            var arr = $form.serializeArray();
            var obj = {}
            $.each(arr, function(item, i){
                obj[arr[item].name] = arr[item].value;
            })

            return obj;
        },
        
        formClear:function($el,$form){
        	var arr = $form.serializeArray();
            $.each(arr, function(item, i){
            	$el.find("#"+arr[item].name).val("");
            })
        }
    }
    return config;
});


          