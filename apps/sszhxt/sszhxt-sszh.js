import * as avalon from 'avalon2';
import {
    createForm,
    notification
} from 'ane';
import {
    isAllowSpeak,
    isAllowVideo,
    isAllowRecord,
    isAllowLock,
    isAllowPhotograph,
    mapType,
    gxxOcxVersion,
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;
import ajax from '../../services/ajaxService';
import {
    Gxxplayer
} from "/vendor/gosunocx/gosunocx";
//import {mapInitObj} from '../common/common-mapInit';
const storage = require('../../services/storageService.js').ret;
// import io from 'socket.io-client';
require("../common/common-sszh-voiceTool.js");

let echarts = require("echarts/dist/echarts.min");
import '/services/filterService';
import '../../vendor/jquery/jquery.SuperSlide.2.1.1';

import {
    Gm
} from '/apps/common/common-tools';

import * as menuService from '../../services/menuService';

function Tools() {};
Tools.prototype = Object.create(new Gm().tool);
let Gm_tool = new Tools();

require("./sszhxt-sszh.css");
export const name = 'sszhxt-sszh';
let player, ocxele; //播放器
let updatemarkerArr = new Array; //地图更新标签数组
let DuoupdatemarkerArr = new Array; //地图多通道更新标签数组
let speakPerson = {}; //语音窗口当前对讲的人
let updatemarkerTime;
let vm = null,
    zTreeObj,
    echart;
// var latitude = 23.00;
// var longitude = 113.27;
var longinPersonOrgpath, longinPersonUid; //保存当前登录用户的部门path,用于sos对比部门
var sszh = avalon.component(name, {
    template: __inline('./sszhxt-sszh.html'),
    defaults: {
        isie: '',
        recentData: [],
        downloadTipShow: false,
        downloadTipTxt: getLanMain(),
        tipText: getLanMain().needPlug,
        showtip: true,
        useSearch: false,
        // showmap(e){
        //     if(e.keyCode == 13){
        //         $('.sszhxt-sszh-map').show();
        //     }
        //
        // },
        // hidemap(e){
        //     if(e.keyCode == 13){
        //         $('.sszhxt-sszh-map').hide();
        //     }
        //
        // },
        getShowStatus(show) {
            vm.downloadTipShow = show;
        },
        handleTreeCheck(event, treeId, treeNode, center) {
            if (treeNode.checked == false) {
                removerUpdatemarkerArr(treeNode.gbcode);
                if (sszhdeviceInfo.gbcode == treeNode.gbcode) {
                    sszhdeviceInfo.visible = false;
                }

                return;
            }
            // 选中后重置红色人脸布控和车牌布控图标为蓝色
            if (treeNode.checked) {
                sszhrlbk_vm.gbcode = '';
                cpbk.gbcode = '';
            }
            let pData, url;
            //分执法仪和多通道设备
            if (treeNode.mytype == 0) {
                pData = {
                    'devices': [treeNode.gbcode],
                    'deviceType': "DSJ"
                };
                url = '/gmvcs/instruct/mapcommand/devicegps';
            } else {
                pData = [treeNode.gbcode]
                url = '/gmvcs/uom/device/listByGbcodeList?attachChannelInfo=true';
            }

            ajax({
                url: url,
                method: 'post',
                data: pData
            }).then(result => {
                if (result.code != 0) {
                    notification.warn({
                        title: getLan().notification,
                        message: getLanMain().deviceF
                    });
                    return;
                }
                // result.data[treeNode.gbcode].latitude = 24.12;
                // result.data[treeNode.gbcode].longitude = 113.12;
                //多通道设备的接口放回值不一致，处理
                if (treeNode.mytype != 0) {
                    // result.data[treeNode.gbcode] = result.data[treeNode.gbcode][0];
                    result.data[treeNode.gbcode].source = result.data[treeNode.gbcode].platformGbcode;
                }
                if (!result.data[treeNode.gbcode].latitude || !result.data[treeNode.gbcode].longitude) {
                    let newData = result.data;
                    avalon.each(newData, function (index, item) {
                        item.gbcode = treeNode.gbcode;
                        //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
                        item.mytype = treeNode.mytype;
                        item.sosSource = treeNode.sosSource;
                        item.businessId = treeNode.businessId;
                    });
                    if (treeNode.sosSource == "FACE_MONITORING") {
                        sszhrlbk_vm.show(newData[treeNode.gbcode]);
                        return;
                    } else if (treeNode.sosSource == "CAR_MONITORING") {
                        cpbk.show(newData[treeNode.gbcode]);
                        return;
                    }

                    if (!center) {
                        notification.warn({
                            title: getLan().notification,
                            message: getLan().devNoGPS
                        });
                        return;
                    }
                    // result.data[treeNode.gbcode].latitude = latitude;
                    // result.data[treeNode.gbcode].longitude = longitude;
                    // latitude+=0.02;
                    // longitude+=0.02;
                    sszhdeviceInfo.gbcode = treeNode.gbcode;
                    if (result.data[treeNode.gbcode].userName == "") {
                        sszhdeviceInfo.username = '';
                    } else {
                        sszhdeviceInfo.username = result.data[treeNode.gbcode].userName;
                    }
                    if (result.data[treeNode.gbcode].userCode == "") {
                        sszhdeviceInfo.usercode = '-';
                    } else {
                        sszhdeviceInfo.usercode = result.data[treeNode.gbcode].userCode;
                    }
                    if (!result.data[treeNode.gbcode].capacityUsed) {
                        sszhdeviceInfo.capacityUsed = 0;
                    } else {
                        sszhdeviceInfo.capacityUsed = result.data[treeNode.gbcode].capacityUsed;
                    }
                    if (!result.data[treeNode.gbcode].capacityTotal) {
                        sszhdeviceInfo.capacityTotal = 0;
                    } else {
                        sszhdeviceInfo.capacityTotal = result.data[treeNode.gbcode].capacityTotal;
                    }
                    if (!result.data[treeNode.gbcode].battery) {
                        sszhdeviceInfo.battery = 0;
                    } else {
                        sszhdeviceInfo.battery = Number(result.data[treeNode.gbcode].battery);
                    }
                    if (!result.data[treeNode.gbcode].source) {
                        sszhdeviceInfo.source = false;
                    } else {
                        sszhdeviceInfo.source = true;
                    }
                    //type只有多通道，外域执法仪和多通道设备都是显示一样的
                    sszhdeviceInfo.devName = result.data[treeNode.gbcode].name || result.data[treeNode.gbcode].deviceName;
                    sszhdeviceInfo.devmodel = result.data[treeNode.gbcode].model;
                    //这个表示外域执法仪
                    if (treeNode.mytype == 0) {
                        sszhdeviceInfo.type = '执法仪';
                    }
                    if (treeNode.mytype != 0) {
                        sszhdeviceInfo.type = result.data[treeNode.gbcode].type;
                        sszhdeviceInfo.gbcodeArr = result.data[treeNode.gbcode].channelSet;
                    }
                    sszhdeviceInfo.mytype = treeNode.mytype;
                    sszhdeviceInfo.signal = result.data[treeNode.gbcode].signal == undefined ? 0 : result.data[treeNode.gbcode].signal;
                    sszhdeviceInfo.lockStatus = result.data[treeNode.gbcode].locked == undefined ? 0 : result.data[treeNode.gbcode].locked;
                    sszhdeviceInfo.videoStatus = result.data[treeNode.gbcode].videoStatus;
                    if (sszhdeviceInfo.videoStatus == 1 && sszhdeviceInfo.$recordArr.indexOf(sszhdeviceInfo.gbcode) == -1) {
                        sszhdeviceInfo.$recordArr.push(sszhdeviceInfo.gbcode);
                    }
                    sszhdeviceInfo.visible = true;
                    sszhdeviceInfo.isAllowRecord = isAllowRecord;
                    sszhdeviceInfo.isAllowPhotograph = isAllowPhotograph;
                    sszhdeviceInfo.isAllowLock = isAllowLock;
                    sszhdeviceInfo.isAllowSpeak = isAllowSpeak;
                    return;
                }
                //保存一个坐标点，用于缩小地图使用
                vm.lon = result.data[treeNode.gbcode].longitude;
                vm.lat = result.data[treeNode.gbcode].latitude;

                avalon.each(result.data, function (index, item) {
                    item.gbcode = treeNode.gbcode;
                    //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
                    item.mytype = treeNode.mytype;
                    item.sosSource = treeNode.sosSource;
                    item.businessId = treeNode.businessId;
                })
                createUpdatemarkerArr(result.data[treeNode.gbcode], center);
            });
        },
        extraProcessWhenExpand(i, value) {
            isShowMap(i, value); //是否在地图上有标记点
        },
        extraProcessWhenPersonChange(node) {
            removerUpdatemarkerArr(node.gbcode); //不在线清楚地图标注
        },
        extraHandleWhenCheckOrg() {
            if (vm.lon == '' || vm.lat == '') {
                return;
            }
            $('#mapIframe')[0].contentWindow.esriMap.setMapCenter(vm.lon, vm.lat, 8);
        },
        returnTreeObj(a) {
            zTreeObj = a;
        },
        handleDeviceClick(el, event) { //点击最近人员设备
            if (el.commandType == 'USER') {
                return;
            }
            el.checked = null;
            this.handleTreeCheck(event, '', el);
        },
        handlePersonDeviceClick(item, event) {
            let obj = {};
            obj.gbcode = item;
            obj.checked = null;
            this.handleTreeCheck(event, '', obj);
        },
        lon: '',
        lat: '',
        sszhmapobj: '',
        toolUse: true,
        setcity() {
            sszhmap.showcityName = avalon.components['common-sszh-mapcity'].defaults.nowcity;
            this.lon = avalon.components['common-sszh-mapcity'].defaults.lon;
            this.lat = avalon.components['common-sszh-mapcity'].defaults.lat;
            //保存当前点击的城市
            avalon.vmodels['sszhxt_vm'].$cityDetailobj.nowClickcity = sszhmap.showcityName;
        },
        ocxindex: 1, //ocx窗口值
        soundLevel: 80,
        //音量调节
        handleSoundLevel(v) {
            //须先开启声音
            player.SoundCtrl(1, 1, 1);
            player.setVolume(v);
        },
        onInit(event) {
            vm = event.vmodel;
            vm.isie = isIE();
            window._onOcxEventProxy = _onOcxEventProxy;
            $('.sszhxt-sszh-map').show();

        },
        onReady() {
            //用户设置的默认城市
            sszhmap.showcityName = avalon.vmodels['sszhxt_vm'].$cityDetailobj.nowClickcity;
            this.lon = avalon.vmodels['sszhxt_vm'].$cityDetailobj.lon;
            this.lat = avalon.vmodels['sszhxt_vm'].$cityDetailobj.lat;
            updatemarkerTime = setInterval(function () {
                refreshTimed(); //地图点更新函数
            }, 5000);
            if ($('#mapIframe')[0].contentWindow.esriMap) {
                $('#mapIframe')[0].contentWindow.esriMap.remove_overlay();
                $('#mapIframe')[0].contentWindow.esriMap.removeTrackLayer();
            }
            //======================


            //=======================
            let data = storage.getItem('sszhxt-SOS');
            if (data) this.handleTreeCheck('', '', data, true);
            // setInterval(function () {
            //     let z =  Number($("#regOcxDiv1").attr('z-index')) || 0;
            //     $("#regOcxDiv1").attr('z-index',  z +100 );
            //     console.log('z-index',  z);
            // }, 100);
            initOcx();

            let tooltipsDom = $("[data-toggle='popover']");
            Gm_tool.showPopover(tooltipsDom);

            //  获取查询权限
            menuService.menu.then(menu => {
                let list = menu.SSZH_MENU_SSZHXT;
                avalon.each(list, (index, el) => {
                    if (el == 'INSTRUCT_FUNCTION_SSZH_SEARCH') {
                        this.useSearch = true;
                    }
                })
            })

        },
        onDispose() {
            $('.mapcity_popup_main').hide();
            updatemarkerArr = [];
            if (vm.isie && ocxele.object || !vm.isie && undefined != ocxele.GS_ReplayFunc) { //防止没有安装ocx报错
                //清除掉ocx点流的所有操作
                if (speakPerson.gbcode) {
                    sszhyyth.closesszhhyyth();
                }
                if (0 != player.getStatusByIndex(-1)) {
                    player.stopRec(1); //结束视频
                    if (starttalkType) {
                        player.stopTalk(sszhsp.gbcode); //结束音频
                    } else {
                        player.stopTSTalk(sszhsp.gbcode); //结束音频
                    }

                }
            }
            avalon.each(sszhmap.devhtmllist, function (index, item) {
                clearInterval(item.timeobj); //清除定时器
            });
            clearInterval(updatemarkerTime); //地图更新定时器
            //停止所有录像
            stopRecordByarr(getRecordDevice());
            //sszhgjxxManage.gjxxlist = [];
            //退出的时候先清除地图所有标记
            $('#mapIframe')[0].contentWindow.esriMap.remove_overlay();
            storage.removeItem('sszhxt-SOS');
            sszhdeviceInfo.visible = false;
        }
    }
});
//无gps定位信息
var sszhdeviceInfo = avalon.define({
    $id: 'sszhdeviceInfo',
    extra_class: languageSelect == "en" ? true : false,
    sszhdeviceInfo_txt: getLan(),
    source: false,
    visible: false,
    username: '',
    usercode: '',
    gbcode: '',
    signal: '',
    battery: 0,
    mytype: '',
    capacityUsed: 0,
    capacityTotal: 0,
    lockStatus: 0,
    videoStatus: 0,
    disabled: '',
    $recordArr: [],
    width: '',
    usedWidth: 0,
    spanTwowidth: 0,
    syrl: 0,
    zrl: 0,
    lockword: '',
    type: '', //设备类型名字
    devName: '', //设备名称
    devmodel: '', //外域设备显示设备型号
    gbcodeArr: '', //通道数组
    isAllowRecord: '', //允许录像
    isAllowLock: '', //允许锁定
    isAllowPhotograph: '', //允许拍照
    isAllowSpeak: '', //允许语音
    $computed: {
        width: function () {
            return this.battery / 100 * 29
        },
        usedWidth: function () {
            if (this.capacityUsed && this.capacityTotal) {
                return this.capacityUsed / this.capacityTotal * 180;
            }
            return 0;
        },
        spanTwowidth: function () {
            if (this.usedWidth != 0) {
                return this.usedWidth / 4 + 90;
            } else {
                return 100;
            }
        },
        lockword: function () {
            if (this.lockStatus == 0) {
                return getLan().lock;
            } else {
                return getLan().unlock;
            }
        },
        disabled: function () {
            if (this.lockStatus == 0) {
                return '';
            } else {
                return 'disabled';
            }
        }
    },
    hideInfo() {
        this.visible = false;
    },
    record() {
        let data = {};
        let optCmd;
        if (this.videoStatus == 0) {
            optCmd = 'Start';
        } else {
            optCmd = 'Stop';
        }

        ajax({
            url: '/gmvcs/uom/device/dsj/control/record?deviceId=' + sszhdeviceInfo.gbcode + '&optCmd=' + optCmd,
            method: 'post',
            data: null
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    title: getLan().notification,
                    message: getLan().operationF
                });
                return;
            }
            if (optCmd == 'Start') {
                notification.success({
                    title: getLan().notification,
                    message: getLan().startVideoS
                });
                sszhdeviceInfo.videoStatus = 1;
                if (sszhdeviceInfo.$recordArr.indexOf(sszhdeviceInfo.gbcode) == -1) {
                    sszhdeviceInfo.$recordArr.push(sszhdeviceInfo.gbcode);
                }
            } else {
                notification.success({
                    title: getLan().notification,
                    message: getLan().stopVideoS
                });
                sszhdeviceInfo.videoStatus = 0;
                if (sszhdeviceInfo.$recordArr.indexOf(sszhdeviceInfo.gbcode) != -1) {
                    sszhdeviceInfo.$recordArr.splice(sszhdeviceInfo.$recordArr.indexOf(sszhdeviceInfo.gbcode), 1);
                }
            }
        })
    },
    vedioplay() {
        sszhinfowindow.playVideo(this.gbcode, this.username, this.usercode, this.signal, this.devName, this.mytype, this.gbcodeArr);
    },
    startTalk() {
        let username = this.username || this.devName;
        let usercode = this.usercode || this.devmodel;
        sszhinfowindow.startTalk(this.gbcode, username, usercode, this.signal, this.mytype);
    },
    photograph() {
        let data = {};
        ajax({
            url: '/gmvcs/uom/device/dsj/control/photo?deviceId=' + sszhdeviceInfo.gbcode,
            method: 'post',
            data: null
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    title: getLan().notification,
                    message: getLan().shotFailed
                });
                return;
            }
            notification.success({
                title: getLan().notification,
                message: getLan().shotSuccess
            });
        });
    },
    lock() {
        let data = {};
        let optCmd;
        if (this.lockStatus == 0) {
            optCmd = 'Lock';
        } else {
            optCmd = 'Unlock';
        }
        ajax({
            url: '/gmvcs/uom/device/dsj/control/lock?deviceId=' + sszhdeviceInfo.gbcode + '&optCmd=' + optCmd,
            method: 'post',
            data: null
        }).then((ret) => {
            if (ret.code == 0) {
                if (optCmd == "Lock") {
                    notification.success({
                        title: getLan().notification,
                        message: getLan().lockS
                    });
                    sszhdeviceInfo.lockStatus = 1;
                    sszhdeviceInfo.disabled = 'disabled';
                    changeTreeImg(sszhdeviceInfo.gbcode, true);
                    return;
                } else {
                    notification.success({
                        title: getLan().notification,
                        message: getLan().unlockS
                    });
                    sszhdeviceInfo.lockStatus = 0;
                    sszhdeviceInfo.disabled = '';
                    changeTreeImg(sszhdeviceInfo.gbcode, false);
                    return;
                }

            }
            notification.error({
                title: getLan().notification,
                message: getLan().lockF
            });
        })
    }
})


