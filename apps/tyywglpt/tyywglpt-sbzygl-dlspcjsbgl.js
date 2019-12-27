/**
 * 统一运维管理平台--设备资源管理--多路视频采集设备管理
 *caojiacong
 */
import avalon from 'avalon2';
import ajax from '../../services/ajaxService';
import Sbzygl from '../common/common-sbzygl';
import moment from 'moment';
import {
    createForm,
    notification
} from 'ane';
import * as menuServer from '../../services/menuService';
import {
    apiUrl
} from '../../services/configService';
const storage = require('../../services/storageService.js').ret;
const plupload = require('../../vendor/plupload/plupload.full.min.js');
export const name = 'tyywglpt-sbzygl-dlspcjsbgl';
require('../common/common-tyywglpt.css');
require('../common/common-sbzygl.css');
require('./tyywglpt-sbzygl-dlspcjsbgl.css');
let vm = null,
    sbzygl = null,
    enableQuery = true,
    queryTimer = null,
    uploader = null,
    compStatusOptions = [];
const listHeaderName = name + "-list-header";
//页面组件
avalon.component(name, {
    template: __inline('./tyywglpt-sbzygl-dlspcjsbgl.html'),
    defaults: {
        $form: createForm(),
        loading: true,
        isNull: false,
        list: [],
        total: 0,
        current: 1,
        pageSize: 20,
        selectedRowsLength: 0,
        checkedIsSource: false, //判断勾选的是否为级联平台设备
        checkedData: [],
        isDuration: false,
        timeMode: 1,
        beginTime: moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD'),
        endTime: moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD'),
        orgData: [],
        orgCode: "",
        orgId: "",
        orgPath: "",
        orgName: "",
        checkAll: false,
        typeOptions: [],
        statusOptions: [],
        manufacturerOptions: [],
        modelOptions: [],
        typeOk: false,
        manufacturerOk: false,
        modelOk: false,
        isFirstFetchModel: true, //是否为第一次获取搜索栏的型号
        isManuOrTypeSelectMode: false, //是否为厂商或类型改变导致的型号获取
        dataStr: "",
        dataJson: {},
        titleTimer: "", //popover用的的定时器，代码在common-sbzygl.js
        uploadInit: false,
        needFlash: false,
        downloadTipShow: false,
        authority: { // 按钮权限标识
            "DELETE": false, //设备资源管理_多路视频采集设备管理_删除
            "MODIFY": false, //设备资源管理_多路视频采集设备管理_修改
            "REGISTRY": false, //设备资源管理_多路视频采集设备管理_注册
            "SEARCH": false, //设备资源管理_多路视频采集设备管理_查询
            "BATCHREGISTRY": true, // 批量注册(要设为true，不然plupload插件初始化不了)
            "OPT_SHOW": false //操作栏 - 显隐
        },
        onInit(event) {
            vm = event.vmodel;
            sbzygl = new Sbzygl(vm);
            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^UOM_FUNCTION_SBZYGL_DLSPCJSBGL_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                if (func_list.length == 0)
                    return;
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_SBZYGL_DLSPCJSBGL_DELETE":
                            _this.authority.DELETE = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_DLSPCJSBGL_MODIFY":
                            _this.authority.MODIFY = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_DLSPCJSBGL_REGISTRY":
                            _this.authority.REGISTRY = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_DLSPCJSBGL_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_DLSPCJSBGL_BATCHREGISTRY":
                            _this.authority.BATCHREGISTRY = true;
                            break;
                    }
                });
                //批量注册的权限判断
                if (func_list.indexOf('UOM_FUNCTION_SBZYGL_DLSPCJSBGL_BATCHREGISTRY') === -1) {
                    _this.authority.BATCHREGISTRY = false;
                }
                if (false == _this.authority.MODIFY && false == _this.authority.DELETE)
                    _this.authority.OPT_SHOW = true;
                sbzygl.autoSetListPanelTop();
            });
            sbzygl.autoSetListPanelTop();
            this.$watch('dataJson', (v) => {
                if (v) {
                    this.beginTime = v.registerTimeBegin ? moment(v.registerTimeBegin).format('YYYY-MM-DD') : moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD');
                    this.endTime = v.registerTimeEnd ? moment(v.registerTimeEnd).format('YYYY-MM-DD') : moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD');
                    this.timeMode = v.timeMode;
                    this.isDuration = v.timeMode === 3;
                    this.current = v.page + 1;
                }
            })
        },
        onReady() {
            this.dataStr = storage.getItem(name);
            this.dataJson = this.dataStr ? JSON.parse(this.dataStr) : null;
            //表头宽度设置
            sbzygl.setListHeader(listHeaderName);
            this.fetchStatusOptions();
            this.fetchManuOptions();
            this.fetchTypeOptions();
            this.fetchOrgData(() => {
                let timer = setInterval(() => {
                    //保证查询条件到位后再fetchList
                    let recordStr = JSON.stringify(this.$form.record);
                    let length = recordStr.match(/:/g) ? recordStr.match(/:/g).length : 0;
                    if (vm.typeOk && vm.manufacturerOk && vm.modelOk && length >= 7) {
                        vm.fetchList();
                        clearInterval(timer);
                        dialogRegisterVm.orgData = dialogModifyVm.orgData = this.orgData;
                    }
                    if (vm.manufacturerOk && vm.typeOk) {
                        vm.fetchModelOptions();
                    }
                }, 100);
            });
            uploader = new plupload.Uploader({
                runtimes: 'html5,flash',
                browse_button: 'fileupload', //触发文件选择对话框的按钮，为那个元素id
                url: "http://" + window.location.host + apiUrl + '/gmvcs/uom/device/dsj/register/excel', //服务器端的上传页面地址
                flash_swf_url: '/static/vendor/plupload/Moxie.swf', //swf文件，当需要使用swf方式进行上传时需要配置该参数
                filters: {
                    max_file_size: '1m',
                    mime_types: [{
                        title: "Xls files",
                        extensions: "xls,xlsx"
                    }]
                },
                multi_selection: false,
                init: {
                    Init: function (up) {
                        vm.uploadInit = true;
                    },
                    FilesAdded: function (up, files) {
                        let file = files[0];
                        //清除队列
                        for (let i = 0; i < uploader.files.length - 1; i++) {
                            uploader.removeFile(uploader.files[i]);
                        }
                        up.start();
                    },
                    FileUploaded: function (up, file, response) {
                        let result = JSON.parse(response.response);
                        if (result.code == 0) {
                            sbzygl.showTips('success', '批量注册成功');
                            vm.fetchList();
                        } else {
                            sbzygl.showTips('error', result.data);
                        }
                    },
                    Error: function (up, err) {
                        let code = err.code;
                        if (code === -500) {
                            vm.needFlash = true;
                        } else if (code === -601) {
                            sbzygl.showTips('warn', '仅支持上传xls或xlsx表格文件');
                        } else if (code === -600) {
                            sbzygl.showTips('warn', '上传的文件大小不能超过1M');
                        } else {
                            sbzygl.showTips('error', '批量注册失败');
                        }
                    }
                }
            });
            // uploader.init();
        },
        onDispose() {
            clearTimeout(queryTimer);
            clearTimeout(this.titleTimer);
            enableQuery = true;
            uploader = null;
            compStatusOptions = [];
            $('div.popover').remove();
        },
        getDefaultManu(manufacturerOptions, dataJson) {
            return manufacturerOptions.length > 0 ? (dataJson ? dataJson.manufacturer : manufacturerOptions[0].value) : '';
        },
        getDefaultType(typeOptions, dataJson) {
            return typeOptions.length > 0 ? (dataJson ? dataJson.type : typeOptions[0].value) : '';
        },
        getDefaultModel(modelOptions, isManuOrTypeSelectMode, dataJson) {
            return modelOptions.length > 0 ? (isManuOrTypeSelectMode ? modelOptions[0].value : (dataJson ? dataJson.model : modelOptions[0].value)) : '';
        },
        getDefaultStatus(statusOptions, dataJson) {
            return statusOptions.length > 0 ? (dataJson ? dataJson.status : statusOptions[0].value) : '';
        },
        getShowStatus(show) {
            this.downloadTipShow = show;
        },
        showDownLoadTip() {
            if (this.checkedData.length) {
                return;
            }
            sbzygl.showTips('warn', '后台暂未提供接口');
            return;
            if (this.needFlash) {
                this.downloadTipShow = true;
            }
        },
        //修改按钮
        handleModify(record) {
            if (record.platformGbcode) {
                sbzygl.showTips('warn', '该条数据来自级联平台，不能修改');
                return;
            }
            dialogModifyVm.isManuFirstSelect = true;
            dialogModifyVm.justShowNow = true;
            record.status = String(record.status);
            dialogModifyVm.selectedRowsData = [record];
            dialogModifyVm.inputJson = {
                "gbcode": record.gbcode || "",
                "manufacturer": record.manufacturer || "",
                "name": record.name || "",
                "model": record.model || "",
            }
            dialogModifyVm.orgId = record.orgId;
            dialogModifyVm.orgCode = record.orgCode;
            dialogModifyVm.orgPath = record.orgPath;
            dialogModifyVm.orgName = record.orgName;

            let channelDatas = [],
                defaultDatas = [];
            avalon.each(record.channelSet, (index, item) => {
                let controlStr = item.ptzcontrollable === 0 ? "normal" : "cloud";
                channelDatas.push({
                    index: item.index,
                    id: item.id,
                    gbcode: item.gbcode,
                    name: item.name,
                    controlType: controlStr,
                    showJson: {
                        gbcode: false
                    },
                    validJson: {
                        gbcode: true,
                        gbcodeUnique: true,
                        name: true,
                        nameUnique: true
                    }
                });
                defaultDatas.push({
                    id: item.id,
                    index: item.index,
                    gbcode: item.gbcode,
                    name: item.name,
                    controlType: controlStr,
                })
            });
            //按通道索引递增排序
            channelDatas.sort((a, b) => {
                return a.index - b.index;
            })
            defaultDatas.sort((a, b) => {
                return a.index - b.index;
            })
            dialogModifyVm.channelList = channelDatas;
            dialogModifyVm.defaultChannelList = defaultDatas;
            dialogModifyVm.show = true;
        },
        //删除按钮
        handleDelete(record) {
            if (record.platformGbcode) {
                sbzygl.showTips('warn', '该条数据来自级联平台，不能删除');
                return;
            }
            dialogDelVm.isBatch = false;
            dialogDelVm.deviceIdArr = [record.id];
            dialogDelVm.show = true;
        },
        handleTreeChange(e, selectedKeys) {
            this.orgCode = e.node.code;
            this.orgPath = e.node.path;
            this.orgName = e.node.title;
        },
        extraExpandHandle(treeId, treeNode, selectedKey) {
            sbzygl.fetchOrgWhenExpand(treeId, treeNode, selectedKey);
        },
        handleManuChange(e) {
            this.fetchModelOptions();
            if (!this.isFirstFetchModel) {
                this.isManuOrTypeSelectMode = true;
            }
        },
        handleTypeChange(e) {
            this.fetchModelOptions();
            if (!this.isFirstFetchModel) {
                this.isManuOrTypeSelectMode = true;
            }
        },
        handleTimeChange(e) {
            this.timeMode = e.target.value;
            switch (e.target.value) {
                case 2:
                    this.beginTime = moment().startOf('month').format('YYYY-MM-DD');
                    this.endTime = moment().endOf('month').format('YYYY-MM-DD');
                    this.isDuration = false;
                    break;
                case 3:
                    this.beginTime = moment().subtract(3, 'months').format('YYYY-MM-DD');
                    this.endTime = moment().format('YYYY-MM-DD');
                    this.isDuration = true;
                    break;
                default:
                    //moment从星期天开始一个星期，所以需要加一天才能从星期一开始一个星期
                    this.beginTime = moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD');
                    this.endTime = moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD');
                    this.isDuration = false;
            }
            sbzygl.autoSetListPanelTop();
        },
        handleRegister() {
            if (this.selectedRowsLength !== 0)
                return;
            let record = this.$form.record;
            dialogRegisterVm.orgId = this.orgId;
            dialogRegisterVm.orgCode = this.orgCode;
            dialogRegisterVm.orgPath = this.orgPath;
            dialogRegisterVm.orgName = this.orgName;
            dialogRegisterVm.defaultType = dialogRegisterVm.typeOptions.length ? dialogRegisterVm.typeOptions[0].value : "";
            dialogRegisterVm.show = true;
        },
        //批量删除
        handleBatchDelete() {
            if (this.selectedRowsLength < 1) {
                return;
            }
            if (!vm.checkedIsSource) {
                sbzygl.showTips('warn', '含有来自级联平台的数据，不能批量删除');
                return;
            }
            dialogDelVm.isBatch = true;
            dialogDelVm.deviceIdArr = [];
            avalon.each(this.checkedData, (index, el) => {
                dialogDelVm.deviceIdArr.push(el.id);
            })
            dialogDelVm.show = true;
        },
        getCurrent(current) {
            this.current = current;
        },
        getSelected(key, title) {
            this.orgId = key;
        },
        //全选列表
        handleCheckAll(e) {
            sbzygl.handleCheckAll(e, (list) => {
                this.checkedData = list;
                let checkedDataLength = this.checkedData.length;
                if (checkedDataLength) {
                    uploader.disableBrowse(true);
                } else {
                    uploader.disableBrowse(false);
                }
                //本平台执法仪集合
                let checkedSource = list.filter((item) => {
                    return !item.platformGbcode;
                });
                if (checkedSource.length > 0 && checkedSource.length === checkedDataLength) {
                    this.checkedIsSource = true;
                } else {
                    this.checkedIsSource = false;
                }
                dialogDelVm.selectedRowsLength = checkedSource.length;
            })
        },
        //勾选列表
        handleCheck(index, record, e) {
            sbzygl.handleCheck(index, record, e, (hasChecked, record) => {
                this.checkedData = hasChecked;
                let checkedDataLength = this.checkedData.length;
                if (checkedDataLength) {
                    uploader.disableBrowse(true);
                } else {
                    uploader.disableBrowse(false);
                }
                //本平台执法仪集合
                let checkedSource = hasChecked.filter((item) => {
                    return !item.platformGbcode;
                });
                if (checkedSource.length > 0 && checkedSource.length === checkedDataLength) {
                    this.checkedIsSource = true;
                } else {
                    this.checkedIsSource = false;
                }
                dialogDelVm.selectedRowsLength = checkedSource.length;
            })
        },
        query() {
            if (enableQuery) {
                this.current = 1;
                this.fetchList();
                enableQuery = false;
                queryTimer = setTimeout(() => {
                    enableQuery = true;
                }, 2000)
            }
        },
        pageChange() {
            this.fetchList()
        },
        //获取设备状态列表
        fetchStatusOptions() {
            let options = [{
                    "label": "正常",
                    "value": "0"
                },
                {
                    "label": "维修",
                    "value": "1"
                },
                {
                    "label": "停用",
                    "value": "2"
                },
                {
                    "label": "注销",
                    "value": "3"
                }
            ];
            let hasNullOptions = options.slice();
            hasNullOptions.unshift({
                "label": "不限",
                "value": "null"
            });
            this.statusOptions = hasNullOptions;
            dialogModifyVm.statusOptions = options;
        },
        //获取执法仪信息列表
        fetchList() {
            $('div.popover').remove();
            let record = this.$form.record;
            avalon.each(record, function (key, value) {
                if (Array.isArray(value)) {
                    record[key] = value[0];
                }
            });
            let data = {
                attachChannelInfo: true,
                type: record.type == "null" ? null : record.type,
                manufacturer: record.manufacturer == "null" ? null : record.manufacturer,
                model: record.model == "null" ? null : record.model,
                status: record.status == "null" ? null : Number(record.status),
                searchSubOrg: true,
                orgPath: this.orgPath || null,
                page: this.current - 1,
                pageSize: this.pageSize,
                registerTimeBegin: record.beginTime,
                registerTimeEnd: record.endTime,
            };
            let url = '/gmvcs/uom/device/search';
            data.registerTimeBegin = this.isDuration ? (data.registerTimeBegin ? moment(data.registerTimeBegin).format('X') * 1000 : null) : (this.beginTime ? moment(this.beginTime).format('X') * 1000 : null);
            data.registerTimeEnd = this.isDuration ? (data.registerTimeEnd ? moment(data.registerTimeEnd).add(1, 'days').subtract(1, 'seconds').format('X') * 1000 : null) : (this.endTime ? moment(this.endTime).add(1, 'days').subtract(1, 'seconds').format('X') * 1000 : null);
            if (!data.registerTimeBegin && !data.registerTimeEnd) {
                sbzygl.showTips('warning', '请选择开始时间与结束时间！');
                return;
            }
            if (!data.registerTimeBegin && data.registerTimeEnd) {
                sbzygl.showTips('warning', '请选择开始时间！');
                return;
            }
            if (data.registerTimeBegin && !data.registerTimeEnd) {
                sbzygl.showTips('warning', '请选择结束时间！');
                return;
            }
            if (data.registerTimeBegin && data.registerTimeEnd && data.registerTimeBegin >= data.registerTimeEnd) {
                sbzygl.showTips('warning', '开始时间不能大于结束时间！');
                return;
            }
            this.loading = true;
            this.checkAll = false;
            this.selectedRowsLength = 0;
            let storageData = JSON.parse(JSON.stringify(data));
            storageData.timeMode = this.timeMode;
            storageData.page = this.current - 1;
            storageData.orgId = this.orgId;
            storageData.orgName = this.orgName;
            storageData.orgCode = this.orgCode;
            storageData.manufacturer = !storageData.manufacturer ? "null" : storageData.manufacturer;
            storageData.type = !storageData.type ? "null" : storageData.type;
            storageData.model = !storageData.model ? "null" : storageData.model;
            storageData.status = storageData.status == null ? "null" : String(storageData.status);
            this.dataStr = JSON.stringify(storageData);
            storage.setItem(name, this.dataStr, 0.5);
            sbzygl.ajax(url, 'post', data).then(result => {
                this.loading = false;
                if (result.code !== 0) {
                    sbzygl.showTips('error', result.msg);
                    this.list = [];
                    this.total = 0;
                    this.isNull = true;
                    sbzygl.initDragList(listHeaderName);
                    return;
                } else if (!result.data.totalElements) {
                    this.list = [];
                    this.total = 0;
                    this.isNull = true;
                    sbzygl.initDragList(listHeaderName);
                    return;
                }
                avalon.each(result.data.currentElements, (index, el) => {
                    el.checked = false;
                    el.onlineStatus = el.online === 1 ? '在线' : '离线';
                    el.statusName = this.statusOptions[el.status + 1].label;
                });
                this.list = result.data.currentElements;
                this.total = result.data.totalElements;
                this.isNull = false;
                sbzygl.initList();
                sbzygl.initDragList(listHeaderName);
            }).fail(() => {
                this.loading = false;
                this.list = [];
                this.total = 0;
                this.isNull = true;
                sbzygl.initDragList(listHeaderName);
            });
        },
        //获取部门树
        fetchOrgData(callback) {
            sbzygl.fetchOrgData(this.orgData, (orgData) => {
                this.orgData = orgData
                if (orgData.length > 0) {
                    this.orgId = this.dataJson ? this.dataJson.orgId : orgData[0].key;
                    this.orgCode = this.dataJson ? this.dataJson.orgCode : orgData[0].code;
                    this.orgPath = this.dataJson ? this.dataJson.orgPath : orgData[0].path;
                    this.orgName = this.dataJson ? this.dataJson.orgName : orgData[0].title;
                }
                avalon.isFunction(callback) && callback();
            });
        },
        //获取厂商列表
        fetchManuOptions() {
            let url = '/gmvcs/uom/device/manufacturer';
            sbzygl.ajax(url).then((result) => {
                if (result.code != 0) {
                    sbzygl.showTips('error', result.msg);
                    this.manufacturerOptions.clear();
                    this.manufacturerOk = true;
                    return;
                }
                sbzygl.handleRemoteArrayToDic(result.data, (manuHasNullOptions, manuOptions) => {
                    this.manufacturerOptions = manuHasNullOptions;
                    dialogRegisterVm.manufacturerOptions = manuOptions;
                    dialogModifyVm.manufacturerOptions = manuOptions;
                    this.manufacturerOk = true;
                });
            }).fail(() => {
                this.manufacturerOk = true;
            });
        },
        //获取设备类型列表
        fetchTypeOptions() {
            let url = '/gmvcs/uom/device/type?allType=true';
            sbzygl.ajax(url).then((result) => {
                if (result.code != 0) {
                    sbzygl.showTips('error', result.msg);
                    this.typeOptions.clear();
                    this.typeOk = true;
                    return;
                }
                sbzygl.handleRemoteArrayToDic(result.data, (typeHasNullOptions, typeOptions) => {
                    this.typeOptions = typeHasNullOptions;
                    dialogRegisterVm.typeOptions = typeOptions;
                    dialogModifyVm.typeOptions = typeOptions;
                    dialogRegisterVm.defaultType = typeOptions.length ? typeOptions[0].value : "";
                    this.typeOk = true;
                });
            }).fail(() => {
                this.typeOk = true;
            });
        },
        //根据厂商和类型获取设备型号
        fetchModelOptions() {
            let record = this.$form.record,
                manufacturer = String(record.manufacturer),
                type = String(record.type),
                queryData = {},
                paramStr = '',
                url = '/gmvcs/uom/device/model';
            //当为不限或为空时，不需要传相关的参数
            if (manufacturer && manufacturer !== "null") {
                queryData.manufacturer = encodeURIComponent(manufacturer);
            }
            if (type && type !== "null") {
                queryData.type = encodeURIComponent(type);
            }
            for (let key in queryData) {
                paramStr += key + '=' + queryData[key] + '&';
            }
            paramStr = paramStr.slice(0, -1);
            if (paramStr) {
                url += '?' + paramStr;
            }
            sbzygl.ajax(url).then((result) => {
                if (result.code != 0) {
                    sbzygl.showTips('error', result.msg);
                    this.modelOptions.clear();
                    this.modelOk = true;
                    this.isFirstFetchModel = false;
                    return;
                }
                //型号
                sbzygl.handleRemoteArrayToDic(result.data, (modelHasNullOptions, modelOptions) => {
                    this.modelOptions.clear();
                    this.modelOptions = modelHasNullOptions;
                    this.modelOk = true;
                })
                this.isFirstFetchModel = false;
            }).fail(() => {
                this.modelOk = true;
            });
        }
    }
})

