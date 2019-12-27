import './sszhxt-gjcx.css';
import ajax from '../../services/ajaxService';
import {
    notification,
    createForm
} from 'ane';
import moment from 'moment';
import {
    languageSelect
} from '../../services/configService';
import {
    orgIcon,
    isDevice,
} from "/apps/common/common-gb28181-tyywglpt-device-type";
// 权限管理
import * as menuService from '../../services/menuService';

export const name = 'sszhxt-gjcx';
const storage = require('../../services/storageService.js').ret;


//const commonMap = require('../common/common-map.js');
let language_txt = require('../../vendor/language').language;
let vm,
    gjcxMap,
    GisObject,
    drawPathObj,
    iframeWin; //点击左边选项之后的画轨迹对象

avalon.component(name, {
    template: __inline('./sszhxt-gjcx.html'),
    defaults: {
        orgData: [],
        orgPath: '', // 部门选择的值
        orgId: '',
        selectedTitle: '',
        page: 0,
        pageSize: 10,
        $form: createForm(), // 查询表单
        searchData: [], // 查询到的列表数据
        key: '', //关键字
        searchdataTime: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'), //查询日期
        datatimeEndTime: moment().format('YYYY-MM-DD HH:mm:ss'), //查询日期
        shebei: false,
        renyuan: true,
        activeToggle: 1,
        mapHeight: 0,
        selectType: 'renyuan',
        selectType2: 'renyuan',
        noData: false, //显示暂无数据信息
        showPlayBtn: true,
        btnDisabled: true, //等全部gps轨迹数据回来才可点击按钮
        times: 2, //加速默认2倍
        speed: 1, //默认1X
        timeInterval: 1600, //默认间隔
        initPaths: [], //gps轨迹数组
        $$index: 0,
        gpsPage: 0,
        gpsPageSize: 200, //默认获取200个点
        sszhxt_language: getLan(), //英文翻译
        sszhxt_language_main: getLanMain(),
        extra_class_dialog: languageSelect == "en" ? true : false,
        selectOptionhide: true,
        useSearch: false,
        extraExpandHandle: function (treeId, treeNode, selectedKey) {
            let data = {
                parentRid: treeNode.rid,
                superiorPlatformId: treeNode.platformId || treeNode.superiorPlatformId
            };
            getOrgbyExpand(data).then((ret) => {
                let treeObj = $.fn.zTree.getZTreeObj(treeId);
                if (ret.code == 0) {
                    treeObj.addNodes(treeNode, changeTreeData(ret.data));
                }
                if (selectedKey != treeNode.key) {
                    let node = treeObj.getNodeByParam('key', selectedKey, treeNode);
                    treeObj.selectNode(node);
                }
            });
        },
        onInit(event) {
            vm = event.vmodel;
            let _this = this;
            // let storeJson = storage.getItem(name);
            // for (var i in storeJson) {
            //     if (i == 'orgPath' || i == 'key' || i == 'orgId' || i == 'selectedTitle') {
            //         this[i] = storeJson[i];
            //     } else if (i == 'day') {
            //         this['searchdataTime'] = storeJson[i] ? moment(storeJson[i]).format('YYYY-MM-DD') : '';
            //     }
            // };
            // 获取部门数据
            getOrgAll().then((ret) => {
                if (ret.code == 0) {
                    let data = changeTreeData(ret.data);
                    _this.orgData = data;
                    if (!_this.orgPath) {
                        _this.orgPath = data[0].path;
                        _this.orgId = data[0].key;
                    }
                    this.useSearch && this.search();
                } else {
                    let content = getLanMain().getDepartmentF;
                    showMessage('error', content);
                }
            });
            //    mapInitObj.initCallback();


        },
        // 初始化
        onReady() {
            this.mapHeight = (document.documentElement.clientHeight - 36 - 70) + 'px';
            let width = (document.documentElement.clientWidth) + 'px';
            //   mapInitObj.domReadyCallback(gjcxMap.initMap);
            if ($('#mapIframe')[0].contentWindow.esriMap) {
                $('#mapIframe')[0].contentWindow.esriMap.remove_overlay();
                $('#mapIframe')[0].contentWindow.esriMap.removeTrackLayer('start');
            }
            menuService.menu.then(menu => {
                    let list =  menu.SSZH_MENU_SSZHXT;
                    avalon.each(list, (index, el) => {
                        if (el == 'INSTRUCT_FUNCTION_GJCX_SEARCH') {
                          this.useSearch = true;
                        }
                    })
                })
        },
        onDispose() {
            if (drawPathObj) {
                if (drawPathObj && drawPathObj.isGettingTrack) //停止递归请求数据
                    drawPathObj.isGettingTrack = false;
                drawPathObj.removeLayer(drawPathObj.curTrackId); //清除掉上次画的轨迹
                drawPathObj.clearTimer();
                drawPathObj.clearGraphicsByLayer(drawPathObj.markerId);
                // drawPathObj.resetLayerPos({
                //     longitude: 113.2693246420,
                //     latitude: 23.1520769760
                // }, 10);
                vm.btnDisabled = true;
                vm.showPlayBtn = true;
            }
            if ($('#mapIframe')[0].contentWindow.esriMap) {
                $('#mapIframe')[0].contentWindow.esriMap.remove_overlay();
            }
            //  mapInitObj.disposeCallback();

        },
        handleInputFocus(ev) {
            $(ev.target).siblings('.close-clear').show();
        },
        handleInputBlur(ev) {
            $(ev.target).siblings('.close-clear').hide();
        },
        handleCloseClear(ev) {
            this.key = "";
            $(ev.target).siblings('input').focus();
            return false;
        },
        getSelected(key, title, node) {
            this.orgPath = node.path;
            this.orgId = key;
            this.selectedTitle = title;
        },
        // 选择部门回调
        handleTreeChange(e, selectedKeys) {
            this.orgPath = e.node.path;
            this.orgId = e.node.key;
        },

        // select(type) {
        //     this.searchData = [];
        //     switch (type) {
        //         case 'shebei':
        //             this.shebei = true;
        //             this.renyuan = false;
        //             this.selectType = 'shebei';
        //             this.activeToggle = 0;
        //             break;
        //         case 'renyuan':
        //             this.shebei = false;
        //             this.renyuan = true;
        //             this.selectType = 'renyuan';
        //             this.activeToggle = 1;
        //             break;
        //     };

        //     this.search();
        // },
        selectOptionChoose() {
            this.selectOptionhide = !this.selectOptionhide;
        },
        changeSelect(mode) {
            this.searchData = [];
            switch (mode) {
                case 'shebei':
                    this.shebei = true;
                    this.renyuan = false;
                    this.selectType = 'shebei';
                    this.activeToggle = 0;
                    break;
                case 'renyuan':
                    this.shebei = false;
                    this.renyuan = true;
                    this.selectType = 'renyuan';
                    this.activeToggle = 1;
                    break;
            };
            this.useSearch && this.search();
            this.selectOptionhide = true;
        },
        datatimechange(e) {
            this.searchdataTime = e.target.value;
        },
        datatimechangeEndTime(e){
            this.datatimeEndTime = e.target.value;
        },
        handleQuickSearch(event) {
            if (event.keyCode == 13) {
                this.search();
            }
        },
        search() {
            if (!this.useSearch) {
                showMessage('warn', getLanMain().notLicen);
                return;
            }
            this.selectType2 = this.selectType;
            let data = {};
            // let content = getLan().inputError;
            // if (/[~#^$@%&!?,;.。+“‘·*]/gi.test(this.key)) {
            //     showMessage('warn', content );
            //     return;
            // }
            data.orgPath = this.orgPath;
            data.orgId = this.orgId;
            data.key = this.key;
            data.beginTime = this.searchdataTime == "" ? this.searchdataTime : Date.parse(new Date(this.searchdataTime.replace(/-/g, "/")));
            data.endTime = this.datatimeEndTime == "" ? this.datatimeEndTime : Date.parse(new Date(this.datatimeEndTime.replace(/-/g, "/")));
            data.page = 0;
            data.pageSize = 1000;

            let reg = /(^[\sa-zA-Z0-9\u4e00-\u9fa5_-]{1,20}$|^\s{0}$)/;
            let tipText = '';
            // let startTime = moment(data.beginTime).format('x') * 1;
            // let endTime = moment(data.endTime).format('x') * 1;
            if (data.beginTime > data.endTime) {
                notification.warn({
                    title: this.sszhxt_language.notification,
                    message: this.sszhxt_language_main.timeSelectWarn
                });
                return;
            }
            tipText = vm.extra_class_dialog ? "User must include less than 20 characters with digits, letters, ''-'', ''_'' and space !" : "人员应为字母、数字、中文、‘-’、‘_’和空格组成，且不超过20位！";
            if (!reg.test(data.key)) {
                showMessage('warn', tipText);
                return;
            }

            let url = '/gmvcs/instruct/track/user/list';
            // if (this.selectType == 'shebei') {
            //     url = '/gmvcs/instruct/track/device/list';
            // } else {
            //     url = '/gmvcs/instruct/track/user/list';
            // }
            getItemsData(url, data).then((ret) => {
                if (ret.code == 0) {
                    let datas = ret.data.currentElements;
                    if (datas.length == 0) {
                        this.noData = true;
                    } else {
                        this.noData = false;
                    }

                    avalon.each(datas, (i, el) => {
                        // i == 0 ? el.active = true : el.active = false;
                        el.active = false;
                    });
                    this.searchData = datas;
                    let item = this.searchData[0];
                } else {
                    let content = getLan().getListF;
                    showMessage('error',content);
                }
            });
            if (drawPathObj) {
                if (drawPathObj && drawPathObj.isGettingTrack) //停止递归请求数据
                    drawPathObj.isGettingTrack = false;
                drawPathObj.removeLayer(drawPathObj.curTrackId); //清除掉上次画的轨迹
                drawPathObj.clearTimer();
                drawPathObj.clearGraphicsByLayer(drawPathObj.markerId);
                // drawPathObj.resetLayerPos({
                //     longitude: 113.2693246420,
                //     latitude: 23.1520769760
                // }, 10);
                vm.btnDisabled = true;
                vm.showPlayBtn = true;
            }
        },
        itemClick($index) {
            let item = this.searchData[$index];
            let device_name = (item.userName || '-') + '(' + (item.userCode || '-') + ')';
            storage.setItem('cjxFixBugDeveviceName', device_name);
            this.$$index = $index;
            if (item.active == true)
                return false;
            avalon.each(this.searchData, (i, el) => {
                el.active = false;
            });
            item.active = true;
            if (drawPathObj) { //已经有轨迹的情况下
                drawPathObj.removeLayer(drawPathObj.curTrackId); //清除掉上次画的轨迹
                drawPathObj.clearTimer();
                drawPathObj.clearGraphicsByLayer(drawPathObj.markerId);
                vm.btnDisabled = true;
                vm.showPlayBtn = true;
            }

            let json = {
                deviceId: item['deviceId'],
                deviceType: "DSJ",
                day: item.createTime,
            };
            if (drawPathObj && drawPathObj.isGettingTrack) //停止递归请求数据
                drawPathObj.isGettingTrack = false;
            //   drawPathObj = new DrawPath(json, GisObject, vm, getTrackTotal, getPageDeviceTrack);
            iframeWin = $('#mapIframe')[0].contentWindow;
            $('#mapIframe')[0].contentWindow.esriMap.removeTrackLayer('stop');
            drawPathObj = new iframeWin.DrawPath(json, GisObject, vm, getTrackTotal, getPageDeviceTrack);
            drawPathObj.draw();

        },
        //播放、暂停按钮点击
        playBtnClick() {
            if (vm.btnDisabled)
                return false;
            this.showPlayBtn = !this.showPlayBtn;
            if (!this.showPlayBtn)
                drawPathObj.addMarker(this.timeInterval); //播放
            else
                drawPathObj.clearTimer(); //暂停
        },
        handleStop() {
            if (vm.btnDisabled)
            return false;
            this.showPlayBtn = !this.showPlayBtn;
            if(!this.showPlayBtn) drawPathObj.addMarker(this.timeInterval); //播放
            if(this.showPlayBtn) drawPathObj.clearTimer();
        },
        handleStepPre() {
            if(vm.btnDisabled)
                return false;
            if(this.speed ==1)
                this.speed == 1
            else
                this.speed = this.speed/(this.times*2);
            vm.setSpeed();
        },
        handleSlower() {
            if (vm.btnDisabled)
                return false;
            if(this.speed == 1)
            return false;
            else
                this.speed = this.speed/this.times;
            vm.setSpeed();
        },
        //加速按钮点击
        handleFaster() {
            if (vm.btnDisabled)
                return false;
            if (this.speed >= 8)
                this.speed = 1;
            else
                this.speed = this.speed * this.times;
            vm.setSpeed();
        },
        handleStepNext() {
            if(vm.btnDisabled)
                return false;
            if (this.speed == 4) 
                this.speed = 1;
            else 
                this.speed = this.speed *(this.times*2);
            vm.setSpeed();
            
        },
        setSpeed (){
            if (this.speed< 1) 
                this.speed =1
            this.timeInterval = (1 / this.speed) * 1600;
            if (!this.showPlayBtn) { //如果在播放中点击加速按钮
                drawPathObj.clearTimer();
                drawPathObj.timer = null;
                drawPathObj.addMarker(this.timeInterval);
            }
        }
    }
});

