
define('text!components/radios/radios.tpl',[],function () { return '<div class="sn-radios {{className}}">\r\n    <ul class="chk-list">\r\n        {{#each items}}\r\n        <li class="{{className}}">\r\n            <div>\r\n                <input type="checkbox" value="{{value}}" id="input-{{@key}}">\r\n                <ins></ins>\r\n            </div>\r\n            <label for="input-{{@key}}">\r\n                {{label}}\r\n            </label>\r\n        </li>\r\n        {{/each}}\r\n    </ul>\r\n</div>';});


define('lib/requirejs/css.min!components/radios/radios',[],function(){});
define('radios',[
    'jquery',
    'eventTarget',
    'hdb',
    'text!components/radios/radios.tpl',
    'lib/requirejs/css.min!components/radios/radios.css'
],function ($, eventTarget, hdb, tpl){
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
            this.$el = $("<div></div>");             
        }
        this.options = options;
        eventTarget.call(this);
        render.call(this);
        eventInit.call(this);
        var _self = this;
        setTimeout(function(){
            _self.trigger('initEnd');
        }, 100);
    };
    var render = function(){
        var template = hdb.compile(tpl);
        this.$el.html(template(this.options));
        var $input = $('.sn-radios>ul>li>div>input',this.$el);
        if(this.options.disabled){
            $input.attr('disabled',true);
            $input.parent().addClass('disabled');
        }
        if(this.options.defaultValue){
            var defaultValue = this.options.defaultValue;
            var $valueInput = $('.sn-radios>ul>li>div>input[value="'+defaultValue+'"]',this.$el);
            if($valueInput.length != 0){
                $valueInput.attr('checked',true);
                $valueInput.parent().addClass('checked');
            }
        }
    }
    var eventInit = function(){
        this.$el.on('click','.sn-radios>ul>li>div',$.proxy(function(e){
            itemClick.call(this,e);
            this.trigger('itemClick',e);
        },this));
    }
    var initEnd = function(){};
    var itemClick = function(e){
        var $li = $(e.target || e.currentTarget).closest('li');
        var $input = $li.find('input');
        var index = $li.index();
        var data = this.options.items[index];
        if($input.attr('disabled')){
            return false;
        }
        if($input.attr('checked')!='checked'){
            $('.sn-radios>ul>li>div',this.$el).removeClass('checked');
            $('.sn-radios>ul>li>div>input',this.$el).attr('checked',false);
            $input.attr('checked',true);
            $input.parent().addClass('checked');
        }else{
            return false;
        }
        var itemData = {
            label:data.label,
            value:data.value
        };
        this.trigger('change',e,itemData);
        if(data.click){
            data.click(e,itemData);
        }
    }
    $.extend(objClass.prototype,eventTarget.prototype,{
        version:VERSION,
        disabled:function(){
            var $input = $('.sn-radios>ul>li>div>input',this.$el);
            $input.attr('disabled',true);
            $input.parent().addClass('disabled');
        },
        enable:function(){
            var $input = $('.sn-radios>ul>li>div>input',this.$el);
            $input.attr('disabled',false);
            $input.parent().removeClass('disabled');
        },
        get:function(){
            return $('.sn-radios>ul>li>div>input[checked="checked"]',this.$el).val()||'';
        },
        set:function(data,e){
            var $inputChk = $('.sn-radios>ul>li>div>input[checked="checked"]',this.$el);
            if($inputChk.val()!= data){
                var $input = $('.sn-radios>ul>li>div>input[value="'+data+'"]',this.$el);
                if($input.length){
                    var index = $input.closest('li').index();
                    var itemData = {
                        label:this.options.items[index].label,
                        value:data
                    };
                    $inputChk.attr('checked',false);
                    $inputChk.parent().removeClass('checked');
                    $input.attr('checked',true);
                    $input.parent().addClass('checked');
                    this.trigger('change',e,itemData);
                }
            }
        },
        clear:function(){
            var $inputChk = $('.sn-radios>ul>li>div>input[checked="checked"]',this.$el);
            if($inputChk.length){
                $inputChk.attr('checked',false);
                $inputChk.parent().removeClass('checked');
            }
        },
        destroy:function(){
            this.$el.remove();
        }
    });
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
('@charset \"UTF-8\";\r\n\r\n.sn-radios > .chk-list { margin: 0; padding: 0;  font-size: 12px;}\r\n.sn-radios > .chk-list li { position: relative; display: inline-block; padding: 0 24px 12px 24px; list-style: none; }\r\n\r\n/* 全宽度竖向 */\r\n.sn-radios.all-width > .chk-list li { display: block; }\r\n\r\n.sn-radios > .chk-list li > div { position: absolute; top: -2px; left: 0;display: block; width: 20px; height: 20px; background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAUCAYAAAB7wJiVAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6M0Y3NUU2RjRFNjNDMTFFNkI1RUZGNzAzNTY5NTMzNzAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6M0Y3NUU2RjVFNjNDMTFFNkI1RUZGNzAzNTY5NTMzNzAiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDNjI4QzE3NUU2MEExMUU2QjVFRkY3MDM1Njk1MzM3MCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDNjI4QzE3NkU2MEExMUU2QjVFRkY3MDM1Njk1MzM3MCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqhCFh8AAAKjSURBVHja7FlLaxNRFP4mM51J82je4qRJSKYqFnyBS7vQgoIL0QqlK0G0iKtu/QGu3Lh1Y3BbEcUWUTeKKHXhSoqg2JhOHtO4SaaRZJo2pPFOO5UQgjiWSabpfMwlk7ncL+eeb865595QzWYTFswDm+UCc4HZufn89ftF8pEkjdfJUSDt5qnRI69aH1L3FnfF17xzwlA+WZZ3xefz+QzhY1o6kvFImHfY7brYlFqNF/MrqiHhtq7k26k4f2bYoYtvQVL48cdiV/gGHU6epmldfI1Gg19TqobxtaYs3WKo0MZ0eit0O0+FNqYrfHqdp0IbYxiftYZYi7rxeJ+rmtq+SqWyfwR5uCjjwpMMHn1ZNaV9pWIR6R8plErF/hfk+dIvzLwpYCziwNTRIdPZVy6XIUl5OJ0ueL2+/hGkvtlE+3b2XbaKay8ljAY4PL0cg4Pp3dQ6bbbVNJXNiOA4DvFEAjabrT8EKa9v4tKzLK4T5683tif+qbCGyfkcou4BvJ6Mw8P1blqkjMVyOo1sNvNHGEVRkBGXMcCyEEYO4W/VGLPnqhCKlIoUhdlvJPwrddwdO4DJuRzcHI0XV2MIDdI9tY8itpELq7KM+kYdPM9DJGKoESEIAhiG6a8qy83aMDcRxY3jXnzIKzg7K5IUBsxPxCB42d6/MMTx8YQAvz+AarWCVGppK1ISwghYluvPspchYfLgfBi3T24vjDOn/TgW5ExjnxolkWgUgWBw63swFIL9HzfdDPYw7o/zuHJ4COdiTlPaFw4Pw+PxwOVy74+NIU1ytVnF2IkUPWK0C1JQajXdP6qN+dmhq7AgKbr5Pq4oXeNTK6L/qaKM5GtNWdPaqe1BnZwSabc6PJ/WTllNy6edspqKj7L+MTRZWW+5wFz4LcAAmKsJbn9UN6IAAAAASUVORK5CYII=) no-repeat; cursor: pointer; }\r\n.sn-radios > .chk-list li > div > input,.chk-list li > div > ins { position: absolute; left: 10%; top: -20%; display: block; width: 120%; height: 120%; margin: 0; padding: 0; background: #FFF; opacity: 0; filter: alpha(opacity=0); box-sizing: border-box; padding: 0; outline: none; }\r\n.sn-radios > .chk-list li > div, .chk-list li > div.static:hover { background-position: 0 0; }\r\n.sn-radios > .chk-list li > div.hover, .chk-list li > div:hover { background-position: -20px 0; }\r\n.sn-radios > .chk-list li > div.checked { background-position: -40px 0; }\r\n.sn-radios > .chk-list li > div.disabled { background-position: -60px 0; cursor: default; }\r\n.sn-radios > .chk-list li > div.checked.disabled { background-position: -80px 0; }\r\n.sn-radios > .chk-list li > label { cursor: pointer; color: #333; }\r\n/* 高清屏支持 */\r\n@media only screen and (-webkit-min-device-pixel-ratio: 1.5),\r\n       only screen and (-moz-min-device-pixel-ratio: 1.5),\r\n       only screen and (-o-min-device-pixel-ratio: 3/2),\r\n       only screen and (min-device-pixel-ratio: 1.5) {\r\n    .sn-radios > .chk-list li > div {\r\n        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAoCAYAAAC7HLUcAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6M0Y3NUU2RjhFNjNDMTFFNkI1RUZGNzAzNTY5NTMzNzAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6M0Y3NUU2RjlFNjNDMTFFNkI1RUZGNzAzNTY5NTMzNzAiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozRjc1RTZGNkU2M0MxMUU2QjVFRkY3MDM1Njk1MzM3MCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozRjc1RTZGN0U2M0MxMUU2QjVFRkY3MDM1Njk1MzM3MCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PkVLXFMAAAW1SURBVHja7J1baNtVHMe/ubRN2lzbdetyaXrb6lRq8anzSdnovKyMTic+CCKowwf1cYLom+IUHxRFRFTQh20MiooOVh0KTpT6sDkH1bVN7+ktabo0bZPmn8RzTi5NS9omTfPPkv0+cPj3n5w/vy/nnG9/5/xvUUSjURAEkR4lNQFBkEEIggxCELuNeuMH1/tv8c0BVt5l5Sgrhjxr8LHyMyuvszLQfujglpUVZ28UVF/0TFtR6wtJYfgXfQXRp9MbBsrUqm0P8Hq9BdFnNpsHMskgraz0sXJSBnGIxzgZj9maQX3Sl4M+Zo6C6YvH3s4cBdMXj711BmG8w4pJV1kJy95aqDNwfC5I7D+aa3YO/uVlUzz2k9scIvR1Nujw+TEL6qrUedU3vSThxcsu9I74S0qfSq2GRqOFQqHIqz5+ljQQWEFYkopSX7oMwtOaLOYQDmUxeKw4nRkcIvTJMfg4PAaPVWr65Bh8YsrJYvBYxapPuUnKkcUcqSaJo8swJcoy+FIHYanpk2PwpQ7CYtVHZ7EIYgvIIARBBiEIMkhJw++Ye/XKFM7136bG2CGTExNY8HqzWx9TsxUHb/w2g8/+9uLLfxagL1fieLOeGiULpqZc8HjcmJ/3QKlSwmAwUgYpFd7rc+ODvzzi71Akio+vzVOjZMHs7AzmZmdjmTgahXvOTVOsUoFnjTevzib322o1uNBlp4bJEJ41pqemkvsarRaOhgYySCnA1xuvXVnr3GZTOS495YCxgrotE/h6g687EpRXVKCpqRkqlYoMUuz8MLSIFy67kHiczaovw0+nHKjVqqhxMsDnu43x8bHkfllZGZqbW6BWZ7fsJoPcgfw6toRnf5yAFInZg5uil2UObhJie/x+P8ZGR5F4WpaboomZg5skW8ggMtLvCeLIhRH8Nx/ctE7f1ApOfT+OFSnWuXw6xadVLebyu779AoEAhgYHEAwGNq2zvLyM0ZFhRCIRsc+nU3xaVcGmVzuBDCITv08u4xFmjqt8e35EGGEjN91BdH87Bt9qrHMr1Up8110vFuZ3O0tLS8IcfDs4OCiMkM5AI8NOhMPh2OBWKtHY2CQW5juFDCITn1ybhzcQ6zgP2x67OIpLzsXk90MLq+jqGYV7JVanXKXAxRM2HLZUUuMx3O655MAPSxKcQ4NsneFLfr8aDGLYOQSJfcfhNyA6GhpRWVWVU1wyiEx884QNz99vWpsKSBE2lZrAVzcXMLkYwvGeMbj8sc5l3sDXj1tx1KGjhotTX+9AdXVNcp9PofhUil/4C4VCcDqdYpswR73DAb0+94updCVdJvig/7TTAouuDG//OSc+44vwl3td2FelFg8+ic5FrF73AQM1Wgp80NvsdrHQnpmZFp/xRfjE+Lj4LGEOjs1mh9Fo2pW4lEHk7GRW3nqoFh8d2S8MIzoZSJqD8/7DdXjuPhM11ibsq6uD1WZb97xIqjksFivM1dW7Fo8MUgBOP2DGuS47NOr1DwW179XglQerqYG2oaZmD5tCNTCTrB++WrYY31Nbu6uxyCAF4kSLHueP28ViXHS6RoUPWWYhMsNoNIpbRhKZhD/DbrXadj0OGaSAPNakwxePWnFvTQV+eaYBHfu11ChZYDAYYK+vh0ajQUtLS85nrGiRfgfydKtBFGJnmExmUfIFZRCCIIMQBBmEIGQxiLh+z994KBdSOBnLn0F1oS/12kG+mVmLVTL65PxdmJRYRacvnUH4i3zF60BTBm7eCEkSXDNzid3eDA4R+k73ulIHRt7gt4G8xGKVmj7+uk05BmE0GhGxilWfYqOI6/237mGbP/gJApmz2QIrh9sPHfx3q0qKszcKqi96pq2o9Xm93oLqM5vNRaUvXQbhFTpY6WFlUQZhi/FYHfHY20H6ctCn0xsKpi8ee0viA7Qg+tKZV0G/UUgQ2S3SCYIggxAEGYQgcuJ/AQYApEtZm6IzJfQAAAAASUVORK5CYII=);\r\n        -webkit-background-size: 100px 20px;\r\n        background-size: 100px 20px;\r\n    }\r\n}\r\n');