//判断是否有设备正在录像
function getRecordDevice() {
    var deviceobject = $('#mapIframe')[0].contentWindow.esriMap.getRecordData();
    var arr = [];
    avalon.each(deviceobject, function (key, value) {
        if (value.record == true || value.record == 'true') {
            arr.push(key);
        }
    });
    arr = arr.concat(sszhdeviceInfo.$recordArr);
    if (arr.length <= 0) return;
    return arr;
}
//循环停止录像
function stopRecordByarr(arr) {
    avalon.each(arr, function (index, val) {
        ajax({
            url: '/gmvcs/uom/device/dsj/control/record?deviceId=' + val + '&optCmd=Stop',
            method: 'post',
            data: null
        }).then(result => {
            if (result.code != 0) {
                return;
            }
        });
    })
}

function isIE() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

function isShowMap(i, value) {
    for (var j = 0, len = updatemarkerArr.length; j < len; j++) {
        if (updatemarkerArr[j].gbcode == value.gbcode) {
            value.checked = true;
            return;
        } else {
            value.checked = false;
            return;
        }
    }

    return false;
}

//操作标记数组的函数
function controlMarkerArr(marker) {
    for (var i = 0; i < updatemarkerArr.length; i++) {
        let markerTmp = updatemarkerArr[i];
        if (markerTmp.gbcode == marker.gbcode) {
            updatemarkerArr.splice(i--, 1);
            updatemarkerArr.push(marker); //将点击后的地图标记更新点放在最后面
            break;
        }
    }
}
/*
 *  新建地图更新点
 * */
function createUpdatemarkerArr(data, center) {
    removerUpdatemarkerArr(data.gbcode); //这里是为了防止它从最近人员那里点击
    //initMapObject.createMarker(data, center);
    //语音对讲是否出现
    data.isAllowSpeak = isAllowSpeak;
    data.isAllowVideo = isAllowVideo;
    data.isAllowRecord = isAllowRecord;
    data.isAllowLock = isAllowLock;
    data.isAllowPhotograph = isAllowPhotograph;
    $('#mapIframe')[0].contentWindow.esriMap.createMarker(data, center);
    let marker = {};
    // marker.dev = data.deviceId;
    marker.gbcode = data.gbcode;
    //执法仪的
    if (data.mytype == 0) {
        updatemarkerArr.push(marker); //将地图点加入更新数组
    } else {
        //多通道的
        DuoupdatemarkerArr.push(marker);
    }

}

/**
 * 删除更新标记数组的单个点
 */
function removerUpdatemarkerArr(gbcode) {
    var markerTmp;
    //执法仪的
    for (var i = 0; i < updatemarkerArr.length; i++) {
        markerTmp = updatemarkerArr[i];
        if (markerTmp.gbcode == gbcode) {
            //initMapObject.removerMarker(gbcode);
            $('#mapIframe')[0].contentWindow.esriMap.removerMarker(gbcode);
            updatemarkerArr.splice(i--, 1);
            break;
        }
    }
    //多通到的
    for (var i = 0; i < DuoupdatemarkerArr.length; i++) {
        markerTmp = DuoupdatemarkerArr[i];
        if (markerTmp.gbcode == gbcode) {
            //initMapObject.removerMarker(gbcode);
            $('#mapIframe')[0].contentWindow.esriMap.removerMarker(gbcode);
            DuoupdatemarkerArr.splice(i--, 1);
            break;
        }
    }
}
/*
 * 更新标记数组的点
 * */
function updateMapMarkers(data) {
    let arr = [];
    arr = updatemarkerArr.concat([]);
    arr.concat(DuoupdatemarkerArr);
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < data.length; j++) {
            if (arr[i].gbcode != undefined && data[j].gbcode != undefined && arr[i].gbcode == data[j].gbcode && data[i].latitude && data[i].longitude) {
                removerUpdatemarkerArr(data[i].gbcode);
                // 标记更新点是否是来自告警信息
                if (data[i].gbcode == sszhrlbk_vm.gbcode) {
                    data[i].showType = "FACE_MONITORING";
                    data[i].executeControlClick = sszhrlbk_vm.executeControlClick;
                }
                if (data[i].gbcode == cpbk.gbcode) {
                    data[i].showType = "CAR_MONITORING";
                    data[i].executeControlClick = cpbk.executeControlClick;
                }
                createUpdatemarkerArr(data[i], false);
                break;
            }
        }
    }
}
/*
 *获取更新点的数据
 * duo表示是否是更新多通道的点
 * */
function getUpdateMarkerData(devArr, duo) {
    if (devArr.length == 0) {
        return;
    }
    let pData, url;
    if (!duo) {
        pData = {
            'devices': devArr,
            'deviceType': "DSJ"
        };
        url = '/gmvcs/instruct/mapcommand/devicegps';
    } else {
        pData = devArr;
        url = '/gmvcs/uom/device/listByGbcodeList?attachChannelInfo=true';
    }

    ajax({
        url: url,
        method: 'post',
        data: pData
    }).then(result => {
        if (result.code != 0) {
            notification.warn({
                title: getLan().notification,
                message: getLanMain().deviceF
            });
            return;
        }
        let arr = [];
        if (!duo) {
            for (var i = 0; i < devArr.length; i++) { //按照我自己想要的顺序更新点，不能用avalon.each，这个不按照顺序输出的
                var key = devArr[i];
                avalon.each(updatemarkerArr, function (i, el) {
                    if (result.data[key].deviceId == el.gbcode) {
                        result.data[key].gbcode = el.gbcode;
                        //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
                        result.data[key].mytype = 0;
                        arr.push(result.data[key]);
                    }
                })
            }
        } else {
            for (var i = 0; i < devArr.length; i++) { //按照我自己想要的顺序更新点，不能用avalon.each，这个不按照顺序输出的
                var key = devArr[i];
                //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
                if (result.data[key].type == '快速布控') {
                    result.data[key].mytype = 1;
                } else if (result.data[key].type == '移动车载终端') {
                    result.data[key].mytype = 2;
                } else {
                    result.data[key].mytype = 3;
                }
                arr.push(result.data[key]);
            }
        }
        if (arr.length <= 0) return;
        // arr[0].latitude = latitude;
        // arr[0].longitude = longitude;
        // latitude+=0.02;
        // longitude+=0.02;
        updateMapMarkers(arr, true);
        avalon.each(sszhmap.devhtmllist, function (index, item) {
            avalon.each(result.data, function (i, el) {
                if (!el.signal) el.signal = 0;
                if (speakPerson.gbcode && speakPerson.gbcode == el.gbcode) {
                    sszhyyth.signal = el.signal; //语音窗口signal
                }
                if (item.gbcode == el.gbcode) {
                    item.signal = el.signal; //更新视频窗口信号强度
                    return;
                }
            })

        });
    })
}
/*
 * 获取多通道更新点的数据
 * */
