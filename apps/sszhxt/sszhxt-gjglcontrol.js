import avalon from 'avalon2';

import './sszhxt-gjglcontrol.css';
import {
    Gxxplayer
} from '../../vendor/gosunocx/gosunocx';
import {
    message,
    notification
} from 'ane';
// import { mapInitObj } from '../common/common-mapInit';
import {
    languageSelect
} from '../../services/configService';
import ajax from '../../services/ajaxService';
import DrawPath from '../common/common-map-drawpath';
import moment from 'moment';
import {
    gxxOcxVersion
} from '../../services/configService';

export const name = 'sszhxt-gjglcontrol';
let language_txt = require('../../vendor/language').language;
// const commonMap = require('../common/common-map.js');
let temptop = 0;


let vm = null;
let GisObject, graphicLayer, deviceSymbol, deviceInfo, infoContent, drawPathObj, iframeWin, player, markerTimer, getProcessTimer, tFileIds = [],
    fileIdIndex = 0;


avalon.component(name, {
    template: __inline('./sszhxt-gjglcontrol.html'),
    defaults: {
        isRealTimeView: false, //是不是从实时指挥那里告警点过来的
        isNotIE: false,
        $skipArray: [{
            gjglStore: {}
        }],
        speed: 1, //默认播放速度
        playing: false, //是否正在播放
        isStop: false,
        showPlayToolbar: false,
        areadyHandle: true,
        handleSosContent: "", //处理意见文本内容
        downloadTipShow: false, //是否显示下载插件弹框
        vedioIndex: 1, //当前播放录像下标
        vedioTotal: 0,
        showPlayStatus: false,
        isie: '',
        gjglcontrol_txt: getLan(),
        common_txt: getLanMain(),
        extra_class_dialog: languageSelect == "en" ? true : false,
        tipText:  getLanMain().needPlug,
        showtip: true,
        handelScroll(e){

        },
        onInit(event) {
            vm = event.vmodel;
            // mapInitObj.initCallback();
        },
        onReady() {
            vm.isie = isIE();
            let copyobj = {};
            // $(".sxzhxt-gjglcontrol").scroll(function () {
            //     let countTop;
            //     let top = $(".sxzhxt-gjglcontrol").scrollTop();
            //     let mapTop = $('.sszhxt-gjglcontrol-map').position().top;
            //     if(temptop > top){
            //         //说明鼠标往上滚了
            //         countTop = mapTop + top;
            //         if(countTop < 118){
            //             countTop = 118;
            //         }
            //     }else{
            //         countTop = mapTop - top;
            //         if(countTop < 70){
            //             countTop = 70;
            //         }
            //     }
            //     temptop = top;
            //     $('.sszhxt-gjglcontrol-map').css('top', countTop);
            // })
            //======================
            // mapInitObj.domReadyCallback(gjglMapObject.initMap,null,()=>{
            //     video.initOcx();
            // });
            if ($('#mapIframe')[0].contentWindow.esriMap) {
                $('#mapIframe')[0].contentWindow.esriMap.remove_overlay();
                $('#mapIframe')[0].contentWindow.esriMap.removeTrackLayer();
            }
            let data1 = sessionStorage.getItem('sszhxt-gjglcontrol') || sessionStorage.getItem('gjgl-gjglcontrol');
            let data = JSON.parse(data1);
            if (data.isGjgl == false) {
                //this.perInfoDetail = JSON.parse(data);
                //  copyobj= JSON.parse(data);
                copyobj = data;
                this.isRealTimeView = copyobj.isRealTimeView;
            } else {
                // let sosInfo = JSON.parse(data);
                // copyobj = sosInfo;
                let sosInfo = data;
                copyobj = sosInfo;
                vm.$skipArray[0].gjglStore = sosInfo;
                if (sosInfo.handleStatus == "HANDLED" || sosInfo.handleStatus == "OVERDUE")
                    this.areadyHandle = true;
                else
                    this.areadyHandle = false;
                sosInfo.handleStatus = changeData(sosInfo.handleStatus);
                if (!sosInfo.isRealTimeView)
                    this.perInfoDetail = sosInfo;
                // this.perInfoDetail = sosInfo;
                // this.isRealTimeView = !this.areadyHandle;
            }
            let flag = video.initOcx();
            if (this.isRealTimeView) {
                //请求最新的gps
                let pData = {
                    'devices': [copyobj.gbcode],
                    'deviceType': "DSJ"
                };
                ajax({
                    url: '/gmvcs/instruct/mapcommand/devicegps',
                    method: 'post',
                    data: pData
                }).then(result => {
                    if (result.code != 0) {
                        showMessage('warn', getLanMain().deviceF);
                        return;
                    }
                    if (result.data[copyobj.gbcode]) {
                        copyobj.longitude = result.data[copyobj.gbcode].longitude;
                        copyobj.latitude = result.data[copyobj.gbcode].latitude;
                        copyobj.handleStatus = changeData(copyobj.handleStatus);
                        this.perInfoDetail = copyobj;
                        result.data[copyobj.gbcode].gbcode = copyobj.gbcode;
                        result.data[copyobj.gbcode].isRealTimeView = true;
                        let mapTimer = setInterval(() => {
                            let frameWindow = document.getElementById("mapIframe").contentWindow;
                            if (frameWindow.loadMapCompelete) {
                                clearInterval(mapTimer);
                                $('#mapIframe')[0].contentWindow.esriMap.createMarker(result.data[copyobj.gbcode], true);
                            }
                        }, 200);

                        dzwlMapVm.lon = result.data[copyobj.gbcode].longitude; //保存改告警设备的经纬度，用于调度周围设备
                        dzwlMapVm.lat = result.data[copyobj.gbcode].latitude;
                        this.handleOcx(); //播放实时流
                    } else {
                        copyobj.longitude = '-';
                        copyobj.latitude = '-';
                        copyobj.handleStatus = changeData(copyobj.handleStatus);
                        this.perInfoDetail = copyobj;
                        dzwlMapVm.lon = 0;
                        dzwlMapVm.lat = 0;
                        showMessage('warn', getLanMain().equipmentOffline);
                    }
                });
                this.areadyHandle = false;
                vm.$skipArray[0].gjglStore.id = data.sosId;

            } else { //告警管理点击已处理
                dzwlMapVm.diaoduBtnToggle = false;
                if (flag !== false)
                    video.getFileIdAndPlay(vm.$skipArray[0].gjglStore.sosId);
                //   video.getFileIdAndPlay("GSOS6500000020180111111624fe0ffffeb");

                // let json = {
                //     deviceId: vm.perInfoDetail.gbcode,
                //     deviceType: "DSJ",
                //     day: vm.$skipArray[0].gjglStore.time
                // };
                // iframeWin = $('#mapIframe')[0].contentWindow;
                // drawPathObj = new iframeWin.DrawPath(json, GisObject, vm, getTrackTotal, getPageDeviceTrack);
                //     drawPathObj.draw();
                //     setTimeout(()=>{
                //         video.playByUrl();
                //         vm.playing = true;
                //     },100);                     


            }
            if ($('.popover ').length > 0) { //隐藏掉title浮层提示
                $('.popover ').hide();
            }
            $("[data-toggle='popover']").popoverX({
                trigger: 'manual',
                container: 'body',
                placement: 'auto right',
                //delay:{ show: 5000},
                html: 'true',
                content: function () {
                    return '<div class="title-content">' + $(this).attr('data-original-title') + '</div>';
                },
                animation: false
            }).off("mouseenter").on("mouseenter", (event) => {
                let target = event.target;
                if ($(target).text() === '-') {
                    return;
                }
                vm.titleTimer = setTimeout(() => {
                    $("[data-toggle='popover']").popoverX("hide");
                    $(target).popoverX("show");
                    $(".popover").off("mouseleave").on("mouseleave", (event) => {
                        $(target).popoverX('hide');
                    });
                }, 500);
            }).off("mouseleave").on("mouseleave", (event) => {
                let target = event.target;
                clearTimeout(vm.titleTimer);
                setTimeout(() => {
                    if (!$(".popover:hover").length) {
                        $(target).popoverX("hide");
                    }
                }, 100);
            });
            if(navigator.userAgent.indexOf("Chrome") > -1){
                dialogTaskAgainVm.drag = false;//谷歌下面获取不到offsetTop
            }
        },
        onDispose() {
            //mapInitObj.disposeCallback();
            // sessionStorage.removeItem('sszhxt-gjglcontrol');
            if (0 != player.getStatusByIndex(-1)) {
                player.stopRec(1); //结束视频
            }
            //player.stopTalk(sszhyyth.gbcode);
            sszhyyth.closesszhhyyth();
            $('#mapIframe')[0].contentWindow.esriMap.remove_overlay();
            if (!vm.isRealTimeView) {
                if (drawPathObj) {
                    drawPathObj.removeLayer(drawPathObj.curTrackId); //清除掉上次画的轨迹
                    drawPathObj.clearGraphicsByLayer(drawPathObj.markerId);
                    //drawPathObj.resetLayerPos({ longitude: 113.2693246420, latitude: 23.1520769760 }, 10);
                    clearInterval(markerTimer);
                }

            }
            $('.popover ').hide();

        },
        // 处理告警弹框
        dealWarning: function () {
            dialogTaskAgainVm.show = true;
        },
        dealWArningToggle: true,
        back() {
            if (!vm.isRealTimeView) {
                /* 已处理的告警轨迹返回---begin*/
                // if(drawPathObj.isGettingTrack){
                //     drawPathObj.isGettingTrack = false;
                //     drawPathObj.removeLayer(drawPathObj.curTrackId);//清除掉上次画的轨迹
                //     drawPathObj.clearTimer();
                //     drawPathObj.clearGraphicsByLayer(drawPathObj.markerId);
                //     drawPathObj.resetLayerPos({ longitude: 113.2693246420, latitude: 23.1520769760 }, 10);
                // }

                if (drawPathObj) {
                    drawPathObj.removeLayer(drawPathObj.curTrackId); //清除掉上次画的轨迹
                    drawPathObj.clearGraphicsByLayer(drawPathObj.markerId);
                    //drawPathObj.resetLayerPos({ longitude: 113.2693246420, latitude: 23.1520769760 }, 10);
                    clearInterval(markerTimer);
                }

                /* 已处理的告警轨迹返回--- end*/
            }

            avalon.router.navigate('/sszhxt-gjgl-gjcx', 2);
            sessionStorage.removeItem('sszhxt-gjglcontrol');
            sessionStorage.removeItem('gjgl-gjglcontrol');
        },
        //ocx点流或者是录像回放
        handleOcx() {
            if (this.isRealTimeView) {
                var gb = this.perInfoDetail.gbcode;
                //告警人点流
                ajax({
                    url: '/gmvcs/uom/ondemand/dsj/intranet/streamserver?requestType=play_realtime_video&deviceId=' + gb,
                    method: 'get',
                    data: null
                }).then(result => {
                    if (result.code == 1702) {
                        showMessage('error', getLanMain().equipmentOffline);
                        return;
                    } else if (result.code == 1701) {
                        showMessage('error', getLanMain().mediaF);
                        return;
                    } else if (result.code == 0) {
                        result.data.gbcode = gb;
                        let code = player.login(result.data); //先登录流媒体
                        if (code != 0) {
                            showMessage('error', getLanMain().mediaLoginF + code);
                            return;
                        }
                        code = player.playRec(result.data); //实时点流
                        if (code == -2) { //表示登录失败
                            return;
                        }
                        return code;
                    }
                })
            }
        },
        handleStepPre() {
            video.stepPre();
            this.playing = false;
        },
        handleSlower() {
            if (this.speed <= -16) {
                return;
            }
            video.slower();
            video.ctrlPlaySpeed(-1);
        },
        handlePlay(e) {
            if (this.playing) {
                video.pause();
                //  alert(1);
            } else {
                if (this.isStop) { //按了停止之后stop变为true
                    video.getFileIdAndPlay(vm.$skipArray[0].gjglStore.sosId);
                    //   alert(2);
                    // this.isStop = false;
                } else {
                    video.play();
                    //    alert(3)

                }
            }
            this.playing = !this.playing;
        },
        handleStop() {
            video.stop();
            this.playing = false;
            video.ctrlPlaySpeed(0);
            drawPathObj.removeLayer(drawPathObj.curTrackId); //清除掉上次画的轨迹
            drawPathObj.clearGraphicsByLayer(drawPathObj.markerId);
            //drawPathObj.resetLayerPos({ longitude: 113.2693246420, latitude: 23.1520769760 }, 9.95);
        },
        handleFaster() {
            if (this.speed >= 16) {
                return;
            }
            video.faster();
            video.ctrlPlaySpeed(1);
        },
        handleStepNext() {
            video.stepNext();
            this.playing = false;
        },
        perInfoDetail: {
            sosTime: '-',
            sosAddress: '-',
            sosPerson: '-', //username(usecode)
            gbcode: '-',
            latitude: '-',
            longitude: '-'
        }
    }
});