//注册弹窗vm定义
const dialogRegisterVm = avalon.define({
    $id: 'dlspcjsbgl-register-vm',
    show: false,
    $form: createForm(),
    typeOptions: [],
    manufacturerOptions: [],
    modelOptions: [],
    defaultType: "",
    orgData: [],
    orgId: "",
    orgCode: "",
    orgPath: "",
    orgName: "",
    channelList: [],
    manuReg: /(^[a-zA-Z\u4e00-\u9fa5]{1,32}$|^\s{0}$)/,
    modelReg: /(^[a-zA-Z0-9\u4e00-\u9fa5-]{1,32}$|^\s{0}$)/,
    gbcodeReg: /^[a-zA-Z0-9]{20}$/,
    gbcodeReg: /^[a-zA-Z0-9]{20}$/,
    clear: false, //用来促使弹框里的input框清空
    inputJson: {
        "gbcode": "",
        "manufacturer": "",
        "name": "",
        "model": "",
    },
    validJson: {
        "gbcode": true,
        "gbcodeUnique": true,
        "type": true,
        "manufacturer": true,
        "model": true,
        "name": true,
        "orgId": true,
        "channel": true
    },
    showJson: {
        "gbcode": false,
        "manufacturer": false,
        "model": false,
    },
    getSelected(key, title) {
        this.orgId = key;
    },
    handleTreeChange(e) {
        this.orgCode = e.node.code;
        this.orgPath = e.node.path;
        this.orgName = e.node.title;
    },
    extraExpandHandle(treeId, treeNode, selectedKey) {
        sbzygl.fetchOrgWhenExpand(treeId, treeNode, selectedKey);
    },
    handleDeviceTypeChange(e) {
        fetchModelByTypeAndManu(this);
    },
    getSearchLabel(label, owner) {
        if (owner === "manufacturer") {
            this.inputJson.manufacturer = label;
        } else {
            this.inputJson.model = label;
        }
    },
    getSearchSelected(label, value, owner) {
        if (owner === "manufacturer") {
            fetchModelByTypeAndManu(this);
        }
    },
    handleSearchSelectFocus(event, owner) {
        if (owner === "manufacturer") {
            sbzygl.handleFocus(event, 'manufacturer', this);
        } else {
            sbzygl.handleFocus(event, 'model', this);
        }
    },
    handleSearchSelectFormat(event, owner) {
        if (owner === "manufacturer") {
            sbzygl.handleFormat(event, 'manufacturer', this, this.manuReg, null);
        } else {
            sbzygl.handleFormat(event, 'model', this, this.modelReg, null);
        }
    },
    getChannelListLength(channelList) {
        return Boolean(channelList.length);
    },
    handleAddChannel(event) {
        let len = this.channelList.length + 1;
        this.channelList.push({
            index: len,
            gbcode: "",
            name: "",
            controlType: "normal",
            showJson: {
                gbcode: false
            },
            validJson: {
                gbcode: true,
                gbcodeUnique: true,
                name: true,
                nameUnique: true
            }
        });
        this.validJson.channel = true;
        let $listContent = $('#dlspcjsbgl-modal-register .channel-list-content');
        $listContent.scrollTop($listContent.get(0).scrollHeight);
    },
    handleDeleteChannel(item) {
        avalon.Array.remove(this.channelList, item);
        $('.channel-list-content').scrollTop(0);
    },
    handleFocus(name, event) {
        sbzygl.handleFocus(event, name, this);
        if (name == "gbcode") {
            this.validJson.gbcodeUnique = true;
        }
    },
    handleFormat(name, reg, event) {
        sbzygl.handleFormat(event, name, this, reg);
    },
    handleClear(name, event) {
        sbzygl.handleClear(event, name, this);
    },
    handleChannelFocus(item, name, event) {
        if (item.showJson[name] != undefined) {
            item.showJson[name] = true;
        }
        item.validJson[name] = true;
        $(event.target).siblings('.fa-close').show();
        if (name == "gbcode") {
            item.validJson.gbcodeUnique = true;
        } else if (name == "name") {
            item.validJson.nameUnique = true;
        }
    },
    handleChannelFormat(item, name, reg, lengthLimit, event) {
        reg = reg || /\S+/g;
        item[name] = $.trim(item[name]);
        if (!reg.test(item[name]) || (lengthLimit && item[name].length > lengthLimit)) {
            item.validJson[name] = false
        } else {
            item.validJson[name] = true
        }
        if (item.showJson[name] != undefined) {
            item.showJson[name] = false;
        }
        //判断输入的国标编号或通道名称在当前设备下是否已存在
        if (item.validJson[name] && item.validJson[name + 'Unique'] != undefined) {
            let sameArr = [];
            avalon.each(this.channelList, (i, outerItem) => {
                avalon.each(this.channelList, (j, innerItem) => {
                    if (innerItem[name] && innerItem.index !== outerItem.index && innerItem[name] === outerItem[name]) {
                        avalon.Array.ensure(sameArr, innerItem.index)
                    }
                });
            });
            avalon.each(this.channelList, (index, channel) => {
                if (sameArr.indexOf(channel.index) !== -1) {
                    channel.validJson[name + 'Unique'] = false;
                } else {
                    channel.validJson[name + 'Unique'] = true;
                }
            });
        }
        $(event.target).siblings('.fa-close').hide();
    },
    handleChannelClear(item, name, event) {
        item[name] = "";
        $(event.target).siblings('input').val('').focus();
    },
    handleCancel(e) {
        this.clear = !this.clear;
        this.show = false;
    },
    handleOk() {
        //验证是否至少有一个通道
        if (!this.channelList.length) {
            this.validJson.channel = false;
            return;
        }
        registerDevice();
    },
});
dialogRegisterVm.$watch('channelList', (channelList) => {
    avalon.each(channelList, (index, item) => {
        item.index = index + 1;
    })
});
dialogRegisterVm.$watch('clear', (v) => {
    dialogRegisterVm.inputJson = {
        "gbcode": "",
        "manufacturer": "",
        "name": "",
        "model": "",
    }
    dialogRegisterVm.validJson = {
        "gbcode": true,
        "gbcodeUnique": true,
        "type": true,
        "manufacturer": true,
        "model": true,
        "name": true,
        "orgId": true,
        "channel": true
    }
    dialogRegisterVm.showJson = {
        "gbcode": false,
        "manufacturer": false,
        "model": false,
    }
    dialogRegisterVm.defaultType = "";
    dialogRegisterVm.channelList.clear();
})