//===============================地图初始化部分========================================
// gjcxMap = {
//     initMap: function () {
//         dojo.require("extras.MapInitObject");
//         dojo.require("esri/geometry/Point");
//         dojo.require("esri/geometry/Polyline");
//         dojo.require("esri/symbols/PictureMarkerSymbol");
//         dojo.require("esri/symbols/TextSymbol");
//         dojo.require("esri/symbols/Font");
//         dojo.require("esri/graphic");
//         dojo.require("esri/InfoTemplate");
//         dojo.require("esri/layers/GraphicsLayer");
//         dojo.require("esri/toolbars/draw");
//         dojo.require("esri/geometry/webMercatorUtils");
//         dojo.require("esri/symbols/SimpleLineSymbol");
//         dojo.require("esri/symbols/SimpleMarkerSymbol");

//         dojo.require("esri/Color");
//         dojo.ready(function () {
//             GisObject = new extras.MapInitObject("gjcx-map");
//             GisObject.setMapOptions({
//                 logo: false,
//                 level: 2,
//                 center: [113.2693246420, 23.1520769760],
//                 zoom: 10
//             });
//             GisObject.addDefaultLayers();
//             GisObject.map.setZoom(8);

//         });
//     }

// };

// function DrawPath(json, mapObj, vm) {
//     this.json = json;
//     this.totalPage = 0;
//     this.maxPage = 0;
//     this.curGpsPage = 0;
//     this.gpsPageSize = 200;
//     this.beginPoint = {};
//     this.isGettingTrack = true;
//     this.curTrackId = null;
//     this.TrackGraphicLayer = null;
//     this.beginPoint = {};
//     this.timer = null;
//     this.timers = [];//用来存储画线定时器句柄
//     this.polyineCount = 0;
//     this.polyLineEndCount = 0;
//     this.arrPoints = [];//用于存储蓝色标记数组
//     this.markerCount = 0;//蓝色标记数组下标
//     this.markerGraphics = [];//上一个蓝色标记数组(包括设备和时间信息)
//     this.markerId = "";
//     this.markerLayer = null;
//     this.map = mapObj.map;
//     this.vm = vm;
//     this.init();

