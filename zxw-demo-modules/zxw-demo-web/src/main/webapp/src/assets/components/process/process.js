
define('text!components/process/process.tpl',[],function () { return '<div class="sn-step">\r\n  <ol class="sn-stepbar {{className}}">\r\n    {{#each items}}\r\n    <li>\r\n      <div>\r\n        <div class="{{className}} step-num">{{addOne @index}}</div>\r\n        <div class="step-name">{{title}}</div>\r\n      </div>\r\n    </li>\r\n    {{/each}}\r\n  </ol>\r\n  <div class="formContainer"></div>\r\n</div>';});


define('lib/requirejs/css.min!components/process/process',[],function(){});
/**
 *Created by jingfei on 2016/10/8.
 */
define('process',[
    'jquery',
    'eventTarget',
    'hdb',
    'text!components/process/process.tpl',
    'lib/requirejs/css.min!components/process/process.css'
    ],function ($, eventTarget, hdb, tpl) {
    var VERSION = '1.0.0';
    var objClass = function(options){
        //判断el的异常值，el不存在、为空string、
        if(!options.el||options.el.length==0){
            this.$el = $("<div></div>")
            // return false
        }else if (typeof(options.el) == 'string'&&options.el.length>0) {
            if($(options.el).length>0){
                this.$el = $(options.el);
            }else{
                this.$el = $("<div></div>")
            }
        }else if(isDOM(options.el)){
            this.$el = $(options.el);
        }else{
            this.$el = options.el;
        }

        this.options = options; 
        eventTarget.call(this);
        render.call(this);
        eventInit.call(this);
        setTimeout($.proxy(processInit, this), 200); 
    };

    $.extend(objClass.prototype,eventTarget.prototype,{
        version:VERSION
    });

    var processInit = function () {
        var $li = $('.sn-step>.sn-stepbar>li', this.$el);
        var $liFirst = $li.first(),
            $liLast = $li.last(),
            length = $li.length,
            width = this.options.width/length||160,
            height = this.options.height||61,
            form = '';
        for(var i = 0;i<length;i++){
            form+='<div class="formContainer'+(i+1)+'"></div>';
        }
        $('.sn-step>.formContainer',this.$el).append(form);
        if ($liFirst.length) {
            $liFirst.addClass('step-first');
            $liFirst.children().children('.step-name').addClass('step-now');
            $liFirst.children().addClass('step-current').children('.step-num').trigger('click');
        }else{
            console.log('还没有配置进度条内容')
        }

        if ($liLast.length) {
            $liLast.addClass('step-last');
        }else{
            console.log('还没有配置进度条内容')
        }
        $li.css(
            {
                'width':width,
                'height':height
            }
        );     
    };

    var render = function(){
        var handleHelper = hdb.registerHelper("addOne",function(index){
            return index+1;
        });
        template = hdb.compile(tpl);
        this.$el.html(template(this.options));
    };

    //自定义事件
    var eventInit = function(){
        this.$el.on('click','.sn-step>.sn-stepbar>li>.step-done>.step-num',$.proxy(function(e,nextIndex,nowIndex,res){
            itemsClick.call(this,e,nextIndex,nowIndex,res);
            this.trigger('itemsClick',[e,nextIndex,nowIndex,res]);
        },this));
        this.$el.on('click','.sn-step>.sn-stepbar>li>.step-current>.step-num',$.proxy(function(e,nextIndex,nowIndex,res){
            itemsClick.call(this,e,nextIndex,nowIndex,res);
            this.trigger('itemsClick',[e,nextIndex,nowIndex,res]);
        },this));
    }

    var beforeLeave = null;

    var itemsClick = function(e,nextIndex,nowIndex,res){
        var target = e.target||e.currentTarget,
            items = this.options.items,
            next = nextIndex||$(target).closest('li').index(),
            index = $('.sn-step .step-now',this.$el).closest('li').index();
        var now = (nowIndex==0?0:nowIndex||index);
        beforeLeave = function(key){ //this.options.beforeLeave的响应
            if(items[key].beforeLeave){
                return items[key].beforeLeave();
            }else{
                console.log('还没有配置beforeLeave');
            }
        }
        if(items[next].click){
            var $formNow = $('.sn-step>.formContainer form:eq('+now+')',this.$el);
            var $formNext = $('.sn-step>.formContainer form:eq('+next+')',this.$el);
            var result;
            if(next!=index){//页面可以切换
                result = res||beforeLeave(now);
                if(result||result===undefined){//beforeLeave !=false
                    if($(target).parent().attr('class') == 'step-done'||'step-current'){//切换当前页面标注
                        $('.sn-step .step-now',this.$el).removeClass('step-now');
                        $('.sn-step>.sn-stepbar>li:eq('+next+')>div>.step-name',this.$el).addClass('step-now');
                    }
                                  
                    if($formNext.css('display')=='none'){//要进入的表单已经new 过了，只需显示/隐藏
                        fadeOut($formNow, function() {
                            $formNext.show();
                        });
                    }else{ //没有new过，需隐藏当前表单，new下一个表单                
                        fadeOut($formNow,function(){
                            items[next].click(e);
                        });                 
                    }
                }
            }else{
                if($formNext.css('display')=='block'){//i==index  点击当前进度
                    console.log('还在这一页')
                }else{//刚打开界面
                    items[next].click(e);
                } 
            }
        }
    };
    //淡隐动画
    function fadeOut(obj,callBack){
        obj.fadeOut('fast', callBack);
    };
    $.extend(objClass.prototype,{
        next:function(){
            var $now = $('.sn-step .step-now',this.$el).closest('li');
            var nowIndex = $now.index(),
                nextIndex = nowIndex+1, 
                $current = $('.sn-step li:eq('+nextIndex+')',this.$el).find('.step-current'),
                $done = $('.sn-step li:eq('+nextIndex+')>.step-done',this.$el);
            if($now.attr('class') != 'step-last'){  
                var result = beforeLeave(nowIndex);
                if(result||result===undefined) {
                    result = 1;
                }else{
                    result = 0;
                }                  
                if($done.length||$current.length){ //将要进去的表单已经new过了，进度条已经改变过了，不需要再改变进度条的样式
                    $('.sn-step li:eq('+nextIndex+')',this.$el).find('.step-num').trigger('click',[nextIndex,nowIndex,result]);
                }else{
                    if(result==1){//beforeLeave !=false 可以切换表单 ，改变进度条样式
                        $('.sn-step .step-current',this.$el).removeClass('step-current').addClass('step-done');
                        $('.sn-step li:eq('+nextIndex+')',this.$el).children().addClass('step-current');
                        $('.sn-step .step-current',this.$el).find('.step-num').trigger('click',[nextIndex,nowIndex,result]);
                    }else{  //beforeLeave ==false,不能切换表单，不能改变样式，也不能触发click
                        console.log('不能改变进度')
                    }  
                }
            }else{
                console.log('已经是最后一步了');
            }
        },
        previous:function(){
            var $now = $('.sn-step .step-now',this.$el).closest('li');
            var nowIndex = $now.index();
            var nextIndex = nowIndex-1; 
            if($now.attr('class') != 'step-first'){
                $('.sn-step li:eq('+nextIndex+')',this.$el).find('.step-num').trigger('click',[nextIndex,nowIndex]);
            }else{
                console.log('已经是第一步了');
            }
        },
        switchTo:function(stepClassName){
            var nextIndex = stepClassName.replace(/[^0-9]/ig,"")-1;
            var nowIndex = $('.sn-step .step-now',this.$el).closest('li').index();
            var $done = $('.sn-step li:eq('+nextIndex+')',this.$el).find('.step-done');
            var $current = $('.sn-step li:eq('+nextIndex+')',this.$el).find('.step-current');
            if($done.length||$current.length){
                $('.sn-step li:eq('+nextIndex+')',this.$el).find('.step-num').trigger('click',[nextIndex,nowIndex]);
            }else{
                console.log('现在还不能跳转');
            }
        },
        get:function(stepClassName){
            var i = stepClassName.replace(/[^0-9]/ig,"")-1;
            var item = this.options.items[i];
            var data = {
                title : item.title,
                className:item.className,
                module:item.click
            }
            return data;
        }
    });
    // 判断是否为原生DOM
    var isDOM = function(obj){
        return obj.tagName ?true:false
    } 
    //解决ie下console.log()报错问题
    window.console = window.console || (function(){
        var c = {};
        c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function(){};
        return c;
    })();
    
    return objClass;
});