function isIE() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}
// 处理告警弹窗vm定义
const dialogTaskAgainVm = avalon.define({
    $id: 'gjgl-dealWarning-vm',
    title: getLan().tips,
    gjglcontrol_txt: getLan(),
    show: false,
    taskIdArr: [],
    drag: true,
    handleCancel(e) {
        this.show = false;
        $("#lala").hide();
    },
    extramove(a, b) {
        if(navigator.userAgent.indexOf("Chrome") <= -1){
            $('#lala').show();
        }
        $("#lala").css({
            top: a-80,
            left: b-140
        });
    },
    extraChromeHandle(ele,a,b){
        $(ele).css({
            bottom: 50,
            left:b,
            top:'auto'
        })
    },
    handleOk() {
        vm.dealWArningToggle = false;
        handleSos(vm.$skipArray[0].gjglStore.sosId, vm.handleSosContent).then((ret) => {
            if (ret.code != 0) {
                showMessage('error', getLan().fail_sos);
                return false;
            } else {
                showMessage('success', getLan().success_sos)
                let url = window.location.href;
                window.location.href = url.substring(0, url.lastIndexOf('/')) + "/sszhxt-gjgl-gjcx";
            }
        });
        this.show = false;
        $("#lala").hide();
        // 已处理的调度，出现轨迹，同时隐藏"调度"按钮
        vm.diaoduBtnToggle = false;
    },
    showMessage: showMessage
});
function compareString (str1, str2) {
    let num1 = [],num2 =[];
    num1 = str1.split('.');
    num2 = str2.split('.');
    let maxLength = num1.length>num2.length? num1.length : num2.length;
    for(var i =0;i<maxLength;i++){
        if(num1[i] === undefined){
            return false;
        }
        if(num2[i] === undefined){
            return true;
        }
        if(Number(num1[i]) > Number(num2[i])){
            return true;
        }else if(Number(num1[i]) < Number(num2[i])){
            return false;
        }else if(Number(num1[i]) == Number(num2[i])){
            continue;
        }
    }
    return false;
}

