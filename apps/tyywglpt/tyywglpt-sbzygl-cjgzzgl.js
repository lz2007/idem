/**
 * 统一运维管理平台--设备资源管理--采集工作站管理
 *caojiacong
 */
import avalon from 'avalon2';
import ajax from '../../services/ajaxService';
import moment from 'moment';
import Sbzygl from '../common/common-sbzygl';
import {
    createForm,
    message,
    notification
} from 'ane';
import * as menuServer from '../../services/menuService';
const storage = require('../../services/storageService.js').ret;
export const name = 'tyywglpt-sbzygl-cjgzzgl';
require('../common/common-tyywglpt.css');
require('../common/common-sbzygl.css');
require('./tyywglpt-sbzygl-cjgzzgl.css');
let vm = null,
    sbzygl = null,
    enableQuery = true,
    queryTimer = null;
const listHeaderName = name + "-list-header";
//页面组件
avalon.component(name, {
    template: __inline('./tyywglpt-sbzygl-cjgzzgl.html'),
    defaults: {
        $id: 'cjgzzgl-vm',
        list: [],
        loading: true,
        isNull: false,
        total: 0,
        current: 1,
        pageSize: 20,
        selectedRowsLength: 0,
        checkedIsSource: false, //勾选的是否全为来自级联平台的设备
        checkedIsSameManuAndModel: false, //勾选的是否全为同一型号设备
        checkedData: [],
        $form: createForm(),
        orgData: [],
        orgId: "",
        orgPath: "",
        orgCode: "",
        orgName: "",
        manufacturerOptions: [],
        modelOptions: [],
        modelName: "", //选择的型号的label，选择不限时为null（这样做是因为型号返回的是数组，不是字典表）
        manufacturerOk: false,
        modelOk: false,
        isFirstFetch: true, //是否为第一次获取搜索栏中的型号
        isManuSelectMode: false, //是否为厂商改变导致的型号获取
        hasFetchManu: false, //是否已经获取厂商字典
        checkAll: false,
        dataStr: "",
        dataJson: {},
        titleTimer: "", //popover用的的定时器，代码在common-sbzygl.js
        authority: { // 按钮权限标识
            "AQPZ": false, //设备资源管理_采集工作站管理_安全配置
            "CLPZ": false, //设备资源管理_采集工作站管理_策略配置
            "DELETE": false, //设备资源管理_采集工作站管理_删除
            "MODIFY": false, //设备资源管理_采集工作站管理_修改
            "REGISTRY": false, //设备资源管理_采集工作站管理_注册
            "SEARCH": false, //设备资源管理_采集工作站管理_查询
            "UPDATE": false, //设备资源管理_采集工作站管理_升级
            "BATCHDELETE": false, // 批量删除
            "OPT_SHOW": false //操作栏-显隐
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
                    if (/^UOM_FUNCTION_SBZYGL_CJGZZGL_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                if (func_list.length == 0)
                    return;
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_SBZYGL_CJGZZGL_AQPZ":
                            _this.authority.AQPZ = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_CJGZZGL_CLPZ":
                            _this.authority.CLPZ = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_CJGZZGL_DELETE":
                            _this.authority.DELETE = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_CJGZZGL_MODIFY":
                            _this.authority.MODIFY = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_CJGZZGL_REGISTRY":
                            _this.authority.REGISTRY = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_CJGZZGL_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_CJGZZGL_UPDATE":
                            _this.authority.UPDATE = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_CJGZZGL_BATCHDELETE":
                            _this.authority.BATCHDELETE = true;
                            break;
                    }
                });
                if (false == _this.authority.MODIFY && false == _this.authority.DELETE)
                    _this.authority.OPT_SHOW = true;
                sbzygl.autoSetListPanelTop();
            });
            this.$watch('dataJson', (v) => {
                if (v) {
                    this.current = v.page + 1;
                    this.modelName = v.moduleNum;
                }
            })
        },
        onReady() {
            this.dataStr = storage.getItem(name);
            this.dataJson = this.dataStr ? JSON.parse(this.dataStr) : null;
            //表头宽度设置
            sbzygl.setListHeader(listHeaderName);
            this.fetchOrgData(() => {
                let timer = setInterval(() => {
                    //等到this.$form.record不为{}，而有具体内容时再fetchManuModelTypeOptions，否则ie8下有问题
                    if (!this.hasFetchManu) {
                        let recordStr = JSON.stringify(this.$form.record);
                        let length = recordStr.match(/:/g) ? recordStr.match(/:/g).length : 0;
                        length && this.fetchManuModelOptions();
                    }
                    //保证查询条件到位后再fetchList
                    if (vm.manufacturerOk && vm.modelOk) {
                        vm.fetchList();
                        clearInterval(timer);
                    }
                }, 100);
            });
            sbzygl.autoSetListPanelTop();
        },
        onDispose() {
            clearTimeout(queryTimer);
            clearTimeout(this.titleTimer);
            enableQuery = true;
            $('div.popover').remove();
        },
        getDefaultManu(manufacturerOptions, dataJson) {
            return manufacturerOptions.length > 0 ? (dataJson ? dataJson.csId : manufacturerOptions[0].value) : '';
        },
        getDefaultModel(modelOptions, isManuSelectMode, dataJson) {
            return modelOptions.length > 0 ? (isManuSelectMode ? modelOptions[0].value : (dataJson ? dataJson.modelId : modelOptions[0].value)) : '';
        },
        settingIsDisabled(checkedIsSource, selectedRowsLength) {
            return (!checkedIsSource || selectedRowsLength !== 1) ? 'disabled' : '';
        },
        updateIsDisabled(checkedIsSameManuAndModel, selectedRowsLength) {
            return (!checkedIsSameManuAndModel || selectedRowsLength < 1) ? 'disabled' : '';
        },
        //修改按钮
        handleModify(record) {
            if (record.source) {
                sbzygl.showTips('warn', '该条数据来自级联平台，不能修改');
                return;
            }
            dialogModifyVm.selectedRowsData = [record];
            dialogModifyVm.inputJson = {
                "gbCode": record.gbCode || "",
                "wsName": record.wsName || "",
                "modelnum": record.modelnum || "",
                "ip": record.ipAddr || "",
                "wsAddr": record.addr || "",
                "phoneNumber": record.phoneNumber || "",
                "admin": record.admin || "",
                "expireDays": record.expireDays || "",
                "storageName": record.storageName || "",
                "storageId": record.storageId || "",
                "manufacturer": String(record.manufacturer) == "null" ? '' : String(record.manufacturer),
                "manufacturerName": String(record.manufacturerName || ''),
                "statusCode": record.statusCode || ""
            }
            dialogModifyVm.orgId = record.orgId;
            dialogModifyVm.orgPath = record.orgPath;
            dialogModifyVm.orgName = record.orgName;
            dialogModifyVm.show = true;
        },
        //删除按钮
        handleDelete(record) {
            if (record.source) {
                sbzygl.showTips('warn', '该条数据来自级联平台，不能删除');
                return;
            }
            dialogDelVm.isBatch = false;
            dialogDelVm.workStations = record.wsId;
            dialogDelVm.show = true;
        },
        //注册按钮
        handleRegister() {
            if (this.selectedRowsLength !== 0)
                return;
            let record = this.$form.record;
            dialogRegisterVm.orgId = this.orgId;
            dialogRegisterVm.orgPath = this.orgPath;
            dialogRegisterVm.orgCode = this.orgCode;
            dialogRegisterVm.orgName = this.orgName;
            //联动搜索栏选择的厂商
            if (String(record.manufacturer) == "null" || !record.manufacturer) {
                dialogRegisterVm.defaultManufacturer = dialogRegisterVm.manufacturerOptions.length > 0 ? dialogRegisterVm.manufacturerOptions[0].value : "";
            } else {
                dialogRegisterVm.defaultManufacturer = String(record.manufacturer);
            }

            dialogRegisterVm.fetchManuToModel();
            dialogRegisterVm.show = true;
            createGbcode(dialogRegisterVm.orgCode);
        },
        //策略配置按钮
        handlePloySetting() {
            if (this.selectedRowsLength !== 1) {
                return;
            }
            if (!vm.checkedIsSource) {
                sbzygl.showTips('warn', '该条数据来自级联平台，不能进行策略配置');
                return;
            }
            let url = '/gmvcs/uom/device/workstation/policy/configuration/info/' + dialogPloySettingVm.workStationId;
            sbzygl.ajax(url).then(result => {
                if (result.code !== 0) {
                    sbzygl.showTips('error', result.msg);
                    return;
                }
                dialogPloySettingVm.show = true;
                dialogPloySettingVm.defaultDays = result.data.days;
            });
        },
        //安全配置按钮
        handleSafeSetting() {
            if (this.selectedRowsLength !== 1) {
                return;
            }
            if (!vm.checkedIsSource) {
                sbzygl.showTips('warn', '该条数据来自级联平台，不能进行安全配置');
                return;
            }
            avalon.each(dialogSafeSettingVm.deviceCheck, (key, value) => {
                dialogSafeSettingVm.deviceCheck[key] = false;
            });
            avalon.each(dialogSafeSettingVm.exportCheck, (key, value) => {
                dialogSafeSettingVm.exportCheck[key] = false;
            });
            dialogSafeSettingVm.isDeviceAllchecked = false;
            dialogSafeSettingVm.isDeviceAllcheckedSign = true;
            dialogSafeSettingVm.isDeviceSomeChecked = false;

            dialogSafeSettingVm.isExportAllchecked = false;
            dialogSafeSettingVm.isExportAllcheckedSign = true;
            dialogSafeSettingVm.isExportSomeChecked = false;
            let url = '/gmvcs/uom/device/workstation/security/configuration/info/' + dialogSafeSettingVm.workStationId;
            sbzygl.ajax(url).then(result => {
                if (result.code !== 0) {
                    sbzygl.showTips('error', result.msg);
                    return;
                }
                dialogSafeSettingVm.show = true;
                let data = result.data;
                let deviceTotal = dialogSafeSettingVm.deviceOptions.length;
                let exportTotal = dialogSafeSettingVm.exportOptions.length;
                let deviceNum = 0;
                let exportNum = 0;
                avalon.each(data.deviceControlPolicy, function (key, value) {
                    dialogSafeSettingVm.deviceCheck[key] = value;
                    if (value) {
                        deviceNum++;
                    }
                });
                avalon.each(data.exportPolicy, function (key, value) {
                    dialogSafeSettingVm.exportCheck[key] = value;
                    if (value) {
                        exportNum++;
                    }
                });
                if (data.netControlPolicy == null || data.netControlPolicy.enable == null) {
                    dialogSafeSettingVm.netCheck = "false"
                } else {
                    dialogSafeSettingVm.netCheck = String(data.netControlPolicy.enable);
                }
                if (data.dsjRegisterPolicy == null || data.dsjRegisterPolicy.enable == null) {
                    dialogSafeSettingVm.modeAuto = "false"
                } else {
                    dialogSafeSettingVm.modeAuto = String(data.dsjRegisterPolicy.enable);
                }
                dialogSafeSettingVm.whiteListValue = data.whiteList || "";
                if (deviceNum === deviceTotal) {
                    dialogSafeSettingVm.isDeviceAllchecked = true;
                    dialogSafeSettingVm.isDeviceAllcheckedSign = false;
                    dialogSafeSettingVm.isDeviceSomeChecked = false;
                } else if (deviceNum > 0) {
                    dialogSafeSettingVm.isDeviceAllchecked = false;
                    dialogSafeSettingVm.isDeviceAllcheckedSign = true;
                    dialogSafeSettingVm.isDeviceSomeChecked = true;
                }
                if (exportNum === exportTotal) {
                    dialogSafeSettingVm.isExportAllchecked = true;
                    dialogSafeSettingVm.isExportAllcheckedSign = false;
                    dialogSafeSettingVm.isExportSomeChecked = false;
                } else if (exportNum > 0) {
                    dialogSafeSettingVm.isExportAllchecked = false;
                    dialogSafeSettingVm.isExportAllcheckedSign = true;
                    dialogSafeSettingVm.isExportSomeChecked = true;
                }
            });
        },
        //升级按钮
        handleUpdate() {
            if (!this.checkedIsSameManuAndModel || this.selectedRowsLength < 1)
                return;
            sbzygl.fetchUpdateList(0, this.checkedData, (updateData) => {
                avalon.each(updateData, (index, el) => {
                    el.checked = false;
                    el.insertTime = moment(el.insertTime).format("YYYY-MM-DD HH:mm:ss");
                })
                dialogUpdateVm.show = true;
                dialogUpdateVm.updateData = updateData;
                setTimeout(() => {
                    sbzygl.initList($('.sbzygl-modal-update .update-title'), $('.sbzygl-modal-update .update-package-list'));
                }, 200);
            });
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
            let workStation = [];
            avalon.each(this.checkedData, (index, el) => {
                workStation.push(el.wsId);
            })
            dialogDelVm.workStations = workStation.join(',');
            dialogDelVm.show = true;
        },
        //获取当前页码
        getCurrent(current) {
            this.current = current;
        },
        //获取所属部门
        getSelected(key, title) {
            this.orgId = key;
        },
        handleTreeChange(e, selectedKeys) {
            this.orgPath = e.node.path;
            this.orgCode = e.node.code;
            this.orgName = e.node.title;
        },
        extraExpandHandle(treeId, treeNode, selectedKey) {
            sbzygl.fetchOrgWhenExpand(treeId, treeNode, selectedKey);
        },
        handleManuChange(e) {
            this.fetchManuToModel();
            if (!this.isFirstFetch) {
                this.isManuSelectMode = true;
            }
        },
        handleModelChange(e) {
            let value = e.target.value;
            if (!value || value == "null") {
                this.modelName = null;
            } else {
                let index = Number(value);
                if (this.modelOptions.length > index + 1) {
                    this.modelName = this.modelOptions[index + 1].label;
                }
            }
        },
        //页码改变回调
        pageChange() {
            this.fetchList()
        },
        //全选列表
        handleCheckAll(e) {
            sbzygl.handleCheckAll(e, (list) => {
                this.checkedData = list;
                let checkedSource = list.filter((item) => {
                    return !item.source;
                });
                if (checkedSource.length > 0 && checkedSource.length === this.checkedData.length) {
                    this.checkedIsSource = true;
                } else {
                    this.checkedIsSource = false;
                }
                dialogDelVm.selectedRowsLength = checkedSource.length;
                if (this.checkAll) {
                    let baseModel = "",
                        baseManu = "";
                    let i;
                    for (i = 0; i < list.length; i++) {
                        if (i === 0) {
                            baseModel = list[0].modelnum;
                            baseManu = list[0].manufacturer;
                        }
                        if (baseModel !== list[i].modelnum || baseManu !== list[i].manufacturer) {
                            this.checkedIsSameManuAndModel = false;
                            break;
                        }
                    }
                    if (i >= list.length) {
                        this.checkedIsSameManuAndModel = true;
                    }
                } else {
                    this.checkedIsSameManuAndModel = false;
                }
            })
        },
        //勾选列表
        handleCheck(index, record, e) {
            sbzygl.handleCheck(index, record, e, (hasChecked, record) => {
                this.checkedData = hasChecked;
                let checkedSource = hasChecked.filter((item) => {
                    return !item.source;
                });
                if (checkedSource.length > 0 && checkedSource.length === this.checkedData.length) {
                    this.checkedIsSource = true;
                } else {
                    this.checkedIsSource = false;
                }
                if (record.checked) {
                    dialogPloySettingVm.workStationId = record.wsId;
                    dialogSafeSettingVm.workStationId = record.wsId;
                }
                dialogDelVm.selectedRowsLength = checkedSource.length;
                if (hasChecked.length) {
                    let baseModel = "",
                        baseManu = "";
                    let i;
                    for (i = 0; i < hasChecked.length; i++) {
                        if (i === 0) {
                            baseModel = hasChecked[0].modelnum;
                            baseManu = hasChecked[0].manufacturer;
                        }
                        if (baseModel !== hasChecked[i].modelnum || baseManu !== hasChecked[i].manufacturer) {
                            this.checkedIsSameManuAndModel = false;
                            break;
                        }
                    }
                    if (i >= hasChecked.length) {
                        this.checkedIsSameManuAndModel = true;
                    }
                } else {
                    this.checkedIsSameManuAndModel = false;
                }
            })
        },
        //查询
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
        //获取所属部门
        fetchOrgData(callback) {
            sbzygl.fetchOrgData(this.orgData, (orgData) => {
                this.orgData = orgData;
                dialogRegisterVm.orgData = orgData;
                dialogModifyVm.orgData = orgData;
                if (orgData.length > 0) {
                    this.orgId = this.dataJson ? this.dataJson.orgId : orgData[0].key;
                    this.orgPath = this.dataJson ? this.dataJson.orgPath : orgData[0].path;
                    this.orgCode = this.dataJson ? this.dataJson.orgCode : orgData[0].code;
                    this.orgName = this.dataJson ? this.dataJson.orgName : orgData[0].title;
                }
                avalon.isFunction(callback) && callback();
            })
        },
        //获取列表
        fetchList() {
            $('div.popover').remove();
            this.loading = true;
            let data = {
                orgId: this.orgId,
                orgPath: this.orgPath,
                csId: this.$form.record.manufacturer,
                moduleNum: this.modelName == "" ? null : this.modelName,
                page: this.current - 1,
                pageSize: this.pageSize
            };
            data.csId = (data.csId == "null" || !data.csId) ? null : Number(data.csId);
            this.checkAll = false;
            this.selectedRowsLength = 0;
            let storageData = JSON.parse(JSON.stringify(data));
            storageData.orgCode = this.orgCode;
            storageData.orgName = this.orgName;
            storageData.csId = storageData.csId == null ? "null" : String(storageData.csId);
            storageData.modelId = this.$form.record.model ? String(this.$form.record.model) : "null";
            this.dataStr = JSON.stringify(storageData);
            storage.setItem(name, this.dataStr, 0.5);
            ajax({
                url: '/gmvcs/uom/device/workstation/list',
                method: 'post',
                data: data
            }).then(result => {
                this.loading = false;
                if (result.code !== 0) {
                    sbzygl.showTips('error', result.msg);
                    this.list = [];
                    this.total = 0;
                    this.isNull = true;
                    sbzygl.initDragList(listHeaderName);
                    return;
                } else if (!result.data.total) {
                    this.list = [];
                    this.total = 0;
                    this.isNull = true;
                    sbzygl.initDragList(listHeaderName);
                    return;
                }
                avalon.each(result.data.wss, function (index, el) {
                    el.checked = false;
                    if (el.isOnline === 1) {
                        el.isOnlineName = '在线';
                    } else {
                        el.isOnlineName = '离线';
                    }
                });
                this.list = result.data.wss;
                this.total = result.data.total;
                this.isNull = false;
                sbzygl.initList();
                sbzygl.initDragList(listHeaderName);
            }).fail(() => {
                this.loading = false;
                this.list = [];
                this.total = 0;
                this.isNull = true;
                sbzygl.initDragList(listHeaderName);
            });;
        },
        fetchManuModelOptions() {
            this.hasFetchManu = true;
            let url = '/gmvcs/uom/device/workstation/deviceworkstation/cascade/unfiltered';
            sbzygl.ajax(url, 'post', {}).then((result) => {
                if (result.code != 0) {
                    sbzygl.showTips('error', result.msg);
                    this.manufacturerOptions.clear();
                    this.modelOptions.clear();
                    this.manufacturerOk = true;
                    this.modelOk = true;
                    return;
                }
                let {
                    manufacturer,
                    workstationCode
                } = result.data;
                //厂商
                sbzygl.handleRemoteManu(manufacturer, (manuHasNullOptions, manuOptions) => {
                    this.manufacturerOptions = manuHasNullOptions;
                    dialogRegisterVm.manufacturerOptions = manuOptions;
                    dialogRegisterVm.defaultManufacturer = manuOptions.length > 0 ? manuOptions[0].value : "";
                    this.manufacturerOk = true;
                });
            }).fail(() => {
                this.manufacturerOk = true;
                this.modelOk = true;
            });
        },
        fetchManuToModel() {
            let manufacturer = String(this.$form.record.manufacturer);
            let url = '/gmvcs/uom/device/workstation/deviceworkstation/cascade/unfiltered';
            let data = null;
            if (!manufacturer || manufacturer == "null") {
                data = {};
            } else {
                data = {
                    "manufacturer": Number(manufacturer)
                }
            }
            sbzygl.ajax(url, 'post', data).then((result) => {
                if (result.code != 0) {
                    sbzygl.showTips('error', result.msg);
                    this.modelOptions.clear();
                    this.isFirstFetch = false;
                    this.modelOk = true;
                    return;
                }
                let {
                    workstationCode
                } = result.data;
                //型号
                sbzygl.handleRemoteModel(workstationCode, (modelHasNullOptions, modelOptions) => {
                    this.modelOptions.clear();
                    this.modelOptions = modelHasNullOptions;
                    this.modelOk = true;
                });
                this.isFirstFetch = false;
            });
        }
    }
});

