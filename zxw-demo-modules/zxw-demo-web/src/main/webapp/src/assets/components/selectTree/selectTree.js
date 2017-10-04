
define('text!components/selectTree/selectTree.tpl',[],function () { return '{{#if label}}\r\n<label></label>\r\n{{/if}}\r\n<div class="has-formlayer">\r\n\t{{#if inputClassName}}\r\n    \t<input class="texts {{inputClassName}}" type="text" name="" value="">\r\n    {{else}}\r\n    \t<input class="texts bg-tree" type="text" name="" value="">\r\n    {{/if}}\r\n    <input class="values" type="hidden" name="" value="">\r\n</div>\r\n\r\n';});


define('text!components/selectTree/selectTreePanel.tpl',[],function () { return '<div class="formlayer-content {{className}}">\r\n    <div class="ztree" id="JS_tree">\r\n        <span class="formlayer-content-loading">加载中...</span>\r\n    </div>\r\n</div>\r\n<div class="formlayer-btns">\r\n    {{#if checkAllNodes}}\r\n    <label class="formlayer-btns-check" for="chkall">\r\n        <input id="chkall" type="checkbox">全选\r\n    </label>\r\n    <div>\r\n        {{#if check}}\r\n        <a href="#nogo" class="confirm t-btn t-btn-xs t-btn-blue">确定</a>\r\n        {{/if}}\r\n        <a href="#nogo" class="empty t-btn t-btn-xs">清空</a>\r\n    </div>\r\n    {{else}}\r\n        {{#if check}}\r\n        <a href="#nogo" class="confirm t-btn t-btn-xs t-btn-blue">确定</a>\r\n        {{/if}}\r\n        <a href="#nogo" class="empty t-btn t-btn-xs">清空</a>\r\n    {{/if}}\r\n</div>';});


define('lib/requirejs/css.min!components/selectTree/selectTree',[],function(){});

define('lib/requirejs/css.min!lib/zTree_v3/css/zTreeStyle/zTreeStyle',[],function(){});
/*
 * 组件-selectTree
 */
