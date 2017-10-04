
define(['hdb', 'eventTarget', 
    'text!assets/components/upload/upload.tpl',
    'text!assets/components/upload/uploadFiles.tpl',
    'style!assets/components/upload/upload.css',
    'jquery.fileupload',
    'jquery.iframe-transport'
], function(hdb, EventTarget, tpl, uploadTpl) {
    var _version = '0.1';
    var objClass = function(options) {
        this.options = options;
        EventTarget.call(this);
        elementValidate.call(this, options);
        eventInit.call(this);
        render.call(this);
        fileupload.call(this);
    }
    var elementValidate = function(options){
        if (options.el instanceof jQuery && options.el.length > 0) {
            this.$el = options.el;
        } else if (options.el && isDOM(options.el)) {
            this.$el = $(options.el);
        } else if (typeof(options.el) == 'string' && $(options.el).length > 0) {
            this.$el = $(options.el);
        } else {
            this.$el = $("<div></div>")
        }
    }
    var eventInit = function(){
        // 添加到上传队列事件
        this.$el.on('fileuploadadd', $.proxy(function(e, data) {
            add.apply(this, arguments);
            this.trigger('add', e, data);
        }, this));
        // 上传完成事件 修改by zhanglizhao
        this.$el.on('fileuploaddone', $.proxy(function(e, data) {
            if(data&&data.result.returnCode!=0){
                this.trigger('fail', e);
            }else{
                done.apply(this, arguments);
                this.trigger('done', e, data);
            }
            // done.apply(this, arguments);
            // this.trigger('done', e, data);
        }, this));
        this.$el.on('fileuploadprogress', $.proxy(function(e, data) {
            progress.apply(this, arguments);
        }, this));


        // 上传失败事件
        this.$el.on('fileuploadfail', $.proxy(function(e) {
            // fail.call(this, e);
            this.trigger('fail', e);
        }, this));
    }
    // 渲染页面
    var render = function() {
        var template = hdb.compile(tpl);
        this.$el.html(template(this.options));
    };
    // 扩展方法
    $.extend(objClass.prototype, EventTarget.prototype, {
        version: _version
    });

    var fileItem = function(fileData){
        var template = hdb.compile(uploadTpl);
        this.$el = $(template(fileData));
        var cancelUpload = function(e) {
            $(e.currentTarget).closest('.template-upload').remove();
        }
        $('.cancel', this.$el).click($.proxy(cancelUpload, this));
        
    }

    var add = function(e, data) {
        var me = this, $el = me.$el;
        var file = data && data.files && data.files[0];
        // var sizeNumber = file.size; //定义变量用于后期重算，添加单位
        var fileData = {
            name: file.name,
            size: formatFileSize(file.size)
        }
        data.$el = new fileItem(fileData).$el;
        $('.files', $el).prepend(data.$el);
        data.$el.addClass('sn-upload-progress');
    }, 
    done = function(e, data, el) {
        var me = this;
        data.$el.removeClass('sn-upload-progress');
        // 删除当前文件    
        $('.delete', data.$el).click($.proxy(function(e) {
            var removeFileDom = function(){
                $(e.currentTarget).closest('.template-upload', me.$el).remove();
            }
            e.remove = removeFileDom;
            var removed = this.trigger('remove', e, (data.result.files&& data.result.files[0])||{});
            if (!this._listeners['remnove'] || removed){
                removeFileDom();
            }
        },this));
    }, 
    progress = function(e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        var $bar = $('.upload-progress>.bar', data.$el);
        $bar.css('width', progress + '%');

    }

    var fileupload = function() {
        
        var me = this;
        this.$el.fileupload({
            url: me.options.url,
            dataType:'json',
            formData: this.options.formData,
            
            // fail: function() {
            //     console.log("文件上传失败")
            // }
        })
    }

    var formatFileSize = function (bytes) {
        if (typeof bytes !== 'number') {
            return '';
        }
        if (bytes >= 1000000000) {
            return (bytes / 1000000000).toFixed(2) + ' GB';
        }
        if (bytes >= 1000000) {
            return (bytes / 1000000).toFixed(2) + ' MB';
        }
        return (bytes / 1000).toFixed(2) + ' KB';
    }

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
})