//===============================地图初始化部分========================================
// 地图
var dzwlMapVm = avalon.define({
    $id: 'gjglMapVm',
    // 调度
    diaoduBtnToggle: true,
    diaoduBtnText: getLan().scheduling,
    diaoduBtnTextToggle: true,
    lon: 0, //告警的经度
    lat: 0, //告警的维度
    addFun: function () {
        this.diaoduBtnTextToggle = !this.diaoduBtnTextToggle;
        if (!this.diaoduBtnTextToggle) {
            this.diaoduBtnText = getLan().cancle_det;
            if (this.lon == 0 || this.lat == 0) {
                return;
            }
            fetchNearbyDevice(this.lon, this.lat, 1000, function (arr) {
                if (arr.length <= 0) {
                    showMessage('warn',getLan().no_person);
                    return;
                }
                for (var i = 0; i < arr.length; i++) {
                    let data = {};
                    // data.sosPerson = arr[i].userName+'('+ arr[i].userCode+')';
                    // data.userName = arr[i].userName;
                    // data.battery = arr[i].battery;
                    // data.speed = arr[i].speed;
                    arr[i].gbcode = arr[i].deviceId;
                    arr[i].isRealTimeView = true;
                    // data.name = arr[i].deviceName;
                    // data.userCode = arr[i].userCode;
                    //gjglMapObject.addPeoples(data);
                    $('#mapIframe')[0].contentWindow.esriMap.createMarker(arr[i], false);
                }
                // gjglMapObject.setMapCenter(dzwlMapVm.lon, dzwlMapVm.lat,10);//缩小地图
                $('#mapIframe')[0].contentWindow.esriMap.setMapCenter(dzwlMapVm.lon, dzwlMapVm.lat, 10);
            });

        } else {
            this.diaoduBtnText = getLan().scheduling;
            //gjglMapObject.clearDiaodu(vm.perInfoDetail.gbcode);
            $('#mapIframe')[0].contentWindow.esriMap.clearDiaodu(vm.perInfoDetail.gbcode);
            $(".close").trigger("click");
        }
    },
    sszhthperson: '',
    sszhyyMinToggle: false,
    expandYyhj: function () {
        sszhyyth.sszhyytoggle = true;
        dzwlMapVm.sszhyyMinToggle = false;
    }
});
//地图信息窗口的vm
let sszhinfowindow = avalon.define({
    $id: "deviceInfoPop",
    call: function (gbcode, person, signal) {
        $(".close").trigger("click");
        ajax({
            url: '/gmvcs/uom/ondemand/dsj/intranet/streamserver?requestType=play_realtime_speak&deviceId=' + gbcode,
            method: 'get',
            data: null,
        }).then(result => {
            if (result.code == 1702) {
                showMessage('error', getLanMain().equipmentOffline);
                return;
            } else if (result.code == 1701) {
                showMessage('error', getLanMain().mediaF);
                return;
            } else if (result.code == 0) {
                result.data.gbcode = gbcode;
                let code = player.login(result.data); //先登录流媒体
                if (code != 0) {
                    showMessage('error', getLanMain().mediaLoginF + code);
                    return;
                }
                code = player.startTalk(result.data); //登录成功，进行语音呼叫
                if (code == -2) { //返回-2表示没有登录成功
                    return;
                } else if (code == -4) { //放回-4表示当前已有对讲，先关闭
                    showMessage('warn', getLanMain().voiceExist)
                    return;
                }
                sszhyyth.signal = signal;
                sszhyyth.gbcode = gbcode;
                sszhyyth.sszhthjy = "与警员" + person + "语音通话中";
                dzwlMapVm.sszhthperson = '<p class="sszhthmintitle" ><a :click="@expandYyhj($event)">' + sszhyyth.sszhthjy + '</a></p>';
                sszhyyth.sszhyytoggle = true;
                sszhyyth.countTime();
                return code;
            }
        })

    }
})
//语音通话窗口vm
let sszhyyth = avalon.define({
    $id: 'sszhyyth',
    sszhthjy: '',
    gbcode: '', //保存当前对讲的人
    $computed: {
        xhword: function () {
            if (sszhyyth.signal < 15) {
                return '差';
            } else if (sszhyyth.signal > 50) {
                return '良';
            } else {
                return '优';
            }
        }
    },
    signal: 0, //信号强度
    sszhyythtime: '00:00:00',
    // 通话时长
    countsszhythtime: 0,
    countTime: function () {
        let h, m, s;
        this.countsszhythtime = this.countsszhythtime + 1;
        h = parseInt(this.countsszhythtime / 3600);
        m = parseInt(this.countsszhythtime % 3600 / 60);
        s = parseInt(this.countsszhythtime % 3600 % 60);
        if (h < 10) {
            h = '0' + h;
        }
        if (m < 10) {
            m = '0' + m;
        }
        if (s < 10) {
            s = '0' + s;
        }
        this.sszhyythtime = h + ':' + m + ':' + s;
        this.countsszhythtimeObject = setTimeout(function () {
            sszhyyth.countTime();
        }, 1000);
    },
    sszhyytoggle: false,
    hidesszhyythaction: function () {
        dzwlMapVm.sszhyyMinToggle = true;
        sszhyyth.sszhyytoggle = false;
    },
    closesszhhyyth: function () {
        let code = player.stopTalk(this.gbcode);
        if (code == 0) {
            clearTimeout(this.countsszhythtimeObject);
            this.sszhyythtime = "00:00:00";
            this.countsszhythtime = 0;
            sszhyyth.sszhyytoggle = false;
            dzwlMapVm.sszhyyMinToggle = false;
            dzwlMapVm.sszhthperson = '';
        } else {
            showMessage('error', getLanMain().calledF);
        }
    },
    slience: function () {}
});


