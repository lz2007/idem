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
import {
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language,
    cjgzzgl_language = language_txt.xtywgl.cjgzzgl;
const storage = require('../../services/storageService.js').ret;
export const name = 'xtywgl-cjgzz-index-cjgzzgl';
require('../common/common-tyywglpt.css');
require('../common/common-sbzygl.css');
require('./xtywgl-cjgzz-index-cjgzzgl.less');
let vm = null,
    sbzygl = null,
    enableQuery = true,
    queryTimer = null;
const listHeaderName = name + "-list-header";
//页面组件
avalon.component(name, {
    template: __inline('./xtywgl-cjgzz-index-cjgzzgl.html'),
    defaults: {
        cjgzzgl_language: language_txt.xtywgl.cjgzzgl, //多语言
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

        included_status: true, //true 包含子部门；false 不包含子部门
        clickBranchBack(e) {
            this.included_status = e;
        },

        onInit(event) {
            vm = event.vmodel;
            sbzygl = new Sbzygl(vm);

            let _this = this;
            // console.log('menu', menuServer.menu);
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function(index, el) {
                    if (/^UOM_FUNCTION_SBZYGL_CJGZZGL_CJZSBGL_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                // console.log(list);
                if (func_list.length == 0)
                    return;
                avalon.each(func_list, function(k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_SBZYGL_CJGZZGL_CJZSBGL_AQPZ":
                            _this.authority.AQPZ = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_CJGZZGL_CJZSBGL_CLPZ":
                            _this.authority.CLPZ = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_CJGZZGL_CJZSBGL_DELETE":
                            _this.authority.DELETE = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_CJGZZGL_CJZSBGL_MODIFY":
                            _this.authority.MODIFY = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_CJGZZGL_CJZSBGL_REGISTRY":
                            _this.authority.REGISTRY = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_CJGZZGL_CJZSBGL_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_CJGZZGL_CJZSBGL_UPGRADE":
                            _this.authority.UPDATE = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_CJGZZGL_CJZSBGL_BATCHDELETE":
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
            if (this.dataJson) {
                this.included_status = this.dataJson.includeChild;
            }
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
            return manufacturerOptions.length > 0 ? (dataJson ? dataJson.manufacturer : manufacturerOptions[0].value) : '';
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
                sbzygl.showTips('warn', cjgzzgl_language.thisDataIsFromACascadingPlatformAndCannotBeModified);
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
                // "manufacturer": String(record.manufacturer) == "null" ? '' : String(record.manufacturer),
                "manufacturer": String(record.manufacturerName) == "null" ? '' : String(record.manufacturerName),
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
                sbzygl.showTips('warn', cjgzzgl_language.thisDataIsFromACascadingPlatformAndCannotBeDeleted);
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
                dialogRegisterVm.inputJson.manufacturer = dialogRegisterVm.manufacturerOptions.length > 0 ? dialogRegisterVm.manufacturerOptions[0].label : "";
            } else {
                dialogRegisterVm.defaultManufacturer = String(record.manufacturer);
                dialogRegisterVm.inputJson.manufacturer = dialogRegisterVm.defaultManufacturer;
            }

            dialogRegisterVm.fetchMenuToModel();
            // dialogRegisterVm.show = true;
            // createGbcode(dialogRegisterVm.orgCode);
        },
        //策略配置按钮
        handlePloySetting() {
            if (this.selectedRowsLength !== 1) {
                return;
            }
            if (!vm.checkedIsSource) {
                sbzygl.showTips('warn', cjgzzgl_language.thisDataIsFromACascadingPlatformAndCannotBeConfiguredForPolicy);
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
                sbzygl.showTips('warn', cjgzzgl_language.thisDataIsFromACascadingPlatformAndCannotBeConfiguredForSecurity);
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
                avalon.each(data.deviceControlPolicy, function(key, value) {
                    dialogSafeSettingVm.deviceCheck[key] = value;
                    if (value) {
                        deviceNum++;
                    }
                });
                avalon.each(data.exportPolicy, function(key, value) {
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
                // updateData = [{"id":"GM0000000020190524162541ff7ffffff","version":"2","name":"sokit-1.3-win32-chs.zip","type":0,"changeLog":"2","downloadUrl":"http://192.168.55.83:6224/gmvcs/uom/package/unauthorized/rest/download/updatePackage?file=sokit-1.3-win32-chs.zip&type=0","extend":"","insertTime":1558686341000,"isDelete":0,"size":3987677,"checkSum":"525FE035F143287447CB1048452EE45A","manufacturerName":"国迈","manufacturer":0,"model":"0","updateType":0}];
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
                sbzygl.showTips('warn', cjgzzgl_language.containsDataFromCascadingPlatformsThatCannotBeDeletedInBatches);
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
                manufacturer: typeof (this.$form.record.manufacturer) == 'object' ? '' : this.$form.record.manufacturer,
                moduleNum: this.modelName == "" ? null : this.modelName,
                includeChild: this.included_status,
                page: this.current - 1,
                pageSize: this.pageSize
            };
            data.manufacturer = (data.manufacturer == "null" || !data.manufacturer) ? null : data.manufacturer;
            this.checkAll = false;
            this.selectedRowsLength = 0;
            let storageData = JSON.parse(JSON.stringify(data));
            storageData.orgCode = this.orgCode;
            storageData.orgName = this.orgName;
            storageData.manufacturer = storageData.manufacturer == null ? "null" : storageData.manufacturer;
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
                avalon.each(result.data.wss, function(index, el) {
                    el.checked = false;
                    if (el.isOnline === 1) {
                        el.isOnlineName = cjgzzgl_language.online;
                    } else {
                        el.isOnlineName = cjgzzgl_language.offline;
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
            // this.hasFetchManu = true;
            // let url = `/gmvcs/uom/device/workstation/manufacturer/module/get?manufacturer=0`;

            // sbzygl.ajax(url).then((result) => {
            //     if (result.code != 0) {
            //         sbzygl.showTips('error', result.msg);
            //         this.modelOptions.clear();
            //         this.isFirstFetch = false;
            //         this.modelOk = true;
            //         return;
            //     }
            //     let {
            //         workstationCode
            //     } = result.data;
            //     //型号
            //     sbzygl.handleRemoteModel(workstationCode, (modelHasNullOptions, modelOptions) => {
            //         this.modelOptions.clear();
            //         this.modelOptions = modelHasNullOptions;
            //         this.modelOk = true;
            //     });
            //     this.isFirstFetch = false;
            // });

            this.hasFetchManu = true;
            let url = '/gmvcs/uom/device/workstation/manufacturer/module/get';
            sbzygl.ajax(url).then((result) => {
                if (result.code != 0) {
                    sbzygl.showTips('error', result.msg);
                    this.manufacturerOptions.clear();
                    this.modelOptions.clear();
                    this.manufacturerOk = true;
                    this.modelOk = true;
                    return;
                }
                let manufacturer = [];

                result.data.manufacturer.forEach(ele => {
                    let obj = {
                        key: ele,
                        value: ele
                    }
                    manufacturer.push(obj);
                });
                
                if (!manufacturer.length) {
                    this.modelOk = true;
                }
                //厂商
                sbzygl.handleRemoteManu(manufacturer, (manuHasNullOptions, manuOptions) => {
                    this.manufacturerOptions = manuHasNullOptions;
                    dialogRegisterVm.manufacturerOptions = manuOptions;
                    dialogRegisterVm.defaultManufacturer = manuOptions.length > 0 ? manuOptions[0].value : "";
                    dialogRegisterVm.inputJson.manufacturer = manuOptions.length > 0 ? manuOptions[0].value : "";
                    this.manufacturerOk = true;
                });

            }).fail(() => {
                this.manufacturerOk = true;
                this.modelOk = true;
            });
        },
        fetchManuToModel() {
            // let manufacturer = String(this.$form.record.manufacturer);
            // let url = '/gmvcs/uom/device/workstation/deviceworkstation/cascade/unfiltered';
            // let data = null;
            // if (!manufacturer || manufacturer == "null") {
            //     data = {};
            // } else {
            //     data = {
            //         "manufacturer": Number(manufacturer)
            //     }
            // }
            // sbzygl.ajax(url, 'post', data).then((result) => {
            //     if (result.code != 0) {
            //         sbzygl.showTips('error', result.msg);
            //         this.modelOptions.clear();
            //         this.isFirstFetch = false;
            //         this.modelOk = true;
            //         return;
            //     }
            //     let {
            //         workstationCode
            //     } = result.data;
            //     //型号
            //     sbzygl.handleRemoteModel(workstationCode, (modelHasNullOptions, modelOptions) => {
            //         this.modelOptions.clear();
            //         this.modelOptions = modelHasNullOptions;
            //         this.modelOk = true;
            //     });
            //     this.isFirstFetch = false;
            // });
            let manufacturer = String(this.$form.record.manufacturer);
            
            if (!manufacturer || manufacturer == "null") {
                manufacturer = '';
            }

            let url = `/gmvcs/uom/device/workstation/manufacturer/module/get?manufacturer=${manufacturer}`;

            sbzygl.ajax(url).then((result) => {
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
    adminReg: /^[a-zA-Z0-9\u4e00-\u9fa5()（）]*$/,//验证维护人正则
    allotReg: /(^[a-zA-Z0-9\u4e00-\u9fa5\)）\(（]+$|^\s{0}$)/,
    ipReg: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
    expireDaysReg: /^[1-9]{1}[0-9]{0,8}$/,
    mustAndSpecialReg: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/,
    specialReg: /(^[a-zA-Z0-9\u4e00-\u9fa5]+$|^\s{0}$)/,
    lengthReg: /^\s{0}/,
    gbCodeReg: /^[a-zA-Z0-9]{20}$/, //长度为20，允许的字符为字母与数字
    clear: false,
    inputJson: {
        "gbCode": "",
        "wsName": "",
        "ip": "",
        "addr": "",
        "phone": "",
        "admin": "",
        "expireDays": 365,
        "manufacturer": "",
        "model": "",
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
    getSearchLabel(label, owner) {
        //厂商或型号的输入有变化时
        // if (label == null) return;
        // this.inputJson.model = label;
        // this.$form.record.model = label;
        if (label == null) return;
        if (owner === "manufacturer") {
            this.inputJson.manufacturer = label;
        } else {
            this.inputJson.model = label;
        }
    },
    getSearchSelected(label, value, owner) {
        if (value == null) return;
        if (owner === "manufacturer") {
            this.inputJson.manufacturer = label;
            this.fetchMenuToModel();
        }
    },
    handleSearchSelectFocus(event, owner) {
        // sbzygl.handleFocus(event, 'model', this);
        if (owner === "manufacturer") {
            sbzygl.handleFocus(event, 'manufacturer', this);
        } else {
            sbzygl.handleFocus(event, 'model', this);
        }
    },
    handleSearchSelectFormat(event, owner) {
        // sbzygl.handleFormat(event, 'model', this, this.modelReg, null);
        if (owner === "manufacturer") {
            sbzygl.handleFormat(event, 'manufacturer', this, this.manuReg, 32);
        } else {
            sbzygl.handleFormat(event, 'model', this, this.modelReg, 32);
        }
    },
    txt_register: language_txt.xtywgl.cjgzzgl.register,
    save: language_txt.xtywgl.cjgzzgl.save,
    cancel: language_txt.xtywgl.cjgzzgl.cancel,
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
        this.fetchMenuToModel();
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
        registerOrModify(url, this, cjgzzgl_language.addSuccessfully);
    },
    fetchMenuToModel() {
        // if (!this.$form.record.manufacturer) {
        //     return;
        // }
        // let url = `/gmvcs/uom/device/workstation/manufacturer/module/get?manufacturer=0`;

        // if (!this.inputJson.manufacturer) {
        //     return;
        // }

        let url = `/gmvcs/uom/device/workstation/manufacturer/module/get?manufacturer=${this.inputJson.manufacturer}`;
  
        sbzygl.ajax(url).then((result) => {
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
                this.inputJson.model = modelOptions.length > 0 ? modelOptions[0].label : "";
            });
            createGbcode(dialogRegisterVm.orgCode);
            dialogRegisterVm.show = true;
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
        "expireDays": 365,
        "inputJson":""
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
    defaultDays: 365,
    daysValid: true,
    showTip: false,
    txt_policySetting: language_txt.xtywgl.cjgzzgl.policySetting,
    save: language_txt.xtywgl.cjgzzgl.save,
    cancel: language_txt.xtywgl.cjgzzgl.cancel,
    handleFormat(event) {
        let reg = /^[1-9]{1}[0-9]{0,8}$/;
        if (this.defaultDays === "" || !reg.test(this.defaultDays)) {
            this.daysValid = false;
        } else {
            this.daysValid = true;
        }
        this.showTip = false;
        $(event.target).siblings('.input-close-ywzx').hide();
    },
    handleFocus(event) {
        this.showTip = true;
        this.daysValid = true;
        $(event.target).siblings('.input-close-ywzx').show();
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
            sbzygl.showTips('success', cjgzzgl_language.thePolicyConfigurationChangedSuccessfully);
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
    txt_securitySetting: language_txt.xtywgl.cjgzzgl.securitySetting,
    save: language_txt.xtywgl.cjgzzgl.save,
    cancel: language_txt.xtywgl.cjgzzgl.cancel,
    deviceOptions: [{
            label: language_txt.xtywgl.cjgzzgl.bluetoothDevice,
            value: 'bluetooth'
        },
        {
            label: language_txt.xtywgl.cjgzzgl.opticalDiskDrive,
            value: 'cdDriver'
        },
        {
            label: language_txt.xtywgl.cjgzzgl.modem,
            value: 'modem'
        },
        {
            label: language_txt.xtywgl.cjgzzgl.usbStorageDevice,
            value: 'usb'
        },
        {
            label: language_txt.xtywgl.cjgzzgl.usbKeyboard,
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
            label: language_txt.xtywgl.cjgzzgl.allowNormalFlashDiskExport,
            value: 'nUSBExport'
        },
        // {
        //     label: language_txt.xtywgl.cjgzzgl.allowPoliceFlashDiskExport,
        //     value: 'sUSBExport'
        // },
    ],
    exportCheck: {
        'nUSBExport': false,
        'sUSBExport': false
    },
    netCheck: "false",
    modeAuto: "false",
    whiteListValue: '',
    $computed: {
        boolNetCheck: function() {
            return this.netCheck == "true" ? true : false;
        },
        boolModeAuto: function() {
            return this.modeAuto == "true" ? true : false;
        },
        deviceAllStatus: function() {
            return this.isDeviceAllchecked || this.isDeviceSomeChecked;
        },
        exportAllStatus: function() {
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
        $(event.target).siblings('.input-close-ywzx').hide();
    },
    handleFocus(event) {
        this.whiteValid = true;
        $(event.target).siblings('.input-close-ywzx').show();
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
            sbzygl.showTips('success', cjgzzgl_language.theSecurityConfigurationChangedSuccessfully);
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
        okDisabled: function() {
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
    adminReg: /^[a-zA-Z0-9\u4e00-\u9fa5()（）]*$/, //验证维护人正则
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
        "expireDays": 365,
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
    txt_modify: language_txt.xtywgl.cjgzzgl.modify,
    save: language_txt.xtywgl.cjgzzgl.save,
    cancel: language_txt.xtywgl.cjgzzgl.cancel,
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
        registerOrModify(url, this, cjgzzgl_language.modifySuccessfully, {
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
        "expireDays": 365,
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
    txt_delete: language_txt.xtywgl.cjgzzgl.delete,
    save: language_txt.xtywgl.cjgzzgl.save,
    cancel: language_txt.xtywgl.cjgzzgl.cancel,
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
            sbzygl.showTips('success', cjgzzgl_language.deleteSuccessfully);
            if ((rowsLength == vm.selectedRowsLength || rowsLength == 1) && vm.current > 1) {
                vm.current = vm.current - 1;
            }
            vm.fetchList();
        })
    }
});

function createGbcode(orgCode) {
    if (orgCode.length < 8) {
        sbzygl.showTips('warning', cjgzzgl_language.becauseTheDepartmentNumberIsLessThan8DigitsTheCommunicationCodeCannotBeAutomaticallyGenerated);
        return;
    }
    let url = '/gmvcs/uom/device/workstation/gbcode?orgCode=' + orgCode;
    sbzygl.ajax(url, 'post', null).then(result => {
        if (result.code !== 0) {
            sbzygl.showTips('error', result.msg);
            return;
        } else if (!result.data) {
            sbzygl.showTips('error', cjgzzgl_language.anErrorOccurredWhenTheBackgroundServerGeneratedTheGBNumber);
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
        "modelnum": dialogVm == dialogRegisterVm ? inputJson.model : inputJson.modelnum,
        "ip": inputJson.ip,
        "admin": inputJson.admin,
        // "admin": 'GXX', //默认传高新兴 GXX
        "expireDays": inputJson.expireDays,
        "orgId": dialogVm.orgId,
        "orgPath": dialogVm.orgPath,
        "manufacturer": dialogVm == dialogRegisterVm ? inputJson.manufacturer : inputJson.manufacturer,
        // "manufacturer": 0,
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
    avalon.each(record, function(key, value) {
        if (Array.isArray(value)) {
            param[key] = value[0];
        }
    });
    if (otherData) {
        avalon.each(otherData, function(key, value) {
            param[key] = value;
        });
    }
    //------------表单验证开始----------------------------------------------------------
    avalon.each(dialogVm.validJson, (key, value) => {
        // if (((key == 'ip' || key == 'manufacturer' || key == "expireDays" || key == "modelnum") && !param[key]) || !value) {
        if (((key == 'ip' || key == "expireDays" || key == "modelnum" || key == "wsName" || key == "addr") && !param[key]) || !value) {
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
            sbzygl.showTips('error', cjgzzgl_language.theDeviceNameAlreadyExistsPleaseReenterIt);
            return;
        } else if (result.code == 1037) {
            dialogVm.validJson.ipUnique = false;
            sbzygl.showTips('error', cjgzzgl_language.theDeviceIPAlreadyExistsPleaseReenterIt);
            return;
        } else if (result.code == 1704) {
            dialogVm.validJson.gbCodeUnique = false;
            sbzygl.showTips('error', cjgzzgl_language.theCommunicationCodeAlreadyExistsPleaseReenterIt);
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
        vm.fetchManuModelOptions();
    })
}