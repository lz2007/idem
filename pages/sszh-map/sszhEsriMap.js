var markerArr = new Array; //标签数组
var labelArr = new Array; //文本数组
var GisObject;
var infowWindowInit = false;
var infoWindowShowing = {}; //保存信息窗口打开信息
var recordOrlockDevice = {}; //保存正在录像或锁定的设备,gbcode.record = true|false,gbcode.lock=true|false
const storage = require('../../services/storageService.js').ret;
const {
    mapLevel,
    mapConfig,
    languageSelect
} = require('/services/configService');
let language_txt = require('../../vendor/language').language;

//根据不同语言加载不同
window.mapConfig.server = mapConfig.server;
var countNum = 0;
var dojoHadStart = false; // dojo 地图初始化是否已经开始加载
// 检测初始化完毕才去地图处理
let timer = setInterval(function () {
    let tempRenderer = window.dojox.gfx.renderer;
    if (tempRenderer) { // 已加载svg.js
        //dojo加载后初始化地图需要一定时间，根据网络情况大概3s左右
        setTimeout(function () {
            try {
                if (window.dojox.gfx.renderer == tempRenderer && !dojoHadStart) { // 第二次判断dojox.gfx.renderer是否为null
                    clearInterval(timer);
                    window.StartDojo();
                }
            } catch (error) { // dojox.gfx.renderer 为undefined时5s后重新进行iframe reload
                countNum++;
                if(countNum > 25) {
                    clearInterval(timer);
                    window.location.reload();
                }
            }
        }, 3000);
    }  else { // dojox.gfx.renderer 为undefined时5s后重新进行iframe reload
        ++countNum;
        if(countNum > 25) {
            clearInterval(timer);
            window.location.reload();
        }
    }
}, 200);