//注册弹窗vm定义
const dialogRegisterVm = avalon.define({
    $id: 'cjgzzgl-register-vm',
    show: false,
    orgData: [],
    orgId: "",
    orgPath: "",
    orgCode: "",
    orgName: "",
    manufacturerOptions: [],
    modelOptions: [],
    defaultManufacturer: "",
    defaultModel: "",
    $form: createForm(),
    telReg: /(^\d[\d-]{6,18}$|^\s{0}$)/,
    // allotReg: /(^[a-zA-Z0-9\u4e00-\u9fa5]+[(（][a-zA-Z0-9\u4e00-\u9fa5]+[)）]$|^\s{0}$)/,
    allotReg: /(^[a-zA-Z0-9\u4e00-\u9fa5\)）\(（]+$|^\s{0}$)/,
    ipReg: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
    expireDaysReg: /^[1-9]{1}[0-9]{0,8}$/,
    mustAndSpecialReg: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/,
    specialReg: /(^[a-zA-Z0-9\u4e00-\u9fa5]+$|^\s{0}$)/,
    lengthReg: /^\s{0}/,
    gbCodeReg: /^[a-zA-Z0-9]{20}$/,
    clear: false,
    inputJson: {
        "gbCode": "",
        "wsName": "",
        "ip": "",
        "addr": "",
        "phone": "",
        "admin": "",
        "expireDays": 180
    },
    validJson: {
        "gbCode": true,
        "gbCodeUnique": true,
        "wsName": true,
        "modelnum": true,
        "ip": true,
        "ipUnique": true,
        "addr": true,
        "phone": true,
        "admin": true,
        "expireDays": true,
        "manufacturer": true
    },
    showJson: {
        "ip": false,
        "admin": false,
        "phone": false,
        "expireDays": false,
        "gbCode": false
    },
    handleFocus(name, event) {
        sbzygl.handleFocus(event, name, this);
        if (name == "gbCode") {
            this.validJson.gbCodeUnique = true;
        }
        if (name == "ip") {
            this.validJson.ipUnique = true;
        }
    },
    handleFormat(name, reg, event) {
        sbzygl.handleFormat(event, name, this, reg);
    },
    handleClear(name, event) {
        sbzygl.handleClear(event, name, this);
    },
    getSelected(key, title) {
        this.orgId = key;
    },
    handleTreeChange(e) {
        this.orgPath = e.node.path;
        this.orgCode = e.node.code;
        this.orgName = e.node.title;
        createGbcode(this.orgCode)
    },
    extraExpandHandle(treeId, treeNode, selectedKey) {
        sbzygl.fetchOrgWhenExpand(treeId, treeNode, selectedKey);
    },
    handleManuChange() {
        this.validJson.manufacturer = true;
        this.fetchManuToModel();
    },
    handleModelChange() {
        this.validJson.modelnum = true;
    },
    handleCancel(e) {
        this.show = false;
        this.clear = !this.clear;
    },
    handleOk() {
        let url = '/gmvcs/uom/device/workstation/add';
        registerOrModify(url, this, '注册成功');
    },
    fetchManuToModel() {
        if (!this.$form.record.manufacturer) {
            return;
        }
        let url = '/gmvcs/uom/device/workstation/deviceworkstation/cascade';
        let data = {
            "manufacturer": Number(this.$form.record.manufacturer)
        }
        sbzygl.ajax(url, 'post', data).then((result) => {
            if (result.code != 0) {
                sbzygl.showTips('error', result.msg);
                this.modelOptions.clear();
                return;
            }
            let {
                workstationCode
            } = result.data;
            //型号
            sbzygl.handleRemoteModel(workstationCode, (modelHasNullOptions, modelOptions) => {
                this.modelOptions.clear();
                this.modelOptions = modelOptions;
                this.defaultModel = modelOptions.length > 0 ? modelOptions[0].value : "";
            });
        });
    },
});
dialogRegisterVm.$watch('clear', (v) => {
    dialogRegisterVm.inputJson = {
        "gbCode": "",
        "wsName": "",
        "ip": "",
        "addr": "",
        "phone": "",
        "admin": "",
        "expireDays": 180
    }
    dialogRegisterVm.validJson = {
        "gbCode": true,
        "gbCodeUnique": true,
        "wsName": true,
        "modelnum": true,
        "ip": true,
        "ipUnique": true,
        "addr": true,
        "phone": true,
        "admin": true,
        "expireDays": true,
        "manufacturer": true
    }
    dialogRegisterVm.showJson = {
        "ip": false,
        "phone": false,
        "admin": false,
        "expireDays": false,
        "gbCode": false
    }
    dialogRegisterVm.defaultManufacturer = "";
    dialogRegisterVm.defaultModel = "";
})

