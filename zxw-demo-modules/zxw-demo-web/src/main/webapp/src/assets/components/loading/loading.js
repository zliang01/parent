
define('text!components/loading/loading.tpl',[],function () { return '<div class="sn-ui-loading {{ className }}">\r\n  <div class="ui-loading-backdrop"></div>\r\n  <div class="ui-loading-content">{{{ content }}}</div>\r\n</div>';});


define('text!components/loading/loadingLine.tpl',[],function () { return '<div class="ui-loading-progress {{ className }}">\r\n  <div class="ui-loading-progress-content"></div>\r\n</div>';});


define('lib/requirejs/css.min!components/loading/loading',[],function(){});
/**
 * [Loading加载组件]
 * @param  {[type]} $           [description]
 * @param  {[type]} eventTarget [description]
 * @param  {[type]} hdb         [description]
 * @param  {[type]} tpl         [description]
 * @param  {String} lineTmpl    [description]
 * @return {[type]}             [description]
 */
define('loading',[
  'jquery',
  'eventTarget',
  'hdb',
  'text!components/loading/loading.tpl',
  'text!components/loading/loadingLine.tpl',
  'lib/requirejs/css.min!components/loading/loading.css',
], function($, eventTarget, hdb, tpl, lineTmpl) {
  var VERSION = '1.0.0', // 版本号
    zIndex    = 10000,   // 组件容器，z-index累计值（默认10001开始）
    uiContentAnimSpeed  = 280, // 组件内容，动画幅长
    uiBackdropAnimSpeed = 280, // 组件背景遮罩，动画幅长
    init = null;
  var objClass = function(options) {
    var _$uiBox = null,      // 组件容器
        _$uiContent = null,  // 组件内容
        _$uiBackdrop = null, // 组件背景遮罩
        _status = 0,         // 组件状态，0:隐藏（默认）｜1:显示
        _loaded = false     // loadingLine线条方式，加载状态（true:100%加载完成）
    // 容器
    this.$el = null,
    // 参数
    this.options = {
      el: 'body', //组件要绑定的容器，默认为body（此项可不填或留空）
      className: '',  //组件外围的className
      position: 'center', //提示信息位置，顶部top|默认center中央
      width: 300,  //提示信息框宽度，默认300，单位像素
      height: 'auto',  //提示信息框高度，默认auto，单位像素
      mask: 1,  //是否显示遮罩， 0不显示|默认1显示
      animate: 1, //是否显示动画效果， 0不显示|默认1显示
      mode: 'layer',  //展示方式 loadingLine线条方式|默认layer弹层方式
      text: '加载中...', //提示文字，默认 加载中...
      icon: 'dotCycle',  //文字前面的gif动画，挑选几个供用户选择，如 默认dotCycle|cmcc移动图标|cmccLarge大的移动图标
      content: ''  //显示信息，，默认为 图片(icon)+加载中(text)...
    },

    /* 初始化创建组件 */
    init = function(options) {
      // 设置传入参数
      $.extend(this.options, options);
      this.$el = $(this.options.el);

      // 扩展事件/属性
      $.extend(objClass.prototype, eventTarget.prototype, {
        version: VERSION
      });
      eventTarget.call(this);
      
      // 展示方式（loadingLine线条方式）
      if(this.options.mode === 'loadingLine') {
        loadingLine.call(this);
        return;
      }

      // 内容处理（如Loading.options.centent为空，默认拼装options.icon + options.text属性），并渲染组件／保存dom对象
      if(!/\S/.test(this.options.content)) {
        this.options.content = '<i class="ui-loading-icon ui-loading-icon-' + this.options.icon + '"></i>' + this.options.text;
      }
      render.call(this);
      
      // 容器定位处理
      parentPosition.call(this);

      // 显示组件
      zIndex++;
      this.show();
    },

    /**
     * [show 显示组件]
     * @param  {[type]}   el       [将当前组件加载到对应的el dom对象中]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    this.show = function(el, callback) {
      // 展示方式（loadingLine线条方式）
      if(this.options.mode === 'loadingLine') { 
        loadingLine.call(this);
        return;
      }

      // 将当前组件加载到对应的el dom对象中
      var _$el = $(el);
      if(_$el.length >= 1) { 
        // 容器对象重新绑定
        this.$el = _$el;
        // 容器定位处理
        parentPosition.call(this); 
        _$el.append(_$uiBox);
        return;
      }

      // 正常流程
      if(_status === 1) {
        return false;
      }
      if(this.options.animate === 0) { // 没有动画
        // 组件容器
        _$uiBox.css({
          display: 'block',
          zIndex: zIndex
        });
        // 组件内容
        _$uiContent.css({
          width: this.options.width,
          height: this.options.height
        });
        if(this.options.position === 'center') { // 居中（默认）
          _$uiContent.css({
            marginTop: ((this.$el.outerHeight() - _$uiContent.outerHeight()) / 2) + 'px'
          });
        }
        // 组件背景遮罩（显示）
        if(this.options.mask === 1) {
          _$uiBackdrop.css({
            display: 'block'
          });
        }
        _status = 1;
        if($.isFunction(callback)) {
          callback();
        }
      }else {
        animateIn.call(this, function() {
          _status = 1;
          if($.isFunction(callback)) {
            callback();
          }
        });
      }
    },

    /* 隐藏组件 */
    this.hide = function(callback) {
      // 展示方式（loadingLine线条方式）
      if(this.options.mode === 'loadingLine') {
        loadingLineLoaded.call(this);
        return;
      }

      // 正常流程
      if(_status === 0) {
        return false;
      }
      if(this.options.animate === 0) { // 没有动画
        _$uiBox.css({
          display: 'none'
        });
        _status = 0;
        if($.isFunction(callback)) {
          callback();
        }
      }else {
        animateOut.call(this, function() {
          _status = 0;
          if($.isFunction(callback)) {
            callback();
          }
        });
      }
    },

    /* 关闭（移除）组件 */
    this.destroy = function(callback) {
      _$uiBox.remove();
      if($.isFunction(callback)) {
        callback();
      }else {
        this.trigger('destroy');
      }
    }

    // 通过构造对象，默认执行初始化
    init.call(this,options)
    // init(options);

    /* 组件容器定位处理 */
    function parentPosition() {
      var elPosition = $.trim(this.$el.css('position').toLocaleLowerCase());
      if(elPosition !== 'relative' && elPosition !== 'absolute' && elPosition !== 'fixed') {
        this.$el.css('position', 'relative');
      }
    }

    /* 组件元素渲染／保存dom对象 */
    function render() {
      // 展示方式（loadingLine线条方式）
      if(this.options.mode === 'loadingLine') { 
        var template = hdb.compile(lineTmpl);
        _$uiBox      = $(template(this.options));
        _$uiContent  = $('.ui-loading-progress-content', _$uiBox);
        $('body').append(_$uiBox);
        return;
      }

      // 正常流程
      var template = hdb.compile(tpl);
      _$uiBox      = $(template(this.options));
      _$uiContent  = $('.ui-loading-content', _$uiBox);
      _$uiBackdrop = $('.ui-loading-backdrop', _$uiBox);
      this.$el.append(_$uiBox);
    };
    /*
     * 组件入场效果
     * 入场原理：
     *   1. 获取并保存对象未开始动画前属性值
     *   2. 设置动画入场属性值
     *   3. 设置动画完成属性值 === 对象未开始动画前属性值
     */
    function animateIn(callback) {
      var animParams = null; // 动画属性
      var uiContentAnimFlag = false, // 组件内容，动画完成状态
        uiBackdropAnimFlag  = false; // 组件背景遮罩，动画完成状态
      // 组件容器
      _$uiBox.css({
        display: 'block',
        zIndex: zIndex
      });
      // 组件内容
      if(this.options.position === 'center') { // 居中（默认）
        var realHeight = !Number(this.options.height) ? _$uiContent.height() : this.options.height; // 真实高度
        animParams = {
          width: this.options.width,
          height: realHeight,
          marginTop: 0,
          opacity: _$uiContent.css('opacity')
        };
        _$uiContent.css({
          width: 0,
          height: 0,
          marginTop: ((this.$el.height() - _$uiContent.outerHeight() - realHeight) / 2) + 'px',
          opacity: 0
        });
        animParams.marginTop = ((this.$el.height() - _$uiContent.outerHeight() - realHeight) / 2) + 'px';
        _$uiContent.stop(true, false).animate(animParams, uiContentAnimSpeed, function() {
          uiContentAnimFlag = true;
          if(uiContentAnimFlag && uiBackdropAnimFlag) {
            _animCompleted();
          }
        });
      }else {
        animParams = {
          marginTop: _$uiContent.css('marginTop'),
          opacity: _$uiContent.css('opacity')
        };
        _$uiContent.css({
          width: this.options.width,
          height: this.options.height,
          marginTop: 0,
          opacity: 0
        });
        _$uiContent.stop(true, false).animate(animParams, uiContentAnimSpeed, function() {
          uiContentAnimFlag = true;
          if(uiContentAnimFlag && uiBackdropAnimFlag) {
            _animCompleted();
          }
        });
      }
      // 组件背景遮罩（显示）
      if(this.options.mask === 1) {
        animParams = {
          opacity: _$uiBackdrop.css('opacity')
        }
        _$uiBackdrop.css({
          display: 'block',
          opacity: 0
        });
        _$uiBackdrop.stop(true, false).animate(animParams, uiBackdropAnimSpeed, function() {
          uiBackdropAnimFlag = true;
          if(uiContentAnimFlag && uiBackdropAnimFlag) {
            _animCompleted();
          }
        });
      }
      // 动画完成后操作
      var _animCompleted = function() {
        if($.isFunction(callback)) {
          callback();
        }
      }
    };

    /*
     * 组件退场效果
     * 退场原理：
     *   1. 获取并保存对象未开始动画前属性值
     *   2. 设置动画退场属性值
     *   3. 设置动画完成属性值 === 对象最初属性值
     */
    function animateOut(callback) {
      var self = this;
      var uiContentCurrParams = null, // 组件内容，动画之前属性值
        uiBackdropCurrParams  = null; // 组件背景遮罩，动画之前属性值
      var uiContentAnimFlag = false, // 组件内容，动画完成状态
        uiBackdropAnimFlag  = false; // 组件背景遮罩，动画完成状态
      // 组件内容
      if(this.options.position === 'center') { // 居中（默认）
        uiContentCurrParams = {
          width: _$uiContent.width(),
          height: _$uiContent.height(),
          opacity: _$uiContent.css('opacity')
        };
        _$uiContent.animate({
          width: 0,
          height: 0,
          opacity: 0
        }, uiContentAnimSpeed, function() {
          $(this).css(uiContentCurrParams);
          uiContentAnimFlag = true;
          if(uiContentAnimFlag && uiBackdropAnimFlag) {
            _animCompleted();
          }
        });
      }else {
        uiContentCurrParams = {
          marginTop: _$uiContent.css('marginTop'),
          opacity: _$uiContent.css('opacity')
        }
        _$uiContent.animate({
          marginTop: 0,
          opacity: 0
        }, uiContentAnimSpeed, function() {
          $(this).css(uiContentCurrParams);
          uiContentAnimFlag = true;
          if(uiContentAnimFlag && uiBackdropAnimFlag) {
            _animCompleted();
          }
        });
      }
      // 组件背景遮罩（显示）
      if(this.options.mask === 1) {
        uiBackdropCurrParams = {
          display: _$uiBackdrop.css('display'),
          opacity: _$uiBackdrop.css('opacity')
        }
        _$uiBackdrop.animate({
          display: 'none',
          opacity: 0
        }, uiBackdropAnimSpeed, function() {
          $(this).css(uiBackdropCurrParams);
          uiBackdropAnimFlag = true;
          if(uiContentAnimFlag && uiBackdropAnimFlag) {
            _animCompleted();
          }
        });
      }
      // 动画完成后操作
      var _animCompleted = function() {
        _$uiBox.css({
          display: 'none'
        });
        if($.isFunction(callback)) {
          callback();
        }
      }
    };

    /* 展示方式（loadingLine线条方式） */
    function loadingLine() {
      // 页面中只允许存在一个对象
      if($('body > .ui-loading-progress').length >= 1) {
        $('body > .ui-loading-progress').remove();
      }

      // 渲染
      render.call(this);

      // 初始进度，0%
      var progress = 0;
      _$uiContent.css('width', '0%');
      window.loaded = false;

      init();

      // 生成随机数
      function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
      }

      // 开始进度
      function init() {
        setTimeout(function() {
          // 100%加载完成
          if(_loaded) {
            progress = 100;
            loadingLineLoaded();
            return;
          }
          progress += random(1, 15);
          if(progress >= 98) { // 随机进度，不能超过80%
            progress = 98;
          }
          _$uiContent.animate({ 'width': progress + '%' }, function() {
            if(progress < 98) {
              init();
            }
          });
        }, random(1, 200));
      };
    }

    /* 展示方式（loadingLine线条方式）100%加载完成 */
    function loadingLineLoaded() {
      _loaded = true;
      _$uiContent.stop(true, true).animate({ 'width': '100%' }, 'fast', function() {
        $(this).css('width', '100%');
      });
    }
  };

  return objClass;
});