let markerArr = new Array; //标签数组
let labelArr = new Array; //文本数组
const gjglMapObject = {
    /* ---------------已处理点击--------------------*/
    timer: null,
    paths: [],
    timers: [], //用来存储画线定时器句柄
    polyineCount: 0,
    polyLineEndCount: 0,
    /* ---------------已处理点击--------------------*/
    initMap: function () {
        //   dojo.require("esri.toolbars.draw");
        dojo.require("extras.MapInitObject");
        dojo.require("extras.utils.GPSConvertor");

        dojo.require("esri/geometry/Point");
        dojo.require("esri/geometry/Polyline");
        dojo.require("esri/symbols/PictureMarkerSymbol");
        dojo.require("esri/symbols/TextSymbol");
        dojo.require("esri/symbols/Font");
        dojo.require("esri/graphic");
        dojo.require("esri/InfoTemplate");
        dojo.require("esri/layers/GraphicsLayer");
        dojo.require("esri/toolbars/draw");
        dojo.require("esri/geometry/webMercatorUtils");
        dojo.require("esri/symbols/SimpleLineSymbol");
        dojo.require("esri/symbols/SimpleMarkerSymbol");

        dojo.require("esri/Color");

        dojo.ready(function () {
            // GisObject = new extras.MapInitObject("gjgl-map");
            // GisObject.setMapOptions({
            //     logo: false,
            //     extent: "11501488.165446503, 3695866.152885527, 11678516.32295504, 3728734.075048165",
            //     level: 2,
            //     center: [113.2643446427, 23.1290765766]
            // });
            // GisObject.addDefaultLayers();

            GisObject = new extras.MapInitObject("gjgl-map");
            GisObject.setMapOptions({
                logo: false,
                level: 2,
                center: [113.2693246420, 23.1520769760],
                zoom: 10
            });
            GisObject.addDefaultLayers();
            //    GisObject.map.setZoom(8);
            //点击告警列表已处理,然后画轨迹
            //       if(!vm.isRealTimeView){
            //           setTimeout(()=>{
            //             let json = {
            //                 deviceId:  vm.$skipArray[0].gjglStore.sosDeviceId,
            //                 deviceType: "DSJ",
            //                 day:vm.$skipArray[0].gjglStore.time || 1514192754000
            //             };
            //             drawPathObj = new DrawPath(json, GisObject, vm, getTrackTotal, getPageDeviceTrack);
            //             drawPathObj.draw();
            //       },1000); 
            //    }

            //实时指挥过来地图画标记点
            // if(vm.isRealTimeView){
            //     if (vm.perInfoDetail.longitude && vm.perInfoDetail.latitude) {
            //         //经纬度存在，画点
            //         setTimeout(function () {
            //             gjglMapObject.addPeoples(vm.perInfoDetail);
            //         }, 2000)
            //
            //     }
            // }
        });
    },
    // 画轨迹
    printPath: function () {
        GisObject.layerDraw.addPolyline([
            [113.26, 23.12],
            [113.28, 23.1315],
            [113.31, 23.11393]
        ]);
    },
    // 警员
    addPeoples: function (data) {
        let point = extras.utils.GPSConvertor.gcj_encrypt(parseFloat(data.latitude), parseFloat(data.longitude));
        data.latitude = point.lat;
        data.longitude = point.lon;
        let deviceAttr = {
            "policeName": data.sosPerson,
            "deviceNum": data.name + '(' + data.gbcode + ')',
            "leftPower": data.battery,
            // "leftVolume": '3GB(总容量5GB)',
            "speed": data.speed,
            "signal": '4G'
        };
        graphicLayer = new esri.layers.GraphicsLayer();
        GisObject.map.addLayer(graphicLayer);

        infoContent = '<div class="deviceInfoContainer" :controller="deviceInfoPop">民警/警号：${policeName}<br/>设备名称/国标编号：${deviceNum}<br/>剩余电量：${leftPower}<br />速度：${speed}<br />信号：${signal}<br /><button class="callBtn" :click="@call(\'' + data.gbcode + '\',\'' + data.sosPerson + '\')">语音呼叫</button></div>';
        deviceInfo = new esri.InfoTemplate('设备信息', infoContent);
        deviceSymbol = new esri.symbols.PictureMarkerSymbol({
            "type": "esriPMS", //点位图片展示
            "angle": 0, //旋转角度
            "height": 19, //高度
            "width": 13, //宽度
            "xoffset": 0, //x偏移量
            "yoffset": 8, //y偏移量
            "url": "../../static/image/sszh-lxhf/locate.png" //图片访问路径
        });
        let cruPoint = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(point.lon, point.lat));
        if (data.sosPerson) {
            let ls = new esri.symbols.TextSymbol(data.sosPerson).setColor(new esri.Color([4, 128, 209, 0.9])).setFont(new esri.symbol.Font("12px").setWeight(esri.symbol.Font.WEIGHT_BOLD)).setOffset(-25, -20).setAlign(esri.symbol.TextSymbol.ALIGN_START);
            let pointLabel = new esri.graphic(cruPoint, ls);
            // pointLabel.id  = data.userCode;
            // pointLabel.name= data.userName;
            // pointLabel.dev = data.deviceId;
            pointLabel.gbcode = data.gbcode;
            labelArr.push(pointLabel);
            //GisObject.map.graphics.add(pointLabel);
            GisObject.toolbar.drawLayer.add(pointLabel);
        }
        let marker = new esri.Graphic(cruPoint, deviceSymbol, deviceAttr, deviceInfo);
        marker.gbcode = data.gbcode;
        // marker.acountId = data.accountId;
        markerArr.push(marker);
        //GisObject.addPictureMarker(cruPoint.x,cruPoint.y, deviceSymbol, deviceAttr, deviceInfo);
        GisObject.toolbar.drawLayer.add(marker);
        GisObject.map.infoWindow.on("show", function () {
            avalon.scan(document.getElementsByClassName('deviceInfoContainer')[0]);
        });

        gjglMapObject.setMapCenter(point.lon, point.lat, 13);

    },
    setMapCenter: function (lon, lat, levels) {
        //设置地图中心点
        let point = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(parseFloat(lon), parseFloat(lat)));
        GisObject.map.centerAndZoom(point, levels);
    },
    clearDiaodu: function (gbcode) { ///删除标记物
        let markerTmp;
        for (let i = 0; i < markerArr.length; i++) {
            markerTmp = markerArr[i];
            if (markerTmp.gbcode != gbcode) //不删掉告警警员
            {
                gjglMapObject.map.infoWindow.hide();
                gjglMapObject.toolbar.drawLayer.remove(markerTmp);
                //GisObject.map.graphics.remove(markerTmp);
                markerArr.splice(i--, 1);
            }
        }
        for (let j = 0; j < labelArr.length; j++) {
            markerTmp = labelArr[j];
            if (markerTmp.gbcode != gbcode) {
                gjglMapObject.toolbar.drawLayer.remove(markerTmp);
                //GisObject.map.graphics.remove(markerTmp);
                labelArr.splice(j--, 1);
            }
        }
        $(".close").trigger("click");
    },
}

