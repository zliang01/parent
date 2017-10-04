
define('lib/requirejs/css.min!components/select/select',[],function(){});
/*
 * 组件-select
 */
define('select',['eventTarget',
        'lib/requirejs/css.min!components/select/select.css'
    ],
    function (EventTarget) {
    var VERSION = '1.0.3';
    // var arr = [];

    var objClass = function(options){
        this.arr = [];
        // 对this.$el赋值前对options.el类型判断，jquery对象，DOM对象，字符串
        if(options.el && options.el instanceof jQuery){
            this.$el = options.el;
        }else if(options.el && (options.el.nodeType==1 || typeof (options.el) == 'string')){
            this.$el = $(options.el);
        }else{
            this.$el = $('<div></div>');         
        }
        this.$el.addClass('sn-select'); 
        EventTarget.call(this);
        // this._list={}
        initialize.call(this, options);  
        eventInit.call(this);
    }
    
    $.extend(objClass.prototype, {
        version:VERSION,
        // 设置下拉框选中项
        setValue : function(value){
            if(!(this.$el.find("select").prop('disabled'))){
                if(value !=''){
                    if(typeof value == 'string'){
                        this.$el.find("option[value="+value+"]").prop("selected",true);
                    }else if(typeof value == 'number'){
                        this.$el.find("option:eq("+value+")").prop("selected",true);
                    }else if(Object.prototype.toString.apply(value)=== "[object Array]"){
                        var pro = value[0];
                        var val = value[1];
                        $.each(this.arr, $.proxy(function(i, item){                           
                            if(item[pro] == val){
                                this.$el.find("option[value="+item.value+"]").prop("selected",true);
                            }        
                        },this))
                    }
                }else{
                    this.$el.find("option:eq(0)").prop("selected",true);
                }
            }
                                  
        },
        // 获取下拉框的值
        getSelected : function(value){
            var ind = this.$el.find("option:selected").prop('index');           
            var obj = this.arr[ind];
            if(value){
                return obj[value]; 
            }else{
                return obj;
            }
        },
        // 启用下拉框
        enable:function(e){
            this.$el.find("select").prop("disabled",false);
        },   
        disabled:function(){
            this.$el.find("select").prop("disabled",true);
        }
        
    },EventTarget.prototype);   
    
    var getJson=function(options,datas){
        if(!options.value){
            options.value='';
            var defaultObj={};
            defaultObj[options.valueField?options.valueField:"value"]='';
            defaultObj[options.textField?options.textField:"name"]=options.topOption?options.topOption:"请选择";
            datas.splice(0, 0, defaultObj)
        }
        return datas;    
    };

    var initialize = function(options){
        var datas = options.datas&&options.datas.slice(0);              
        if(datas && typeof (datas) == "object" && Object.prototype.toString.call(datas) == "[object Array]" && ( datas.length > 0)){
            //若配置项中默认选项为空时，添加下拉框提供首选择“请选择”，选中该首选项。
                if(!options.value){
                    options.value='';
                    datas.splice(0, 0, {value:"",name:options.topOption?options.topOption:"请选择"})
                }
                this.arr = datas;
             // this.arr = getJson(options,datas);
                render(this.$el, options, datas);                
                this.setValue(options.value);
                this.$el.find("select").prop("disabled",options.disabled);
        }else if(options && options.url && typeof (options.url) == 'string' && options.url.length > 0){
            $.ajax({
                type:'post',
                dataType:'json',
                url:options.url, 
                data:{},
                success:$.proxy(function(result){
                    if (result.returnCode == '0'){
                        //若配置项中默认选项为空时，添加下拉框提供首选择“请选择”，
                        //选中该首选项“请选择”，避免歧义。
                        if(!options.value){
                            options.value='';
                            result.beans.splice(0, 0, {value:"",name:options.topOption?options.topOption:"请选择"})
                        }
                 //     this.arr = getJson(options,result.beans);
                        this.arr = result.beans;
                        $.extend( result, options);
                        render(this.$el, options, result.beans);   
                        this.setValue(result.value);     
                        this.$el.find("select").prop("disabled",options.disabled);
                    }
                },this),
                error:function(err){
                    console.log('集成组件-下拉框 数据加载失败!');
                }
            });
        }else{
            console.log('集成组件-下拉框 数据加载失败!');
        };
    }

    var eventInit = function(){
        // 组件事件select.on("change",function(e,valueObj){ })
        this.$el.on("change","select",$.proxy(function(e){   
            //trigger这里change也可以命名为xx
            //调用的时候select.on("xx",function(e,valueObj){ })即可
            this.trigger("change",e,this.getSelected());
        },this))
    }

    var render = function($ele,options,result){
        // 渲染html内容
        if(options.label&&options.label!=''){
            $ele.append('<label>'+options.label+'</label>');
        }
        $ele.append('<div><select name="'+options.name+'" class="'+options.className+'"></div>');
        $.each(result, $.proxy(function(i, item){
            // console.log(item)
            if(i==0){
                $ele.find('select').append('<option value='+item.value+'>'+item.name+'</option>');
            }else{
                $ele.find('select').append('<option value='+item[options.valueField?options.valueField:"value"]+'>'+item[options.textField?options.textField:"name"]+'</option>');
            }   
        },this));
    };

    return objClass;
    
});