//修改弹窗vm定义
const dialogModifyVm = avalon.define({
    $id: 'dlspcjsbgl-modify-vm',
    show: false,
    $form: createForm(),
    isManuFirstSelect: true,
    statusOptions: [],
    typeOptions: [],
    manufacturerOptions: [],
    modelOptions: [],
    orgData: [],
    orgId: "",
    orgCode: "",
    orgPath: "",
    orgName: "",
    defaultChannelList: [], //用来比较是否修改了通道信息的基准通道列表
    channelList: [], //实时通道列表
    selectedRowsData: [],
    channelAddDatas: [], //新增通道列表
    channelModifyDatas: [], //修改通道列表
    channelDeleteIds: [], //删除通道id列表
    isChannelChange: false, //通道信息是否改变
    isChannelSave: false, //通道信息是否保存
    justShowNow: true, //弹窗是否为刚显示（主要用来限制刚显示时下拉框触发change事件后导致isChannelChange变为true）
    channelSaveStatus: { //通道信息各类变更的保存状态 true--未变更或已保存   false--已变更且未保存
        "delete": true,
        "modify": true,
        "add": true
    },
    manuReg: /(^[a-zA-Z\u4e00-\u9fa5]{1,32}$|^\s{0}$)/,
    modelReg: /(^[a-zA-Z0-9\u4e00-\u9fa5-]{1,32}$|^\s{0}$)/,
    gbcodeReg: /^[a-zA-Z0-9]{20}$/,
    clear: false, //用来促使弹框里的input框清空
    inputJson: {
        "gbcode": "",
        "manufacturer": "",
        "name": "",
        "model": "",
    },
    validJson: {
        "gbcode": true,
        "type": true,
        "manufacturer": true,
        "model": true,
        "name": true,
        "orgId": true,
        "channel": true, //是否有通道
    },
    showJson: {
        "gbcode": false,
        "manufacturer": false,
        "model": false,
    },
    renderedCallback() {
        //通道list渲染完后的回调
        this.justShowNow = false;
    },
    getSelected(key, title) {
        this.orgId = key;
    },
    handleTreeChange(e) {
        this.orgCode = e.node.code;
        this.orgPath = e.node.path;
        this.orgName = e.node.title;
    },
    extraExpandHandle(treeId, treeNode, selectedKey) {
        sbzygl.fetchOrgWhenExpand(treeId, treeNode, selectedKey);
    },
    handleDeviceTypeChange(e) {
        fetchModelByTypeAndManu(this);
    },
    getSearchLabel(label, owner) {
        //厂商或型号的输入有变化时
        if (owner === "manufacturer") {
            this.inputJson.manufacturer = label;
        } else {
            this.inputJson.model = label;
        }
    },
    getSearchSelected(label, value, owner) {
        //厂商或型号选中时
        if (owner === "manufacturer") {
            fetchModelByTypeAndManu(this);
            this.isManuFirstSelect = false;
        }
    },
    handleSearchSelectFocus(event, owner) {
        //厂商或型号获得焦点时
        if (owner === "manufacturer") {
            sbzygl.handleFocus(event, 'manufacturer', this);
        } else {
            sbzygl.handleFocus(event, 'model', this);
        }
    },
    handleSearchSelectFormat(event, owner) {
        //厂商或型号失去焦点时判断是否符合格式
        if (owner === "manufacturer") {
            sbzygl.handleFormat(event, 'manufacturer', this, this.manuReg, null);
        } else {
            sbzygl.handleFormat(event, 'model', this, this.modelReg, null);
        }
    },
    getChannelListLength(channelList) {
        return Boolean(channelList.length);
    },
    handleAddChannel(event) {
        let len = this.channelList.length + 1;
        this.channelList.push({
            index: len,
            gbcode: "",
            name: "",
            controlType: "normal",
            showJson: {
                gbcode: false
            },
            validJson: {
                gbcode: true,
                gbcodeUnique: true,
                name: true,
                nameUnique: true
            }
        });
        this.validJson.channel = true;
        let $listContent = $('#dlspcjsbgl-modal-modify .channel-list-content');
        $listContent.scrollTop($listContent.get(0).scrollHeight);
        //判断是否新增了通道（新增在没有保存的情况下又直接删除的不能算）
        if (this.defaultChannelList.length - this.channelDeleteIds.length < len) {
            this.isChannelChange = true;
            this.isChannelSave = false;
            this.channelSaveStatus.add = false;
            // console.log('新增了')
        }
    },
    handleDeleteChannel(item) {
        avalon.Array.remove(this.channelList, item);
        //判断是否删除了通道（新增在没有保存的情况下又直接删除的不能算）
        if (item.id) {
            this.channelDeleteIds.push(item.id);
            this.isChannelChange = true;
            this.isChannelSave = false;
            this.channelSaveStatus.delete = false;
            // console.log('删除了')
        }
        $('.channel-list-content').scrollTop(0);
    },
    handleSaveChannel(event) {
        if (!this.isChannelChange) {
            return;
        }
        //验证是否至少有一个通道
        if (!this.channelList.length) {
            this.validJson.channel = false;
            return;
        }
        let hasBack = {}; //用于判断删除/修改/新增得请求是否已经返回
        if (this.channelDeleteIds.length) {
            hasBack.delete = false;
            deleteChannel(() => {
                hasBack.delete = true;
                channelModify.call(this);
            });
        } else {
            channelModify.call(this);
        }

        function channelModify() {

            this.channelAddDatas.clear();
            this.channelModifyDatas.clear();
            avalon.each(this.channelList, (index, item) => {
                if (item.id) {
                    this.channelModifyDatas.push(item); //索引改变也算修改，所以在此将非新增非删除的都归类为修改
                } else {
                    this.channelAddDatas.push(item);
                }
            });
            if (this.channelModifyDatas.length) {
                hasBack.modify = false;
                addOrModifyChannel('modify', this.channelModifyDatas, () => {
                    hasBack.modify = true
                });
            }
            if (this.channelAddDatas.length) {
                hasBack.add = false;
                addOrModifyChannel('add', this.channelAddDatas, () => {
                    hasBack.add = true
                });
            } else {
                //当this.channelAddDatas为空时，将下面这个设为true，
                //避免新增没有保存又直接删除的情况下 this.channelSaveStatus.add还为false
                //使resetChannel内的判断失误
                this.channelSaveStatus.add = true;
            }
        }


        //判断请求是否都返回了，如果全都返回了则resetChannel
        let timer = setInterval(() => {
            let pass = true;
            for (let key in hasBack) {
                if (!hasBack[key]) {
                    pass = false;
                    break;
                }
            }
            if (pass) {
                clearInterval(timer);
                resetChannel();
            }
        }, 200);

        function resetChannel() {
            let pass = true;
            //当请求都返回后，判断是否全部成功，全部成功则提示成功并且重置相关状态，便于在此次保存基础上判断是否又有变更
            avalon.each(dialogModifyVm.channelSaveStatus, (index, item) => {
                if (!item) {
                    pass = false;
                    return false;
                }
            })
            if (pass) {
                sbzygl.showTips('success', '保存通道成功');
                dialogModifyVm.isChannelChange = false;
                dialogModifyVm.isChannelSave = true;
            }
        }
    },
    handleFocus(name, event) {
        sbzygl.handleFocus(event, name, this);
    },
    handleFormat(name, reg, event) {
        sbzygl.handleFormat(event, name, this, reg);
    },
    handleClear(name, event) {
        sbzygl.handleClear(event, name, this);
    },
    handleChannelFocus(item, name, event) {
        if (item.showJson[name] != undefined) {
            item.showJson[name] = true;
        }
        item.validJson[name] = true;
        $(event.target).siblings('.fa-close').show();
        if (name == "gbcode") {
            item.validJson.gbcodeUnique = true;
        } else if (name == "name") {
            item.validJson.nameUnique = true;
        }
    },
    handleChannelFormat(item, name, reg, lengthLimit, event) {
        //判断字段是否做了修改
        if (item.id && item[name] !== this.defaultChannelList[item.index - 1][name]) {
            this.isChannelChange = true;
            this.isChannelSave = false;
            this.channelSaveStatus.modify = false;
            // console.log('修改了')
        }
        reg = reg || /\S+/g;
        item[name] = $.trim(item[name]);
        if (!reg.test(item[name]) || (lengthLimit && item[name].length > lengthLimit)) {
            item.validJson[name] = false;
        } else {
            item.validJson[name] = true;
        }
        if (item.showJson[name] != undefined) {
            item.showJson[name] = false;
        }
        //判断输入的国标编号或通道名称在当前设备下是否已存在
        if (item.validJson[name] && item.validJson[name + 'Unique'] != undefined) {
            let sameArr = [];
            avalon.each(this.channelList, (i, outerItem) => {
                avalon.each(this.channelList, (j, innerItem) => {
                    if (innerItem[name] && innerItem.index !== outerItem.index && innerItem[name] === outerItem[name]) {
                        avalon.Array.ensure(sameArr, innerItem.index)
                    }
                });
            });
            avalon.each(this.channelList, (index, channel) => {
                if (sameArr.indexOf(channel.index) !== -1) {
                    channel.validJson[name + 'Unique'] = false;
                } else {
                    channel.validJson[name + 'Unique'] = true;
                }
            });
        }
        $(event.target).siblings('.fa-close').hide();
    },
    handleChannelClear(item, name, event) {
        item[name] = "";
        $(event.target).siblings('input').val('').focus();
    },
    handleControlChange(event) {
        //判断是否是弹窗刚显示出来，有些情况下弹框刚显示出来会触发这个change
        if (this.justShowNow) {
            return;
        }
        //控制字段改变
        this.isChannelChange = true;
        this.isChannelSave = false;
        this.channelSaveStatus.modify = false;
        // console.log('修改了control')
    },
    handleCancel(e) {
        this.show = false;
        this.clear = !this.clear;
    },
    handleOk() {
        //验证是否已经保存通道
        if (this.isChannelChange && !this.isChannelSave) {
            dialogChannelTipVm.show = true;
            return;
        }
        modifyDevice();
    }

});
dialogModifyVm.$watch('channelList', (channelList) => {
    avalon.each(channelList, (index, item) => {
        item.index = index + 1;
    })
});
dialogModifyVm.$watch('clear', (v) => {
    dialogModifyVm.inputJson = {
        "gbcode": "",
        "manufacturer": "",
        "name": "",
        "model": "",
    }
    dialogModifyVm.validJson = {
        "gbcode": true,
        "type": true,
        "manufacturer": true,
        "model": true,
        "name": true,
        "orgId": true,
        "channel": true,
    }
    dialogModifyVm.showJson = {
        "gbcode": false,
        "manufacturer": false,
        "model": false,
    }
    dialogModifyVm.channelSaveStatus = {
        "delete": true,
        "modify": true,
        "add": true
    }
    dialogModifyVm.isChannelChange = false;
    dialogModifyVm.isChannelSave = false;
    dialogModifyVm.justShowNow = true;
    //直接设成[]，下拉框选了之后会一直保持选择的值
    dialogModifyVm.selectedRowsData = [''];
})