define('selectTree',['eventTarget', 'hdb',
    'text!components/selectTree/selectTree.tpl',
    'text!components/selectTree/selectTreePanel.tpl', 
    'lib/requirejs/css.min!components/selectTree/selectTree.css', 
    'lib/requirejs/css.min!lib/zTree_v3/css/zTreeStyle/zTreeStyle.css', 
    'zTree'], 
    function (EventTarget, hdb, tpl, panelTpl) {
    var VERSION = '1.0.6';
    var confirm = function(){
        var nodes = [];
        if (this.zTree.setting && this.zTree.setting.check && 
            this.zTree.setting.check.enable){
            if(this.options.childNodeOnly){
                var checkNodes=this.zTree.getCheckedNodes();
                $.each(checkNodes,function(key,val){
                    val.isParent||nodes.push(val);
                })
            }else{
                nodes = this.zTree.getCheckedNodes();
            }
        }else{
            nodes = this.zTree.getSelectedNodes();
            if (this.options.childNodeOnly == false){
                var parentNode = nodes[0].getParentNode();
                while (parentNode){
                    nodes.push(parentNode);
                    parentNode = parentNode.getParentNode();
                }
            }
            
        }
        if(this._listeners&&this._listeners['confirm']&&(this._listeners['confirm'][0](nodes)==false)) return false;
        this.json=this.zTree.getNodes();
        var textField = this.options.textField;
        var valueField = this.options.valueField;
        var nameArr = [],valueArr = [];
        for(var i = 0;i<nodes.length;i++){
            nameArr.push(textField && nodes[i][textField] || nodes[i].name || nodes[i].value || nodes[i].id);
            valueArr.push(valueField && nodes[i][valueField] || nodes[i].value || nodes[i].id)
        }
        var nameStr = nameArr.join(',');
        var valueStr = valueArr.join(',');
        $('.texts', this.$el).val(nameStr);
        $('.values', this.$el).val(valueStr).trigger("change");
        $('.formlayer',this.$el).remove();
    };
    var clear = function(){
        var nodes= this.zTree.getCheckedNodes();
        this.zTree.checkAllNodes(false);
        if(this._listeners&&this._listeners['clear']&&(this._listeners['clear'][0](nodes)==false)) return false;
        this.json=this.zTree.getNodes();
        $('.texts', this.$el).val('');
        $('.values', this.$el).val('');
        $('.formlayer',this.$el).remove();
    }
   /*
    *add by zhanglizhao 2016-03-02
    * 数据循环
    */
   var dateFilter=function(data,callback){
       for(var index in data){
           callback&&callback(data[index]);
           if(data[index].children&&data[index].children.length){
               dateFilter(data[index].children,callback)
           }
       }
    };

   var treeInit=function(callback){
        var defaultValue = this.$valueBox.val();
        var defaultCheckedArr = (defaultValue && defaultValue.split(",")) || [];
        var options = this.options;
        var asyncTreeInit = function(){
            var options = this.options;
            var asyncConfig = {
                enable:true,
                autoParam:["id=id","name=name","value=value"]
            };
            var setting={
                check:{
                    enable:(options && options.check) || false
                },
                async:$.extend(asyncConfig,options.async), 
                callback:{
                    onClick: onClick,
                    onAsyncSuccess:$.proxy(function(event, treeId, treeNode, msg){
                        treeCheckStatusInit.call(this);
                    },this)
                }
            };
            function onClick(e,treeId, treeNode) {
                var zTree = $.fn.zTree.getZTreeObj('JS_tree');
                zTree.expandNode(treeNode, {}, false, false);
            };
            setting.async.url= options.url;
            setting.async.dataFilter=function(treeId, parentNode, childNodes){
                return childNodes.beans;
            };
            this.zTree = $.fn.zTree.init($zTreeWrap,setting);
        }

        var normalTreeInit = function($zTreeWrap,is_first){
            var isCheck=(options && options.check) || false;

            if(is_first&&isCheck&&options.value){
                dateFilter(this.json,function(bean){
                    for(var i = 0; i<defaultCheckedArr.length;i++){
                        if(defaultCheckedArr[i] == bean[options.valueField]){
                            bean.checked=true;
                        }
                    }
                });
            }
            this.zTree = $.fn.zTree.init($zTreeWrap, {
                check:{
                    enable:isCheck
                },
                callback:{
                    onClick: onClick
                }
            },this.json);
            function onClick(e,treeId, treeNode) {
                var zTree = $.fn.zTree.getZTreeObj('JS_tree');
                zTree.expandNode(treeNode, {}, false, false);
            };
            if (options.expandAll){
                this.zTree.expandAll(true);
            }
        };
        var treeCheckStatusInit = function(){
            if (options.expandAll){
                this.zTree.expandAll(true);
            }
            var nodes = this.zTree.getNodesByFilter(function(node){
                return !node.isParent && $.inArray(node.value,defaultCheckedArr) >= 0;
            });
            for (var i = 0;i<nodes.length;i++) {
                this.zTree.checkNode(nodes[i], true, !this.options.childNodeOnly);
            }
        }
        if (options && options.url){
            var $zTreeWrap = $('.ztree',this.$el);
            if(options.async){
                asyncTreeInit.call(this);
            }else{
                if(this.json){
                    normalTreeInit.call(this,$zTreeWrap);
                }else{
                    var ajaxOptions = $.extend({
                        url:options.url, 
                        dataType:'json',
                        success:$.proxy(function(json,status){
                            if (status && json.returnCode == '0') {
                                this.json=json.beans;
                                normalTreeInit.call(this,$zTreeWrap,true);
                            }else{
                                console.log('the component of select tree init bad. search error')
                            }
                        }, this)
                    }, options.ajax);
                    $.ajax(ajaxOptions);
                }
            }

        }else{
            console.log('the component of select tree init bad. please set url for data.');
        }
    };
    var panelInit = function(e){
        e.stopPropagation();    //防止冒泡触发spaceClose
        var $textBox = $(e.currentTarget);
        this.$valueBox = $textBox.siblings('.values');
        var $formlayer = $('.sn-selectTree .formlayer');
        if($formlayer.length){
            var $con = $formlayer.closest('.sn-selectTree');
            if(!$con.is(this.$el)){
                $formlayer.remove();
            }
        }
        if($('.formlayer',this.$el).length==0){
            $('.has-formlayer',this.$el).append('<div class="formlayer formlayer-has-btns">');
            var template = hdb.compile(panelTpl);
            $('.formlayer',this.$el).html(template(this.options));
            if(this.options.checkAllNodes){
                $('.formlayer-btns',this.$el).addClass('formlayer-btns-check');
            }
            treeInit.call(this);   
        }
        $('input[type=checkbox]',this.$el).on('click',$.proxy(function(e){
            var checkedAll = $(e.currentTarget).is(':checked');
            this.zTree.checkAllNodes(checkedAll);
        },this));
    };
    var spaceClose = function(e,$formlayer){
        var $target = $(e.target||e.currentTarget);
        var $el = $formlayer.closest('.sn-selectTree');
        if($target.closest($el).length == 0){
           $formlayer.remove();
        }
    }
    var objClass = function(config){
        initialize.call(this,config);
    }; 
    var initialize = function(options){
        // 对this.$el赋值前对options.el类型判断，jquery对象，DOM对象，字符串
        if(options.el && options.el instanceof jQuery){
            this.$el = options.el;
        }else if(options.el && (options.el.nodeType==1 || typeof (options.el) == 'string')){
            this.$el = $(options.el);
        }else{ 
            this.$el = $('<div></div>');         
        }
        this.options = options;
        EventTarget.call(this);
        this.$el.addClass('sn-selectTree');

        var template = hdb.compile(tpl);
        var $tpl = $('<div></div>').html(template(this.options));
        $tpl.children('label').html(this.options.label);
        $tpl.find('.has-formlayer > .texts').attr({
            name: 'sn-' + this.options.name + '-text',
            value: this.options.text
        });
        $tpl.find('.has-formlayer > .values').attr({
            name: this.options.name,
            value: this.options.value
        });
        this.$el.html($tpl.html());
        //自定义事件
        eventInit.call(this);
    };
    var eventInit = function(){
        this.$el.on('click','.texts',$.proxy(function(e){
            panelInit.call(this,e);
            this.trigger('panelInit',e);
        },this));
        $(document).on('click',function(e){
            var $formlayer = $('.sn-selectTree .formlayer');
            if($formlayer.length != 0){
                spaceClose(e,$formlayer);
            }
        });
        this.$el.on('click','.confirm',$.proxy(confirm,this));
        this.$el.on('click','.empty',$.proxy(clear,this));
        if(!this.options.check){
            var id = $('.ztree',panelTpl).attr('id');
            this.$el.on('click','.ztree a[id^="'+id+'_"]',$.proxy(confirm,this));
        } 

    }
    $.extend(objClass.prototype,EventTarget.prototype, {
        version:VERSION,
        reload:function(beans){
            if(typeof(beans) == 'string' && this.options.async){
                this.options.url = beans;
            }else if(typeof(beans) == 'object' && !this.options.async){
                this.json = beans;
            }
        },
        set:function(text,value){
            var valueField = this.options.valueField,
                textField = this.options.textField;
            if(arguments.length == 2){
                if(this.json){
                    this.zTree.checkAllNodes(false);
                    this.json=this.zTree.getNodes();
                    dateFilter(this.json,function(bean){
                        if(value == bean[valueField]){
                            bean.checked=true;
                        }
                    });
                }
                $('.texts', this.$el).attr('value',text);
                $('.values', this.$el).attr('value',value);
            }else if(arguments.length == 1 && typeof(text) == 'object'){
                var texts = [],values = [];
                for(var i = 0; i<text.length;i++){
                    texts.push(text[i][textField]);
                    values.push(text[i][valueField]);
                }
                if(this.options.check || (!this.options.check && values.length == 1)){
                    if(this.json){
                        this.zTree.checkAllNodes(false);
                        this.json=this.zTree.getNodes();
                        dateFilter(this.json,function(bean){
                            for(var i = 0; i<values.length;i++){
                                if(values[i] == bean[valueField]){
                                    bean.checked=true;
                                }
                            }
                        });
                    }
                    var textStr = texts.join(',');
                    var valueStr = values.join(',');
                    $('.texts', this.$el).attr('value',textStr);
                    $('.values', this.$el).attr('value',valueStr);
                }
            }
        },
        disable:function(){
            $('.texts',this.$el).prop('disabled',true);
            $('.values',this.$el).prop('disabled',true);
        },
        enable:function(){
            $('.texts',this.$el).prop('disabled',false);
            $('.values',this.$el).prop('disabled',false);
        }
    });
    return objClass;
});

