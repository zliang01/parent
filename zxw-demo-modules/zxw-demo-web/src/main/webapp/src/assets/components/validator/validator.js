/*! artDialog v6.0.5 | https://github.com/aui/artDialog */
!(function () {

var __modules__ = {};

function require (id) {
    var mod = __modules__[id];
    var exports = 'exports';

    if (typeof mod === 'object') {
        return mod;
    }

    if (!mod[exports]) {
        mod[exports] = {};
        mod[exports] = mod.call(mod[exports], require, mod[exports], mod) || mod[exports];
    }

    return mod[exports];
}

function define (path, fn) {
    __modules__[path] = fn;
}



define("jquery", function () {
	return jQuery;
});


/*!
 * PopupJS
 * Date: 2014-11-09
 * https://github.com/aui/popupjs
 * (c) 2009-2014 TangBin, http://www.planeArt.cn
 *
 * This is licensed under the GNU LGPL, version 2.1 or later.
 * For details, see: http://www.gnu.org/licenses/lgpl-2.1.html
 */

define("popup", function (require) {

var $ = require("jquery");

var _count = 0;
var _isIE6 = !('minWidth' in $('html')[0].style);
var _isFixed = !_isIE6;


function Popup () {

    this.destroyed = false;


    this.__popup = $('<div />')
    /*使用 <dialog /> 元素可能导致 z-index 永远置顶的问题(chrome)*/
    .css({
        display: 'none',
        position: 'absolute',
        /*
        left: 0,
        top: 0,
        bottom: 'auto',
        right: 'auto',
        margin: 0,
        padding: 0,
        border: '0 none',
        background: 'transparent'
        */
        outline: 0
    })
    .attr('tabindex', '-1')
    .html(this.innerHTML)
    .appendTo('body');


    this.__backdrop = this.__mask = $('<div />')
    .css({
        opacity: .7,
        background: '#000'
    });


    // 使用 HTMLElement 作为外部接口使用，而不是 jquery 对象
    // 统一的接口利于未来 Popup 移植到其他 DOM 库中
    this.node = this.__popup[0];
    this.backdrop = this.__backdrop[0];

    _count ++;
}


$.extend(Popup.prototype, {
    
    /**
     * 初始化完毕事件，在 show()、showModal() 执行
     * @name Popup.prototype.onshow
     * @event
     */

    /**
     * 关闭事件，在 close() 执行
     * @name Popup.prototype.onclose
     * @event
     */

    /**
     * 销毁前事件，在 remove() 前执行
     * @name Popup.prototype.onbeforeremove
     * @event
     */

    /**
     * 销毁事件，在 remove() 执行
     * @name Popup.prototype.onremove
     * @event
     */

    /**
     * 重置事件，在 reset() 执行
     * @name Popup.prototype.onreset
     * @event
     */

    /**
     * 焦点事件，在 foucs() 执行
     * @name Popup.prototype.onfocus
     * @event
     */

    /**
     * 失焦事件，在 blur() 执行
     * @name Popup.prototype.onblur
     * @event
     */

    /** 浮层 DOM 素节点[*] */
    node: null,

    /** 遮罩 DOM 节点[*] */
    backdrop: null,

    /** 是否开启固定定位[*] */
    fixed: false,

    /** 判断对话框是否删除[*] */
    destroyed: true,

    /** 判断对话框是否显示 */
    open: false,

    /** close 返回值 */
    returnValue: '',

    /** 是否自动聚焦 */
    autofocus: true,

    /** 对齐方式[*] */
    align: 'bottom left',

    /** 内部的 HTML 字符串 */
    innerHTML: '',

    /** CSS 类名 */
    className: 'ui-popup',

    /**
     * 显示浮层
     * @param   {HTMLElement, Event}  指定位置（可选）
     */
    show: function (anchor) {

        if (this.destroyed) {
            return this;
        }

        var that = this;
        var popup = this.__popup;
        var backdrop = this.__backdrop;

        this.__activeElement = this.__getActive();

        this.open = true;
        this.follow = anchor || this.follow;


        // 初始化 show 方法
        if (!this.__ready) {

            popup
            .addClass(this.className)
            .attr('role', this.modal ? 'alertdialog' : 'dialog')
            .css('position', this.fixed ? 'fixed' : 'absolute');

            if (!_isIE6) {
                $(window).on('resize', $.proxy(this.reset, this));
            }

            // 模态浮层的遮罩
            if (this.modal) {
                var backdropCss = {
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    userSelect: 'none',
                    zIndex: this.zIndex || Popup.zIndex
                };


                popup.addClass(this.className + '-modal');


                if (!_isFixed) {
                    $.extend(backdropCss, {
                        position: 'absolute',
                        width: $(window).width() + 'px',
                        height: $(document).height() + 'px'
                    });
                }


                backdrop
                .css(backdropCss)
                .attr({tabindex: '0'})
                .on('focus', $.proxy(this.focus, this));

                // 锁定 tab 的焦点操作
                this.__mask = backdrop
                .clone(true)
                .attr('style', '')
                .insertAfter(popup);

                backdrop
                .addClass(this.className + '-backdrop')
                .insertBefore(popup);

                this.__ready = true;
            }


            if (!popup.html()) {
                popup.html(this.innerHTML);
            }
        }


        popup
        .addClass(this.className + '-show')
        .show();

        backdrop.show();


        this.reset().focus();
        this.__dispatchEvent('show');

        return this;
    },


    /** 显示模态浮层。参数参见 show() */
    showModal: function () {
        this.modal = true;
        return this.show.apply(this, arguments);
    },
    
    
    /** 关闭浮层 */
    close: function (result) {
        
        if (!this.destroyed && this.open) {
            
            if (result !== undefined) {
                this.returnValue = result;
            }
            
            this.__popup.hide().removeClass(this.className + '-show');
            this.__backdrop.hide();
            this.open = false;
            this.blur();// 恢复焦点，照顾键盘操作的用户
            this.__dispatchEvent('close');
        }
    
        return this;
    },


    /** 销毁浮层 */
    remove: function () {

        if (this.destroyed) {
            return this;
        }

        this.__dispatchEvent('beforeremove');
        
        if (Popup.current === this) {
            Popup.current = null;
        }


        // 从 DOM 中移除节点
        this.__popup.remove();
        this.__backdrop.remove();
        this.__mask.remove();


        if (!_isIE6) {
            $(window).off('resize', this.reset);
        }


        this.__dispatchEvent('remove');

        for (var i in this) {
            delete this[i];
        }

        return this;
    },


    /** 重置位置 */
    reset: function () {

        var elem = this.follow;

        if (elem) {
            this.__follow(elem);
        } else {
            this.__center();
        }

        this.__dispatchEvent('reset');

        return this;
    },


    /** 让浮层获取焦点 */
    focus: function () {

        var node = this.node;
        var popup = this.__popup;
        var current = Popup.current;
        var index = this.zIndex = Popup.zIndex ++;

        if (current && current !== this) {
            current.blur(false);
        }

        // 检查焦点是否在浮层里面
        if (!$.contains(node, this.__getActive())) {
            var autofocus = popup.find('[autofocus]')[0];

            if (!this._autofocus && autofocus) {
                this._autofocus = true;
            } else {
                autofocus = node;
            }

            this.__focus(autofocus);
        }

        // 设置叠加高度
        popup.css('zIndex', index);
        //this.__backdrop.css('zIndex', index);

        Popup.current = this;
        popup.addClass(this.className + '-focus');

        this.__dispatchEvent('focus');

        return this;
    },


    /** 让浮层失去焦点。将焦点退还给之前的元素，照顾视力障碍用户 */
    blur: function () {

        var activeElement = this.__activeElement;
        var isBlur = arguments[0];


        if (isBlur !== false) {
            this.__focus(activeElement);
        }

        this._autofocus = false;
        this.__popup.removeClass(this.className + '-focus');
        this.__dispatchEvent('blur');

        return this;
    },


    /**
     * 添加事件
     * @param   {String}    事件类型
     * @param   {Function}  监听函数
     */
    addEventListener: function (type, callback) {
        this.__getEventListener(type).push(callback);
        return this;
    },


    /**
     * 删除事件
     * @param   {String}    事件类型
     * @param   {Function}  监听函数
     */
    removeEventListener: function (type, callback) {
        var listeners = this.__getEventListener(type);
        for (var i = 0; i < listeners.length; i ++) {
            if (callback === listeners[i]) {
                listeners.splice(i--, 1);
            }
        }
        return this;
    },


    // 获取事件缓存
    __getEventListener: function (type) {
        var listener = this.__listener;
        if (!listener) {
            listener = this.__listener = {};
        }
        if (!listener[type]) {
            listener[type] = [];
        }
        return listener[type];
    },


    // 派发事件
    __dispatchEvent: function (type) {
        var listeners = this.__getEventListener(type);

        if (this['on' + type]) {
            this['on' + type]();
        }

        for (var i = 0; i < listeners.length; i ++) {
            listeners[i].call(this);
        }
    },


    // 对元素安全聚焦
    __focus: function (elem) {
        // 防止 iframe 跨域无权限报错
        // 防止 IE 不可见元素报错
        try {
            // ie11 bug: iframe 页面点击会跳到顶部
            if (this.autofocus && !/^iframe$/i.test(elem.nodeName)) {
                elem.focus();
            }
        } catch (e) {}
    },


    // 获取当前焦点的元素
    __getActive: function () {
        try {// try: ie8~9, iframe #26
            var activeElement = document.activeElement;
            var contentDocument = activeElement.contentDocument;
            var elem = contentDocument && contentDocument.activeElement || activeElement;
            return elem;
        } catch (e) {}
    },


    // 居中浮层
    __center: function () {
    
        var popup = this.__popup;
        var $window = $(window);
        var $document = $(document);
        var fixed = this.fixed;
        var dl = fixed ? 0 : $document.scrollLeft();
        var dt = fixed ? 0 : $document.scrollTop();
        var ww = $window.width();
        var wh = $window.height();
        var ow = popup.width();
        var oh = popup.height();
        var left = (ww - ow) / 2 + dl;
        var top = (wh - oh) * 382 / 1000 + dt;// 黄金比例
        var style = popup[0].style;

        
        style.left = Math.max(parseInt(left), dl) + 'px';
        style.top = Math.max(parseInt(top), dt) + 'px';
    },
    
    
    // 指定位置 @param    {HTMLElement, Event}  anchor
    __follow: function (anchor) {
        
        var $elem = anchor.parentNode && $(anchor);
        var popup = this.__popup;
        

        if (this.__followSkin) {
            popup.removeClass(this.__followSkin);
        }


        // 隐藏元素不可用
        if ($elem) {
            var o = $elem.offset();
            if (o.left * o.top < 0) {
                return this.__center();
            }
        }
        
        var that = this;
        var fixed = this.fixed;

        var $window = $(window);
        var $document = $(document);
        var winWidth = $window.width();
        var winHeight = $window.height();
        var docLeft =  $document.scrollLeft();
        var docTop = $document.scrollTop();


        var popupWidth = popup.width();
        var popupHeight = popup.height();
        var width = $elem ? $elem.outerWidth() : 0;
        var height = $elem ? $elem.outerHeight() : 0;
        var offset = this.__offset(anchor);
        var x = offset.left;
        var y = offset.top;
        var left =  fixed ? x - docLeft : x;
        var top = fixed ? y - docTop : y;


        var minLeft = fixed ? 0 : docLeft;
        var minTop = fixed ? 0 : docTop;
        var maxLeft = minLeft + winWidth - popupWidth;
        var maxTop = minTop + winHeight - popupHeight;


        var css = {};
        var align = this.align.split(' ');
        var className = this.className + '-';
        var reverse = {top: 'bottom', bottom: 'top', left: 'right', right: 'left'};
        var name = {top: 'top', bottom: 'top', left: 'left', right: 'left'};


        var temp = [{
            top: top - popupHeight,
            bottom: top + height,
            left: left - popupWidth,
            right: left + width
        }, {
            top: top,
            bottom: top - popupHeight + height,
            left: left,
            right: left - popupWidth + width
        }];


        var center = {
            left: left + width / 2 - popupWidth / 2,
            top: top + height / 2 - popupHeight / 2
        };

        
        var range = {
            left: [minLeft, maxLeft],
            top: [minTop, maxTop]
        };


        // 超出可视区域重新适应位置
        $.each(align, function (i, val) {

            // 超出右或下边界：使用左或者上边对齐
            if (temp[i][val] > range[name[val]][1]) {
                val = align[i] = reverse[val];
            }

            // 超出左或右边界：使用右或者下边对齐
            if (temp[i][val] < range[name[val]][0]) {
                align[i] = reverse[val];
            }

        });


        // 一个参数的情况
        if (!align[1]) {
            name[align[1]] = name[align[0]] === 'left' ? 'top' : 'left';
            temp[1][align[1]] = center[name[align[1]]];
        }


        //添加follow的css, 为了给css使用
        className += align.join('-') + ' '+ this.className+ '-follow';
        
        that.__followSkin = className;


        if ($elem) {
            popup.addClass(className);
        }

        
        css[name[align[0]]] = parseInt(temp[0][align[0]]);
        css[name[align[1]]] = parseInt(temp[1][align[1]]);
        popup.css(css);

    },


    // 获取元素相对于页面的位置（包括iframe内的元素）
    // 暂时不支持两层以上的 iframe 套嵌
    __offset: function (anchor) {

        var isNode = anchor.parentNode;
        var offset = isNode ? $(anchor).offset() : {
            left: anchor.pageX,
            top: anchor.pageY
        };


        anchor = isNode ? anchor : anchor.target;
        var ownerDocument = anchor.ownerDocument;
        var defaultView = ownerDocument.defaultView || ownerDocument.parentWindow;
        
        if (defaultView == window) {// IE <= 8 只能使用两个等于号
            return offset;
        }

        // {Element: Ifarme}
        var frameElement = defaultView.frameElement;
        var $ownerDocument = $(ownerDocument);
        var docLeft =  $ownerDocument.scrollLeft();
        var docTop = $ownerDocument.scrollTop();
        var frameOffset = $(frameElement).offset();
        var frameLeft = frameOffset.left;
        var frameTop = frameOffset.top;
        
        return {
            left: offset.left + frameLeft - docLeft,
            top: offset.top + frameTop - docTop
        };
    }
    
});


/** 当前叠加高度 */
Popup.zIndex = 1024;


/** 顶层浮层的实例 */
Popup.current = null;


return Popup;

});

// artDialog - 默认配置
define("dialog-config", {

    /* -----已注释的配置继承自 popup.js，仍可以再这里重新定义它----- */

    // 对齐方式
    //align: 'bottom left',
    
    // 是否固定定位
    //fixed: false,
    
    // 对话框叠加高度值(重要：此值不能超过浏览器最大限制)
    //zIndex: 1024,

    // 设置遮罩背景颜色
    backdropBackground: '#000',

    // 设置遮罩透明度
    backdropOpacity: 0.7,

    // 消息内容
    content: '<span class="ui-dialog-loading">Loading..</span>',
    
    // 标题
    title: '',

    // 对话框状态栏区域 HTML 代码
    statusbar: '',
    
    // 自定义按钮
    button: null,
    
    // 确定按钮回调函数
    ok: null,
    
    // 取消按钮回调函数
    cancel: null,

    // 确定按钮文本
    okValue: 'ok',
    
    // 取消按钮文本
    cancelValue: '关闭',

    cancelDisplay: true,
    
    // 内容宽度
    width: '',
    
    // 内容高度
    height: '',
    
    // 内容与边界填充距离
    padding: '',
    
    // 对话框自定义 className
    skin: '',

    // 是否支持快捷关闭（点击遮罩层自动关闭）
    quickClose: false,

    // css 文件路径，留空则不会使用 js 自动加载样式
    // 注意：css 只允许加载一个
    cssUri: '../css/ui-dialog.css',

    // 模板（使用 table 解决 IE7 宽度自适应的 BUG）
    // js 使用 i="***" 属性识别结构，其余的均可自定义
    innerHTML:
        '<div i="dialog" class="ui-dialog">'
        +       '<div class="ui-dialog-arrow-a"></div>'
        +       '<div class="ui-dialog-arrow-b"></div>'
        +       '<table class="ui-dialog-grid">'
        +           '<tr>'
        +               '<td i="header" class="ui-dialog-header">'
        +                   '<button i="close" class="ui-dialog-close">&#215;</button>'
        +                   '<div i="title" class="ui-dialog-title"></div>'
        +               '</td>'
        +           '</tr>'
        +           '<tr>'
        +               '<td i="body" class="ui-dialog-body">'
        +                   '<div i="content" class="ui-dialog-content"></div>'
        +               '</td>'
        +           '</tr>'
        +           '<tr>'
        +               '<td i="footer" class="ui-dialog-footer">'
        +                   '<div i="statusbar" class="ui-dialog-statusbar"></div>'
        +                   '<div i="button" class="ui-dialog-button"></div>'
        +               '</td>'
        +           '</tr>'
        +       '</table>'
        +'</div>'
    
});

/*!
 * artDialog
 * Date: 2014-11-09
 * https://github.com/aui/artDialog
 * (c) 2009-2014 TangBin, http://www.planeArt.cn
 *
 * This is licensed under the GNU LGPL, version 2.1 or later.
 * For details, see: http://www.gnu.org/licenses/lgpl-2.1.html
 */
define("dialog", function (require) {

var $ = require("jquery");
var Popup = require("popup");
var defaults = require("dialog-config");
var css = defaults.cssUri;


// css loader: RequireJS & SeaJS
if (css) {
    var fn = require[require.toUrl ? 'toUrl' : 'resolve'];
    if (fn) {
        css = fn(css);
        css = '<link rel="stylesheet" href="' + css + '" />';
        if ($('base')[0]) {
            $('base').before(css);
        } else {
            $('head').append(css);
        } 
    }
}


var _count = 0;
var _expando = new Date() - 0; // Date.now()
var _isIE6 = !('minWidth' in $('html')[0].style);
var _isMobile = 'createTouch' in document && !('onmousemove' in document)
    || /(iPhone|iPad|iPod)/i.test(navigator.userAgent);
var _isFixed = !_isIE6 && !_isMobile;


var artDialog = function (options, ok, cancel) {

    var originalOptions = options = options || {};
    

    if (typeof options === 'string' || options.nodeType === 1) {
    
        options = {content: options, fixed: !_isMobile};
    }
    

    options = $.extend(true, {}, artDialog.defaults, options);
    options.original = originalOptions;

    var id = options.id = options.id || _expando + _count;
    var api = artDialog.get(id);
    
    
    // 如果存在同名的对话框对象，则直接返回
    if (api) {
        return api.focus();
    }
    
    
    // 目前主流移动设备对fixed支持不好，禁用此特性
    if (!_isFixed) {
        options.fixed = false;
    }


    // 快捷关闭支持：点击对话框外快速关闭对话框
    if (options.quickClose) {
        options.modal = true;
        options.backdropOpacity = 0;
    }
    

    // 按钮组
    if (!$.isArray(options.button)) {
        options.button = [];
    }

    // 确定按钮
    if (ok !== undefined) {
        options.ok = ok;
    }
    
    if (options.ok) {
        options.button.push({
            id: 'ok',
            value: options.okValue,
            callback: options.ok,
            autofocus: true
        });
    }
    
    // 取消按钮
    if (cancel !== undefined) {
        options.cancel = cancel;
    }
    
    if (options.cancel) {
        options.button.push({
            id: 'cancel',
            value: options.cancelValue,
            callback: options.cancel,
            display: options.cancelDisplay
        });
    }
    

    return artDialog.list[id] = new artDialog.create(options);
};

var popup = function () {};
popup.prototype = Popup.prototype;
var prototype = artDialog.prototype = new popup();

artDialog.create = function (options) {
    var that = this;

    $.extend(this, new Popup());

    var originalOptions = options.original;
    var $popup = $(this.node).html(options.innerHTML);
    var $backdrop = $(this.backdrop);

    this.options = options;
    this._popup = $popup;

    
    $.each(options, function (name, value) {
        if (typeof that[name] === 'function') {
            that[name](value);
        } else {
            that[name] = value;
        }
    });


    // 更新 zIndex 全局配置
    if (options.zIndex) {
        Popup.zIndex = options.zIndex;
    }


    // 设置 ARIA 信息
    $popup.attr({
        'aria-labelledby': this._$('title')
            .attr('id', 'title:' + this.id).attr('id'),
        'aria-describedby': this._$('content')
            .attr('id', 'content:' + this.id).attr('id')
    });


    // 关闭按钮
    this._$('close')
    .css('display', this.cancel === false ? 'none' : '')
    .attr('title', this.cancelValue)
    .on('click', function (event) {
        that._trigger('cancel');
        event.preventDefault();
    });
    

    // 添加视觉参数
    this._$('dialog').addClass(this.skin);
    this._$('body').css('padding', this.padding);


    // 点击任意空白处关闭对话框
    if (options.quickClose) {
        $backdrop
        .on(
            'onmousedown' in document ? 'mousedown' : 'click',
            function () {
            that._trigger('cancel');
            return false;// 阻止抢夺焦点
        });
    }


    // 遮罩设置
    this.addEventListener('show', function () {
        $backdrop.css({
            opacity: 0,
            background: options.backdropBackground
        }).animate(
            {opacity: options.backdropOpacity}
        , 150);
    });


    // ESC 快捷键关闭对话框
    this._esc = function (event) {
        var target = event.target;
        var nodeName = target.nodeName;
        var rinput = /^input|textarea$/i;
        var isTop = Popup.current === that;
        var keyCode = event.keyCode;

        // 避免输入状态中 ESC 误操作关闭
        if (!isTop || rinput.test(nodeName) && target.type !== 'button') {
            return;
        }
        
        if (keyCode === 27) {
            that._trigger('cancel');
        }
    };

    $(document).on('keydown', this._esc);
    this.addEventListener('remove', function () {
        $(document).off('keydown', this._esc);
        delete artDialog.list[this.id];
    });


    _count ++;
    
    artDialog.oncreate(this);

    return this;
};


artDialog.create.prototype = prototype;



$.extend(prototype, {

    /**
     * 显示对话框
     * @name artDialog.prototype.show
     * @param   {HTMLElement Object, Event Object}  指定位置（可选）
     */
    
    /**
     * 显示对话框（模态）
     * @name artDialog.prototype.showModal
     * @param   {HTMLElement Object, Event Object}  指定位置（可选）
     */

    /**
     * 关闭对话框
     * @name artDialog.prototype.close
     * @param   {String, Number}    返回值，可被 onclose 事件收取（可选）
     */

    /**
     * 销毁对话框
     * @name artDialog.prototype.remove
     */

    /**
     * 重置对话框位置
     * @name artDialog.prototype.reset
     */

    /**
     * 让对话框聚焦（同时置顶）
     * @name artDialog.prototype.focus
     */

    /**
     * 让对话框失焦（同时置顶）
     * @name artDialog.prototype.blur
     */

    /**
     * 添加事件
     * @param   {String}    事件类型
     * @param   {Function}  监听函数
     * @name artDialog.prototype.addEventListener
     */

    /**
     * 删除事件
     * @param   {String}    事件类型
     * @param   {Function}  监听函数
     * @name artDialog.prototype.removeEventListener
     */

    /**
     * 对话框显示事件，在 show()、showModal() 执行
     * @name artDialog.prototype.onshow
     * @event
     */

    /**
     * 关闭事件，在 close() 执行
     * @name artDialog.prototype.onclose
     * @event
     */

    /**
     * 销毁前事件，在 remove() 前执行
     * @name artDialog.prototype.onbeforeremove
     * @event
     */

    /**
     * 销毁事件，在 remove() 执行
     * @name artDialog.prototype.onremove
     * @event
     */

    /**
     * 重置事件，在 reset() 执行
     * @name artDialog.prototype.onreset
     * @event
     */

    /**
     * 焦点事件，在 foucs() 执行
     * @name artDialog.prototype.onfocus
     * @event
     */

    /**
     * 失焦事件，在 blur() 执行
     * @name artDialog.prototype.onblur
     * @event
     */

    
    /**
     * 设置内容
     * @param    {String, HTMLElement}   内容
     */
    content: function (html) {
    
        var $content = this._$('content');

        // HTMLElement
        if (typeof html === 'object') {
            html = $(html);
            $content.empty('').append(html.show());
            this.addEventListener('beforeremove', function () {
                $('body').append(html.hide());
            });
        // String
        } else {
            $content.html(html);
        }
                
        return this.reset();
    },
    
    
    /**
     * 设置标题
     * @param    {String}   标题内容
     */
    title: function (text) {
        this._$('title').text(text);
        this._$('header')[text ? 'show' : 'hide']();
        return this;
    },


    /** 设置宽度 */
    width: function (value) {
        this._$('content').css('width', value);
        return this.reset();
    },


    /** 设置高度 */
    height: function (value) {
        this._$('content').css('height', value);
        return this.reset();
    },


    /**
     * 设置按钮组
     * @param   {Array, String}
     * Options: value, callback, autofocus, disabled 
     */
    button: function (args) {
        args = args || [];
        var that = this;
        var html = '';
        var number = 0;
        this.callbacks = {};
        
           
        if (typeof args === 'string') {
            html = args;
            number ++;
        } else {
            $.each(args, function (i, val) {

                var id = val.id = val.id || val.value;
                var style = '';
                that.callbacks[id] = val.callback;


                if (val.display === false) {
                    style = ' style="display:none"';
                } else {
                    number ++;
                }

                html +=
                  '<button'
                + ' type="button"'
                + ' i-id="' + id + '"'
                + style
                + (val.disabled ? ' disabled' : '')
                + (val.autofocus ? ' autofocus class="ui-dialog-autofocus"' : '')
                + '>'
                +   val.value
                + '</button>';

                that._$('button')
                .on('click', '[i-id=' + id +']', function (event) {                
                    var $this = $(this);
                    if (!$this.attr('disabled')) {// IE BUG
                        that._trigger(id);
                    }
                
                    event.preventDefault();
                });

            });
        }

        this._$('button').html(html);
        this._$('footer')[number ? 'show' : 'hide']();

        return this;
    },


    statusbar: function (html) {
        this._$('statusbar')
        .html(html)[html ? 'show' : 'hide']();

        return this;
    },


    _$: function (i) {
        return this._popup.find('[i=' + i + ']');
    },
    
    
    // 触发按钮回调函数
    _trigger: function (id) {
        var fn = this.callbacks[id];
            
        return typeof fn !== 'function' || fn.call(this) !== false ?
            this.close().remove() : this;
    }
    
});



artDialog.oncreate = $.noop;



/** 获取最顶层的对话框API */
artDialog.getCurrent = function () {
    return Popup.current;
};



/**
 * 根据 ID 获取某对话框 API
 * @param    {String}    对话框 ID
 * @return   {Object}    对话框 API (实例)
 */
artDialog.get = function (id) {
    return id === undefined
    ? artDialog.list
    : artDialog.list[id];
};

artDialog.list = {};



/**
 * 默认配置
 */
artDialog.defaults = defaults;



return artDialog;

});




/*!
 * drag.js
 * Date: 2013-12-06
 * https://github.com/aui/artDialog
 * (c) 2009-2014 TangBin, http://www.planeArt.cn
 *
 * This is licensed under the GNU LGPL, version 2.1 or later.
 * For details, see: http://www.gnu.org/licenses/lgpl-2.1.html
 */
define("drag", function (require) {

var $ = require("jquery");


var $window = $(window);
var $document = $(document);
var isTouch = 'createTouch' in document;
var html = document.documentElement;
var isIE6 = !('minWidth' in html.style);
var isLosecapture = !isIE6 && 'onlosecapture' in html;
var isSetCapture = 'setCapture' in html;


var types = {
    start: isTouch ? 'touchstart' : 'mousedown',
    over: isTouch ? 'touchmove' : 'mousemove',
    end: isTouch ? 'touchend' : 'mouseup'
};


var getEvent = isTouch ? function (event) {
    if (!event.touches) {
        event = event.originalEvent.touches.item(0);
    }
    return event;
} : function (event) {
    return event;
};


var DragEvent = function () {
    this.start = $.proxy(this.start, this);
    this.over = $.proxy(this.over, this);
    this.end = $.proxy(this.end, this);
    this.onstart = this.onover = this.onend = $.noop;
};

DragEvent.types = types;

DragEvent.prototype = {

    start: function (event) {
        event = this.startFix(event);

        $document
        .on(types.over, this.over)
        .on(types.end, this.end);
        
        this.onstart(event);
        return false;
    },

    over: function (event) {
        event = this.overFix(event);
        this.onover(event);
        return false;
    },

    end: function (event) {
        event = this.endFix(event);

        $document
        .off(types.over, this.over)
        .off(types.end, this.end);

        this.onend(event);
        return false;
    },

    startFix: function (event) {
        event = getEvent(event);

        this.target = $(event.target);
        this.selectstart = function () {
            return false;
        };

        $document
        .on('selectstart', this.selectstart)
        .on('dblclick', this.end);

        if (isLosecapture) {
            this.target.on('losecapture', this.end);
        } else {
            $window.on('blur', this.end);
        }

        if (isSetCapture) {
            this.target[0].setCapture();
        }

        return event;
    },

    overFix: function (event) {
        event = getEvent(event);
        return event;
    },

    endFix: function (event) {
        event = getEvent(event);

        $document
        .off('selectstart', this.selectstart)
        .off('dblclick', this.end);

        if (isLosecapture) {
            this.target.off('losecapture', this.end);
        } else {
            $window.off('blur', this.end);
        }

        if (isSetCapture) {
            this.target[0].releaseCapture();
        }

        return event;
    }
    
};


/**
 * 启动拖拽
 * @param   {HTMLElement}   被拖拽的元素
 * @param   {Event} 触发拖拽的事件对象。可选，若无则监听 elem 的按下事件启动
 */
DragEvent.create = function (elem, event) {
    var $elem = $(elem);
    var dragEvent = new DragEvent();
    var startType = DragEvent.types.start;
    var noop = function () {};
    var className = elem.className
        .replace(/^\s|\s.*/g, '') + '-drag-start';

    var minX;
    var minY;
    var maxX;
    var maxY;

    var api = {
        onstart: noop,
        onover: noop,
        onend: noop,
        off: function () {
            $elem.off(startType, dragEvent.start);
        }
    };


    dragEvent.onstart = function (event) {
        var isFixed = $elem.css('position') === 'fixed';
        var dl = $document.scrollLeft();
        var dt = $document.scrollTop();
        var w = $elem.width();
        var h = $elem.height();

        minX = 0;
        minY = 0;
        maxX = isFixed ? $window.width() - w + minX : $document.width() - w;
        maxY = isFixed ? $window.height() - h + minY : $document.height() - h;

        var offset = $elem.offset();
        var left = this.startLeft = isFixed ? offset.left - dl : offset.left;
        var top = this.startTop = isFixed ? offset.top - dt  : offset.top;

        this.clientX = event.clientX;
        this.clientY = event.clientY;

        $elem.addClass(className);
        api.onstart.call(elem, event, left, top);
    };
    

    dragEvent.onover = function (event) {
        var left = event.clientX - this.clientX + this.startLeft;
        var top = event.clientY - this.clientY + this.startTop;
        var style = $elem[0].style;

        left = Math.max(minX, Math.min(maxX, left));
        top = Math.max(minY, Math.min(maxY, top));

        style.left = left + 'px';
        style.top = top + 'px';
        
        api.onover.call(elem, event, left, top);
    };
    

    dragEvent.onend = function (event) {
        var position = $elem.position();
        var left = position.left;
        var top = position.top;
        $elem.removeClass(className);
        api.onend.call(elem, event, left, top);
    };


    dragEvent.off = function () {
        $elem.off(startType, dragEvent.start);
    };


    if (event) {
        dragEvent.start(event);
    } else {
        $elem.on(startType, dragEvent.start);
    }

    return api;
};

return DragEvent;

});

/*!
 * artDialog-plus
 * Date: 2013-11-09
 * https://github.com/aui/artDialog
 * (c) 2009-2014 TangBin, http://www.planeArt.cn
 *
 * This is licensed under the GNU LGPL, version 2.1 or later.
 * For details, see: http://www.gnu.org/licenses/lgpl-2.1.html
 */
define("dialog-plus", function (require) {

var $ = require("jquery");
var dialog = require("dialog");
var drag = require("drag");

dialog.oncreate = function (api) {

    var options = api.options;
    var originalOptions = options.original;

    // 页面地址
    var url = options.url;
    // 页面加载完毕的事件
    var oniframeload = options.oniframeload;

    var $iframe;


    if (url) {
        this.padding = options.padding = 0;

        $iframe = $('<iframe />');

        $iframe.attr({
            src: url,
            name: api.id,
            width: '100%',
            height: '100%',
            allowtransparency: 'yes',
            frameborder: 'no',
            scrolling: 'auto',
            style:'display:block'
        })
        .on('load', function () {
            var test;
            
            try {
                // 跨域测试
                test = $iframe[0].contentWindow.frameElement;
            } catch (e) {}

            if (test) {

                if (!options.width) {
                    api.width($iframe.contents().width());
                }
                
                if (!options.height) {
                    api.height($iframe.contents().height());
                }
            }

            if (oniframeload) {
                oniframeload.call(api);
            }

        });

        api.addEventListener('beforeremove', function () {

            // 重要！需要重置iframe地址，否则下次出现的对话框在IE6、7无法聚焦input
            // IE删除iframe后，iframe仍然会留在内存中出现上述问题，置换src是最容易解决的方法
            $iframe.attr('src', 'about:blank').remove();


        }, false);

        api.content($iframe[0]);

        api.iframeNode = $iframe[0];

    }


    // 对于子页面呼出的对话框特殊处理
    // 如果对话框配置来自 iframe
    if (!(originalOptions instanceof Object)) {

        var un = function () {
            api.close().remove();
        };

        // 找到那个 iframe
        for (var i = 0; i < frames.length; i ++) {
            try {
                if (originalOptions instanceof frames[i].Object) {
                    // 让 iframe 刷新的时候也关闭对话框，
                    // 防止要执行的对象被强制收回导致 IE 报错：“不能执行已释放 Script 的代码”
                    $(frames[i]).one('unload', un);
                    break;
                }
            } catch (e) {} 
        }
    }


    // 拖拽支持
    $(api.node).on(drag.types.start, '[i=title]', function (event) {
        // 排除气泡类型的对话框
        if (!api.follow) {
            api.focus();
            drag.create(api.node, event);
        }
    });

};



dialog.get = function (id) {

    // 从 iframe 传入 window 对象
    if (id && id.frameElement) {
        var iframe = id.frameElement;
        var list = dialog.list;
        var api;
        for (var i in list) {
            api = list[i];
            if (api.node.getElementsByTagName('iframe')[0] === iframe) {
                return api;
            }
        }
    // 直接传入 id 的情况
    } else if (id) {
        return dialog.list[id];
    }

};



return dialog;

});


window.dialog = require("dialog-plus");

})();
define("artDialog", ["jquery"], function(){});


