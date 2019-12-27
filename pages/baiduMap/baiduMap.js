var map;
var markerArr = [], labelArr=[];
var infoWindowShowing = {}; //保存信息窗口打开信息
var recordOrlockDevice ={};//保存正在录像或锁定的设备,gbcode.record = true|false,gbcode.lock=true|false

window.onload = function () {
    map = new BMap.Map("allmap"); // 创建Map实例
    var tmpPoint = new BMap.Point(113.2744940000, 23.1484710000);
    //默认城市
    if (parent.avalon && parent.avalon.vmodels['sszhxt_vm']) {
        tmpPoint = new BMap.Point(parent.avalon.vmodels['sszhxt_vm'].$cityDetailobj.lon, parent.avalon.vmodels['sszhxt_vm'].$cityDetailobj.lat);
    }
    map.centerAndZoom(tmpPoint, 11);  // 初始化地图,设置中心点坐标和地图级别
    map.addControl(new BMap.MapTypeControl());   //添加地图类型控件

    map.enableScrollWheelZoom(true);

    var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_LEFT});// 左上角，添加比例尺
    var top_left_navigation = new BMap.NavigationControl();  //左上角，添加默认缩放平移控件
    //var size = new BMap.Size(80, 20);
    // map.addControl(new BMap.CityListControl({
    //     anchor: BMAP_ANCHOR_TOP_LEFT,
    //     offset: size,
    //     // 切换城市之间事件
    //     // onChangeBefore: function(){
    //     //    alert('before');
    //     // },
    //     // 切换城市之后事件
    //     // onChangeAfter:function(){
    //     //   alert('after');
    //     // }
    // }))
    map.addControl(top_left_control);
    map.addControl(top_left_navigation);
    map.addEventListener("tilesloaded", function () {
        parent.$('#back-iframe,.backdrop-loading,.backdrop').remove();
        window.loadMapCompelete = true;
    });
    map.addEventListener("click", function (e) {
        let key;
        for (key in infoWindowShowing) {
            infoWindowShowing[key] = 0;
        }
        if(e.ab && e.ab.gbcode){
            if (!parent.avalon.vmodels['mapinfowindow'] || !parent.avalon.vmodels['mapinfowindow'].controlMarkerArr) {
                return;
            }
            infoWindowShowing[e.ab.gbcode] = 1;
            let marker = {};
            marker.id = e.ab.id;
            marker.name = e.ab.name;
            marker.gbcode = e.ab.gbcode;
            parent.avalon.vmodels['mapinfowindow'].controlMarkerArr(marker); //把它放到标记数组最后，这样就会在最后才更新点，info就不会消失了
        }

    });
    //轨迹起点symbol
    window.startSymbol = window.esriMap.createPicSymbol(32, 48, "../../static/image/sszhxt/begin.png");
    //轨迹终点symbol
    window.endSymbol = window.esriMap.createPicSymbol(32, 48, "../../static/image/sszhxt/end.png");
    //位置symbol
    window.locationSymbol = window.esriMap.createPicSymbol(32, 48, "../../static/image/sszhxt/locate_md.png");
};

