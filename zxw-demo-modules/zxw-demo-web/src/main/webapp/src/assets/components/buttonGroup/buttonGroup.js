
define('text!components/buttonGroup/buttonGroup.tpl',[],function () { return '<div class="" >\r\n\t<ul class="sn-buttonGroup-list">\r\n\t</ul>\r\n</div>\r\n';});


define('lib/requirejs/css.min!components/buttonGroup/buttonGroup',[],function(){});
/**
 * 组件-buttonGroup
 */
define('buttonGroup',[
    'jquery',
    'eventTarget',
    'text!components/buttonGroup/buttonGroup.tpl',
    'lib/requirejs/css.min!components/buttonGroup/buttonGroup.css'
],function ($, eventTarget, tpl) { 
    var VERSION = '1.0.0';       
    var objClass =function(config){
         //判断el的异常值：el不存在、为空string、dom原生对象
        if(config.el){
            if(config.el instanceof jQuery&&config.el.length>0){
                this.$el = config.el;
            }else if(isDOM(config.el)){
                this.$el = $(config.el);
            }else if (typeof(config.el) == 'string'&&$(config.el).length>0) {
                this.$el = $(config.el);
            }
        }else{
        this.$el = $("<div></div>")             
        }

        this.options = config; 
        eventTarget.call(this);
        render.call(this);     
        //按钮的纵向横向设置
        var $buttons = $(".sn-buttonGroup-list",this.$el).find("button");
        var $lis = $(".sn-buttonGroup-list",this.$el).find("li");
        $buttons.last().css("marginRight","0");
        if(this.options.direction && this.options.direction == "vertical"){
            $lis.removeClass("t-btnGroup-h").addClass("t-btnGroup-v");
        }else if(this.options.direction == "horizontal" || !this.options.direction){
            $lis.addClass("t-btnGroup-h");
        }else{
            $lis.addClass("t-btnGroup-h");
        }
        //按钮的禁用启用状态
        if(this.options.items.length){
            $.each(this.options.items,function(i,item){
                if( !item.type || item.type == "0"){
                    $buttons.eq(i).addClass("t-btnGroup");
                }else if(item.type == "1"){
                    $buttons.eq(i).addClass("t-btnGroup-blue");
                }else if(item.type == "2"){
                    $buttons.eq(i).addClass("t-btnGroup-green");
                }else{
                    $buttons.eq(i).addClass("t-btnGroup");
                }
                if(item.disabled == "0"){
                    var itemBgColor = $buttons.eq(i).css("background"),
                    itemBdColor = $buttons.eq(i).css("borderColor"),
                    itemFontColor = $buttons.eq(i).css("color");
                     $buttons.eq(i).attr("disabled",true).addClass("t-btnGroup-disabled").css({"background":itemBgColor,"borderColor":itemBdColor,"color":itemFontColor});
                }else if(item.disabled == "1" || !item.disabled){
                     $buttons.eq(i).attr("disabled",false).removeClass("t-btnGroup-disabled");
                }else{
                    $buttons.eq(i).attr("disabled",false).removeClass("t-btnGroup-disabled");
                }
            });
        }else{
            console.log("请配置按钮项！")
        }

        //自定义事件    
        this.$el.on('click','button',$.proxy(function(e){
            btnClick.call(this,e);
            this.trigger('btnClick',e);
        },this));
    };

    $.extend(objClass.prototype,eventTarget.prototype, {
        version:VERSION
    });//扩展方法

    //渲染按钮
    var render = function(){
        var $tpl = $(tpl);
        var _htm = '';
        for(var i = 0; i < this.options.items.length; i++) {
            _htm += '<li class="' + this.options.items[i].className + '">'
                  + '  <button type="' + this.options.items[i].type + '" class="t-btnGroup">' + this.options.items[i].text + '</button>'
                  + '</li>';
        }
        $tpl.addClass(this.options.className).find('.sn-buttonGroup-list').html(_htm);
        this.$el.html($tpl);
    };
    var btnClick = function(e){
        var target = e.target || e.currentTarget,
        item = this.options.items,
        index = $('.sn-buttonGroup-list li button',this.$el).index(target);
        if(item[index].click){
            item[index].click(e);
        }else{
            console.log("请在items中配置点击事件。");
        }
    }
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

    return objClass
});



