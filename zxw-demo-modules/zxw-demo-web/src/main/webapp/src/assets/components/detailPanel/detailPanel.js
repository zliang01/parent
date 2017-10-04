
define('text!components/detailPanel/detailPanel.tpl',[],function () { return '<div class="sn-detailPanel {{className}}">\r\n    {{#if title}}<h3>{{{title}}}</h3>{{/if}}\r\n    <ul class="detailList">\r\n        {{#each items}}\r\n        <li class="{{className}}">\r\n            <label>{{label}}</label>：\r\n            <span class="value">{{{key}}}</span>\r\n            {{#if customHTML}}<span class="custom">{{{customHTML}}}</span>{{/if}}\r\n            \r\n        </li>\r\n        {{/each}}\r\n    </ul>\r\n</div>';});


define('lib/requirejs/css.min!components/detailPanel/detailPanel',[],function(){});
/* 
* 组件-detailPanel
*/
define('detailPanel',[
    'jquery',
    'eventTarget',
    'hdb',
    'text!components/detailPanel/detailPanel.tpl',
    'lib/requirejs/css.min!components/detailPanel/detailPanel.css'
],function ($, eventTarget, hdb,tpl){
    var VERSION = '1.0.0';
    var objClass = function(options){
        //判断el的异常值：el不存在、为空string、dom原生对象
        if(options.el){
            if(options.el instanceof jQuery&&options.el.length>0){
                this.$el = options.el;
            }else if(isDOM(options.el)){
                this.$el = $(options.el);
            }else if (typeof(options.el) == 'string'&&$(options.el).length>0) {
                this.$el = $(options.el);
            }
        }else{
            this.$el = $("<div></div>")             
        }
        this.options = options;
        eventTarget.call(this);
        render.call(this);
        eventInit.call(this);
    };

    $.extend(objClass.prototype,eventTarget.prototype,{
        version:VERSION
    });

    var render = function(){
        var data = this.options.data,
            length = this.options.items.length,
            column = (this.options.column&&this.options.column>=1)?this.options.column:1;
        for(var i = 0,keys=[],key;i<length;i++){
            key = this.options.items[i].key;
            keys.push(key);
            if(typeof(data[key])=='object'){
                itemsRender.call(this,i,data[key]);
            }else{
                this.options.items[i].key = data[key];
            }
        }

        template = hdb.compile(tpl);
        this.$el.html(template(this.options));

        for(var i = 0;i<length;i++){
            this.options.items[i].key = keys[i];
                itemObj = this.options.items[i],
                reg = /^click+[\s]/ig,
                _self = this;
            if(itemObj.click){
                $('.sn-detailPanel li:eq('+i+')',this.$el).find('.value').addClass('canClick');
            }
            for(var n in itemObj){
                if(n.match(reg)){
                    var selector = n.split(' ')[1];
                    $(selector,_self.$el).attr({'data-id':n});
                    _self.$el.find(selector).off('click').on('click',function(){
                        var selectorEvent = $(this).data('id');
                        var index = $(this).closest('li').index();
                        var itemObj = (_self.options.items)[index];
                        itemObj[selectorEvent](itemObj);
                    })
                }
            }
        }
        var width = 100/column;
        $('.sn-detailPanel li',this.$el).width(width+'%');
        setTimeout($.proxy(function(){
            this.trigger('loadSuccess',data);
        },this),200)
        
    }

    var eventInit = function(){
        this.$el.on('click','.sn-detailPanel li>.value',$.proxy(function(e,itemData){
            itemsClick.call(this,e,itemData);
            this.trigger('itemsClick',e,itemData);
        },this));
        this.$el.on('mouseover','.sn-detailPanel li>.value',$.proxy(function(e){
            itemsMouseover.call(this,e);
            this.trigger('itemsMouseover',e);
        },this));

    }
    var itemsClick = function(e){
        var target = e.currentTarget||e.target,
            items = this.options.items;
        var index = $(target).closest('li').index();
        var itemData = items[index];
        if(items[index].click){
            items[index].click(e,itemData);
        }
    }
    var itemsMouseover = function(e){
        var target = e.currentTarget||e.target,
            data = this.options.data,
            items = this.options.items;
        var index = $(target).closest('li').index();
        var itemData = data[items[index].key];
        if(items[index].mouseover){
           items[index].mouseover(e,itemData);
        }
    }

    var itemsRender = function(index,data){
        var items = this.options.items;
        if(items[index].render){
            this.options.items[index].key=items[index].render(data);
        }
    }
    // 注册loadSuccess事件
    var loadSuccess = function(data){}
    // 扩展方法
    $.extend(objClass.prototype,{
        reload:function(data){
            this.options.data = data;
            render.call(this);
        }
    })
    //解决ie下console.log()报错问题
    window.console = window.console || (function(){
        var c = {};
        c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function(){};
        return c;
    })();
    // 判断是否为原生DOM
    var isDOM = function(obj){
        return obj.tagName ?true:false
    } 
    return objClass;
})



                        ;

(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
('.sn-detailPanel { \r\n    padding: 0; \r\n    margin: 0;\r\n    width: 100%;\r\n    display: table;\r\n    font-family: \"Hiragino Sans GB\",\'Arial,\"Microsoft YaHei\",\"STHeiti\",\"WenQuanYi Micro Hei\",SimSun,sans-serif\'; \r\n    font-size: 14px;\r\n}\r\n.sn-detailPanel h3 {\r\n    margin: 0;\r\n    padding: 5px 0;\r\n}\r\n.sn-detailPanel .detailList{ \r\n    padding:0;\r\n    margin:0;\r\n    list-style: none;\r\n    overflow: hidden;\r\n}\r\n\r\n.sn-detailPanel .detailList li {\r\n    padding: 8px 0; \r\n    margin: 0; \r\n    float:left;\r\n    font-size: 14px;\r\n}\r\n.sn-detailPanel .detailList li label {\r\n    display: inline-block;\r\n    width:30%;\r\n    text-align: right;\r\n}\r\n.sn-detailPanel .detailList li a {\r\n    text-decoration: none;\r\n    cursor: pointer;\r\n}\r\n.sn-detailPanel .detailList li .canClick {\r\n    cursor: pointer;\r\n}\r\n.sn-detailPanel .detailList li .custom a {\r\n    margin-left: 10px;\r\n}\r\n');