//策略配置弹窗vm定义
const dialogPloySettingVm = avalon.define({
    $id: 'cjgzzgl-ploysetting-vm',
    show: false,
    workStationId: "",
    $form: createForm(),
    defaultDays: 180,
    daysValid: true,
    showTip: false,
    handleFormat(event) {
        let reg = /^[1-9]{1}[0-9]{0,8}$/;
        if (this.defaultDays === "" || !reg.test(this.defaultDays)) {
            this.daysValid = false;
        } else {
            this.daysValid = true;
        }
        this.showTip = false;
        $(event.target).siblings('.fa-close').hide();
    },
    handleFocus(event) {
        this.showTip = true;
        this.daysValid = true;
        $(event.target).siblings('.fa-close').show();
    },
    handleClear(event) {
        this.defaultDays = "";
        $(event.target).siblings('input').focus();
    },
    handleCancel(e) {
        this.show = false;
        this.daysValid = true;
    },
    handleOk() {
        let reg = /^[1-9]{1}[0-9]{0,8}$/;
        let url = '/gmvcs/uom/device/workstation/policy/configuration/modify';
        let data = {};
        data.days = this.defaultDays;
        data.wsId = this.workStationId;
        if (this.defaultDays == "" || !reg.test(this.defaultDays)) {
            this.daysValid = false;
            return;
        }
        sbzygl.ajax(url, 'post', data).then(result => {
            if (result.code !== 0) {
                sbzygl.showTips('error', result.msg);
                return;
            }
            this.show = false;
            vm.fetchList();
            sbzygl.showTips('success', '策略配置修改成功');
        });
    }
});