//===============================ocx初始化部分========================================
let video = {
    initOcx: function () {
        player = new Gxxplayer();
        var ocxele = document.getElementById("video-ocxobject");
        // if (!ocxele.object) {
        //     vm.downloadTipShow = true;
        //     return  false;
        // }
        if (vm.isie && !ocxele.object || !vm.isie && undefined == ocxele.GS_ReplayFunc) {
            $('#video-ocxobject').css({
                'z-index': -9999,
                'position': 'relative'
            });
            vm.tipText = getLanMain().needPlug;
            vm.downloadTipShow = true;
            vm.showtip = true;
            vm.isNotIE = true;
            return;
        }
        // 初始化播放器
        player.init({
            'element': 'video-ocxobject',
            'viewType': vm.isRealTimeView ? 0 : 1,
            'proxy': _onOcxEventProxy
        });
        let version =  player.getVersion();
        if (compareString(gxxOcxVersion, version)) {
            $('#video-ocxobject').css({
                'z-index': -9999,
                'position': 'relative'
            });
            vm.tipText = getLanMain().updateOcxTip.replace(/\$rep1|\$rep2/gi,function(matched){
                return {
                    $rep1: version,
                    $rep2: gxxOcxVersion
                }[matched]
            });
            // vm.tipText = vm.extra_class_dialog ? 'Version of your GXX media player plug-in is ' + version + 'and the latest is' + gxxOcxVersion + '. Please download the latest version.' : '您的高新兴视频播放器插件版本为' + version + '，最新版为' + gxxOcxVersion + '，请下载最新版本';
            vm.downloadTipShow = true;
            vm.showtip = false;
            return;
        }
        // player.showVideotapeProcess(1);
    },
    getFileIdAndPlay: function (sosId) {
        getFileIdsBySosId(sosId).then((ret) => {
            if (ret.code == 0) {
                if (ret.data.length == 0) {
                    showTips('warn', getLan().notFileID);
                    return false;
                }
                let data = ret.data;
                vm.showPlayStatus = true;
                vm.vedioTotal = ret.data.length;
                tFileIds = data.map(function (item) {
                    return item['rid'];
                });
                setTimeout(function () {
                    video.playByUrl(tFileIds[0]);
                }, 2500)

            } else {
                showTips('error', getLan().reqFileF);
            }
        });
    },
    playByUrl: function (fileId) {
        //  alert(fileId);
        getSosVideo(fileId).then(result => {
            if (result.code !== 0) {
                showTips('error', result.msg);
                return;
            } else if (result.data.length == 0) {
                showTips('warn', getLanMain().notVideoPlay);
                return;
            }
            //显示播放控制条
            vm.showPlayToolbar = true;
            let ocxInfo = result.data[0].ocxvideoInfo;
            let opt = {
                "ssIp": ocxInfo.ip,
                "ssPort": ocxInfo.port,
                "ssUsername": ocxInfo.account,
                "ssPasswd": ocxInfo.password
            };

            let code = player.loginVod(opt); //先登录流媒体
            if (code != 0) {
                showTips('error',  getLanMain().videoServiceF + code);
                return;
            }
            code = player.playVideotape(ocxInfo.playUrl, moment(ocxInfo.startTime).format("YYYY-MM-DD HH-mm-ss"), moment(ocxInfo.endTime).format("YYYY-MM-DD HH-mm-ss"));
            if (code == -2) { //表示登录失败
                showTips('error', getLanMain().loginF);
                return;
            }
            player.showVideoClose(0);
            player.SoundCtrl(1,1,2);
            vm.playing = true;
            let json = {
                deviceIds: [vm.perInfoDetail.gbcode],
                deviceType: "DSJ",
                day: vm.$skipArray[0].gjglStore.time,
                startTime: ocxInfo.startTime,
                //  startTime: '1515237865000',
                endTime: ocxInfo.endTime
                //  endTime: '1515237926000'

            };
            iframeWin = $('#mapIframe')[0].contentWindow;
            let timerT = setInterval(() => { //防止刷新时报错
                if (iframeWin.loadMapCompelete) {
                    if (iframeWin.DrawPath) {
                        clearInterval(timerT);
                        drawPathObj = new iframeWin.DrawPath(json, GisObject, vm, getTrackTotal, getPageDeviceTrack, getDeviceTrackByDuration, player);
                        drawPathObj.drawPathByDuration();
                        getProcess(drawPathObj);
                        //   let markerTimer =  setInterval(()=>{
                        //      let timestamp = player.getPlayTimeStamp();
                        //      if(timestamp == 0){
                        //         clearInterval(markerTimer);
                        //         drawPathObj.clearGraphicsByLayer(drawPathObj.markerId);
                        //      }
                        //     drawPathObj.addMarkerByDuration2(timestamp);
                        //   },200);
                    }
                }
            }, 200);

        });
    },
    play: function () {
        player.controlVideotape(0, 0, 0, 1);
        getProcess(drawPathObj);
    },
    pause: function () {
        player.controlVideotape(1, 0, 0, 1);
        clearInterval(markerTimer);
    },
    stop: function () {
        player.controlVideotape(9, 0, 0, 1);
        //  clearInterval(getProcessTimer);
    },
    faster: function () {
        player.controlVideotape(2, 0, 0, 1);
    },
    slower: function () {
        player.controlVideotape(3, 0, 0, 1);
    },
    stepNext: function () {
        player.controlVideotape(4, 0, 0, 1);
    },
    stepPre: function () {
        player.controlVideotape(10, 0, 0, 1);
    },
    ctrlPlaySpeed: function (mode) {
        if (mode === 1) {
            if (vm.speed > 0) {
                vm.speed = vm.speed * 2;
            } else {
                let speed = vm.speed / 2;
                vm.speed = speed === -1 ? 1 : speed;
            }
        } else if (mode === -1) {
            if (vm.speed <= 1) {
                vm.speed = -(Math.abs(vm.speed) * 2);
            } else {
                vm.speed = vm.speed / 2;
            }
        } else {
            vm.speed = 1;
        }
    },
    closeAllVideoTape() {
        player.closeAllVideoTape();
    },
    getVideotapeProcess() {
        return player.getVideotapeProcess(1);
    },
    getPlayTimeStamp() {
        return player.getPlayTimeStamp();
    }
};

