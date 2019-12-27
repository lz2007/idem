/**
 * 实时指挥系统--录像回放
 *caojiacong
 */
import avalon from 'avalon2';
import ajax from '../../services/ajaxService';
import {
    Gxxplayer
} from '../../vendor/gosunocx/gosunocx';
import moment from 'moment';
import {
    createForm,
    notification
} from 'ane';
import {
    ViewItem
} from "/apps/common/common-gb28181-tyywglpt-view-api";
import {
    orgIcon,
    isDevice
} from "/apps/common/common-gb28181-tyywglpt-device-type";
const storage = require('../../services/storageService.js').ret;
export const name = 'sszhxt-lxhf';
require('./sszhxt-lxhf.css');
import {
    gxxOcxVersion,
    languageSelect
} from '../../services/configService';
// 权限管理
import * as menuService from '../../services/menuService';

let language_txt = require('../../vendor/language').language;
let vm, player, pollTimer, processTimer, ocxele;
let enableQuery = true,
    queryTimer = null;
let iframeWindow, locationMaker;
avalon.filters.fillterEmpty = function (str) {
    return (str === "" || str === null) ? "..." : str;
}

//页面组件
avalon.component(name, {
    template: __inline('./sszhxt-lxhf.html'),
    defaults: {
        sidebarMode: 1, //0--设备  1--警员
        $form: createForm(),
        $labelForm: createForm(),
        currentPage: 0, //录像列表当前页码
        pageSize: 20,
        totalPages: 0,
        orgData: [],
        orgId: "",
        orgPath: "",
        orgName: "",
        deviceKey: "", //设备查询关键字
        userKey: "", //警员查询关键字
        queryTime: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'),
        queryTime2: moment().format('YYYY-MM-DD HH:mm:ss'),
        videoPreData: [], //保存上一页的录像数据
        videoHeight: 400,
        isNull: false,
        labelNull: false,
        labelTypeOptions: [],
        tipText: language_txt.sszhxt.main.needPlug,
        showtip: true,
        useSearch: false,
        labelInfo: {
            "rid": "",
            "labelType": "",
            "labelTime": "",
            "location": "",
            "description": ""
        },
        labelTypeName: '',
        activeVideo: '', //当前选中的录像数据的索引值
        activeVideoRid: '', //当前选中的录像数据的rid
        soundLevel: 50, //实时音量值
        soundStartLevel: 50, //起始音量值
        soundStartX: 0, //按下鼠标时的鼠标位置
        playing: false,
        isStop: false,
        speed: 1,
        isEdit: false,
        locations: [], //轨迹数据
        locationIndex: 0, //轨迹点索引值
        dataStr: '',
        dataJson: {},
        downloadTipShow: false,
        enableFetchPath: true, //是否可以获取轨迹
        showSide: true, //侧栏是否展开
        validJson: {
            "labelType": true,
            "location": true,
            "labelTime": true,
            "description": true
        },
        descriptionReg: /(.|\n)+/,
        deviceData: {}, // 视频切换信息
        playingchange: false, //视频切换标志位,
        selectOptionhide: true,
        isie: '',
        sszhxt_language: getLan(),
        sszhxt_language_main: getLanMain(),
        extra_class_dialog: languageSelect == "en" ? true : false,
        onInit(event) {
            vm = event.vmodel;
            vm.isie = isIE();
            window._onOcxEventProxy = _onOcxEventProxy;
            video.init();
            this.$watch('dataJson', (v) => {
                if (v) {
                    this.queryTime = v.day ? moment(v.day * 1).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
                    this.sidebarMode = v.sidebarMode;
                    this.currentPage = v.page;
                }
            });
            this.$watch('soundLevel', (v) => {
                if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                    player.SoundCtrl(1, 1, 2);
                    player.setVolume(v + 1);
                }
            })
        },
        onReady() {
            setVideoHeight();

            this.dataStr = storage.getItem(name);
            // this.dataJson = this.dataStr ? JSON.parse(this.dataStr) : null;
            this.fetchMarkTypeOptions();
            this.fetchOrgData(() => {
                this.fetchVideoList(false);
            });
            $(window).on('resize', setVideoHeight);
            popover();
            iframeWindow = document.getElementById("mapIframe").contentWindow;
            if (iframeWindow.esriMap) {
                iframeWindow.esriMap.remove_overlay();
                iframeWindow.esriMap.removeTrackLayer();
            }
            menuService.menu.then(menu => {
                let list = menu.SSZH_MENU_SSZHXT;
                avalon.each(list, (index, el) => {
                    if (el == 'INSTRUCT_FUNCTION_LXHF_SEARCH') {
                        this.useSearch = true;
                    }
                })
            })

        },
        onDispose() {
            if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                video.uninit();
                video.closeAllVideoTape();
            }
            $('#mapIframe').css({
                width: '100%',
                height: '100%'
            });
            $('.map-iframe-wrap')[0].style.height = '';
            $('.map-iframe-wrap')[0].style.width = '';
            window.clearInterval(pollTimer);
            window.clearInterval(processTimer);
            window.clearTimeout(queryTimer);
            enableQuery = true;
            $(window).off('resize', setVideoHeight);
            this.enableFetchPath = false; //离开时禁止获取轨迹，否则可能会导致其他页面上的地图有该页面的轨迹
            iframeWindow = document.getElementById("mapIframe").contentWindow;
            iframeWindow.esriMap.remove_overlay();

        },
        selectOptionChoose() {
            this.selectOptionhide = !this.selectOptionhide;
        },
        changeSelect(mode) {
            if (mode === this.sidebarMode) {
                return;
            }
            this.sidebarMode = mode
            this.deviceKey = "";
            this.userKey = "";
            enableQuery = true;
            this.useSearch && this.handleQuery();
            this.selectOptionhide = true;
        },
        getShowStatus(show) {
            vm.downloadTipShow = show;
        },
        //日期选择框处理
        handleDateClick() {
            if ($('#ocx-iframe').length) {
                return;
            }
            setTimeout(() => {
                $('.ane-datepicker-panel-container').append('<iframe id="ocx-iframe" src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position:absolute; visibility:inherit; top:0px;left:0px;width:100%; height:100%;z-index:0;opacity:0;filter:alpha(opacity=0);"></iframe>')
            }, 100);
        },
        //标注编辑日期选择框处理
        handleEditDateClick() {
            if ($('#ocx-iframe-edit').length) {
                return;
            }
            setTimeout(() => {
                $('.ane-datepicker-panel-container').append('<iframe id="ocx-iframe-edit" src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position:absolute; visibility:inherit; top:0px;left:0px;width:100%; height:100%;z-index:0;opacity:0;filter:alpha(opacity=0);"></iframe>')
            }, 100);
        },
        //设备/警员切换
        // handleModeChange(event) {
        //     if ($(event.target).index() === this.sidebarMode) {
        //         return;
        //     }
        //     this.sidebarMode = $(event.target).index();
        //     this.deviceKey = "";
        //     this.userKey = "";
        //     enableQuery = true;
        //     this.handleQuery();
        // },
        handlePress(event) {
            let keyCode = event.keyCode || event.which;
            if (keyCode == 13) {
                this.handleQuery()
            } else if (keyCode === 32 && event.target.selectionStart === 0) {
                return false;
            }
        },
        handleQueryFocus(event) {
            $(event.target).siblings('.input-close').show();
        },
        handleQueryBlur(event) {
            event.target.value = $.trim(event.target.value);
            $(event.target).siblings('.input-close').hide();
        },
        handleQueryClear(event) {
            if (this.sidebarMode == 0) {
                this.deviceKey = "";
            } else {
                this.userKey = "";
            }
            $(event.target).siblings('input').val('').focus()
        },
        handleQuery(e) {
            if (!this.useSearch) {
                showTips('warn', getLanMain().notLicen);
                return;
            }
            if (enableQuery) {
                // 将标注修改为初始状态
                this.isEdit = false;
                this.activeVideo = '';
                this.activeVideoRid = '';
                this.isNull = false;
                this.videoPreData = [];
                this.currentPage = 0;
                this.labelNull = false;
                this.enableFetchPath = false;
                this.labelInfo = {
                    "rid": "",
                    "labelType": "",
                    "labelTime": "",
                    "location": "",
                    "description": ""
                };
                if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                    video.stop();
                }
                $('.esriPopup .close').trigger('click');
                this.fetchVideoList(false);
                enableQuery = false;
                queryTimer = setTimeout(() => {
                    enableQuery = true;
                }, 2000)
                iframeWindow.esriMap && iframeWindow.esriMap.clearDrawLayer();
            }
        },
        handleSideBtn() {
            this.showSide = !this.showSide;
            if (!this.showSide) {
                $('.lxhf-main-container').css({
                    marginLeft: '0'
                });
                setVideoHeight();
            }
            if (this.showSide) {
                $('.lxhf-main-container').css({
                    marginLeft: '326px'
                });
                setVideoHeight();
            }
        },
        getSelected(key, title) {
            this.orgId = key;
        },
        handleTreeChange(e, selectedKeys) {
            this.orgPath = e.node.path;
            this.orgName = e.node.title;
        },
        extraExpandHandle(treeId, treeNode, selectedKey) {
            fetchOrgWhenExpand(treeId, treeNode, selectedKey);
        },
        //录像列表滚动加载
        handleListScroll(event) {
            let scroll = event.target.scrollTop;
            if (scroll && this.currentPage < this.totalPages - 1 && scroll + event.target.clientHeight >= event.target.scrollHeight) {
                this.currentPage++;
                this.fetchVideoList(true);
            }
        },
        //单帧后退
        handleStepPre(e) {
            if (notOcxPlug()) return;
            if ($(e.target).hasClass('disabled')) {
                return;
            }
            video.stepPre();
            this.playing = false; //单帧后退或前进时，录像会自动暂停播放
            clearInterval(pollTimer);
            let timestamp = video.getPlayTimeStamp();
            //退到最后一步时，清除掉地图上的maker
            if (timestamp === 0) {
                iframeWindow.esriMap.removePictureMarker(locationMaker);
                return;
            }
            if (!vm.locations.length) return;
            //获取应该标识出来的坐标点
            if (timestamp <= vm.locations[0].time) {
                vm.locationIndex = 0;
            } else {
                for (let i = vm.locations.length - 1; i > 0; i--) {
                    if (timestamp >= vm.locations[i - 1].time && timestamp <= vm.locations[i].time) {
                        vm.locationIndex = i - 1;
                        break;
                    }
                }
            }
            let el = vm.locations[vm.locationIndex];
            let attr = {
                "longitude": el.longitude,
                "latitude": el.latitude
            };
            iframeWindow.esriMap.removePictureMarker(locationMaker);
            locationMaker = iframeWindow.esriMap.addPictureMarker(el.longitude, el.latitude, iframeWindow.locationSymbol, null);
        },
        // 截图
        handleCut() {
            let succentContent = getLanMain().screenshotS;
            let errorContent = getLanMain().screenshotF;

            let obj = player.printOcxWindow()
            if (obj.code == 0) {
                showTips('success', succentContent + ' ' + ':D:\\CaptureFolder\\' + obj.time + '.jpg')
                return;
            }
            showTips('error', errorContent + obj.code);
        },
        // 全屏
        handleMaxView() {
            player.lxhf_maxView();
        },
        //慢放
        handleSlower(e) {
            if (notOcxPlug()) return;
            if (this.speed <= -16 || $(e.target).hasClass('disabled')) {
                return;
            }
            video.slower();
            video.ctrlPlaySpeed(-1);
            if (!this.playing) {
                video.pause();
            }
        },
        //暂停或播放
        handlePlay(e) {
            if (notOcxPlug()) return;
            if ($(e.target).hasClass('disabled')) {
                return;
            }
            this.playing = !this.playing;
            if (this.playing) {
                //如果录像播完了则重新开始播
                if (this.isStop) {
                    this.isStop = false;
                    this.locationIndex = 0;
                    //playByUrl里面已经包含了pollProcess()，所以此处不能再添加pollProcess(),否则processTimer无法按规定清除
                    video.playByUrl(this.activeVideoRid);
                } else {
                    video.play();
                    pollLocation(false); //轮询轨迹以同步
                    pollProcess(); //轮询录像播放进度
                }
            } else {
                video.pause();
                clearInterval(pollTimer);
                clearInterval(processTimer);
            }
        },
        //停止播放
        handleStop(e) {
            if (notOcxPlug()) return;
            if ($(e.target).hasClass('disabled')) {
                return;
            }
            video.stop();
        },
        //快进
        handleFaster(e) {
            if (notOcxPlug()) return;
            if (this.speed >= 16 || $(e.target).hasClass('disabled')) {
                return;
            }
            video.faster();
            video.ctrlPlaySpeed(1);
            if (!this.playing) {
                video.pause();
            }
        },
        //单帧前进
        handleStepNext(e) {
            if (notOcxPlug()) return;
            if ($(e.target).hasClass('disabled')) {
                return;
            }
            video.stepNext();
            this.playing = false; //单帧后退或前进时，录像会自动暂停播放
            clearInterval(pollTimer);
            let timestamp = video.getPlayTimeStamp();
            if (!vm.locations.length) return;
            //前进到最后一步时，清除掉地图上的maker
            if (timestamp === 0) {
                iframeWindow.esriMap.removePictureMarker(locationMaker);
                return;
            }
            //获取应该标识出来的坐标点
            if (timestamp >= vm.locations[vm.locations.length - 1].time) {
                vm.locationIndex = vm.locations.length - 1;
            } else {
                for (let i = 0; i < vm.locations.length - 1; i++) {
                    if (timestamp >= vm.locations[i].time && timestamp <= vm.locations[i + 1].time) {
                        vm.locationIndex = i;
                        break;
                    }
                }
            }
            let el = vm.locations[vm.locationIndex];
            let attr = {
                "longitude": el.longitude,
                "latitude": el.latitude
            };
            iframeWindow.esriMap.removePictureMarker(locationMaker);
            locationMaker = iframeWindow.esriMap.addPictureMarker(el.longitude, el.latitude, iframeWindow.locationSymbol, null);
        },
        handleLabelTimeChange(e) {
            if (e.target.value == "") {
                this.validJson.labelTime = false;
            } else {
                this.validJson.labelTime = true;
            }
        },
        handleFocus(name, event) {
            this.validJson[name] = true;
            $(event.target).siblings('.input-close').show();
        },
        /**
         * 表单验证，blur进行验证
         * @param {string} name 要验证的字段名
         * @param {vmodel} vm vm
         * @param {regexp} reg  正则表达式
         */
        handleFormat(name, reg, event) {
            reg = reg || /\S+/g;
            if (!reg.test($.trim(this.labelInfo[name]))) {
                this.validJson[name] = false
            } else {
                this.validJson[name] = true
            }
            $(event.target).siblings('.input-close').hide();
        },
        /**
         * 表单验证，小叉清空
         * @param {string} name 要清楚的字段名
         * @param {event} event 事件对象
         * @param {vmodel} vm vm
         */
        handleClear(name, event) {
            this.labelInfo[name] = "";
            $(event.target).siblings('input,textarea').focus();
        },
        //改变标注类型回调
        handleMarkTypeChnage(event) {
            // this.labelInfo.labelType = event.target.value;
        },
        //保存标注按钮
        handleSaveMark(e) {
            let record = JSON.parse(JSON.stringify(this.$labelForm.record));
            let pass = true;
            let url = '/gmvcs/instruct/replay/add/label';
            let data = {
                rid: this.labelInfo.rid,
                // labelType: record.labelType.toString(),
                labelType: '0', // 因海外版没有标注类型，所以传个默认的字符串'0'给后台
                labelTime: record.labelTime ? Number(moment(record.labelTime).format('x')) : "",
                location: this.labelInfo.location,
                description: this.labelInfo.description
            }
            avalon.each(this.validJson, (key, value) => {
                if (data[key] == "" || !value) {
                    this.validJson[key] = false;
                    pass = false;
                }
            });
            if (!pass) {
                return;
            }
            Ajax(url, 'post', data).then(result => {
                if (result.code !== 0) {
                    showTips('error', result.msg);
                    return;
                }
                showTips('success', vm.sszhxt_language.saveSuccess);
                let info = result.data.labelInfo;
                this.labelInfo = {
                    "rid": result.data.rid,
                    // "labelType": info.labelType,
                    "labelTime": moment(info.labelTime).format('YYYY-MM-DD HH:mm:ss'),
                    "location": info.location,
                    "description": info.description
                };
                this.labelTypeName = "";
                for (let i = 0; i < this.labelTypeOptions.length; i++) {
                    if (this.labelTypeOptions[i].value === this.labelInfo.labelType) {
                        this.labelTypeName = this.labelTypeOptions[i].label;
                        break;
                    }
                }
                this.isEdit = false;
                this.labelNull = false;
                setTimeout(() => {
                    popover();
                }, 100);
            });
        },
        //编辑标注按钮
        handleEditMark(e) {
            this.isEdit = true;
            this.labelInfo.labelTime = moment(this.labelInfo.labelTime).format('YYYY-MM-DD HH:mm:ss')
        },
        //获取视频列表
        fetchVideoList(isScroll) {
            let url = '/gmvcs/instruct/replay/list';
            let record = this.$form.record;
            let reg = /(^[\sa-zA-Z0-9\u4e00-\u9fa5_-]{1,20}$|^\s{0}$)/;
            let tipText = '';
            let startTime = moment(record.startTime).format('x') * 1;
            let endTime = moment(record.endTime).format('x') * 1;
            if (startTime > endTime) {
                notification.warn({
                    title: this.sszhxt_language.notification,
                    message: this.sszhxt_language_main.timeSelectWarn
                });
                return;
            }
            let data = {
                orgId: this.orgId,
                orgPath: this.orgPath,
                page: this.currentPage,
                pageSize: this.pageSize,
                startTime: startTime,
                endTime: endTime,
                userCodeOrName: $.trim(this.userKey),
            };
            // if (this.sidebarMode == 0) {
            //     data.type = 'DEVICE';
            //     data.key = $.trim(this.deviceKey);
            //     data.userCodeOrName = $.trim(this.deviceKey);
            //     tipText = getLanMain().deviceSearchF;
            // } else {
            //     data.type = 'USER';
            //     data.key = $.trim(this.userKey);
            //     data.userCodeOrName = $.trim(this.userKey);
            //     tipText = getLanMain().userSearchF;
            // }
            tipText = vm.extra_class_dialog ? "User must include less than 20 characters with digits, letters, ''-'', ''_'' and space !" : "人员应为字母、数字、中文、‘-’、‘_’和空格组成，且不超过20位！";
            if (!reg.test(data.userCodeOrName)) {
                showTips('warning', tipText);
                return;
            }
            let storageData = JSON.parse(JSON.stringify(data));
            storageData.sidebarMode = this.sidebarMode;
            storageData.orgName = this.orgName;
            this.dataStr = JSON.stringify(storageData);
            storage.setItem(name, this.dataStr, 0.5);
            Ajax(url, 'post', data).then(result => {
                if (result.code !== 0) {
                    if(result.code == 1500) {
                        showTips('error', this.sszhxt_language.maynotbeempty);
                    } else {
                        showTips('error', result.msg);
                    }
                    return;
                }
                this.totalPages = result.data.totalPages;
                if (!result.data.totalPages || !result.data.currentElements || !result.data.currentElements.length) {
                    this.videoPreData = [];
                    this.isNull = true;
                    return;
                }
                avalon.each(result.data.currentElements, (index, el) => {
                    el.formatStartTime = moment(el.startTime).format('YYYY-MM-DD HH:mm:ss');
                    el.durationStr = el.duration ? handleDuration(parseInt(el.duration)) : null;
                });
                if (isScroll) {
                    avalon.Array.merge(this.videoPreData, result.data.currentElements); //通过滚动加载的页数
                } else {
                    this.videoPreData = result.data.currentElements; //第一页
                }
                this.isNull = false;
            });
        },
        //获取标注类型
        fetchMarkTypeOptions() {
            let url = '/gmvcs/instruct/replay/label/types';
            Ajax(url).then(result => {
                if (result.code !== 0) {
                    showTips('error', result.msg);
                    return;
                }
                let options = [];
                avalon.each(result.data, function (index, el) {
                    let items = {
                        "label": el.value,
                        "value": el.code
                    };
                    options.push(items);
                });
                this.labelTypeOptions = options;
                this.labelTypeName = options.length > 0 ? options[0].label : "";
            });
        },
        //获取部门信息
        fetchOrgData(callback) {
            let url = '/gmvcs/uom/device/gb28181/v1/view/getPlatformView';
            Ajax(url).then(result => {
                if (result.code !== 0) {
                    showTips('error', this.extra_class_dialog ? 'The police or the department not exist' : '部门信息获取失败！');
                    return;
                }
                this.orgData = handleRemoteTreeData(result.data);
                this.orgId = this.dataJson ? (this.dataJson.orgId ? this.dataJson.orgId : this.orgData[0].key) : this.orgData[0].key;
                this.orgPath = this.dataJson ? (this.dataJson.orgPath ? this.dataJson.orgPath : this.orgData[0].path) : this.orgData[0].path;
                this.orgName = this.dataJson ? (this.dataJson.orgName ? this.dataJson.orgName : this.orgData[0].title) : this.orgData[0].title;
                avalon.isFunction(callback) && callback();
            })
        },
        //根据时间段获取轨迹
        fetchDurationPath(param) {
            let url = '/gmvcs/instruct/track/gps/range';
            iframeWindow = document.getElementById("mapIframe").contentWindow;
            this.enableFetchPath = true;
            Ajax(url, 'post', param).then(result => {
                if (result.code !== 0) {
                    //轨迹出错时，不影响录像播放，只是没有轨迹同步
                    if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                        video.playByUrl(this.activeVideoRid);
                    }
                    this.locations.clear();
                    showTips('error', result.msg);
                    return;
                } else if (!result.data || !result.data[param.deviceIds[0]] || !result.data[param.deviceIds[0]].length) {
                    //无gps信息时，不影响录像播放，只是没有轨迹同步
                    if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                        video.playByUrl(this.activeVideoRid);
                    }
                    this.locations.clear();
                    showTips('warning', getLan().notTraceInfo);
                    return;
                }
                let data = result.data[param.deviceIds[0]];
                this.locations = data;
                if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                    video.playByUrl(this.activeVideoRid);
                }
                iframeWindow.esriMap.setMapCenter(data[0].longitude, data[0].latitude, 20);
                //将第一点设为起点
                if (this.enableFetchPath) {
                    let el = data[0];
                    let attr = {
                        "longitude": el.longitude,
                        "latitude": el.latitude
                    };
                    iframeWindow.esriMap.addPictureMarker(el.longitude, el.latitude, iframeWindow.startSymbol, null);
                }
                let points = [];
                for (let i = 0; i < data.length; i++) {
                    if (!this.enableFetchPath) {
                        break;
                    }
                    points.push([data[i].longitude, data[i].latitude]);
                }
                //将起点，终点连成轨迹
                this.enableFetchPath && iframeWindow.esriMap.addPolyline(points, iframeWindow.lineSymbol);
                //将最后一点设为终点
                if (this.enableFetchPath) {
                    let el = data[data.length - 1];
                    let attr = {
                        "longitude": el.longitude,
                        "latitude": el.latitude
                    };
                    iframeWindow.esriMap.addPictureMarker(el.longitude, el.latitude, iframeWindow.endSymbol, null);
                }
            })
        },
        //视频列表点击
        tabPoliceVideo(item, event) {
            iframeWindow = document.getElementById("mapIframe").contentWindow;
            let $target = $(event.target).hasClass('video-preview-item') ? $(event.target) : $(event.target).parents('.video-preview-item');
            if ($target.index() === this.activeVideo) {
                return;
            }
            //清除点击前相关内容
            if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                video.stop(); //停止播放
                vm.playing = false;
            }
            this.activeVideo = $target.index();
            this.activeVideoRid = item.rid;
            this.isEdit = false;
            this.enableFetchPath = false;
            //  重置表单规则检查
            this.resetValidateField();
            clearInterval(pollTimer);
            clearInterval(processTimer);
            $('.esriPopup .close').trigger('click');
            // 视频切换标志位，视频停止后回调判断是否加载视频
            this.playingchange = true;
            // 要播放的视频信息
            this.deviceData = {
                "deviceIds": [item.deviceId],
                "deviceType": "DSJ",
                "day": item.startTime,
                "beginTime": item.startTime,
                "endTime": item.endTime
            }
            this.fetchLabel(this.activeVideoRid);
            iframeWindow.esriMap.clearDrawLayer();
        },
        resetValidateField() {
            this.validJson = {
                'labelType': true,
                'location': true,
                'labelTime': true,
                'description': true
            }
        },
        fetchLabel(rid) {
            Ajax('/gmvcs/instruct/replay/query/label?rid=' + rid).then(result => {
                if (result.code !== 0) {
                    showTips('error', result.msg);
                    return;
                } else if (!result.data) {
                    this.labelInfo.rid = rid;
                    this.labelInfo.labelType = this.labelTypeOptions.length > 0 ? this.labelTypeOptions[0].value : "";
                    this.labelInfo.labelTime = moment().format('YYYY-MM-DD HH:mm:ss');
                    this.labelInfo.location = "";
                    this.labelInfo.description = "";
                    this.labelNull = true;
                    return;
                }
                this.labelInfo = result.data;
                this.labelInfo.labelTime = moment(this.labelInfo.labelTime).format('YYYY-MM-DD HH:mm:ss');
                this.labelTypeName = "";
                for (let i = 0; i < this.labelTypeOptions.length; i++) {
                    if (this.labelTypeOptions[i].value === this.labelInfo.labelType) {
                        this.labelTypeName = this.labelTypeOptions[i].label;
                        break;
                    }
                }
                popover();
                this.labelNull = false;
            });
        },
        //音量调节
        handleSoundMouseDown(event) {
            event.stopPropagation();
            let _this = this;
            this.soundStartX = event.clientX;
            this.soundStartLevel = this.soundLevel;
            $('body').on('mousemove', function (event) {
                _this.handleSoundMouseMove(event)
                event.stopPropagation();
            });
            $(document).on("mouseup mouseleave", function (event) {
                $('body').off('mousemove');
                event.stopPropagation();
            })
        },
        handleSoundMouseMove(event) {
            let disPix = event.clientX - this.soundStartX;
            let disLevel = Math.floor((disPix / 100) * 100);
            let level = this.soundStartLevel + disLevel;
            if (level > 100) {
                this.soundLevel = 100;
            } else if (level < 0) {
                this.soundLevel = 0;
            } else {
                this.soundLevel = level;
            }
            event.stopPropagation();
        },
        handleSoundClick(event) {
            let disPix = event.offsetX
            if (disPix > 100) {
                this.soundLevel = 100;
            } else if (disPix < 0) {
                this.soundLevel = 0;
            } else {
                this.soundLevel = disPix;
            }
            event.stopPropagation();
        }
    },
});

