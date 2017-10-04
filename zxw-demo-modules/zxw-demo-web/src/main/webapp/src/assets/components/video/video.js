
define('text!components/video/video.tpl',[],function () { return '<div id="jp_container_1" class="jp-video " role="application" aria-label="media player">\r\n  <div class="jp-type-single">\r\n    <div id="jquery_jplayer_1" class="jp-jplayer"></div>\r\n    <div class="jp-gui">\r\n      <div class="jp-video-play">\r\n        <button class="jp-video-play-icon" role="button" tabindex="0">play</button>\r\n      </div>\r\n      <div class="jp-interface">\r\n        <div class="jp-progress">\r\n          <div class="jp-seek-bar">\r\n            <div class="jp-play-bar"></div>\r\n          </div>\r\n        </div>\r\n        <div class="jp-current-time" role="timer" aria-label="time">&nbsp;</div>\r\n        <div class="jp-duration" role="timer" aria-label="duration">&nbsp;</div>\r\n        <div class="jp-details">\r\n          <div class="jp-title" aria-label="title">&nbsp;</div>\r\n        </div>\r\n        <div class="jp-controls-holder">\r\n          <div class="jp-volume-controls">\r\n            <button class="jp-mute" role="button" tabindex="0">mute</button>\r\n            <button class="jp-volume-max" role="button" tabindex="0">max volume</button>\r\n            <div class="jp-volume-bar">\r\n              <div class="jp-volume-bar-value"></div>\r\n            </div>\r\n          </div>\r\n          <div class="jp-controls">\r\n            <button class="jp-play" role="button" tabindex="0">play</button>\r\n            <button class="jp-stop" role="button" tabindex="0">stop</button>\r\n          </div>\r\n          <div class="jp-toggles">\r\n            <button class="jp-repeat" role="button" tabindex="0">repeat</button>\r\n            <button class="jp-full-screen" role="button" tabindex="0">full screen</button>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class="jp-no-solution">\r\n      <span>Update Required</span>\r\n      To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.\r\n    </div>\r\n  </div>\r\n</div>';});


define('lib/requirejs/css.min!lib/jqueryPlugin/jPlayer/dist/skin/flat.tony/css/jplayer.flat.tony',[],function(){});
define('video',['hdb', 
    'text!components/video/video.tpl',
    'lib/requirejs/css.min!lib/jqueryPlugin/jPlayer/dist/skin/flat.tony/css/jplayer.flat.tony.css',
    'jquery.jplayer'],function (hdb, tpl) {

    var VERSION = '1.0.1';
    var objClass = function(options){
        initialize.call(this,options);    
    };
    $.extend(objClass.prototype,{
        version:VERSION,
        //btnPause
        pause:function(time){
            this.$jplayer.jPlayer("pause");
        },
        setMedia:function(url){
            this.$jplayer.jPlayer( "setMedia", {
              m4v: url
            });
        },
        play:function(time){
            this.$jplayer.jPlayer("play",time&&time);
        },
        stop:function(){
            this.$jplayer.jPlayer("stop");
        }
    });
    var template = hdb.compile(tpl);

    var initialize = function(options){
        this.options = options;

        //判断el的异常值：el不存在、为空string、dom原生对象
        if(options.el instanceof jQuery&&options.el.length>0){
            this.$el = options.el;
        }else if(isDOM(options.el)){
            this.$el = $(options.el);
        }else if (typeof(options.el) == 'string'&&$(options.el).length>0) {
            this.$el = $(options.el);
        }else{
            this.$el = $("<div></div>")             
        }

        this.$el.html(template({}));

        this.$jplayer = $('.jp-jplayer',this.el);
        setTimeout($.proxy(function(){
            this.$jplayer.jPlayer({
                ready: function () {
                    $(this).jPlayer("setMedia", {
                        title:options.title,
                        webmv:options.url,
                        poster:options.poster
                    });
                },
                //获取当前时间,单位是秒
                timeupdate:$.proxy(function(e){
                    this.currentTime = e.jPlayer.status.currentTime
                 },this),
                swfPath: options.swfPath?options.swfPath:"node_modules/compts_npm/lib/jqueryPlugin/jPlayer/dist/jplayer",
                supplied:"webmv",
                size:{
                    width:options.size.width,
                    height:options.size.height,
                    cssClass:options.size.cssClass
                },
                cssSelectorAncestor: "#jp_container_1",
                useStateClassSkin: true,
                autoBlur: false,
                smoothPlayBar: true,
                keyEnabled: true,
                remainingDuration: true,
                toggleDuration: true
            });
        },this),1000)
    
    };
    // 判断是否为原生DOM
    var isDOM = function(obj){
        return obj.tagName ?true:false
    } 
    return objClass;
});