(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
('.sn-ui-loading,\r\n.sn-ui-loading .ui-loading-backdrop { display:none; position:absolute; top:0; right:0; bottom:0; left:0; }\r\n.sn-ui-loading .ui-loading-backdrop { background:#000; opacity:.6; }\r\n.sn-ui-loading .ui-loading-content { position:relative; padding:15px; margin:30px auto 0; border:1px solid #ccc; border-radius:6px; background-color:#fff; }\r\n.sn-ui-loading .ui-loading-icon { display:inline-block; vertical-align:middle; width:24px; height:24px; margin-right:5px; background-repeat:no-repeat; background-size:cover; }\r\n.sn-ui-loading .ui-loading-icon-dotCycle { background-image:url(data:image/gif;base64,R0lGODlhGAAYAMQAAP/////89Pb4//L67//xx//opv/mmtzl/9Pe///deb3nr//XY//STbnK/5bYf4jUb5aw/2HFP4Sj/3uc/0e7H3OW/y2yAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJBwAXACwHAAYACgAKAAAFJuAlFgxTiOhVlqm4Mu1FmnFti01VNaJjWQ6dTvT7CSvEYm7X+zlCACH5BAkHABcALAQABQAOAAwAAAUt4CWOBcMUYzqapqqyjJuWp2zf9jFV03HvFd4tSFQ5LBYHUJhCInU8X9OJOyZDACH5BAkUABcALAAAAwAVABAAAAVV4CWO5BUkDJMEZUuiqerOcTy7dXq3cJrspZOPVUJIKhUJAjhCIJ+VJfMITTIv1ec1i2wNIhZLZHChQiUtcFh8cValpPVaZEQqXfLwVaQOR/YXX34DIQAh+QQJBwAXACwEAAUAEAAPAAAFQqAAVRUkXGiqjmSpBgnDJEHbqrE826Sq6ywSxPdjiISnVE6WUDkvMGbgSaU+LNhHFXXFZrfeMDiMHZO3Xa8WraaGAAAh+QQJFAAXACwAAAMAFQAQAAAFVeAljuQlQFUFCWVLoqnqznE8u3V6t3AK7aWTj1VSUCwWigI4UiCfliXzCE0yL9XnNYtsBRIMRiJwoUIpLXBYfHFWpaT1WmREKl3y8FWkDif2F19+ASEAIfkECQcAFwAsBAAFABAADwAABULgEFlWNFxoqo5kqQpQVUFC26qxPNukqussUsT3q4iEp1ROBlE5LzCm4EmlGhhYQxV1xWa33jA4jB2Tt12vFq2mhgAAIfkECRQAFwAsAAADABUAEAAABVXgJY7kNUSWFQ1lS6Kp6s5xPLt1erdwGu2lk49VIiwYjAUBOCIgn4wl8whNMi/V5zWLbAkglQpEcKFCFy1wWHxxVqWk9VpkRCpd8vBVpA5D9hdffgIhADs=); }\r\n.sn-ui-loading .ui-loading-icon-cmcc { background-image:url(data:image/gif;base64,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); }\r\n.sn-ui-loading .ui-loading-icon-cmccLarge { width:32px; height:32px; background-image:url(data:image/gif;base64,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); }\r\n.sn-ui-loading-progress { position:fixed; top:0; right:0; left:0; height:5px; border:0; background:transparent; }\r\n.sn-ui-loading-progress-content { position:relative; width:0%; height:100%; padding:0; margin:0; border:0; background:blue; }');