function getUpdateMarkerDataDuo(devArr) {
    if (devArr.length == 0) {
        return;
    }
    ajax({
        url: '/gmvcs/uom/device/listByGbcodeList?attachChannelInfo=false',
        method: 'post',
        data: devArr
    }).then(result => {
        if (result.code != 0) {
            notification.warn({
                title: getLan().notification,
                message: getLan().deviceMF
            });
            return;
        }


    })
}

/*
 *  定时刷新点调用函数
 * */
function refreshTimed() {
    let postdevArr = [];
    avalon.each(updatemarkerArr.slice(0, updatemarkerArr.length), function (i, v) {
        postdevArr.push(v.gbcode);
    })
    let postdevArrDuo = [];
    avalon.each(DuoupdatemarkerArr.slice(0, DuoupdatemarkerArr.length), function (i, v) {
        postdevArrDuo.push(v.gbcode);
    })
    getUpdateMarkerData(postdevArr);
    //多通道更新
    getUpdateMarkerData(postdevArrDuo, true);
}

/*
 *  改变部门树图标样式函数
 */
function changeTreeImg(gbcode, symbol) {
    var node = zTreeObj.getNodesByParam("gbcode", gbcode, null)
    if (node) {
        symbol ? node[0].icon = '/static/image/sszhxt/locked.png' : node[0].icon = '/static/image/sszhxt/device_online.png';
    }
    zTreeObj.updateNode(node[0]);
}

