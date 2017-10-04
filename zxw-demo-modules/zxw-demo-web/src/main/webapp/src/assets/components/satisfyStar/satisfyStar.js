
define('text!components/satisfyStar/satisfyStar.tpl',[],function () { return '<lable>满意度</lable>\r\n<ul class = "sn-satisfyStar {{className}}">\r\n\t{{#for amounts}}\r\n\t\t<!-- <li></li> -->\r\n    {{/for}}\r\n</ul>';});


define('lib/requirejs/css.min!components/satisfyStar/satisfyStar',[],function(){});
/**
 * 组件-timer
 */
define('satisfyStar',['eventTarget', 'hdbHelper', 
    'text!components/satisfyStar/satisfyStar.tpl',
    'lib/requirejs/css.min!components/satisfyStar/satisfyStar.css'
], function(EventTarget, hdb, tpl) {
    var VERSION = '1.0.1';
    var objClass = function(config) {
        this.options = config;
        //判断el的异常值：el不存在、为空string、dom原生对象
        if (config.el instanceof jQuery && config.el.length > 0) {
            this.$el = config.el;
        } else if (config.el && isDOM(config.el)) {
            this.$el = $(config.el);
        } else if (typeof(config.el) == 'string' && $(config.el).length > 0) {
            this.$el = $(config.el);
        } else {
            this.$el = $("<div></div>")
        }
        // 判断是否有className
        config.className = (config.className ? config.className : "satisfyStars");
        // 判断是否有amounts
        config.amounts = (config.amounts ? config.amounts : 5);
        // 判断是否有enableTouch
        config.enableTouch = (config.enableTouch == 0 ? 0 : config.enableTouch || 1);
        // 判断是否有answerMouseOver
        config.answerMouseOver = (config.answerMouseOver == 0 ? 0 : config.answerMouseOver || 1);
        // 判断是否有value
        config.value = (config.value == 0 ? 0 : config.value || 3);

        EventTarget.call(this); 
        render.call(this);
        this.setStarNumber(config.value);
        this.getStarNumber();
        // 自定义事件
        this.$el.on('click', 'li', $.proxy(function(e) {
            select.call(this, e);
            this.trigger('select', e);
        }, this));
        this.$el.on('mouseover', 'li', $.proxy(function(e) {
            change.call(this, e);
            this.trigger('change', e);
        }, this));
    };
    // 扩展方法
    $.extend(objClass.prototype, EventTarget.prototype, {
        version: VERSION,
        setStarNumber: function(starNumber) {
            this.$el.find('ul li').removeClass("select");
            this.options.value =starNumber;
            for (var i = 0; i <= starNumber; i++) {
                this.$el.find('ul li:nth-child(' + i + ')').addClass("select");
            }
        },
        getStarNumber: function() {
            var me = this;
            var starIndex = {starNum: this.options.value}
            if(this.options.enableTouch){
                me.$el.on("click", "li", function() {
                    starIndex.starNum = me.$el.find('ul li').index(this) + 1;
                    me.setStarNumber(starIndex.starNum);
                });
            }
            return starIndex.starNum;
        }
    });
    // 注册change事件
    var change = function() {
        var me = this;
        if(this.options.answerMouseOver){            
            this.$el.on("mouseover", "li", function() {
                // me.$el.find('ul li').removeClass("select");
                var starIndex = me.$el.find('ul li').index(this) + 1;
                for (var i = 0; i <= starIndex; i++) {
                    me.$el.find('ul li:nth-child(' + i + ')').addClass("change");
                }
            });
        }
        $(this.options.el).on("mouseout", "li", function() {
            me.$el.find('ul li').removeClass("change")
        })
    };
    // 注册select事件
    var select = function() {
        this.getStarNumber();
    };
    // 判断是否为原生DOM
    var isDOM = function(obj) {
        return obj.tagName ? true : false
    };
    // 渲染页面
    var render = function(){
        template = hdb.compile(tpl);
        this.$el.html(template(this.options));
    };
    //解决ie下console.log()报错问题
    window.console = window.console || (function() {
        var c = {};
        c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function() {};
        return c;
    })();
    return objClass;
});


(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
('.sn-satisfyStar li{\r\n    list-style: none;\r\n    float: left;\r\n    width: 22px;\r\n    height: 22px;\r\n    background: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHcAAABPCAYAAADREFpKAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDlDNEY3MTg5Q0Q2MTFFNkFFMUJCMjU2RTYyREI2M0IiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDlDNEY3MTk5Q0Q2MTFFNkFFMUJCMjU2RTYyREI2M0IiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpEOUM0RjcxNjlDRDYxMUU2QUUxQkIyNTZFNjJEQjYzQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpEOUM0RjcxNzlDRDYxMUU2QUUxQkIyNTZFNjJEQjYzQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pl0lb3sAAAdTSURBVHja7FzNb1NH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\') no-repeat 0 -60px;\r\n}\r\n.sn-satisfyStar li.select{\r\n   background-position: 0 0; \r\n}\r\n.sn-satisfyStar li.change{\r\n\tbackground-position: 0 -29px;\r\n}\r\n.sn-getMystarNum{\r\n\tmargin-left: 40px;\r\n}\r\n.sn-getMystarNum .showNum{\r\n\tcolor: #f90808;\r\n}');