// }
// DrawPath.prototype = {
//     constructor: DrawPath,
//     init: function () {
//         DrawPath.curTrackId = this.curTrackId = 'trackLine' + Math.random();
//         DrawPath.TrackGraphicLayer = this.TrackGraphicLayer = new esri.layers.GraphicsLayer({ id: DrawPath.curTrackId });
//     },
//     draw: function () {
//         this.getTrackTotal();
//     },
//     getTrackTotal: function () {
//         getTrackTotal(this.json).then((ret) => {
//             this.total = ret.data.gpsSize;
//             this.maxPage = Math.ceil(this.total / this.gpsPageSize);
//             //   this.mapObj.polyLineEndCount = this.maxPage-1;
//             if (this.total == 0) {
//                 showMessage('warn', '暂无gps轨迹信息');
//                 return false;
//             }

//             this.getGpsPageTrack(this.json, 0, this.gpsPageSize);

//         });
//     },
//     getGpsPageTrack: function (json, page, pageSize) {
//         console.log('m:' + this.maxPage, 'page' + this.curGpsPage, this.timers);
//         if (this.curGpsPage >= this.maxPage) {
//             //   vm.btnDisabled = false;
//             return false;
//         } else if (!this.isGettingTrack) {
//             return false;
//         }
//         getPageDeviceTrack(json, page, pageSize).then((ret) => {
//             if (this.curGpsPage == 0) {
//                 this.beginPoint = ret.data.currentElements[0];
//                 console.log('lon:' + this.beginPoint.longitude, 'this.lat:' + this.beginPoint.latitude);
//                 this.map.centerAndZoom(new esri.geometry.Point(this.beginPoint.longitude, this.beginPoint.latitude), 20);
//             }
//             this.polyLine(ret.data.currentElements, this.maxPage - 1);
//             //  this.mapObj.addLine(ret.data.currentElements, 200,vm.curGpsPage);
//             this.arrPoints = this.arrPoints.concat(ret.data.currentElements);
//             ++this.curGpsPage;
//             this.getGpsPageTrack(json, this.curGpsPage, this.gpsPageSize);