//========================================地图======================================
let sszhmap = avalon.define({
    $id: 'sszhmap',
    extra_class: languageSelect == "en" ? true : false,
    sszhmap_txt: getLan(),
    sszhthmintitletoggle: false,
    sszhyyhtml: [],
    devhtmllist: [],
    //sszhthmintitle : this.sszhyyhtml + this.sszhsphtml,
    expandsszhyy: function (e) {
        $(".sszhyythmincontianer").hide(100, function () {
            $("#sszhyyth").show(300);
        });
    },
    locate(item) { //点击语音地图定位
        let pData, url;
        //分执法仪和多通道设备
        if (item.mytype == 0) {
            pData = {
                'devices': [item.gbcode],
                'deviceType': "DSJ"
            };
            url = '/gmvcs/instruct/mapcommand/devicegps';
        } else {
            pData = [item.gbcode]
            url = '/gmvcs/uom/device/listByGbcodeList?attachChannelInfo=true';
        }
        ajax({
            url: url,
            method: 'post',
            data: pData
        }).then(result => {
            if (result.code != 0) {
                notification.warn({
                    title: getLan().notification,
                    message: result.msg
                });
                return;
            }
            //多通道设备的接口放回值不一致，处理
            //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
            if (item.mytype != 0) {
                // result.data[item.gbcode] = result.data[item.gbcode][0];
                result.data[item.gbcode].source = result.data[item.gbcode].platformGbcode;
            }
            if (!result.data[item.gbcode].latitude || !result.data[item.gbcode].longitude) {

                sszhdeviceInfo.gbcode = item.gbcode;
                if (result.data[item.gbcode].userName == "") {
                    sszhdeviceInfo.userame = '-';
                } else {
                    sszhdeviceInfo.username = result.data[item.gbcode].userName;
                }
                if (result.data[item.gbcode].userCode == "") {
                    sszhdeviceInfo.usercode = '-';
                } else {
                    sszhdeviceInfo.usercode = result.data[item.gbcode].userCode;
                }
                if (!result.data[item.gbcode].capacityUsed) {
                    sszhdeviceInfo.capacityUsed = 0;
                } else {
                    sszhdeviceInfo.capacityUsed = result.data[item.gbcode].capacityUsed;
                }
                if (!result.data[item.gbcode].capacityTotal) {
                    sszhdeviceInfo.capacityTotal = 0;
                } else {
                    sszhdeviceInfo.capacityTotal = result.data[item.gbcode].capacityTotal;
                }
                if (!result.data[item.gbcode].battery) {
                    sszhdeviceInfo.battery = 0;
                } else {
                    sszhdeviceInfo.battery = result.data[item.gbcode].battery;
                }
                if (!result.data[item.gbcode].source) {
                    sszhdeviceInfo.source = false;
                } else {
                    sszhdeviceInfo.source = true;
                }

                //type只有多通道，外域执法仪和多通道设备都是显示一样的
                sszhdeviceInfo.devName = result.data[item.gbcode].name || result.data[item.gbcode].deviceName;
                sszhdeviceInfo.devmodel = result.data[item.gbcode].model;
                //这个表示外域执法仪
                //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
                if (item.mytype == 0) {
                    sszhdeviceInfo.type = '执法仪';
                }
                if (item.mytype != 0) {
                    sszhdeviceInfo.type = result.data[item.gbcode].type;
                    sszhdeviceInfo.gbcodeArr = result.data[item.gbcode].channelSet;
                }
                sszhdeviceInfo.mytype = item.mytype;
                sszhdeviceInfo.signal = result.data[item.gbcode].signal == undefined ? 0 : result.data[item.gbcode].signal;
                sszhdeviceInfo.lockStatus = result.data[item.gbcode].locked == undefined ? 0 : result.data[item.gbcode].locked;
                sszhdeviceInfo.videoStatus = result.data[item.gbcode].videoStatus;
                if (sszhdeviceInfo.videoStatus == 1 && sszhdeviceInfo.$recordArr.indexOf(sszhdeviceInfo.gbcode) == -1) {
                    sszhdeviceInfo.$recordArr.push(sszhdeviceInfo.gbcode);
                }
                sszhdeviceInfo.visible = true;
                sszhdeviceInfo.isAllowRecord = isAllowRecord;
                sszhdeviceInfo.isAllowPhotograph = isAllowPhotograph;
                sszhdeviceInfo.isAllowLock = isAllowLock;
                sszhdeviceInfo.isAllowSpeak = isAllowSpeak;
                return;
            }
            avalon.each(result.data, function (index, el) {
                el.gbcode = item.gbcode;
                el.mytype = item.mytype;
            })
            createUpdatemarkerArr(result.data[item.gbcode], true);
        })
    },
    expandsszhsp(item) {
        sszhsp.hidesszhspth(); //将之前的的人hide，显示在左侧栏
        sszhsp.sszhspthtime = item.time;
        // sszhsp.dev = item.dev;
        sszhsp.gbcode = item.gbcode;
        sszhsp.signal = item.signal;
        if (item.mytype != 0) {
            sszhsp.name = item.name;
            sszhsp.deviceName = item.name;
            if (item.mytype == 1) {
                sszhsp.deviceType = getLan().wirelessCamera;
            } else if (item.mytype == 2) {
                sszhsp.deviceType = getLan().vehicleCamera;
            } else {
                sszhsp.deviceType = getLan().UAV;
            }

        } else {
            if (!item.username) {
                sszhsp.name = getLan().talking.replace(/\$rep/g, item.name);
            } else {
                let repName = item.username + '(' + item.usercode + ')';
                sszhsp.name = getLan().talking.replace(/\$rep/g, repName);
            }
            // if (languageSelect == "zhcn") {
            //     if (!item.username) {
            //         sszhsp.name = "与" + item.name + "视频通话中";
            //     } else {
            //         sszhsp.name = "与" + item.username + '(' + item.usercode + ')' + "视频通话中";
            //     }
            // } else {
            //     if (!item.username) {
            //         sszhsp.name = "Talking to " + item.name;
            //     } else {
            //         sszhsp.name = "Talking to " + item.username + '(' + item.usercode + ')';
            //     }
            // }

        }
        // sszhsp.name = "与" + item.username + '(' + item.usercode + ')' + "视频通话中";
        sszhsp.playVideo(item.childGbcode);
        sszhsp.checkItem = item.childGbcode;
        sszhsp.showsszhspth = true;
        //不显示工具
        if (item.mytype != 0) {
            sszhsp.isShowTools = true;
            sszhsp.gbcodeArr = item.devArr;
            $(".sszhspth").css({
                'z-index': 9999,
                'width': 1000,
                'height': '500'
            });
        } else {
            sszhsp.isShowTools = false;
            $(".sszhspth").css({
                'z-index': 9999,
                'width': '730',
                'height': '530'
            });
        }
        $('#npGSVideoPlugin').css({
            'z-index': 999
        });
        //隐藏对应的左侧栏
        avalon.each(this.devhtmllist, function (index, item) {
            if (item.gbcode == sszhsp.gbcode) {
                item.show = false;
            }
        });
    },
    loadingtoggle: true,
    toggleshow: function () {
        $(".sszhgj").hide(100, function () {
            $(".sszhgjxx").show(500); //用avalon的animate会出现切换导航的过程中触发enter,leave动画，换为jquery。
        });

    },
    togglehide: function () {
        $(".sszhgjxx").hide(500, function () {
            $(".sszhgj").show(100);
        });
    },
    move: function (e) {
        let d = e.target.offsetParent; //父元素
        let w = d.scrollWidth; //父元素宽度
        let h = d.offsetHeight;
        dargObject.move(d, e, w, h);
    },
    showtool() {
        $(".mapcljl").toggle(100);
    },
    showcitylist() {
        $('.mapcity_popup_main').toggle(200);
    },
    mearsurelength() {
        //initMapObject.measureLength();
        $('#mapIframe')[0].contentWindow.esriMap.measureLength();
    },
    showBkfw() {
        bkfwVm.show = true;
    },
    mapsearchvalue: getLan().enterNID, //地图搜索
    placeholderstatue: 0,
    showmapclose: false,
    $computed: {
        showmapclose: function () {
            if (this.placeholderstatue != 0) {
                return true;
            } else {
                return false;
            }
        },
        placeholderstatue: function () {
            if (this.mapsearchvalue != '' && this.mapsearchvalue != getLan().enterNID) {
                return 1;
            } else {
                return 0;
            }
        }
    },
    emptyinput(event) {
        this.mapsearchvalue = '';
        this.placeholderstatue = 0;
        $("#mapsearch").focus();
    },
    focusinput() {
        if (this.mapsearchvalue != '' && this.placeholderstatue != 0) {
            this.placeholderstatue = 1; //表示显示x,0不显示x
        } else {
            this.emptyinput();
        }
    },
    restoretip(e) {
        e.preventDefault();
        $("#mapsearch").blur();
        if (this.mapsearchvalue == '') {
            this.mapsearchvalue = getLan().enterNID;
            this.placeholderstatue = 0;
        }
    },
    mapsearch() {
        if ($.trim(this.mapsearchvalue) == '' || this.placeholderstatue == 0) {
            return;
        }
        let data = {};
        data = sszhmap.mapsearchvalue;
        ajax({
            url: '/gmvcs/uom/device/dsj/dsjInfo',
            method: 'post',
            data: data
        }).then(result => {
            if (result.code != 0) {
                notification.warn({
                    title: getLan().notification,
                    message: getLan().notFound
                });
                return;
            } else if (result.data.length <= 0) {
                notification.warn({
                    title: getLan().notification,
                    message: getLan().notFound
                });
                return;
            } else {
                var devarr = [];
                for (var i = 0; i < result.data.length; i++) {
                    if (result.data[i].online == 0) {
                        devarr.push(result.data[i].gbcode);
                    }
                }
                if (devarr.length <= 0) {
                    notification.warn({
                        title: getLan().notification,
                        message: getLan().noOnline
                    });
                    return;
                }
                let pData = {
                    'devices': devarr,
                    'deviceType': "DSJ"
                };
                ajax({
                    url: '/gmvcs/instruct/mapcommand/devicegps',
                    method: 'post',
                    data: pData
                }).then(result => {
                    if (result.code != 0) {
                        notification.warn({
                            title: getLan().notification,
                            message: getLanMain().deviceF
                        });
                        return;
                    }
                    if (JSON.stringify(result.data) == '{}') {
                        notification.warn({
                            title: getLan().notification,
                            message: getLan().devNoGPS
                        });
                        return;
                    }
                    let point = {};
                    avalon.each(result.data, function (index, item) {
                        item.gbcode = item.deviceId;
                        createUpdatemarkerArr(item, false); //不把地图中心定位到这个人
                        point.lon = item.longitude;
                        point.lat = item.latitude;
                    })
                    //initMapObject.setMapCenter(point.lon, point.lat,8);//缩小地图层级，
                    $('#mapIframe')[0].contentWindow.esriMap.setMapCenter(point.lon, point.lat, 8);
                });
            }
        })
    },
    handleQuickSearch(event) {
        if (event.keyCode == 13) {
            this.mapsearch();
        }
    },
    showcityName: "广州",
    citylocate(event) {
        let city = event.target.innerText;
        let lon = avalon.vmodels['sszhxt_vm'].$cityDetailobj.cityobj[city].lon;
        let lat = avalon.vmodels['sszhxt_vm'].$cityDetailobj.cityobj[city].lat;
        $('#mapIframe')[0].contentWindow.esriMap.setMapCenter(lon, lat, 10);
    }
});
let starttalkType = 0;
//视频播放
let sszhsp = avalon.define({
    $id: 'sszhdtspck',
    sszhsp_txt: getLan(),
    name: '',
    word: getLan().voice,
    ifallowtalk: isAllowSpeak,
    $computed: {
        xhword: function () {
            if (sszhsp.signal < 15) {
                return getLan().weak;
            } else if (sszhsp.signal > 50) {
                return getLan().fine;
            } else {
                return getLan().great;
            }
            // if (languageSelect == "zhcn") {
            //     if (sszhsp.signal < 15) {
            //         return '差';
            //     } else if (sszhsp.signal > 50) {
            //         return '良';
            //     } else {
            //         return '优';
            //     }
            // } else {
            //     if (sszhsp.signal < 15) {
            //         return 'Weak';
            //     } else if (sszhsp.signal > 50) {
            //         return 'Fine';
            //     } else {
            //         return 'Great';
            //     }
            // }
        }
    },
    signal: 0, //信号强度
    dev: '',
    gbcode: '', //表示窗口的gbcode,执法仪gbcode跟childGbcode一样，多通道时这个是父的gbcode
    childGbcode: '', //正在点流的gbcode,多通道是就是某个通道的gbcode
    deviceName: '', //设备名称
    deviceType: '', //设备类型
    gbcodeArr: [], //通道数组
    isShowTools: false, //是否显示右侧工具
    showToolBtn: false, //是否显示控制按钮
    checkItem: '', //选择的通道
    oldCheckItem: '', //之前选择的通道，用于对比现在点的通道是不是跟之前一样
    isMove: false, //鼠标是否按下
    imgClientx: 0, //鼠标按下的位置
    imgMoveX: 125, //图标移动的距离
    imgStartx: 125, //图标开始的left值
    mytype: '', //设备类型mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
    checkIndexFn(e, item) {
        //进行点流操作
        let v = e.target.value;
        if (v == this.oldCheckItem) {
            return;
        }
        this.oldCheckItem = v;
        this.playVideo(v);
        let _this = this;
        avalon.each(sszhmap.devhtmllist, function (index, value) {
            //判断是否显示控制按钮
            if (value.gbcode == item.deviceGbcode) {
                if (item.PTZControllable == 1) {
                    _this.showToolBtn = true;
                } else {
                    _this.showToolBtn = false;
                }
                v.childGbcode = value.gbcode;
            }
        })
        //sszhinfowindow.playVideo(item.deviceGbcode, '','',this.signal, this.deviceName, this.mytype,this.gbcodeArr);
    },
    moveImg(e) {
        let x;
        if (this.isMove) {
            if (e.clientX - this.imgClientx >= 0) {
                x = this.imgStartx + e.clientX - this.imgClientx;
                if (x >= 240) {
                    this.imgMoveX = 240;
                    return;
                }
                this.imgMoveX = x;
            } else {
                x = this.imgStartx - Math.abs(e.clientX - this.imgClientx);
                if (x <= 0) {
                    this.imgMoveX = 0;
                    return;
                }
                this.imgMoveX = x;
            }
        }
    },
    moveUpImg(e) {
        this.isMove = false;
    },
    moveDownImg(e) {
        this.isMove = true;
        this.imgClientx = e.clientX;
        this.imgStartx = this.imgMoveX;
    },
    showsszhspth: true,
    sszhyycontrol: 1,
    sszhsptalkcontrol: false, //false表示没有语音对讲，true表示有
    sszhsptalkword: '对讲',
    closesszhspth() {
        //this.showsszhspth =false;
        $(".sszhspth").css({
            'z-index': 0
        });
        $('#npGSVideoPlugin').css({
            'z-index': 0
        });
        $('.sszhxt-sszh-map').show();
        if (0 != player.getStatusByIndex(-1)) {
            player.stopRec(1); //结束视频
        }
        if (speakPerson.gbcode != this.childGbcode) { //不能关闭了人家单独点开的语音
            if (starttalkType) {
                player.stopTSTalk(this.gbcode); //结束音频
            } else {
                player.stopTalk(this.gbcode); //结束音频
            }
        }
        this.sszhsptalkcontrol = false;
        this.sszhsptalkword = '对讲';
        this.sszhyycontrol == 1;
        //this.word ='开启';
        //删除对应的左侧栏
        avalon.each(sszhmap.devhtmllist, function (index, item) {
            if (item.gbcode == sszhsp.gbcode) {
                clearInterval(item.timeobj); //清除定时器
                sszhmap.devhtmllist.removeAt(index);
                return;
            }
        });
        this.gbcode = '';
        this.sszhspthtime = "00:00:00";
    },
    hidesszhspth() {
        //this.showsszhspth =false;
        $(".sszhspth").css({
            'z-index': 0
        });
        $('#npGSVideoPlugin').css({
            'z-index': 0
        });
        //$('.sszhxt-sszh-map').show();
        //因为公用ocx，最小化的时候其实是关闭流的，点开在重连
        if (0 != player.getStatusByIndex(-1)) {
            player.stopRec(1); //结束视频
        }
        if (speakPerson.gbcode != this.childGbcode) { //不能关闭了人家单独点开的语音
            if (starttalkType) {
                player.stopTSTalk(this.gbcode); //结束音频
            } else {
                player.stopTalk(this.gbcode); //结束音频
            }
        }

        this.sszhsptalkcontrol = false;
        this.sszhsptalkword = '对讲';
        this.sszhyycontrol == 1;
        //this.word ='开启';
        //显示对应的左侧栏
        avalon.each(sszhmap.devhtmllist, function (index, item) {
            if (item.gbcode == sszhsp.gbcode) {
                item.show = true;
            }
        });

    },
    sszhspthtime: "00:00:00",
    slient() {
        player.SoundCtrl(1, this.sszhyycontrol, 1);
        if (this.sszhyycontrol === 0) {
            this.sszhyycontrol = 1;
            this.word = '开启';
        } else {
            this.sszhyycontrol = 0;
            this.word = '静音';
        }
        return this.sszhyycontrol;
    },
    controlDuoTalk(gbcode, operate) {
        let url = "/gmvcs/uom/device/dsj/control/ptt";
        let method = "post";
        let params = {
            "gbcode": gbcode,
            "operateType": operate
        };

        return ajax({
            url: url,
            method: method,
            data: params,
        });
    },
    // 多通道语音对讲
    srartTalkByDuo(gbcode, symbol, callback) {
        player.stopTSTalk(gbcode); //结束音频
        // this.controlDuoTalk(gbcode, "CLOSE").then(result => {
        //     // if(result.code != 0) {
        //     //     notification.warn({
        //     //         title: getLan().notification,
        //     //         message: "结束语音失败"
        //     //     });
        //     // }
        // });

        this.controlDuoTalk(gbcode, "OPEN").then(result => {
            if (result.code == 1702) {
                notification.error({
                    title: getLan().notification,
                    message: '设备不在线'
                });
                return;
            } else if (result.code == 1701) {
                notification.error({
                    title: getLan().notification,
                    message: '获取流媒体信息失败'
                });
                return;
            } else if (result.code == 1900) {
                notification.warn({
                    title: getLan().notification,
                    message: result.msg
                });
                return;
            } else if (result.code == 0) {

                var code = player.startTSTalk(result.data.streamUrl); //登录成功，进行语音呼叫
                if (code == -2) { //返回-2表示没有登录成功
                    return;
                } else if (code == -4) { //放回-4表示当前已有对讲，先关闭
                    notification.warn({
                        title: getLan().notification,
                        message: '当前已经有语音对讲，请先关闭'
                    });
                    return;
                }
                if (code != 0) {
                    notification.error({
                        title: getLan().notification,
                        message: getLan().callF
                    });
                    return;
                }
                if (!symbol) {
                    this.sszhsptalkcontrol = true;
                    this.sszhsptalkword = '结束';
                }

                callback && callback(code);
                return code;
            }
        });
    },
    starttalk(gbcode, symbol, callback) { //symbol用来判断这个语音是点击视屏的语音还是地图那边调用的语音
        var gb = gbcode;
        if (!symbol) {
            gb = this.gbcode;
        }
        if (!symbol && this.sszhsptalkcontrol) {
            var code;
            if (starttalkType) {
                code = player.stopTSTalk(this.gbcode); //结束音频
            } else {
                code = player.stopTalk(this.gbcode); //结束音频
            }

            if (code == 0) {
                this.sszhsptalkcontrol = false;
                this.sszhsptalkword = '对讲';
            } else {
                notification.error({
                    title: getLan().notification,
                    message: getLanMain().calledF
                });
            }
            return;
        }
        ajax({
            url: '/gmvcs/uom/ondemand/dsj/intranet/streamserver?requestType=play_realtime_speak&deviceId=' + gb,
            method: 'get',
            data: null,
        }).then(result => {
            if (result.code == 1702) {
                notification.error({
                    title: getLan().notification,
                    message: getLanMain().equipmentOffline
                });
                sszhyyth.sszhyytoggle = false; //关闭对讲窗口
                return;
            } else if (result.code == 1701) {
                notification.error({
                    title: getLan().notification,
                    message: getLanMain().mediaF
                });
                sszhyyth.sszhyytoggle = false; //关闭对讲窗口
                return;
            } else if (result.code == 0) {
                result.data.gbcode = gb;
                let code = null;
                if (result.data.gb28181Mode && result.data.gb28181Mode == 1) {
                    starttalkType = 1;
                    code = player.startTSTalk(result.data.playURL); //无需登录直接语音
                } else {
                    starttalkType = 0;
                    code = player.login(result.data); //先登录流媒体
                    if (code != 0) {
                        notification.error({
                            title: getLan().notification,
                            message: getLanMain().mediaLoginF + code
                        });
                        sszhyyth.sszhyytoggle = false; //关闭对讲窗口
                    }
                    code = player.startTalk(result.data); //登录成功，进行语音呼叫
                }
          
                if (code == -2) { //返回-2表示没有登录成功
                    return;
                } else if (code == -4) { //放回-4表示当前已有对讲，先关闭
                    notification.warn({
                        title: getLan().notification,
                        message: getLanMain().voiceExist
                    });
                    sszhyyth.sszhyytoggle = false; //关闭对讲窗口
                    return;
                }
                if (code != 0) {
                    notification.error({
                        title: getLan().notification,
                        message: getLan().callF
                    });
                    sszhyyth.sszhyytoggle = false; //关闭对讲窗口
                    return;
                }
                if (!symbol) {
                    this.sszhsptalkcontrol = true;
                    this.sszhsptalkword = '结束';
                }

                callback && callback(code);
                return code;
            }
        })
    },
    playVideo: function (childGbcode, callback) { //实时点流
        //因为是公用一个ocx播放器，确定ocx一定是空闲状态
        if (0 != player.getStatusByIndex(-1)) {
            player.stopRec(1);
        }
        //$('.sszhxt-sszh-map').hide();
        ajax({
            url: '/gmvcs/uom/ondemand/dsj/intranet/streamserver?requestType=play_realtime_video&deviceId=' + childGbcode,
            method: 'get',
            data: null
        }).then(result => {
            if (result.code == 1702) {
                notification.error({
                    title: getLan().notification,
                    message: getLanMain().equipmentOffline
                });
                return;
            } else if (result.code == 1701) {
                notification.error({
                    title: getLan().notification,
                    message: getLanMain().mediaF
                });
                return;
            } else if (result.code == 1500) {
                notification.error({
                    title: getLan().notification,
                    message: getLanMain().mediaF
                });
                return;
            } else if (result.code == 0) {
                result.data.gbcode = childGbcode;
                if (result.data.gb28181Mode && result.data.gb28181Mode == 1) { //表示gsp方式点流
                    result.data.url = result.data.gsp;
                    let code = player.playRecByUrl(result.data);
                    if (code != 0) {
                        notification.error({
                            title: getLan().notification,
                            message: getLanMain().callingF
                        });
                        return;
                    }
                } else {
                    let code = player.login(result.data); //先登录流媒体
                    if (code != 0) {
                        notification.error({
                            title: getLan().notification,
                            message: getLanMain().mediaLoginF + code
                        });
                        return;
                    }
                    code = player.playRec(result.data); //实时点流
                    if (code == -2) { //表示登录失败
                        return;
                    }
                }

                //sszhsp.dev = dev;//保存播放的当前设备
                sszhsp.childGbcode = childGbcode;
                //callback && callback(code);
                //return code;
            }
        });

    },
    // stopvideo(){
    //     sszh.clearsszhspthtime();
    //     player.stopRec(-1);
    // },
    printscreen() {
        var obj = player.printOcxWindow(1);
        //     if (obj.code == 0) {
        //         notification.success({
        //             title: getLan().notification,
        //             message: '截图成功,图片保存路径为D:\\CaptureFolder\\' + obj.time + '.jpg'
        //         });
        //         return;
        //     }
        //     notification.error({
        //         title: getLan().notification,
        //         message: '截图失败'
        //     });
    },
    maxView() {
        player.maxView();
    },
    // 云台控制请求
    ptzControlAjax(operContent, operateCode) {
        return ajax({
            url: '/gmvcs/uom/device/dsj/control/ptzControl',
            method: 'post',
            data: {
                "extParam": 0,
                "gbcode": this.checkItem,
                "name": "",
                "operContent": operContent,
                "ptzCtrlType": operateCode
            }
        }).then(result => {
            if (result.code != 0) {
                notification.warn({
                    title: getLan().notification,
                    message: "云台控制操作失败！"
                });
                return;
            }
        });
    },
    //还原预置点
    ResetPreset() {
        var operContent = "1";
        var operateCode = "PTZ_GOTO_PRESET";
        this.ptzControlAjax(operContent, operateCode);
    },
    hadMouseDown: false,
    operateCode: '',
    // 云台控制 可长按操作方法
    cloudPlatformControl(e, operate) {
        // var operContent;
        this.operateCode = `PTZ_${operate}`;
        switch (e.type) {
            case 'mousedown':
                this.hadMouseDown = true;
                break;
            case 'mouseup':
                this.hadMouseDown = false;
                break;
            case 'mouseleave':
                this.hadMouseDown = false;
        }
        // this.ptzControlAjax(operContent, operateCode);
    },
    //自转
    rotation() {

    }

})
//监听图标是否移动
sszhsp.$watch('imgMoveX', (v) => {
    // console.log(v);
})
// 监听云台控制--鼠标长按、移动
sszhsp.$watch('hadMouseDown', (v) => {
    if (v) {
        sszhsp.ptzControlAjax("1", sszhsp.operateCode);
    } else {
        sszhsp.ptzControlAjax("0", sszhsp.operateCode);
    }
});