//安全配置弹窗vm定义
const dialogSafeSettingVm = avalon.define({
    $id: 'cjgzzgl-safesetting-vm',
    show: false,
    workStationId: "",
    $form: createForm(),
    isDeviceAllchecked: false, //设备策略全选
    isDeviceAllcheckedSign: true, //用来标志是否可以全选
    isDeviceSomeChecked: false, //有选设备策略但不是全选
    whiteValid: true,
    deviceOptions: [{
            label: '蓝牙设备',
            value: 'bluetooth'
        },
        {
            label: '光驱设备',
            value: 'cdDriver'
        },
        {
            label: '调制解调器',
            value: 'modem'
        },
        {
            label: 'USB存储设备',
            value: 'usb'
        },
        {
            label: 'USB键盘',
            value: 'keyboard'
        },
    ],
    deviceCheck: {
        'bluetooth': false,
        'cdDriver': false,
        'modem': false,
        'usb': false,
        'keyboard': false,
    },
    isExportAllchecked: false, //导出策略全选
    isExportAllcheckedSign: true, //用来标志是否可以全选
    isExportSomeChecked: false, //有选导出策略但不是全选
    exportOptions: [{
            label: '允许普通U盘导出',
            value: 'nUSBExport'
        },
        {
            label: '允许公安U盘导出',
            value: 'sUSBExport'
        },
    ],
    exportCheck: {
        'nUSBExport': false,
        'sUSBExport': false
    },
    netCheck: "false",
    modeAuto: "false",
    whiteListValue: '',
    $computed: {
        boolNetCheck: function () {
            return this.netCheck == "true" ? true : false;
        },
        boolModeAuto: function () {
            return this.modeAuto == "true" ? true : false;
        },
        deviceAllStatus: function () {
            return this.isDeviceAllchecked || this.isDeviceSomeChecked;
        },
        exportAllStatus: function () {
            return this.isExportAllchecked || this.isExportSomeChecked;
        }
    },
    handleAllDeviceSelect(e) {
        if (this.isDeviceSomeChecked) {
            this.isDeviceAllchecked = false;
            this.isDeviceSomeChecked = false;
            this.isDeviceAllcheckedSign = true;
            this.deviceOptions.map((item, index) => {
                this.deviceCheck[item.value] = false;
            })
        } else {
            if (this.isDeviceAllcheckedSign) {
                this.isDeviceAllchecked = true;
                this.isDeviceAllcheckedSign = false;
                this.deviceOptions.map((item, index) => {
                    this.deviceCheck[item.value] = true;
                })
            } else {
                this.isDeviceAllchecked = false;
                this.isDeviceAllcheckedSign = true;
                this.deviceOptions.map((item, index) => {
                    this.deviceCheck[item.value] = false;
                })
            }
        }
    },
    handleDeviceCheck(e) {
        let total = this.deviceOptions.length;
        let curNum = 0;
        avalon.each(this.deviceCheck, (k, v) => {
            if (v) {
                curNum++;
            }
        })
        if (curNum > 0 && curNum !== total) {
            this.isDeviceSomeChecked = true;
            this.isDeviceAllchecked = false;
            this.isDeviceAllcheckedSign = true;
        } else if (curNum === total) {
            this.isDeviceAllchecked = true;
            this.isDeviceAllcheckedSign = false;
            this.isDeviceSomeChecked = false;
        } else {
            this.isDeviceSomeChecked = false;
            this.isDeviceAllcheckedSign = true;
            this.isDeviceAllchecked = false;
        }
    },
    handleAllExportSelect(e) {
        if (this.isExportSomeChecked) {
            this.isExportAllchecked = false;
            this.isExportSomeChecked = false;
            this.isExportAllcheckedSign = true;
            this.exportOptions.map((item, index) => {
                this.exportCheck[item.value] = false;
            })
        } else {
            if (this.isExportAllcheckedSign) {
                this.isExportAllchecked = true;
                this.isExportAllcheckedSign = false;
                this.exportOptions.map((item, index) => {
                    this.exportCheck[item.value] = true;
                })
            } else {
                this.isExportAllchecked = false;
                this.isExportAllcheckedSign = true;
                this.exportOptions.map((item, index) => {
                    this.exportCheck[item.value] = false;
                })
            }
        }
    },
    handleExportCheck(e) {
        let total = this.exportOptions.length;
        let curNum = 0;
        avalon.each(this.exportCheck, (k, v) => {
            if (v) {
                curNum++;
            }
        })

        if (curNum > 0 && curNum !== total) {
            this.isExportSomeChecked = true;
            this.isExportAllchecked = false;
            this.isExportAllcheckedSign = true;
        } else if (curNum === total) {
            this.isExportAllchecked = true;
            this.isExportAllcheckedSign = false;
            this.isExportSomeChecked = false;
        } else {
            this.isExportSomeChecked = false;
            this.isExportAllcheckedSign = true;
            this.isExportAllchecked = false;
        }
    },
    handleFormat(event) {
        // let reg = /(^[a-zA-Z0-9\u4e00-\u9fa5;；]+$|^\s{0}$)/;
        let reg = /^\s{0}/;
        let whiteListValue = $.trim(this.whiteListValue);
        if (!reg.test(whiteListValue) || whiteListValue.length > 15) {
            this.whiteValid = false;
        } else {
            this.whiteValid = true;
        }
        $(event.target).siblings('.fa-close').hide();
    },
    handleFocus(event) {
        this.whiteValid = true;
        $(event.target).siblings('.fa-close').show();
    },
    handleClear(event) {
        this.whiteListValue = "";
        $(event.target).siblings('input').focus();
    },
    handleCancel(e) {
        this.whiteValid = true;
        this.show = false;
    },
    handleOk() {
        if (!this.whiteValid) {
            return;
        }
        let formData = this.$form.record;
        let url = '/gmvcs/uom/device/workstation/security/configuration/modify';
        let deviceCheck = this.deviceCheck;
        let exportCheck = this.exportCheck;
        let netCheck = this.netCheck == "true" ? true : false;
        let modeAuto = this.modeAuto == "true" ? true : false;
        let wsId = this.workStationId;
        let data = {
            "deviceControlPolicy": {
                "bluetooth": deviceCheck.bluetooth,
                "cdDriver": deviceCheck.cdDriver,
                "keyboard": deviceCheck.keyboard,
                "modem": deviceCheck.modem,
                "usb": deviceCheck.usb
            },
            "exportPolicy": {
                "nUSBExport": exportCheck.nUSBExport,
                "sUSBExport": exportCheck.sUSBExport
            },
            "netControlPolicy": {
                "enable": netCheck
            },
            "dsjRegisterPolicy": {
                "enable": modeAuto
            },
            "whiteList": $.trim(this.whiteListValue),
            "wsId": wsId
        }
        sbzygl.ajax(url, 'post', data).then(result => {
            if (result.code !== 0) {
                sbzygl.showTips('error', result.msg);
                return;
            }
            this.show = false;
            sbzygl.showTips('success', '安全配置修改成功');
        })
    }
});