//         });
//     },
//     polyLine: function (curArr, curPage) {
//         let paths = [];
//         let inPaths = [];
//         for (var i in curArr) {
//             inPaths.push([curArr[i]['longitude'], curArr[i]['latitude']]);
//         }
//         paths.push(inPaths);
//         let polyline = new esri.geometry.Polyline({
//             "paths": paths, "spatialReference": this.map.spatialReference
//         });
//         polyline = esri.geometry.webMercatorUtils.geographicToWebMercator(polyline);
//         //画线
//         let polylineSymbol = new esri.symbols.SimpleLineSymbol().setColor(new esri.Color([255, 0, 0, 0.5])).setWidth(5);
//         let poliLineGraphic = new esri.Graphic(polyline, polylineSymbol);
//         //   this.TrackGraphicLayer =  new esri.layers.GraphicsLayer({ id: this.curTrackId });
//         // this.map.centerAndZoom(new esri.geometry.Point(beginPoint.longitude, beginPoint.latitude),16);

//         //画起始,终止点
//         //  let beginMarkerGraphic = this.createMarker("../../static/image/sszhxt/begin.png", beginPoint);
//         //  let endMarkerGraphic = this.createMarker("../../static/image/sszhxt/end.png", endPoint);

//         if (DrawPath.TrackGraphicLayer == this.TrackGraphicLayer) //为了防止请求时上一次的轨迹没清完
//             DrawPath.TrackGraphicLayer.add(poliLineGraphic);
//         if (this.polyineCount == 0) {
//             let beginPoint = curArr[0];
//             let beginMarkerGraphic = this.createMarker("../../static/image/sszhxt/begin.png", beginPoint);
//             DrawPath.TrackGraphicLayer.add(beginMarkerGraphic);
//             this.vm.btnDisabled = true;
//         }
//         console.log('trackId:' + DrawPath.curTrackId);
//         if (this.polyineCount == curPage) {
//             let endPoint = curArr[curArr.length - 1];
//             let endMarkerGraphic = this.createMarker("../../static/image/sszhxt/end.png", endPoint);
//             DrawPath.TrackGraphicLayer.add(endMarkerGraphic);
//             this.vm.btnDisabled = false;//轨迹画完播放按钮才能呈现激活状态
//         }
//         this.map.addLayer(DrawPath.TrackGraphicLayer);
//         ++this.polyineCount;
//     },
//     setMapExtend: function (geometry) {
//         this.map.setExtent(geometry.getExtent().expand(2));
//     },