// ----人脸布控---------------------------------------
let sszhrlbk_vm = avalon.define({
    $id: 'sszhrlbk',
    rlbkExtra_class: languageSelect == "en" ? true : false,
    rlbk_txt: getLanFace(),
    echart_option: {
        color: ['#c2c2c2', '#be3335'].reverse(),
        series: [{
            hoverAnimation: false,
            type: 'pie',
            radius: ['55%', '70%'],
            avoidLabelOverlap: false,
            label: {
                normal: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    show: false,
                    textStyle: {
                        fontSize: '30',
                        fontWeight: 'bold'
                    }
                }
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            data: [{
                    value: 88.88
                },
                {
                    value: 11.12
                }
            ]
        }],
        graphic: [{
            id: 'percent_txt',
            type: 'text',
            style: {
                text: '88.88%',
                x: 52,
                y: 70,
                fill: '#be3335',
                font: '14px "Microsoft YaHei", sans-serif'
            }
        }]
    },
    recognition_info: {},
    recognition_arr: [],
    scene_img: "",
    result_list: [],
    battery: 50,
    gbcode: '',
    data: {},
    noLocaltionInfo: '',
    executeControlClick: false,

    $computed: {
        width: function () {
            return this.battery / 100 * 29;
        }
    },

    show(data) {
        this.executeControlClick = false;
        this.data = data;
        this.noLocaltionInfo = '';
        if (!data.latitude || !data.longitude) {
            this.noLocaltionInfo = getLan().noGPSs;
        }

        this.battery = data.battery;
        this.gbcode = data.gbcode;

        $('.sszhrlbk-wrap').css({
            'z-index': 9997,
            'width': 886,
            'height': 631
        });

        this.getRecognition(data.businessId);
    },

    getRecognition: function (recordID) {
        ajax({
            // url: '/api/getRec',
            url: `/gmvcs/instruct/face/monitoring/get/recognition?id=${recordID}`,
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: getLan().faceRF,
                    title: getLan().notification
                });
                return;
            }

            this.scene_img = result.data.shootPersonImgFilePath;

            if (result.data.recogPersons.length == 0) {
                notification.error({
                    message: getLan().faceLf,
                    title: getLan().notification
                });
                return;
            }

            this.recognition_arr = result.data.recogPersons;
            this.recognition_info = this.recognition_arr[0];
            // _popover();

            echart = echarts.init(document.getElementById("show_percent"));
            sszhrlbk_vm.echart_option.series[0].data = [{
                    value: Number(sszhrlbk_vm.recognition_info.similarity).toFixed(2)
                },
                {
                    value: (100 - Number(sszhrlbk_vm.recognition_info.similarity)).toFixed(2)
                }
            ];
            sszhrlbk_vm.echart_option.graphic[0].style.text = Number(sszhrlbk_vm.recognition_info.similarity).toFixed(2) + "%";
            echart.setOption(sszhrlbk_vm.echart_option);

            let temp = [];
            for (let i = 0; i < sszhrlbk_vm.recognition_arr.length; i++) {
                let obj = sszhrlbk_vm.recognition_arr[i];
                obj.index = i;
                obj.similarityTxt = getLan().resemblance;
                // if (languageSelect == "en")
                //     obj.similarityTxt = "resemblance:";
                // else
                //     obj.similarityTxt = "相似度：";

                temp.push(obj);
            }
            this.result_list = temp;

            $(".comparison_result .result_list li").removeClass("select_li");
            $(".comparison_result .result_list li:eq(0)").addClass("select_li");

            jQuery(".comparison_result").slide({
                titCell: ".control_bar ul",
                mainCell: ".result_list",
                autoPage: true,
                effect: "left",
                vis: 6,
                pnLoop: false,
                trigger: "click"
            });

            if (!$(".comparison_result .result_list").parent().hasClass("tempWrap")) {
                $(".comparison_result .result_list").css({
                    "margin-left": "35px"
                });
            }

            // $(".comparison_result .tempWrap").width($(".rlbk_detail_content").width() - 80);
        });
    },

    result_list_click(index) {
        this.recognition_info = this.recognition_arr[index];

        sszhrlbk_vm.echart_option.series[0].data = [{
                value: Number(sszhrlbk_vm.recognition_info.similarity).toFixed(2)
            },
            {
                value: (100 - Number(sszhrlbk_vm.recognition_info.similarity)).toFixed(2)
            }
        ];
        sszhrlbk_vm.echart_option.graphic[0].style.text = Number(sszhrlbk_vm.recognition_info.similarity).toFixed(2) + "%";
        echart.setOption(sszhrlbk_vm.echart_option);

        $(".comparison_result .result_list li").removeClass("select_li");
        $(".comparison_result .result_list li:eq(" + index + ")").addClass("select_li");
    },

    sphj() {
        sszhinfowindow.playVideo(this.data.gbcode, this.data.userName, this.data.userCode, this.data.signal, this.data.deviceName, this.data.mytype, sszhdeviceInfo.gbcodeArr);
    },

    bk() {
        let radius = bkfwVm.radius; // 布控范围半径
        if (!this.data.latitude || !this.data.longitude) {
            notification.warn({
                title: getLan().notification,
                message: getLan().noGPS
            });
            return;
        }
        ajax({
            url: '/gmvcs/instruct/track/gps/around/devices?lat=' + this.data.latitude + '&lon=' + this.data.longitude + '&radius=' + radius,
            method: 'get',
            data: null
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: getLanMain().notificationTips,
                    title: getLan().notification
                });
                return;
            }
            let data = result.data;

            this.executeControlClick = true;

            for (let i in data) {
                if (data[i] == 'DSJ' && i != this.data.gbcode) { // TODO 暂时只做执法仪
                    let obj = {};
                    obj.gbcode = i;
                    obj.mytype = 0;
                    obj.checked = null;
                    vm.handleTreeCheck('', '', obj);
                }
            }
            let circle = $('#mapIframe')[0].contentWindow.esriMap.createCircle({
                longitude: this.data.longitude,
                latitude: this.data.latitude
            }, radius);
            circle.id = this.data.userCode;
            circle.name = this.data.userName;
            circle.gbcode = this.data.gbcode;
            $('#mapIframe')[0].contentWindow.circleArr.push(circle);
            this.close_click();
        });
    },

    close_click() {
        $(".sszhrlbk-wrap").css({
            "z-index": "-1"
        });
    }
});

// -------------------------------------------

let notFoundPicture = '/static/image/sszhxt-znsb/cpbk_404.png';

// 车牌布控窗口
let cpbk = avalon.define({
    $id: 'sszh-cpbk',
    recognitionCarInfo: {
        carNumber: "",
        carType: "",
        carOwner: "",
        carBrand: "",
        carIdCard: "",
        carOwnerAddress: "",
        carEngineNo: "",
        carUse: "",
        carValid: ""
    },
    leftPhoto: notFoundPicture,
    rightPhoto: notFoundPicture,
    battery: 0,
    gbcode: '',
    data: {},
    noLocaltionInfo: '',
    executeControlClick: false,
    $computed: {
        width: function () {
            return this.battery / 100 * 29;
        }
    },

    // 视频呼叫
    videoplay() {
        sszhinfowindow.playVideo(this.data.gbcode, this.data.userName, this.data.userCode, this.data.signal, this.data.deviceName, this.data.mytype, sszhdeviceInfo.gbcodeArr);
    },
    // 布控
    executeControl() {
        let radius = bkfwVm.radius; // 布控范围半径;
        if (!this.data.latitude || !this.data.longitude) {
            notification.warn({
                title: getLan().notification,
                message: getLan().noGPS
            });
            return;
        }
        ajax({
            url: '/gmvcs/instruct/track/gps/around/devices?lat=' + this.data.latitude + '&lon=' + this.data.longitude + '&radius=' + radius,
            method: 'get',
            data: null
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: getLanMain().notificationTips,
                    title: getLan().notification
                });
                return;
            }
            let data = result.data;
            this.executeControlClick = true;

            for (let i in data) {
                if (data[i] == 'DSJ' && i != this.data.gbcode) { // TODO 暂时只做执法仪
                    let obj = {};
                    obj.gbcode = i;
                    obj.mytype = 0;
                    obj.checked = null;
                    vm.handleTreeCheck('', '', obj);
                }
            }
            let circle = $('#mapIframe')[0].contentWindow.esriMap.createCircle({
                longitude: this.data.longitude,
                latitude: this.data.latitude
            }, radius);
            circle.id = this.data.userCode;
            circle.name = this.data.userName;
            circle.gbcode = this.data.gbcode;
            $('#mapIframe')[0].contentWindow.circleArr.push(circle);
            this.closeSszhCpbf();
        });
    },
    show(data) {
        this.executeControlClick = false;
        $(".sszh-cpbk").css({
            'z-index': 9997,
            'width': 700,
            'height': 500
        });

        this.data = data;

        this.noLocaltionInfo = '';
        if (!data.latitude || !data.longitude) {
            this.noLocaltionInfo = getLan().noGPSs;
        }

        this.battery = data.battery;
        this.gbcode = data.gbcode;

        ajax({
            url: '/gmvcs/instruct/car/monitoring/get/recognition?id=' + data.businessId,
            method: 'get',
            data: null
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: getLan().noCarNum,
                    title: getLan().notification
                });
                return;
            }
            let res = result.data,
                recognitionCarInfo;
            recognitionCarInfo = res.recognitionCarInfo[0];
            recognitionCarInfo.carNumber = res.carNumber;
            recognitionCarInfo.carUse = res.recognitionCarInfo[0].carUse == "1" ? getLan().operate : getLan().noOperate;
            this.recognitionCarInfo = recognitionCarInfo;
            this.leftPhoto = res.shootCarImgFilePath;
            this.rightPhoto = res.recognitionCarInfo[0].carRegImgFilePath;
        });
    },
    closeSszhCpbf() {
        $(".sszh-cpbk").css({
            'z-index': '-1'
        });
    }
});