//删除弹窗vm定义
const dialogDelVm = avalon.define({
    $id: 'dlspcjsbgl-delete-vm',
    show: false,
    deviceIdArr: [],
    selectedRowsLength: 1,
    isBatch: false,
    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        let url = '/gmvcs/uom/device/deleteWithChannel';
        sbzygl.ajax(url, 'post', this.deviceIdArr).then(result => {
            if (result.code !== 0) {
                sbzygl.showTips('error', result.msg);
                return;
            }
            let rowsLength = $('.tyywglpt-list-content>li').length;
            this.show = false;
            sbzygl.showTips('success', '删除成功');
            if ((rowsLength == vm.selectedRowsLength || rowsLength == 1) && vm.current > 1) {
                vm.current = vm.current - 1;
            }
            vm.fetchList();
            vm.fetchStatusOptions();
            vm.fetchManuOptions();
            vm.fetchTypeOptions();
        })
    }
});

//通道保存提示弹窗vm定义
const dialogChannelTipVm = avalon.define({
    $id: 'zfygl-channeltip-vm',
    show: false,
    handleOk() {
        this.show = false;
    }
});

//注册/修改时根据厂商和类型获取设备型号
function fetchModelByTypeAndManu(dialogVm) {
    if (!dialogVm.isManuFirstSelect) {
        dialogVm.inputJson.model = "";
    }
    if (!dialogVm.inputJson.manufacturer) {
        //dialogVm.modelOptions.clear()没有效果。。。
        dialogVm.modelOptions = [];
        return;
    }
    let type = String(dialogVm.$form.record.type);
    let url = '/gmvcs/uom/device/model?manufacturer=' + encodeURIComponent(dialogVm.inputJson.manufacturer) + '&type=' + encodeURIComponent(type);
    sbzygl.ajax(url).then((result) => {
        if (result.code != 0) {
            sbzygl.showTips('error', result.msg);
            //dialogVm.modelOptions.clear()没有效果。。。
            dialogVm.modelOptions = [];
            return;
        }
        //型号
        sbzygl.handleRemoteArrayToDic(result.data, (modelHasNullOptions, modelOptions) => {
            dialogVm.modelOptions = modelOptions;
        })
    });
}