window.StartDojo = function () {
    dojoHadStart = true;
    dojo.require("extras.MapInitObject");
    // dojo.require("esri.geometry.Extent");
    // dojo.require("esri.toolbars.draw");
    // dojo.require("esri/geometry/Point");
    // dojo.require("esri/geometry/Polyline");
    // dojo.require("esri.symbols.SimpleFillSymbol");
    // dojo.require("esri.symbols.SimpleLineSymbol");
    // dojo.require("esri.symbols.SimpleMarkerSymbol");
    // dojo.require("esri.symbols.PictureMarkerSymbol");
    // dojo.require("esri.symbols.TextSymbol");
    // dojo.require("esri.dijit.Scalebar");
    // dojo.require("extras.utils.GPSConvertor");
    // dojo.require("esri.geometry.webMercatorUtils");
    // dojo.require("esri.graphic");
    dojo.ready(function () {
        GisObject = new extras.MapInitObject("allmap");
        var tmpPoint = new esri.geometry.Point(113.2744940000, 23.1484710000);
        //默认城市
        if (parent.avalon && parent.avalon.vmodels['sszhxt_vm']) {
            tmpPoint = new esri.geometry.Point(parent.avalon.vmodels['sszhxt_vm'].$cityDetailobj.lon, parent.avalon.vmodels['sszhxt_vm'].$cityDetailobj.lat);
        }

        GisObject.setMapOptions({
            logo: false,
            extent: "12557877.595482401,2596928.9267310356,12723134.450635016,2688653.360673282",
            level: 10,
            center: tmpPoint
        });
        GisObject.addDefaultLayers();

        //轨迹的线symbol
        window.lineSymbol = new esri.symbols.SimpleLineSymbol({
            type: "esriSLS",
            style: "esriSLSSolid",
            width: 1,
            color: [255, 0, 0, 255]
        });
        // 圆填充symbol
        window.fillSymbol = new esri.symbols.SimpleFillSymbol(esri.symbols.SimpleFillSymbol.STYLE_SOLID, new esri.symbols.SimpleLineSymbol(esri.symbols.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 155, 255, 0.55]), 2), new dojo.Color([0, 155, 255, 0.55]));
        //轨迹起点symbol
        window.startSymbol = esriMap.createPicSymbol(13, 19, "../../static/image/sszhxt/begin.png");
        //轨迹终点symbol
        window.endSymbol = esriMap.createPicSymbol(13, 19, "../../static/image/sszhxt/end.png");
        //位置symbol
        window.locationSymbol = esriMap.createPicSymbol(13, 19, "../../static/image/sszhxt/track-locate.png");
        GisObject.map.on("click", function (event) {
            if (event.graphic) {
                if (!parent.avalon.vmodels['mapinfowindow'] || !parent.avalon.vmodels['mapinfowindow'].controlMarkerArr) {
                    return;
                }
                let key;
                // do what needs to happen on marker click
                for (key in infoWindowShowing) {
                    infoWindowShowing[key] = 0;
                }
                infoWindowShowing[event.graphic.gbcode] = 1;
                let marker = {};
                marker.id = event.graphic.id;
                marker.name = event.graphic.name;
                // marker.dev = event.graphic.dev;
                marker.gbcode = event.graphic.gbcode;
                //marker.type = data.detail.gps.deviceType;
                // marker.accountId = event.graphic.acountId;
                parent.avalon.vmodels['mapinfowindow'].controlMarkerArr(marker); //把它放到标记数组最后，这样就会在最后才更新点，info就不会消失了
            } else {
                if (window.parent.$(".mapcljl").length > 0) {
                    window.parent.$(".mapcljl").hide(100); //工具栏收缩
                }

                // do what needs to happen on map click
            }
        });

        var timerPoller = null;
        timerPoller = setInterval(function () {
            if (window.loadMapCompelete) {
                clearInterval(timerPoller);
                setTimeout(function () {
                    GisObject.map.setZoom(mapLevel); // 设置地图初始化级别（注：setMapOptions方法设置zoom能生效，但是中心点并不在center上）
                    if (languageSelect == 'en') {
                        $(".esriSimpleSliderIncrementButton").attr("title", "Zoom in");
                        $(".esriSimpleSliderDecrementButton").attr("title", "Zoom out");
                    }
                }, 500);
            }
        }, 200);
    });
};
// window.playVideo = function (gbcode, username, usercode, signal) {
//     parent.avalon.vmodels['mapinfowindow'].playVideo(gbcode, username, usercode, signal);
// }
window.circleArr = new Array; // 圆数组
window.playVideo = function (gbcode, username, usercode, signal, name, mytype, myData) {
    var data = JSON.parse(myData);
    if (mytype == 0) {
        data.channelSet = '';
    }
    parent.avalon.vmodels['mapinfowindow'].playVideo(gbcode, username, usercode, signal, name, mytype, data.channelSet);
}
window.startTalk = function (gbcode, username, usercode, signal, symbol, mytype) {
    if (symbol != 'false') {
        var person = username + '(' + usercode + ')';
        parent.avalon.vmodels['deviceInfoPop'].call(gbcode, person, signal);
        return;
    }
    parent.avalon.vmodels['mapinfowindow'].startTalk(gbcode, username, usercode, signal, mytype);
}
window.photograph = function (gbcode) {
    parent.avalon.vmodels['mapinfowindow'].photograph(gbcode);
}
window.lock = function (gbcode) {
    var judge = judgeLock(gbcode);
    parent.avalon.vmodels['mapinfowindow'].lock(gbcode, !judge);
}
window.record = function (gbcode) {
    var judegRecord = judgeRecord(gbcode);
    parent.avalon.vmodels['mapinfowindow'].record(gbcode, !judegRecord);
}
//改变span样式
window.changeSpanCss = function (symbol) {
    if (symbol) {
        $('#onspan').css({
            color: '#999999',
            background: '#cccccc'
        });
        $('#offspan').css({
            color: '#FFFFFF',
            background: 'green'
        });
    } else {
        $('#offspan').css({
            color: '#999999',
            background: '#cccccc'
        });
        $('#onspan').css({
            color: '#FFFFFF',
            background: 'green'
        });
    }

}
//增加锁定背景
window.addOrRemoveMask = function (symbol, tipword, end) {
    if (symbol) {
        var content = '<div id="lockMask" style="width: 100%;height: 100%;position: absolute;top: 0px;background: black;z-index: 9999;opacity: 0.4;filter:alpha(opacity=50);text-align: center">';
        content += '<div style="position: relative;top: 46%;color: #ffffff;font-size: 25px;">';
        if (end) content += '<span style="background: url(/static/image/tyywglpt/loading.gif) center center no-repeat;display: inline-block;width: 45px;height: 20px;"></span>';
        content += '<span>' + tipword + '</span></div></div>';
        $('.esriPopupWrapper').append(content);
    } else {
        $('#lockMask').remove();
    }

}
//disable button
window.disableOrActiveButton = function (symbol) {
    if (symbol) {
        $("#videobutton").attr({
            disabled: 'disabled'
        });
        $("#photobutton").attr({
            disabled: 'disabled'
        });
        $("#onspan").attr({
            disabled: 'disabled'
        });
        $("#offspan").attr({
            disabled: 'disabled'
        });
        let text = getLan().remoteUnlock;
        $("#lockbutton").text(text);
    } else {
        $("#videobutton").removeAttr('disabled');
        $("#photobutton").removeAttr('disabled');
        $("#onspan").removeAttr('disabled');
        $("#offspan").removeAttr('disabled');
        let text = getLan().remoteLock;
        $("#lockbutton").text(text);

    }
}
//记录录像或锁定的设备
window.settleData = function (gbcode, symbolrecord, symbollock) {
    if (!recordOrlockDevice[gbcode]) {
        recordOrlockDevice[gbcode] = {};
    }
    recordOrlockDevice[gbcode].record = symbolrecord;
    recordOrlockDevice[gbcode].lock = symbollock;
}
//判断设备是否是lock
window.judgeLock = function (gbcode) {
    if (recordOrlockDevice[gbcode] && recordOrlockDevice[gbcode].lock) {
        return true;
    }
    return false;
}
//判断是否在录像
window.judgeRecord = function (gbcode) {
    if (recordOrlockDevice[gbcode] && recordOrlockDevice[gbcode].record) {
        return true;
    }
    return false;
}
window.closeEvn = function () {
    var key;
    for (key in infoWindowShowing) {
        infoWindowShowing[key] = 0;
    }
}
window.esriMap = {
    timer: '',
    clearMapData: function () {
        markerArr = [];
        labelArr = [];
        circleArr = [];
    },
    remove_overlay: function () {
        var count = 0;
        var timer = setInterval(() => {
            if (!GisObject&&!GisObject.toolbar && !GisObject.toolbar.drawLayer ) return;
            count++;
            if (count === 30)
                clearInterval(timer);
            GisObject.toolbar && GisObject.toolbar.drawLayer && GisObject.toolbar.drawLayer.clear();
            GisObject.map.infoWindow.hide();
            markerArr.splice(0, markerArr.length);
            labelArr.splice(0, labelArr.length);
            circleArr.splice(0, circleArr.length);
            infoWindowShowing = {};
            recordOrlockDevice = {};
            clearInterval(timer);
        }, 300);
    },
    clearDrawLayer: function () {
        GisObject.toolbar && GisObject.toolbar.drawLayer && GisObject.toolbar.drawLayer.clear();
    },
    getRecordData() {
        return recordOrlockDevice;
    },
    setMapCenter: function (lon, lat, levels) {
        //设置地图中心点
        let point = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(parseFloat(lon), parseFloat(lat)));
        GisObject.map.centerAndZoom(point, levels);
    },
    setCenterAt: function (lon, lat) {
        let point = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(parseFloat(lon), parseFloat(lat)));
        GisObject.map.centerAt(point);
    },
    // 根据gps点确定地图显示级别
    setViewport: function (points) {
        var getZoom = function (maxJ, minJ, maxW, minW) {
            if (maxJ == minJ && maxW == minW) return 13;
            var diff = maxJ - minJ;
            if (diff < (maxW - minW) * 2.1) diff = (maxW - minW) * 2.1;
            diff = parseInt(10000 * diff) / 10000;

            var zoomArr = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14);
            var diffArr = new Array(360, 180, 90, 45, 22, 11, 5.5, 2.75, 1.37, 0.68, 0.34, 0.17, 0.08, 0.04, 0.02);

            for (var i = 0; i < diffArr.length; i++) {
                if ((diff - diffArr[i]) >= 0) {
                    return zoomArr[i] - 2;
                }
            }
            return 14;
        };
        //根据原始数据计算中心坐标和缩放级别，并为地图设置中心坐标和缩放级别。
        var setZoom = function (points) {
            var maxLng = points[0][0];
            var minLng = points[0][0];
            var maxLat = points[0][1];
            var minLat = points[0][1];
            var res;
            for (var i = points.length - 1; i >= 0; i--) {
                res = points[i];
                if (res[0] > maxLng) maxLng = res[0];
                if (res[0] < minLng) minLng = res[0];
                if (res[1] > maxLat) maxLat = res[1];
                if (res[1] < minLat) minLat = res[1];
            };
            var cenLng = (parseFloat(maxLng) + parseFloat(minLng)) / 2;
            var cenLat = (parseFloat(maxLat) + parseFloat(minLat)) / 2;
            var zoom = getZoom(maxLng, minLng, maxLat, minLat);
            esriMap.setMapCenter(cenLng, cenLat, zoom);
        };
        setZoom(points);
    },
    // 画圆
    createCircle: function (point, distance) {
        var point = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(parseFloat(point.longitude), parseFloat(point.latitude)));
        var circle = new esri.geometry.Circle(point, {
            "radius": distance
        });
        var circleGraphic = new esri.Graphic(circle, window.fillSymbol);
        if (GisObject.toolbar && GisObject.toolbar.drawLayer) {
            GisObject.toolbar.drawLayer.add(circleGraphic);
        }
        return circleGraphic;
    },
    createMarker: function (data, center) { //增加标记物
        if (!data.userName) {
            data.userName = '-';
        }
        if (!data.userCode) {
            data.userCode = '-';
        }
        if (!data.battery) {
            data.battery = 0;
        }
        if (!data.capacityTotal) {
            data.capacityTotal = 0;
        }
        if (!data.capacityUsed) {
            data.capacityUsed = 0;
        }
        if (!data.speed) {
            data.speed = 0;
        }
        if (!data.signal) {
            data.signal = 0;
        }
        if (!data.deviceName) {
            data.deviceName = '-';
        }
        if (data.videoStatus == 0) {
            data.videoStatus = false;
        } else {
            data.videoStatus = true;
        }
        if (data.locked != undefined && data.locked == 0) {
            data.locked = false;
        } else if (data.locked != undefined && data.locked != 0) {
            data.locked = true;
        }
        //本域执法仪才有锁定等这些功能
        if (data.mytype == 0 && !data.source) {
            settleData(data.gbcode, data.videoStatus, data.locked);
        } else {
            data.source = data.platformGbcode;
        }
        let point = extras.utils.GPSConvertor.gcj_encrypt(parseFloat(data.latitude), parseFloat(data.longitude));
        data.latitude = point.lat;
        data.longitude = point.lon;

        // if(isShowMap(data.detail.gps.deviceId)){
        //     center && setMapCenter(point.lon, point.lat);
        //     return;
        // }

        let iconUrl = "";
        let icon_h = 60 / 2;
        let icon_w = 40 / 2;
        if (data.isRealTimeView) {
            data.deviceType = 'DSJ';
        }
        if (data.mytype == 2) { //
            data.deviceType = 2;
        } else if (data.mytype == 1) {
            data.deviceType = 3;
        } else if (data.mytype == 3) {
            data.deviceType = 4;
        } else {
            data.deviceType = 'DSJ';
        }
        switch (data.deviceType) {
            case 'DSJ':
                iconUrl = "../../static/image/sszhxt-sszh/locate.png";
                icon_h = icon_h;
                icon_w = icon_w;
                break;
            case 2:
                iconUrl = "../../static/image/sszhxt-sszh/locate_car.png";
                break;
            case 3:
                iconUrl = "../../static/image/sszhxt-sszh/locate_fast.png";
                break;
            case 4:
                iconUrl = "../../static/image/sszhxt-sszh/locate_dron.png";
                break;

            default:
                iconUrl = "../../static/image/sszhxt-sszh/locate.png";
        }
        let circle;
        let radius = parent.avalon.vmodels['sszh-bkfw-vm'].radius; // 布控范围半径
        if (data.sosSource == "FACE_MONITORING" || data.showType && data.showType == "FACE_MONITORING") {
            iconUrl = "../../static/image/sszhxt-sszh/face_monitor.png";
            icon_h = icon_h;
            icon_w = icon_w;
        } else if (data.sosSource == "CAR_MONITORING" || data.showType && data.showType == "CAR_MONITORING") {
            iconUrl = "../../static/image/sszhxt-sszh/car_monitor.png";
            icon_h = icon_h;
            icon_w = icon_w;
        }
        if (data.executeControlClick) { // 点击布控按钮后画圆
            circle = esriMap.createCircle({
                longitude: data.longitude,
                latitude: data.latitude
            }, radius);
            circle.id = data.userCode;
            circle.name = data.userName;
            circle.gbcode = data.gbcode;
            circleArr.push(circle);
        }
        let myIcon = new esri.symbols.PictureMarkerSymbol({
            "url": iconUrl,
            "height": icon_h,
            "width": icon_w,
            "type": "esriPMS",
            xoffset: 0,
            yoffset: 5
        });
        let cruPoint = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(point.lon, point.lat));
        let pictureSymbol = new esri.symbols.PictureMarkerSymbol(myIcon); //图片
        let content = "";
        content += '<div class="infowindowcontainer" style="font-size: 14px;color:#12151e;word-break: break-all;">';

        //本域执法仪才有
        if (data.mytype == 0 && !data.source) {
            if (!data.userName || !data.userCode) {
                content += '<p>' + getLan().mapDialogRowPolice + ': ' + data.userName + '(' + data.userCode + ')</p>';
            } else {
                content += '<p>' + getLan().mapDialogRowDeviceName + ': ' + data.deviceName + '</p>';
            }
            content += '<p class="deviceID">' + getLan().mapDialogRowGbcode + ': ' + data.gbcode + '</p>';
        } else {
            if (data.mytype == 0) {
                data.type = '执法仪记录仪';
                data.name = data.deviceName;
            }
            content += '<p>' + getLan().mapDialogRowDeviceName + '：' + data.name + '</p>';
            content += '<p>' + getLan().mapDialogRowDeviceType + '：' + data.type + '</p>';
            content += '<p>' + getLan().mapDialogRowDeviceModel + '：' + data.model + '</p>';
        }

        //区分级联和设备接入,并且这个设备必须是执法仪才有这些东西
        if (!data.source && data.mytype == 0) {
            var width = data.battery / 100 * 29 + 'px';
            if (!width) width = '0px';
            content += '<p style="position: relative;margin-top: 14px; margin-bottom: 20px;">' + getLan().mapDialogRowBattery + ': <span style="display:inline-block;width: 34px;height: 20px;background:url(/static/image/sszhxt-sszh/battery.png)  0px -4px no-repeat;vertical-align: top;position: relative;"></span>';
            if (Number(data.battery) <= 25) {
                content += '<span style="width:' + width + ';height: 16px;background: red;position:  relative;left: -32px;vertical-align:top;top:2px;display: inline-block;"></span>';
            } else if (Number(data.battery) <= 45) {
                content += '<span style="width:' + width + ';height: 16px;background: orange;position:  relative;left: -32px;vertical-align:top;top:2px;display: inline-block;"></span>';
            } else {
                content += '<span style="width:' + width + ';height: 16px;background: green;position:  relative;left: -32px;vertical-align:top;top:2px;display: inline-block;"></span>';
            }
            content += '<span style="position:  absolute;left: 100px;top:0px;font-size: 12px;z-index: 1;">' + data.battery + '%</span></p>';
            var syrl = data.capacityUsed; //使用容量
            var zrl = data.capacityTotal;
            var spanwidth;
            if (zrl) {
                spanwidth = syrl / zrl * 180;
            } else {
                spanwidth = 0;
            }
            var spanTwowidth;
            spanTwowidth = spanwidth ? spanTwowidth = spanwidth / 4 + 110 + 'px' : spanTwowidth = '110px';
            spanwidth ? spanwidth = spanwidth + 'px' : spanwidth = '0px';
            // content += '<p>' + getLan().mapDialogRowStorage + ': <span style="display: inline-block;border-radius: 4px;width: 180px;height: 18px;background: #cccccc;font-size: 12px;margin-right: 5px;">';
            // content += '<span style="display:inline-block;border-radius: 4px;height: 18px;vertical-align:top;background:red;width:' + spanwidth + '"></span>';
            // content += '<span style="color:#ffffff;position: absolute;left: ' + spanTwowidth + ';vertical-align: top;">' + syrl + 'GB</span></span>';
            // content += '<span>' + zrl + 'GB</span></p>';
            //content += '<p>速度: ' + data.speed + 'm/s</p>';
            // let signalword = '';
            // if (data.signal < 15) {
            //     signalword = '差';
            // } else if (data.signal > 50) {
            //     signalword = '优';
            // } else {
            //     signalword = '良';
            // }
            // content += '<p>信号强度: ' + signalword + '</p>';
            var spancontent = '';
            if (recordOrlockDevice[data.gbcode] && !recordOrlockDevice[data.gbcode].record || data.vedioStatus) {
                if (data.locked) {
                    spancontent = '<button id="onspan" disabled="disabled" class="btn" onclick="record(\'' + data.gbcode + '\')" style="background: #cccccc;color: #999999;padding: 0px 5px;border-radius: 0;">ON</button><button disabled="disabled" class="btn" onclick="record(\'' + data.gbcode + '\')" id="offspan" style="background: green;color: #ffffff;padding: 0px 5px;border-radius: 0;">OFF</button>';
                } else {
                    spancontent = '<button id="onspan" class="btn" onclick="record(\'' + data.gbcode + '\')" style="background: #cccccc;color: #999999;padding: 0px 5px;border-radius: 0;">ON</button><button class="btn" onclick="record(\'' + data.gbcode + '\')" id="offspan" style="background: green;color: #ffffff;padding: 0px 5px;border-radius: 0;">OFF</button>';
                }
            } else {
                if (data.locked) {
                    spancontent = '<button  disabled="disabled"id="onspan" class="btn" onclick="record(\'' + data.gbcode + '\')" style="background: green;color: #ffffff;padding: 0px 5px;border-radius: 0;">ON</button><button disabled="disabled" class="btn" onclick="record(\'' + data.gbcode + '\')" id="offspan" style="background: #cccccc;color: #999999;padding: 0px 5px;border-radius: 0;">OFF</button>';

                } else {
                    spancontent = '<button id="onspan" class="btn" onclick="record(\'' + data.gbcode + '\')" style="background: green;color: #ffffff;padding: 0px 5px;border-radius: 0;">ON</button><button class="btn" onclick="record(\'' + data.gbcode + '\')" id="offspan" style="background: #cccccc;color: #999999;padding: 0px 5px;border-radius: 0;">OFF</button>';
                }
            }

            if (data.isAllowRecord) content += '<p>' + getLan().mapDialogRowRecord + ': ' + spancontent + '</p>';
            // content += '<p>版本号: ' + data.detail.dsj.version+'</p>';
        }

        var count = 0; //用于判断按钮放在那个div用的，暂时没用到
        var btnStyle = 'margin:0 20px 14px 0;background: #1055b3;width: 80px;height: 28px;line-height: 28px;padding: 0;border: none;border-radius: 2px;';
        content += '<div>';
        var myData = JSON.stringify(data).replace(/"/g, '&quot;');
        if (!data.isRealTimeView && data.isAllowVideo) {
            count++;
            if (data.locked) {
                content +=
                    '<button disabled="disabled" id="videobutton" class="btn btn-primary" style="'+ btnStyle + '");"' +
                    ' onclick="playVideo(\'' + data.gbcode + '\',\'' + data.userName + '\',\'' + data.userCode + '\',\'' + data.signal +
                    '\',\'' + '' + '\',\'' + data.mytype + '\',\'' + myData + '\',);">' + getLan().mapVedioBtn + '</button>';
            } else {
                //执法仪
                if (data.mytype == 0) {
                    content +=
                        '<button id="videobutton" class="btn btn-primary" style="'+ btnStyle + '");" onclick="playVideo(\'' +
                        data.gbcode + '\',\'' + data.userName + '\',\'' + data.userCode + '\',\'' + data.signal +
                        '\',\'' + '' + '\',\'' + data.mytype + '\',\'' + myData + '\');">' + getLan().mapVedioBtn + '</button>';
                } else {
                    //多通道
                    content +=
                        '<button id="videobutton" class="btn btn-primary" style="'+ btnStyle + '");" onclick="playVideo(\'' +
                        data.gbcode + '\',\'' + data.userName + '\',\'' + '' + '\',\'' + data.signal +
                        '\',\'' + data.name + '\', \'' + data.mytype + '\',\'' + myData + '\');">' + getLan().mapVedioBtn + '</button>';
                }
            }
        }


        // if (!data.source && data.mytype == 0) {
        if (!data.source) {
            //告警详情那里也有语音呼叫,现在没了
            if (!data.isRealTimeView) {
                data.isRealTimeView = false;
            }
            if (data.isAllowSpeak) {
                count++;
                if (data.locked) {
                    content += '<button disabled="disabled" class="btn btn-primary" style="'+ btnStyle + '" onclick="startTalk(\'' + data.gbcode + '\',\'' + data.userName + '\',\'' + data.userCode + '\',\'' + data.signal + '\',\'' + data.isRealTimeView + '\',\'' + data.mytype + '\');">' + getLan().mapVoiceBtn + '</button>';
                } else {
                    content += '<button class="btn btn-primary" style="'+ btnStyle + '" onclick="startTalk(\'' + data.gbcode + '\',\'' + data.userName + '\',\'' + data.userCode + '\',\'' + data.signal + '\',\'' + data.isRealTimeView + '\',\'' + data.mytype + '\');">' + getLan().mapVoiceBtn + '</button>';
                }
            }
            if (data.isAllowPhotograph) {
                count++;
                if (data.locked) {
                    content += '<button disabled="disabled" id="photobutton" class="btn btn-primary" style="'+ btnStyle + '" onclick="photograph(\'' + data.gbcode + '\');">' + getLan().Photograph + '</button>';
                } else {
                    content += '<button id="photobutton" class="btn btn-primary" style="'+ btnStyle + '" onclick="photograph(\'' + data.gbcode + '\');">' + getLan().Photograph + '</button>';
                }
            }
            if (data.isAllowLock) {
                var word = '';
                if (data.locked) {
                    word = getLan().remoteUnlock;
                } else {
                    word = getLan().remoteLock;
                }
                count++;
                content += '<button id="lockbutton" class="btn btn-primary" style="'+ btnStyle + '" onclick="lock(\'' + data.gbcode + '\');">' + word + '</button>';
            }
        }
        content += '</div>';
        //        content += '<div>';
        //        content += '<button class="btn btn-success btn-sm" style="margin-right: 5px;" onclick="starttalk(\''+data.deviceId+'\');">' + getI18NStr('msg.startTalk') + '</button>';
        //         content += '<button class="btn btn-primary" style="margin-right: 5px;" onclick="@startRecord(\''+data.gbcode+'\');">' + '录制视频' + '</button>';
        //         content += '<button class="btn btn-primary" onclick="@sentmessage(\''+data.gbcode+'\');">' + '消息下发' + '</button>';
        //        content += '</div>';
        content += '</div>';
        if (data.userName) {
            let string = data.userName + '(' + data.userCode + ')';
            let ls = new esri.symbols.TextSymbol(string).setColor(new esri.Color([4, 128, 209, 0.9])).setFont(new esri.symbol.Font("12px").setWeight(esri.symbol.Font.WEIGHT_BOLD)).setOffset(-25, -28).setAlign(esri.symbol.TextSymbol.ALIGN_START);
            let pointLabel = new esri.Graphic(cruPoint, ls);
            pointLabel.id = data.userCode;
            pointLabel.name = data.userName;
            // pointLabel.dev = data.deviceId;
            pointLabel.gbcode = data.gbcode;
            labelArr.push(pointLabel);
            //GisObject.map.graphics.add(pointLabel);
            GisObject && GisObject.toolbar && GisObject.toolbar.drawLayer && GisObject.toolbar.drawLayer.add(pointLabel);
        }

        let infoTemp = new esri.InfoTemplate(getLan().mapDeviceInfo, content);
        let marker = new esri.Graphic(cruPoint, pictureSymbol, {}, infoTemp);
        marker.id = data.userCode;
        marker.name = data.userName;
        // marker.dev = data.deviceId;
        marker.gbcode = data.gbcode;
        // marker.acountId = data.accountId;
        markerArr.push(marker);
        //GisObject.map.graphics.add(marker);
        $("#allmap .close").off('click', closeEvn);
        $("#allmap .close").on('click', closeEvn);
        GisObject && GisObject.toolbar && GisObject.toolbar.drawLayer && GisObject.toolbar.drawLayer.add(marker);
        center && esriMap.setMapCenter(point.lon, point.lat, 13);
        if (data.sosSource == "FACE_MONITORING") {
            parent.avalon.vmodels['sszhrlbk'].show(data);
        } else if (data.sosSource == "CAR_MONITORING") {
            parent.avalon.vmodels['sszh-cpbk'].show(data);
        } else if (data.sosSource == "DEVICE_SOS") {
            $(".infowindowcontainer").remove();
            $(".contentPane").append(content);
        }
        if (infoWindowShowing[data.gbcode] == 1) {
            GisObject.map.infoWindow.show(cruPoint);
            $("#allmap .close").off('click', closeEvn);
            $("#allmap .close").on('click', closeEvn);
        }
        GisObject.map.infoWindow.resize(380, 380); //信息窗口调整宽度
    },
    removerMarker: function (data) { ///删除标记物
        let markerTmp;
        for (let i = 0; i < markerArr.length; i++) {
            markerTmp = markerArr[i];
            if (markerTmp.gbcode == data) {
                GisObject.map.infoWindow.hide();
                GisObject.toolbar && GisObject.toolbar.drawLayer && GisObject.toolbar.drawLayer.remove(markerTmp);
                //GisObject.map.graphics.remove(markerTmp);
                markerArr.splice(i--, 1);
            }
        }
        for (let j = 0; j < labelArr.length; j++) {
            markerTmp = labelArr[j];
            if (markerTmp.gbcode == data) {
                GisObject.toolbar && GisObject.toolbar.drawLayer && GisObject.toolbar.drawLayer.remove(markerTmp);
                //GisObject.map.graphics.remove(markerTmp);
                labelArr.splice(j--, 1);
            }
        }
        for (let j = 0; j < circleArr.length; j++) {
            markerTmp = circleArr[j];
            if (markerTmp.gbcode == data) {
                GisObject.toolbar && GisObject.toolbar.drawLayer && GisObject.toolbar.drawLayer.remove(markerTmp);
                //GisObject.map.graphics.remove(markerTmp);
                circleArr.splice(j--, 1);
            }
        }
    },
    //测距
    measureLength: function () {
        GisObject.toolbar && GisObject.toolbar.measureLength();
    },
    /**
     * 添加线
     * @param {Object} points   坐标数组
     * @param {symbol} lineSymbol    线样式
     */
    addPolyline: function (points, lineSymbol, attributs) {
        let json = {
            paths: [points],
            "spatialReference": {
                "wkid": 4326
            }
        }
        let polyLine = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Polyline(json));
        let polyLineGraphic = new esri.graphic(polyLine, lineSymbol, attributs);
        if (GisObject.toolbar && GisObject.toolbar.drawLayer) {
            GisObject.toolbar.drawLayer.add(polyLineGraphic);
        }
        return polyLineGraphic;
    },
    /**
     * 添加带有弹窗的标记物
     * @param {number} x   经度
     * @param {number} y    纬度
     * @param {symbol} pictureSymbol    图片symbol
     * @param {Object} attributs
     * @param {InfoTemplate} infotemplete
     */
    addPictureMarker: function (x, y, pictureSymbol, attributs, infotemplete) {
        let pt = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(parseFloat(x), parseFloat(y)));
        let pictureGraphic = new esri.graphic(pt, pictureSymbol, attributs, infotemplete);
        if (GisObject.toolbar && GisObject.toolbar.drawLayer) {
            GisObject.toolbar.drawLayer.add(pictureGraphic);
        }
        return pictureGraphic;
    },
    removePictureMarker: function (pictureGraphic) {
        GisObject.toolbar && GisObject.toolbar.drawLayer.remove(pictureGraphic);
    },
    /**
     * 生成图片symbol
     * @param {number} width   宽度
     * @param {number} height   高度
     * @param {string} url    图片url
     */
    createPicSymbol: function (width, height, url) {
        let symbol = new esri.symbols.PictureMarkerSymbol({
            "type": "esriPMS", //点位图片展示
            "angle": 0, //旋转角度
            "height": height, //高度
            "width": width, //宽度
            "xoffset": 0, //x偏移量
            "yoffset": 8, //y偏移量
            "url": url //图片访问路径
        })
        return symbol;
    },
    /*
     * 告警管理详细那里取消调度，清除除了sos设备外的其他标注
     * */
    clearDiaodu: function (gbcode) { ///删除标记物
        let markerTmp;
        for (let i = 0; i < markerArr.length; i++) {
            markerTmp = markerArr[i];
            if (markerTmp.gbcode != gbcode) //不删掉告警警员
            {
                GisObject.map.infoWindow.hide();
                GisObject.toolbar&&GisObject.toolbar.drawLayer.remove(markerTmp);
                //GisObject.map.graphics.remove(markerTmp);
                markerArr.splice(i--, 1);
            }
        }
        for (let j = 0; j < labelArr.length; j++) {
            markerTmp = labelArr[j];
            if (markerTmp.gbcode != gbcode) {
                GisObject.toolbar&&GisObject.toolbar.drawLayer.remove(markerTmp);
                //GisObject.map.graphics.remove(markerTmp);
                labelArr.splice(j--, 1);
            }
        }
        for (let j = 0; j < circleArr.length; j++) {
            markerTmp = circleArr[j];
            if (markerTmp.gbcode != gbcode) {
                GisObject.toolbar&&GisObject.toolbar.drawLayer.remove(markerTmp);
                //GisObject.map.graphics.remove(markerTmp);
                circleArr.splice(j--, 1);
            }
        }
    },
    removeTrackLayer( symbol) { //清除掉轨迹查询和告警管理已处理那边的轨迹影响
        if (symbol === 'start') {
        var count = 0;
        this.timer = setInterval(() => {
            if (!GisObject) return;
            count++;
            if (count === 30)
                clearInterval(timer);
            let layerIds = GisObject.map.graphicsLayerIds;
            for (var i in layerIds) {
                if (/trackLine/g.test(layerIds[i])) {
                    var layer = GisObject.map.getLayer(layerIds[i]);
                    if (layer) {
                        GisObject.map.removeLayer(layer);
                    }
                }

            }
        }, 300);
    }
        if (symbol === 'stop' && this.timer!='') {
            clearInterval(this.timer);
            this.timer = ''
        } 
    }

};

