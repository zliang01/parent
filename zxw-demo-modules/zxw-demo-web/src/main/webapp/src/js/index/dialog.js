

define(['Util'], function(Util){

    var objClass = function(options){
        this.options = options;
        $.extend(Util,options.param);
        var dialogConfig = $.extend({
            //title:options.title,
            content:'',
            // ok:function(){ },
            // okValue: '关闭',
            width:600,height:400,
            modal:1,
            onremove:$.proxy(function(){
                this.dialog = null;
            },this),
            onclose:$.proxy(function (e) {
                this.dialog.remove();
            },this)
        }, _.pick(options, ['title','width','height','ok','okValue','id']));
        if( new RegExp("^((https|http)://)(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})((/?)|(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$").test(options.url)){
            dialogConfig.url=options.url;
        }
        dialogConfig.url=options.url;
        this.dialog = Util.dialog.openDiv(dialogConfig);
        if(!dialogConfig.url){
            this.$el = $('.ui-dialog-content',this.dialog.node);
            require([options.url], $.proxy(function(objClass){
            //这段逻辑支撑了所返回的各种模块定义
            // debugger;
            var self = this.$el;
            if (typeof(objClass) === 'function'){
                var result = new objClass(this.options.index || {}, this.options.businessOptions);
                if (typeof(result) === 'object'){
                    if (result.hasOwnProperty('content')){
                        self.empty().append(result.content);
                    }else{
                        self.empty().append(result);
                    }
                }else{
                    self.html(result);
                }
            }else{
                self.html(objClass.content);
            }
            //this.$el.append(module.$el);
        },this));
        }
    };

    return objClass;
});