//升级弹窗vm定义
const dialogUpdateVm = avalon.define({
    $id: 'cjgzzgl-update-vm',
    show: false,
    $form: createForm(),
    updateData: [],
    order: 'insertTime',
    dir: -1,
    checkedIndex: -1,
    checkedItem: [],
    $computed: {
        okDisabled: function () {
            return this.checkedIndex < 0 ? true : false;
        },
    },
    handleCheckChange(index, el, event) {
        el.checked = el.id;
        this.checkedIndex = index;
        this.checkedItem = el;
    },
    handleLook(el) {
        dialogLookVm.show = true;
        dialogLookVm.updateContent = el.changeLog.replace(/(\r\n)|(\n)/g, '<br>');
    },
    handleOk(e) {
        sbzygl.handleUpdate(e, 'gbCode', 3, this.checkedItem.id, vm.checkedData, () => {
            dialogAllotTipVm.show = true;
            this.updateData = [];
            this.checkedIndex = -1;
            this.checkedItem = [];
            this.show = false;
        });
    },
    handleCancel(e) {
        this.updateData = [];
        this.checkedIndex = -1;
        this.checkedItem = [];
        this.show = false;
    }
});

//查看弹窗vm定义
const dialogLookVm = avalon.define({
    $id: 'cjgzzgl-look-vm',
    show: false,
    updateContent: "",
    handleOk() {
        this.show = false;
    }
});