//轨迹的线symbol
window.lineSymbol = {
    strokeColor: "red",
    strokeWeight: 2,
    strokeOpacity: 0.8
}
window.playVideo = function (gbcode, username, usercode, signal) {
    parent.avalon.vmodels['mapinfowindow'].playVideo(gbcode, username, usercode, signal);
}
window.startTalk = function (gbcode, username, usercode, signal, symbol) {
    if (symbol != 'false') {
        var person = username + '(' + usercode + ')';
        parent.avalon.vmodels['deviceInfoPop'].call(gbcode, person, signal);
        return;
    }
    parent.avalon.vmodels['mapinfowindow'].startTalk(gbcode, username, usercode, signal);
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
        $("#lockbutton").text('远程解锁');
    } else {
        $("#videobutton").removeAttr('disabled');
        $("#photobutton").removeAttr('disabled');
        $("#onspan").removeAttr('disabled');
        $("#offspan").removeAttr('disabled');
        $("#lockbutton").text('远程锁定');

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
    clearMapData: function () {
        markerArr = [];
        labelArr = [];
        recordOrlockDevice = {};
    },
    remove_overlay() {
        map.clearOverlays();
        this.clearMapData();
    },
    clearDrawLayer: function () {
        map.clearOverlays();
    },
    getRecordData() {
        return recordOrlockDevice;
    },
    setMapCenter: function (lon, lat, levels) {
        //设置地图中心点,含有级别参数
        map.centerAndZoom(new BMap.Point(lon, lat), levels);
    },
    //设置地图中心点，可以是点或是城市
    setCenterAt: function (lon, lat) {
        if (typeof arguments[0] == 'string') {
            map.setCenter(arguments[0]);
        } else {
            map.setCenter(new BMap.Point(lon, lat));
        }
    },
    createMarker(data, center) {
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
            data.capacityTotal = 1;
        }
        if (!data.capacityUsed) {
            data.capacityUsed = 1;
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
        if (data.locked == 0) {
            data.locked = false;
        } else {
            data.locked = true;
        }
        settleData(data.gbcode, data.videoStatus, data.locked);
        var iconUrl = "";
        var icon_h = 35 / 2;
        var icon_w = 35 / 2;
        if (data.isRealTimeView) {
            data.deviceType = 'DSJ';
        }
        switch (data.deviceType) {
            case 'DSJ':
                iconUrl = "../../static/image/sszhxt-sszh/locate.png";
                icon_h = 45;
                icon_w = 45;
                break;
            case 2:
                iconUrl = "./ic_camera.png";
                break;
            case 3:
                iconUrl = "./ic_GH.png";
                break;
            case 4:
                iconUrl = "./ic_police2_pLcar.png";
                break;

            default:
                iconUrl = "";
        }
        var myIcon = new BMap.Icon(iconUrl, new BMap.Size(icon_w, icon_h));
        myIcon.setImageSize(new BMap.Size(icon_w / 2, icon_h / 2));
        var cruPoint = new BMap.Point(data.longitude, data.latitude);
        var marker = new BMap.Marker(cruPoint, {
            icon: myIcon
        });
        var content = "";
        content += '<div class="infowindowcontainer" style="font-size: 14px;color:#3c3c3c;word-break: break-all;">';
        content += '<p>警员姓名/警号: ' + data.userName + '(' + data.userCode + ')</p>';
        content += '<p class="deviceID">' + '国标编号: ' + data.gbcode + '</p>';
        // if (data.battery < 20) {
        //     content += '<p>剩余电量:<span style="color: red">' + data.battery + '%</span></p>';
        // } else {
        //     content += '<p>剩余电量:<span>' + data.battery + '%</span></p>';
        // }
        //区分级联和设备接入
        if (!data.source) {
            var width = data.battery / 100 * 29 + 'px';
            if (!width) width = '0px';
            content += '<p style="position: relative;">剩余电量: <span style="display:inline-block;width: 34px;height: 28px;background:url(/static/image/sszhxt-sszh/battery.png) no-repeat scroll;vertical-align: middle;"></span>';
            if (data.battery <= 25) {
                content += '<span style="width:' + width + ';height: 16px;background: red;position:  relative;left: -32px;vertical-align:top;top:6px;display: inline-block;"></span>';
            } else if (data.battery <= 45) {
                content += '<span style="width:' + width + ';height: 16px;background: orange;position:  relative;left: -32px;vertical-align:top;top:6px;display: inline-block;"></span>';
            } else {
                content += '<span style="width:' + width + ';height: 16px;background: green;position:  relative;left: -32px;vertical-align:top;top:6px;display: inline-block;"></span>';
            }
            content += '<span style="position:  absolute;left: 75px;top:5px;font-size: 12px;">' + data.battery + '</span></p>';
            var syrl = Math.floor((data.capacityUsed) / (1024 * 1024 * 1024)); //使用容量
            var zrl = Math.floor(data.capacityTotal / (1024 * 1024 * 1024));
            var spanwidth = syrl / zrl * 180;
            var spanTwowidth;
            spanTwowidth = spanwidth ? spanTwowidth = spanwidth / 4 + 80 + 'px' : spanTwowidth = '80px';
            spanwidth ? spanwidth = spanwidth + 'px' : spanwidth = '0px';
            content += '<p>存储容量: <span style="display: inline-block;border-radius: 4px;width: 180px;height: 17px;background: #cccccc;font-size: 12px;margin-right: 5px;">';
            content += '<span style="display:inline-block;border-radius: 4px;height: 17px;vertical-align:top;background:red;width:' + spanwidth + '"></span>';
            content += '<span style="color:#ffffff;position: absolute;left: ' + spanTwowidth + ';vertical-align: top;">' + syrl + 'GB</span></span>';
            content += '<span>' + zrl + 'GB</span></p>';
            //content += '<p>速度: ' + data.speed + 'm/s</p>';
            // var  signalword = '';
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
                    spancontent = '<button id="onspan" disabled="disabled" class="btn" onclick="record(\'' + data.gbcode + '\')" style="background: green;color: #ffffff;padding: 0px 5px;border-radius: 0;">ON</button><button disabled="disabled" class="btn" onclick="record(\'' + data.gbcode + '\')" id="offspan" style="background: #cccccc;color: #999999;padding: 0px 5px;border-radius: 0;">OFF</button>';
                } else {
                    spancontent = '<button id="onspan" class="btn" onclick="record(\'' + data.gbcode + '\')" style="background: green;color: #ffffff;padding: 0px 5px;border-radius: 0;">ON</button><button class="btn" onclick="record(\'' + data.gbcode + '\')" id="offspan" style="background: #cccccc;color: #999999;padding: 0px 5px;border-radius: 0;">OFF</button>';
                }
            } else {
                if (data.locked) {
                    spancontent = '<button  disabled="disabled"id="onspan" class="btn" onclick="record(\'' + data.gbcode + '\')" style="background: #cccccc;color: #999999;padding: 0px 5px;border-radius: 0;">ON</button><button disabled="disabled" class="btn" onclick="record(\'' + data.gbcode + '\')" id="offspan" style="background: green;color: #ffffff;padding: 0px 5px;border-radius: 0;">OFF</button>';

                } else {
                    spancontent = '<button id="onspan" class="btn" onclick="record(\'' + data.gbcode + '\')" style="background: #cccccc;color: #999999;padding: 0px 5px;border-radius: 0;">ON</button><button class="btn" onclick="record(\'' + data.gbcode + '\')" id="offspan" style="background: green;color: #ffffff;padding: 0px 5px;border-radius: 0;">OFF</button>';
                }
            }

            if (data.isAllowRecord) content += '<p>录像: ' + spancontent + '</p>';
            // content += '<p>版本号: ' + data.detail.dsj.version+'</p>';
        }

        var count = 0; //用于判断按钮放在那个div用的，暂时没用到
        content += '<div style="margin-bottom: 5px;">';

        if (!data.isRealTimeView && data.isAllowVideo) {
            count++;
            if (data.locked) {
                content += '<button disabled="disabled" id="videobutton" class="btn btn-primary  btn-sm" style="margin-right: 5px;background: rgb(7, 124, 225);");" onclick="playVideo(\'' + data.gbcode + '\',\'' + data.userName + '\',\'' + data.userCode + '\',\'' + data.signal + '\',\'' + data.isRealTimeView + '\');">' + '视频呼叫' + '</button>';
            } else {
                content += '<button id="videobutton" class="btn btn-primary  btn-sm" style="margin-right: 5px;background: rgb(7, 124, 225);");" onclick="playVideo(\'' + data.gbcode + '\',\'' + data.userName + '\',\'' + data.userCode + '\',\'' + data.signal + '\',\'' + data.isRealTimeView + '\');">' + '视频呼叫' + '</button>';
            }
        }


        if (!data.source) {
            //告警详情那里也有语音呼叫
            if (!data.isRealTimeView) {
                data.isRealTimeView = false;
            }
            if (data.isAllowSpeak) {
                count++;
                if (data.locked) {
                    content += '<button disabled="disabled" class="btn btn-primary  btn-sm" style="margin-right: 5px;background: rgb(7, 124, 225);" onclick="startTalk(\'' + data.gbcode + '\',\'' + data.userName + '\',\'' + data.userCode + '\',\'' + data.signal + '\',\'' + data.isRealTimeView + '\');">' + '语音呼叫' + '</button>';
                } else {
                    content += '<button class="btn btn-primary  btn-sm" style="margin-right: 5px;background: rgb(7, 124, 225);" onclick="startTalk(\'' + data.gbcode + '\',\'' + data.userName + '\',\'' + data.userCode + '\',\'' + data.signal + '\',\'' + data.isRealTimeView + '\');">' + '语音呼叫' + '</button>';
                }
            }
            if (data.isAllowPhotograph) {
                count++;
                if (data.locked) {
                    content += '<button disabled="disabled" id="photobutton" class="btn btn-primary  btn-sm" style="margin-right: 5px;background: rgb(7, 124, 225);" onclick="photograph(\'' + data.gbcode + '\');">' + '远程拍照' + '</button>';
                } else {
                    content += '<button id="photobutton" class="btn btn-primary  btn-sm" style="margin-right: 5px;background: rgb(7, 124, 225);" onclick="photograph(\'' + data.gbcode + '\');">' + '远程拍照' + '</button>';
                }
            }
            if (data.isAllowLock) {
                var word = '';
                if (data.locked) {
                    word = '远程解锁';
                } else {
                    word = '远程锁定';
                }
                count++;
                content += '<button id="lockbutton" class="btn btn-primary  btn-sm" style="margin-right: 5px;background: rgb(7, 124, 225);" onclick="lock(\'' + data.gbcode + '\');">' + word + '</button>';
            }
        }
        content += '</div>';
        //        content += '<div>';
        //        content += '<button class="btn btn-success btn-sm" style="margin-right: 5px;" onclick="starttalk(\''+data.deviceId+'\');">' + getI18NStr('msg.startTalk') + '</button>';
        //         content += '<button class="btn btn-primary  btn-sm" style="margin-right: 5px;" onclick="@startRecord(\''+data.gbcode+'\');">' + '录制视频' + '</button>';
        //         content += '<button class="btn btn-primary  btn-sm" onclick="@sentmessage(\''+data.gbcode+'\');">' + '消息下发' + '</button>';
        //        content += '</div>';
        content += '</div>';
        if (data.userName) {
            var label = new BMap.Label(data.userName, {
                'offset': new BMap.Size(5, 25)
            });
            label.setStyle({
                color: "#2f94fc",
                border: "none",
                'max-width': 'none'
            });
            marker.setLabel(label);
        }
        $(".BMap_mask").next().find('img[src="http://api0.map.bdimg.com/images/iw_close1d3.gif"]').off('click', closeEvn);
        $(".BMap_mask").next().find('img[src="http://api0.map.bdimg.com/images/iw_close1d3.gif"]').on('click', closeEvn);
        var  infoWindow = new BMap.InfoWindow(content,{'title':'<p>设备信息</p>'});
        // infoWindow.setWidth(330);
        // infoWindow.setHeight(230);
        map.addOverlay(marker);
        if (infoWindowShowing[data.gbcode] == 1) {
            map.openInfoWindow(infoWindow, cruPoint);
        }
        marker.addEventListener("click", function(){
            this.openInfoWindow(infoWindow);
            $(".BMap_mask").next().find('img[src="http://api0.map.bdimg.com/images/iw_close1d3.gif"]').off('click', closeEvn);
            $(".BMap_mask").next().find('img[src="http://api0.map.bdimg.com/images/iw_close1d3.gif"]').on('click', closeEvn);
        });
        marker.id = data.userCode;
        marker.name = data.userName;
        // marker.dev = data.deviceId;
        marker.gbcode = data.gbcode;
        markerArr.push(marker);
        center && esriMap.setMapCenter(data.longitude, data.latitude, 13);
    },
    // 删除标签
    removerMarker: function (data) {
        for (var i = 0; i < markerArr.length; i++) {
            var markerTmp = markerArr[i];
            if (markerArr[i].gbcode == data) {
                map.removeOverlay(markerArr[i]);
                markerArr.splice(i--, 1);
                if(infoWindowShowing[data] == 1){
                    map.closeInfoWindow();
                }
                break;
            }
        }
    },
    //测距
    measureLength: function () {
        var myDis = new BMapLib.DistanceTool(map);
        myDis.open(); //开启鼠标测距
    },
    /**
     * 添加线
     * @param {Object} points   坐标数组
     * @param {symbol} lineSymbol    线样式
     */
    addPolyline: function (points, lineSymbol) {
        lineSymbol = lineSymbol ? lineSymbol : window.lineSymbol;
        var copyarr = [];
        for (var i = 0; i < points.length; i++) {
            copyarr.push(new BMap.Point(points[i][0], points[i][1]));
        }
        var polyline = new BMap.Polyline(copyarr, lineSymbol); //创建线
        map.addOverlay(polyline); //增加折线
        return polyline;
    },
    addPictureMarker: function (x, y, pictureSymbol, attributs, infotemplete) {
        var pt = new BMap.Point(x, y);
        var marker = new BMap.Marker(pt, {
            icon: pictureSymbol
        });
        map.addOverlay(marker);
        return marker;
    },
    removePictureMarker: function (pictureGraphic) {
        map.removeOverlay(pictureGraphic);
    },
    /**
     * 生成图片symbol
     * @param {number} width   宽度
     * @param {number} height   高度
     * @param {string} url    图片url
     */
    createPicSymbol: function (width, height, url) {
        var  symbol = new BMap.Icon({
            "size": new BMap.Size(width, height),
            "url": url //图片访问路径
        })
        return symbol;
    },
    removeTrackLayer() {
        this.clearDrawLayer();
    }
}

