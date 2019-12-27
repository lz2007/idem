/*
 * @Author: linzhanhong 
 * @Date: 2018-09-12 10:24:10 
 * @Last Modified by: linzhanhong
 * @Last Modified time: 2018-09-21 15:22:00
 */

/* 应传入参数
   ajaxData: {
       "deviceId": "", // 设备id
       "fileRid": "", // 文件Rid
       "fileType": "", // 文件类型(0视频、1音频、2图片、3文本、4其他、5-99预留)
       "beginTime": "", // 开始时间
       "endTime": "" // 结束时间
   },
   mapShow 地图显隐
   mapStyle 地图container的css样式
*/

import avalon from 'avalon2';
import ajax from '/services/ajaxService';
import {
    notification
} from "ane";
import * as cityobj from '/apps/common/common-sszhmap-cityaddress';
import {
    mapType,
    languageSelect
} from '/services/configService';
let language_txt = require('../../vendor/language').language;

export const name = 'ms-gjdw-map';
require("/apps/common/common-gjdw-map.css");
require('./common-gjdw-map.css');

let iframeWindow;

avalon.component(name, {
    template: __inline('./common-gjdw-map.html'),
    defaults: {
        txtNoPos: language_txt.zfsypsjglpt.common.noGPS,
        timer: null,
        mapShow: false,
        isTipPosition: false,
        ajaxData: {},
        mapStyle: avalon.noop,
        getIframeDom() {
            return $('#mapIframe')[0].contentWindow;
        },
        // 获取gps定位点
        getGpsData(data) {
            let emptyParamsCount = 0;
            for (let i in data) {
                if (data[i] == "") {
                    emptyParamsCount++;
                }
            }
            if ($.isEmptyObject(data) || emptyParamsCount == 5) {
                return;
            }
            ajax({
                url: '/gmvcs/instruct/track/video/gps',
                // url: '/api/gps.json',
                method: 'POST',
                data: data
            }).then(result => {
                if (result.code == 0) {
                    this.drawPath(result.data);
                } else {
                    showMessage('error', language_txt.mainIndex.notificationTips);
                }
            });
        },
        drawPath(data) {
            iframeWindow.esriMap.clearDrawLayer();
            if (data.length == 0) {
                this.isTipPosition = true;
                clearInterval(this.timer);
                return;
            }
            let points = [];
            for (let i = 0; i < data.length; i++) {
                points.push([data[i].longitude, data[i].latitude]);
            }

            iframeWindow.esriMap.addPolyline(points, iframeWindow.lineSymbol); // 画轨迹
            iframeWindow.esriMap.addPictureMarker(data[0].longitude, data[0].latitude, iframeWindow.startSymbol, null); // 画起点
            iframeWindow.esriMap.addPictureMarker(data[data.length - 1].longitude, data[data.length - 1].latitude, iframeWindow.endSymbol, null); // 画终点
            setTimeout(() => {
                // 轨迹自适应视窗
                iframeWindow.esriMap.setViewport(points);
            }, 200);
        },
        // 地图加载是否完成加载定时器
        pollGetMapLoadStatus() {
            let _this = this;
            this.timer = setInterval(() => {
                if (iframeWindow.loadMapCompelete) {
                    clearInterval(_this.timer);
                    _this.getGpsData(this.ajaxData);
                }
            }, 200);
        },
        showMap(flag) {
            let boundingClientRect = $('.common-gjdw-map').parent()[0].getBoundingClientRect();
            // ---！！！！----注意：gxx离线地图只能通过width和height来控制地图的显隐而不能通过display，否则轨迹在地图加载完一会后绘制时会不显示轨迹！！！！！----例：this.hideMap()方法------
            let opts = {
                position: 'absolute',
                top: $('.common-gjdw-map').parent().offset().top,
                left: $('.common-gjdw-map').parent().offset().left,
                right: 8,
                height: 424,
                width: boundingClientRect.width,
                visibility: 'visible'
            };
            $.extend(true, opts, this.mapStyle);
            $('.map-iframe-wrap').css(opts);
            if (flag === 1) {
                if (iframeWindow.loadMapCompelete) {
                    this.getGpsData(this.ajaxData);
                } else {
                    this.pollGetMapLoadStatus();
                }
            }
        },
        hideMap() {
            $('.map-iframe-wrap').css({
                width: 0,
                height: 0,
                visibility: 'hidden'
            });
        },

        onInit() {

        },
        onReady() {
            // 地图加载中蒙版
            iframeWindow = document.getElementById("mapIframe").contentWindow;
            let isIE = judgeIE();
            let txt = languageSelect == "en" ? "Loading..." : "正在加载地图，请稍后";
            let iframe = isIE ? '' : '<div id="back-iframe" style="display: none;position:absolute;width:100%;height:100%;top:0;left:0;"><iframe src="about:blank" marginheight="0" marginwidth="0" style="position:absolute; visibility:inherit;top: 38%; left: 50%; width: 230px;height:36px;margin-left:-115px;z-index:992;opacity:1;filter:alpha(opacity=0);background: #4d4d4d;" frameborder="0"></iframe></div>';
            let $backdrop = $(iframe + '<div class="backdrop-loading"><span class="fa fa-spinner fa-pulse"></span>' + txt + '<iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position:absolute; visibility:inherit; top:0px;left:0px;width:100%; height:100%;z-index:-1;opacity:0;filter:alpha(opacity=0);"></iframe></div><div class="backdrop"><iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position:absolute; visibility:inherit; top:0px;left:0px;width:100%; height:100%;z-index:-1;opacity:0;filter:alpha(opacity=0);"></iframe></div>');
            $('.common-gjdw-map').append($backdrop);
            $('#back-iframe').show();

            if (mapType == 0) {
                iframeWindow.defineTimer = setInterval(() => {
                    iframeWindow = document.getElementById("mapIframe").contentWindow;
                    if (iframeWindow.loadMapCompelete) {
                        clearInterval(iframeWindow.defineTimer);
                        $('#back-iframe,.backdrop-loading,.backdrop').remove();
                    }
                }, 200);
            }

            if (iframeWindow.esriMap) {
                iframeWindow.esriMap.clearDrawLayer();
            }

            this.$watch('mapShow', (newV) => {
                newV ? this.showMap(1) : this.hideMap();
            });

            $(window).on('resize', this.showMap);
        },
        onDispose() {
            $(window).off('resize', this.showMap);

            this.ajaxData = {};
            iframeWindow.esriMap.clearDrawLayer();
            this.hideMap();
            $('#back-iframe,.backdrop-loading,.backdrop').remove();
        }
    }
});

let city = '广州';
avalon.define({
    $id: 'sszhxt_vm',
    $cityDetailobj: {
        cityobj: cityobj,
        lon: cityobj[city].lon,
        lat: cityobj[city].lat
    },
    showMessage: showMessage
});

//提示框提示
function showMessage(type, content) {
    notification[type]({
        title: language_txt.mainIndex.notification,
        message: content
    });
}

function judgeIE() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}