//ocx播放进度轮询
function pollProcess() {
    clearInterval(processTimer);
    processTimer = setInterval(() => {
        let process = video.getVideotapeProcess();
        //播放完成或停止时，进行相关内容的清除
        if (process.nPos === 0) {
            vm.playing = false;
            vm.isStop = true;
            video.ctrlPlaySpeed(0);
            clearInterval(pollTimer);
            clearInterval(processTimer);
            //确保播放完成时到达最后一点
            if (vm.locations.length) {
                let el = vm.locations[vm.locations.length - 1];
                let attr = {
                    "longitude": el.longitude,
                    "latitude": el.latitude
                };
                iframeWindow.esriMap.removePictureMarker(locationMaker);
                locationMaker = iframeWindow.esriMap.addPictureMarker(el.longitude, el.latitude, iframeWindow.locationSymbol, null);
            }
            iframeWindow.esriMap.removePictureMarker(locationMaker);
            vm.locationIndex = 0;
            $('.fa-step-backward,.fa-step-forward').addClass('disabled');
        }
    }, 200)
}

//轨迹同步
function pollLocation(isFirst) {
    clearInterval(pollTimer);
    let data = vm.locations;
    //轨迹第一点
    if (isFirst) {
        let el = data[vm.locationIndex];
        let attr = {
            "longitude": el.longitude,
            "latitude": el.latitude
        };
        iframeWindow.esriMap.removePictureMarker(locationMaker);
        iframeWindow.esriMap.setMapCenter(el.longitude, el.latitude, 20);
        locationMaker = iframeWindow.esriMap.addPictureMarker(el.longitude, el.latitude, iframeWindow.locationSymbol, null);
        vm.locationIndex++;
    }
    pollTimer = setInterval(() => {
        let timestamp = video.getPlayTimeStamp();
        if (vm.locationIndex >= data.length) {
            clearInterval(pollTimer);
            return;
        }
        for (let i = 0; i < data.length; i++) {
            if (timestamp === data[i].time) {
                vm.locationIndex = i;
                let el = data[vm.locationIndex];
                let attr = {
                    "longitude": el.longitude,
                    "latitude": el.latitude
                };
                iframeWindow.esriMap.removePictureMarker(locationMaker);
                iframeWindow.esriMap.setMapCenter(el.longitude, el.latitude, 20);
                locationMaker = iframeWindow.esriMap.addPictureMarker(el.longitude, el.latitude, iframeWindow.locationSymbol, null);
                break;
            }
        }
    }, 200)
}