// 注册设备
function registerDevice() {
    let url = '/gmvcs/uom/device/registerWithChannel',
        record = JSON.parse(JSON.stringify(dialogRegisterVm.$form.record)),
        inputJson = sbzygl.trimData(dialogRegisterVm.inputJson),
        pass = true,
        channelDatas = [];
    avalon.each(dialogRegisterVm.channelList, (index, item) => {
        avalon.each(item.validJson, (key, value) => {
            if (((key == 'gbcode' || key == 'name') && !item[key]) || !value) {
                item.validJson[key] = false;
                pass = false;
            }
        });
        if (!pass) {
            return true;
        }
        channelDatas.push({
            "index": item.index,
            "gbcode": item.gbcode,
            "name": item.name,
            "ptzcontrollable": $('.control-type-' + item.index + ' .ane-select-selected').text() === "普通" ? 0 : 1,
            "status": 1,
            "online": 0,
            "isDeleted": 0,
            "extendInfo": "",
            "updateTime": moment().format("YYYY-MM-DD HH:mm:ss")
        });
    })
    //这么写是为了兼容ie8
    let param = {
        "gbcode": inputJson.gbcode,
        "orgId": dialogRegisterVm.orgId,
        "orgCode": dialogRegisterVm.orgCode,
        "orgPath": dialogRegisterVm.orgPath,
        "type": String(record.type),
        "manufacturer": inputJson.manufacturer,
        "model": inputJson.model,
        "name": inputJson.name,
        "status": 0,
        "channelSet": channelDatas,
        //以下字段暂未定义完全，暂时传空串
        "extendInfo": "",
        "ip": "",
        "platformGbcode": "",
        "userCode": "",
        "version": "",
        "storageId": "",
    };
    avalon.each(record, function (key, value) {
        if (Array.isArray(value)) {
            param[key] = value[0];
        }
    });
    //------------表单验证开始----------------------------------------------------------
    avalon.each(dialogRegisterVm.validJson, (key, value) => {
        if (((key == 'gbcode' || key == 'orgId' || key == 'type' || key == 'name') && !param[key]) || !value) {
            dialogRegisterVm.validJson[key] = false;
            pass = false;
        }
    });
    if (!pass) {
        return;
    }
    //------------表单验证结束----------------------------------------------------------
    sbzygl.ajax(url, 'post', param).then(result => {
        if (result.code == 1854) {
            dialogRegisterVm.validJson.gbcodeUnique = false;
            // sbzygl.showTips('error', '请输入唯一的国标编号');
            return;
        } else if (result.code == 1857) {
            // console.log('国标已存在')
            avalon.each(dialogRegisterVm.channelList, (index, channel) => {
                if (channel.gbcode == result.data) {
                    channel.validJson.gbcodeUnique = false;
                }
            });
            // sbzygl.showTips('error', '请输入唯一的国标编号');
            return;
        } else if (result.code !== 0) {
            sbzygl.showTips('error', result.msg);
            return;
        }
        dialogRegisterVm.show = false;
        sbzygl.showTips('success', '注册成功');
        dialogRegisterVm.clear = !dialogRegisterVm.clear;
        vm.current = 1;
        avalon.router.navigate('/tyywglpt-sbzygl-dlspcjsbgl');
    })
}