window.showMessage = parent.avalon.vmodels['sszhxt_vm'].showMessage;

window.DrawPath = function (json, mapObj, vm, getTrackTotalAjax, getPageDeviceTrackAjax, getDeviceTrackByDuration, player) {
    this.json = json;
    this.totalPage = 0;
    this.maxPage = 0;
    this.curGpsPage = 0;
    this.gpsPageSize = 200;
    this.beginPoint = {};
    this.isGettingTrack = true;
    this.curTrackId = null;
    this.TrackGraphicLayer = null;
    //this.beginPoint = {};
    this.timer = null;
    this.timers = []; //用来存储画线定时器句柄
    this.polyineCount = 0;
    this.polyLineEndCount = 0;
    this.arrPoints = []; //用于存储蓝色标记数组
    this.leftPonts = []; //去除已经显示过的剩下没显示的蓝色数组
    this.markerCount = 0; //蓝色标记数组下标
    this.markerGraphics = []; //上一个蓝色标记数组(包括设备和时间信息)
    this.markerId = "";
    this.markerLayer = null;
    this.map = GisObject.map;
    this.vm = vm;
    this.player = player;
    this.picSymbol = null;
    this.getTrackTotalAjax = getTrackTotalAjax;
    this.getPageDeviceTrackAjax = getPageDeviceTrackAjax;
    this.getDeviceTrackByDuration = getDeviceTrackByDuration;
    this.init();

};
DrawPath.prototype = {
    constructor: DrawPath,
    init: function () {
        DrawPath.curTrackId = this.curTrackId = 'trackLine' + Math.random();
        DrawPath.TrackGraphicLayer = this.TrackGraphicLayer = new esri.layers.GraphicsLayer({
            id: DrawPath.curTrackId
        });
    },
    draw: function () {
        this.getTrackTotal();
    },
    drawPathByDuration: function () {
        this.getPathByDuration();
    },
    getTrackTotal: function () {
        this.getTrackTotalAjax(this.json).then((ret) => {
            this.total = ret.data.gpsSize;
            this.maxPage = Math.ceil(this.total / this.gpsPageSize);
            //   this.mapObj.polyLineEndCount = this.maxPage-1;
            if (this.total == 0) {
                showMessage('warn', getLan().mapNoTrackMsg);
                return false;
            }

            this.getGpsPageTrack(this.json, 0, this.gpsPageSize);

        });
    },
    getGpsPageTrack: function (json, page, pageSize) {
        //console.log('m:' + this.maxPage, 'page' + this.curGpsPage, this.timers);
        if (this.curGpsPage >= this.maxPage) {
            //   vm.btnDisabled = false;
            return false;
        } else if (!this.isGettingTrack) {
            return false;
        }
        this.getPageDeviceTrackAjax(json, page, pageSize).then((ret) => {
            if (this.curGpsPage == 0) {
                this.beginPoint = ret.data.currentElements[0];
                //console.log('lon:' + this.beginPoint.longitude, 'this.lat:' + this.beginPoint.latitude);
                this.map.centerAndZoom(new esri.geometry.Point(this.beginPoint.longitude, this.beginPoint.latitude), 20);
            }
            this.polyLine(ret.data.currentElements, this.maxPage - 1);
            //  this.mapObj.addLine(ret.data.currentElements, 200,vm.curGpsPage);
            this.arrPoints = this.arrPoints.concat(ret.data.currentElements);
            ++this.curGpsPage;
            this.getGpsPageTrack(json, this.curGpsPage, this.gpsPageSize);

        });
    },
    getPathByDuration: function () {
        this.getDeviceTrackByDuration(this.json).then((ret) => {
            if (ret.code == 0) {
                if ($.isEmptyObject(ret.data)) {
                    showMessage('warn', getLan().mapNoTrackMsg);
                    return false;
                }
                //   debugger;
                let points = ret.data[this.json['deviceIds'][0]];
                // console.log('points' + points);
                //startime:1515237865000;endtime:1515237926000
                // let points = [
                //     { longitude: 113.3205269257, latitude: 23.1725538283, time: 1515237872000 },
                //     { longitude: 113.2643446427, latitude: 23.1290765766, time: 1515237875000 },
                //     { longitude: 113.1984768057, latitude: 23.0627331203, time: 1515237894000 },
                //     { longitude: 113.1470088964, latitude: 23.0407734444, time: 1515237920000 },
                //     { longitude: 112.8540258383, latitude: 22.8568870944, time: 1515237925000 }
                // ];
                this.beginPoint = points[0];
                this.arrPoints = this.leftPonts = points;
                // this.map.centerAndZoom(new esri.geometry.Point(this.beginPoint.longitude, this.beginPoint.latitude), 20);
                this.map.centerAndZoom(new esri.geometry.Point(this.beginPoint.longitude, this.beginPoint.latitude), 5);
                this.polyLine(points, 0);
            } else {
                showMessage('error', ret.msg);
            }


        });
    },
    polyLine: function (curArr, curPage) {
        let paths = [];
        let inPaths = [];
        for (var i in curArr) {
            inPaths.push([curArr[i]['longitude'], curArr[i]['latitude']]);
        }
        paths.push(inPaths);
        let polyline = new esri.geometry.Polyline({
            "paths": paths,
            "spatialReference": this.map.spatialReference
        });
        polyline = esri.geometry.webMercatorUtils.geographicToWebMercator(polyline);
        //画线
        let polylineSymbol = new esri.symbols.SimpleLineSymbol().setColor(new esri.Color([255, 0, 0, 0.5])).setWidth(1);
        let poliLineGraphic = new esri.Graphic(polyline, polylineSymbol);
        //   this.TrackGraphicLayer =  new esri.layers.GraphicsLayer({ id: this.curTrackId });
        // this.map.centerAndZoom(new esri.geometry.Point(beginPoint.longitude, beginPoint.latitude),16);

        //画起始,终止点
        //  let beginMarkerGraphic = this.createMarker("../../static/image/sszhxt/begin.png", beginPoint);
        //  let endMarkerGraphic = this.createMarker("../../static/image/sszhxt/end.png", endPoint);

        if (DrawPath.TrackGraphicLayer == this.TrackGraphicLayer) //为了防止请求时上一次的轨迹没清完
            DrawPath.TrackGraphicLayer.add(poliLineGraphic);
        if (this.polyineCount == 0) {
            let beginPoint = curArr[0];
            let beginMarkerGraphic = this.createMarker("../../static/image/sszhxt/begin.png", beginPoint);
            DrawPath.TrackGraphicLayer.add(beginMarkerGraphic);
            this.vm.btnDisabled = true;
        }
        //console.log('trackId:' + DrawPath.curTrackId);
        if (this.polyineCount == curPage) {
            let endPoint = curArr[curArr.length - 1];
            let endMarkerGraphic = this.createMarker("../../static/image/sszhxt/end.png", endPoint);
            DrawPath.TrackGraphicLayer.add(endMarkerGraphic);
            this.vm.btnDisabled = false; //轨迹画完播放按钮才能呈现激活状态
        }
        this.map.addLayer(DrawPath.TrackGraphicLayer);
        ++this.polyineCount;
    },
    setMapExtend: function (geometry) {
        this.map.setExtent(geometry.getExtent().expand(2));
    },

    createMarker: function (url, oPoint) {
        // var iconUrl = url ? url : "../../static/image/sszhxt/locate.png";
        // var curPoint = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(oPoint.longitude, oPoint.latitude));
        // var myIcon = new esri.symbols.PictureMarkerSymbol({ "url": iconUrl, "height": 19, "width": 13, "type": "esriPMS", xoffset: 0, yoffset: 8 });
        // var pictureSymbol = new esri.symbols.PictureMarkerSymbol(myIcon);
        // var marker = new esri.Graphic(curPoint, pictureSymbol);
        // return marker;
        var iconUrl = url ? url : "../../static/image/sszhxt/track-locate.png";
        var curPoint = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(oPoint.longitude, oPoint.latitude));
        this.picSymbol = new esri.symbols.PictureMarkerSymbol({
            "type": "esriPMS"
        }).setWidth(13).setHeight(19).setOffset(0, 8);
        this.picSymbol = this.picSymbol.setUrl(iconUrl);
        var marker = new esri.Graphic(curPoint, this.picSymbol);
        return marker;
    },
    addMarker: function (timeInterval, step) {
        this.timer = setInterval(() => {
            this.clearGraphicsByLayer(this.markerId); //清除上一次的蓝色标记
            if (this.markerCount == (this.arrPoints.length)) {
                this.markerCount = 0;
                clearInterval(this.timer);
                this.vm.showPlayBtn = true;
                return false;
            }
            let curPoint = this.arrPoints[this.markerCount];
            let clickDeviceName = storage.getItem('cjxFixBugDeveviceName');
            let diviceInfo = clickDeviceName ? clickDeviceName : '-';
            // let diviceInfo = (curPoint['deviceName'] || '-') + '(' + (curPoint['deviceId'] || '-') + ')';
            let deviceTiime = DrawPath.formatDate(curPoint['time']);
            this.markerId = 'markerId' + Math.random();
            let point = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(curPoint.longitude, curPoint.latitude));
            //蓝色标记物
            let markerGraphic = this.createMarker(null, curPoint);
            let font = new esri.symbols.Font().setSize("16px").setFamily("微软雅黑").setWeight(esri.symbol.Font.WEIGHT_BOLD);
            let font2 = new esri.symbols.Font().setSize("16px").setFamily("微软雅黑");
            let textSymbol = new esri.symbols.TextSymbol(diviceInfo).setFont(font).setColor(new esri.Color([4, 128, 209, 0.9])).setOffset(-70, 55).setAlign(esri.symbol.TextSymbol.ALIGN_START);
            let textSymbol2 = new esri.symbols.TextSymbol(deviceTiime).setFont(font2).setColor(new esri.Color([4, 128, 209, 0.9])).setOffset(-70, 35).setAlign(esri.symbol.TextSymbol.ALIGN_START);
            //设备名称
            let textGraphic = new esri.Graphic(point, textSymbol);
            //时间
            let textGraphic2 = new esri.Graphic(point, textSymbol2);
            this.markerLayer = new esri.layers.GraphicsLayer({
                id: this.markerId
            });
            this.markerGraphics.concat([markerGraphic, textGraphic, textGraphic2]);
            this.markerLayer.add(markerGraphic);
            this.markerLayer.add(textGraphic);
            this.markerLayer.add(textGraphic2);
            this.map.addLayer(this.markerLayer);
            this.map.centerAt(point);
            let step = step || 1;
            this.markerCount = this.markerCount + step;
        }, timeInterval);
    },
    addMarkerByDuration2: function (timeStamp) {
        //console.log('timeStamp' + timeStamp);
        for (var i = 0; i < this.leftPonts.length; i++) {
            if (timeStamp >= this.leftPonts[i]['time']) {
                this.clearGraphicsByLayer(this.markerId); //清除上一次的蓝色标记
                // if (this.markerCount == (this.arrPoints.length-1)) {
                //     this.markerCount = 0;
                //     return false;
                // }
                //console.log('markerId:' + this.markerId);
                this.markerCount = i;
                let curPoint = this.leftPonts[this.markerCount];
                let diviceInfo = (curPoint['deviceName'] || '-') + '(' + (curPoint['deviceId'] || '-') + ')';
                let deviceTiime = DrawPath.formatDate(curPoint['time']);
                this.markerId = 'markerId' + Math.random();
                let point = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(curPoint.longitude, curPoint.latitude));
                //蓝色标记物
                let markerGraphic = this.createMarker(null, curPoint);
                let font = new esri.symbols.Font().setSize("16px").setFamily("微软雅黑").setWeight(esri.symbol.Font.WEIGHT_BOLD);
                let font2 = new esri.symbols.Font().setSize("16px").setFamily("微软雅黑");
                let textSymbol = new esri.symbols.TextSymbol(diviceInfo).setFont(font).setColor(new esri.Color([4, 128, 209, 0.9])).setOffset(-70, 55).setAlign(esri.symbol.TextSymbol.ALIGN_START);
                let textSymbol2 = new esri.symbols.TextSymbol(deviceTiime).setFont(font2).setColor(new esri.Color([4, 128, 209, 0.9])).setOffset(-70, 35).setAlign(esri.symbol.TextSymbol.ALIGN_START);
                //设备名称
                let textGraphic = new esri.Graphic(point, textSymbol);
                //时间
                let textGraphic2 = new esri.Graphic(point, textSymbol2);
                this.markerLayer = new esri.layers.GraphicsLayer({
                    id: this.markerId
                });
                this.markerGraphics.concat([markerGraphic, textGraphic, textGraphic2]);
                this.markerLayer.add(markerGraphic);
                this.markerLayer.add(textGraphic);
                this.markerLayer.add(textGraphic2);
                this.map.addLayer(this.markerLayer);
                this.leftPonts = this.leftPonts.splice(i + 1);
                //    console.log('i:' + this.markerCount, this.leftPonts[this.markerCount]['time']);
                break;
            }
        }
    },
    removeLayer: function (layerId) {
        var layer = this.map.getLayer(layerId);
        if (layer) {
            this.map.removeLayer(layer);
        }
    },
    clearGraphicsByLayer: function (markerId) {
        var markerLayer = this.map.getLayer(markerId);
        if (markerLayer)
            markerLayer.clear();
    },
    resetLayerPos: function (centePpoint, zoom) {
        this.map.centerAndZoom(new esri.geometry.Point(centePpoint.longitude, centePpoint.latitude), zoom);
    },
    addLine: function (arr, time, curPage) {
        let length = arr.length,
            count = 0,
            addLineTimer = null;
        let _this = this;
        addLineTimer = setInterval(() => {
            if (count == length - 1) {
                //  console.log(111);
                clearInterval(addLineTimer);
                // gjcxMap.setMapExtend(new esri.geometry.Polyline({
                //     "paths": gjcxMap.paths
                // }));
                return false;
            }
            //   console.log(count,arr[count]['longitude'],arr[count]['latitude']);

            let point1 = arr[count];
            let point2 = arr[++count];
            let arrTwoPoint = [point1, point2];
            // if(count == arr.length-1)
            // _this.polyLine([arr[arr.length-2],arr[arr.length-1]]);
            // else
            //  console.log('count'+count);
            _this.polyLine(arrTwoPoint, curPage);
        }, time);
        gjcxMap.timers.push(addLineTimer);

    },
    clearTimer: function () {
        if (this.timer)
            clearInterval(this.timer);
        for (var i in this['timers']) {
            clearInterval(this['timers'][i]);
            this['timers'][i] = null;
        }
        this.timer = null;
        this['timers'] = [];
    }
};