define('lib/requirejs/css.min!components/validator/validator',[],function(){});

define('lib/requirejs/css.min!lib/dialog/6.0.4/css/ui-dialog',[],function(){});
/**
 * Created by zhanglizhao on 2016/3/9.
 */
define('validator',['eventTarget', 'artDialog', 
    'lib/requirejs/css.min!components/validator/validator.css',
    'lib/requirejs/css.min!lib/dialog/6.0.4/css/ui-dialog.css'], 
    function (EventTarget) {
    var VERSION = '1.0.1';
    var tools={
        isArray:function(arr) {
            return Object.prototype.toString.apply(arr) === "[object Array]";
        },
        isObject:function(arr) {
            return Object.prototype.toString.apply(arr) === "[object Object]";
        },
        isFunction:function(arr) {
            return Object.prototype.toString.apply(arr) === "[object Function]";
        }
    };

    var SnRegExp={
        decmal: "^([+-]?)\\d*\\.\\d+$", //浮点数
        decmal1: "^[1-9]\\d*.\\d*|0.\\d*[1-9]\\d*$", //正浮点数
        decmal2: "^-([1-9]\\d*.\\d*|0.\\d*[1-9]\\d*)$", //负浮点数
        decmal3: "^-?([1-9]\\d*.\\d*|0.\\d*[1-9]\\d*|0?.0+|0)$", //浮点数
        decmal4: "^[1-9]\\d*.\\d*|0.\\d*[1-9]\\d*|0?.0+|0$", //非负浮点数（正浮点数 + 0）
        decmal5: "^(-([1-9]\\d*.\\d*|0.\\d*[1-9]\\d*))|0?.0+|0$", //非正浮点数（负浮点数 + 0）
        intege: "^-?[1-9]\\d*$", //整数
        intege1: "^[1-9]\\d*$", //正整数
        intege2: "^-[1-9]\\d*$", //负整数
        num: "^([+-]?)\\d*\\.?\\d+$", //数字
        num1: "^[1-9]\\d*|0$", //正数（正整数 + 0）
        num2: "^-[1-9]\\d*|0$", //负数（负整数 + 0）
        ascii: "^[\\x00-\\xFF]+$", //仅ACSII字符
        chinese: "^[\\u4e00-\\u9fa5]+$", //仅中文
        color: "^[a-fA-F0-9]{6}$", //颜色
        date: "^\\d{4}(\\-|\\/|\\.)\\d{1,2}\\1\\d{1,2}$", //日期
        time:"^(([0-1]?[0-9])|([2][0-3])):([0-5]?[0-9])(:([0-5]?[0-9]))?$",//时间
        email: "^\\w+((-\\w+)|(\\.\\w+))*\\@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$", //邮件
        idcard: "^(^\\d{15}$|^\\d{18}$|^\\d{17}(\\d|X|x))$", //身份证
        ip4: "^(25[0-5]|2[0-4]\\d|[0-1]\\d{2}|[1-9]?\\d)\\.(25[0-5]|2[0-4]\\d|[0-1]\\d{2}|[1-9]?\\d)\\.(25[0-5]|2[0-4]\\d|[0-1]\\d{2}|[1-9]?\\d)\\.(25[0-5]|2[0-4]\\d|[0-1]\\d{2}|[1-9]?\\d)$", //ip地址
        letter: "^[A-Za-z]+$", //字母
        letter_l: "^[a-z]+$", //小写字母
        letter_u: "^[A-Z]+$", //大写字母
        mobile: "^0?(13|15|17|18|14)[0-9]{9}$", //手机
        notempty: "^\\S+$", //非空
        password: "^.*[A-Za-z0-9\\w_-]+.*$", //密码
        fullNumber: "^[0-9]+$", //数字
        picture: "(.*)\\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$", //图片
        qq: "^[1-9]*[1-9][0-9]*$", //QQ号码
        rar: "(.*)\\.(rar|zip|7zip|tgz)$", //压缩文件
        tel: "^[0-9\\-()（）]{7,18}$", //电话号码的函数(包括验证国内区号,国际区号,分机号)
        url: "^http[s]?:\\/\\/([\\w-]+\\.)+[\\w-]+([\\w-./?%&=]*)?$", //url
        username: "^[A-Za-z0-9_\\-\\u4e00-\\u9fa5]+$", //户名
        deptname: "^[A-Za-z0-9_()（）\\-\\u4e00-\\u9fa5]+$", //单位名
        zipcode: "^\\d{6}$", //邮编
        realname: "^[A-Za-z\\u4e00-\\u9fa5]+$", // 真实姓名
        companyname: "^[A-Za-z0-9_()（）\\-\\u4e00-\\u9fa5]+$",
        companyaddr: "^[A-Za-z0-9_()（）\\#\\-\\u4e00-\\u9fa5]+$",
        companysite: "^http[s]?:\\/\\/([\\w-]+\\.)+[\\w-]+([\\w-./?%&#=]*)?$"
    };

    var defaultMsg={
        required:'此项必填',
        mobile:'此项必需为手机号',
        number:'此项必需为数字',
        email:'此项必需为邮箱',
        date:'此项必需为日期',
        time:'此项必需为时间',
        max:'此项最大值为{{0}}',
        min:'此项最小值为{{0}}'
    };

    //验证规则
    var validateRules={
        // 判断字符串是否为空
        "required": function (str) {
            return !(str.replace(/\s/g,"") == "" || typeof str != "string");
        },
        // 判断是否是手机号码
        "mobile": function (str) {
            return new RegExp(SnRegExp.mobile).test(str);
        },
        // 判断是否是数字
        "number": function (str) {
            return new RegExp(SnRegExp.num).test(str);
        },
        // 判断是否是日期格式
        "date":function(str){
            return new RegExp(SnRegExp.date).test(str);
        },
        // 判断是否是时间格式
        "time":function(str){
            return new RegExp(SnRegExp.time).test(str);
        },
        // 判断是否是email
        "email": function (str) {
            return new RegExp(SnRegExp.email).test(str);
        },
        //判断是否整数
        "digits":function(str){
            return new RegExp(SnRegExp.intege).test(str);
        },
        //判断是否整数
        "max":function(str,_max){
            return (str.length <= _max);
        },
        //判断是否整数
        "min":function(str,_min){
            return (str.length >= _min);
        }
      /*  // 判断是否纯数字
        "fullNumber":function(str){
            return new RegExp(SnRegExp.fullNumber).test(str);
        },*/
    };
    
    var VERSION = '1.0.0';
    var objClass = function (options) {
        // if(!tools.isObject(options)||(options.el&&(options.el.length!=1))||!options.rules)return false;
        if(options.el){
            if(options.el instanceof jQuery&&options.el.length>0){
                this.form = options.el;
            }else if(isDOM(options.el)){
                this.form = $(options.el);
            }else if (typeof(options.el) == 'string'&&$(options.el).length>0) {
                this.form = $(options.el);
            }
        }else{
            this.form = $("<div></div>")             
        }
        this.submitBtn = options.submitBtn;
        this.resetBtn=options.resetBtn;
        this.rules=options.rules;
        this.messages=options.messages;
        this.defaultMsg=defaultMsg;
        this.dialog=options.dialog;
        this.items={};
        this.returnObj=returnObj.call(this);
        EventTarget.call(this.returnObj);

        this.eventInit();
        this.validateRules=validateRules;
        return this.returnObj;
    };

    //返回参数
    function returnObj(){
        var _sef=this;
        var returnOjb={
            //添加验证规则
            addMethod:function(name,callback){
                if(name&&callback&&tools.isFunction(callback)&&!_sef.validateRules[name]){
                    _sef.validateRules[name]=callback
                }
            },
            extendMessages:function(msg){
                tools.isObject(msg)&&$.extend(_sef.defaultMsg,msg);
            },
            form:function(){
                var validate=_sef.dealValidateArr();
                if(validate){
                    _sef.returnObj.trigger("success");
                }
                return validate
            }
        };

        $.extend(returnOjb,EventTarget.prototype);

        return returnOjb
    }

    $.extend(objClass.prototype,{
        version:VERSION,
        //事件绑定
        eventInit:function(){

            //提交按钮点击事件
            if(this.submitBtn&&this.submitBtn.length) {
                this.submitBtn.on("click", $.proxy(function(e){
                    if(this.dealValidateArr()){
                        this.returnObj.trigger("success");
                    }
                }, this));
            }
            //重置按钮点击事件
            if(this.resetBtn&&this.resetBtn.length){
                this.resetBtn.on("click", $.proxy(function(){
                    this.form[0].reset();
                },this));
            }

            this.form.on("click", $.proxy(function(){
                this.getItems();
            },this));

        },
        //根据el类型绑定对应事件
        eventEleInit:function(item){
            var _self=this;
           switch (item.tagName){
               case "INPUT":
                   _self.form.on("change blur focus",'input[name='+item.name+']',function(e){
                       if(e.type=="focusin"){
                           _self.dialogClose()
                       }else{
                           var error=_self.verify(item);
                           _self.errorFun(error,item,true);
                       }

                   });
                   break;
               case "TEXTAREA":
                   _self.form.on("change blur focus",'textarea[name='+item.name+']',function(e){
                       if(e.type=="focusin"){
                           _self.dialogClose()
                       }else{
                           var error=_self.verify(item);
                           _self.errorFun(error,item,true);
                       }

                   });
                   break;
               case "SELECT":
                   _self.form.on("change",'select[name='+item.name+']',function(){
                       _self.dialogClose();
                       var error=_self.verify(item);
                       _self.errorFun(error,item,true);
                   });
                   break;
           }
        },
        //循环this.rules得到 this.items;
        getItems:function(callback){
            if(this.items){
                for (var item in this.rules) {
                    if (!this.items[item]) {
                        var ele = $("[name=" + item + "]", this.form);
                        if(ele.length){
                            this.items[item] = {
                                name: item,
                                el: ele,
                                tagName: ele[0].tagName,
                                rules: this.rules[item].split("|")
                            };
                            this.eventEleInit(this.items[item]);
                        }
                    }
                    this.items[item]&&callback && callback.call(this, this.items[item]);
                }
            }
        },
        //处理 validateArr
        dealValidateArr:function(){
            var errorText=[];
            this.getItems(function(item){
                if(item["rules"]){
                    var error_text=this.verify(item);
                    this.errorFun(error_text,item);
                    error_text&&errorText.push('<p>'+error_text+'</p>');
                }
            });
            if(errorText.length){
                if(this.dialog){
                    var d=dialog({
                        quickClose: true,
                        content:errorText.join("")
                    });
                    d.show();
                }

                return false;
            }else{

                return true;
            }
        },
        //判断value值是否通过验证 返回错误信息
        verify:function(item){
            var errorText='';
            $.each(item.rules, $.proxy(function(kev,v){
                var validate=this.getRule(v);
                if(validate.is_rule){
                    var value=item.el.val();
                    if (($.inArray("required",item.rules)!= -1)||(this.validateRules["required"](value))) {
                        if (validate.validate(value)) {
                            if (this.messages && this.messages[item.name] && this.messages[item.name][validate.val]) {
                                errorText = this.messages[item.name][validate.val]
                            } else {
                                //errorText = (this.defaultMsg[validate.val] ? this.defaultMsg[validate.val] : ("验证不通过"));
                                errorText = this.defaultMsgFun(validate);
                            }
                            return false
                        }
                    }
                }
            },this));
            return errorText;
        },
        //默认提示文本
        defaultMsgFun:function(obj){
            var error="验证不通过";
            if(this.defaultMsg[obj.val]){
                error=this.defaultMsg[obj.val].replace('\{\{0\}\}',obj.str1?obj.str1:"").replace('\{\{1\}\}',obj.str2?obj.str2:"")
            }
            return error;
        },
        //针对 min-10 max-20 这样的规则进行集中处理 后期可在扩展
        getRule:function(rule){
            var ruleObj={},_self=this,arr=[];
            if(rule.split("-")[1]){
                arr=rule.split("-");
                ruleObj.val=arr[0];
                ruleObj.str1=arr[1];
            }else{
                ruleObj.val=rule
            }
            $.extend(ruleObj,{
                is_rule:!!_self.validateRules[ruleObj.val],
                validate:function(value){
                    var is_validate;
                    if(ruleObj.str1){
                        is_validate=_self.validateRules[ruleObj.val](value,ruleObj.str1)
                    }else{
                        is_validate=_self.validateRules[ruleObj.val](value)
                    }
                    return !is_validate
                }
            });
            return ruleObj;
        },
        //元素错误处理
        errorFun:function(errorText,item,is_tips){
            var _self=this;
            if(errorText){
                item.el.parent().addClass("validate-error");
                if(is_tips){
                    var d = dialog({
                        id:"sn-validate",
                        content:errorText
                    });
                    d.show(item.el[0]);
                    setTimeout($.proxy(function(){
                        _self.dialogClose();
                    }),2500)
                }
            }else {
                item.el.parent().removeClass("validate-error");
            }

        },
        dialogClose:function(){
            dialog.get("sn-validate")&&dialog.get("sn-validate").close().remove();
        }
    });

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
('/*add by lizhao error style*/\r\n.validate-error>input,.validate-error>select,.validate-error>textarea{border-color:#d18394!important; background: #fef3f4;color: #c9344b}\r\n.validate-error .iconfont{color:#d18394 }/*!\r\n * ui-dialog.css\r\n * Date: 2014-07-03\r\n * https://github.com/aui/artDialog\r\n * (c) 2009-2014 TangBin, http://www.planeArt.cn\r\n *\r\n * This is licensed under the GNU LGPL, version 2.1 or later.\r\n * For details, see: http://www.gnu.org/licenses/lgpl-2.1.html\r\n */\r\n.ui-dialog {\r\n    *zoom:1;\r\n    _float: left;\r\n    position: relative;\r\n    background-color: #FFF;\r\n    border: 1px solid #CCC;\r\n    border-radius: 6px;\r\n    outline: 0;\r\n    background-clip: padding-box;\r\n    font-family: Helvetica, arial, sans-serif;\r\n    font-size: 14px;\r\n    line-height: 1.428571429;\r\n    color: #333;\r\n    opacity: 0;\r\n    -webkit-transform: scale(0);\r\n    transform: scale(0);\r\n    -webkit-transition: -webkit-transform .15s ease-in-out, opacity .15s ease-in-out;\r\n    transition: transform .15s ease-in-out, opacity .15s ease-in-out;\r\n}\r\n.ui-popup-show .ui-dialog {\r\n    opacity: 1;\r\n    -webkit-transform: scale(1);\r\n    transform: scale(1);\r\n}\r\n.ui-popup-focus .ui-dialog {\r\n    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);\r\n}\r\n.ui-popup-modal .ui-dialog {\r\n    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1), 0 0 256px rgba(255, 255, 255, .3);\r\n}\r\n.ui-dialog-grid {\r\n    width: auto;\r\n    margin: 0;\r\n    border: 0 none;\r\n    border-collapse:collapse;\r\n    border-spacing: 0;\r\n    background: transparent;\r\n}\r\n.ui-dialog-header,\r\n.ui-dialog-body,\r\n.ui-dialog-footer {\r\n    padding: 0;\r\n    border: 0 none;\r\n    text-align: left;\r\n    background: transparent;\r\n}\r\n.ui-dialog-header {\r\n    white-space: nowrap;\r\n    border-bottom: 1px solid #d0d6d9;\r\n}\r\n.ui-dialog-close {\r\n    position: relative;\r\n    _position: absolute;\r\n    float: right;\r\n    top: 11px;\r\n    right: 12px;\r\n    _height: 26px;\r\n    padding: 0 4px;\r\n    font-size: 28px;\r\n    font-family: arial;\r\n    line-height: 1;\r\n    color: #78909c;\r\n    text-shadow: 0 1px 0 #FFF;\r\n    cursor: pointer;\r\n    background: transparent;\r\n    _background: #FFF;\r\n    border: 0;\r\n    -webkit-appearance: none;\r\n}\r\n.ui-dialog-close:hover,\r\n.ui-dialog-close:focus {\r\n    color: #000000;\r\n    text-decoration: none;\r\n    cursor: pointer;\r\n    outline: 0;\r\n}\r\n.ui-dialog-title {\r\n    margin: 0;\r\n    color: #222;\r\n    font-size: 16px;\r\n    line-height: 1.428571429;\r\n    min-height: 16.428571429px;\r\n    padding: 14px;\r\n    overflow:hidden; \r\n    white-space: nowrap;\r\n    text-overflow: ellipsis;\r\n    font-weight: bold;\r\n    cursor: default;\r\n}\r\n.ui-dialog-content {\r\n    display: inline-block;\r\n    position: relative;\r\n    vertical-align: middle;\r\n    *zoom: 1;\r\n    *display: inline;\r\n    text-align: left;\r\n    overflow: auto;\r\n}\r\n.ui-dialog-footer {\r\n    padding: 13px;\r\n    text-align: center;\r\n    background: #F9FAFC; \r\n    border-top: 1px solid #EAEEF1; \r\n    border-radius: 0 0 4px 4px;\r\n    height:20px;\r\n}\r\n.ui-dialog-statusbar {\r\n    float: left;\r\n    margin-right: 20px;\r\n    padding: 6px 0;\r\n    line-height: 1.428571429;\r\n    font-size: 14px;\r\n    color: #888;\r\n    white-space: nowrap;\r\n}\r\n.ui-dialog-statusbar label:hover {\r\n    color: #333;\r\n}\r\n.ui-dialog-statusbar input,\r\n.ui-dialog-statusbar .label {\r\n    vertical-align: middle;\r\n}\r\n.ui-dialog-button {\r\n    /*float: right;*/\r\n    white-space: nowrap;\r\n}\r\n.ui-dialog-footer button+button {\r\n    margin-bottom: 0;\r\n    margin-left: 30px;\r\n}\r\n.ui-dialog-footer button {\r\n    overflow:visible;\r\n    display: inline-block;\r\n    padding: 6px 52px;\r\n    _margin-left: 5px;\r\n    margin-bottom: 0;\r\n    font-size: 14px;\r\n    font-weight: normal;\r\n    line-height: 1.428571429;\r\n    text-align: center;\r\n    white-space: nowrap;\r\n    vertical-align: middle;\r\n    cursor: pointer;\r\n    background-image: none;\r\n    border: 1px solid transparent;\r\n    border-radius: 3px;\r\n}\r\n\r\n.ui-dialog-footer button:hover,\r\n.ui-dialog-footer button:focus {\r\n  color: #333333;\r\n  text-decoration: none;\r\n}\r\n\r\n.ui-dialog-footer button:active {\r\n  background-image: none;\r\n  outline: 0;\r\n}\r\n.ui-dialog-footer button[disabled] {\r\n  pointer-events: none;\r\n  cursor: not-allowed;\r\n  opacity: 0.65;\r\n  filter: alpha(opacity=65);\r\n}\r\n\r\n.ui-dialog-footer button {\r\n  color: #0085d0;\r\n  background-color: #ffffff;\r\n  border-color: #d0d6d9;\r\n  outline: none;\r\n}\r\n\r\n.ui-dialog-footer button:hover,\r\n.ui-dialog-footer button:focus {\r\n  color: #0085d0;\r\n  background-color: #e5f3fa;\r\n  border-color: #d0d6d9;\r\n}\r\n\r\n.ui-dialog-footer button:active {\r\n  color: #0085d0;\r\n  background-color: #eaeef1;\r\n  border-color: #d0d6d9;\r\n}\r\n\r\n.ui-dialog-footer button:active{\r\n  background-image: none;\r\n}\r\n\r\n.ui-dialog-footer button[disabled],\r\n.ui-dialog-footer button[disabled]:hover,\r\n.ui-dialog-footer button[disabled]:focus,\r\n.ui-dialog-footer button[disabled]:active {\r\n  background-color: #ffffff;\r\n  border-color: #cccccc;\r\n}\r\n\r\n.ui-dialog-footer button.ui-dialog-autofocus {\r\n  color: #ffffff;\r\n  background-color: #0085d0;\r\n  border-color: #0085d0;\r\n}\r\n\r\n.ui-dialog-footer button.ui-dialog-autofocus:hover,\r\n.ui-dialog-footer button.ui-dialog-autofocus:focus {\r\n  color: #ffffff;\r\n  background-color: #1a91d4;\r\n  border-color: #1a91d4;\r\n}\r\n\r\n.ui-dialog-footer button.ui-dialog-autofocus:active {\r\n  color: #ffffff;\r\n  background-color: #0077ba;\r\n  border-color: #0077ba;\r\n}\r\n.ui-popup-top-left .ui-dialog,\r\n.ui-popup-top .ui-dialog,\r\n.ui-popup-top-right .ui-dialog {\r\n    top: -8px;\r\n}\r\n.ui-popup-bottom-left .ui-dialog,\r\n.ui-popup-bottom .ui-dialog,\r\n.ui-popup-bottom-right .ui-dialog {\r\n    top: 8px;\r\n}\r\n.ui-popup-left-top .ui-dialog,\r\n.ui-popup-left .ui-dialog,\r\n.ui-popup-left-bottom .ui-dialog {\r\n    left: -8px;\r\n}\r\n.ui-popup-right-top .ui-dialog,\r\n.ui-popup-right .ui-dialog,\r\n.ui-popup-right-bottom .ui-dialog {\r\n    left: 8px;\r\n}\r\n\r\n.ui-dialog-arrow-a,\r\n.ui-dialog-arrow-b {\r\n    position: absolute;\r\n    display: none;\r\n    width: 0;\r\n    height: 0;\r\n    overflow:hidden;\r\n    _color:#FF3FFF;\r\n    _filter:chroma(color=#FF3FFF);\r\n    border:8px dashed transparent;\r\n}\r\n.ui-popup-follow .ui-dialog-arrow-a,\r\n.ui-popup-follow .ui-dialog-arrow-b{\r\n    display: block;\r\n}\r\n.ui-popup-top-left .ui-dialog-arrow-a,\r\n.ui-popup-top .ui-dialog-arrow-a,\r\n.ui-popup-top-right .ui-dialog-arrow-a {\r\n    bottom: -16px;\r\n    border-top:8px solid #7C7C7C;\r\n}\r\n.ui-popup-top-left .ui-dialog-arrow-b,\r\n.ui-popup-top .ui-dialog-arrow-b,\r\n.ui-popup-top-right .ui-dialog-arrow-b {\r\n    bottom: -15px;\r\n    border-top:8px solid #fff;\r\n}\r\n.ui-popup-top-left .ui-dialog-arrow-a,\r\n.ui-popup-top-left .ui-dialog-arrow-b  {\r\n    left: 15px;\r\n}\r\n.ui-popup-top .ui-dialog-arrow-a,\r\n.ui-popup-top .ui-dialog-arrow-b  {\r\n    left: 50%;\r\n    margin-left: -8px;\r\n}\r\n.ui-popup-top-right .ui-dialog-arrow-a,\r\n.ui-popup-top-right .ui-dialog-arrow-b {\r\n    right: 15px;\r\n}\r\n.ui-popup-bottom-left .ui-dialog-arrow-a,\r\n.ui-popup-bottom .ui-dialog-arrow-a,\r\n.ui-popup-bottom-right .ui-dialog-arrow-a {\r\n    top: -16px;\r\n    border-bottom:8px solid #7C7C7C;\r\n}\r\n.ui-popup-bottom-left .ui-dialog-arrow-b,\r\n.ui-popup-bottom .ui-dialog-arrow-b,\r\n.ui-popup-bottom-right .ui-dialog-arrow-b {\r\n    top: -15px;\r\n    border-bottom:8px solid #fff;\r\n}\r\n.ui-popup-bottom-left .ui-dialog-arrow-a,\r\n.ui-popup-bottom-left .ui-dialog-arrow-b {\r\n    left: 15px;\r\n}\r\n.ui-popup-bottom .ui-dialog-arrow-a,\r\n.ui-popup-bottom .ui-dialog-arrow-b {\r\n    margin-left: -8px;\r\n    left: 50%;\r\n}\r\n.ui-popup-bottom-right .ui-dialog-arrow-a,\r\n.ui-popup-bottom-right .ui-dialog-arrow-b {\r\n    right: 15px;\r\n}\r\n.ui-popup-left-top .ui-dialog-arrow-a,\r\n.ui-popup-left .ui-dialog-arrow-a,\r\n.ui-popup-left-bottom .ui-dialog-arrow-a {\r\n    right: -16px;\r\n    border-left:8px solid #7C7C7C;\r\n}\r\n.ui-popup-left-top .ui-dialog-arrow-b,\r\n.ui-popup-left .ui-dialog-arrow-b,\r\n.ui-popup-left-bottom .ui-dialog-arrow-b {\r\n    right: -15px;\r\n    border-left:8px solid #fff;\r\n}\r\n.ui-popup-left-top .ui-dialog-arrow-a,\r\n.ui-popup-left-top .ui-dialog-arrow-b {\r\n    top: 15px;\r\n}\r\n.ui-popup-left .ui-dialog-arrow-a,\r\n.ui-popup-left .ui-dialog-arrow-b {\r\n    margin-top: -8px;\r\n    top: 50%;\r\n}\r\n.ui-popup-left-bottom .ui-dialog-arrow-a,\r\n.ui-popup-left-bottom .ui-dialog-arrow-b {\r\n    bottom: 15px;\r\n}\r\n.ui-popup-right-top .ui-dialog-arrow-a,\r\n.ui-popup-right .ui-dialog-arrow-a,\r\n.ui-popup-right-bottom .ui-dialog-arrow-a {\r\n    left: -16px;\r\n    border-right:8px solid #7C7C7C;\r\n}\r\n.ui-popup-right-top .ui-dialog-arrow-b,\r\n.ui-popup-right .ui-dialog-arrow-b,\r\n.ui-popup-right-bottom .ui-dialog-arrow-b {\r\n    left: -15px;\r\n    border-right:8px solid #fff;\r\n}\r\n.ui-popup-right-top .ui-dialog-arrow-a,\r\n.ui-popup-right-top .ui-dialog-arrow-b {\r\n    top: 15px;\r\n}\r\n.ui-popup-right .ui-dialog-arrow-a,\r\n.ui-popup-right .ui-dialog-arrow-b {\r\n    margin-top: -8px;\r\n    top: 50%;\r\n}\r\n.ui-popup-right-bottom .ui-dialog-arrow-a,\r\n.ui-popup-right-bottom .ui-dialog-arrow-b {\r\n    bottom: 15px;\r\n}\r\n\r\n\r\n@-webkit-keyframes ui-dialog-loading {\r\n    0% {\r\n        -webkit-transform: rotate(0deg);\r\n    }\r\n    100% {\r\n        -webkit-transform: rotate(360deg);\r\n    }\r\n}\r\n@keyframes ui-dialog-loading {\r\n    0% {\r\n        transform: rotate(0deg);\r\n    }\r\n    100% {\r\n        transform: rotate(360deg);\r\n    }\r\n}\r\n\r\n.ui-dialog-loading {\r\n    vertical-align: middle;\r\n    position: relative;\r\n    display: block;\r\n    *zoom: 1;\r\n    *display: inline;\r\n    overflow: hidden;\r\n    width: 32px;\r\n    height: 32px;\r\n    top: 50%;\r\n    margin: -16px auto 0 auto;\r\n    font-size: 0;\r\n    text-indent: -999em;\r\n    color: #666;\r\n}\r\n.ui-dialog-loading {\r\n    width: 100%\\9;\r\n    text-indent: 0\\9;\r\n    line-height: 32px\\9;\r\n    text-align: center\\9;\r\n    font-size: 12px\\9;\r\n}\r\n\r\n.ui-dialog-loading::after {\r\n    position: absolute;\r\n    content: \'\';\r\n    width: 3px;\r\n    height: 3px;\r\n    margin: 14.5px 0 0 14.5px;\r\n    border-radius: 100%;\r\n    box-shadow: 0 -10px 0 1px #ccc, 10px 0px #ccc, 0 10px #ccc, -10px 0 #ccc, -7px -7px 0 0.5px #ccc, 7px -7px 0 1.5px #ccc, 7px 7px #ccc, -7px 7px #ccc;\r\n    -webkit-transform: rotate(360deg);\r\n    -webkit-animation: ui-dialog-loading 1.5s infinite linear;\r\n    transform: rotate(360deg);\r\n    animation: ui-dialog-loading 1.5s infinite linear;\r\n    display: none\\9;\r\n}\r\n');