(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
('/* add by  wangyakun  start*/\r\n.sn-selectTree{\r\n    width: 100%;\r\n    height: 36px;\r\n}\r\n.sn-selectTree>label{\r\n    width: 28% ;\r\n   display: block;\r\n   float: left;\r\n   font-size:10px;\r\n   height: 32px;\r\n   line-height: 32px;\r\n   color: #666;\r\n   text-align: right;\r\n   overflow: hidden;\r\n   text-overflow: ellipsis;\r\n   white-space: nowrap;\r\n}\r\n.sn-selectTree>.has-formlayer { \r\n    position: relative;\r\n    width: 70%;\r\n    display: block;\r\n    float: left;\r\n    height: 36px;\r\n    color: #222;\r\n    text-align: left;\r\n    margin-left: 2%;\r\n}\r\n/* add by  wangyakun  end*/\r\n.sn-selectTree>div>div.formlayer {\r\n    position: absolute;\r\n    left: 0;\r\n    right: 0;\r\n    top: 37px;\r\n    z-index: 10000;\r\n    padding: 6px;\r\n    background: #FFF;\r\n    box-sizing: border-box;\r\n    -webkit-box-shadow: 1px 1px 3px #999;\r\n    box-shadow: 1px 1px 3px #999;\r\n    text-align: left;\r\n    border: 1px solid #DDD;\r\n}\r\n.sn-selectTree > .has-formlayer > .texts { \r\n    width:100%;\r\n    height: 30px;\r\n    line-height: 22px;\r\n    padding: 3px;\r\n    box-sizing: border-box;\r\n    outline: none;\r\n    border: 1px solid #d0d6d9;\r\n    -webkit-box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);\r\n    box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);\r\n    padding-right: 20px;\r\n    background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAASCAYAAABfJS4tAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDA1NkU2QjNGMzY0MTFFNjg3NjJFOUFGMERCRTBGNEUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDA1NkU2QjRGMzY0MTFFNjg3NjJFOUFGMERCRTBGNEUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpEMDU2RTZCMUYzNjQxMUU2ODc2MkU5QUYwREJFMEY0RSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpEMDU2RTZCMkYzNjQxMUU2ODc2MkU5QUYwREJFMEY0RSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PtkFg2MAAAEQSURBVHjaYvz//z8DLQATA40ASQYDfScDxF1A/BlKy+BTjBX/+/evHYg/APF/ZLzj6On/dVMXgmkgvwuXfkZcYQwU/9A0Ywn/j1+/MOTSQrwZFmzcxdCQGfuFkZGRF5t+Fjw+BxvalpeEIrjr+FmgoTsZrAy0Qdzp5ATF/4oJc8DeRxKTAeJuIP4CpWVw6WciOVKAypEwTgALihKgF/OPXbgG9KJWqZulcSmar/4jBwWSOpBQGTaDGaFO/1k7dQFbcqAnw6w1WwkmO2IiDxZ2EyDJaAEsGf1HDmPM5LaAYHLDGSmURh44jIHeeQKkSqEY7hNqRB6hrExe5NEi55FZVhAZecRiUiKPkVYFPUCAAQC4njfWY4jn3wAAAABJRU5ErkJggg==\');\r\n    background-repeat: no-repeat;\r\n    background-position-x: right;\r\n    background-position: right center;\r\n}\r\n.sn-selectTree > .has-formlayer> .formlayer > .formlayer-content{\r\n    height:150px;\r\n    overflow:auto;\r\n    padding: 6px;\r\n}\r\n.sn-selectTree > .has-formlayer> .formlayer>.formlayer-content>.ztree>.formlayer-content-loading{\r\n    display:block;\r\n    padding-left: 20px;\r\n    width:70px;\r\n    height:16px;\r\n    margin: 0 auto;\r\n    margin-top:67px;\r\n    background:url(\'data:image/gif;base64,R0lGODlhEAAQAPYZAPLy8szMzNXV1c7Ozvr6+t7e3ujo6Obm5vX19eXl5dHR0erq6uDg4NLS0v7+/tjY2OLi4v39/ePj49ra2vj4+P///+zs7O7u7vDw8LnX6g+GzGqu1KXN5DSVz5PD4Im+3gCAzF2o1ROIzHKy2TyZ1WKr1SWM16/T6Ojy9vH3+vr8/Xm22gB/0PT5+06h0lqm00ee1hWJzuXw9+Dt9gmA1X643SmRzsTd7BqG1rTV6WSq28Taq8Xab5jF4XSzxefw7bXRObrY6nq1zFmmzOrx3ByK1a/QIdnp8i+S03az0Obv6+vy4dvnwxOF0wCAy5zIE7zVloe81jOP3bvVirjTd7jTK6XLGuHsze/18Ya74azOKHm10YK94MLdU9Lntcvjl2y24iGM3sfj8/P59cPZjZTI4s7gpOzz7YfD6ITB2Eyk4J7P7Pz+/i2T3pTJ6vH35rfb8bjTR3K45ev1+maz3Vms3rrX5XOyzBqE3LLRF6vNffn797LPd7HT5yCNzQAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUAI/eAAh+QQFAAAZACwAAAAAEAAQAAAFqmAlioQkKBMwriI2BIVlCBArLoGCEIYBMAXH6hAQEACKwKBhSDBGksAjcnktKoSCJGGoUCQThyUQsFQSD0sCAgGoKwYlpjIhK5qSHqTZAEQKShYEe3kLEgcQBAQCOQgRD3l5BlszLw2KjAVwBghsCRYNDwQUDTAVBxIqhhAMBBUISU8JUiMMXAKMAQkVEAETriIOBW1AfoAFETYMaQAGSRI2IxgPCgoPcyshACH5BAUAAAAALAQADgAIAAIAAAYQwFDHk/mIQBsApyPSdDiAIAAh+QQFAAAAACwCAAwADQACAAAGGcDQaGUysUAjQAlEQqlcpdPLdUrBQK4WIAgAIfkEBQAAAAAsAAAKABAAAgAAByGANyU6STtGQEtHRSAuACM+TAAfGzovSgA3TSAhjk5IDoEAIfkEBQAAAAAsAAAIABAAAgAAByKAHxtTVFhLWk9WVylSG1BUUVk6W1BVVk9aSygmIDAAU1CBACH5BAUAAAAALAAABgAQAAIAAAcggDtUAFlONBwAcU9PeWRCOjUfeo54dnuKVmZnfFN3NYEAIfkEBQAAAAAsAAAEABAAAgAAByGAADogHS0cICwfDj9DOhs1AEQ+JCoeiD0APEA7QjolQYEAIfkEBQAAAAAsAgACAAwAAgAABhdAwAcUu81Wq0zIpRqBbLKchkXD1UavIAAh+QQFAAAAACwAAAAAEAAQAAAHxoAAgoIzcjZFanCDi4JwIiB1a2gkcoyCbgBFYjJoaGJ0dWyLaABIczcxgmFoXHSDlSQAJ5cAWHRycqRvaWoAa4K/AHFeaXJgYl5fAJgAil2DX8VoblPRYWIqzwBeWGTR0zVfZGNvQABGRC0k4WRlbnJpZoNGb3NtAL1fZmJg8F5Vcd7MCAOgDgA0aa4sw0XnDAAxRQC44gIgliAwXNC0uQeAIhgAMOYMYlMHDBxQcFoYNGgJDIk1YtxErGRJ0AkSMWLAyMEoEAAh+QQFAAACACwAAAAAEAAQAAAHz4ACgoJHJX4iJH2Di4IcGgIuHis2JYyCHwIxNzMrKxkhLiqLIwI2MjmPAjg1Iy+DOgIdAhyXAj9DOhs1AkQ+JAIegj2CQDtCOiVBO1QCWY0CcYNkxzUfetN4dnvRAmZnfFN31RtTVFhLWgJWVylSG1BUUVk6W1CDWksoJgIwAlNQN0roSLLDCJAlR4pAEjDCBxMBHzboeKFEwI0mAkIwFIBkUIgRK0zs21iJBIpBKlyUOPHCxYkU/VxYEsDggQUABhQEkDBTEIYHChQ8wMAoEAAh+QQFAAADACwCAAwADQACAAAFFSCTGIIQBMkABRPhFBDAFEBUBEU0hAAh+QQFAAACACwAAAoAEAACAAAFGiACQYnVPATVBIVwSICwSBBDCIgSMEISPJUQACH5BAUAAAAALAAACAAQAAIAAAUX4CIdEEEIgYJEj2S4b2IIQ9CYaAEYRggAIfkEBQAAAgAsAAAGABAAAgAABReglQhGMGDCFASKkUiGAbkNEBWmRcxwCAAh+QQFAAACACwAAAQAEAACAAAFGqAgBU90DcFSEYWUGAIlTY4VBJaQPFYCQYAQACH5BAUAAA8ALAIAAgAMAAIAAAQS8K2gEDEGsOJOEASgBENjJEwEADs=\') no-repeat;\r\n}\r\n.sn-selectTree > .has-formlayer> .formlayer.formlayer-has-btns {\r\n    width: 100%;\r\n    padding: 0;\r\n}\r\n.sn-selectTree > .has-formlayer> .formlayer.formlayer-has-btns > .formlayer-btns {\r\n    display: block;\r\n    width: 100%;\r\n    height: 36px;\r\n    text-align: center;\r\n    background: #f7f9fa;\r\n    border-top: 1px solid #eaeef1;\r\n}\r\n.sn-selectTree > .has-formlayer> .formlayer.formlayer-has-btns > .formlayer-btns-check > label {\r\n    float: left;\r\n    margin-left: 4px;\r\n    margin-top: 6px;\r\n}\r\n.sn-selectTree > .has-formlayer> .formlayer.formlayer-has-btns > .formlayer-btns-check > div {\r\n    float: right;\r\n    margin-right: 4px;\r\n}\r\n.sn-selectTree > .has-formlayer> .formlayer.formlayer-has-btns > .formlayer-btns a{\r\n    display: inline-block;\r\n    height: 22px;\r\n    line-height: 22px;\r\n    font-size: 12px;\r\n    border: 1px solid #ddd;\r\n    border-radius: 3px; background: #fff;\r\n    text-decoration: none;\r\n    cursor: pointer;\r\n    white-space: nowrap;\r\n    outline: none;\r\n    color: #333;\r\n    padding: 0 10px;\r\n    margin-top: 5px;\r\n}/*-------------------------------------\r\nzTree Style\r\n\r\nversion:\t3.5.19\r\nauthor:\t\tHunter.z\r\nemail:\t\thunter.z@263.net\r\nwebsite:\thttp://code.google.com/p/jquerytree/\r\n\r\n\r\n修改记录：\r\n\r\n根据中移在线UI规范对ztree样式进行了修改 20170111\r\n\r\n-------------------------------------*/\r\n\r\n.ztree * {padding:0; margin:0; font-size:12px;}\r\n.ztree {margin:0; padding:5px; color:#333;}\r\n.ztree li{padding:0; margin:0; list-style:none; line-height:22px; text-align:left; white-space:nowrap; outline:0;}\r\n.ztree li ul{ margin:0; padding:0 0 0 18px;}\r\n.ztree li ul.line{ /*UI规范不再显示竖向虚线*/}\r\n\r\n.ztree li a {padding:0 3px 0 0; margin:0; margin-top: 2px; cursor:pointer; height:17px; color:#333; background-color: transparent;\r\n\ttext-decoration:none; vertical-align:top; display: inline-block;}\r\n.ztree li a:hover {text-decoration:underline;}\r\n.ztree li a.curSelectedNode {padding-top:0px; background-color:#c4e4f5; color:black; height:19px; }\r\n.ztree li a.curSelectedNode_Edit {padding-top:0px; background-color:#c4e4f5; color:black; height:16px; }\r\n.ztree li a.tmpTargetNode_inner {padding-top:0px; background-color:#c4e4f5; color:white; height:16px; }\r\n.ztree li a.tmpTargetNode_prev {}\r\n.ztree li a.tmpTargetNode_next {}\r\n.ztree li a input.rename {height:14px; width:80px; padding:0; margin:0;\r\n\tfont-size:12px; border:1px #7EC4CC solid; *border:0px}\r\n.ztree li span {line-height:16px; margin-right:2px}\r\n.ztree li span.button {line-height:0; margin:0; width:16px; height:16px; display: inline-block; vertical-align:middle;\r\n\tborder:0 none; cursor: pointer;outline:none;\r\n\tbackground-color:transparent; background-repeat:no-repeat; background-attachment: scroll;\r\n\tbackground-image:url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAAyCAYAAACNm/9WAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2xpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpDQTNCQzM3RUNGMjYxMUU2OUJEMUYyMjU3NjIwNDlFRCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpFNTVFNEM3OUNGNEMxMUU2OUJEMUYyMjU3NjIwNDlFRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpFNTVFNEM3OENGNEMxMUU2OUJEMUYyMjU3NjIwNDlFRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkU1NUU0QzcwQ0Y0QzExRTY5QkQxRjIyNTc2MjA0OUVEIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkU1NUU0QzcxQ0Y0QzExRTY5QkQxRjIyNTc2MjA0OUVEIi8+IDwvcmRmOkRl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\'); *background-image:url(\"../../../src/lib/zTree_v3/css/zTreeStyle/img/zTreeStandard.gif\")}\r\n\r\n.ztree li span.button.chk {width:16px; height:16px; margin:0 5px 0 0; cursor: auto;}\r\n.ztree li span.button.chk.checkbox_false_full {background-position:0 0;}\r\n.ztree li span.button.chk.checkbox_false_full_focus {background-position:0 -17px;}\r\n.ztree li span.button.chk.checkbox_false_part {background-position:0 0;}\r\n.ztree li span.button.chk.checkbox_false_part_focus {background-position:0 -17px;}\r\n.ztree li span.button.chk.checkbox_false_disable {background-position:0 -34px;}\r\n.ztree li span.button.chk.checkbox_true_full {background-position:-17px 0;}\r\n.ztree li span.button.chk.checkbox_true_full_focus {background-position:-17px 0;}\r\n.ztree li span.button.chk.checkbox_true_part {background-position:-17px 0;}\r\n.ztree li span.button.chk.checkbox_true_part_focus {background-position:-17px 0;}\r\n.ztree li span.button.chk.checkbox_true_disable {background-position:-17px -17px;}\r\n\r\n.ztree li span.button.chk.radio_false_full {background-position:-34px 0;}\r\n.ztree li span.button.chk.radio_false_full_focus {background-position:-34px -17px;}\r\n.ztree li span.button.chk.radio_false_part {background-position:-34px 0;}\r\n.ztree li span.button.chk.radio_false_part_focus {background-position:-34px -17px;}\r\n.ztree li span.button.chk.radio_false_disable {background-position:-34px -34px;}\r\n.ztree li span.button.chk.radio_true_full {background-position:-51px 0;}\r\n.ztree li span.button.chk.radio_true_full_focus {background-position:-51px 0;}\r\n.ztree li span.button.chk.radio_true_part {background-position:-51px 0;}\r\n.ztree li span.button.chk.radio_true_part_focus {background-position:-51px 0;}\r\n.ztree li span.button.chk.radio_true_disable {background-position:-51px -17px;}\r\n\r\n.ztree li span.button.switch {width:18px; height:18px;}\r\n.ztree li span.button.root_open{background-position:-68px -16px;}\r\n.ztree li span.button.root_close{background-position:-68px 1px;}\r\n.ztree li span.button.roots_open{background-position:-68px -16px;}\r\n.ztree li span.button.roots_close{background-position:-68px 1px;}\r\n.ztree li span.button.center_open{background-position:-68px -16px;}\r\n.ztree li span.button.center_close{background-position:-68px 1px; margin-right: 3px;}\r\n.ztree li span.button.bottom_open{background-position:-68px -16px;}\r\n.ztree li span.button.bottom_close{background-position:-68px 1px;}\r\n.ztree li span.button.noline_open{background-position:-68px -16px;}\r\n.ztree li span.button.noline_close{background-position:-68px 1px;}\r\n.ztree li span.button.root_docu{ background:none; margin-right: 3px;}\r\n.ztree li span.button.roots_docu{background:none; margin-right: 3px;}\r\n.ztree li span.button.center_docu{background: none; margin-right: 3px;}\r\n.ztree li span.button.bottom_docu{background-position:-56px -36px; margin-right: 3px;}\r\n.ztree li span.button.noline_docu{ background:none; margin-right: 3px;}\r\n\r\n.ztree li span.button.ico_open{margin-right:5px; background-position:-99px 1px; vertical-align:top; *vertical-align:middle}\r\n.ztree li span.button.ico_close{margin-right:5px; background-position:-99px 1px; vertical-align:top; *vertical-align:middle}\r\n.ztree li span.button.ico_docu{margin-right:5px; background-position:-99px -16px; vertical-align:top; *vertical-align:middle}\r\n.ztree li span.button.edit {}\r\n.ztree li span.button.remove {}\r\n\r\n.ztree li span.button.ico_loading{margin-right:5px; background:url(\'data:image/gif;base64,R0lGODlhEAAQAKIGAMLY8YSx5HOm4Mjc88/g9Ofw+v///wAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgAGACwAAAAAEAAQAAADMGi6RbUwGjKIXCAA016PgRBElAVlG/RdLOO0X9nK61W39qvqiwz5Ls/rRqrggsdkAgAh+QQFCgAGACwCAAAABwAFAAADD2hqELAmiFBIYY4MAutdCQAh+QQFCgAGACwGAAAABwAFAAADD1hU1kaDOKMYCGAGEeYFCQAh+QQFCgAGACwKAAIABQAHAAADEFhUZjSkKdZqBQG0IELDQAIAIfkEBQoABgAsCgAGAAUABwAAAxBoVlRKgyjmlAIBqCDCzUoCACH5BAUKAAYALAYACgAHAAUAAAMPaGpFtYYMAgJgLogA610JACH5BAUKAAYALAIACgAHAAUAAAMPCAHWFiI4o1ghZZJB5i0JACH5BAUKAAYALAAABgAFAAcAAAMQCAFmIaEp1motpDQySMNFAgA7\') no-repeat scroll 0 0 transparent; vertical-align:top; *vertical-align:middle}\r\n\r\nul.tmpTargetzTree {background-color:#FFE6B0; opacity:0.8; filter:alpha(opacity=80)}\r\n\r\nspan.tmpzTreeMove_arrow {width:16px; height:16px; display: inline-block; padding:0; margin:2px 0 0 1px; border:0 none; position:absolute;\r\n\tbackground-color:transparent; background-repeat:no-repeat; background-attachment: scroll;\r\n\tbackground-position:-110px -80px; background-image:url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAAyCAYAAACNm/9WAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2xpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpDQTNCQzM3RUNGMjYxMUU2OUJEMUYyMjU3NjIwNDlFRCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpFNTVFNEM3OUNGNEMxMUU2OUJEMUYyMjU3NjIwNDlFRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpFNTVFNEM3OENGNEMxMUU2OUJEMUYyMjU3NjIwNDlFRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkU1NUU0QzcwQ0Y0QzExRTY5QkQxRjIyNTc2MjA0OUVEIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkU1NUU0QzcxQ0Y0QzExRTY5QkQxRjIyNTc2MjA0OUVEIi8+IDwvcmRmOkRl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\'); *background-image:url(\"../../../src/lib/zTree_v3/css/zTreeStyle/img/zTreeStandard.gif\")}\r\n\r\nul.ztree.zTreeDragUL {margin:0; padding:0; position:absolute; width:auto; height:auto;overflow:hidden; background-color:#cfcfcf; border:1px #00B83F dotted; opacity:0.8; filter:alpha(opacity=80)}\r\n.zTreeMask {z-index:10000; background-color:#cfcfcf; opacity:0.0; filter:alpha(opacity=0); position:absolute}\r\n\r\n/* level style*/\r\n/*.ztree li span.button.level0 {\r\n\tdisplay:none;\r\n}\r\n.ztree li ul.level0 {\r\n\tpadding:0;\r\n\tbackground:none;\r\n}*/');