DrawPath.formatDate = function (now) {
    if (!now)
        return '-';
    let date = new Date(now);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var dat = date.getDate();
    var hour = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
    var mm = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
    var seconds = date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();
    return year + '-' + month + '-' + dat + "  " + hour + ":" + mm + ":" + seconds;
};

// 自定义弹窗实例
window.DiyInfowindow = function(map) {
    this.id = id;
    this.map = map;
    this.init();
};

DiyInfowindow.prototype = {
    constructor: DiyInfowindow,
    init: function init() {
        //鼠标单击
        this.map.on("click", leftClick);
        this.map.on("pan", function (pan) {
            if (beforePoint != null && isWindowShow == 1) {
                var movePoint = pan.delta;
                showinfowindow((beforePoint.x + movePoint.x), (beforePoint.y + movePoint.y))
            }
        });
        this.map.on("pan-end", function (panend) {
            if (beforePoint != null && isWindowShow == 1) {
                var movedelta = panend.delta;
                beforePoint.x = beforePoint.x + movedelta.x;
                beforePoint.y = beforePoint.y + movedelta.y;
            }
        });
        this.map.on("zoom", function () {
            if (beforePoint != null && isWindowShow == 1) {
                infowin.style.display = "none";
            }
        });
        this.map.on("zoom-end", function () {
            if (beforePoint != null && isWindowShow == 1) {
                var zoomPoint = map.toScreen(beforeMapPoint);
                showinfowindow(zoomPoint.x, zoomPoint.y);
                beforePoint = zoomPoint;
            }
        });
    },
    showinfowindow: function showinfowindow(x, y) {
        infowin.style.left = (x - width / 2) + "px";
        infowin.style.top = (y - height - offset) + "px";
        infowin.style.position = "absolute";
        infowin.style.width = width + "px";
        infowin.style.height = height + "px";
        infowin.style.display = "block";
    },

    leftClick: function leftClick(evt) {
        infowin.style.display = "none";
        var strtitle = "城市名称";
        var strcontent = "名称：1111111<br><br>年代：1991<br><br>省份：balabala<br><br>历史沿革：不详";
        title.innerHTML = strtitle;
        content.innerHTML = strcontent;
        var screenpoint = map.toScreen(evt.mapPoint);
        beforeMapPoint = evt.mapPoint;
        beforePoint = screenpoint;
        showinfowindow(screenpoint.x, screenpoint.y);
        isWindowShow = 1;
    }
};

function getLan() {
    return language_txt.sszhxt.map;
}