/**
 * 统一运维管理平台--设备资源管理--执法仪管理
 *caojiacong
 */
import avalon from 'avalon2';
import ajax from '../../services/ajaxService';
import Sbzygl from '../common/common-sbzygl';
import moment from 'moment';
import {
    createForm
} from 'ane';
import * as menuServer from '../../services/menuService';
import {
    apiUrl,
    languageSelect
} from '../../services/configService';
import * as deviceApi from '../common/common-gb28181-tyywglpt-device-api';
let language_txt = require('../../vendor/language').language,
    zfjlygl_language = language_txt.xtywgl.zfjlygl;
const storage = require('../../services/storageService.js').ret;
//plupload中文帮助文档：http://www.phpin.net/tools/plupload/
const plupload = require('../../vendor/plupload/plupload.full.min.js');
export const name = 'xtywgl-sbzygl-zfygl';
require('../common/common-tyywglpt.css');
require('../common/common-sbzygl.css');
require('./xtywgl-sbzygl-zfygl.less');
let vm = null,
    sbzygl = null,
    enableQuery = true,
    queryTimer = null,
    allotTimer = null,
    uploader = null,
    compStatusOptions = [];
let debounceFetchAllot = null; //去抖的查询配发对象函数
const listHeaderName = name + "-list-header";
const deviceType = "DSJ4GGB";
//页面组件
avalon.component(name, {
    template: __inline('./xtywgl-sbzygl-index-zfygl.html'),
    defaults: {
        zfjlygl_language: language_txt.xtywgl.zfjlygl, //多语言
        extra_class: languageSelect == "en" ? true : false,
        $form: createForm(),
        loading: true,
        isNull: false,
        list: [],
        total: 0,
        current: 1,
        pageSize: 20,
        selectedRowsLength: 0,
        checkedIs4G: false, //勾选的是否全为4g执法仪
        checkedIsSource: false, //勾选的是否全为来自级联平台设备
        checkedIsSameModel: false, //勾选的是否全为相同的型号
        selectedIsOnline: false, //勾选的该项是否在线
        selectedIsBindUser: false, //勾选的该项是否绑定了警员
        checkedData: [],
        isDuration: false,
        timeMode: 1,
        userName: "",
        beginTime: moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD'),
        // endTime: moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD'),
        endTime: moment().format('YYYY-MM-DD'),
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
        modelName: "", //选择的型号的label，选择不限时为null（这样做是因为型号返回的是数组，不是字典表）
        typeOk: false, //设备类型
        statusOk: false, //设备状态
        manufacturerOk: false, //设备厂商
        modelOk: false, //设备型号
        queryDefaultType: "", //搜索栏中设备类型的默认值
        isFirstFetch: true, //是否为第一次获取搜索栏中的型号
        isManuSelectMode: false, //是否为厂商改变导致的类型/型号获取
        isManuOrTypeSelectMode: false, //是否为厂商/类型改变导致的型号获取
        hasFetchManu: false, //是否已经获取厂商字典
        enableCreate: false, //是否可以生成国标编号
        dataStr: "",
        dataJson: {},
        titleTimer: "", //popover用的的定时器，代码在common-sbzygl.js
        uploadInit: false,
        needFlash: false,
        downloadTipShow: false,
        needFetchRegisterAllot: false, //是否需要获取注册弹框中的配发对象列表
        needFetchModifyAllot: false, //是否需要获取修改弹框中的配发对象列表
        authority: { // 按钮权限标识
            "DELETE": false, //设备资源管理_执法仪管理_删除
            "MODIFY": false, //设备资源管理_执法仪管理_修改
            "REGISTRY": false, //设备资源管理_执法仪管理_注册
            "SEARCH": false, //设备资源管理_执法仪管理_查询
            "BATCHREGISTRY": true, // 批量注册(要设为true，不然plupload插件初始化不了)
            "UPGRADE": false, // 升级
            "CJZDXSJ": false, // 采集站定向升级
            "YCPZGX": false, // 远程配置更新
            "YCXF": false, // 远程下发
            "CJZDXSJ": false, // 采集站定向升级
            "BATCHDELETE": false, // 批量删除
            "OPT_SHOW": false //操作栏 - 显隐
        },
        isBtnChangeTime: false, //是否用按钮去改变datapicker的值
        onInit(event) {
            vm = event.vmodel;
            sbzygl = new Sbzygl(vm);
            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function(index, el) {
                    if (/^UOM_FUNCTION_SBZYGL_ZFJLYGL_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                if (func_list.length == 0)
                    return;

                avalon.each(func_list, function(k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_SBZYGL_ZFJLYGL_ZFJLYGL_DELETE": //删除
                            _this.authority.DELETE = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_ZFJLYGL_ZFJLYGL_MODIFY": //修改
                            _this.authority.MODIFY = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_ZFJLYGL_ZFJLYGL_REGISTRY": //注册
                            _this.authority.REGISTRY = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_ZFJLYGL_ZFJLYGL_SEARCH": //查询
                            _this.authority.SEARCH = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_ZFJLYGL_ZFJLYGL_BATCHREGISTRY": //批量注册
                            _this.authority.BATCHREGISTRY = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_ZFJLYGL_UPGRADE":
                            _this.authority.UPGRADE = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_ZFJLYGL_CJZDXSJ":
                            _this.authority.CJZDXSJ = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_ZFJLYGL_YCPZGX":
                            _this.authority.YCPZGX = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_ZFJLYGL_YCXF":
                            _this.authority.YCXF = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_ZFJLYGL_ZFJLYGL_BATCHDELETE": //批量删除
                            _this.authority.BATCHDELETE = true;
                            break;
                    }
                });
                //批量注册的权限判断
                if (func_list.indexOf('UOM_FUNCTION_SBZYGL_ZFJLYGL_BATCHREGISTRY') === -1) {
                    _this.authority.BATCHREGISTRY = false;
                }
                if (false == _this.authority.MODIFY && false == _this.authority.DELETE)
                    _this.authority.OPT_SHOW = true;
                sbzygl.autoSetListPanelTop();
            });
            sbzygl.autoSetListPanelTop();
            //去抖的查询配发对象函数
            debounceFetchAllot = sbzygl.debounce(function(dialogVm) {
                fetchAllot(dialogVm, null, true);
            }, 1000);
            this.$watch('dataJson', (v) => {
                if (v) {
                    this.beginTime = v.beginTime ? moment(v.beginTime).format('YYYY-MM-DD') : moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD');
                    this.endTime = v.endTime ? moment(v.endTime).format('YYYY-MM-DD') : moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD');
                    this.timeMode = v.timeMode;
                    this.modelName = v.model;
                    this.isDuration = v.timeMode === 3;
                    this.current = v.page + 1;
                    this.userName = v.userName || "";
                }
            })
        },
        onReady() {
            this.dataStr = storage.getItem(name);
            this.dataJson = this.dataStr ? JSON.parse(this.dataStr) : null;
            // console.log(this.dataJson);
            if(this.dataJson) {
                if(moment(this.dataJson.beginTime).format('YYYY-MM-DD') == moment().isoWeekday(1).format('YYYY-MM-DD') && moment(this.dataJson.endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                    // console.log('week');
                    $(".thisMonth").removeClass('active');
                    $(".thisWeek").addClass('active');
                } else if(moment(this.dataJson.beginTime).format('YYYY-MM-DD') == moment().dates(1).format('YYYY-MM-DD') && moment(this.dataJson.endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                    // console.log('month');
                    $(".thisWeek").removeClass('active');
                    $(".thisMonth").addClass('active');
                }

                this.included_status = this.dataJson.searchSubOrg;
            }
            
            //表头宽度设置
            sbzygl.setListHeader(listHeaderName);
            this.fetchStatusOptions();
            this.fetchOrgData(() => {
                let timer = setInterval(() => {
                    //保证查询条件到位后再fetchList
                    let recordStr = JSON.stringify(this.$form.record);
                    let length = recordStr.match(/:/g) ? recordStr.match(/:/g).length : 0;
                    //等到this.$form.record不为{}，而有具体内容时再fetchManuOptions，否则ie8下有问题
                    if (!this.hasFetchManu) {
                        length && this.fetchManuOptions();
                    }
                    if (vm.typeOk && vm.statusOk && vm.manufacturerOk && vm.modelOk && length >= 4) {
                        vm.fetchList();
                        clearInterval(timer);
                        dialogRegisterVm.orgData = dialogModifyVm.orgData = dialogDirectVm.orgData = this.orgData;
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
                    Init: function(up) {
                        vm.uploadInit = true;
                    },
                    FilesAdded: function(up, files) {
                        let file = files[0];
                        //清除队列
                        for (let i = 0; i < uploader.files.length - 1; i++) {
                            uploader.removeFile(uploader.files[i]);
                        }
                        up.start();
                    },
                    FileUploaded: function(up, file, response) {
                        let result = JSON.parse(response.response);
                        if (result) {
                            if (result.code == 0) {
                                sbzygl.showTips('success', zfjlygl_language.bulkRegistrationSuccessfully);
                                vm.fetchList();
                            } else {
                                sbzygl.showTips('error', result.msg);
                            }
                        } else {
                            console.warn(response)
                        }

                    },
                    Error: function(up, err) {
                        let code = err.code;
                        if (code === -500) {
                            vm.needFlash = true;
                        } else if (code === -601) {
                            sbzygl.showTips('warn', zfjlygl_language.onlyXLSOrXLSXTableFilesCanBeUploaded);
                        } else if (code === -600) {
                            sbzygl.showTips('warn', zfjlygl_language.theUploadedFileSizeCannotExceed1M);
                        } else {
                            sbzygl.showTips('error', zfjlygl_language.batchRegistrationFailed);
                        }
                    }
                }
            });
            uploader.init();
            // 获取平台信息
            getLocalPlatformInfo();
        },
        onDispose() {
            clearTimeout(queryTimer);
            clearTimeout(allotTimer);
            clearTimeout(this.titleTimer);
            enableQuery = true;
            uploader = null;
            compStatusOptions = [];
            $('div.popover').remove();
        },
        getDefaultManu(manufacturerOptions, dataJson) {
            return manufacturerOptions.length > 0 ? (dataJson ? dataJson.manufacturerId : manufacturerOptions[0].value) : '';
        },
        getDefaultModel(modelOptions, isManuOrTypeSelectMode, dataJson) {
            return modelOptions.length > 0 ? (isManuOrTypeSelectMode ? modelOptions[0].value : (dataJson ? dataJson.modelId : modelOptions[0].value)) : '';
        },
        getDefaultStatus(statusOptions, dataJson) {
            return statusOptions.length > 0 ? (dataJson ? dataJson.status : statusOptions[0].value) : '';
        },
        updateIsDisabled(checkedIsSameModel, selectedRowsLength, checkedIs4G) {
            return (!checkedIsSameModel || selectedRowsLength < 1 || !checkedIs4G) ? 'disabled' : '';
        },
        remoteUpdateIsDisabled(selectedIsOnline, selectedRowsLength) {
            return (!selectedIsOnline || selectedRowsLength !== 1) ? 'disabled' : '';
        },
        remoteAllotIsDisabled(selectedIsOnline, selectedRowsLength, selectedIsBindUser) {
            return (!selectedIsOnline || selectedRowsLength !== 1 || !selectedIsBindUser) ? 'disabled' : '';
        },
        getShowStatus(show) {
            this.downloadTipShow = show;
        },
        showDownLoadTip() {
            if (this.needFlash) {
                this.downloadTipShow = true;
            }
        },
        handlePress(event) {
            let keyCode = event.keyCode || event.which;
            if (this.authority.SEARCH && keyCode == 13) {
                this.query();
            } else if (keyCode === 32 && event.target.selectionStart === 0) {
                return false;
            }
        },
        handleFocus(event) {
            $(event.target).siblings('.input-close-ywzx-user').show();
        },
        handleBlur(event) {
            event.target.value = $.trim(event.target.value);
            $(event.target).siblings('.input-close-ywzx-user').hide();
        },
        handleClear(name, event) {
            this[name] = '';
            $(event.target).siblings('input').focus()
        },
        //修改按钮
        handleModify(record) {
            if (record.source) {
                sbzygl.showTips('warn', zfjlygl_language.thisDataIsFromACascadingPlatformAndCannotBeModified);
                return;
            }
            $(".no-data").text(' '); //去除部门下拉框的"No Department"
            record.status = String(record.status);
            dialogModifyVm.selectedRowsData = [record];
            dialogModifyVm.inputJson = {
                "gbcode": record.gbcode || "",
                "imei": record.imei || "",
                "model": record.model || "",
                "sim": record.sim || "",
                "ip": record.ip || "",
                "id": record.id || "",
                "capacity": record.capacity || "",
                "name": record.name || "",
                "allotKeyword": record.userName || "",
                "orgName": record.orgName || "",
                "userDepartment":record.orgName || "",
                "orgCode": record.orgCode || "",
                "orgId": record.orgId || "",
                "orgPath": record.orgPath || "",
                "username": record.userName || "",
                "usercode": record.userCode || "",
                "userRid": record.userId || "",
                "userOrgRid": "",
                "manufacturer": String(record.manufacturer) == "null" ? '' : String(record.manufacturer),
                "manufacturerName": String(record.manufactruerName || ''),
                "type": String(record.type) == "null" ? '' : String(record.type),
                "typeName": String(record.typeName || ''),
            }
            dialogModifyVm.isDump = record.status === "4"; //当设备处于注销状态时设为不能修改
            dialogModifyVm.isAbnormal = record.status !== "1"; //当设备处于非正常状态时隐藏配发信息
            //该执法仪已配发了人员，就设为该人员的部门id，否则设为设备所属部门Id
            dialogModifyVm.allotOrgId = record.orgId;
            dialogModifyVm.allotOrgName = record.orgName;
            dialogModifyVm.lastOrgId = record.orgId;
            dialogModifyVm.lastOrgName = record.orgName;
            dialogModifyVm.orgCode = record.orgCode;
            dialogModifyVm.orgId = record.orgId;
            dialogModifyVm.orgPath = record.orgPath;
            dialogModifyVm.orgName = record.orgName;
            dialogModifyVm.lastAllotKeyword = record.userName;
            dialogModifyVm.lastUserId = record.userId;
            dialogModifyVm.allotOptions.clear();
            // modelOptions
            // 修改设备型号
            deviceApi.getModel('', deviceType).then((result) => {
                if (result.code != 0) {
                    dialogModifyVm.modelOptions.clear();
                    return;
                }

                let dsjCode = [];
                result.data.forEach((item, index) => {
                    let data = {
                        key: item,
                        value: item
                    }
                    dsjCode.push(data)
                });

                //型号
                sbzygl.handleRemoteType(dsjCode, (modelHasNullOptions, modelOptions) => {
                    dialogModifyVm.modelOptions.clear();
                    dialogModifyVm.modelOptions = modelOptions;
                });
            });
            // ajax({
            //     url: '/gmvcs/uom/device/dsj/device/dsj/type/cascade',
            //     method: 'post',
            //     data: {}
            // }).then(ret => {
            //     if (ret.code == 0) {
            //         ret.data.dsjCode = ret.data.dsjCode.map(dsjCode => ({
            //             label: dsjCode,
            //             value: dsjCode
            //         }));
            //         dialogModifyVm.modelOptions = ret.data.dsjCode ? ret.data.dsjCode : [];
            //     } else {
            //         dialogModifyVm.modelOptions = []
            //     }
            // });

            fetchAllotByOrgId(dialogModifyVm, dialogModifyVm.lastUserId);
            if (record.status === "1") { //正常状态下，不能进行注销操作，所以移除注销这个可选项
                dialogModifyVm.statusOptions = removeOption(compStatusOptions, "4");
            } else if (record.status === "2") { //维修状态下，不能进行停用操作，所以移除停用这个可选项
                dialogModifyVm.statusOptions = removeOption(compStatusOptions, "3");
            } else {
                dialogModifyVm.statusOptions = compStatusOptions;
            }
            this.needFetchModifyAllot = true;
            dialogModifyVm.show = true;
        },
        //删除按钮
        handleDelete(record) {
            if (record.source) {
                sbzygl.showTips('warn', zfjlygl_language.thisDataIsFromACascadingPlatformAndCannotBeDeleted);
                return;
            }
            dialogDelVm.isBatch = false;
            dialogDelVm.deviceRidArr = [record.gbcode];
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
            this.fetchManuToTypeModel();
            if (!this.isFirstFetch) {
                this.isManuSelectMode = true;
                this.isManuOrTypeSelectMode = true;
            }
        },
        handleTypeChange(e) {
            this.fetchTypeToModel();
            //当厂商为不限时，改变类型不影响型号
            if (!this.isFirstFetch && String(this.$form.record.manufacturer) != "null") {
                this.isManuOrTypeSelectMode = true;
            }
        },
        handleModelChange(e) {
            let value = e.target.value;
            if (!value || value == "-") {
                this.modelName = null;
            } else {
                let index = Number(value);
                if (this.modelOptions.length > index + 1) {
                    // this.modelName = this.modelOptions[index + 1].label;
                    //因为加了All选项所以要这么做
                    this.modelName = this.modelOptions[index + 1].label;
                }
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
        handleRegistermodel() {
            let adress = encodeURIComponent("/static/BWC_Import_Model.xlsx")
                // let adress = encodeURIComponent("/static/执法记录仪批量导入模板.xlsx")

            window.location.href = adress
        },
        handleRegister() {
            if (this.selectedRowsLength !== 0)
                return;
            $(".no-data").text(' '); //去除部门下拉框的"No Department"
            let record = this.$form.record;
            dialogRegisterVm.orgId = this.orgId;
            dialogRegisterVm.allotOrgId = this.orgId;
            dialogRegisterVm.allotOrgName = this.orgName;
            dialogRegisterVm.orgCode = this.orgCode;
            dialogRegisterVm.orgPath = this.orgPath;
            dialogRegisterVm.orgName = this.orgName;
            dialogRegisterVm.defaultType = this.deviceType || "3"; //因为页面没有了设备类型，所以传默认值是4gBWC,其key值是"3"
            //联动搜索栏选择的厂商
            if (String(record.manufacturer) == "null" || !record.manufacturer) {
                dialogRegisterVm.defaultManufacturer = dialogRegisterVm.manufacturerOptions.length > 0 ? dialogRegisterVm.manufacturerOptions[0].value : "";
            } else {
                dialogRegisterVm.defaultManufacturer = String(record.manufacturer);
            }
            dialogRegisterVm.fetchManuToTypeModel(dialogRegisterVm.defaultManufacturer);
            dialogRegisterVm.allotOptions.clear();
            this.enableCreate = true;
            this.needFetchRegisterAllot = true;
            createGbcode(dialogRegisterVm.orgCode, deviceType);
            fetchAllotByOrgId(dialogRegisterVm);
            dialogRegisterVm.show = true;
        },
        //升级按钮
        handleUpdate() {
            if (!this.checkedIs4G || !this.checkedIsSameModel || this.selectedRowsLength < 1)
                return;
            sbzygl.fetchUpdateList(1, this.checkedData, (updateData) => {
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
        //采集站定向升级按钮
        handleUpdateDirect() {
            let record = this.$form.record;
            dialogDirectVm.orgId = this.orgId;
            dialogDirectVm.orgCode = this.orgCode;
            dialogDirectVm.orgPath = this.orgPath;
            dialogDirectVm.orgName = this.orgName;
            dialogDirectVm.defaultManufacturer = "";
            //联动搜索栏选择的厂商
            if (record.manufacturer == "null" || !record.manufacturer) {
                dialogDirectVm.defaultManufacturer = dialogDirectVm.manufacturerOptions.length > 0 ? dialogDirectVm.manufacturerOptions[0].value : "";
            } else {
                dialogDirectVm.defaultManufacturer = record.manufacturer;
            }
            dialogDirectVm.show = true;
            dialogDirectVm.fetchWsList();
        },
        //远程配置更新按钮
        handleRemoteUpdate() {
            if (this.selectedRowsLength !== 1 || !this.selectedIsOnline) {
                return;
            }
            let selectedData = this.checkedData[0];
            dialogRemoteUpdateVm.inputJson.deviceId = selectedData.gbcode;
            dialogRemoteUpdateVm.inputJson.deviceName = selectedData.name;
            dialogRemoteUpdateVm.show = true;
        },
        //远程下发按钮
        handleRemoteAllot() {
            if (this.selectedRowsLength !== 1 || !this.selectedIsOnline || !this.selectedIsBindUser) {
                return;
            }
            let selectedData = this.checkedData[0];
            let param = {
                "gbcode": selectedData.gbcode,
                "orgCode": selectedData.userOrgCode,
                "userCode": selectedData.usercode,
            }
            let url = '/gmvcs/uom/device/dsj/control/userBind';
            sbzygl.ajax(url, 'post', param).then(result => {
                if (result.code !== 0) {
                    sbzygl.showTips('error', result.msg);
                    return;
                }
                sbzygl.showTips('success', zfjlygl_language.remoteIssueSucceeded);
            });
        },
        //批量删除
        handleBatchDelete() {
            if (this.selectedRowsLength < 1) {
                return;
            }
            if (!vm.checkedIsSource) {
                sbzygl.showTips('warn', zfjlygl_language.containsDataFromCascadingPlatformsThatCannotBeDeletedInBatches);
                return;
            }
            dialogDelVm.isBatch = true;
            dialogDelVm.deviceRidArr = [];
            avalon.each(this.checkedData, (index, el) => {
                dialogDelVm.deviceRidArr.push(el.gbcode);
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
                //4g执法仪集合
                let checked4g = list.filter((item) => {
                    return item.type == 3;
                });
                //本平台执法仪集合
                let checkedSource = list.filter((item) => {
                    return !item.source;
                });
                if (checked4g.length > 0 && checked4g.length === checkedDataLength) {
                    this.checkedIs4G = true;
                } else {
                    this.checkedIs4G = false;
                }
                if (checkedSource.length > 0 && checkedSource.length === checkedDataLength) {
                    this.checkedIsSource = true;
                } else {
                    this.checkedIsSource = false;
                }
                if (checkedDataLength > 0 && this.checkedData[0].online) {
                    this.selectedIsOnline = true;
                } else {
                    this.selectedIsOnline = false;
                }
                if (checkedDataLength > 0 && this.checkedData[0].usercode) {
                    this.selectedIsBindUser = true;
                } else {
                    this.selectedIsBindUser = false;
                }
                dialogDelVm.selectedRowsLength = checkedSource.length;
                if (this.checkedIs4G) {
                    let baseModel = "";
                    let i;
                    for (i = 0; i < checked4g.length; i++) {
                        if (i === 0) {
                            baseModel = checked4g[0].model;
                        }
                        if (baseModel !== checked4g[i].model) {
                            this.checkedIsSameModel = false;
                            break;
                        }
                    }
                    if (i >= checked4g.length) {
                        this.checkedIsSameModel = true;
                    }
                } else {
                    this.checkedIsSameModel = false;
                }
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
                //4g执法仪集合
                let checked4g = hasChecked.filter((item) => {
                    return item.type == 3;
                });
                //本平台执法仪集合
                let checkedSource = hasChecked.filter((item) => {
                    return !item.source;
                });
                if (checked4g.length > 0 && checked4g.length === checkedDataLength) {
                    this.checkedIs4G = true;
                } else {
                    this.checkedIs4G = false;
                }
                if (checkedSource.length > 0 && checkedSource.length === checkedDataLength) {
                    this.checkedIsSource = true;
                } else {
                    this.checkedIsSource = false;
                }
                if (checkedDataLength && this.checkedData[0].online) {
                    this.selectedIsOnline = true;
                } else {
                    this.selectedIsOnline = false;
                }
                if (checkedDataLength && this.checkedData[0].usercode) {
                    this.selectedIsBindUser = true;
                } else {
                    this.selectedIsBindUser = false;
                }
                dialogDelVm.selectedRowsLength = checkedSource.length;
                if (this.checkedIs4G) {
                    let baseModel = "";
                    let i;
                    for (i = 0; i < checked4g.length; i++) {
                        if (i === 0) {
                            baseModel = checked4g[0].model;
                        }
                        if (baseModel !== checked4g[i].model) {
                            this.checkedIsSameModel = false;
                            break;
                        }
                    }
                    if (i >= checked4g.length) {
                        this.checkedIsSameModel = true;
                    }
                } else {
                    this.checkedIsSameModel = false;
                }
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
            let url = '/gmvcs/uom/device/dsj/statusType';
            sbzygl.handleRemoteSelect(url, 'descript', 'id', 'status', '执法仪状态', (options, shiftOptions) => {
                vm.statusOptions = options;
                compStatusOptions = shiftOptions;
                dialogModifyVm.statusOptions = shiftOptions;
                vm.statusOk = true;
            }, () => {
                vm.statusOk = true;
            });
        },

        included_status: true, //true 包含子部门；false 不包含子部门
        clickBranchBack(e) {
            this.included_status = e;
        },

        //获取执法仪信息列表
        fetchList() {
            $('div.popover').remove();
            let data = {
                type: String(this.$form.record.type),
                userName: this.userName,
                manufacturerId: String(this.$form.record.manufacturer),
                model: this.$form.record.model,
                status: String(this.$form.record.status),
                beginTime: this.$form.record.beginTime,
                endTime: this.$form.record.endTime,
            };
            this.isDuration = true;
            let url = '/gmvcs/uom/device/dsj/list?vPage=' + (this.current - 1) + '&vPageSize=' + this.pageSize;
            data.beginTime = this.isDuration ? (data.beginTime ? moment(data.beginTime).format('X') * 1000 : null) : (this.beginTime ? moment(this.beginTime).format('X') * 1000 : null);
            data.endTime = this.isDuration ? (data.endTime ? moment(data.endTime).add(1, 'days').subtract(1, 'seconds').format('X') * 1000 : null) : (this.endTime ? moment(this.endTime).add(1, 'days').subtract(1, 'seconds').format('X') * 1000 : null);
            if (!data.beginTime && !data.endTime) {
                sbzygl.showTips('warning', zfjlygl_language.pleaseSelectTheStartTimeAndEndTime);
                return;
            }
            if (!data.beginTime && data.endTime) {
                sbzygl.showTips('warning', zfjlygl_language.pleaseSelectTheStartTime);
                return;
            }
            if (data.beginTime && !data.endTime) {
                sbzygl.showTips('warning', zfjlygl_language.pleaseSelectTheEndTime);
                return;
            }
            if (data.beginTime && data.endTime && data.beginTime >= data.endTime) {
                sbzygl.showTips('warning', zfjlygl_language.startTimeCannotBeGreaterThanEndTime);
                return;
            }
            if ($.trim(data.userName) !== "" && !sbzygl.nameReg2.test(data.userName)) {
                sbzygl.showTips('warning', zfjlygl_language.pleaseEnterTheCorrectPoliceOfficerNameOrNumber);
                return;
            }
            this.loading = true;
            data.status = data.status ? Number(data.status) : null;
            data.type = (data.type == null || !data.type) ? null : Number(data.type);
            data.manufacturerId = (data.manufacturerId == null || !data.manufacturerId) ? null : Number(data.manufacturerId);
            data.orgCode = this.orgCode || null;
            data.orgId = this.orgId || null;
            data.path = this.orgPath || null;
            data.userName = $.trim(data.userName) || null;
            data.userType = 1; //标识是车还是人
            data.searchSubOrg = this.included_status;
            this.checkAll = false;
            this.selectedRowsLength = 0;
            let storageData = JSON.parse(JSON.stringify(data));
            storageData.timeMode = this.timeMode;
            storageData.page = this.current - 1;
            storageData.orgName = this.orgName;
            storageData.manufacturerId = storageData.manufacturerId == null ? null : String(storageData.manufacturerId);
            storageData.type = storageData.type == null ? null : String(storageData.type);
            storageData.status = storageData.status == null ? null : String(storageData.status);
            storageData.modelId = this.$form.record.model ? String(this.$form.record.model) : "";
            this.dataStr = JSON.stringify(storageData);
            storage.setItem(name, this.dataStr, 0.5);

            let newData = {
                "userParam": data.userName,
                "deviceName": '',
                "gbcode": '',
                "sn": '',
                "localDevice": '',
                "manufacturer": '',
                "model": toEmpty(data.model),
                "online": '',
                "orgPath": data.path,
                "page": (this.current - 1),
                "pageSize": this.pageSize,
                "registerTimeBegin": data.beginTime,
                "registerTimeEnd": data.endTime,
                "searchSubOrg": this.included_status,
                "status": 0,
                // "type": [deviceType]
                "type": toEmpty(data.type) == '' ? this.typeAllOptions : [data.type],
                "isStandbyMachine": 2,
            }

            // sbzygl.ajax(url, 'post', data).then(result => {
            deviceApi.searchDevice(newData).then(result => {
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
                    el.allot = el.username == "" ? "" : el.username + '(' + el.usercode + ')';
                    el.battery = (el.battery == "-" || !el.battery) ? "" : el.battery + '%';
                    el.manufactruerName = 'GXX';
                    el.username = el.username == "" ? "-" : el.username;
                    if (el.locationStatus == '无数据') {
                        el.locationStatusName = zfjlygl_language.noData;
                    } else if (el.locationStatus == '导航') {
                        el.locationStatusName = zfjlygl_language.navigation;
                    } else {
                        el.locationStatusName = zfjlygl_language.noNavigation;
                    };

                    if (el.exceptionStatus == '无异常') {
                        el.exceptionStatusName = zfjlygl_language.noAbnormal;
                    } else if (el.exceptionStatus == '未插入SDCard') {
                        el.exceptionStatusName = zfjlygl_language.sDCardNotInserted;
                    } else if (el.exceptionStatus == 'CCD异常') {
                        el.exceptionStatusName = zfjlygl_language.ccdAbnormality;
                    } else if (el.exceptionStatus == '电池被移除') {
                        el.exceptionStatusName = zfjlygl_language.batteryRemoved;
                    } else {
                        el.exceptionStatusName = zfjlygl_language.recordingAbnormal;
                    };

                    if (el.onlineStatus == '在线' || el.online == 1) {
                        el.onlineStatusName = zfjlygl_language.onLine;
                    } else {
                        el.onlineStatusName = zfjlygl_language.offline;
                    };
                    // if (el.online == 1) {
                    //     el.onlineStatusName = zfjlygl_language.onLine;
                    // } else {
                    //     el.onlineStatusName = zfjlygl_language.offline;
                    // };
                    // switch (el.type) {
                    //     case '1':
                    //         el.typeName = 'normal';
                    //         break;
                    //     case '2':
                    //         el.typeName = '2G';
                    //         break;
                    //     case '3':
                    //         el.typeName = '4G';
                    //         break;
                    //     case '-1':
                    //         el.typeName = 'All';
                    //         break;
                    //     default:
                    //         el.typeName = '-'
                    // }
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
                    this.orgPath = this.dataJson ? this.dataJson.path : orgData[0].path;
                    this.orgName = this.dataJson ? this.dataJson.orgName : orgData[0].title;
                }
                avalon.isFunction(callback) && callback();
            });
        },
        typeAllOptions: [],
        //获取厂商列表
        fetchManuOptions() {
            this.fetchManuToTypeModel();
            this.hasFetchManu = true;
            deviceApi.getModel('', deviceType).then((result) => {
                if (result.code != 0) {
                    sbzygl.showTips('error', result.msg);
                    this.modelOptions.clear();
                    this.modelOk = true;
                    this.manufacturerOk = true;
                    this.typeOk = true;
                    this.isFirstFetch = false;
                    return;
                }
                if (!result.data.length) this.fetchManuToTypeModel();
                let dsjCode = [];
                result.data.forEach((item, index) => {
                    let data = {
                        key: item,
                        value: item
                    }
                    dsjCode.push(data)
                });

                //型号
                sbzygl.handleRemoteType(dsjCode, (modelHasNullOptions, modelOptions) => {
                    this.modelOptions.clear();
                    this.modelOptions = modelHasNullOptions;
                    // console.log(modelHasNullOptions);

                    this.modelOk = true;
                    this.manufacturerOk = true;
                    this.typeOk = true;
                });
                this.isFirstFetch = false;
            });
            return;
            let url = '/gmvcs/uom/device/dsj/device/dsj/type/cascade/unfiltered';
            sbzygl.ajax(url, 'post', {}).then((result) => {
                if (result.code != 0) {
                    sbzygl.showTips('error', result.msg);
                    this.manufacturerOptions.clear();
                    this.modelOptions.clear();
                    this.typeOptions.clear();
                    //设置默认设备型号为ALL
                    let modelOptions = [];
                    let allObj = {
                        label: zfjlygl_language.all,
                        value: '-'
                    }
                    modelOptions.push(allObj);
                    this.modelOptions = modelOptions;
                    this.defaultModel = modelOptions[0].value;
                    this.manufacturerOk = true;
                    this.modelOk = true;
                    this.typeOk = true;
                    return;
                }
                let {
                    manufacturer,
                    dsjType,
                    dsjCode
                } = result.data;
                //厂商
                sbzygl.handleRemoteManu(manufacturer, (manuHasNullOptions, manuOptions) => {
                    this.manufacturerOptions = manuHasNullOptions;
                    dialogRegisterVm.manufacturerOptions = dialogDirectVm.manufacturerOptions = manuOptions;
                    dialogRegisterVm.defaultManufacturer = dialogDirectVm.defaultManufacturer = manuOptions.length > 0 ? manuOptions[0].value : "";
                    this.manufacturerOk = true;
                });
                //类型
                sbzygl.handleRemoteType(dsjType, (typeHasNullOptions, typeOptions) => {
                    this.typeOptions = [];
                    this.typeOptions = typeHasNullOptions;
                    this.queryDefaultType = typeHasNullOptions.length ? (this.isManuSelectMode ? typeHasNullOptions[0].value : (this.dataJson ? this.dataJson.type : typeHasNullOptions[0].value)) : "";
                    this.typeOk = true;
                });
                //型号
                sbzygl.handleRemoteModel(dsjCode, (modelHasNullOptions, modelOptions) => {
                    this.modelOptions.clear();
                    //增加All选项
                    let allObj = {
                        label: zfjlygl_language.all,
                        value: '-'
                    }
                    modelOptions.unshift(allObj);
                    this.modelOptions = modelOptions;
                    this.defaultModel = modelOptions[0].value;
                    this.modelOk = true;
                });
            }).fail(() => {
                this.manufacturerOk = true;
                this.modelOk = true;
                this.typeOk = true;
            });
        },
        //根据厂商获取设备类型，设备型号列表
        fetchManuToTypeModel() {
            let manufacturer = String(this.$form.record.manufacturer);
            let allType = false;

            if (!manufacturer || manufacturer == "null") {
                manufacturer = '';
                allType = true;
            } else {
                allType = false;
            }

            // 获取设备类型
            deviceApi.getDeviceDsjType('', true).then(result => {
                if (result.code != 0) {
                    sbzygl.showTips('error', result.msg);
                    this.modelOptions.clear();
                    this.typeOptions.clear();
                    this.isFirstFetch = false;
                    this.typeOk = true;
                    this.modelOk = true;
                    return;
                }

                this.typeAllOptions = result.optionsTpye;

                this.typeOptions = [];
                this.typeOptions = result.hasNullOptions;
                this.queryDefaultType = result.hasNullOptions.length ? result.hasNullOptions[0].value : "";
                this.typeOk = true;

                this.isFirstFetch = false;
            });
            // // 设备型号
            // let type = String(this.$form.record.type);

            // if (!manufacturer || manufacturer == 'null') {
            //     manufacturer = '';
            // }

            // if (!type || type == 'null') {
            //     type = '';
            // }

            // deviceApi.getModel(manufacturer, type).then((result) => {
            //     if (result.code != 0) {
            //         sbzygl.showTips('error', result.msg);
            //         this.modelOptions.clear();
            //         this.typeOptions.clear();
            //         this.isFirstFetch = false;
            //         this.typeOk = true;
            //         this.modelOk = true;
            //         return;
            //     }

            //     let dsjCode = [];
            //     result.data.forEach((item, index) => {
            //         let data = {
            //             key: item,
            //             value: item
            //         }
            //         dsjCode.push(data)
            //     });

            //     sbzygl.handleRemoteType(dsjCode, (typeHasNullOptions, typeOptions) => {
            //         this.modelOptions.clear();
            //         this.modelOptions = typeHasNullOptions;
            //         if (!this.dataStr) {
            //             this.modelOk = true;
            //         }
            //     });

            // });
            // let url = '/gmvcs/uom/device/dsj/device/dsj/type/cascade/unfiltered';
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
            //         this.typeOptions.clear();
            //         this.isFirstFetch = false;
            //         this.typeOk = true;
            //         this.modelOk = true;
            //         return;
            //     }
            //     let {
            //         dsjType,
            //         dsjCode
            //     } = result.data;
            //     //类型
            //     sbzygl.handleRemoteType(dsjType, (typeHasNullOptions, typeOptions) => {
            //         this.typeOptions = [];
            //         this.typeOptions = typeHasNullOptions;
            //         this.queryDefaultType = typeHasNullOptions.length ? (this.isManuSelectMode ? typeHasNullOptions[0].value : (this.dataJson ? this.dataJson.type : typeHasNullOptions[0].value)) : "";
            //         this.typeOk = true;
            //     });
            //     //型号
            //     if (!manufacturer || manufacturer == "null") {
            //         sbzygl.handleRemoteModel(dsjCode, (modelHasNullOptions, modelOptions) => {
            //             this.modelOptions.clear();
            //             this.modelOptions = modelHasNullOptions;
            //             if (!this.dataStr) {
            //                 this.modelOk = true;
            //             }
            //         });
            //     }
            //     this.isFirstFetch = false;
            // });
        },
        //获取设备类型获取设备型号列表
        fetchTypeToModel() {
            let record = this.$form.record;
            let data = null;
            let url = '/gmvcs/uom/device/dsj/device/dsj/type/cascade/unfiltered';
            if (!String(record.manufacturer) || String(record.manufacturer) == "null" || record.manufacturer == undefined) {
                this.modelOk = true;
                return;
            }
            if (!String(record.type) || String(record.type) == "null") {
                data = {
                    "manufacturer": Number(record.manufacturer)
                }
            } else {
                data = {
                    "manufacturer": Number(record.manufacturer),
                    "dsjType": Number(record.type)
                }
            }
            sbzygl.ajax(url, 'post', data).then((result) => {
                if (result.code != 0) {
                    sbzygl.showTips('error', result.msg);
                    this.modelOptions.clear();
                    this.modelOk = true;
                    this.isFirstFetch = false;
                    return;
                }
                let {
                    dsjCode
                } = result.data;
                //型号
                sbzygl.handleRemoteModel(dsjCode, (modelHasNullOptions, modelOptions) => {
                    this.modelOptions.clear();
                    this.modelOptions = modelHasNullOptions;
                    this.modelOk = true;
                });
                this.isFirstFetch = false;
            });
        },
        //采集时间
        chooseDate(time) {
            this.isBtnChangeTime = true;
            //这部分逻辑还需确认
            switch (time) {
                case "week":
                    $(".thisMonth").removeClass('active');
                    $(".thisWeek").addClass('active');
                    this.beginTime = moment().isoWeekday(1).format('YYYY-MM-DD');
                    //这样操作的目的解决ane datepicker组件因前后两次赋值相同而页面显示的label不会改变的bug
                    this.endTime = '';
                    break;
                case "month":
                    $(".thisWeek").removeClass('active');
                    $(".thisMonth").addClass('active');
                    this.beginTime = moment().dates(1).format('YYYY-MM-DD');
                    //这样操作的目的解决ane datepicker组件因前后两次赋值相同而页面显示的label不会改变的bug
                    this.endTime = '';
                    break;
            }
            //默认的值为当天的时间
            this.endTime = moment().format('YYYY-MM-DD');
            this.isBtnChangeTime = false;
        },
        //datepicker的值改变的时候
        datepickerChangeStart(e) {
            //如果是按钮控制时间的改变就返回
            if (this.isBtnChangeTime)
                return;
            this.beginTime = e.target.value;
            $(".thisWeek").removeClass('active');
            $(".thisMonth").removeClass('active');
            if(moment(this.beginTime).format('YYYY-MM-DD') == moment().isoWeekday(1).format('YYYY-MM-DD') && moment(this.endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                // console.log('week');
                $(".thisMonth").removeClass('active');
                $(".thisWeek").addClass('active');
            } else if(moment(this.beginTime).format('YYYY-MM-DD') == moment().dates(1).format('YYYY-MM-DD') && moment(this.endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                // console.log('month');
                $(".thisWeek").removeClass('active');
                $(".thisMonth").addClass('active');
            }
        },
        datepickerChangeEnd(e) {
            //如果是按钮控制时间的改变就返回
            if (this.isBtnChangeTime)
                return;
            this.endTime = e.target.value;
            $(".thisWeek").removeClass('active');
            $(".thisMonth").removeClass('active');
            if(moment(this.beginTime).format('YYYY-MM-DD') == moment().isoWeekday(1).format('YYYY-MM-DD') && moment(this.endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                // console.log('week');
                $(".thisMonth").removeClass('active');
                $(".thisWeek").addClass('active');
            } else if(moment(this.beginTime).format('YYYY-MM-DD') == moment().dates(1).format('YYYY-MM-DD') && moment(this.endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                // console.log('month');
                $(".thisWeek").removeClass('active');
                $(".thisMonth").addClass('active');
            }
        },
        //二维码
        // handleQRcode(record, event, flag) { //这里调二维码接口，传userCode
        //     const self = this;
        //     let target = event.target;
        //     if (target == undefined)
        //         return;
        //     if (target.tagName.toLowerCase() == 'div') {
        //         let userCode = record.usercode;
        //         if (userCode == '-' || userCode == '') {
        //             sbzygl.showTips('error', zfjlygl_language.theUserIsNotBoundToTheDeviceTwoDimensionalCode);
        //             return;
        //         }
        //         self.getQRcode(target, userCode, flag);
        //     }
        // },
        getQRcode(target, userCode, flag) {
            const self = this;
            ajax({
                // url: '/api/getQrCode',
                url: '/gmvcs/uom/device/dsj/qrcode/userbinding?userCode=' + userCode,
                method: 'get',
                data: {}
            }).then(ret => {
                let resultArr = [];
                avalon.each(ret.data, function(index, item) {
                    let obj = {
                        index: index,
                        txt: index + 1,
                        qrcode: "data:image/jpeg;base64," + item.qrcode,
                        name: item.devName,
                        model: item.model,
                        type: item.typeName,
                        number: item.gbcode
                    }
                    resultArr.push(obj);
                });
                if (resultArr.length == 0 || resultArr[0].qrcode == undefined) {
                    sbzygl.showTips('error', zfjlygl_language.theUserIsNotBoundToTheDeviceTwoDimensionalCode);
                    return;
                } else {
                    switch (flag) {
                        case 'create':
                            self.showQRcode(target, resultArr[0].qrcode);
                            break;
                        case 'refresh':
                            self.reloadQRcode(target, resultArr[0].qrcode);
                            break;
                        default:
                            break;
                    }
                }
            });
        },
        showQRcode(target, qrcode) {
            //获取二维码在窗口的位置
            let qrcodeLeft = $(target).offset().left,
                qrcodeTop = $(target).offset().top;
            //获取二维码弹窗的宽高
            let qrcodeWith = $(target).next().width(),
                qrcodeHeight = $(target).next().height();
            //获得二维码小图标的宽度
            let imgQRcodeWidth = $(target).width();
            this.hideAllQRcode(); //隐藏之前显示的二维码
            //$(target).next().children().eq(1).children().eq(0).children().eq(0).attr("src", '/static/image/xtpzgl-yhgl/qrcode.jpg?__sprite'); //设置二维码路径
            $(target).next().children().eq(1).children().eq(0).children().eq(0).attr("src", qrcode); //设置二维码路径
            $(target).next().css({
                "left": qrcodeLeft - qrcodeWith / 2 + imgQRcodeWidth / 2 + 'px',
                "top": qrcodeTop - (qrcodeHeight + 10) + 'px',
            });
            $(target).next().addClass('active'); //显示二维码
        },
        reloadQRcode(target, qrcode) {
            $(target).parent().next().children().eq(0).children().eq(0).attr("src", qrcode);
        },
        closeQRcode(event) {
            let target = event.target;
            if (target == undefined)
                return;
            if (target.tagName.toLowerCase() == 'div') {
                $(target).parent().parent().removeClass('active');
            }
        },
        hideAllQRcode() {
            $(".showQRcode").each(function() {
                $(this).removeClass('active');
            });
        }
    }
})

//注册弹窗vm定义
const dialogRegisterVm = avalon.define({
    $id: 'zfygl-register-vm',
    show: false,
    title: language_txt.xtywgl.zfjlygl.register,
    save: language_txt.xtywgl.zfjlygl.save,
    cancel: language_txt.xtywgl.zfjlygl.cancel,
    $form: createForm(),
    typeOptions: [],
    manufacturerOptions: [],
    modelOptions: [],
    allotOptions: [],
    defaultType: "",
    defaultModel: "",
    deviceType: "",
    defaultManufacturer: "",
    defaultAllot: "",
    findIndex: [],
    orgData: [],
    orgId: "",
    orgCode: "",
    orgPath: "",
    orgName: "",
    allotOrgId: "",
    allotOrgName: "",
    allotQuery: false,
    allotIsNull: true,
    isSelect: false, //判断是否手动（非通过所属部门联动）选择了配发部门
    telReg: /(^\d[\d-]{6,18}$|^\s{0}$)/,
    ipReg: /(^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$|^\s{0}$)/,
    capacityReg: /(^[1-9]{1}[0-9]{0,8}$|^\s{0}$)/,
    allotKeywordReg: /^[a-zA-Z0-9\u4e00-\u9fa5]{0,20}$/,
    mustAndSpecialReg: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/, //禁止特殊字符的必填项
    specialReg: /(^[a-zA-Z0-9\u4e00-\u9fa5]+$|^\s{0}$)/, //禁止特殊字符的非必填项
    lengthReg: /^\s{0}/, //仅限制长度的非必填项
    gbcodeReg: /^[a-zA-Z0-9]{20}$/, //长度为20，允许的字符为字母与数字（国内版）
    //gbcodeReg: /^[0-9]{1,20}$/, //长度为1-20，允许的字符为数字（海外版）
    modelReg: /(^[a-zA-Z0-9\u4e00-\u9fa5-|-|_]{1,32}$|^\s{0}$)/,
    clear: false, //用来促使弹框里的input框清空
    isTriggerGetSelected: false,
    allotLoading: false,
    allotPageQuery: 0,
    allotPageByOrg: 0,
    allotPageTotal: 0,
    allotPageSize: 500,
    pageTimer: '',
    currentOrgId: '', //当前选中的配发对象部门id
    $skipArray: ['isTriggerGetSelected', 'allotPageQuery', 'allotPageByOrg', 'allotPageTotal', 'allotPageSize', 'pageTimer', 'currentOrgId'],
    inputJson: {
        "gbcode": "",
        "imei": "",
        "sim": "",
        "ip": "",
        "capacity": "",
        "name": "",
        "allotKeyword": "", //配发对象查询关键字
        "username": "",
        "usercode": "",
        "userRid": "",
        "orgName": "", //配发对象查询模式下的对象所在部门名称
        "userOrgRid": "", //配发对象查询模式下的对象所在部门ID
        "model": '',
    },
    validJson: {
        "gbcode": true,
        "gbcodeUnique": true,
        "type": true,
        "orgRid": true,
        "model": true,
        "name": true,
        "imei": true,
        "sim": true,
        "ip": true,
        "capacity": true,
        "manufacturer": true,
        "allotKeyword": true
    },
    showJson: {
        "sim": false,
        "ip": false,
        "capacity": false,
        "gbcode": false
    },
    getSearchLabel(label, owner) {
        //厂商或型号的输入有变化时
        if (label == null) return;
        this.inputJson.model = label;
        this.$form.record.model = label;
    },
    handleSearchSelectFocus(event, owner) {
        sbzygl.handleFocus(event, 'model', this);
    },
    handleSearchSelectFormat(event, owner) {
        sbzygl.handleFormat(event, 'model', this, this.modelReg, null);
    },
    //切换配发方式按钮
    handleTabType(event) {
        event.target.blur();
        this.allotQuery = !this.allotQuery;
        this.inputJson.orgName = "";
        this.inputJson.usercode = "";
        this.inputJson.username = "";
        this.inputJson.userRid = "";
        this.inputJson.userOrgRid = "";
        this.allotOptions.clear();
        this.validJson.allotKeyword = true;
        this.currentOrgId = "";
        clearTimeout(allotTimer);
        clearTimeout(dialogRegisterVm.pageTimer);
        if (!this.allotQuery) {
            fetchAllotByOrgId(dialogRegisterVm);
        } else {
            fetchAllot(dialogRegisterVm, null, true)
        }
    },
    //配发对象关键字查询
    handleAllotQuery(event) {
        let keyCode = event.keyCode || event.which;
        if (keyCode === 13) {
            //按下enter键直接发送请求查询配发对象
            // event.target.blur();
            clearTimeout(allotTimer);
            fetchAllot(dialogRegisterVm, null, false);
        } else {
            //使用去抖函数发送请求查询配发对象，避免频繁发送请求
            allotTimer = debounceFetchAllot(dialogRegisterVm);
        }
    },
    //配发对象改变时
    allotChange(label, value) {
        if (this.allotOptions.length <= 0) {
            this.inputJson.orgName = "";
            this.inputJson.usercode = "";
            this.inputJson.username = "";
            this.inputJson.userRid = "";
            this.inputJson.userOrgRid = "";
            this.allotIsNull = true;
            return;
        }
        let index = this.findIndex.indexOf(value);
        if (index >= 0 || value == "null") {
            let targetData = null;
            if (this.allotQuery) {
                targetData = this.allotOptions[index];
            } else {
                targetData = this.allotOptions[index + 1];
            }
            this.inputJson.username = targetData.userName;
            this.inputJson.usercode = targetData.userCode;
            this.inputJson.userRid = targetData.userId;
            this.allotIsNull = Boolean(index === -1);
            if (!this.allotIsNull) {
                this.isSelect = true;
            }
            if (this.allotQuery) {
                //可查询模式下
                this.inputJson.orgName = targetData.orgName;
                this.inputJson.userOrgRid = targetData.orgId;
            }
        }
    },
    //获取配发对象下拉框的Loading状态
    getLoading(loading) {
        this.allotLoading = loading;
    },
    allotQueryBlur(event) {
        clearTimeout(allotTimer);
        $(event.target).siblings('.fa-close').hide();
    },
    handleManuChange(e) {
        this.validJson.manufacturer = true;
        this.fetchManuToTypeModel(this.$form.record.manufacturer);
    },
    handleModelChange(e) {
        this.validJson.model = true;
    },
    handleDeviceTypeChange(e) {
        this.validJson.type = true;
        this.deviceType = e.target.value;
        createGbcode(this.orgCode, deviceType);
        this.fetchTypeToModel();
    },
    getSelected(key, title) {
        this.orgId = key;
    },
    handleTreeChange(e) {
        this.orgCode = e.node.code;
        this.orgPath = e.node.path;
        this.orgName = e.node.title;
        // console.log(this.orgCode,e.node.code);
        //当配发对象未选择时，进行所属部门与配发部门的联动，配发部门只有已存在的节点可以触发getAllotSelected，所以在此处fetchAllotByOrgId
        if (!this.isSelect) {
            this.allotOrgId = this.orgId;
            this.allotOrgName = this.orgName;
            fetchAllotByOrgId(dialogRegisterVm);
        }
        createGbcode(this.orgCode, deviceType);
    },
    extraExpandHandle(treeId, treeNode, selectedKey) {
        sbzygl.fetchOrgWhenExpand(treeId, treeNode, selectedKey);
    },
    getAllotSelected(key, title) {
        if (!vm.needFetchRegisterAllot) {
            return;
        }
        //通过选择配发部门进行配发，此判断是为了避免handleTreeChange中发送了fetchAllotByOrgId后，这里再次发送一遍
        if (this.allotOrgId != key) {
            this.allotOrgId = key;
            this.allotOrgName = title;
            fetchAllotByOrgId(dialogRegisterVm);
            this.isTriggerGetSelected = true;
        } else {
            this.isTriggerGetSelected = false;
        }
    },
    handleAllotTreeChange(e) {
        this.isSelect = true;

        this.orgCode = e.node.code;
        this.orgPath = e.node.path;
        this.orgName = e.node.title;
        // console.log(this.orgCode,e.node.code);
        //当配发对象未选择时，进行所属部门与配发部门的联动，配发部门只有已存在的节点可以触发getAllotSelected，所以在此处fetchAllotByOrgId
        if (!this.isSelect) {
            this.allotOrgId = this.orgId;
            this.allotOrgName = this.orgName;
            fetchAllotByOrgId(dialogRegisterVm);
        }
        createGbcode(this.orgCode, deviceType);

        //isTriggerGetSelected用来判断是由于触发了getAllotSelected导致e.node.key == this.allotOrgId，还是由于选择了当前选中节点
        //当选择当前选中的节点时fetchAllotByOrgId
        if (!this.isTriggerGetSelected && e.node.key == this.allotOrgId) {
            fetchAllotByOrgId(dialogRegisterVm);
        }
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
        if (name === 'allotKeyword') {
            this.inputJson.orgName = "";
            this.inputJson.usercode = "";
            this.inputJson.username = "";
            this.inputJson.userRid = "";
            this.inputJson.userOrgRid = "";
            this.allotIsNull = true;
            this.allotOptions.clear();
        }
    },
    handleCancel(e) {
        this.clear = !this.clear;
        this.show = false;
    },
    handleOk() {
        // let url = '/gmvcs/uom/device/dsj/register';
        let url = '/gmvcs/uom/device/gb28181/v1/device/registerDevice';
        registerOrModify(url, this, zfjlygl_language.registerSuccessfully);
    },
    fetchManuToTypeModel(manufacturer) {
        // 获取设备类型 
        deviceApi.getDeviceDsjType('', true).then(result => {
            if (result.code != 0) {
                sbzygl.showTips('error', result.msg);
                this.modelOptions.clear();
                this.typeOptions.clear();
                return;
            }

            //类型
            this.typeOptions = [];
            this.typeOptions = result.options;
            this.defaultType = result.options.length > 0 ? result.options[0].value : "";

        });

        // 设备型号
        let type = this.$form.record.type;

        if (!type || type == 'null') {
            type = '';
        }
        // console.log('fetchManuToTypeModel' + manufacturer, type)

        deviceApi.getModel('', type).then((result) => {
            if (result.code != 0) {
                sbzygl.showTips('error', result.msg);
                this.modelOptions.clear();
                this.typeOptions.clear();
                return;
            }

            let dsjCode = [];
            result.data.forEach((item, index) => {
                let data = {
                    key: item,
                    value: item
                }
                dsjCode.push(data)
            });

            //型号
            sbzygl.handleRemoteType(dsjCode, (typeHasNullOptions, typeOptions) => {
                this.modelOptions.clear();
                this.modelOptions = typeOptions;
                this.defaultModel = typeOptions.length > 0 ? typeOptions[0].value : "";
                this.inputJson.model = typeOptions.length > 0 ? typeOptions[0].value : "";
            });
        });
    },
    fetchTypeToModel(manufacturer, type) {
        // console.log('fetchTypeToModel' + manufacturer, type)
        deviceApi.getModel(manufacturer, type).then((result) => {
            if (result.code != 0) {
                sbzygl.showTips('error', result.msg);
                this.modelOptions.clear();
                return;
            }

            let dsjCode = [];
            result.data.forEach((item, index) => {
                let data = {
                    key: item,
                    value: item
                }
                dsjCode.push(data)
            });
            //型号
            sbzygl.handleRemoteType(dsjCode, (modelHasNullOptions, modelOptions) => {
                this.modelOptions.clear();
                this.modelOptions = modelOptions;
                this.defaultModel = modelOptions.length > 0 ? modelOptions[0].value : "";
                this.inputJson.model = modelOptions.length > 0 ? modelOptions[0].value : "";
            });
        });
    },
});
dialogRegisterVm.$watch('clear', (v) => {
    vm.enableCreate = false;
    dialogRegisterVm.inputJson = {
        "gbcode": "",
        "imei": "",
        "sim": "",
        "ip": "",
        "capacity": "",
        "name": "",
        "allotKeyword": "",
        "orgName": "",
        "username": "",
        "usercode": "",
        "userRid": "",
        "userOrgRid": "",
        "model": ""
    }
    dialogRegisterVm.validJson = {
        "gbcode": true,
        "gbcodeUnique": true,
        "type": true,
        "orgRid": true,
        "model": true,
        "name": true,
        "imei": true,
        "sim": true,
        "ip": true,
        "capacity": true,
        "manufacturer": true,
        "allotKeyword": true
    }
    dialogRegisterVm.showJson = {
        "sim": false,
        "ip": false,
        "capacity": false,
        "gbcode": false
    }
    dialogRegisterVm.defaultManufacturer = "";
    dialogRegisterVm.defaultType = "";
    dialogRegisterVm.defaultModel = "";
    dialogRegisterVm.defaultAllot = "";
    dialogRegisterVm.allotQuery = false;
    dialogRegisterVm.allotIsNull = true;
    dialogRegisterVm.isSelect = false;
    clearTimeout(allotTimer);
    clearTimeout(dialogRegisterVm.pageTimer);
    dialogRegisterVm.currentOrgId = '';
})

//修改弹窗vm定义
const dialogModifyVm = avalon.define({
    $id: 'zfygl-modify-vm',
    show: false,
    $form: createForm(),
    title: language_txt.xtywgl.zfjlygl.modify,
    save: language_txt.xtywgl.zfjlygl.save,
    cancel: language_txt.xtywgl.zfjlygl.cancel,
    modelOptions: [], //设备型号
    typeOptions: [],
    statusOptions: [],
    allotOptions: [],
    lastUserId: "", //修改前的配发警员userId
    lastAllotKeyword: "", //修改前的警员username
    lastOrgId: "", //修改前的配发警员所在部门orgId
    lastOrgName: "", //修改前的配发警员所在部门orgName
    allotOrgId: "", //当前选择的配发警员的orgId
    allotOrgName: "", //当前选择的配发警员的orgName
    defaultAllot: "", //配发对象下拉框的默认值
    allotQuery: false,
    allotIsNull: true,
    isSelect: false, //判断是否手动（非通过所属部门联动）选择了配发部门
    findIndex: [],
    orgData: [],
    orgId: "",
    orgCode: "",
    orgPath: "",
    orgName: "",
    selectedRowsData: [],
    isDump: false, //是否为注销状态
    isAbnormal: false, //是否为非正常状态
    telReg: /(^\d[\d-]{6,18}$|^\s{0}$)/,
    ipReg: /(^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$|^\s{0}$)/,
    capacityReg: /(^[1-9]{1}[0-9]{0,8}$|^\s{0}$)/,
    // capacityReg:/(^[1-9]\d*(\.\d+)?$|^0\.\d+$|^\s{0}$)/,
    mustAndSpecialReg: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/, //禁止特殊字符的必填项
    specialReg: /(^[a-zA-Z0-9\u4e00-\u9fa5]+$|^\s{0}$)/, //禁止特殊字符的非必填项
    lengthReg: /^\s{0}/, //仅限制长度的非必填项
    clear: false, //用来促使弹框里的input框清空
    allotUserHasDelete: false, //判断点击取消时是否刷新列表
    allotLoading: false,
    allotPageQuery: 0,
    allotPageByOrg: 0,
    allotPageTotal: 0,
    allotPageSize: 500,
    pageTimer: '',
    currentOrgId: '', //当前选中的配发对象部门id
    $skipArray: ['allotUserHasDelete', 'allotPageQuery', 'allotPageByOrg', 'allotPageTotal', 'allotPageSize', 'pageTimer', 'currentOrgId'],
    inputJson: {
        "gbcode": "",
        "imei": "",
        "model": "",
        "sim": "",
        "ip": "",
        "id": "",
        "capacity": "",
        "name": "",
        "allotKeyword": "",
        "username": "",
        "usercode": "",
        "userRid": "",
        "orgName": "",
        "userOrgRid": "",
        "manufacturer": "",
        "manufacturerName": "",
        "type": "",
        "typeName": "",
    },
    validJson: {
        "gbcode": true,
        "model": true,
        "type": true,
        "orgRid": true,
        "name": true,
        "imei": true,
        "sim": true,
        "ip": true,
        "capacity": true,
        "manufacturer": true,
        "allotKeyword": true,
        "orgName":true
    },
    showJson: {
        "sim": false,
        "ip": false,
        "capacity": false
    },
    getSearchLabel(label, owner) {
        //厂商或型号的输入有变化时
        if (label == null) return;
        this.inputJson.model = label;
        this.$form.record.model = label;
    },
    handleSearchSelectFocus(event, owner) {
        sbzygl.handleFocus(event, 'model', this);
    },
    handleSearchSelectFormat(event, owner) {
        sbzygl.handleFormat(event, 'model', this, this.modelReg, null);
    },
    // 设备型号
    handleModelChange(e) {
        this.inputJson.model = e.target.value;
    },
    //切换配发方式按钮
    handleTabType(event) {
        event.target.blur();
        this.allotQuery = !this.allotQuery;
        this.inputJson.orgName = "";
        this.inputJson.usercode = "";
        this.inputJson.username = "";
        this.inputJson.userRid = "";
        this.inputJson.userOrgRid = "";
        this.allotOptions.clear();
        this.validJson.allotKeyword = true;
        //下面三句是为了切换方式后，显示最开始（修改前）绑定的人员
        let lastOrgId = this.lastOrgId;
        this.lastOrgId = "";
        this.lastOrgId = lastOrgId;
        this.isSelect = false;
        if (!this.allotQuery) {
            fetchAllotByOrgId(dialogModifyVm, this.lastUserId);
        } else {
            fetchAllot(dialogModifyVm, this.lastUserId, true)
        }
    },
    handleAllotQuery(event) {
        let keyCode = event.keyCode || event.which;
        if (keyCode === 13) {
            //按下enter键直接发送请求查询配发对象
            // event.target.blur();
            clearTimeout(allotTimer);
            fetchAllot(dialogModifyVm, null, false);
        } else {
            //使用去抖函数发送请求查询配发对象，避免频繁发送请求
            allotTimer = debounceFetchAllot(dialogModifyVm);
        }
    },
    allotChange(label, value) {
        if (this.allotOptions.length <= 0) {
            this.inputJson.orgName = "";
            this.inputJson.usercode = "";
            this.inputJson.username = "";
            this.inputJson.userRid = "";
            this.inputJson.userOrgRid = "";
            this.allotIsNull = true;
            return;
        }
        //当配置管理--用户管理下删除了某个已配发用户，而当前页面未刷新时的处理
        //选择模式下：选择未配发；查询模式下：置空
        //allotUserHasDelete用于点击取消时是否刷新列表
        if (!label) {
            this.defaultAllot = "null";
            this.lastAllotKeyword = "";
            this.inputJson.allotKeyword = "";
            this.lastUserId = "";
            this.allotUserHasDelete = true;
            return;
        }
        let index = this.findIndex.indexOf(value);
        if (index >= 0 || value == "null") {
            let targetData = this.allotOptions[index + 1];
            this.inputJson.username = targetData.userName;
            this.inputJson.usercode = targetData.userCode;
            this.inputJson.userRid = targetData.userId;
            this.allotIsNull = Boolean(index === -1);
            if (this.allotQuery) {
                //可查询模式下
                this.inputJson.orgName = targetData.orgName;
                this.inputJson.userOrgRid = targetData.orgId;
            }
        }
    },
    getLoading(loading) {
        this.allotLoading = loading;
    },
    allotQueryBlur(event) {
        clearTimeout(allotTimer);
        $(event.target).siblings('.fa-close').hide();
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
    getAllotSelected(key, title) {
        if (!vm.needFetchModifyAllot) {
            return;
        }
        this.allotOrgId = key;
    },
    handleAllotTreeChange(e) {
        this.isSelect = true;
        // this.orgCode = e.node.code;
        // this.orgPath = e.node.path;
        // this.orgName = e.node.title;
        // this.orgId = e.node.key;
        this.allotOrgName = e.node.title;
        fetchAllotByOrgId(dialogModifyVm);
    },
    handleFocus(name, event) {
        sbzygl.handleFocus(event, name, this);
    },
    handleFormat(name, reg, event) {
        sbzygl.handleFormat(event, name, this, reg);
    },
    handleClear(name, event) {
        sbzygl.handleClear(event, name, this);
        if (name === 'allotKeyword') {
            this.inputJson.orgName = "";
            this.inputJson.usercode = "";
            this.inputJson.username = "";
            this.inputJson.userRid = "";
            this.inputJson.userOrgRid = "";
            this.allotIsNull = true;
            this.allotOptions.clear();
        }
    },
    handleCancel(e) {
        this.show = false;
        if (this.allotUserHasDelete) {
            vm.fetchList();
        }
        this.clear = !this.clear;
    },
    handleOk() {
        // let url = '/gmvcs/uom/device/dsj/modify';
        let url = '/gmvcs/uom/device/gb28181/v1/device/modifyDevice';
        registerOrModify(url, this, zfjlygl_language.modifySuccessfully);
    }

});

dialogModifyVm.$watch('clear', (v) => {
    dialogModifyVm.inputJson = {
        "gbcode": "",
        "imei": "",
        "model": "",
        "sim": "",
        "ip": "",
        "id": "",
        "capacity": "",
        "name": "",
        "allotKeyword": "",
        "orgName": "",
        "username": "",
        "usercode": "",
        "userRid": "",
        "userOrgRid": "",
        "manufacturer": "",
        "manufacturerName": "",
        "type": "",
        "typeName": "",
    }
    dialogModifyVm.validJson = {
        "gbcode": true,
        "model": true,
        "type": true,
        "orgRid": true,
        "name": true,
        "imei": true,
        "sim": true,
        "ip": true,
        "capacity": true,
        "manufacturer": true,
        "allotKeyword": true,
        "orgName":true
    }
    dialogModifyVm.showJson = {
        "sim": false,
        "ip": false,
        "capacity": false
    }
    dialogModifyVm.allotQuery = false;
    dialogModifyVm.allotIsNull = true;
    clearTimeout(allotTimer);
    clearTimeout(dialogModifyVm.pageTimer);
    dialogModifyVm.currentOrgId = '';
    dialogModifyVm.defaultAllot = "";
    dialogModifyVm.lastOrgId = "";
    dialogModifyVm.lastOrgName = "";
    dialogModifyVm.lastAllotKeyword = "";
    dialogModifyVm.lastUserId = "";
    dialogModifyVm.allotOrgId = "";
    dialogModifyVm.allotOrgName = "";
    dialogModifyVm.isDump = false;
    dialogModifyVm.isAbnormal = false;
    dialogModifyVm.isSelect = false;
    dialogModifyVm.allotUserHasDelete = false;
    //直接设成[]，下拉框选了之后会一直保持选择的值
    dialogModifyVm.selectedRowsData = [''];
})

//删除弹窗vm定义
const dialogDelVm = avalon.define({
    $id: 'zfygl-delete-vm',
    show: false,
    title: language_txt.xtywgl.zfjlygl.delete,
    save: language_txt.xtywgl.zfjlygl.save,
    cancel: language_txt.xtywgl.zfjlygl.cancel,
    batchDelete_txt: language_txt.xtywgl.zfjlygl.areYouSureToDeleteTheSelected,
    deviceRidArr: [],
    selectedRowsLength: 1,
    isBatch: false,
    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        // let url = '/gmvcs/uom/device/dsj/delete/' + this.deviceRidArr;
        let url = '/gmvcs/uom/device/gb28181/v1/device/deleteDevice';
        // sbzygl.ajax(url).then(result => {
        sbzygl.ajax(url, 'post', this.deviceRidArr.$model).then(result => {
            if (result.code !== 0) {
                sbzygl.showTips('error', result.msg);
                return;
            }
            let rowsLength = $('.tyywglpt-list-content>li').length;
            this.show = false;
            sbzygl.showTips('success', zfjlygl_language.deleteSuccessfully);
            //判断是否将本页的数据全删了，如果是则需要到上一页
            if ((rowsLength == vm.selectedRowsLength || rowsLength == 1) && vm.current > 1) {
                vm.current = vm.current - 1;
            }
            vm.fetchList();
        })
    }
});

//注册确认弹窗vm定义
const dialogDumpVm = avalon.define({
    $id: 'zfygl-dump-vm',
    show: false,
    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        this.show = false;
        let url = '/gmvcs/uom/device/dsj/modify';
        registerOrModify(url, dialogModifyVm, '修改成功', true);
    }
});

//新升级弹窗vm定义
const dialogUpdateVm = avalon.define({
    $id: 'zfygl-update-vm',
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
        extraDisabled: function() {
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
    handleCjzUpdate(e) {
        sbzygl.handleUpdate(e, 'gbcode', 1, this.checkedItem.id, vm.checkedData, () => {
            dialogAllotTipVm.show = true;
            this.updateData = [];
            this.checkedIndex = -1;
            this.checkedItem = [];
            this.show = false;
        });
    },
    handleWifiUpdate(e) {
        sbzygl.showTips('warning', zfjlygl_language.wirelessNetworkUpgradeFunctionIsNotOpenYet);
        return;
        // sbzygl.handleUpdate(e, 'gbcode', 0, this.checkedItem.id, vm.checkedData, () => {
        //     dialogAllotTipVm.show = true;
        //     this.updateData = [];
        //     this.checkedIndex = -1;
        //     this.checkedItem = [];
        //     this.show = false;
        // });
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
    $id: 'zfygl-look-vm',
    show: false,
    updateContent: "",
    handleOk() {
        this.show = false;
    }
});

//升级下发提示弹窗vm定义
const dialogAllotTipVm = avalon.define({
    $id: 'zfygl-allottip-vm',
    show: false,
    handleOk() {
        this.show = false;
    }
});

//采集站定向升级弹窗vm定义
const dialogDirectVm = avalon.define({
    $id: 'zfygl-direct-vm',
    show: false,
    $form: createForm(),
    deviceLoading: true,
    modelLoading: true,
    manufacturerOptions: [],
    defaultManufacturer: "",
    orgData: [],
    orgId: "",
    orgCode: "",
    orgPath: "",
    orgName: "",
    deviceOptions: [],
    modelOptions: [],
    isDeviceAllchecked: false,
    checkedDevice: [],
    checkedModel: [],
    allDeviceGbcode: [], //提前保存所有采集站的gbcode,这样全选的时候直接赋值即可，而不用一个一个push
    $computed: {
        okDisabled: function() {
            return !(this.checkedDevice.length && this.checkedModel.length);
        }
    },
    getSelected(key, title) {
        this.orgId = key;
    },
    handleTreeChange(e) {
        this.orgCode = e.node.code;
        this.orgPath = e.node.path;
        this.orgName = e.node.title;
        this.isDeviceAllchecked = false;
        this.checkedDevice.clear();
        this.deviceOptions.clear();
        this.fetchWsList();
    },
    extraExpandHandle(treeId, treeNode, selectedKey) {
        sbzygl.fetchOrgWhenExpand(treeId, treeNode, selectedKey);
    },
    handleAllDeviceSelect(event) {
        this.checkedDevice.clear();
        if (this.isDeviceAllchecked) {
            $.each($('.device-check'), (index, el) => {
                $(el).prop('checked', true);
                let $eleLabel = $(el).siblings('.select-label').removeClass('check_unselected').addClass('check_selected');
            })
            this.checkedDevice = this.allDeviceGbcode.slice();
        } else {
            $.each($('.device-check'), (index, el) => {
                $(el).prop('checked', false);
                let $eleLabel = $(el).siblings('.select-label').removeClass('check_selected').addClass('check_unselected');
            })
        }
    },
    handleDeviceCheck(el, event) {
        let hasChecked = this.deviceOptions.filter((item) => {
            return item.checked;
        });
        this.checkedDevice = hasChecked;
        if (hasChecked.length === this.deviceOptions.length) {
            this.isDeviceAllchecked = true;
        } else {
            this.isDeviceAllchecked = false;
        }
    },
    handleManuChange(event) {
        this.checkedModel.clear();
        this.modelOptions.clear();
        this.fetchModelList(event.target.value)
    },
    handleModelCheck(event) {
        let hasChecked = this.modelOptions.filter((item) => {
            return item.checked;
        });
        this.checkedModel = hasChecked;
    },
    handleUpdate(e) {
        let data = {
            orgName: this.orgName,
            orgId: this.orgId,
            deviceIds: this.checkedDevice.$model,
            manufacturer: Number(this.$form.record.manufacturer),
            models: this.checkedModel.$model,
            updateWay: 2,
        }
        let url = '/gmvcs/uom/package/directionalUpdate';
        sbzygl.ajax(url, 'post', data).then(result => {
            if (result.code !== 0) {
                sbzygl.showTips('warn', result.msg);
                return;
            }
            dialogAllotTipVm.show = true;
            this.checkedDevice.clear();
            this.checkedModel.clear();
            this.isDeviceAllchecked = false;
            this.defaultManufacturer = "";
            this.deviceOptions.clear();
            this.modelOptions.clear();
            this.allDeviceGbcode.clear();
            $('.device-list,.model-list').html('');
            this.show = false;
        });

    },
    handleCancel(e) {
        this.checkedDevice.clear();
        this.checkedModel.clear();
        this.isDeviceAllchecked = false;
        this.defaultManufacturer = "";
        this.deviceOptions.clear();
        this.allDeviceGbcode.clear();
        this.modelOptions.clear();
        $('.device-list,.model-list').html('');
        this.show = false;
    },
    fetchWsList() {
        let url = '/gmvcs/uom/device/workstation/basicInfos/' + this.orgId;
        this.deviceLoading = true;
        sbzygl.ajax(url).then(result => {
            if (result.code !== 0) {
                sbzygl.showTips('error', result.msg);
                this.deviceOptions.clear();
                this.allDeviceGbcode.clear();
                this.deviceLoading = false;
                return;
            } else if (!result.data || !result.data.tBasicInfos || !result.data.tBasicInfos.length) {
                this.deviceOptions.clear();
                this.allDeviceGbcode.clear();
                this.deviceLoading = false;
                return;
            }
            this.deviceOptions = result.data.tBasicInfos;
            //采集站过多时，使用avalon的ms-for非常卡 而且容易出现运行缓慢的提示
            let html = ``;
            for (let i = 0; i < this.deviceOptions.length; i++) {
                let el = this.deviceOptions[i];
                this.allDeviceGbcode[i] = el.gbcode; //ie下使用索引赋值比push操作性能好
                html += `<li>
                            <input type="checkbox" id="${'device'+i}" class="device-check" data-gbcode="${el.gbcode}">
                            <label for="${'device'+i}" class="select-label check_unselected"></label>
                            <label for="${'device'+i}" title="${el.name}">${el.name}</label>
                        </li>`;
            }
            $('.device-list').html('').append(html);
            $('.device-check').on('change', (event) => {
                let checked = event.target.checked;
                let gbcode = $(event.target).attr('data-gbcode');
                let $eleLabel = $(event.target).siblings('.select-label');
                $(event.target).blur();
                if (checked) {
                    $eleLabel.removeClass('check_unselected').addClass('check_selected');
                    this.checkedDevice.push(gbcode);
                } else {
                    $eleLabel.removeClass('check_selected').addClass('check_unselected');
                    this.checkedDevice.remove(gbcode);
                }
                if (this.checkedDevice.length === this.deviceOptions.length) {
                    this.isDeviceAllchecked = true;
                } else {
                    this.isDeviceAllchecked = false;
                }
            });
            this.deviceLoading = false;
        });
    },
    fetchModelList(dsjManufacturerId) {
        if (!dsjManufacturerId) {
            return;
        }
        this.modelLoading = true;
        let url = '/gmvcs/uom/device/dsj/model/manufacturerId?dsjManufacturerId=' + dsjManufacturerId;
        sbzygl.ajax(url).then(result => {
            if (result.code != 0) {
                sbzygl.showTips('error', result.msg);
                this.modelOptions.clear();
                this.modelLoading = false;
                return;
            }
            //先过滤掉值为""的型号
            let validData = result.data.filter((item) => {
                return !!item;
            })
            this.modelOptions = validData;
            let html = ``;
            for (let i = 0; i < this.modelOptions.length; i++) {
                let el = this.modelOptions[i];
                html += `<li>
                            <input type="checkbox" id="${'model'+i}" class="model-check" data-value="${el}">
                            <label for="${'model'+i}" class="select-label check_unselected"></label>
                            <label for="${'model'+i}" title="${el}">${el}</label>
                        </li>`;
            }
            $('.model-list').html('').append(html);
            $('.model-check').on('change', (event) => {
                let checked = event.target.checked;
                let modelValue = $(event.target).attr('data-value');
                let $eleLabel = $(event.target).siblings('.select-label');
                $(event.target).blur();
                if (checked) {
                    $eleLabel.removeClass('check_unselected').addClass('check_selected');
                    this.checkedModel.push(modelValue);
                } else {
                    $eleLabel.removeClass('check_selected').addClass('check_unselected');
                    this.checkedModel.remove(modelValue);
                }
            })
            this.modelLoading = false;
        });
    }
});

//远程配置更新弹窗
const dialogRemoteUpdateVm = avalon.define({
    $id: 'zfygl-remote-update-vm',
    show: false,
    $form: createForm(),
    positiveIntReg: /^[1-9]\d*$/, //非0正整数
    rateReg: /^(1000|([1-9]{1}[0-9]{3,}))$/, //1000及以上
    hundredReg: /^(0|([1-9]{1}[0-9]?)|100)$/, //0~100
    clear: false, //用来促使弹框里的input框清空
    inputJson: {
        "deviceId": "",
        "deviceName": "",
        "recordFrameRate": 25,
        "bitRate": 600000,
        "frameRate": 25,
        "deviceStateRate": 5000,
        "locationRate": 1000,
        "volume": 100,
        "brightness": 100,
        "contrast": 100,
        "acutance": 100,
    },
    validJson: {
        "deviceId": true,
        "deviceName": true,
        "recordFrameRate": true,
        "recordResolution": true,
        "bitRate": true,
        "frameRate": true,
        "transResolution": true,
        "deviceStateRate": true,
        "locationRate": true,
        "volume": true,
        "brightness": true,
        "contrast": true,
        "acutance": true,
    },
    showJson: {
        "recordFrameRate": false,
        "bitRate": false,
        "frameRate": false,
        "deviceStateRate": false,
        "locationRate": false,
        "volume": false,
        "brightness": false,
        "contrast": false,
        "acutance": false,
    },
    handleFocus(name, event) {
        sbzygl.handleFocus(event, name, this);
    },
    handleFormat(name, reg, event) {
        sbzygl.handleFormat(event, name, this, reg, null);
    },
    handleClear(name, event) {
        sbzygl.handleClear(event, name, this);
    },
    handleCancel(e) {
        this.clear = !this.clear;
        this.show = false;
    },
    handleOk() {
        let pass = true;
        let param = sbzygl.trimData(this.inputJson);
        let record = this.$form.record;
        avalon.each(param, (key, value) => {
            if (key != 'deviceId' && key != 'deviceName')
                param[key] = Number(param[key]);
        })
        param.recordResolution = String(record.recordResolution);
        param.transResolution = String(record.transResolution);
        avalon.each(this.validJson, (key, value) => {
            if (param[key] === "" || !value) {
                this.validJson[key] = false;
                pass = false;
            }
        });
        if (!pass) {
            return;
        }
        let url = '/gmvcs/uom/device/dsj/control/configUpdate';
        sbzygl.ajax(url, 'post', param).then(result => {
            if (result.code !== 0) {
                sbzygl.showTips('error', result.msg);
                return;
            }
            this.show = false;
            sbzygl.showTips('success', zfjlygl_language.theRemoteConfigurationUpdateWasSuccessful);
            this.clear = !this.clear;
        })
    }
});

dialogRemoteUpdateVm.$watch('clear', (v) => {
    dialogRemoteUpdateVm.inputJson = {
        "deviceId": "",
        "deviceName": "",
        "recordFrameRate": 25,
        "bitRate": 600000,
        "frameRate": 25,
        "deviceStateRate": 5000,
        "locationRate": 1000,
        "volume": 100,
        "brightness": 100,
        "contrast": 100,
        "acutance": 100,
    }
    dialogRemoteUpdateVm.validJson = {
        "deviceId": true,
        "deviceName": true,
        "recordFrameRate": true,
        "recordResolution": true,
        "bitRate": true,
        "frameRate": true,
        "transResolution": true,
        "deviceStateRate": true,
        "locationRate": true,
        "volume": true,
        "brightness": true,
        "contrast": true,
        "acutance": true,
    }
    dialogRemoteUpdateVm.showJson = {
        "recordFrameRate": false,
        "bitRate": false,
        "frameRate": false,
        "deviceStateRate": false,
        "locationRate": false,
        "volume": false,
        "brightness": false,
        "contrast": false,
        "acutance": false,
    }
})

/**
 * 查询配发对象
 * @param {vm} dialogVm 
 * @param {String} lastUserId 执法仪上一次保存的配发对象的userId值
 * @param {Boolean} isDebounce 是否为去抖调用
 */
function fetchAllot(dialogVm, lastUserId, isDebounce) {
    if (lastUserId) {
        dialogVm.inputJson.allotKeyword = dialogVm.lastAllotKeyword;
    }
    let keyword = $.trim(dialogVm.inputJson.allotKeyword);
    let reg = /^[a-zA-Z0-9\u4e00-\u9fa5]{2,20}$/
    if (keyword == "") {
        if (!isDebounce) {
            dialogVm.validJson.allotKeyword = false;
        }
        dialogVm.allotOptions.clear();
        dialogVm.allotLoading = false;
        return;
    }
    if (!reg.test(keyword)) {
        dialogVm.validJson.allotKeyword = false;
        dialogVm.allotOptions.clear();
        dialogVm.allotLoading = false;
        return;
    }
    dialogVm.validJson.allotKeyword = true;
    dialogVm.allotLoading = true;
    clearTimeout(dialogVm.pageTimer);
    dialogVm.allotOptions.clear();
    dialogVm.allotPageQuery = 0;
    let url = '/gmvcs/uap/user/findByTerminalUserNameOrUserCode';
    let data = {
        // "orgId": orgIdWithUser,
        "key": keyword
    }
    sbzygl.ajax(url, 'post', data).then(result => {
        //通过判断回调函数中访问到的keyword与当前的keyword即allotKeyword是否相同来确定是否为有效请求（利用闭包，回调函数执行时访问到的keyword是发生请求那一刻的值）
        //当数据量大的时候，请求返回需要一定的时间，而这段时间内若用户输入了其他关键字并发起请求，那么前一次的请求的回调应该被阻止执行
        if (keyword != dialogVm.inputJson.allotKeyword) {
            return;
        }
        if (result.code !== 0) {
            sbzygl.showTips('error', result.msg);
            dialogVm.allotOptions.clear();
            dialogVm.allotLoading = false;
            return;
        } else if (result.data.length === 0) {
            dialogVm.allotOptions.clear();
            dialogVm.allotLoading = false;
            return;
        }
        let options = [];
        let hasNullOptions = [];
        let indexs = [];
        let length = result.data.length;

        let timesTotal = Math.ceil(length / dialogVm.allotPageSize);
        let times = timesTotal;
        dialogVm.allotPageTotal = timesTotal;
        if (dialogVm == dialogModifyVm) {
            dialogVm.allotOptions = [{
                "label": zfjlygl_language.notAllocated,
                "value": "null",
                "orgName": "",
                "orgId": "",
                "userName": "",
                "userCode": "",
                "userId": ""
            }];
        }
        handleAllotByPage();

        //利用setTimeout，分批处理返回的数据（因为此处配发人员可能有成千上万）
        function handleAllotByPage() {
            dialogVm.pageTimer = setTimeout(handleAllotByPage, 0);
            let html = ``;
            let options = [];
            for (let i = (timesTotal - times) * dialogVm.allotPageSize; i < (timesTotal - times) * dialogVm.allotPageSize + dialogVm.allotPageSize; i++) {
                if (i >= length) {
                    break;
                }
                let el = result.data[i];
                let items = {
                    "label": el.userName + '(' + el.userCode + ')',
                    "value": el.userId,
                    "orgName": el.orgName,
                    "orgId": el.orgId,
                    "userName": el.userName,
                    "userCode": el.userCode,
                    "userId": el.userId
                };
                indexs.push(items.value);
                options.push(items);
            }
            dialogVm.allotOptions.pushArray(options)
            if (times == 1) { //当times=1时，为最后一次处理
                dialogVm.findIndex = indexs;
                if (lastUserId) { //当所选的该条数据已经配发过人员时，将defaultAllot置为空，以便默认选中已经配发过的这个人员
                    dialogVm.defaultAllot = "";
                } else { //其他情况下默认选中第一个人员
                    dialogVm.defaultAllot = indexs[0];
                }
                dialogVm.allotPageQuery = 1;
                clearTimeout(dialogVm.pageTimer);
            } else {
                dialogVm.allotPageQuery = times;
            }
            times--;
        }
    });
}

/**
 * 根据部门id查询配发对象
 * @param {vm} dialogVm 
 * @param {String} lastUserId 执法仪上一次保存的配发对象的userId值
 */
function fetchAllotByOrgId(dialogVm, lastUserId) {
    let orgId = "";
    // if (lastUserId && dialogVm.lastOrgId) {
    //     orgId = dialogVm.lastOrgId;
    // } else {
        // orgId = dialogVm.allotOrgId;
    // }
    dialogVm.currentOrgId = orgId; //保存本次请求的orgId
    dialogVm.allotLoading = true;
    clearTimeout(dialogVm.pageTimer);
    dialogVm.allotOptions.clear();
    dialogVm.allotPageByOrg = 0;

    if (lastUserId) {
        let userUrl = '/gmvcs/uap/user/findById/' + lastUserId;
        sbzygl.ajax(userUrl).then(result => {
            // console.log(result);
            dialogVm.allotOrgId = result.data.org.orgId;
            dialogVm.allotOrgName = result.data.org.orgName;
        }).then(() => {
            orgId = dialogVm.allotOrgId;
            findTerminal(dialogVm, orgId, lastUserId);
        });
    } else {
        orgId = dialogVm.allotOrgId;
        findTerminal(dialogVm, orgId, lastUserId);
    }
    
}

function findTerminal(dialogVm, orgId, lastUserId) { 
    let url = '/gmvcs/uap/user/find/terminal/by/org?orgId=' + orgId;
    sbzygl.ajax(url).then(result => {
        //通过判断回调函数中访问到的orgId与当前的orgId即currentOrgId是否相同来确定是否为有效请求（利用闭包，回调函数执行时访问到的orgId是发生请求那一刻的值）
        //当数据量大的时候，请求返回需要一定的时间，而这段时间内若用户选择了另一个部门，那么又会发起另一个请求
        //那么前一次的请求的回调应该被阻止执行
        // if (orgId != dialogVm.currentOrgId) {
        //     return;
        // }
        if (result.code !== 0) {
            sbzygl.showTips('error', result.msg);
            dialogVm.allotOptions.clear();
            dialogVm.allotLoading = false;
            return;
        } else if (result.data.length <= 0) {
            dialogVm.allotLoading = false;
            dialogVm.allotOptions.clear();
            let optionss = [{
                "label": zfjlygl_language.notAllocated,
                "value": "null",
                "orgName": "",
                "orgId": "",
                "userName": "",
                "userCode": "",
                "userId": ""
            }];
            dialogVm.allotOptions = dialogVm.allotOptions.concat(optionss)
            dialogVm.defaultAllot = dialogVm.allotOptions[0].value;
            dialogVm.allotPageTotal = 1;
            dialogVm.allotPageByOrg = 1;
            return
        }
        let options = [];
        let hasNullOptions = [];
        let indexs = [];
        let length = result.data.length;

        let timesTotal = Math.ceil(length / dialogVm.allotPageSize);
        let times = timesTotal;
        dialogVm.allotPageTotal = timesTotal;
        dialogVm.allotOptions = [{
            "label": zfjlygl_language.notAllocated,
            "value": "null",
            "orgName": "",
            "orgId": "",
            "userName": "",
            "userCode": "",
            "userId": ""
        }];
        handleAllotByPage();
        //利用setTimeout，分批处理返回的数据（因为此处配发人员可能有成千上万）
        function handleAllotByPage() {
            dialogVm.pageTimer = setTimeout(handleAllotByPage, 0);
            let html = ``;
            let options = [];
            for (let i = (timesTotal - times) * dialogVm.allotPageSize; i < (timesTotal - times) * dialogVm.allotPageSize + dialogVm.allotPageSize; i++) {
                if (i >= length) {
                    break;
                }
                let el = result.data[i];
                let items = {
                    "label": el.userName + '(' + el.userCode + ')',
                    "value": el.uid,
                    "userName": el.userName,
                    "userCode": el.userCode,
                    "userId": el.uid
                };
                indexs[i] = items.value;
                options.push(items);
            }
            dialogVm.allotOptions = dialogVm.allotOptions.concat(options)
            if (times == 1) { //当times=1时，为最后一次处理
                dialogVm.findIndex = indexs;
                if (lastUserId && dialogVm.lastOrgId) { //当所选的该条数据已经配发过人员时，将defaultAllot置为空，以便默认选中已经配发过的这个人员
                    dialogVm.defaultAllot = "";
                } else {
                    if (dialogVm.isSelect) { //当手动（非通过所属部门联动）选择了配发部门时，默认选中第一个具体的人员
                        dialogVm.defaultAllot = indexs[0];
                    } else { //通过所属部门联动了配发部门时，默认选中未配发
                        dialogVm.defaultAllot = dialogVm.allotOptions[0].value;
                    }
                }
                clearTimeout(dialogVm.pageTimer);
                dialogVm.allotPageByOrg = 1;
            } else {
                dialogVm.allotPageByOrg = times;
            }
            times--;
        }
    });
}

function createGbcode(orgCode, deviceType) {
    if (!vm.enableCreate || !deviceType) {
        return;
    }
    if (orgCode.length < 8) {
        sbzygl.showTips('warning', zfjlygl_language.becauseTheDepartmentNumberIsLessThan8DigitsTheCommunicationCodeCannotBeAutomaticallyGenerated);
        return;
    }
    // let url = '/gmvcs/uom/device/dsj/gbcode?orgCode=' + orgCode + '&type=' + deviceType
    // sbzygl.ajax(url, 'post', null).then(result => {
    deviceApi.getGbCode(orgCode, deviceType).then(result => {
        if (result.code !== 0) {
            sbzygl.showTips('error', result.msg);
            return;
        } else if (!result.data) {
            sbzygl.showTips('error', zfjlygl_language.anErrorOccurredWhenTheBackgroundServerGeneratedTheGBNumber);
            return;
        }
        dialogRegisterVm.inputJson.gbcode = result.data;
        dialogRegisterVm.validJson.gbcode = true;
    });
}

/**
 * 发送注册或修改请求
 * @param {string} url 注册或修改的请求地址
 * @param {vm} dialogVm 注册或修改弹窗的vm
 * @param {string} successMsg 请求成功后的提示消息
 */
function registerOrModify(url, dialogVm, successMsg, comfirmDump) {
    let record = JSON.parse(JSON.stringify(dialogVm.$form.record));
    let inputJson = sbzygl.trimData(dialogVm.inputJson);
    let pass = true;
    let param = {
        "gbcode": inputJson.gbcode,
        "imei": inputJson.imei || '',
        "sim": inputJson.sim || '',
        "model": dialogVm == dialogRegisterVm ? (record.model ? record.model : "") : inputJson.model,
        "ip": inputJson.ip || '',
        "capacity": inputJson.capacity,
        "name": inputJson.name,
        "username": inputJson.username,
        "usercode": inputJson.usercode,
        "userRid": inputJson.userRid,
        "userOrgRid": dialogVm.allotQuery ? inputJson.userOrgRid : dialogVm.allotIsNull ? "" : dialogVm.allotOrgId,
        "orgId": dialogVm.orgId,
        "orgCode": dialogVm.orgCode,
        "path": dialogVm.orgPath,
        "online": 0,
        "type": dialogVm == dialogRegisterVm ? record.type : inputJson.type,
        "status": Number(dialogVm == dialogRegisterVm ? "1" : record.status), //注册时状态默认为正常
        "manufacturer": dialogVm == dialogRegisterVm ? record.manufacturer : inputJson.manufacturer,
        "userType": 1,
        "sn": '',
    };

    avalon.each(record, function (key, value) {
        if (Array.isArray(value)) {
            param[key] = value[0];
        }
    });
    //未复现的bug（只有测试偶尔见过）----选择了配发对象但是usercode或者username还是为空，所以写下面这段确保不会发生
    let allotStr = "";
    if (((param.usercode == "" && param.username != "") || (param.usercode != "" && param.username == "")) && dialogVm.allotOptions.length > 0) {
        allotStr = dialogVm.allotQuery ? $('.allot-item-query .ane-select-selected').text() : $('.allot-item-org .ane-select-selected').text();
        let length = allotStr.length;
        let breakIndex = allotStr.indexOf('(');
        param.usercode = allotStr.slice(breakIndex + 1, length - 1);
        param.username = allotStr.slice(0, breakIndex);
    }
    //------------表单验证开始----------------------------------------------------------
    // key == 'model' || 暂不验证
    // avalon.each(dialogVm.validJson, (key, value) => {
    //     if (((key == 'gbcode' || key == 'manufacturer' || key == 'type' || key == 'orgRid' || key == 'name') && !param[key]) || !value) {
    //         dialogVm.validJson[key] = false;
    //         pass = false;
    //     }
    // });

    avalon.each(dialogVm.validJson, (key, value) => { //只校验设备型号字段，不为空则通过表单验证
        if (((key == 'model' || key == 'name') && !param[key]) || !value) {
            dialogVm.validJson[key] = false;
            pass = false;
        }
    });

    if (!pass) {
        return;
    }
    param.manufacturer = param.manufacturer === "" ? null : (param.manufacturer);
    param.type = param.type === "" ? null : (param.type);
    param.status = param.status === "" ? null : (param.status);
    //注销前提示
    if (param.status === 4 && !comfirmDump) {
        dialogDumpVm.show = true;
        return;
    }
    //对于去掉的字段，赋null传递给后台
    param.imei = null;
    param.ip = null;
    param.sim = null;
    param.userOrgRid = param.userOrgRid || null;
    //因为后台需要，所以要放开字段
    // param.usercode = null;
    // param.username = null;
    // param.userRid = null;
    param.manufacturer = '';
    param.type = deviceType;

    param.status = 1;
    // console.log(param.orgcode);
    //------------表单验证结束----------------------------------------------------------

    let deviceInfoList = [{
        "capacity": param.capacity,
        "extend": "",
        "gbcode": param.gbcode,
        "id": inputJson.id ? inputJson.id : '',
        "imei": param.imei,
        "ip": param.ip,
        "isDeleted": 0,
        "manufacturer": param.manufacturer,
        "model": param.model,
        "name": param.name,
        "online": param.online,
        "orgCode": param.orgCode,
        "orgId": param.orgId,
        "orgName": dialogVm.orgName,
        "orgPath": param.path,
        "parentGbcode": "",
        "platformGbcode": platformGbcode,
        "registerTime": "",
        "sim": param.sim,
        "status": param.status,
        "type": param.type,
        "updateTime": "",
        "userCode": param.usercode,
        "userId": param.userRid,
        "userName": param.username,
        "version": "",
        "sn": param.sn,
        "isStandbyMachine": 2,
    }];
    let data = null;

    // 修改
    if (url == '/gmvcs/uom/device/gb28181/v1/device/modifyDevice') {
        data = deviceInfoList[0];
    } else {
        data = deviceInfoList;
    }

    sbzygl.ajax(url, 'post', data).then(result => {
        if (result.code == 1809) {
            dialogVm.validJson.name = false;
            sbzygl.showTips('error', zfjlygl_language.theDeviceNameAlreadyExistsPleaseReenterIt);
            return;
        } else if (result.code == 1704) {
            dialogVm.validJson.gbcodeUnique = false;
            sbzygl.showTips('error', zfjlygl_language.theCommunicationCodeAlreadyExistsPleaseReenterIt);
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

        if (url == '/gmvcs/uom/device/gb28181/v1/device/modifyDevice') {} else {
            vm.fetchManuOptions();
        }
    })
}

//移除下拉框数据中的某个值
function removeOption(options, value) {
    let removedOptions = [];
    for (let i = 0; i < options.length; i++) {
        if (options[i].value === value) {
            continue;
        }
        removedOptions.push(options[i]);
    }
    return removedOptions;
}

function toEmpty(str) {
    if (!str || str == 'null') {
        return ''
    } else if (avalon.isObject(str)) {
        return str.join();
    } else {
        return str;
    }
}

let platformGbcode = null;

// 获取本机平台信息

function getLocalPlatformInfo() {
    let url = '/gmvcs/uom/device/gb28181/v1/arch/getLocalPlatformInfo';
    sbzygl.ajax(url).then(result => {
        if (result.code == 0) {
            platformGbcode = result.data.deviceId;
        } else {
            sbzygl.showTips('error', '获取本机平台信息:' + result.msg);
        }
    });
}