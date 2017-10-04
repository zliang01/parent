
define('text!components/groupSearchForm/groupSearchForm.tpl',[],function () { return '<div class = "sn-groupSearchForm {{className}}">\r\n\t{{#if title}}\r\n\t\t<p>{{title}}</p>\r\n\t{{/if}}\r\n\t<form class="searchForm">\t\t\r\n\t\t<ul class="searchOptions">\r\n\t\t\t{{#each items}}\r\n\t\t\t{{#if this.className}}\r\n\t\t\t\t<li class = "{{this.className}}"></li>\r\n\t\t\t{{else}}\r\n\t\t\t\t<li></li>\t\r\n\t\t\t{{/if}}\r\n\t\t    {{/each}}\r\n\t\t</ul>\r\n\t</form>\r\n\t<div class = "sn-groupSearchForm-buttons"></div>\r\n</div>\r\n\t';});


define('lib/requirejs/css.min!components/groupSearchForm/groupSearchForm',[],function(){});
/**
 * 组件-groupSearchForm
 */
define('groupSearchForm',[
    'jquery',
    'eventTarget',
    'hdb',
    'text!components/groupSearchForm/groupSearchForm.tpl',
    'lib/requirejs/css.min!components/groupSearchForm/groupSearchForm.css'
], function($, eventTarget, hdb, tpl) {
    var VERSION = '1.0.0';
    var objClass = function(config) {
        // 对this.$el赋值前对options.el类型判断，jquery对象，DOM对象，字符串
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
        config.className = (config.className ? config.className : "groupSearchForm");
        // 判断是否有column
        config.column = (config.column ? config.column : 4);
        // 判断是否有advancedQuery
        config.advancedQuery = (config.advancedQuery == 0 ? 0 : config.advancedQuery || 0);
        // 判断是否有advancedQuery
        config.button = (config.button ? config.button : 'search');

        this.options = config;
        eventTarget.call(this);
        render.call(this);

        // 自定义事件
        this.$el.on('click', '.search', $.proxy(function(e) {
            search.call(this, e);
            this.trigger('search', this.getData());
        }, this));
        this.$el.on('click', '.reset', $.proxy(function(e) {
            reset.call(this, e);
            this.trigger('reset', e);
        }, this));
    };
    // 扩展方法
    $.extend(objClass.prototype, eventTarget.prototype, {
        version: VERSION,
        // 获取表单提交数据
        getData: function() {
            var formData = {};
            // 获取所有输入框的值
            var inputs = this.$el.find('li input');
            var reg = /[^\u4e00-\u9fa5a-zA-Z]/;
            for (var i = 0; i < inputs.length; i++) {
                if ($(inputs[i]).attr('type') != 'hidden' && $(inputs[i]).attr('type') != 'button') {
                    var key = $(inputs[i]).attr('name');
                    formData[key] = inputs[i].value;
                }
            }
            // 获取所有下拉框的值
            var selects = this.$el.find('li select');
            for (var i = 0; i < selects.length; i++) {
                var optionSelected = $(selects[i]).find('option:selected');
                var key = $(selects[i]).attr('name');
                formData[key] = optionSelected.text();
            }
            // 获取所有文本域的值
            var textareas = this.$el.find('li textarea');
            for (var i = 0; i < textareas.length; i++) {
                var key = $(textareas[i]).attr('name');
                formData[key] = textareas[i].value;
            }
            return formData;
        },
        // 初始化表单数据
        reset: function() {
            this.$el.find('form')[0].reset();
        }
    });
    // 注册search事件
    var search = function(data) {};
    // 注册reset事件
    var reset = function() {
        this.reset();
    };
    // 渲染页面
    var render = function() {
        var template = hdb.compile(tpl);
        this.$el.append(template(this.options));
        // 设置每个表单选项的宽度
        var column = this.options.column;
        this.$el.find('ul').addClass('column' + column);
        // 在容器li中渲染相应的内容
        liHtml.call(this);
        // 渲染按钮
        buttonHtml.call(this);
        // 高级查询的显示和隐藏        
        if (this.options.advancedQuery) {
            advancedQueryHtml.call(this)
        }
    };
    // 在容器li中渲染相应的内容
    var liHtml = function() {
            for (var i = 0; i < this.options.items.length; i++) {
                // 如果有label和element属性，就渲染相应内容
                if (this.options.items[i] && this.options.items[i].label && this.options.items[i].element) {
                    // 渲染label内容
                    var label = this.options.items[i].label;
                    this.$el.find('li:nth-child(' + (i + 1) + ')').append('<label>' + label + '</label>');
                    // 渲染html元素标签
                    var elemReg = /^<.*>$/;
                    var elem = this.options.items[i].element;
                    if (elem.search(elemReg) > -1) {
                        this.$el.find('li:nth-child(' + (i + 1) + ')').append(elem);
                    } else {
                        elem = document.createElement(this.options.items[i].element);
                        this.$el.find('li:nth-child(' + (i + 1) + ')').append(elem);
                    }
                    // 为html元素添加属性
                    if (this.options.items[i].name) {
                        // 输入框
                        if (this.$el.find('li:nth-child(' + (i + 1) + ')').find('input')) {
                            this.$el.find('li:nth-child(' + (i + 1) + ') input').attr('name', this.options.items[i].name);
                        } else if (this.$el.find('li:nth-child(' + (i + 1) + ')').find('select')) {
                            this.$el.find('li:nth-child(' + (i + 1) + ') select').attr('name', this.options.items[i].name);
                        } else if (this.$el.find('li:nth-child(' + (i + 1) + ')').find('textarea')) {
                            this.$el.find('li:nth-child(' + (i + 1) + ') textarea').attr('name', this.options.items[i].name);
                        }
                    }
                    if (this.options.items[i].attribute) {
                        var attributes = this.options.items[i].attribute;
                        var nodeName = $(elem)[0].tagName;
                        for (var attr in attributes) {
                            this.$el.find('li:nth-child(' + (i + 1) + ') ' + nodeName).attr(attr, attributes[attr]);
                        }
                    }
                } else {
                    var elem = this.options.items[i];
                    this.$el.find('li:nth-child(' + (i + 1) + ')').append(elem.$el);
                }
            }
        }
        // 渲染按钮
    var buttonHtml = function() {
            var button = this.options.button;
            if (typeof(button) == 'object' && button.$el) {
                this.$el.find('.sn-groupSearchForm-buttons').append(button.$el);
            } else if (typeof(button) == 'string') {
                var btnArr = button.split('|');
                for (var i = 0; i < btnArr.length; i++) {
                    if (btnArr[i] == 'search') {
                        var elem = '<button class = "' + btnArr[i] + '">' + btnArr[i] + '</button>';
                        this.$el.find('.sn-groupSearchForm-buttons').append(elem);
                    } else if (btnArr[i] == 'reset') {
                        var elem = '<button class = "' + btnArr[i] + '">' + btnArr[i] + '</button>';
                        this.$el.find('.sn-groupSearchForm-buttons').append(elem);
                    } else {
                        console.log('按钮设置有误！');
                    }
                }
            } else {
                console.log('按钮没有设置');
            }
        }
        // 高级查询的显示和隐藏
    var advancedQueryHtml = function() {
            var list = this.$el.find('.sn-groupSearchForm>form>ul li');
            for (var i = 0; i < list.length; i++) {
                if (i + 1 > this.options.column) {
                    $(list[i]).hide();
                } else {
                    $(list[i]).show();
                }
            }
            if (this.options.items.length > this.options.column) {
                var elem = '<li class = "advancedQuery"><a href="javascript:;"></a></li>';
                this.$el.find('.sn-groupSearchForm>form>ul').append(elem);
            }
            var me = this;
            this.$el.find('.advancedQuery').click(function() {
                for (var i = 0; i < list.length; i++) {
                    $(list[i]).show();
                }
                me.$el.find('.advancedQuery').hide();
            });
        }
        // 判断是否为原生DOM
    var isDOM = function(obj) {
        return obj.tagName ? true : false
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
('.sn-groupSearchForm {\r\n    width: 100%;\r\n    display: table;\r\n    padding: 0;\r\n    margin: 0;\r\n    font-family: \'Arial,\"Hiragino Sans GB\",\"Microsoft YaHei\",\"STHeiti\",\"WenQuanYi Micro Hei\",SimSun,sans-serif\';\r\n    font-size: 14px;\r\n}\r\n\r\n.sn-groupSearchForm>form.searchForm>ul.searchOptions>li {\r\n    list-style: none;\r\n    display: inline-block;\r\n    margin: 5px 0;\r\n    position: relative;\r\n}\r\n\r\n.sn-groupSearchForm>form.searchForm>ul.searchOptions>li div {\r\n    display: inline-block;\r\n}\r\n\r\n.sn-groupSearchForm>form.searchForm>ul.searchOptions>li>div {\r\n    width: 100%;\r\n    left: 0;\r\n}\r\n\r\n.sn-groupSearchForm>form.searchForm>ul.searchOptions>li label {\r\n    display: inline-block;\r\n    width: 33%;\r\n    font-size: 14px;\r\n    font-weight: normal;\r\n    text-align: right;\r\n    padding: 0px;\r\n    height: 25px;\r\n    line-height: 25px;\r\n}\r\n\r\n.sn-groupSearchForm>form.searchForm>ul.searchOptions>li label+* {\r\n    position: absolute!important;\r\n    left: 35%;\r\n    height: 25px;\r\n    line-height: 25px;\r\n    margin: 0;\r\n}\r\n\r\n.sn-groupSearchForm>form.searchForm>ul.searchOptions>li input {\r\n    height: 20px;\r\n    border: 1px solid #ddd;\r\n    position: static;\r\n}\r\n\r\n.sn-groupSearchForm>form.searchForm>ul.searchOptions>li select {\r\n    height: 25px;\r\n    border: 1px solid #ddd;\r\n}\r\n\r\n.sn-groupSearchForm>form.searchForm>ul.searchOptions .advancedQuery {\r\n    width: 100%;\r\n    text-align: center;\r\n}\r\n\r\n.sn-groupSearchForm>form.searchForm>ul.searchOptions .advancedQuery a {\r\n    text-decoration: none;\r\n    display: inline-block;\r\n    width: 31px;\r\n    height: 20px;\r\n    border: 1px solid #ddd;\r\n    background-image: url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAUCAYAAAB1aeb6AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAIESURBVEhL5ZZNy2lRGIb3OT/EgOSbUCYMJMrED8CAlImB32DAxEcRE6GYmChDDEWZKMWEMjCRmEiSUrhfa1k6vSf2x5m8g3NN9tr3s3I/695Pe/uFB9wP8ZtdfwRB89lsxhUKBe56vTKFn9VqxSUSCXYnAIn9E/f7HclkEjKZDKlUCqfTiVXes1gsEAgEoFQq0Ww2mfoZXnPCfr9HOByGXq+nDZCG3rFer6kx2ZdOp5nKj6A5gfxwKBSCQqFAsVhk6h+22y2i0SjkcjkymQxThRFlTjgcDojH47QBksD5fKb6crmE3++nxpVKhWpiEW1OOB6PiEQi0Gq1NFpiHAwGodFokMvl2C7xiDKfz+dsBWw2GzoDJpMJbrebNpLNZln1yWPi2YofQfN8Pg+v14vRaMQUYLfbIRaLvZ2BRqMBn8/3bf8neM0vlwvK5TJUKhWcTicGgwGrPBuo1+vs7kmtVoPZbIbFYkGv12PqZ0TFTk5nNBrhcDgwmUyY+p1WqwWDwUD3dLtdpvIjyvx2u6FUKtEEPB4PptMpqzxpt9v0tDabTdSJX4gyf0HeWmq1Gna7HcPhkGokap1OR43H4zHVxCLJnEASIJNOEiBrq9VKm5Fy4heSzR8fGDoDpAGSAnnGnU6HVaUh2fxFtVqFy+VCv99ninT+2Zx8YKQ+47/5X//JcNwXqzKqB0aSE0AAAAAASUVORK5CYII=\');\r\n}\r\n\r\n.sn-groupSearchForm .sn-groupSearchForm-buttons {\r\n    text-align: right;\r\n}\r\n\r\n.sn-groupSearchForm .sn-groupSearchForm-buttons button {\r\n    padding: 6px 14px;\r\n    margin-right: 12px;\r\n    font-size: 12px;\r\n    line-height: 1;\r\n    border-radius: 3px;\r\n    border: 1px solid #DDD;\r\n    background: #fff;\r\n    text-decoration: none;\r\n    cursor: pointer;\r\n    position: relative;\r\n    white-space: nowrap;\r\n    outline: none;\r\n    color: #333;\r\n}\r\n\r\n.column1 li {\r\n    width: 98%;\r\n}\r\n\r\n.column2 li {\r\n    width: 49%;\r\n}\r\n\r\n.column3 li {\r\n    width: 32%;\r\n}\r\n\r\n.column4 li {\r\n    width: 24%;\r\n}\r\n\r\n.column5 li {\r\n    width: 19%;\r\n}\r\n\r\n.column6 li {\r\n    width: 16%;\r\n}\r\n\r\n.column7 li {\r\n    width: 14%;\r\n}\r\n\r\n.column8 li {\r\n    width: 12%;\r\n}\r\n\r\n.column9 li {\r\n    width: 11%;\r\n}\r\n\r\n.column10 li {\r\n    width: 10%;\r\n}\r\n');