//语音通话窗口vm
let sszhyyth = avalon.define({
    $id: 'sszhyyth',
    sszhyyth_txt: getLan(),
    sszhthjy: '',
    $computed: {
        xhword: function () {
            if (sszhsp.signal < 15) {
                return getLan().weak;
            } else if (sszhsp.signal > 50) {
                return getLan().fine;
            } else {
                return getLan().great;
            }
            // if (languageSelect == "zhcn") {
            //     if (sszhyyth.signal < 15) {
            //         return '差';
            //     } else if (sszhyyth.signal > 50) {
            //         return '良';
            //     } else {
            //         return '优';
            //     }
            // } else {
            //     if (sszhyyth.signal < 15) {
            //         return 'Bad';
            //     } else if (sszhyyth.signal > 50) {
            //         return 'Fine';
            //     } else {
            //         return 'Great';
            //     }
            // }
        }
    },
    mytype: 0,
    signal: 0, //信号强度
    sszhyythtime: '00:00:00',
    countsszhythtime: 0, //语音计时
    sszhyycontrol: 0, //禁音控制开关
    countsszhythtimeObject: '', //语音定时器
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
        this.countsszhythtimeObject = setTimeout(sszhyyth.countTime, 1000);
    },
    sszhyytoggle: false,
    sszhyyth_waiting: true, // 等待对讲标志
    sszhyythaction: 'enter',
    hidesszhyythaction: function () {
        $("#sszhyyth").hide(300, function () {
            $(".sszhyythmincontianer").show(100);
        });
    },
    closesszhhyyth: function () {
        clearTimeout(sszhyyth.countsszhythtimeObject); //清除定时器
        this.sszhyythtime = "00:00:00";
        this.countsszhythtime = 0;
        sszhyyth.sszhyytoggle = false;
        sszhyyth.sszhyyth_waiting = true;
        sszhmap.sszhyyhtml = [];
        let code;
        if (starttalkType) {
            code = player.stopTSTalk(speakPerson.gbcode); //结束音频
        } else {
            code = player.stopTalk(speakPerson.gbcode); //结束音频
        }
        if (code === 0) {
            sszh.sszhyyhtml = '';
            speakPerson = {}; //清空语音对话保存数据
        } else {
            notification.error({
                title: getLan().notification,
                message: "结束语音失败"
            });
        }

    },
    slience: function () {
        sszhsp.slient(speakPerson.gbcode);
    }
});
//录制视频vm
let sszhlzsp = avalon.define({
    $id: 'sszhlzsp',
    dev: '',
    gbcode: '',
    sszhlzsptoggle: false,
    checkedone: true,
    checkedtwo: false,
    checkedthere: false,
    lzsch: '',
    lzscm: '',
    lzscs: '',
    handleChange(e) {
        if (e.target.value == '1') {
            this.checkedone = true;
            this.checkedtwo = false;
            this.checkedthere = false;
        } else if (e.target.value == '2') {
            this.checkedone = false;
            this.checkedtwo = true;
            this.checkedthere = false;
        } else {
            this.checkedone = false;
            this.checkedtwo = false;
            this.checkedthere = true;
        }
    },
    sszhlzspsure() {
        let pData = {};
        if (this.checkedone) {
            pData.time = '15fenzhong';
            pData.dev = this.gbcode;
        } else if (this.checkedtwo) {
            pData.time = '30';
            pData.dev = this.gbcode;
        } else if (this.checkedthere) {
            pData.time = 3600 * this.lzsch + 60 * this.lzscm + this.lzscs;
            pData.dev = this.gbcode;
            if (pData.time === '0') {
                notification.warn({
                    title: getLan().notification,
                    message: "请设置时间"
                });
                return;
            }
        }
        ajax({

        }).then(result => {

        })
    },
    sszhlzspcancel: function () {
        this.sszhlzsptoggle = false;
    }
});
//消息下发
let sbxxxf = avalon.define({
    $id: 'sbxxxf',
    messagecontent: '',
    dev: '',
    gbcode: '',
    showsbxxxf: false,
    sentmessage() {

    },
    closesbxxxf() {
        this.showsbxxxf = false;
    }
});

avalon.filters.filterByState = function (str) {
    if (str == 1) {
        return getLan().unChecked;
    } else {
        return getLan().checked;
    }
}
//告警信息vm
let sszhgjxxManage = avalon.define({
    $id: 'sszhgjxxManage',
    gjxxlist: [],
    gotogj(item) {
        if (item.state == 0) {
            return;
        }
        let obj = {};
        item.state = 0; //变为已处理
        obj.time = item.time;
        obj.sosPerson = item.userName + '(' + item.userCode + ')';
        obj.gbcode = item.gbcode;
        obj.isRealTimeView = true;
        item.userCode ? obj.userCode = item.userCode : '-';
        item.userName ? obj.userName = item.userName : '-';
        obj.sosId = item.sosId;
        obj.isGjgl = false;
        obj.handleStatus = 'WAITING';
        var data = JSON.stringify(obj);
        sessionStorage.setItem('sszhxt-gjglcontrol', data);
        var baseUrl = document.location.href.substring(0, document.location.href.lastIndexOf("/"));
        window.location.href = baseUrl + "/sszhxt-gjglcontrol";
    }
});



