export const mapInitObj =  {
    initCallback(){
      window.__define = window.define;
      window.__require = window.require;
      window.define = undefined;
      window.require = undefined;
    },
    domReadyCallback(initMapCallback,callback,ocxInitCallback){
      window.baseUrl = document.location.href.substring(0, document.location.href.lastIndexOf("/"));
      window.selfUrl = baseUrl.substring(0, baseUrl.lastIndexOf("/"));
      window.mapConfig = {
          server: 'http://10.10.9.95:8080',			    //本地8080端口瓦片地图地址
          apiPath: '10.10.9.95:8088',		                //JSAPI路径，默认为本机服务器IP。不能填写127.0.0.1|localhost 路径格式：IP(URL)+ /resources
          longitude: 113,									//地图默认中心坐标，经度(x),WGS-84(地球坐标系)
          latitude: 23,									//地图默认中心坐标，纬度(y),WGS-84(地球坐标系)
          extendDir: ''										//map扩展目录，默认为空。用于可能map目录在不同层级的情况，如：/webapp
      };
      window.djConfig = {
          parseOnLoad: true,
          measureTotal: 0,
          modulePaths: {
              "extras": "/static/vendor/map/jsLib/extras"
          }
      };
      let scriptInit = document.createElement('script');
      scriptInit.src = 'http://10.10.9.95:8088/jsapi/3.14/init.js';
      document.body.appendChild(scriptInit);
      let $backdrop = $('<div class="backdrop-loading"><span class="fa fa-spinner fa-pulse"></span>正在加载地图，请稍后<iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position:absolute; visibility:inherit; top:0px;left:0px;width:100%; height:100%;z-index:-1;opacity:0;filter:alpha(opacity=0);"></iframe></div><div class="backdrop"></div>');
      $('body').append($backdrop);

      window.defineTimer = setInterval(() => {
          if(window.loadMapCompelete){
              clearInterval(window.defineTimer);
              if (typeof window.__define !== "undefined" && typeof window.__require !== "undefined") {
                  window.define = window.__define;
                  window.require = window.__require;
                  window.__define = undefined;
                  window.__require = undefined;
                  $('.backdrop-loading,.backdrop').remove();
                  $.isFunction(ocxInitCallback) && ocxInitCallback();
              }
          }
      },200);

      let timer = setInterval(function () {
          if (window.dojo) {
              clearInterval(timer);
              //可能是dojo加载后还要加载其他的，这里要延迟1s左右才能进行操作否则报错
              setTimeout(function () {
                  $.isFunction(initMapCallback)  && initMapCallback();
              }, 1000);
          }
      }, 200);
      $.isFunction(callback)  && callback();
    },
    disposeCallback(){
      $('script[src="http://10.10.9.95:8088/jsapi/3.14/init.js"]').remove();
      window.loadMapCompelete = false;//清掉地图完成标记
      window.dojo = null;//清掉dojo
    }
 };