/**
 * @author:fanyu
 * @date：2015-09-16
 * @desc: 通过 HTTP 请求加载远程数据，底层依赖jQuery的AJAX实现。当前接口实现了对jQuery AJAX接口的进一步封装。
 */
define(['jquery'], function() {
    var _ajaxBase = function(url, type, cmd, dataType, callback, sync) {
        var param = "";
        /*async = sync ? false : true;*/
        var cache = (dataType == "html") ? true : false;
        $.ajax({
            url: url,
            type: type,
            data: cmd,
            cache: cache,
            dataType: dataType,
            async: sync ? false : true,
            timeout: config.TIME_OUT,
            beforeSend: function(xhr) {
                xhr.overrideMimeType("text/plain; charset=utf-8");
            },
            success: function(data) {
                if (!data) {
                    return;
                }
                if (dataType == "html") {
                    callback(data, true);
                    return;
                }
                try {
                    //超时重定向至登陆页
                    if (data.returnCode == 'BUSIOPER=RELOGIN') {
                        //判断是否存在iframe
                        window.location.href = '../../login.html';
                        return;
                    }
                } catch (e) {
                    alert("JSON Format Error:" + e.toString());
                }
                if (callback && data) {
                    var isSuc = (data.returnCode == config.reqCode.SUCC ? true : false);
                    callback(data || {}, isSuc);
                }
            },
            error: function(e) {
                var retErr = {};
                retErr['returnCode'] = "404";
                retErr['returnMessage'] = "网络异常或超时，请稍候再试！";
                callback(retErr, false);
            },
            complete: function() {}
        });
    }
    var _ajaxJsonp = function(url, type, cmd, callback, sync) {
        var param = "";
        //sync ? false : true
        if (!url || url === '') {
            console.log('the url of param cann\'t equals null or empty of string');
            return false;
        }
        if (!callback || callback === '') {
            console.log('you missed callback, it must be a function');
            return false;
        }
        if (!cmd || cmd === '') {
            console.log('warn! your passed null or empty to cmd param, are you suer?');
        }
        $.ajax({
            url: url,
            type: type,
            data: cmd,
            jsonpCallback: 'jsonCallback',
            contentType: "application/json",
            dataType: 'jsonp',
            async: sync ? false : true,
            timeout: config.TIME_OUT,
            beforeSend: function(xhr) {
                xhr.overrideMimeType("text/plain; charset=utf-8");
            },
            success: function(data) {
                if (!data) {
                    return;
                }
                try {
                    //超时重定向至登陆页
                    if (data.returnCode == 'BUSIOPER=RELOGIN') {
                        //判断是否存在iframe
                        window.location.href = '../../login.html';
                        return;
                    }
                } catch (e) {
                    alert("JSON Format Error:" + e.toString());
                }
                if (callback && data) {
                    var isSuc = (data.returnCode == config.reqCode.SUCC ? true : false);
                    callback(data || {}, isSuc);
                }
            },
            error: function() {
                var retErr = {};
                retErr['returnCode'] = "404";
                retErr['returnMessage'] = "网络异常或超时，请稍候再试！";
                callback(retErr, false);
            },
            complete: function() {}
        });
    }
    var config = {
        /**
         * 请求状态码
         * @type {Object}
         */
        reqCode: {
            /**
             * 成功返回码 0
             * @type {Number} 1
             * @property SUCC
             */
            SUCC: 0
        },
        /**
         * 请求的数据类型
         * @type {Object}
         * @class reqDataType
         */
        dataType: {
            /**
             * 返回html类型
             * @type {String}
             * @property HTML
             */
            HTML: "html",
            /**
             * 返回json类型
             * @type {Object}
             * @property JSON
             */
            JSON: "json",
            /**
             * 返回text字符串类型
             * @type {String}
             * @property TEXT
             */
            TEXT: "text"
        },
        /**
         * 超时,默认超时30000ms
         * @type {Number} 10000ms
         * @property TIME_OUT
         */
        TIME_OUT: 60000,
        /**
         * 显示请求成功信息
         * 
         * @type {Boolean} false
         * @property SHOW_SUCC_INFO
         */
        SHOW_SUCC_INFO: false,
        /**
         * 显示请求失败信息
         * 
         * @type {Boolean} false
         * @property SHOW_ERROR_INFO
         */
        SHOW_ERROR_INFO: false
    }
    var ajax = {
        /**
         * GetJson是对ajax的封装,为创建 "GET" 请求方式返回 "JSON"(text) 数据类型
         * @param {String}
         *            url HTTP(GET)请求地址
         * @param {Object}
         *            cmd json对象参数
         * @param {Function}
         *            callback [optional,default=undefined] GET请求成功回调函数
         */
        getJson: function(url, cmd, callback, sync) {
            if (sync && typeof(sync) == 'boolean') {
                sync = sync;
            } else if (callback) {
                if (typeof(callback) == 'function') {
                    callback = callback
                } else if (typeof(callback) == 'boolean') {
                    sync = callback;
                    callback = '';
                }
            } else if (cmd) {
                if (typeof(cmd) == 'object' || typeof(cmd) == 'string') {
                    cmd = cmd;
                } else if (typeof(cmd) == 'function') {
                    callback = cmd;
                    cmd = '';
                } else if (typeof(cmd) == 'boolean') {
                    sync = cmd;
                    cmd = '';
                    callback = '';
                }
            } else {
                cmd = '';
                callback = '';
                sync = '';
            }

            if (!sync) {
                _ajaxBase(url, 'GET', cmd, config.dataType.JSON, callback);
            } else {
                _ajaxBase(url, 'GET', cmd, config.dataType.JSON, callback, true);
            }
        },
        /**
         * PostJson是对ajax的封装,为创建 "POST" 请求方式返回 "JSON"(text) 数据类型
         * @param {String}
         *            url HTTP(POST)请求地址
         * @param {Object}
         *            cmd json对象参数
         * @param {Function}
         *            callback [optional,default=undefined] POST请求成功回调函数
         */
        postJson: function(url, cmd, callback, sync) {
            if (sync && typeof(sync) == 'boolean') {
                sync = sync;
            } else if (callback) {
                if (typeof(callback) == 'function') {
                    callback = callback
                } else if (typeof(callback) == 'boolean') {
                    sync = callback;
                    callback = '';
                }
            } else if (cmd) {
                if (typeof(cmd) == 'object' || typeof(cmd) == 'string') {
                    cmd = cmd;
                } else if (typeof(cmd) == 'function') {
                    callback = cmd;
                    cmd = '';
                } else if (typeof(cmd) == 'boolean') {
                    sync = cmd;
                    cmd = '';
                    callback = '';
                }
            } else {
                cmd = '';
                callback = '';
                sync = '';
            }
            if (!sync) {
                _ajaxBase(url, 'POST', cmd, config.dataType.JSON, callback);
            } else {
                _ajaxBase(url, 'POST', cmd, config.dataType.JSON, callback, true);
            }
        },
        /**
         * putJson是对ajax的封装,为创建 "PUT" 请求方式返回 "JSON"(text) 数据类型
         * @param {String}
         *            url HTTP(PUT)请求地址
         * @param {Object}
         *            cmd json对象参数
         * @param {Function}
         *            callback [optional,default=undefined] PUT请求成功回调函数
         */
        putJson: function(url, cmd, callback, sync) {
            if (sync && typeof(sync) == 'boolean') {
                sync = sync;
            } else if (callback) {
                if (typeof(callback) == 'function') {
                    callback = callback
                } else if (typeof(callback) == 'boolean') {
                    sync = callback;
                    callback = '';
                }
            } else if (cmd) {
                if (typeof(cmd) == 'object' || typeof(cmd) == 'string') {
                    cmd = cmd;
                } else if (typeof(cmd) == 'function') {
                    callback = cmd;
                    cmd = '';
                } else if (typeof(cmd) == 'boolean') {
                    sync = cmd;
                    cmd = '';
                    callback = '';
                }
            } else {
                cmd = '';
                callback = '';
                sync = '';
            }
            if (!sync) {
                _ajaxBase(url, 'PUT', cmd, config.dataType.JSON, callback);
            } else {
                _ajaxBase(url, 'PUT', cmd, config.dataType.JSON, callback, true);
            }
        },
        /**
         * deleteJson是对ajax的封装,为创建 "DELETE" 请求方式返回 "JSON"(text) 数据类型
         * @param {String}
         *            url HTTP(DELETE)请求地址
         * @param {Object}
         *            cmd json对象参数
         * @param {Function}
         *            callback [optional,default=undefined] DELETE请求成功回调函数
         */
        deleteJson: function(url, cmd, callback, sync) {
            if (sync && typeof(sync) == 'boolean') {
                sync = sync;
            } else if (callback) {
                if (typeof(callback) == 'function') {
                    callback = callback
                } else if (typeof(callback) == 'boolean') {
                    sync = callback;
                    callback = '';
                }
            } else if (cmd) {
                if (typeof(cmd) == 'object' || typeof(cmd) == 'string') {
                    cmd = cmd;
                } else if (typeof(cmd) == 'function') {
                    callback = cmd;
                    cmd = '';
                } else if (typeof(cmd) == 'boolean') {
                    sync = cmd;
                    cmd = '';
                    callback = '';
                }
            } else {
                cmd = '';
                callback = '';
                sync = '';
            }
            if (!sync) {
                _ajaxBase(url, 'DELETE', cmd, config.dataType.JSON, callback);
            } else {
                _ajaxBase(url, 'DELETE', cmd, config.dataType.JSON, callback, true);
            }
        },

        getJsonp: function(url, cmd, callback, sync) {
            _ajaxJsonp(url, 'GET', cmd, callback, sync);
        },
        /**
         * 跨域请求json数据
         * 
         * @method ajax
         * @param {String}
         *            url HTTP(POST/GET)请求地址
         * @param {String}
         *            type POST/GET
         * @param {Object}
         *            cmd json参数命令和数据
         * @param {Function}
         *            callback [optional,default=undefined] 请求成功回调函数,返回数据data和isSuc
         */
        ajax: function(options) {
            var config = $.extend({
                type: 'post',
                dataType: 'json',
                timeout: 30000,
                beforeSend: function(xhr) {
                    xhr.overrideMimeType("text/plain; charset=utf-8");
                }
            }, options);
            $.ajax(config);
        }
    };
    return ajax;
});