(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
('.buttonGroup-list,\r\n.buttonGroup-list > li,\r\n.buttonGroup-list > li > button{\r\n\tlist-style:none;\r\n\tpadding:0;\r\n\tmargin:0;\r\n}\r\n\r\n  /* // 按钮 */\r\n.sn-buttonGroup-list> li > .t-btnGroup {\r\n   padding: 6px 14px;\r\n   margin-right: 12px;\r\n   font-size: 12px;\r\n   line-height: 1;\r\n   border-radius: 3px;\r\n   border: 1px solid #DDD;\r\n   background: #fff;\r\n   text-decoration: none;\r\n   cursor: pointer;\r\n   position: relative;\r\n   white-space: nowrap;\r\n   outline: none;\r\n   color: #333;\r\n}\r\n\r\n.sn-buttonGroup-list > li > .t-btnGroup:hover {\r\n   background: #F9F9F9;\r\n   border-color: #CCC;\r\n   color: #333;\r\n}\r\n\r\n.sn-buttonGroup-list > li > .t-btnGroup:active {\r\n   background: #EEE;\r\n   border-color: #CCC;\r\n   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) inset;\r\n}\r\n\r\n\r\n/* // 蓝色按钮 */\r\n.sn-buttonGroup-list> li > .t-btnGroup-blue {\r\n   background: #339dd9;\r\n   border-color: #2690cc;\r\n   color: #fff;\r\n}\r\n\r\n.sn-buttonGroup-list > li > .t-btnGroup-blue:hover {\r\n   background: #48a7dd;\r\n   border-color: #339dd9;\r\n   color: #fff;\r\n}\r\n\r\n.sn-buttonGroup-list > li > .t-btnGroup-blue:active {\r\n   background: #2690cc;\r\n   border-color: #2281b7;\r\n   color: #fff;\r\n   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) inset;\r\n}\r\n\r\n\r\n/* // 绿色按钮 */\r\n.sn-buttonGroup-list > li > .t-btnGroup-green {\r\n   background: #51B148;\r\n   border-color: #499f41;\r\n   color: #fff;\r\n}\r\n\r\n.sn-buttonGroup-list > li > .t-btnGroup-green:hover {\r\n   background: #60bb58;\r\n   border-color: #51B148;\r\n   color: #fff;\r\n}\r\n\r\n.sn-buttonGroup-list > li > .t-btnGroup-green:active {\r\n   background: #499f41;\r\n   border-color: #408d39;\r\n   color: #fff;\r\n}\r\n\r\n\r\n/* //禁用按钮 */\r\n.sn-buttonGroup-list> li > .t-btnGroup-disabled {\r\n   background: #F9F9F9;\r\n   border-color: #E6E6E6;\r\n   color: #AAA;\r\n   cursor: not-allowed;\r\n}\r\n\r\n.sn-buttonGroup-list > li > .t-btnGroup-disabled:hover {\r\n   background: #F9F9F9;\r\n   border-color: #E6E6E6;\r\n   color: #AAA;\r\n}\r\n\r\n.sn-buttonGroup-list> li > .t-btnGroup-disabled:active {\r\n   box-shadow: none;\r\n}\r\n/* 横向按钮 */\r\n.sn-buttonGroup-list > .t-btnGroup-h {\r\n\tdisplay: inline-block;\r\n}\r\n/* 纵向按钮 */\r\n.sn-buttonGroup-list> li > .t-btnGroup-v {\r\n\tpadding: 8px 0;\r\n}\r\n\r\n/* // 尺寸及链接样式 */\r\n/* .buttonGroup-list > li > .t-btnGroup-sm {\r\n   padding: 4px 5px;\r\n}\r\n\r\n.buttonGroup-list > li > .t-btnGroup-lg {\r\n   font-size: 14px;\r\n   padding: 12px 30px;\r\n   padding: 13px 30px 11px 30px\\9;\r\n}\r\n\r\n.buttonGroup-list > li > .t-btnGroup-link {\r\n   padding: 0px;\r\n   border: none;\r\n   text-decoration: none;\r\n   cursor: pointer;\r\n   position: relative;\r\n   white-space: nowrap;\r\n   outline: none;\r\n   font-size: 12px;\r\n   color: #347AC7;\r\n}   */\r\n\r\n\r\n ');