function getProcess(drawPathObj) {
    markerTimer = setInterval(() => {
        let timestamp = player.getPlayTimeStamp();
        if (timestamp == 0 && vm.isStop == true) {
            fileIdIndex = 0;
            vm.playing = false;
            vm.showPlayStatus = false;
            vm.vedioIndex = 1;
            clearInterval(markerTimer);
            // alert(11)
        } else if (timestamp == 0) {
            vm.playing = false;
            drawPathObj.clearGraphicsByLayer(drawPathObj.markerId);
            drawPathObj.removeLayer(drawPathObj.curTrackId); //清除掉上次画的轨迹
            //  alert(22)
            ++fileIdIndex;
            vm.vedioIndex = fileIdIndex;
            vm.vedioIndex++;
            if (fileIdIndex > tFileIds.length - 1) {
                vm.isStop = true; //播完后isStop变成true,才能重头第一个开始播
                vm.showPlayStatus = false;
                vm.vedioIndex = 1;
                clearInterval(markerTimer);
                return false;
            }
            video.playByUrl(tFileIds[fileIdIndex]);
            clearInterval(markerTimer);
        };
        drawPathObj.addMarkerByDuration2(timestamp);
    }, 200);

}

function _onOcxEventProxy(data) {
    var ret = eval('(' + data + ')'); //每次操作acx都会回调这里
    if (ret.action == 'ReplayCtrl') { //录像控制的回调
        let mode = ret.data.nCtrlType;
        let timestamp;
        switch (mode) {
            case 9: //停止
                vm.isStop = true;
                // vm.playing = false;
                break;
            case 7: //进度条
                timestamp = video.getPlayTimeStamp();
                //console.log(timestamp + '进度条');
                break;
            case 2: //快放
                timestamp = video.getPlayTimeStamp();
                //console.log(timestamp + '快放');
                break;
            case 4: //单帧前进
                timestamp = video.getPlayTimeStamp();
                //console.log(timestamp + '单帧前进');
                break;
            case 3: //慢放
                timestamp = video.getPlayTimeStamp();
                //console.log(timestamp + '慢放');
                break;
            case 10: //单帧后退
                timestamp = video.getPlayTimeStamp();
                //console.log(timestamp + '单帧后退');
                break;

        }


    }
}