//修改设备
function modifyDevice() {
    let url = '/gmvcs/uom/device/modifyDevice',
        record = JSON.parse(JSON.stringify(dialogModifyVm.$form.record)),
        inputJson = sbzygl.trimData(dialogModifyVm.inputJson),
        pass = true;
    //这么写是为了兼容ie8
    let param = {
        "id": dialogModifyVm.selectedRowsData[0].id,
        "orgId": dialogModifyVm.orgId,
        "type": String(record.type),
        "manufacturer": inputJson.manufacturer,
        "model": inputJson.model,
        "name": inputJson.name,
        "status": record.status === "" ? null : Number(record.status),
        //以下字段暂未定义完全，暂时传空串
        "extendInfo": "",
        "ip": "",
        "platformGbcode": "",
        "userCode": "",
        "version": "",
        "storageId": "",
    };
    avalon.each(record, function (key, value) {
        if (Array.isArray(value)) {
            param[key] = value[0];
        }
    });
    //------------表单验证开始----------------------------------------------------------
    avalon.each(dialogRegisterVm.validJson, (key, value) => {
        if (((key == 'orgId' || key == 'type' || key == 'name') && !param[key]) || !value) {
            dialogModifyVm.validJson[key] = false;
            pass = false;
        }
    });
    if (!pass) {
        return;
    }
    //------------表单验证结束----------------------------------------------------------
    sbzygl.ajax(url, 'post', param).then(result => {
        if (result.code !== 0) {
            sbzygl.showTips('error', result.msg);
            return;
        }
        dialogModifyVm.show = false;
        sbzygl.showTips('success', '设备信息修改成功');
        dialogModifyVm.clear = !dialogModifyVm.clear;
        //重新载入页面（因为可能新增了厂商或型号，如果不重新载入在搜索栏中看不到这个新增的厂商或型号）
        avalon.router.navigate('/tyywglpt-sbzygl-dlspcjsbgl');
    })
}

