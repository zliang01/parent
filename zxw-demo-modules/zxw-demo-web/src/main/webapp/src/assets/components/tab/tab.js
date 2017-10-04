
define('text!components/tab/tab.tpl',[],function () { return '<div class="sn-tab-container">\r\n    <div class="sn-tab J_tab_render">\r\n        <ul class="sn-tab-items">\r\n        </ul>\r\n        <div class="contentArea J_content_render"></div>\r\n    </div>\r\n</div>';});


define('text!components/tab/tabItem.tpl',[],function () { return '<li class="J_item_click">\r\n    <a href="javascript:;">\r\n        {{#if icon}}\r\n        <span class="{{icon}}"></span>\r\n        {{/if}}\r\n        {{{title}}}\r\n    </a>\r\n    {{#if closeable}}\r\n    <span class="sn-tabClose"></span>\r\n    {{/if}}\r\n</li>';});


define('lib/requirejs/css.min!components/tab/tab',[],function(){});
/*
 * 组件-tab
 */
define('tab',[
  'jquery','hdb','eventTarget',
  'text!components/tab/tab.tpl',
  'text!components/tab/tabItem.tpl',
  'lib/requirejs/css.min!components/tab/tab.css'
], function($, Hdb, EventTarget, tpl, itemTpl) {
    var VERSION = '1.0.3';
    var template = Hdb.compile(itemTpl);
    var itemSelectStr = '>.sn-tab-container>.sn-tab>.sn-tab-items>li';
    var objClass = function(options) {
        if(options.el){
            if(options.el instanceof jQuery&&options.el.length>0){
                this.$el = options.el;
            }else if(isDOM(options.el)){
                this.$el = $(options.el);
            }else if (typeof(options.el) == 'string'&&$(options.el).length>0) {
                this.$el = $(options.el);
            }
        }else{
            this.$el = $("<div></div>");             
        }
        this.options = options;
        this.originTab = {};
        this.tabItem = {};
        EventTarget.call(this);
        render.call(this);
        eventInit.call(this);
        var tabData = this.options.tabs[0];
        if(tabData.render){
            originTabInit.call(this,tabData);
        }
        setTimeout($.proxy(function (e) {
            var $li = $(itemSelectStr, this.$el).first();
            if ($li.length) {
                $li.trigger("click");
            }
        }, this), 200);
    }
    var render = function () {
        var $tpl = $(tpl);
        var tabDatas = this.options.tabs;
        for(var i = 0; i < tabDatas.length; i++) {
            var tabData = tabDatas[i];
            var num = Math.floor(100+Math.random()*899);
            var className = tabData.className?tabData.className:'sn-tab-item'+num;
            var title = tabDatas[i].title;
            this.options.tabs[i].className = className;
            this.tabItem[className] = title;
            $('.sn-tab>.sn-tab-items', $tpl).append(template(tabDatas[i]));
            $('.sn-tab>.sn-tab-items>li:last', $tpl).addClass(className);
        }
        this.$el.html($tpl);
        if(this.options.direction&&this.options.direction === "vertical"){
            this.$el.addClass("sn-vertical")
        }
        if(this.options.className){
            $('>.sn-tab-container>.J_tab_render>.sn-tab-container',this.$el).addClass(this.options.className);
        }
    };
    var eventInit = function () {
        this.$el.on('click', itemSelectStr, $.proxy(itemClick, this));
        this.$el.on('click','.sn-tab-container>.sn-tab>.sn-tab-items>li>.sn-tabClose',$.proxy(tabClose,this));
    };
    var tabClose = function(e){
        e.stopPropagation();
        var $li = $(e.target || e.currentTarget).closest("li");
        var index = $li.index();
        var tabData = this.options.tabs[index];
        var className = tabData.className;
        this.destroy(className,e);
    }
    var originTabInit = function(tabData){
        var result = tabData.render(this.originTab);
        var index = $('.active',this.$el).index();
        var className = tabData.className;
        var $div = $('<div></div>');
        if(result instanceof jQuery){  
            $div.append(result);
            this.originTab[className]={content:$div};
        }else if(typeof(result) !== 'object'){
            this.originTab[className] = {content:$('<div>'+result+'</div>')};  
        }else if(typeof(result) == 'object'){
            result.content = $div.append(result.content);
            this.originTab[className] = result;
        }
        this.originTab[className].content.addClass(tabData.className);
        $('>.sn-tab-container>.J_tab_render>.contentArea',this.$el).append(this.originTab[className].content);
    }
    var itemClick = function (e) {
        var $src = $(e.target || e.currentTarget).closest(".J_item_click");
        var index = this.$el.find(itemSelectStr).index($src);
        var actIndex = $('.active',this.$el).index();
        var tabDatas = this.options.tabs;
        var tabData = tabDatas[index];
        var className = tabData.className;
        if(actIndex != -1){
            var actTabData = tabDatas[actIndex];
            var actclassName = actTabData.className;
        }
        var $content = $('>.sn-tab-container>.J_tab_render>.contentArea',this.$el).find('.'+className);
        $(itemSelectStr, this.$el).removeClass('active');
        $src.addClass('active');
        if(actIndex != -1){
            $('>.sn-tab-container>.J_tab_render>.contentArea',this.$el).find('.'+actclassName).css('display','none');
        }
        if($content.length != 0){
            $content.css('display','block')
        }else{
            if(tabData.render){
                originTabInit.call(this,tabData);
            }
        }
        if(tabData && tabData.click){
            tabData['originTab'] = this.originTab;
            tabData.click(e,tabData);
        }
    };
    var itemDestroy = function(e,data){};
    $.extend(objClass.prototype,EventTarget.prototype,{
        version:VERSION,
        //切换选项卡
        switchTab : function (title) {
            var _self = this;
            if ($(itemSelectStr, this.$el).length > 1) {
                $.each(this.tabItem,function (key,val) {
                    var $li = null;
                    if(key == title){
                        $li = $('.'+title,_self.$el);
                        $li.click();
                        return false;
                    }else if(val == title){
                        $li = $('li:contains('+title+')',_self.$el);
                        $li.click();
                        return false;
                    }
                    
                })
            }
        },
        //销毁选项卡
        destroy : function (title,e) {
            var _self = this;
            if ($(itemSelectStr, _self.$el).length > 1) {
                var $li = null;
                $.each(this.tabItem,function (key,val) {
                    if(key == title){
                        $li = $('.sn-tab-container>.sn-tab>.sn-tab-items>.'+title,_self.$el);
                        return false;
                    }else if(val == title){
                        $li = $('li:contains('+title+')',_self.$el);
                        return false;
                    } 
                })
                if($li){
                    var index = $li.index();
                    if(index!=-1){
                        var data = _self.options.tabs[index];
                        var className = data.className;
                        $li.remove();
                        _self.options.tabs.splice(index,1);
                        delete this.tabItem[className];
                        $('>.sn-tab-container>.J_tab_render>.contentArea',_self.$el).find('.'+className).remove();
                        itemDestroy.call(_self,e);
                        _self.trigger('itemDestroy',e,data);
                        if($('.active',_self.$el).length==0){
                            var $newLi = $('.sn-tab-container>.sn-tab>.sn-tab-items>.J_item_click:eq('+index+')',_self.$el);
                            if($newLi.length == 0){
                                $('.sn-tab-container>.sn-tab>.sn-tab-items>.J_item_click:eq('+(index-1)+')',_self.$el).trigger("click");
                            }else{
                                $newLi.trigger("click");
                            }
                        }
                    }
                } 
            }
        },
        //创建选项卡
        createTab : function(title, render, param){
            if(arguments.length == 0){
                return;
            }
            var options = null;
            if (typeof(title) == 'object'){
                options = title;
            }else{
                options = { title:title, render:render, param:param }
            }
            var tabs = this.options.tabs;
            for(var i=0;i<tabs.length;i++){
                if(tabs[i].title == options.title){
                    return;
                }
            }
            var num = Math.floor(100+Math.random()*899);
            var className = options.className?options.className:(options.param&&options.param.className)?options.param.className:'sn-tab-item'+num;
            options.className = className;
            var icon = options.icon?options.icon:(options.param&&options.param.icon)?options.param.icon:'';
            this.options.tabs = this.options.tabs.concat(options);
            this.tabItem[className] = options.title;
            var length = this.options.tabs.length;
            $('.sn-tab-container>.sn-tab>.sn-tab-items',this.$el).append(template(this.options.tabs[length-1]));
            var $liLast = $('.sn-tab-container>.sn-tab>.sn-tab-items>li:last',this.$el);
            $liLast.addClass(className);
            $liLast.trigger("click");
        },
        //设置选项卡内容 
        content : function(html){
            var index = $(".sn-tab-container>.sn-tab>.sn-tab-items",this.$el).find('.active').index();
            var $contentArea = $('>.sn-tab-container>.J_tab_render>.contentArea',this.$el);
            var className = (this.options.tabs)[index].className;
            if (this.lastDom){
                this.lastDom.detach();
            }
            if($contentArea.find('.'+className).length != 0){
                if (typeof(html) == 'object'){
                    this.lastDom = html;
                    $contentArea.find('.'+className).empty().append(html);
                }else{
                    $contentArea.find('.'+className).html(html);
                }
            }else{
                if (typeof(html) == 'object'){
                    this.lastDom = html;
                    var $div = $('<div class="'+className+'"></div>');
                    $div.append(html);
                    $contentArea.append($div);
                }else{
                    $html = $('<div class="'+className+'">'+html+'</div>');
                    $contentArea.append($html);
                }
            }
        },
        render:function(){
            return this;
        }
    })
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
('@charset \"UTF-8\";\r\n\r\n/* 横向tab */\r\n.sn-tab { }\r\n.sn-tab .sn-tab-items { margin: 0; padding: 0; border-bottom: 1px solid #d0d6d9; font-size: 12px; }\r\n.sn-tab .sn-tab-items:after, .sn-tab .contentArea:after { clear: both; display:block; visibility: hidden; height: 0; content: \" \"; }\r\n.sn-tab .sn-tab-items > li { float:left; margin-bottom:-1px; list-style: none; position: relative; padding: 0 16px; }\r\n.sn-tab .sn-tab-items > li:hover .sn-tabClose {visibility: visible; cursor:pointer; }\r\n.sn-tab .sn-tab-items > li a { display: inline-block; height: 36px; line-height: 36px; color: #666; border-bottom: 2px solid transparent; text-decoration: none; outline: none; transition: background-color .4s ease-out,color .4s ease-out; }\r\n.sn-tab .sn-tab-items > li a:hover { border-bottom: 2px solid #0085d0; }\r\n.sn-tab .sn-tab-items > li.active a { border-bottom: 2px solid #0085d0; color: #222; }\r\n.sn-tab .contentArea { margin: 0; padding: 0; font-size: 12px; }\r\n\r\n/* 竖向tab，依赖sn-tab */\r\n.sn-vertical { border: 1px solid #d0d6d9; }\r\n.sn-vertical:after { clear: both; display:block; visibility: hidden; height: 0; content: \" \"; }\r\n.sn-vertical .sn-tab-items { width: 150px; float: left; display: block; margin-bottom: -1px; border-bottom: none; }\r\n.sn-vertical .sn-tab-items li { margin-bottom: 0; width: 100%; height: 36px; text-indent: 12px; border-bottom: 1px solid #d0d6d9; border-right: 1px solid #d0d6d9; }\r\n.sn-vertical .sn-tab-items li a { display: block; margin: 0; height: 36px; line-height: 36px; color: #666; background: #F6F6F6; border-bottom: 1px solid #d0d6d9; }\r\n.sn-vertical .sn-tab-items li a:hover { border-bottom: 1px solid #d0d6d9; }\r\n.sn-vertical .sn-tab-items li.active { border-right: 1px solid transparent; text-indent: 10px; }\r\n.sn-vertical .sn-tab-items li.active a { margin-left: -1px; color: #222; background: #fff; border-bottom: 1px solid #d0d6d9; border-left: 3px solid #0085d0; }\r\n.sn-vertical .sn-tab .contentArea { margin-left: 150px; }\r\n\r\n/*删除*/\r\n.sn-tab .sn-tab-items > li .sn-tabClose {\r\n    background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAANCAYAAACgu+4kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAcRJREFUeNqkUz1IHEEU/t7s6u7iYWD9CxFBwRQhIQjX6BUBxSI/RSAYQtLlIEXCpREsUqaxSKUoWimpDoKFxB8wCKIQAimS5g4xmoBE8ALmhzvWvdvZnRlnEwIH3tn4pplvvve+9968GVJK4TxmnjpZGXRhtWRARlKji4D6hKi8iJvL67UEqLoCuZAaIOvCiuKei8pPHSuAhgTIboWS/DW7t/m4roCYv+ZquKNxG5k21O+dfx5GI+hSP+AVdIbwmZHOz1YLsP+b6E/pqfB4mwwdsPvvoDrvQETNYLeyoKtPIIo+oqL/Kpi47NS8g6gkh6hBAmEBMpuG9XBeV7EP5f9CsDCqs+t2oBJK8aQFvD9VAT+2E1FRt1J2EH7bgyzsgnUlwT++hfBMCN+Kff761WyB+86XwLchgibYj2YggxDeZBr2yDhYz3DMI4gFfGe7tkDZmqvoLCG1Izo8QGn6BYJ8HqWpMbDufpSPGxH41lLHTO573THuPkhNacWMYxowGYHi0Wq+IiS4VEeau9775sOPugKx5e7eyOigl0TkxljFS2HNMtjzK4tbX898SNX2+fZgj2ZcgyjXt7rB6z1lOu9fOBFgADfTzCtPJyMIAAAAAElFTkSuQmCC\') no-repeat center center;\r\n    display: inline-block;\r\n    width: 12px;\r\n    height: 20px;\r\n    margin-right: 1px;\r\n    position: absolute;\r\n    top: 1px;\r\n    right: 1px;\r\n    visibility: hidden;\r\n}');