//     createMarker: function (url, oPoint) {
//         var iconUrl = url ? url : "../../static/image/sszhxt/locate.png";
//         // var cruPoint = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(113.2693246420, 23.1520769760));
//         var curPoint = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(oPoint.longitude, oPoint.latitude));
//         var myIcon = new esri.symbols.PictureMarkerSymbol({ "url": iconUrl, "height": 19, "width": 13, "type": "esriPMS", xoffset: 0, yoffset: 8 });
//         var pictureSymbol = new esri.symbols.PictureMarkerSymbol(myIcon);
//         var marker = new esri.Graphic(curPoint, pictureSymbol);
//         return marker;
//     },
//     addMarker: function (timeInterval, step) {
//         this.timer = setInterval(() => {
//             this.clearGraphicsByLayer(this.markerId);//清除上一次的蓝色标记
//             if (this.markerCount == (this.arrPoints.length)) {
//                 this.markerCount = 0;
//                 clearInterval(this.timer);
//                 this.vm.showPlayBtn = true;
//                 return false;
//             }
//             let curPoint = this.arrPoints[this.markerCount];
//             let diviceInfo = (curPoint['deviceName'] || '-') + '(' + (curPoint['deviceId'] || '-') + ')';
//             let deviceTiime = formatDate(curPoint['time']);
//             this.markerId = 'markerId' + Math.random();
//             let point = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(curPoint.longitude, curPoint.latitude));
//             //蓝色标记物
//             let markerGraphic = this.createMarker(null, curPoint);
//             let font = new esri.symbols.Font().setSize("16px").setFamily("微软雅黑").setWeight(esri.symbol.Font.WEIGHT_BOLD);
//             let font2 = new esri.symbols.Font().setSize("16px").setFamily("微软雅黑");
//             let textSymbol = new esri.symbols.TextSymbol(diviceInfo).setFont(font).setColor(new esri.Color([4, 128, 209, 0.9])).setOffset(-70, 55).setAlign(esri.symbol.TextSymbol.ALIGN_START);
//             let textSymbol2 = new esri.symbols.TextSymbol(deviceTiime).setFont(font2).setColor(new esri.Color([4, 128, 209, 0.9])).setOffset(-70, 35).setAlign(esri.symbol.TextSymbol.ALIGN_START);
//             //设备名称
//             let textGraphic = new esri.Graphic(point, textSymbol);
//             //时间
//             let textGraphic2 = new esri.Graphic(point, textSymbol2);
//             this.markerLayer = new esri.layers.GraphicsLayer({ id: this.markerId });
//             this.markerGraphics.concat([markerGraphic,textGraphic,textGraphic2]);
//             this.markerLayer.add(markerGraphic);
//             this.markerLayer.add(textGraphic);
//             this.markerLayer.add(textGraphic2);
//             this.map.addLayer(this.markerLayer);
//             let step = step || 1;
//             this.markerCount = this.markerCount + step;
//         }, timeInterval);
//     },
//     removeLayer: function (layerId) {
//         var layer = this.map.getLayer(layerId);
//         if (layer) {
//             this.map.removeLayer(layer);
//         }
//     },
//     clearGraphicsByLayer: function (markerId) {
//         var markerLayer = this.map.getLayer(markerId);
//         if(markerLayer)
//             markerLayer.clear();
//     },
//     resetLayerPos:function(centePpoint,zoom){
//         this.map.centerAndZoom(new esri.geometry.Point(centePpoint.longitude, centePpoint.latitude), 10);
//     },
//     addLine: function (arr, time, curPage) {
//         let length = arr.length, count = 0, addLineTimer = null;
//         let _this = this;
//         addLineTimer = setInterval(() => {
//             if (count == length - 1) {
//                 //  console.log(111);
//                 clearInterval(addLineTimer);
//                 // gjcxMap.setMapExtend(new esri.geometry.Polyline({
//                 //     "paths": gjcxMap.paths
//                 // }));
//                 return false;
//             }
//             //   console.log(count,arr[count]['longitude'],arr[count]['latitude']);