(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
('\r\n/*\r\n * Skin Name: flat tony\r\n * Author: tonytian\r\n * Skin Version: 1.0\r\n * Date: 2016-04-20\r\n */\r\n.jp-audio *:focus,\r\n.jp-audio-stream *:focus,\r\n.jp-video *:focus {\r\n  /* Disable the browser focus highlighting. */\r\n  outline: none; }\r\n\r\n.jp-audio button::-moz-focus-inner,\r\n.jp-audio-stream button::-moz-focus-inner,\r\n.jp-video button::-moz-focus-inner {\r\n  /* Disable the browser CSS3 focus highlighting. */\r\n  border: 0; }\r\n\r\n.jp-audio,\r\n.jp-audio-stream,\r\n.jp-video {\r\n  font-size: 16px;\r\n  font-family: Verdana, Arial, sans-serif;\r\n  line-height: 1.6;\r\n  color: #666;\r\n  border-radius: 6px;\r\n  border: 1px solid #D8D8D8;\r\n  background-color: #F7F7F7; }\r\n\r\n.jp-audio {\r\n  width: 460px; \r\n  box-shadow: 1px 1px 2px #D8D8D8; }\r\n\r\n.jp-audio-stream {\r\n  width: 182px; }\r\n\r\n.jp-video-270p {\r\n  width: 480px; }\r\n\r\n.jp-video-360p {\r\n  width: 640px; }\r\n\r\n.jp-video-full {\r\n  /* Rules for IE6 (full-screen) */\r\n  width: 480px;\r\n  height: 270px;\r\n  /* Rules for IE7 (full-screen) - Otherwise the relative container causes other page items that are not position:static (default) to appear over the video/gui. */\r\n  position: static !important;\r\n  position: relative; }\r\n\r\n/* The z-index rule is defined in this manner to enable Popcorn plugins that add overlays to video area. EG. Subtitles. */\r\n.jp-video-full div div {\r\n  z-index: 1000; }\r\n\r\n.jp-video-full .jp-jplayer {\r\n  top: 0;\r\n  left: 0;\r\n  position: fixed !important;\r\n  position: relative;\r\n  /* Rules for IE6 (full-screen) */\r\n  overflow: hidden; }\r\n\r\n.jp-video-full .jp-gui {\r\n  position: fixed !important;\r\n  position: static;\r\n  /* Rules for IE6 (full-screen) */\r\n  top: 0;\r\n  left: 0;\r\n  width: 100%;\r\n  height: 100%;\r\n  z-index: 1001;\r\n  /* 1 layer above the others. */ }\r\n\r\n.jp-video-full .jp-interface {\r\n  position: absolute !important;\r\n  position: relative;\r\n  /* Rules for IE6 (full-screen) */\r\n  bottom: 0;\r\n  left: 0; }\r\n\r\n.jp-interface {\r\n  position: relative;\r\n  top: 1px;\r\n  width: 100%; }\r\n\r\n.jp-audio .jp-interface {\r\n  height: 40px; }\r\n\r\n.jp-audio-stream .jp-interface {\r\n  height: 80px;}\r\n\r\n.jp-video .jp-interface {\r\n  border-top: 1px solid #009be3; }\r\n\r\n/* @group CONTROLS */\r\n.jp-controls-holder {\r\n  clear: both;\r\n  width: 460px;\r\n  margin: 0 auto;\r\n  position: relative;\r\n  top: 0;\r\n  /* This negative value depends on the size of the text in jp-currentTime and jp-duration */ }\r\n\r\n.jp-interface .jp-controls {\r\n  margin: 0;\r\n  padding: 0;\r\n  overflow: hidden; }\r\n\r\n.jp-audio .jp-controls {\r\n  width: 60px;\r\n  height: 24px;\r\n  position: absolute;\r\n  left: 4px;\r\n  top: 6px;}\r\n\r\n.jp-audio-stream .jp-controls {\r\n  position: absolute;\r\n  top: 20px;\r\n  left: 20px;\r\n  width: 142px; }\r\n\r\n.jp-video .jp-type-single .jp-controls {\r\n  width: 78px;\r\n  margin-left: 200px; }\r\n\r\n.jp-video .jp-type-playlist .jp-controls {\r\n  width: 134px;\r\n  margin-left: 172px; }\r\n\r\n.jp-video .jp-controls {\r\n  float: left; }\r\n\r\n.jp-controls button {\r\n  display: block;\r\n  float: left;\r\n  overflow: hidden;\r\n  text-indent: -9999px;\r\n  border: none;\r\n  cursor: pointer; }\r\n\r\n.jp-play {\r\n  width: 24px;\r\n  height: 24px; }\r\n\r\n.jp-play {\r\n  background-position: 0 0 ; background-repeat:no-repeat; }\r\n\r\n.jp-play:focus {\r\n  background-position: -24px 0 ; background-repeat:no-repeat; }\r\n\r\n.jp-state-playing .jp-play {\r\n  background-position: 0 -23px ; background-repeat:no-repeat; }\r\n\r\n.jp-state-playing .jp-play:focus {\r\n  background-position: -24px -23px ; background-repeat:no-repeat; }\r\n\r\n.jp-stop, .jp-previous, .jp-next {\r\n  width: 24px;\r\n  height: 24px; }\r\n\r\n.jp-stop {\r\n  background-position: 0 -47px ; background-repeat:no-repeat;\r\n  }\r\n\r\n.jp-stop:focus {\r\n  background-position: -24px -47px ; background-repeat:no-repeat; }\r\n\r\n.jp-previous {\r\n  background-position: 0 -74px ; background-repeat:no-repeat; }\r\n\r\n.jp-previous:focus {\r\n  background-position: -24px -74px ; background-repeat:no-repeat; }\r\n\r\n.jp-next {\r\n  background-position: 0 -98px ; background-repeat:no-repeat; }\r\n\r\n.jp-next:focus {\r\n  background-position: -24px -98px ; background-repeat:no-repeat; }\r\n\r\n/* @end */\r\n/* @group progress bar */\r\n.jp-progress {\r\n  overflow: hidden;\r\n  background-position: 0 -198px; background-repeat: repeat-x; }\r\n\r\n.jp-audio .jp-progress {\r\n  position: absolute;\r\n  top: 12px;\r\n  height: 14px; }\r\n\r\n.jp-audio .jp-type-single .jp-progress {\r\n  left: 64px;\r\n  width: 186px; }\r\n\r\n.jp-audio .jp-type-playlist .jp-progress {\r\n  left: 166px;\r\n  width: 130px; }\r\n\r\n.jp-video .jp-progress {\r\n  top: 0px;\r\n  left: 0px;\r\n  width: 100%;\r\n  height: 10px; }\r\n\r\n.jp-seek-bar {\r\n  background-position: 0 -222px; background-repeat:  repeat-x;\r\n  width: 0px;\r\n  height: 100%;\r\n  cursor: pointer; }\r\n\r\n.jp-play-bar {\r\n  background-position: 0 -246px; background-repeat:  repeat-x;\r\n  width: 0px;\r\n  height: 100%; }\r\n\r\n/* The seeking class is added/removed inside jPlayer */\r\n.jp-seeking-bg {\r\n  background-position: 0 -226px; background-repeat:  repeat-x; }\r\n\r\n/* @end */\r\n/* @group volume controls */\r\n.jp-state-no-volume .jp-volume-controls {\r\n  display: none; }\r\n\r\n.jp-volume-controls {\r\n  position: absolute;\r\n  top: 11px;\r\n  left: 356px;\r\n  width: 94px;\r\n  height: 24px;}\r\n\r\n.jp-audio-stream .jp-volume-controls {\r\n  left: 70px; }\r\n\r\n.jp-video .jp-volume-controls {\r\n  top: 12px;\r\n  left: 50px; }\r\n\r\n.jp-volume-controls button {\r\n  display: block;\r\n  position: absolute;\r\n  overflow: hidden;\r\n  text-indent: -9999px;\r\n  border: none;\r\n  cursor: pointer; }\r\n\r\n.jp-mute,\r\n.jp-volume-max {\r\n  width: 18px;\r\n  height: 18px; }\r\n\r\n.jp-volume-max {\r\n  left: 74px; }\r\n\r\n.jp-mute {\r\n  background-position: -4px -124px ; background-repeat:no-repeat; }\r\n\r\n.jp-mute:focus {\r\n  background-position: -28px -124px ; background-repeat:no-repeat; }\r\n\r\n.jp-state-muted .jp-mute {\r\n  background-position: -4px -148px ; background-repeat:no-repeat; }\r\n\r\n.jp-state-muted .jp-mute:focus {\r\n  background-position: -28px -148px ; background-repeat:no-repeat; }\r\n\r\n.jp-volume-max {\r\n  background-position: -2px -172px ; background-repeat:no-repeat; }\r\n\r\n.jp-volume-max:focus {\r\n  background-position: -26px -172px ; background-repeat:no-repeat; }\r\n\r\n.jp-volume-bar {\r\n  position: absolute;\r\n  overflow: hidden;\r\n  background-position: 0 -270px; background-repeat:  repeat-x;\r\n  top: 2px;\r\n  left: 22px;\r\n  width: 46px;\r\n  height: 11px;\r\n  cursor: pointer; }\r\n\r\n.jp-volume-bar-value {\r\n  background-position: 0 -294px; background-repeat:  repeat-x;\r\n  width: 0px;\r\n  height: 11px; }\r\n\r\n/* @end */\r\n/* @group current time and duration */\r\n.jp-audio .jp-time-holder {\r\n  position: absolute;\r\n  top: 50px; }\r\n\r\n.jp-audio .jp-type-single .jp-time-holder {\r\n  left: 110px;\r\n  width: 186px; }\r\n\r\n.jp-audio .jp-type-playlist .jp-time-holder {\r\n  left: 166px;\r\n  width: 130px; }\r\n\r\n.jp-current-time,\r\n.jp-duration {\r\n  width: 46px;\r\n  height: 16px;\r\n  font-size: 10px !important;\r\n  color: #999;\r\n  text-shadow: 1px 1px 2px #FFF;\r\n  cursor: default;}\r\n\r\n.jp-current-time {\r\n  text-align: right;\r\n  overflow: hidden;\r\n  position: absolute;\r\n  left: 250px;\r\n  top: 10px;}\r\n\r\n.jp-duration {\r\n  text-align: left;\r\n  overflow: hidden;\r\n  position: absolute;\r\n  left: 306px;\r\n  top: 10px;}\r\n\r\n.jp-video .jp-current-time {\r\n  margin-left: 20px; }\r\n\r\n.jp-video .jp-duration {\r\n  margin-right: 20px; }\r\n\r\n/* @end */\r\n/* @group playlist */\r\n.jp-details {\r\n  font-weight: bold;\r\n  text-align: center;\r\n  cursor: default; }\r\n\r\n.jp-details,\r\n.jp-playlist {\r\n  width: 100%;\r\n  background-color: #F3F3F3;\r\n  border-radius:0 0 6px 6px;}\r\n\r\n.jp-type-single .jp-details,\r\n.jp-type-playlist .jp-details {\r\n  border-top: 1px solid #EEE; }\r\n\r\n.jp-details .jp-title {\r\n  margin: 0;\r\n  padding: 5px 10px;\r\n  font-size: 12px;\r\n  font-weight: normal;\r\n  color: #555;}\r\n\r\n.jp-playlist ul {\r\n  list-style-type: none;\r\n  margin: 0;\r\n  padding: 0 20px;\r\n  font-size: .72em; }\r\n\r\n.jp-playlist li {\r\n  padding: 5px 0 4px 20px;\r\n  border-bottom: 1px solid #eee; }\r\n\r\n.jp-playlist li div {\r\n  display: inline; }\r\n\r\n/* Note that the first-child (IE6) and last-child (IE6/7/8) selectors do not work on IE */\r\ndiv.jp-type-playlist div.jp-playlist li:last-child {\r\n  padding: 5px 0 5px 20px;\r\n  border-bottom: none; }\r\n\r\ndiv.jp-type-playlist div.jp-playlist li.jp-playlist-current {\r\n  list-style-type: square;\r\n  list-style-position: inside;\r\n  padding-left: 7px; }\r\n\r\ndiv.jp-type-playlist div.jp-playlist a {\r\n  color: #333;\r\n  text-decoration: none; }\r\n\r\ndiv.jp-type-playlist div.jp-playlist a:hover {\r\n  color: #0d88c1; }\r\n\r\ndiv.jp-type-playlist div.jp-playlist a.jp-playlist-current {\r\n  color: #0d88c1; }\r\n\r\ndiv.jp-type-playlist div.jp-playlist a.jp-playlist-item-remove {\r\n  float: right;\r\n  display: inline;\r\n  text-align: right;\r\n  margin-right: 10px;\r\n  font-weight: bold;\r\n  color: #666; }\r\n\r\ndiv.jp-type-playlist div.jp-playlist a.jp-playlist-item-remove:hover {\r\n  color: #0d88c1; }\r\n\r\ndiv.jp-type-playlist div.jp-playlist span.jp-free-media {\r\n  float: right;\r\n  display: inline;\r\n  text-align: right;\r\n  margin-right: 10px; }\r\n\r\ndiv.jp-type-playlist div.jp-playlist span.jp-free-media a {\r\n  color: #666; }\r\n\r\ndiv.jp-type-playlist div.jp-playlist span.jp-free-media a:hover {\r\n  color: #0d88c1; }\r\n\r\nspan.jp-artist {\r\n  font-size: .8em;\r\n  color: #666; }\r\n\r\n/* @end */\r\n.jp-video-play {\r\n  width: 100%;\r\n  overflow: hidden;\r\n  /* Important for nested negative margins to work in modern browsers */\r\n  cursor: pointer;\r\n  background-color: transparent;\r\n  /* Makes IE9 work with the active area over the whole video area. IE6/7/8 only have the button as active area. */ }\r\n\r\n.jp-video-270p .jp-video-play {\r\n  margin-top: -270px;\r\n  height: 270px; }\r\n\r\n.jp-video-360p .jp-video-play {\r\n  margin-top: -360px;\r\n  height: 360px; }\r\n\r\n.jp-video-full .jp-video-play {\r\n  height: 100%; }\r\n\r\n.jp-video-play-icon {\r\n  position: relative;\r\n  display: block;\r\n  width: 112px;\r\n  height: 100px;\r\n  margin-left: -56px;\r\n  margin-top: -50px;\r\n  left: 50%;\r\n  top: 50%;\r\n  background: url(\"../../../src/lib/jqueryPlugin/jPlayer/dist/skin/flat.tony/image/jplayer.flat.tony.video.play.png\") 0 0 no-repeat;\r\n  text-indent: -9999px;\r\n  border: none;\r\n  cursor: pointer; }\r\n\r\n.jp-video-play-icon:focus {\r\n  background: url(\"../../../src/lib/jqueryPlugin/jPlayer/dist/skin/flat.tony/image/jplayer.flat.tony.video.play.png\") 0 -100px no-repeat; }\r\n\r\n.jp-jplayer audio,\r\n.jp-jplayer {\r\n  width: 0px;\r\n  height: 0px; }\r\n\r\n.jp-jplayer {\r\n  background-color: #000000; }\r\n\r\n/* @group TOGGLES */\r\n/* The audio toggles are nested inside jp-time-holder */\r\n.jp-toggles {\r\n  padding: 0;\r\n  margin: 0 auto;\r\n  overflow: hidden; }\r\n\r\n.jp-audio .jp-type-single .jp-toggles {\r\n  width: 25px; }\r\n\r\n.jp-audio .jp-type-playlist .jp-toggles {\r\n  width: 55px;\r\n  margin: 0;\r\n  position: absolute;\r\n  left: 325px;\r\n  top: 50px; }\r\n\r\n.jp-video .jp-toggles {\r\n  position: absolute;\r\n  right: 16px;\r\n  margin: 0;\r\n  margin-top: 10px;\r\n  width: 100px; }\r\n\r\n.jp-toggles button {\r\n  display: block;\r\n  float: left;\r\n  width: 25px;\r\n  height: 18px;\r\n  text-indent: -9999px;\r\n  line-height: 100%;\r\n  /* need this for IE6 */\r\n  border: none;\r\n  cursor: pointer; }\r\n\r\n/*.jp-full-screen {\r\n  background: url(\"../../../src/lib/jqueryPlugin/jPlayer/dist/skin/flat.tony/image/jplayer.blue.monday.jpg\") 0 -310px no-repeat;\r\n  margin-left: 20px; }\r\n\r\n.jp-full-screen:focus {\r\n  background: url(\"../../../src/lib/jqueryPlugin/jPlayer/dist/skin/flat.tony/image/jplayer.blue.monday.jpg\") -30px -310px no-repeat; }\r\n\r\n.jp-state-full-screen .jp-full-screen {\r\n  background: url(\"../../../src/lib/jqueryPlugin/jPlayer/dist/skin/flat.tony/image/jplayer.blue.monday.jpg\") -60px -310px no-repeat; }\r\n\r\n.jp-state-full-screen .jp-full-screen:focus {\r\n  background: url(\"../../../src/lib/jqueryPlugin/jPlayer/dist/skin/flat.tony/image/jplayer.blue.monday.jpg\") -90px -310px no-repeat; }\r\n\r\n.jp-repeat {\r\n  background: url(\"../../../src/lib/jqueryPlugin/jPlayer/dist/skin/flat.tony/image/jplayer.blue.monday.jpg\") 0 -290px no-repeat; }\r\n\r\n.jp-repeat:focus {\r\n  background: url(\"../../../src/lib/jqueryPlugin/jPlayer/dist/skin/flat.tony/image/jplayer.blue.monday.jpg\") -30px -290px no-repeat; }\r\n\r\n.jp-state-looped .jp-repeat {\r\n  background: url(\"../../../src/lib/jqueryPlugin/jPlayer/dist/skin/flat.tony/image/jplayer.blue.monday.jpg\") -60px -290px no-repeat; }\r\n\r\n.jp-state-looped .jp-repeat:focus {\r\n  background: url(\"../../../src/lib/jqueryPlugin/jPlayer/dist/skin/flat.tony/image/jplayer.blue.monday.jpg\") -90px -290px no-repeat; }\r\n\r\n.jp-shuffle {\r\n  background: url(\"../../../src/lib/jqueryPlugin/jPlayer/dist/skin/flat.tony/image/jplayer.blue.monday.jpg\") 0 -270px no-repeat;\r\n  margin-left: 5px; }\r\n\r\n.jp-shuffle:focus {\r\n  background: url(\"../../../src/lib/jqueryPlugin/jPlayer/dist/skin/flat.tony/image/jplayer.blue.monday.jpg\") -30px -270px no-repeat; }\r\n\r\n.jp-state-shuffled .jp-shuffle {\r\n  background: url(\"../../../src/lib/jqueryPlugin/jPlayer/dist/skin/flat.tony/image/jplayer.blue.monday.jpg\") -60px -270px no-repeat; }\r\n\r\n.jp-state-shuffled .jp-shuffle:focus {\r\n  background: url(\"../../../src/lib/jqueryPlugin/jPlayer/dist/skin/flat.tony/image/jplayer.blue.monday.jpg\") -90px -270px no-repeat; }*/\r\n\r\n/* @end */\r\n/* @group NO SOLUTION error feedback */\r\n.jp-no-solution {\r\n  padding: 5px;\r\n  font-size: .8em;\r\n  background-color: #F7F7F7;\r\n  border: 2px solid #009be3;\r\n  color: #000;\r\n  display: none; }\r\n\r\n.jp-no-solution a {\r\n  color: #000; }\r\n\r\n.jp-no-solution span {\r\n  font-size: 1em;\r\n  display: block;\r\n  text-align: center;\r\n  font-weight: bold; }\r\n\r\n/* @end */\r\n\r\n/* add */\r\n.jp-space {\r\n  width: 4px;\r\n  height: 24px;\r\n  font-size: 0;\r\n  float: left;\r\n  background-position: -59px top ; background-repeat:no-repeat;\r\n}\r\n\r\n.jp-time-space {\r\n  width: 10px;\r\n  height: 16px;\r\n  text-align: center;\r\n  line-height: 17px;\r\n  position: absolute;\r\n  left: 296px;\r\n  top: 10px;\r\n  color: #999;\r\n  text-shadow: 1px 1px 2px #FFF;\r\n  font-size: 10px !important;\r\n}\r\n');