//===============================ocx部分========================================
let video = {
    init: function () {
        ocxele = document.getElementById("video-ocx");
        player = new Gxxplayer();
        if (notOcxPlug()) return;
        // 初始化播放器
        player.init({
            'element': 'video-ocx',
            'viewType': 1,
            'proxy': _onOcxEventProxy
        }, () => {
            player.showVideoClose(0);
        });
        let version = player.getVersion();
        if (compareString(gxxOcxVersion, version)) {
            $('#video-ocx').css({
                'z-index': -9999,
                'position': 'relative'
            });
            // vm.tipText = vm.extra_class_dialog ? 'Version of your GXX media player plug-in is ' + version + 'and the latest is' + gxxOcxVersion + '. Please download the latest version.' : '您的高新兴视频播放器插件版本为' + version + '，最新版为' + gxxOcxVersion + '，请下载最新版本';
            vm.tipText = getLanMain().updateOcxTip.replace(/\$rep1|\$rep2/gi, function (matched) {
                return {
                    $rep1: version,
                    $rep2: gxxOcxVersion
                } [matched]
            });
            vm.downloadTipShow = true;
            vm.showtip = false;
            return;
        }
    },
    uninit: function () {
        player.uninit();
    },
    playByUrl: function (rid) {
        let url = '/gmvcs/uom/file/auto/getVODInfo?vFileIds=' + rid;
        vm.locationIndex = 0;
        Ajax(url).then(result => {
            if (result.code !== 0) {
                showTips('error', result.msg);
                return;
            }
            if (result.data.length == 0) {
                showTips('warn', getLanMain().notVideoPlay);
                return;
            }
            let ocxInfo = result.data[0].ocxvideoInfo;
            let opt = {
                "ssIp": ocxInfo.ip,
                "ssPort": ocxInfo.port,
                "ssUsername": ocxInfo.account,
                "ssPasswd": ocxInfo.password
            }
            let code = player.loginVod(opt); //先登录流媒体
            if (code != 0) {
                vm.playing = false;
                $('.video-tool-bar .fa').addClass('disabled');
                showTips('error', getLanMain().videoServiceF);
                return;
            }
            code = player.playVideotape(ocxInfo.playUrl, moment(ocxInfo.startTime).format("YYYY-MM-DD HH-mm-ss"), moment(ocxInfo.endTime).format("YYYY-MM-DD HH-mm-ss"));
            if (code == -2) { //表示登录失败
                vm.playing = false;
                $('.video-tool-bar .fa').addClass('disabled');
                showTips('error', getLanMain().loginF);
                return;
            }
            // 开启声音
            player.SoundCtrl(1, 1, 2);
            vm.playing = true;
            vm.isStop = false;
            $('.video-tool-bar .fa').removeClass('disabled');
            //当无轨迹信息时，只轮询ocx进度
            if (!vm.locations.length) {
                pollProcess();
                setSpeedBeforePlay();
            } else {
                let timer = setInterval(() => {
                    //轨迹第一点将与播放开始时间相等，或晚于播放开始时间
                    if (video.getPlayTimeStamp() >= vm.locations[0].time) {
                        pollLocation(true);
                        pollProcess();
                        clearInterval(timer);
                        //当自动播完/按了停止按钮之后，用户点了快放/慢放，此时重新播放时需要将播放速度调整为用户选择的速率
                        //一定要放在这个if里面，放在之前可能由于快放错过相等的这一时机，那这个if条件将不会被触发，也就不能进行进度轮询以及轨迹轮询
                        setSpeedBeforePlay();
                    }
                }, 100)
            }
        });
    },
    play: function () {
        player.controlVideotape(0, 0, 0, 1);
    },
    pause: function () {
        player.controlVideotape(1, 0, 0, 1);
    },
    stop: function () {
        player.controlVideotape(9, 0, 0, 1);
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
    exitFull: function () {
        player.exitFull();
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
    var ret = eval('(' + data + ')'); //每次操作acx都会回调这里
    // console.log(JSON.stringify(ret))
    // console.log(player.getReplayWndInfoByIndex());
    if (ret.action == 'ReplayCtrl') { //录像控制的回调
        let mode = ret.data.nCtrlType;
        if (mode === 9) { //停止回调
            // 如果为视频切换函数中的回调，回调后再加载视频
            //  回调后再加载视频是防止视频停止在播放后面执行
            if (vm.playingchange) {
                vm.fetchDurationPath(vm.deviceData);
                vm.playingchange = false;
                if ((vm.isie && Boolean(ocxele) && Boolean(ocxele.object)) || (!vm.isie && undefined !== ocxele.GS_ReplayFunc)) {
                    video.ctrlPlaySpeed(0);
                }
            }
            vm.isStop = true;
            vm.playing = false;
        } else if (mode === 7) { //进度条变化回调
            //    alert(JSON.stringify(ret))
            setTimeout(() => {
                let timestamp = video.getPlayTimeStamp();
                clearInterval(pollTimer);
                for (let i = 0; i < vm.locations.length - 1; i++) {
                    if (timestamp <= vm.locations[0].time || timestamp >= vm.locations[i].time && timestamp <= vm.locations[i + 1].time) {
                        vm.locationIndex = i;
                        pollLocation(true);
                        break;
                    }
                }
            }, 50)
        }
    }
}

/**
 * 发送ajax请求，默认为get请求
 * @param {*} url 
 * @param {*} method 
 * @param {*} data 
 */
function Ajax(url, method, data) {
    return ajax({
        url: url,
        method: method || 'get',
        data: data || null,
        cache: false
    });
}

/**
 * 显示提示消息
 * @param {*} type 
 * @param {*} content 
 * @param {*} layout 
 */
function showTips(type, content, layout, duration) {
    notification[type]({
        title: getLanMain().notification,
        message: content,
        layout: layout || 'topRight',
        timeout: duration || 1500
    });
}

function fetchOrgWhenExpand(treeId, treeNode, selectedKey) {
    // let url = '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.key + '&checkType=' + treeNode.checkType
    let data = {
        parentRid: treeNode.rid,
        superiorPlatformId: treeNode.platformId || treeNode.superiorPlatformId
    };
    ViewItem(data.parentRid, data.superiorPlatformId).then((result) => {
        // Ajax(url).then((result) => {
        let treeObj = $.fn.zTree.getZTreeObj(treeId);
        if (result.code == 0) {
            treeObj.addNodes(treeNode, handleRemoteTreeData(result.data));
        }
        if (selectedKey != treeNode.key) {
            let node = treeObj.getNodeByParam("key", selectedKey, treeNode);
            treeObj.selectNode(node);
        }
    });
}

/**
 * 处理远程部门树的数据
 * @param {array} remoteData  远程请求得到的数据
 */
function handleRemoteTreeData(remoteData) {
    if (!remoteData) {
        return;
    }
    let handledData = [];
    avalon.each(remoteData, (index, el) => {
        if (isDevice(el.type, false) == orgIcon) {
            el.key = el.rid;
            el.title = el.itemName;
            el.code = el.orgCode;
            el.path = el.path;
            el.checkType = el.checkType;
            el.children = el.childs;
            el.isParent = true;
            el.icon = "/static/image/tyywglpt/org.png";
            handledData.push(el);
            handleRemoteTreeData(el.childs)
        };
    });
    return handledData;
}

function handleDuration(duration) {
    if (duration <= 0) {
        return "00:00:00"
    }
    let hour = Math.floor(duration / 3600);
    let minute = Math.floor(duration / 60 % 60);
    let second = Math.round(duration % 60);
    let durationStr = (hour < 10 ? '0' + hour : hour) + ':' + (minute < 10 ? '0' + minute : minute) + ':' + (second < 10 ? '0' + second : second);
    return durationStr;
}

//播放前设置播放速度
function setSpeedBeforePlay() {
    if (vm.speed !== 1) {
        if (vm.speed > 0) {
            let fast = $('.fa-fast-forward').get(0);
            for (let i = 0; i < Math.log(vm.speed) / Math.log(2); i++) {
                video.faster();
            }
        } else {
            let slower = $('.fa-fast-backward').get(0);
            for (let i = 0; i < Math.log(Math.abs(vm.speed)) / Math.log(2); i++) {
                video.slower()
            }
        }
    }
}

function setVideoHeight() {
    let sideHeight = $('.lxhf-side-bar').outerHeight();
    $('.graphic-container').height(sideHeight - 322);
    $('.video-preview-list').height($('.side-bar-main').outerHeight() - $('.search-box').outerHeight() - 10);
    let videoDom = $('.lxhf-video');
    vm.videoHeight = videoDom.outerHeight() - 40;
    let mapWidth = videoDom.width() * 3 / 7 - 24; // 播放器与地图宽度比例是7:3
    $('.map-iframe-wrap.sszhxt-lxhf-map').css({
        height: videoDom.outerHeight(),
        width: mapWidth
    });
}

function isIE() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

function popover() {
    let titleTimer = null;
    $(".label-infos [data-toggle='popover']").popoverX({
        trigger: 'manual',
        container: 'body',
        placement: 'auto right',
        //delay:{ show: 5000},
        html: 'true',
        content: function () {
            return '<div class="title-content">' + $(this).attr('origin-title') + '</div>';
        },
        animation: false
    }).off("mouseenter").on("mouseenter", (event) => {
        let target = event.target;
        if ($(target).text() === '-') {
            return;
        }
        titleTimer = setTimeout(() => {
            $('div.popover').remove();
            $(target).popoverX("show");
            $(".popover").off("mouseleave").on("mouseleave", (event) => {
                $(target).popoverX('hide');
            });
        }, 500);
    }).off("mouseleave").on("mouseleave", (event) => {
        let target = event.target;
        clearTimeout(titleTimer);
        setTimeout(() => {
            if (!$(".popover:hover").length) {
                $(target).popoverX("hide");
            }
        }, 100);
    });
}
// 检测是否有ocx插件
function notOcxPlug() {
    if ((vm.isie && (!ocxele || !ocxele.object)) || (!vm.isie && undefined == ocxele.GS_ReplayFunc)) {
        $('#video-ocx').css({
            'z-index': -9999,
            'position': 'relative'
        });
        vm.tipText = getLanMain().needPlug;
        vm.showtip = true;
        vm.downloadTipShow = true;
        return true;
    } else {
        return false;
    }
}

function getLanMain() {
    return language_txt.sszhxt.main;
}

function getLan() {
    return language_txt.sszhxt.sszhxt_lxhf;
}