//地图信息窗口的vm
let sszhinfowindow = avalon.define({
    $id: "mapinfowindow",
    playVideo: function (gbcode, username, usercode, signal, name, mytype, devArr) { //实时点流
        if (vm.isie && !ocxele.object || !vm.isie && undefined == ocxele.GS_ReplayFunc) {
            vm.tipText = getLanMain().needPlug;
            vm.showtip = true;
            vm.downloadTipShow = true;
            return;
        }
        //不显示工具
        if (mytype != 0) {
            sszhsp.isShowTools = true;
            sszhsp.gbcodeArr = devArr;
            $(".sszhspth").css({
                'z-index': 9999,
                'width': 1000,
                'height': '500'
            });
        } else {
            sszhsp.isShowTools = false;
            $(".sszhspth").css({
                'z-index': 9999,
                'width': '730',
                'height': '530'
            });
        }
        $('#npGSVideoPlugin').css({
            'z-index': 999
        });
        if (sszhsp.gbcode == gbcode && 0 != player.getStatusByIndex(-1)) {
            //表示当前视频窗口是同一个设备，多通道也是一样，并且在播放了
            avalon.each(sszhmap.devhtmllist, function (index, item) {
                if (item.gbcode == sszhsp.gbcode) {
                    item.show = false;
                }
            })
            sszhsp.showsszhspth = true;
            return;
        }
        if (sszhsp.gbcode == gbcode && 0 == player.getStatusByIndex(-1)) {
            //表示当前视频窗口是同一个人，只需要重新点流就好,出现场景是从左侧栏点击定位到地图，并且窗口空闲，然后又在地图点击视频呼叫
            //执法仪
            if (mytype == 0) {
                sszhsp.playVideo(gbcode);
                sszhsp.showToolBtn = false;
            } else {
                //多通道的,默认点开第一个通道
                sszhsp.playVideo(sszhsp.childGbcode);
            }

            avalon.each(sszhmap.devhtmllist, function (index, item) {
                if (item.gbcode == sszhsp.gbcode) {
                    item.show = false;
                }
            })
            sszhsp.showsszhspth = true;
            return;
        }

        if (sszhsp.showsszhspth) {
            if (0 != player.getStatusByIndex(-1)) {
                //表示ocx已经被占用了,并且是其他人要占用视频播放窗口了，先关闭视频点流，将视频点流的人显示在左侧，在将当前设备点流，播放在ocx
                sszhsp.hidesszhspth();
            } else {
                //ocx空就删掉对应的
                for (var i = 0; i < sszhmap.devhtmllist.length; i++) {
                    let item = sszhmap.devhtmllist[i];
                    if (sszhsp.gbcode = item.gbcode) {
                        sszhmap.devhtmllist.splice(i, 1);
                        break;
                    }
                }
            }
        }
        //在左侧栏中找到了这个人，说明他在视频中，并且这个窗口播放过其他人
        let flag = false;
        avalon.each(sszhmap.devhtmllist, function (index, item) {
            if (item.gbcode == gbcode) {
                flag = true;
                item.show = false;
                sszhsp.playVideo(item.childGbcode); //因为点流放回太慢，不用回调了
                sszhsp.gbcode = item.gbcode;
                sszhsp.signal = item.signal;
                sszhsp.mytype = item.mytype;
                sszhsp.showsszhspth = true;
                sszhsp.showToolBtn = item.showToolBtn;
                //多通道只显示设备名称
                if (mytype != 0) {
                    sszhsp.name = item.name;
                } else {
                    if (!username) {
                        sszhsp.name = getLan().talking.replace(/\$rep/g, name);
                    } else {
                        let repName = username + '(' + usercode + ')';
                        sszhsp.name = getLan().talking.replace(/\$rep/g, repName);
                    }
                    // if (languageSelect == "zhcn") {
                    //     if (!username) {
                    //         sszhsp.name = "与" + name + "视频通话中";
                    //     } else {
                    //         sszhsp.name = "与" + username + '(' + usercode + ')' + "视频通话中";
                    //     }
                    // } else {
                    //     if (!username) {
                    //         sszhsp.name = "Talking to " + name;
                    //     } else {
                    //         sszhsp.name = "Talking to " + username + '(' + usercode + ')';
                    //     }
                    // }
                }
                sszhsp.deviceName = item.name;
                if (mytype == 1) {
                    sszhsp.deviceType = getLan().wirelessCamera;
                } else if (mytype == 2) {
                    sszhsp.deviceType = getLan().vehicleCamera;
                } else {
                    sszhsp.deviceType = getLan().UAV;
                }
                return; //这里只会return回去这个function
            }

        })

        // let code = sszhsp.playVideo(gbcode,dev,function (code) {
        if (mytype == 0) {
            //说明这个人没有被视频，
            sszhsp.playVideo(gbcode); //因为点流放回太慢，不用回调了
        } else {
            sszhsp.playVideo(devArr[0].gbcode); //因为点流放回太慢，不用回调了
        }

        //if(code!=0)return;
        sszhsp.showsszhspth = true;
        //Firefox中ocx不能隐藏，初始设置他的宽高是1px
        // $(".sszhspth").css({
        //     'width': 700,
        //     'height': 500,
        //     'z-index': 9999
        // });
        sszhsp.gbcode = gbcode;
        sszhsp.signal = signal;
        sszhsp.mytype = mytype;
        if (mytype != 0) {
            sszhsp.isShowTools = true;
            sszhsp.gbcodeArr = devArr;
            $(".sszhspth").css({
                'z-index': 9999,
                'width': 1000,
                'height': '500'
            });
        } else {
            sszhsp.isShowTools = false;
            $(".sszhspth").css({
                'z-index': 9999,
                'width': '730',
                'height': '530'
            });
        }
        $('#npGSVideoPlugin').css({
            'z-index': 999
        });
        if (flag) {
            return;
        }
        //视频计时
        let obj = {};
        obj.gbcode = gbcode;
        if (mytype == 0) {
            obj.childGbcode = gbcode;
        } else {
            obj.childGbcode = devArr[0].gbcode;
            if (devArr[0].PTZControllable == 1) {
                sszhsp.showToolBtn = true;
            } else {
                sszhsp.showToolBtn = false;
            }
            sszhsp.checkItem = devArr[0].gbcode;
        }
        obj.devArr = devArr;
        obj.username = username;
        obj.usercode = usercode;
        obj.show = false; //左侧栏的显示
        obj.oldTime = new Date(); //视频计时
        obj.time = '00:00:00';
        obj.signal = signal;
        obj.mytype = mytype;
        obj.name = name;
        //let timeobj = setInterval("countspTime('"+dev+"')", 10000);
        let timeobj = setInterval(function () {
            countspTime(sszhsp.gbcode);
        }, 1000);
        obj.timeobj = timeobj;
        if (mytype != 0) {
            sszhsp.name = name;
            sszhsp.deviceName = name;
            obj.showName = getLan().talking.replace(/\$rep/g, name);
            // if (languageSelect == "zhcn")
            //     obj.showName = "与" + name + "视频通话中";
            // else
            //     obj.showName = "Talking to " + name;

            if (mytype == 1) {
                sszhsp.deviceType = getLan().wirelessCamera;
            } else if (mytype == 2) {
                sszhsp.deviceType = getLan().vehicleCamera;
            } else {
                sszhsp.deviceType = getLan().UAV;
            }

        } else {
            if (!username) {
                sszhsp.name = getLan().talking.replace(/\$rep/g, name);
                obj.showName = getLan().talking.replace(/\$rep/g, name);
            } else {
                let repName = username + '(' + usercode + ')';
                sszhsp.name = getLan().talking.replace(/\$rep/g, repName);
                obj.showName = getLan().talking.replace(/\$rep/g, repName);
            }
            // if (languageSelect == "zhcn") {
            //     if (!username) {
            //         sszhsp.name = "与" + name + "视频通话中";
            //         obj.showName = "与" + name + "视频通话中";
            //     } else {
            //         sszhsp.name = "与" + username + '(' + usercode + ')' + "视频通话中";
            //         obj.showName = "与" + username + '(' + usercode + ')' + "视频通话中";
            //     }
            // } else {
            //     if (!username) {
            //         sszhsp.name = "Talking to " + name;
            //         obj.showName = "Talking to " + name;
            //     } else {
            //         sszhsp.name = "Talking to " + username + '(' + usercode + ')';
            //         obj.showName = "Talking to " + username + '(' + usercode + ')';
            //     }
            // }

        }
        sszhmap.devhtmllist.push(obj);
        //});



    },
    startTalk: function (gbcode, username, usercode, signal, mytype) { //语音对讲
        if (vm.isie && !ocxele.object || !vm.isie && undefined == ocxele.GS_ReplayFunc) {
            vm.tipText = getLanMain().needPlug;
            vm.showtip = true;
            vm.downloadTipShow = true;
            return;
        }
        if (speakPerson.gbcode === gbcode) {
            notification.info({
                title: getLan().notification,
                message: getLan().called
            });
            return;
        }
        sszhyyth.sszhyytoggle = true;
        // if(mytype == 0) {
        sszhsp.starttalk(gbcode, true, function (code) {
            if (code != 0) {
                notification.error({
                    title: getLan().notification,
                    message: getLan().callF
                });
                sszhyyth.sszhyytoggle = false;
                return;
            };
            let obj = {};
            if (!username) {
                username = '-';
            }
            if (!usercode) {
                usercode = '-';
            }
            obj.gbcode = gbcode;
            obj.username = username;
            obj.usercode = usercode;
            obj.signal = signal;
            obj.mytype = mytype;
            let repName = username + '(' + usercode + ')';
            obj.showName = getLan().yy_talking.replace(/\$rep/g, repName);
            // if (languageSelect == "zhcn") 
            //     obj.showName = "与" + username + '(' + usercode + ')' + "语音通话中";
            // else
            //     obj.showName = "Talking to " + username + '(' + usercode + ')';
            sszhyyth.sszhyyth_waiting = false;
            sszhyyth.countTime(); //语音计时
            speakPerson.gbcode = gbcode;
            sszhyyth.sszhthjy = getLan().yy_talking.replace(/\$rep/g, repName);
            // if (languageSelect == "zhcn") 
            //     sszhyyth.sszhthjy = "与" + username + '(' + usercode + ')' + "语音通话中";
            // else
            //     sszhyyth.sszhthjy = "Talking to " + username + '(' + usercode + ')';
            sszhmap.sszhyyhtml.push(obj);
            sszhyyth.mytype = mytype;
        });
        // } else { // 多通道语音对讲
        // sszhsp.srartTalkByDuo(gbcode, true, function (code) {
        //     if (code != 0) {
        //         notification.error({
        //             title: getLan().notification,
        //             message: getLan().callF
        //         });
        //         return;
        //     };
        //     let obj = {};
        //     if (!username) {
        //         username = '-';
        //     }
        //     if (!usercode) {
        //         usercode = '-';
        //     }
        //     obj.gbcode = gbcode;
        //     obj.username = username;
        //     obj.usercode = usercode;
        //     obj.signal = signal;
        //     obj.mytype = mytype;
        //     if (languageSelect == "zhcn")
        //         obj.showName = "与" + username + '(' + usercode + ')' + "语音通话中";
        //     else
        //         obj.showName = "Talking to " + username + '(' + usercode + ')';
        //     sszhyyth.sszhyytoggle = true;
        //     sszhyyth.countTime(); //语音计时
        //     speakPerson.gbcode = gbcode;
        //     if (languageSelect == "zhcn")
        //         sszhyyth.sszhthjy = "与" + username + '(' + usercode + ')' + "语音通话中";
        //     else
        //         sszhyyth.sszhthjy = "Talking to " + username + '(' + usercode + ')';
        //     sszhmap.sszhyyhtml.push(obj);
        //     sszhyyth.mytype = mytype;
        // });
        // }



    },
    startRecord: function (gbcode) { //视频录制
        sszhlzsp.sszhlzsptoggle = true;
        sszhlzsp.gbcode = gbcode;
    },
    sentmessage: function (gbcode) { //消息下发
        sbxxxf.showsbxxxf = true;
        sbxxxf.gbcode = gbcode;
    },
    lock: function (gbcode, lock, callback) { //远程锁定
        let data = {};
        let optCmd;
        if (lock) {
            optCmd = 'Lock';
        } else {
            optCmd = 'Unlock';
        }
        ajax({
            url: '/gmvcs/uom/device/dsj/control/lock?deviceId=' + gbcode + '&optCmd=' + optCmd,
            method: 'post',
            data: null
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    title: getLan().notification,
                    message: getLan().operationF
                });
                $('#mapIframe')[0].contentWindow.addOrRemoveMask(false);
                return;
            }
            if (lock) {
                if (mapType == 0) {
                    $('#mapIframe')[0].contentWindow.addOrRemoveMask(true, getLan().locking, true);
                    setTimeout(function () {
                        $('#mapIframe')[0].contentWindow.addOrRemoveMask(false);
                        $('#mapIframe')[0].contentWindow.addOrRemoveMask(true, getLan().locked, false);
                        $('#mapIframe')[0].contentWindow.disableOrActiveButton(true);
                        $('#mapIframe')[0].contentWindow.settleData(gbcode, false, true);
                        changeTreeImg(gbcode, true);
                    }, 500);
                } else {
                    notification.success({
                        title: getLan().notification,
                        message: getLan().lockS
                    });
                    $('#mapIframe')[0].contentWindow.disableOrActiveButton(true);
                    $('#mapIframe')[0].contentWindow.settleData(gbcode, false, true);
                    changeTreeImg(gbcode, true);
                }


            } else {
                if (mapType == 0) {
                    $('#mapIframe')[0].contentWindow.addOrRemoveMask(true, getLan().unlocking, true);
                    setTimeout(function () {
                        $('#mapIframe')[0].contentWindow.addOrRemoveMask(false);
                        $('#mapIframe')[0].contentWindow.addOrRemoveMask(true, getLan().unlocked, false);
                        $('#mapIframe')[0].contentWindow.disableOrActiveButton(false);
                        $('#mapIframe')[0].contentWindow.settleData(gbcode, false, false);
                        changeTreeImg(gbcode, false);
                    }, 500);
                } else {
                    notification.success({
                        title: getLan().notification,
                        message: getLan().unlockS
                    });
                    $('#mapIframe')[0].contentWindow.disableOrActiveButton(false);
                    $('#mapIframe')[0].contentWindow.settleData(gbcode, false, false);
                    changeTreeImg(gbcode, false);
                }


            }
            if (mapType == 0) {
                setTimeout(function () {
                    $('#mapIframe')[0].contentWindow.addOrRemoveMask(false);
                }, 1000);
            }

            callback && callback();
        });

    },
    photograph: function (gbcode) { //远程拍照
        let data = {};
        ajax({
            url: '/gmvcs/uom/device/dsj/control/photo?deviceId=' + gbcode,
            method: 'post',
            data: null
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    title: getLan().notification,
                    message: getLan().shotFailed
                });
                return;
            }
            if (mapType == 0) {
                $('#mapIframe')[0].contentWindow.addOrRemoveMask(true, getLan().shotSend, false);
                setTimeout(function () {
                    $('#mapIframe')[0].contentWindow.addOrRemoveMask(false);
                }, 1000)
            } else {
                notification.success({
                    title: getLan().notification,
                    message: getLan().shotSend
                });
            }
        });
    },
    record: function (gbcode, record) {
        let data = {};
        let optCmd;
        if (record) {
            optCmd = 'Start';
        } else {
            optCmd = 'Stop';
        }

        ajax({
            url: '/gmvcs/uom/device/dsj/control/record?deviceId=' + gbcode + '&optCmd=' + optCmd,
            method: 'post',
            data: null
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    title: getLan().notification,
                    message: getLan().operationF
                });
                return;
            }
            if (record) {
                if (mapType == 0) {
                    $('#mapIframe')[0].contentWindow.addOrRemoveMask(false);
                    $('#mapIframe')[0].contentWindow.changeSpanCss(false);
                    $('#mapIframe')[0].contentWindow.settleData(gbcode, true, false);
                    $('#mapIframe')[0].contentWindow.addOrRemoveMask(true, getLan().startVideoS, false);
                } else {
                    $('#mapIframe')[0].contentWindow.changeSpanCss(false);
                    $('#mapIframe')[0].contentWindow.settleData(gbcode, true, false);
                    notification.success({
                        title: getLan().notification,
                        message: getLan().startVideoS
                    });
                }

            } else {
                if (mapType == 0) {
                    $('#mapIframe')[0].contentWindow.addOrRemoveMask(false);
                    $('#mapIframe')[0].contentWindow.changeSpanCss(true);
                    $('#mapIframe')[0].contentWindow.settleData(gbcode, false, false);
                    $('#mapIframe')[0].contentWindow.addOrRemoveMask(true, getLan().stopVideoS, false);
                } else {
                    $('#mapIframe')[0].contentWindow.changeSpanCss(true);
                    $('#mapIframe')[0].contentWindow.settleData(gbcode, false, false);
                    notification.success({
                        title: getLan().notification,
                        message: getLan().stopVideoS
                    });
                }


            }
            if (mapType == 0) {
                setTimeout(function () {
                    $('#mapIframe')[0].contentWindow.addOrRemoveMask(false);
                }, 1000)
            }
        });

    },
    controlMarkerArr: controlMarkerArr
});