(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
('@charset \"UTF-8\";\r\n\r\n/* 步骤条 */\r\n.sn-step { margin:0px auto;}\r\n.sn-step .sn-stepbar { margin:12px auto 0px;overflow:hidden;}\r\n.sn-step .sn-stepbar li { width:160px; float:left; text-align:center; list-style: none;}\r\n.sn-step .sn-stepbar .step-name { padding:3px 0px; color:#999; font-size: 12px; font-weight:700px; margin-top:5px;}\r\n.sn-step .sn-stepbar .step-time { margin-top:10px; color:#999; padding:8px 0px;}\r\n.sn-step .sn-stepbar .step-done .step-num { background-position:50% -100px; color: #FFF; }\r\n.sn-step .sn-stepbar .step-num { background:url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAt4AAACMCAYAAABLTa6KAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NEUwMDIyNkFDRjdEMTFFNjlCRDFGMjI1NzYyMDQ5RUQiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NEUwMDIyNjlDRjdEMTFFNjlCRDFGMjI1NzYyMDQ5RUQiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDQTNCQzM3OUNGMjYxMUU2OUJEMUYyMjU3NjIwNDlFRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDQTNCQzM3QUNGMjYxMUU2OUJEMUYyMjU3NjIwNDlFRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PtlviLQAAAl9SURBVHja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\') no-repeat 50% -60px; height:18px; line-height:18px; color:#999; font-size:12px;}\r\n.sn-step .sn-stepbar .step-first .step-current .step-num { background-position:50% -20px;}\r\n.sn-step .sn-stepbar .step-first .step-done .step-num { background-position:50% -120px; }\r\n.sn-step .sn-stepbar .step-current .step-num { background-position:50% 0px; color: #FFF; }\r\n.sn-step .sn-stepbar .step-last .step-num { background-position:50% -80px; }\r\n.sn-step .sn-stepbar .step-last .step-current .step-num { background-position:50% -40px; }\r\n.sn-step .sn-stepbar:after,.sn-step .sn-stepbar:before { display: block; content: \"\"; clear: both; height: 0; font-size: 0; overflow: hidden; }\r\n\r\n/* 依据UI规范 隐藏步数、重置当前步骤文字颜色 */\r\n.sn-step .sn-stepbar .step-done .step-name,.sn-step .sn-stepbar .step-current .step-name { color: #222; }\r\n.sn-step .sn-stepbar .step-num { text-indent: -10000px; }');