//             let point1 = arr[count];
//             let point2 = arr[++count];
//             let arrTwoPoint = [point1, point2];
//             // if(count == arr.length-1)
//             // _this.polyLine([arr[arr.length-2],arr[arr.length-1]]);
//             // else
//             //  console.log('count'+count);
//             _this.polyLine(arrTwoPoint, curPage);
//         }, time);
//         gjcxMap.timers.push(addLineTimer);

//     },
//     clearTimer: function () {
//         if (this.timer)
//             clearInterval(this.timer);
//         for (var i in this['timers']) {
//             clearInterval(this['timers'][i]);
//             this['timers'][i] = null;
//         }
//         this.timer = null;
//         this['timers'] = [];
//     }
// };



//将数据转换为key,title,children属性
function changeTreeData(treeData) {
    var i = 0,
        len = treeData.length,
        picture = '/static/image/tyywglpt/org.png';
    for (; i < len; i++) {
        if (isDevice(treeData[i].type, false) !== orgIcon) {
            treeData.splice(i, 1);
            i--;
            len--;
            continue;
        };
        treeData[i].icon = picture;
        treeData[i].key = treeData[i].rid;
        treeData[i].title = treeData[i].itemName;
        // treeData[i].key = treeData[i].orgId;
        // treeData[i].title = treeData[i].orgName;
        treeData[i].children = treeData[i].childs || [];
        treeData[i].isParent = true;
        if (treeData[i].hasOwnProperty('dutyRange'))
            delete(treeData[i]['dutyRange']);
        if (treeData[i].hasOwnProperty('extend'))
            delete(treeData[i]['extend']);
        if (treeData[i].hasOwnProperty('orderNo'))
            delete(treeData[i]['orderNo']);

        if (!(treeData[i].childs && treeData[i].childs.length)) {

        } else {
            changeTreeData(treeData[i].childs);
        };
    };
    return treeData;
}
//去除数据前后空格
function trimData(json) {
    for (let i in json) {
        json[i] = $.trim(json[i]);
    };
    return json;
}