window.showMessage = parent.avalon.vmodels['sszhxt_vm'].showMessage;

/*
     *  lala函数作用就是每次new一下，将放回值赋值drawpath.TrackGraphicLayer和当前new的这个对象的TrackGraphicLayer
     *  即this.TrackGraphicLayer,通过对比this.TrackGraphicLayer === drawpath.TrackGraphicLayer,成立就画轨迹，
     *  不成立说明某人点了轨迹列表中的另一个item
     * */
function lala() {
    return {
        'a': 1
    }
}
window.DrawPath = function (json, mapObj, vm, getTrackTotalAjax, getPageDeviceTrackAjax, getDeviceTrackByDuration,
                            player) {
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
    this.map = map;
    this.vm = vm;
    this.player = player;
    this.picSymbol = null;
    this.getTrackTotalAjax = getTrackTotalAjax;
    this.getPageDeviceTrackAjax = getPageDeviceTrackAjax;
    this.getDeviceTrackByDuration = getDeviceTrackByDuration;
    //this.init();

};
DrawPath.prototype = {
    constructor: DrawPath,
    init: function () {
        DrawPath.curTrackId = this.curTrackId = 'trackLine' + Math.random();
        DrawPath.TrackGraphicLayer = this.TrackGraphicLayer = new lala();
    },
    draw: function () {
        this.getTrackTotal();
    },
    drawPathByDuration: function () {
        this.getPathByDuration();
    },
    getTrackTotal: function () {
        var that = this;
        this.getTrackTotalAjax(this.json).then(function (ret) {
            that.total = ret.data.gpsSize;
            that.maxPage = Math.ceil(that.total / that.gpsPageSize);
            //   this.mapObj.polyLineEndCount = this.maxPage-1;
            if (that.total == 0) {
                showMessage('warn', '暂无gps轨迹信息');
                return false;
            }

            that.getGpsPageTrack(that.json, 0, that.gpsPageSize);

        });
    },
    getGpsPageTrack: function (json, page, pageSize) {
        var that = this;
        if (this.curGpsPage >= this.maxPage) {
            //   vm.btnDisabled = false;
            return false;
        } else if (!this.isGettingTrack) {
            return false;
        }
        this.getPageDeviceTrackAjax(json, page, pageSize).then(function (ret) {
            if (that.curGpsPage == 0) {
                that.beginPoint = ret.data.currentElements[0];
                //console.log('lon:' + this.beginPoint.longitude, 'this.lat:' + this.beginPoint.latitude);
                esriMap.setMapCenter(that.beginPoint.longitude, that.beginPoint.latitude, 18);
            }
            that.polyLine(ret.data.currentElements, that.maxPage - 1);
            //  this.mapObj.addLine(ret.data.currentElements, 200,vm.curGpsPage);
            that.arrPoints = that.arrPoints.concat(ret.data.currentElements);
            ++that.curGpsPage;
            that.getGpsPageTrack(json, that.curGpsPage, that.gpsPageSize);

        });
    },
    getPathByDuration: function () {
        var that = this;
        this.getDeviceTrackByDuration(that.json).then(function (ret) {
            if (ret.code == 0) {
                if ($.isEmptyObject(ret.data)) {
                    alert('暂无轨迹');
                    return false;
                }
                var points = ret.data[that.json['deviceIds'][0]];
                that.beginPoint = points[0];
                that.arrPoints = that.leftPonts = points;
                // this.map.centerAndZoom(new esri.geometry.Point(this.beginPoint.longitude, this.beginPoint.latitude), 20);
                esriMap.setMapCenter(that.beginPoint.longitude, that.beginPoint.latitude, 10);

                that.polyLine(points, 0);
            } else {
                showMessage('error', ret.msg);
            }


        });
    },
    polyLine: function (curArr, curPage) {
        var that = this;
        var paths = [];
        var inPaths = [];
        for (var i in curArr) {
            inPaths.push([curArr[i]['longitude'], curArr[i]['latitude']]);
        }
        //paths.push(inPaths);
        //画线
        if (DrawPath.TrackGraphicLayer == this.TrackGraphicLayer) //为了防止请求时上一次的轨迹没清完
            esriMap.addPolyline(inPaths);
        if (this.polyineCount == 0) {
            var beginPoint = curArr[0];
            var beginMarkerGraphic = this.createMarker("../../static/image/sszhxt/begin.png", beginPoint);
            this.map.addOverlay(beginMarkerGraphic);
            this.vm.btnDisabled = true;
        }
        //终点
        if (this.polyineCount == curPage) {
            var endPoint = curArr[curArr.length - 1];
            var endMarkerGraphic = this.createMarker("../../static/image/sszhxt/end.png", endPoint);
            this.map.addOverlay(endMarkerGraphic);
            this.vm.btnDisabled = false; //轨迹画完播放按钮才能呈现激活状态
        }
        ++this.polyineCount;
    },
    createMarker: function (url, oPoint) {
        var iconUrl = url ? url : "../../static/image/sszhxt/locate.png";
        var curPoint = new BMap.Point(oPoint.longitude, oPoint.latitude);
        var myIcon = new BMap.Icon(iconUrl, new BMap.Size(45, 45));
        myIcon.setImageSize(new BMap.Size(45 / 2, 45 / 2));
        this.picSymbol = myIcon;
        var marker = new BMap.Marker(curPoint, {
            icon: myIcon
        });
        return marker;
    },
    addMarker: function (timeInterval, step) {
        var that = this;
        this.timer = setInterval(function () {
            for (var i = 0; i < that.markerGraphics.length; i++) {
                that.clearGraphicsByLayer(that.markerGraphics[i]); //清除上一次的蓝色标记
                that.markerGraphics.splice(i, 1);
                i--;
            }

            if (that.markerCount == (that.arrPoints.length)) {
                that.markerCount = 0;
                clearInterval(that.timer);
                that.vm.showPlayBtn = true;
                return false;
            }
            var curPoint = that.arrPoints[that.markerCount];
            var diviceInfo = (curPoint['deviceName'] || '-') + '(' + (curPoint['deviceId'] || '-') +
                ')';
            var deviceTiime = DrawPath.formatDate(curPoint['time']);
            var point = new BMap.Point(curPoint.longitude, curPoint.latitude);
            //蓝色标记物
            var markerGraphic = that.createMarker(null, curPoint);
            var label1 = new BMap.Label(diviceInfo, {
                offset: new BMap.Size(-40, 10),
                position: point
            });
            label1.setStyle({
                color: "#2f94fc",
                border: "none",
                'max-width': 'none'
            });
            var label2 = new BMap.Label(deviceTiime, {
                offset: new BMap.Size(-40, 30),
                position: point
            });
            label2.setStyle({
                color: "#2f94fc",
                border: "none",
                'max-width': 'none'
            });
            that.markerGraphics.push(label1, label2, markerGraphic);

            that.map.addOverlay(markerGraphic);
            that.map.addOverlay(label1);
            that.map.addOverlay(label2);
            if (!step) {
                step = 1;

            }
            that.markerCount = that.markerCount + step;
        }, timeInterval);
    },
    //这个是用于告警管理查看视频和画轨迹用的
    addMarkerByDuration2: function (timeStamp) {
        //console.log('timeStamp' + timeStamp);
        var that = this;
        for (var i = 0; i < that.leftPonts.length; i++) {
            if (timeStamp >= that.leftPonts[i]['time']) {
                for (var i = 0; i < that.markerGraphics.length; i++) {
                    that.clearGraphicsByLayer(that.markerGraphics[i]); //清除上一次的蓝色标记
                    that.markerGraphics.splice(i, 1);
                    i--;
                }
                that.markerCount = i;
                var curPoint = that.leftPonts[that.markerCount];
                var diviceInfo = (curPoint['deviceName'] || '-') + '(' + (curPoint['deviceId'] || '-') +
                    ')';
                var deviceTiime = DrawPath.formatDate(curPoint['time']);
                var point = new BMap.Point(curPoint.longitude, curPoint.latitude);
                //蓝色标记物
                var markerGraphic = that.createMarker(null, curPoint);
                var label1 = new BMap.Label(diviceInfo, {
                    offset: new BMap.Size(-40, 10),
                    position: point
                });
                label1.setStyle({
                    color: "#2f94fc",
                    border: "none",
                    'max-width': 'none'
                });
                var label2 = new BMap.Label(deviceTiime, {
                    offset: new BMap.Size(-40, 30),
                    position: point
                });
                label2.setStyle({
                    color: "#2f94fc",
                    border: "none",
                    'max-width': 'none'
                });
                that.markerGraphics.push(label1, label2, markerGraphic);

                that.map.addOverlay(markerGraphic);
                that.map.addOverlay(label1);
                that.map.addOverlay(label2);
                that.leftPonts = that.leftPonts.splice(i + 1);
                break;
            }
        }
    },
    removeLayer: function (layerId) {
        this.map.clearOverlays();
    },
    clearGraphicsByLayer: function (overlay) {
        this.map.removeOverlay(overlay);
    },
    resetLayerPos: function (centePpoint, zoom) {
        esriMap.setMapCenter(centePpoint.longitude, centePpoint.latitude, zoom);
    },
    addLine: function (arr, time, curPage) {
        var length = arr.length,
            count = 0,
            addLineTimer = null;
        var _this = this;
        addLineTimer = setInterval(function () {
            if (count == length - 1) {
                //  console.log(111);
                clearInterval(addLineTimer);
                // gjcxMap.setMapExtend(new esri.geometry.Polyline({
                //     "paths": gjcxMap.paths
                // }));
                return false;
            }
            //   console.log(count,arr[count]['longitude'],arr[count]['latitude']);

            var point1 = arr[count];
            var point2 = arr[++count];
            var arrTwoPoint = [point1, point2];
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
    var date = new Date(now);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var dat = date.getDate();
    var hour = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
    var mm = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
    var seconds = date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();
    return year + '-' + month + '-' + dat + "  " + hour + ":" + mm + ":" + seconds;
}