// 布控范围
const bkfwVm = avalon.define({
    $id: 'sszh-bkfw-vm',
    show: false,
    bkfwTitle: getLan().bk,
    isMove: false,
    $form: createForm(),
    sliderWidth: 348,
    imgClientx: 0, //鼠标按下的位置
    imgMoveX: 69.5, //图标移动的距离
    imgStartx: 69.5, //图标开始的left值
    splitWidth: 69.5,
    rangeRadius: 0, // 范围
    radius: 0, // 传给后台的半径范围 单位：m
    maxRadius: 5, // 单位为 km
    maxSplit: 5,
    rangeList: [1, 2, 3, 4, 5],
    pointerMouseDown(e) { // 滑块点击
        let _this = this;
        this.imgClientx = e.clientX;
        this.imgStartx = this.imgMoveX;

        $('.slider-pointer').removeClass('animation-for-slider');
        $('body').on("mousemove", function (event) {
            _this.moveEvent(event);
        });

        $(document).on("mouseup mouseleave", function (event) {
            $('body').off("mousemove");
            event.stopPropagation();
        });
    },
    sliderClick(e) { // 滑条点击
        let bounding = $('.slider-pointer')[0].getBoundingClientRect();
        this.imgClientx = bounding.x || bounding.left;
        this.imgStartx = this.imgMoveX;
        $('.slider-pointer').addClass('animation-for-slider');
        this.moveEvent(e);
    },
    moveEvent(event) { // 滑块滑动
        let x;
        if (event.pageX - this.imgClientx >= 0) {
            x = this.imgStartx + event.pageX - this.imgClientx;
            if (x >= this.sliderWidth) {
                this.imgMoveX = this.sliderWidth;
                this.setVal();
                return;
            }
            this.imgMoveX = x;
        } else {
            x = this.imgStartx - Math.abs(event.pageX - this.imgClientx);
            if (x <= 0) {
                this.imgMoveX = 0;
                this.setVal();
                return;
            }
            this.imgMoveX = x;
        }
        this.setVal();
    },
    rangItemClick(index) { // 范围点击
        this.rangeRadius = ((index + 1) * (this.maxRadius / this.maxSplit)).toFixed(1);
        this.rangeRadiusChange();
    },
    setVal() { // 设置输入框val
        this.rangeRadius = (this.maxRadius * this.imgMoveX / this.sliderWidth).toFixed(1);
    },
    rangeRadiusChange() { // 输入框值改变事件
        $('.slider-pointer').addClass('animation-for-slider');
        this.imgMoveX = (Number(this.rangeRadius) * this.sliderWidth / this.maxRadius);
        this.imgMoveX = this.imgMoveX >= this.sliderWidth ? this.sliderWidth : this.imgMoveX;
    },
    getRadius() { // 获取布控范围
        let url = '/gmvcs/instruct/car/monitoring/get/personality/configuration';
        return ajax({
            url: url,
            method: "GET",
            data: null
        }).then((res) => {
            if (res.code == 0) {
                this.radius = res.data.monitoringDistance;
                this.rangeRadius = (res.data.monitoringDistance / 1000).toFixed(1);
                this.rangeRadiusChange();
            }
        });
    },
    extramove(a, b) {
        $('#back-iframe-for-modal').show();
        $("#back-iframe-for-modal").css({
            top: a,
            left: b
        });
    },
    handleOk() {
        let url = '/gmvcs/instruct/car/monitoring/save/personality/configuration';
        let data = {
            "monitoringDistance": this.radius,
            "uid": storage.getItem('uid')
        };
        ajax({
            url: url,
            method: "POST",
            data: data
        }).then(res => {
            if (res.code == 0) {
                this.radius = this.rangeRadius * 1000; // 布控范围半径 单位：m
                notification.success({
                    title: getLan().notification,
                    message: getLan().bks
                });
                this.show = false;
                $("#back-iframe-for-modal").hide();
            } else {
                notification.error({
                    title: getLan().notification,
                    message: getLan().bkf
                });
            }
        });
    },
    handleCancel() {
        this.show = false;
        $("#back-iframe-for-modal").hide();
    }
});

// bkfwVm.getRadius(); // 页面载入时先获取布控范围

bkfwVm.$watch('show', (v) => {
    if (v) {
        bkfwVm.getRadius();
        setTimeout(() => {
            bkfwVm.sliderWidth = $('.tool-slider')[0].clientWidth;
            bkfwVm.splitWidth = bkfwVm.sliderWidth / bkfwVm.maxSplit;
        }, 200);
        $('body')[0].onselectstart = function () {
            return false;
        };
    } else {
        $('body')[0].onselectstart = function () {
            return null;
        };
    }
});

//视频计时函数
function countspTime(gbcode) {
    avalon.each(sszhmap.devhtmllist, function (index, item) {
        if (item.gbcode == gbcode) {
            let h, m, s;
            let nowTime = new Date();
            let timecount = (nowTime - item.oldTime) / 1000;
            h = parseInt(timecount / 3600);
            m = parseInt(timecount % 3600 / 60);
            s = parseInt(timecount % 3600 % 60);
            if (h < 10) {
                h = '0' + h;
            }
            if (m < 10) {
                m = '0' + m;
            }
            if (s < 10) {
                s = '0' + s;
            }
            item.time = h + ':' + m + ':' + s;
        }
        if (item.gbcode === sszhsp.gbcode) {
            sszhsp.sszhspthtime = item.time; //将时间赋给视频窗口时间
            return;
        }
    });
}


//===============================ocx初始化部分========================================
function initOcx() {
    player = new Gxxplayer();
    ocxele = document.getElementById("npGSVideoPlugin");

    if (vm.isie && !ocxele.object || !vm.isie && undefined == ocxele.GS_ReplayFunc) {
        vm.tipText = getLanMain().needPlug;
        vm.showtip = true;
        vm.downloadTipShow = true;
        return;
    }
    // 初始化播放器
    player.init({
        'element': 'npGSVideoPlugin',
        'model': 1,
        'proxy': _onOcxEventProxy
    });
    let version = player.getVersion();
    if (compareString(gxxOcxVersion, version)) {
        vm.tipText = getLanMain().updateOcxTip.replace(/\$rep1|\$rep2/gi, function (matched) {
            return {
                $rep1: version,
                $rep2: gxxOcxVersion
            } [matched]
        })
        // if (languageSelect == "zhcn")
        //     vm.tipText = '您的高新兴视频播放器插件版本为' + version + '，最新版为' + gxxOcxVersion + '，请下载最新版本';
        // else
        //     vm.tipText = 'Version of your GXX media player plug-in is ' + version + ' and the latest is ' + gxxOcxVersion + '. Please download the latest version.';
        vm.showtip = false;
        vm.downloadTipShow = true;
        return;
    }
    // 分屏为1列4行
    //player.splitWnd(4, 4, 1);
}

function compareString(str1, str2) {
    let num1 = [],
        num2 = [];
    num1 = str1.split('.');
    num2 = str2.split('.');
    let maxLength = num1.length > num2.length ? num1.length : num2.length;
    for (var i = 0; i < maxLength; i++) {
        if (num1[i] === undefined) {
            return false;
        }
        if (num2[i] === undefined) {
            return true;
        }
        if (Number(num1[i]) > Number(num2[i])) {
            return true;
        } else if (Number(num1[i]) < Number(num2[i])) {
            return false;
        } else if (Number(num1[i]) == Number(num2[i])) {
            continue;
        }
    }
    return false;
}

function _onOcxEventProxy(data) {
    let ret = eval('(' + data + ')'); //每次操作acx都会回调这里，如点击关闭窗口回调此处，放回值如下
    //表示截图
    if (ret.action == "CapturePicture") {
        if (ret.code == 0) {
            notification.success({
                title: getLan().notification,
                message: getLanMain().screenshotS + ret.data.picPath
            });
        } else {
            notification.error({
                title: getLan().notification,
                message: getLanMain().screenshotF + ret.code
            });
        }
    } else if (ret.action == "StartLocalRecord") {
        if (ret.code == 0) {
            notification.success({
                title: getLan().notification,
                message: getLanMain().videoS + ret.data.szLocalRecordPath
            });
        } else {
            notification.error({
                title: getLan().notification,
                message: getLanMain().videoF + ret.code
            });
        }
    } else if (ret.action == "TSStopTalk") { // 10s自动结束多通道语音对讲回调
        if (ret.code == 0) {
            sszhyyth.closesszhhyyth();
        }
    }
    // //{"action":"StopVideo","code":0,"data":{"nIndex":1,"szNodeID":"35000...1668//设备编号"},"ocxID":"realtime_player"}
    // if(ret.action == "SelDisp"){
    //     if(ret.data.szNodeID == undefined || ret.data.szNodeID == null||ret.data.szNodeID ===""){
    //         return;
    //     }
    //     searchNode(ret.data.szNodeID);//点击ocx,部门树定位警员
    // }
}
// //=====================================sos告警===========================
// var error_total = 0;
// const websocketIP = 'ws://'+ webSocketIp;
// const socket = io(websocketIP, {
//     transports: ['polling']
// });
//
// socket.on('connect', (connect) => {
//     //获取当前登录用户的部门path
//     ajax({
//         url :'/gmvcs/uap/cas/loginUser',
//         method : 'get',
//         data : null
//     }).then( result => {
//         if (result.code != 0) {
//             notification.warn({
//                 title: getLan().notification,
//                 message: "获取用户部门信息失败"
//             });
//             return;
//         }
//         longinPersonOrgpath = result.data.orgPath;
//         longinPersonUid = result.data.uid;
//         socket.emit('uidEvent', {
//             'uid': longinPersonUid
//         });
//     });
//
//    //console.log(socket);
//
// });
//
// // socket.on('CAN', (ret) => {
// //     console.log("CAN:", ret);
// //     //      setTimeout(function() {
// //     socket.emit('TOKEN', {
// //         'token': storage.getItem('token')
// //     });
// //     //      }, 500);
// //
// // });
//
// socket.on('messageevent', (ret) => {
//     if( !new RegExp(longinPersonOrgpath).test(ret.orgPath)){
//         return;//不在管辖部门，不显示
//     }
//     let pData = {
//         'devices' : [ret.deviceId],
//         'deviceType': "DSJ"
//     };
//     ajax({
//         url: '/gmvcs/instruct/mapcommand/devicegps',
//         method: 'post',
//         data: pData
//     }).then(result => {
//         let obj = {};
//         if (result.code != 0) {
//             obj.longitude = '经度:-';
//             obj.latitude = '纬度:-';
//         }
//         if(!result.data[ret.deviceId]){
//             obj.longitude = '经度:-';
//             obj.latitude = '纬度:-';
//         }else{
//             obj.longitude = '经度:'+result.data[ret.deviceId].longitude;
//             obj.latitude = '纬度:'+result.data[ret.deviceId].latitude;
//         }
//         if(ret.sosType =='SOS'){
//             obj.type ="SOS告警";
//         }
//         sszhmap.toggleshow();
//         obj.person = ret.userName + '记录仪';
//         obj.gbcode = ret.deviceId;
//         obj.userName = ret.userName;
//         obj.time = ret.sosDate;
//         obj.state = 1;
//         obj.sosId = ret.sosId;
//         // obj.longitude = ret.longitude;
//         // obj.latitude = ret.latitude;
//         obj.userCode = ret.userCode;
//         sszhgjxxManage.gjxxlist.push(obj);
//     })
//
//
// });
//
// socket.on('STATUS', (ret) => {
//     // if(ret.closed == "true") {
//     //     socket.close();
//     // }
// });
//
// socket.on('error', (error) => {
//     socket.close();
// });
// socket.on('reconnecting', (error) => {
//    //console.log(error);
// });
// socket.on('connect_error', (error) => {
//     error_total++;
//     if(error_total > 9) {
//         error_total = 0;
//         socket.close();
//        // console.log("=====重连次数超出限制，已断开socket连接=====");
//     }
// });
//
// socket.on('connect_timeout', (timeout) => {
//    // console.log("connect_timeout:", timeout);
// });
//===============================自定义拖动=============================
let dargObject = {
    a: '',
    b: '',
    c: '',
    w: '',
    h: '',
    move: function (o, e, w, h) {
        this.a = o;
        this.w = w;
        this.h = h;
        document.all ? this.a.setCapture() : window.captureEvents(Event.MOUSEMOVE);
        this.b = e.clientX - parseInt(this.a.style.left);
        this.c = e.clientY - parseInt(this.a.style.top);
        o.style.zIndex = this.getMaxIndex() + 1;
    },
    getMaxIndex: function () {
        let index = 0;
        let sszhyyth = document.getElementById('sszhyyth');
        let sszhlzsp = document.getElementById('sszhlzsp');
        if (sszhyyth.style.zIndex > sszhlzsp.style.zIndex) {
            index = sszhyyth.style.zIndex
        } else {
            index = sszhlzsp.style.zIndex
        }
        return parseInt(index);
    }
};
document.onmouseup = function () {
    if (!dargObject.a) return;
    document.all ? dargObject.a.releaseCapture() : window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
    dargObject.a = "";
};
document.onmousemove = function (d) {
    if (!dargObject.a) return;
    if (!d) d = event;
    if (d.clientX - dargObject.b < 0) { //控制左边界消失
        dargObject.a.style.left = '0px';
    } else if (d.clientX - dargObject.b + dargObject.w > $('.sszh-map').width()) { //控制右边界消失
        dargObject.a.style.left = ($('.sszh-map').width() - dargObject.w) + "px";
    } else {
        dargObject.a.style.left = (d.clientX - dargObject.b) + "px";
    }
    if (d.clientY - dargObject.c < 0) { //控制上边界消失
        dargObject.a.style.top = '0px';
    } else if (d.clientY - dargObject.c + dargObject.h > $('.sszh-map').height()) {
        dargObject.a.style.top = ($('.sszh-map').height() - dargObject.h) + "px"; //控制下边界消失
    } else {
        dargObject.a.style.top = (d.clientY - dargObject.c) + "px";
    }
};

function getLan() {
    return language_txt.sszhxt.sszhxt_sszh;
}

function getLanMain() {
    return language_txt.sszhxt.main;
}

function getLanFace() {
    return language_txt.sszhxt.sszhxt_znsb;
}