//升级下发提示弹窗vm定义
const dialogAllotTipVm = avalon.define({
    $id: 'cjgzzgl-allottip-vm',
    show: false,
    handleOk() {
        this.show = false;
    }
});

//修改弹窗vm定义
const dialogModifyVm = avalon.define({
    $id: 'cjgzzgl-modify-vm',
    show: false,
    orgData: [],
    orgId: "",
    orgPath: "",
    orgName: "",
    $form: createForm(),
    selectedRowsData: [],
    telReg: /(^\d[\d-]{6,18}$|^\s{0}$)/,
    // allotReg: /(^[a-zA-Z0-9\u4e00-\u9fa5]+[(（][a-zA-Z0-9\u4e00-\u9fa5]+[)）]$|^\s{0}$)/,
    allotReg: /(^[a-zA-Z0-9\u4e00-\u9fa5\)）\(（]+$|^\s{0}$)/,
    ipReg: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
    expireDaysReg: /^[1-9]{1}[0-9]{0,8}$/,
    mustAndSpecialReg: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/,
    specialReg: /(^[a-zA-Z0-9\u4e00-\u9fa5]+$|^\s{0}$)/,
    lengthReg: /^\s{0}/,
    clear: false,
    inputJson: {
        "gbCode": "",
        "wsName": "",
        "modelnum": "",
        "ip": "",
        "wsAddr": "",
        "phoneNumber": "",
        "admin": "",
        "expireDays": 180,
        "storageName": "",
        "storageId": "",
        "manufacturer": "",
        "manufacturerName": "",
        "statusCode": ""
    },
    validJson: {
        "gbCode": true,
        "wsName": true,
        "modelnum": true,
        "ip": true,
        "ipUnique": true,
        "wsAddr": true,
        "phoneNumber": true,
        "admin": true,
        "expireDays": true,
        "manufacturer": true
    },
    showJson: {
        "ip": false,
        "phoneNumber": false,
        "admin": false,
        "expireDays": false
    },
    getSelected(key, title) {
        this.orgId = key;
    },
    handleTreeChange(e) {
        this.orgPath = e.node.path;
        this.orgName = e.node.title;
    },
    extraExpandHandle(treeId, treeNode, selectedKey) {
        sbzygl.fetchOrgWhenExpand(treeId, treeNode, selectedKey);
    },
    handleFocus(name, event) {
        sbzygl.handleFocus(event, name, this);
        if (name == "ip") {
            this.validJson.ipUnique = true;
        }
    },
    handleFormat(name, reg, event) {
        sbzygl.handleFormat(event, name, this, reg);
    },
    handleClear(name, event) {
        sbzygl.handleClear(event, name, this);
    },
    handleCancel(e) {
        this.show = false;
        this.clear = !this.clear;
    },
    handleOk() {
        let url = '/gmvcs/uom/device/workstation/modify';
        registerOrModify(url, this, '修改成功', {
            wsId: this.selectedRowsData[0].wsId
        });
    }
});
dialogModifyVm.$watch('clear', (v) => {
    dialogModifyVm.inputJson = {
        "gbCode": "",
        "wsName": "",
        "modelnum": "",
        "ip": "",
        "wsAddr": "",
        "phoneNumber": "",
        "admin": "",
        "expireDays": 180,
        "storageName": "",
        "storageId": "",
        "manufacturer": "",
        "manufacturerName": "",
        "statusCode": ""
    }
    dialogModifyVm.validJson = {
        "gbCode": true,
        "wsName": true,
        "modelnum": true,
        "ip": true,
        "ipUnique": true,
        "wsAddr": true,
        "phoneNumber": true,
        "admin": true,
        "expireDays": true,
        "manufacturer": true
    }
    dialogModifyVm.showJson = {
        "ip": false,
        "phoneNumber": false,
        "admin": false,
        "expireDays": false
    }
    //直接设成[]，下拉框选了之后会一直保持选择的值
    dialogModifyVm.selectedRowsData = [''];
})