//提示框提示
function showMessage(type, content) {
    let titile_content = getLanMain().notification;
    notification[type]({
        title: titile_content,
        message: content
    });
}
// 接口
/* 获取部门 */
function getOrgAll() {
    return ajax({
        url: '/gmvcs/uom/device/gb28181/v1/view/getPlatformView',
        method: 'get',
        cache: false
    });
}
// function getOrgAll() {
//     return ajax({
//         url: '/gmvcs/uap/org/find/fakeroot/mgr',
//         //url: '/gmvcs/uap/org/all',
//         //   url: '/api/tyywglpt-cczscfwgl',

//         method: 'get',
//         cache: false
//     });
// }
/*
 *分级获取部门
 *  */
function getOrgbyExpand(data) {
    return ajax({
        url: '/gmvcs/uom/device/gb28181/v1/view/ViewItemNew?parentRid=' + data.parentRid + '&superiorPlatformId=' + data.superiorPlatformId,
        method: 'get',
        cache: false,
        data: null,
        async: true
    });

}
// function getOrgbyExpand(orgId, checkType) {
//     return ajax({
//         url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + orgId + '&&checkType=' + checkType,
//         method: 'get',
//         cache: false
//     });

// }
/* 获取列表记录 */
function getItemsData(url, json) {
    return ajax({
        url: url,
        method: 'post',
        data: trimData(json)
    });
}
/* 根据设备Id获取轨迹 */
function getDeviceTrack(json) {
    return ajax({
        url: '/gmvcs/instruct/track/gps',
        method: 'post',
        data: json
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

//时间戳转日期
avalon.filters.formatDate = formatDate;
avalon.filters.formatDateObj = function (obj) {
    return {
        title: moment(obj['title']).format('YYYY-MM-DD HH:mm:ss')
    };
};


avalon.filters.formatOnlineTime = formatOnlineTime;
avalon.filters.formatOnlineTimeObj = function (obj) {
    return {
        title: formatOnlineTime(obj['title'])
    };
};
avalon.filters.fillterEmpty = fillterEmpty;
avalon.filters.fillterEmptyObj = function (obj) {
    return {
        title: fillterEmpty(obj['title'])
    };
};

function fillterEmpty(str) {
    return (str === "" || str === null || str === undefined) ? "-" : str;
}

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

function formatOnlineTime(time) {
    if (time <= 0) {
        return "00:00:00"
    }
    let hour = parseInt(time / 3600);
    let minute = parseInt((time - hour * 3600) / 60);
    let second = time % 60;
    let timeStr = (hour < 10 ? '0' + hour : hour) + ':' + (minute < 10 ? '0' + minute : minute) + ':' + (second < 10 ? '0' + second : second);
    return timeStr;
}

function getLanMain () {
    return language_txt.sszhxt.main;
}
function getLan () {
    return language_txt.sszhxt.sszhxt_gjcx
}