//通道的新增或修改
function addOrModifyChannel(mode, changeDatas, callback) {
    let url,
        pass = true,
        channelDatas = [],
        channelDataIds = [];
    if (mode === "add") {
        url = '/gmvcs/uom/device/registerChannel';
    } else {
        url = '/gmvcs/uom/device/modifyChannel';
    }
    avalon.each(changeDatas, (index, item) => {
        avalon.each(item.validJson, (key, value) => {
            if (((key == 'gbcode' || key == 'name') && !item[key]) || !value) {
                item.validJson[key] = false;
                pass = false;
            }
        });
        if (!pass) {
            return true;
        }
        let data = {
            "deviceGbcode": dialogModifyVm.inputJson.gbcode,
            "index": item.index,
            "gbcode": item.gbcode,
            "name": item.name,
            "ptzcontrollable": $('.control-type-' + item.index + ' .ane-select-selected').text() === "普通" ? 0 : 1,
            "status": 1,
            "online": 0,
            "isDeleted": 0,
            "extendInfo": "",
            "updateTime": moment().format("YYYY-MM-DD HH:mm:ss")
        }
        if (mode === "modify") {
            data.id = item.id;
            channelDataIds.push(item.id);
        }
        channelDatas.push(data);
    });
    if (!pass) {
        return;
    }
    sbzygl.ajax(url, 'post', channelDatas).then(result => {
        if (result.code !== 0) {
            if (mode === "add") {
                dialogModifyVm.channelSaveStatus.add = false;
                avalon.each(dialogModifyVm.channelList, (index, channel) => {
                    if (channel.gbcode == result.data) {
                        channel.validJson.gbcodeUnique = false;
                    }
                });
            } else {
                dialogModifyVm.channelSaveStatus.modify = false;
            }
            if (result.code == 1857) {
                // sbzygl.showTips('error', '请输入唯一的国标编号');
                avalon.isFunction(callback) && callback();
                return
            }
            sbzygl.showTips('error', '保存通道失败-' + result.msg);
            avalon.isFunction(callback) && callback();
            return;
        }
        if (mode === "add") {
            // console.log('新增成功')
            let channelDataGbcodes = [];
            avalon.each(dialogModifyVm.channelList, (index, item) => {
                channelDataGbcodes.push(item.gbcode);
            })
            avalon.each(result.data, (index, item) => {
                let controlStr = item.ptzcontrollable === 0 ? "normal" : "cloud";
                //重设defaultChannelList，以便可以在此次保存的基础上继续判断是否又修改了
                dialogModifyVm.defaultChannelList.push({
                    id: item.id,
                    index: item.index,
                    gbcode: item.gbcode,
                    name: item.name,
                    controlType: controlStr,
                });
                //将新增的这一通道项的id属性加进来，以便可以在此次保存的基础上继续判断是否又新增了
                let matchIndex = channelDataGbcodes.indexOf(item.gbcode);
                if (matchIndex !== -1) {
                    //兼容ie8（本来只需要dialogModifyVm.channelList[matchIndex].id = item.id即可）
                    dialogModifyVm.channelList[matchIndex] = {
                        index: item.index,
                        id: item.id,
                        gbcode: item.gbcode,
                        name: item.name,
                        controlType: controlStr,
                        showJson: {
                            gbcode: false
                        },
                        validJson: {
                            gbcode: true,
                            gbcodeUnique: true,
                            name: true,
                            nameUnique: true
                        }
                    };
                    dialogModifyVm.channelList = dialogModifyVm.channelList.slice();
                }
            });

            dialogModifyVm.channelSaveStatus.add = true;
        } else {
            // console.log('修改成功')
            //重设defaultChannelList，以便可以在此次保存的基础上继续判断是否又修改了
            avalon.each(dialogModifyVm.defaultChannelList, (index, item) => {
                let matchIndex = channelDataIds.indexOf(item.id);
                if (matchIndex !== -1) {
                    let matchData = channelDatas[matchIndex];
                    let controlStr = matchData.ptzcontrollable === 0 ? "normal" : "cloud";
                    dialogModifyVm.defaultChannelList[index] = {
                        id: matchData.id,
                        index: matchData.index,
                        gbcode: matchData.gbcode,
                        name: matchData.name,
                        controlType: controlStr,
                    };
                }
            });
            dialogModifyVm.channelSaveStatus.modify = true;
        }
        vm.fetchList();
        avalon.isFunction(callback) && callback();
    })
}

//通道的删除
function deleteChannel(callback) {
    let url = '/gmvcs/uom/device/deleteChannel';

    sbzygl.ajax(url, 'post', dialogModifyVm.channelDeleteIds).then(result => {
        if (result.code !== 0) {
            sbzygl.showTips('error', '保存通道失败-' + result.msg);
            dialogModifyVm.channelSaveStatus.delete = false;
            avalon.isFunction(callback) && callback();
            return;
        }
        //重设defaultChannelList，以便可以在此次保存的基础上继续判断是否又修改了
        //逆序遍历，防止删除后下标出错
        console.log(result)
        for (let i = dialogModifyVm.defaultChannelList.length - 1; i >= 0; i--) {
            let item = dialogModifyVm.defaultChannelList[i];
            if (dialogModifyVm.channelDeleteIds.indexOf(item.id) !== -1) {
                dialogModifyVm.defaultChannelList.splice(i, 1);
            }
        }
        dialogModifyVm.channelSaveStatus.delete = true;
        dialogModifyVm.channelDeleteIds.clear();
        vm.fetchList();
        avalon.isFunction(callback) && callback();
        // console.log('删除成功')
    })
}