//删除弹窗vm定义
const dialogDelVm = avalon.define({
    $id: 'cjgzzgl-delete-vm',
    show: false,
    workStations: "",
    selectedRowsLength: 1,
    isBatch: false,
    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        let url = '/gmvcs/uom/device/workstation/delete/' + this.workStations;
        sbzygl.ajax(url).then(result => {
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
        })
    }
});

function createGbcode(orgCode) {
    if (orgCode.length < 8) {
        sbzygl.showTips('warning', '部门编号不足8位，不能自动生成国标编号');
        return;
    }
    let url = '/gmvcs/uom/device/workstation/gbcode?orgCode=' + orgCode;
    sbzygl.ajax(url, 'post', null).then(result => {
        if (result.code !== 0) {
            sbzygl.showTips('error', result.msg);
            return;
        } else if (!result.data) {
            sbzygl.showTips('error', '后台服务器生成国标编号发生错误');
            return;
        }
        dialogRegisterVm.inputJson.gbCode = result.data;
        dialogRegisterVm.validJson.gbCode = true;
    });
}

/**
 * 发送注册或修改请求
 * @param {string} url 注册或修改的请求地址
 * @param {vm} dialogVm 注册或修改弹窗的vm
 * @param {string} successMsg 请求成功后的提示消息
 */