(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
('\r\n.sn-select select:disabled{background: #ddd;}\r\n\r\n.sn-select label {display: inline-block;\r\n    float: left;\r\n    text-align: right;\r\n}\r\n.sn-select>div {display: inline-block; text-align: left; }\r\n\r\n.sn-select label{color: #404040;text-align: right;}\r\n.sn-select>div>select{\r\n    font-size: 12px; padding:3px;\r\n}\r\n/*.sn-select .select_ui select{ font-size:12px }\r\n.sn-select .select_ui{border-radius: 2px;filter:progid:DXImageTransform.Microsoft.gradient(startColorStr=#fffcfcfc, endColorStr=#fff2f2f2); background:#f2f2f2; background:-webkit-gradient(linear, left top, left bottom, from(#fcfcfc), to(#f2f2f2)); background:-webkit-linear-gradient(top, #fcfcfc, #f2f2f2); background:-moz-linear-gradient(top, #fcfcfc, #f2f2f2); background:-o-linear-gradient(top, #fcfcfc, #f2f2f2); background:linear-gradient(to bottom, #fcfcfc, #f2f2f2); -webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; user-select:none;border: 1px solid #e0e0e0; display:inline-block; white-space:nowrap; position:relative; text-align:left;line-height: 23px; height:auto; width:auto; float:none; margin:0; *display:inline; *cursor:default; *filter:none; *zoom:1}\r\n.sn-select .select_focus_ui{filter:progid:DXImageTransform.Microsoft.gradient(startColorStr=#fff2f2f2, endColorStr=#fffcfcfc); background:#fcfcfc; background:-webkit-gradient(linear, left top, left bottom, from(#f2f2f2), to(#fcfcfc)); background:-webkit-linear-gradient(top, #f2f2f2, #fcfcfc); background:-moz-linear-gradient(top, #f2f2f2, #fcfcfc); background:-o-linear-gradient(top, #f2f2f2, #fcfcfc); background:linear-gradient(to bottom, #f2f2f2, #fcfcfc); *filter:none }\r\n.sn-select .select_ui .select_text_ui{ vertical-align:baseline; overflow:visible; background:#fff; display:block;color: #333;width: 108px;padding: 0 18px 0 8px;}\r\n.sn-select .select_ui select{ -moz-box-sizing:content-box; -ms-box-sizing:content-box; box-sizing:content-box; filter:alpha(opacity=0); position:absolute; background:#fff; min-width:100%; border:inherit; color:inherit; font:inherit; padding:1px; margin:-1px; height:100%; opacity:0; border:0; bottom:0; left:0; top:0; *left:-9999em; *padding:0; *margin:0;z-index: 2 }\r\n.sn-select .select_arrow{border-color: #888 transparent; border-top-color:inherit; border-width:5px 5px 0; border-style:solid; position:absolute; margin-top:-2px; overflow:hidden; right:7px; height:0; width:0; top:50%; *border-color:#f2f2f2; *border-top-color:#b7b7b7}\r\n.sn-select .select_ui:hover .select_arrow{ border-top-color:#9e9e9e }\r\n.sn-select .select_focus_ui .select_arrow{ border-top-color:inherit }\r\n.sn-select .select_menu_ui{ vertical-align:baseline; border:1px outset #ccc; white-space:nowrap; position:absolute; background:#fff; overflow:hidden; line-height:1.5; margin:1px -1px; list-style:none; cursor:default; min-width:100%; *width:100%; padding:0; top:100%; left:0 }\r\n.sn-select .select_menu_ui .option_ui{ padding:0 999px 0 3px; margin-right:-999px }\r\n.sn-select .select_menu_ui .option_hover_ui{ background:highlight; color:highlighttext }\r\n.sn-select .select_focus_ui, .profile textarea:focus, .profile [type=tel]:focus, .profile [type=date]:focus, .profile [type=text]:focus, .profile [type=password]:focus{ border-color:#b3b3b3 }\r\n*/\r\n/* border-right:1px solid #e5e5e5; */\r\n');