function changeData(str) {
    let status = {
        HANDLED: getLanGjgl().treated,
        WAITING: getLanGjgl().unTreated,
        OVERDUE: getLanGjgl().overdue,
        ALL: getLanGjgl().all
    }
    return status[str]
}

avalon.filters.formatDate2 = formatDate;
avalon.filters.formatTitleDate2 = function (obj) {
    return {
        title: formatDate(obj['title']),
        'data-toggle': 'popover'
    };
};

//时间戳转日期
function formatDate(now) {
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
// 接口
/* 处理一条告警管理信息 */
function handleSos(sosId, opinion) {
    let data = {};
    data.id = sosId;
    data.opinion = opinion;
    return ajax({
        url: '/gmvcs/instruct/sos/handle',
        method: 'post',
        cache: false,
        data: data
    });
}
//根据gps获取周围的在线设备
function fetchNearbyDevice(lon, lat, radius, callback) {
    let arr = []; //保存设备
    ajax({
        url: '/gmvcs/instruct/track/gps/around?lon=' + lon + '&lat=' + lat + '&radius=' + radius,
        method: 'get',
        data: null
    }).then(result => {
        if (result.code != 0) {
            showMessage('warn', getLan().fetchNearbyDeviceF);
            return;
        }
        let pData = {
            'devices': result.data,
            'deviceType': "DSJ"
        };
        ajax({
            url: '/gmvcs/instruct/mapcommand/devicegps',
            method: 'post',
            data: pData
        }).then(result => {
            if (result.code != 0) {
                showMessage('warn', getLan().fetchNearbyDeviceF);
                return;
            }
            avalon.each(result.data, function (i, el) {
                if (el.deviceId != vm.perInfoDetail.gbcode) {
                    arr.push(el);
                }

            });
            callback && callback(arr);
        });
    });
}

/*获取设备的gps轨迹信息数据总量 */
function getTrackTotal(json) {
    return ajax({
        url: '/gmvcs/instruct/track/count/gps',
        method: 'post',
        data: json
    });
}
/* 根据设备Id获取分页轨迹 */
function getPageDeviceTrack(json, page, pageSize) {
    return ajax({
        url: '/gmvcs/instruct/track/page/gps',
        method: 'post',
        data: {
            deviceId: json.deviceId,
            deviceType: json.deviceType,
            day: json.day,
            page: page,
            pageSize: pageSize
        }
    });
}
/* 按时间段获取设备的gps轨迹信息 */
function getDeviceTrackByDuration(json, page, pageSize) {
    return ajax({
        url: '/gmvcs/instruct/track/gps/range',
        method: 'post',
        data: {
            deviceIds: json.deviceIds,
            deviceType: json.deviceType,
            day: json.day,
            beginTime: json.startTime,
            endTime: json.endTime

        }
    });
}

function getFileIdsBySosId(sosId) {
    return ajax({
        url: '/gmvcs/instruct/sos/file4g?id=' + sosId,
        // url: '/gmvcs/uom/file/sos/getVODInfo?vFileIds=GMSOS6500000020180106192413ff2fffffd',
        method: 'get',
        cache: false,
        data: null
    });
};

function getSosVideo(fileId) {
    return ajax({
        // url: '/gmvcs/uom/file/sos/getVODInfo?vFileIds=' + encodeURIComponent(sosId),
        url: '/gmvcs/uom/file/sos/getVODInfo?vFileIds=' + fileId,
        // url: '/gmvcs/uom/file/sos/getVODInfo?vFileIds=GMSOS6500000020180106192413ff2fffffd',
        method: 'get',
        cache: false,
        data: null
    });
}

function getAutoVideo() {
    return ajax({
        url: '/gmvcs/uom/file/auto/getVODInfo?vFileIds=GMAUTO6500000020180106132344ff4ffffff',
        method: 'get',
        cache: false,
        data: null
    });
}

function showTips(type, content, layout, duration) {
    notification[type]({
        title: getLan().kindlyReninder,
        message: content,
        layout: layout || 'topRight',
        timeout: duration || 1500
    });
}
//提示框提示
function showMessage(type, content) {
    notification[type]({
        title: getLanMain().notification,
        message: content
    });
}

function getLanMain () {
    return language_txt.sszhxt.main;
}

function getLan () {
    return language_txt.sszhxt.sszhxt_gjglcontrol;
} 

function getLanGjgl () {
    return language_txt.sszhxt.sszhxt_gjgl;
}