function registerOrModify(url, dialogVm, successMsg, otherData) {
    let record = JSON.parse(JSON.stringify(dialogVm.$form.record))
    let inputJson = sbzygl.trimData(dialogVm.inputJson);
    let pass = true;
    //这么写是为了兼容ie8
    let param = {
        "gbCode": inputJson.gbCode,
        "wsName": inputJson.wsName,
        "modelnum": dialogVm == dialogRegisterVm ? (record.modelnum ? $('#cjgzzgl-modal-register .model-item .ane-select-selected').text() : "") : inputJson.modelnum,
        "ip": inputJson.ip,
        "admin": inputJson.admin,
        "expireDays": inputJson.expireDays,
        "orgId": dialogVm.orgId,
        "orgPath": dialogVm.orgPath,
        "manufacturer": dialogVm == dialogRegisterVm ? record.manufacturer : inputJson.manufacturer,
        "statusType": dialogVm == dialogRegisterVm ? 1 : Number(inputJson.statusCode),
    }
    if (dialogVm == dialogModifyVm) {
        param.storageId = inputJson.storageId;
        param.wsAddr = inputJson.wsAddr;
        param.phoneNumber = inputJson.phoneNumber;
    } else {
        param.addr = inputJson.addr;
        param.phone = inputJson.phone;
    }
    avalon.each(record, function (key, value) {
        if (Array.isArray(value)) {
            param[key] = value[0];
        }
    });
    if (otherData) {
        avalon.each(otherData, function (key, value) {
            param[key] = value;
        });
    }
    //------------表单验证开始----------------------------------------------------------
    avalon.each(dialogVm.validJson, (key, value) => {
        if (((key == 'gbCode' || key == 'wsName' || key == 'ip' || key == 'manufacturer' || key == "addr" || key == "wsAddr" || key == "expireDays" || key == "modelnum") && !param[key]) || !value) {
            dialogVm.validJson[key] = false;
            pass = false;
        }
    });
    if (!pass) {
        return;
    }
    sbzygl.ajax(url, 'post', param).then(result => {
        if (result.code == 1036) {
            dialogVm.validJson.wsName = false;
            sbzygl.showTips('error', '该设备名称已存在，请重新输入');
            return;
        } else if (result.code == 1037) {
            dialogVm.validJson.ipUnique = false;
            sbzygl.showTips('error', '该设备IP已存在，请重新输入');
            return;
        } else if (result.code == 1704) {
            dialogVm.validJson.gbCodeUnique = false;
            sbzygl.showTips('error', '该国标编号已存在，请重新生成/输入');
            return;
        } else if (result.code !== 0) {
            sbzygl.showTips('error', result.msg);
            return;
        }
        dialogVm.show = false;
        sbzygl.showTips('success', successMsg);
        dialogVm.clear = !dialogVm.clear;
        if (dialogVm == dialogRegisterVm) {
            vm.current = 1;
        }
        vm.fetchList();
    })
}