
define('text!components/counter/counter.tpl',[],function () { return '<span class="sn-counter">\r\n    <label>{{label}}</label>\r\n    <input type="text" value="" class="counterContent"/>\r\n    <span class="sn-btns">\r\n        <input type="button" value="+" class="btn addBtn"/>\r\n        <input type="button" value="-" class="btn minusBtn"/>\r\n    </span>\r\n</span>';});


define('lib/requirejs/css.min!components/counter/counter',[],function(){});
/**
 * 组件-counter
 */
define('counter',[
    'jquery',
    'eventTarget',
    'text!components/counter/counter.tpl',
    'lib/requirejs/css.min!components/counter/counter.css'
],function ($, eventTarget, tpl){
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
        eventInt.call(this)

        // 获取步进器的最大值和最小值
        var max = this.options.max;
            min = this.options.min,
            value = this.options.value,
            $counter = $('.sn-counter>.counterContent',this.$el);

        // 设置步进器的value
        value = value|| 0;
        min = min>0?min:0;
        if(value<min){
            value = min;
        }else if(value>max){
            value = max;
        }
        this.options.min = min;
        this.options.value = value;
        $counter.val(value);

        // 手动录入
        $counter.blur(function(){
            var val = $(this).val();
            if(isNaN(val)||val==""){
                $(this).val(min);
            }else{
                val = (val>max?max:val<min?min:val)
                $(this).val(val);
            }
        })
    };

    $.extend(objClass.prototype,eventTarget.prototype,{
        version:VERSION
    });

    var render = function(){
        var $tpl = $(tpl);
        $tpl.addClass(this.options.className).children('label').html(this.options.label);
        $tpl.find('.counterContent').attr('value', this.options.value);
        this.$el.html($tpl);
    };
    //自定义事件
    var eventInt = function(){
        var setTime,that = this;
        var timeout = function(i,fn){
            setTime = setTimeout($.proxy(function(){
                fn.call(that);
                that.trigger("'"+fn+"'");
                i<6&&i++;
                timeout(i,fn);
            },this), 420-i*50)
        }
        $('.sn-counter .addBtn',this.$el).on('mousedown',$.proxy(function(){
            var i = 0;
            addNumber.call(this);
            this.trigger('addNumber');
            timeout(i,addNumber)            
        },this));
        $(".sn-counter .addBtn",this.$el).on("mouseup",function(){
            clearTimeout(setTime);
        }) 
        $('.sn-counter .minusBtn',this.$el).on('mousedown', $.proxy(function(){
            var i = 0;
            minusNumber.call(this);
            this.trigger('minusNumber');
            timeout(i,minusNumber)
        },this));
        $(".sn-counter .minusBtn",this.$el).on("mouseup",function(){
            clearTimeout(setTime);
        })
        $('.sn-counter>.counterContent',this.$el).on('focus',$.proxy(function(){
            this.trigger('focus');
        },this));
    }

    var addNumber = function(){
        var $counter = $('.sn-counter>.counterContent',this.$el);
        var val = parseInt($counter.val()),
            max = this.options.max;
        if(val<max){
            val+=1;
            $counter.val(val);
        }else{
            $counter.val(max);
        }
    };
    var minusNumber = function(){
        var $counter = $('.sn-counter>.counterContent',this.$el);
        var val = parseInt($counter.val()),
            min = this.options.min;
        if(val>min){
            val-=1;
            $counter.val(val);
        }else{
            $counter.val(min);
        }
    }
    $.extend(objClass.prototype,{
        get:function(){
             return $('.sn-counter>.counterContent',this.$el).val();
        },
        set:function(num){
            var $counter = $('.sn-counter>.counterContent',this.$el),
                max = this.options.max,
                min = this.options.min;
            if(num>max){
                $counter.val(max);
            }else if(num<min){
                $counter.val(min);
            }else{
                $counter.val(num);
            }
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
});

(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
('.sn-counter,\r\n.sn-counter .btn,\r\n.sn-counter>.counterContent{\r\n    padding:0;\r\n    margin:0;\r\n}\r\n.sn-counter{\r\n    height: 35px;\r\n    line-height: 31px;\r\n}\r\n.sn-counter .sn-btns{\r\n    display: inline-block;\r\n    vertical-align: middle;\r\n}\r\n.sn-counter .sn-btns .btn{\r\n    width: 16px;\r\n    height:13px;\r\n    overflow: hidden;\r\n    border: 1px solid #a7a6ab;\r\n    display: block;\r\n    font-family: tm-detail-font;\r\n    line-height:12px;\r\n    cursor: pointer;\r\n    font-size: 17px;\r\n}\r\n.sn-counter .btn.addBtn{\r\n    margin-bottom: 3px;\r\n}\r\n.sn-counter>.counterContent{\r\n    vertical-align: middle;\r\n    padding: 3px 2px 0 3px;\r\n    height: 26px;\r\n    line-height: 26px;\r\n    font-size: 12px;\r\n    border: 1px solid #a7a6ac;\r\n    width: 36px;\r\n    color: #666\r\n}');
