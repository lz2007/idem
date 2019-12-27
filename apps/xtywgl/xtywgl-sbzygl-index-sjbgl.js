import avalon from 'avalon2';
import ajax from '../../services/ajaxService';
import moment from 'moment';
import '../tyywglpt/tyywglpt-sjgl-sjbgl.css';
import '../common/common-progress';
import '../common/common-pages';
import {
    apiUrl,
    languageSelect
} from '../../services/configService';
import Sbzygl from '../common/common-sbzygl';
import * as menuServer from '../../services/menuService';
import * as deviceApi from '../common/common-gb28181-tyywglpt-device-api';
const storage = require('../../services/storageService.js').ret;
import {
    createForm,
    notification
} from 'ane';
export const name = 'xtywgl-sbzygl-index-sjbgl';
import '../common/common-ms-modal';
require("/apps/xtywgl/xtywgl-sbzygl-index-sjbgl.less");

import {
    ret
} from '../../services/storageService';
const plupload = require('../../vendor/plupload/plupload.full.min.js');
let icon_dep = '../../static/image/tyywglpt/org.png';
let language_txt = require('../../vendor/language').language,
    sjbgl_txt = language_txt.xtpzgl.sjbgl;
// javascript filter() 兼容ie8
if (!Array.prototype.filter) {
    Array.prototype.filter = function (fun /*, thisArg */ ) {
        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function")
            throw new TypeError();

        var res = [];
        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t) {
                var val = t[i];
                if (fun.call(thisArg, val, i, t))
                    res.push(val);
            }
        }

        return res;
    };
}
let vm = null,
    sbzygl = null,
    enableQuery = true,
    queryTimer = null,
    uploader = null;
const listHeaderName = name + "-list-header";
//页面组件
let sjbgl = avalon.component(name, {
    template: __inline('./xtywgl-sbzygl-index-sjbgl.html'),
    defaults: {
        sjbgl_txt: language_txt.xtpzgl.sjbgl,
        zfywjscfw: language_txt.xtywgl.zfywjscfw,
        packageName: '', //包名
        dataStr: "",
        extra_class: languageSelect == "en" ? true : false,
        fileUploadBtnTxt: languageSelect == "en" ? 'Seclect' : '选择',
        dataJson: {},
        type: null,
        authority: { // 按钮权限标识
            "DELETE": false, //升级管理_升级包管理_删除
            "SEARCH": false, //升级管理_升级包管理_查询
            "UPLOAD": false, //升级管理_升级包管理_上传升级包
            "ISSUE": false //升级管理_升级包管理_下发
        },
        titleTimer: "", //popover用的的定时器，代码在common-sbzygl.js
        manufacturerOptions: [],
        modelOptions: [],
        manufacturerOk: false,
        modelOk: false,
        modelName: "",
        isFirstFetch: true, //是否为第一次获取搜索栏中的型号
        isManuSelectMode: false, //是否为厂商改变导致的类型/型号获取
        // isManuSelectMode: true, //是否为厂商改变导致的类型/型号获取
        hasFetchManu: false, //是否已经获取厂商字典
        // hasFetchManu: true, //是否已经获取厂商字典
        $searchForm: createForm(),
        // 查询
        loading: true,
        isNull: false,
        // 表格数据
        tableData: [],
        // 获取表格数据
        searchName: '',
        startTime: moment().format('d') == "0" ? moment().day(-6).format('YYYY-MM-DD') : moment().day(1).format('YYYY-MM-DD'),
        endTime: moment().format('YYYY-MM-DD'),
        checkeds: false,
        sayError: function (word) {
            notification.error({
                message: word,
                title: language_txt.xtpzgl.sjbgl.tips
            });
        },
        //存放删除升级包数组
        delDate: [],
        //总页数
        total: 0,
        //每页显示页数
        pageSize: 20,
        //当前页数
        current: 1,
        delNums: 0,
        needFlash: false,
        init: false,
        downloadTipShow: false,

        weekActive: true,
        monthActive: false,
        weekBtnclick: false,
        monthBtnclick: false,
        weekClick() {
            this.weekBtnclick = true;
            this.monthBtnclick = false;
            this.weekActive = true;
            this.monthActive = false;

            if (moment().format('d') == "0") {
                this.startTime = moment().day(-6).format('YYYY-MM-DD');
                // this.endTime = moment().day(0).format('YYYY-MM-DD');
            } else {
                this.startTime = moment().day(1).format('YYYY-MM-DD');
                // this.endTime = moment().day(7).format('YYYY-MM-DD');
            }
            this.endTime = moment().format('YYYY-MM-DD');
        },
        monthClick() {
            this.weekBtnclick = false;
            this.monthBtnclick = true;
            this.weekActive = false;
            this.monthActive = true;

            this.startTime = moment().startOf('month').format('YYYY-MM-DD');
            this.endTime = moment().format('YYYY-MM-DD');
            // this.endTime = moment().endOf('month').format('YYYY-MM-DD');
        },
        //input清除内容函数
        sjbgl_handleClear(val) {
            switch (val) {
                case 'packageName':
                    this.packageName = '';
                    $(".userStep1-left input[name='packageName']").focus();
                    return false;
                    break;
            }
        },
        packageNameShowX: false,
        packageName_blur() { //姓名、警号框光标失去
            this.packageNameShowX = false;
        },
        packageName_focus() { //光标获取
            this.packageNameShowX = true;
        },
        getShowStatus(show) {
            vm.downloadTipShow = show;
        },
        onInit(event) {
            vm = event.vmodel;
            sbzygl = new Sbzygl(vm);
            let date = new Date();
            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^UOM_FUNCTION_SBZYGL_ZFJLYGL_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                if (func_list.length == 0)
                    return;

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_SBZYGL_ZFJLYGL_SJBGL_DELETE":
                            _this.authority.DELETE = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_ZFJLYGL_SJBGL_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_ZFJLYGL_SJBGL_UPLOAD":
                            _this.authority.UPLOAD = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_ZFJLYGL_SJBGL_ISSUE":
                            _this.authority.ISSUE = true;
                            break;
                    }
                });
                autoSetPanelTop();
            });
            autoSetPanelTop();
            this.$watch('dataJson', (v) => {
                if (v) {
                    this.startTime = v.startTime ? moment(v.startTime * 1000).format('YYYY-MM-DD') : moment().subtract(3, 'months').format('YYYY-MM-DD');
                    this.endTime = v.endTime ? moment(v.endTime * 1000).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
                    this.current = v.page + 1;
                    this.modelName = v.model;
                }
            })
        },
        onReady() {
            this.dataStr = storage.getItem(name);
            this.dataJson = this.dataStr ? JSON.parse(this.dataStr) : null;
           
            if(this.dataJson) {
                if(moment(this.dataJson.startTime* 1000).format('YYYY-MM-DD') == moment().isoWeekday(1).format('YYYY-MM-DD') && moment(this.dataJson.endTime* 1000).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                    // console.log('week');
                    this.weekActive = true;
                    this.monthActive = false;
                } else if(moment(this.dataJson.startTime* 1000).format('YYYY-MM-DD') == moment().dates(1).format('YYYY-MM-DD') && moment(this.dataJson.endTime* 1000).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                    // console.log('month');
                    this.weekActive = false;
                    this.monthActive = true;
                } else {
                    this.weekActive = false;
                    this.monthActive = false;
                }
            }

            //表头宽度设置
            sbzygl.setListHeader(listHeaderName);
            let timer = setInterval(() => {
                //等到this.$searchForm.record不为{}，而有具体内容时再fetchManuModelOptions，否则ie8下有问题
                if (!this.hasFetchManu) {
                    let recordStr = JSON.stringify(this.$searchForm.record);
                    let length = recordStr.match(/:/g) ? recordStr.match(/:/g).length : 0;
                    length && this.fetchManuModelOptions();
                    this.fetchManuToModel();
                    if (!this.isFirstFetch) {
                        this.isManuSelectMode = true;
                    }
                }
                if (vm.manufacturerOk && vm.modelOk) {
                    vm.fetchList();
                    clearInterval(timer);
                }
            }, 100);
            uploader = new plupload.Uploader({
                runtimes: 'html5,flash',
                browse_button: 'fileupload', //触发文件选择对话框的按钮，为那个元素id
                url: "//" + window.location.host + apiUrl + '/gmvcs/uom/bwc/package/uploadUpdatePackageNewBwc', //服务器端的上传页面地址
                flash_swf_url: '/static/vendor/plupload/Moxie.swf', //swf文件，当需要使用swf方式进行上传时需要配置该参数
                filters: {
                    max_file_size: '1gb',
                    // mime_types: [{
                    //     title: "Zip files",
                    //     extensions: "zip"
                    // }]
                },
                multi_selection: false,
                multipart_params: {},
                init: {
                    Init: function (up) {
                        vm.init = true;
                    },
                    FilesAdded: function (up, files) {
                        let file = files[0];
                        dialogUploadVm.uploadCompelete = false;
                        dialogUpdateInfoVm.inputJson.path = file.name;
                        // dialogUpdateInfoVm.inputJson.version = file.name.split(".")[0];
                        //避免filename中含有符号'.',直接获取数组的第一位会导致版本号出现错误
                        let fileNameArr = file.name.split(".");
                        let suffix = fileNameArr.pop();  
                        let fileNameStr = fileNameArr.join('.');
                        // console.log(fileNameStr);
                        dialogUpdateInfoVm.inputJson.version = fileNameStr; //选择升级包时，版本号默认为包名（不包含后缀）
                        dialogUpdateInfoVm.validJson.path = true;
                        dialogUpdateInfoVm.validJson.pathUnique = true;
                        dialogUpdateInfoVm.validJson.version = true;
                        dialogUpdateInfoVm.validJson.versionAccept = true;
                        //清除队列
                        for (let i = 0; i < uploader.files.length - 1; i++) {
                            uploader.removeFile(uploader.files[i]);
                        }
                        let promise = new Promise(function (resolve, reject) {
                            let tableListData = {
                                type: 3,
                                manufacturer: "",
                                model: "",
                                startTime: null,
                                endTime: null,
                                page: 0,
                                pageSize: 99999
                            };
                            lxxzrwAjax.ajaxGetTableList(tableListData).done(ret => {
                                if (ret.code == 0) {
                                    // console.log($($('.sjbglmodel .ane-select-selected')[0]).text());
                                    let modelName = $($('.sjbglmodel .ane-select-selected')[0]).text(); //此时所选的型号名称
                                    avalon.each(ret.data.currentElements, (index, item) => {
                                        if (item.name == file.name && item.model == modelName) {   //判断同一型号是否有相同包名的升级包或者有相同的版本号
                                            reject('error');
                                        }
                                    });
                                    resolve('success');
                                } else {
                                    resolve('success');
                                }
                            });
                        });
                        promise.then(function (data) {
                            // success
                            dialogUpdateInfoVm.validJson.pathUnique = true;
                        }).catch(function (err) {
                            // error
                            dialogUpdateInfoVm.validJson.pathUnique = false;
                        });
                    },

                    UploadProgress: function (up, file) {
                        if (file.percent > 100) {
                            return;
                        }
                        dialogUploadVm.progress = file.percent;
                        if (dialogUploadVm.progress >= 100) {
                            dialogUploadVm.uploadCompelete = true;
                        }
                    },

                    FileUploaded: function (up, file, response) {
                        let result = JSON.parse(response.response);
                        if (result.code == 1602) {
                            notification.error({
                                message: vm.sjbgl_txt.uploadFail,
                                title: vm.sjbgl_txt.tip
                            });
                            setTimeout(() => {
                                dialogUploadVm.show = false;
                                dialogUploadVm.progress = 0;
                            }, 1500);
                        } else if (result.code == 0) {
                            dialogUploadVm.ifsuccess = true;
                            setTimeout(() => {
                                vm.current = 1;
                                vm.fetchList();
                                setTimeout(() => {
                                    dialogUploadVm.show = false;
                                    dialogUploadVm.progress = 0;
                                }, 1500);
                            }, 500);
                        } else {
                            notification.warn({
                                message: result.msg,
                                title: vm.sjbgl_txt.tip
                            });
                            setTimeout(() => {
                                dialogUploadVm.show = false;
                                dialogUploadVm.progress = 0;
                            }, 1500);
                        }
                    },
                    Error: function (up, err) {
                        let code = err.code;
                        dialogUploadVm.show = false;
                        dialogUploadVm.progress = 0;
                        dialogUploadVm.uploadCompelete = false;
                        dialogUploadVm.ifsuccess = false;
                        if (code === -500) {
                            vm.needFlash = true;
                        } else if (code === -601) {
                            notification.warn({
                                message: vm.sjbgl_txt.supportsZip,
                                title: vm.sjbgl_txt.tip
                            });
                        } else if (code === -600) {
                            notification.warn({
                                message: vm.sjbgl_txt.exceed1GB,
                                title: vm.sjbgl_txt.tip
                            });
                        } else {
                            notification.error({
                                message: vm.sjbgl_txt.errorUploading,
                                title: vm.sjbgl_txt.tip
                            });
                        }
                    }
                }
            });
        },
        //上传升级包按钮
        handleUploadInfo() {
            if (this.delDate.length) {
                return;
            }
            if (!vm.init) {
                uploader.init();
            }
            if (vm.needFlash) {
                vm.downloadTipShow = true;
                return;
            }
            let record = this.$searchForm.record;
            //联动搜索栏选择的厂商
            // if (String(record.manufacturer) == "null" || !record.manufacturer) {
            //     dialogUpdateInfoVm.defaultManufacturer = dialogUpdateInfoVm.manufacturerOptions.length > 0 ? dialogUpdateInfoVm.manufacturerOptions[0].value : "";
            // } else {
            //     dialogUpdateInfoVm.defaultManufacturer = String(record.manufacturer);
            // }
            dialogUpdateInfoVm.fetchModelOptions(); //每次点开上传前弹框都更新型号选择框的值
            dialogUpdateInfoVm.show = true;
        },
        onDispose() {
            clearTimeout(queryTimer);
            clearTimeout(this.titleTimer);
            enableQuery = true;
            uploader = null;
            $('div.popover').remove();
        },
        getDefaultManu(manufacturerOptions, dataJson) {
            return manufacturerOptions.length > 0 ? (dataJson ? dataJson.manufacturer : manufacturerOptions[0].value) : '';
        },
        getDefaultModel(modelOptions, isManuSelectMode, dataJson) {
            return modelOptions.length > 0 ? (isManuSelectMode ? modelOptions[0].value : (dataJson ? dataJson.modelId : modelOptions[0].value)) : ''
        },
        handleLook(record) {
            // dialogLookVm.show = true;
            dialogModifyVm.defaultManufacturer = "0";
            dialogModifyVm.inputJson = {
                "path": record.name,
                "version": record.version,
                "updateInfo": record.changeLog,
            }
            dialogModifyVm.defaultModel = record.model;
            dialogModifyVm.show = true;
            // dialogLookVm.updateContent = record.changeLog.replace(/(\r\n)|(\n)/g, '<br>');
        },
        handleComfirm(record) {
            dialogIssueComfirmVm.lblForcedBWCsUpgradeImg = "/static/image/sszhxt/check_unselected.png";
            dialogIssueComfirmVm.isForced = false;
            dialogIssueComfirmVm.searchInputValue = "";
            dialogIssueComfirmVm.show = true;
            dialogIssueComfirmVm.record = record;
            dialogIssueComfirmVm.getTree();
            dialogIssueComfirmVm.treeObj = $.fn.zTree.getZTreeObj($('.AllocationDialog  .ztree').attr('id'));
            // dialogIssueComfirmVm.treeObj.expandAll(true);
        },
        handleBlur(event) {
            event.target.value = $.trim(event.target.value);
            $(event.target).siblings('.fa-close').hide();
        },
        handleFocus(event) {
            $(event.target).siblings('.fa-close').show();
        },
        handleClear(event) {
            this.searchName = "";
            $(event.target).siblings('input').val('').focus();
        },
        searchNamePress(e) {
            let keyCode = e.keyCode || e.which;
            if (keyCode == 13) {
                this.query();
            } else if (keyCode === 32 && e.target.selectionStart === 0) {
                return false;
            }
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
        handleManuChange(e) {
            this.fetchManuToModel();
            if (!this.isFirstFetch) {
                this.isManuSelectMode = true;
            }
        },
        handleModelChange(e) {
            let value = e.target.value;
            if (!value || value == "null") {
                this.modelName = "";
            } else {
                let index = Number(value);
                if (this.modelOptions.length > index + 1) {
                    this.modelName = this.modelOptions[index + 1].label;
                }
            }
        },
        handleStartTimeChange(e) {
            this.startTime = e.target.value;
            // if (this.weekBtnclick) {
            //     this.weekActive = true;
            //     this.weekBtnclick = false;
            // } else {
            //     this.weekActive = false;
            // }

            // if (this.monthBtnclick) {
            //     this.monthActive = true;
            //     this.monthBtnclick = false;
            // } else {
            //     this.monthActive = false;
            // }
            if(moment(this.startTime).format('YYYY-MM-DD') == moment().isoWeekday(1).format('YYYY-MM-DD') && moment(this.endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                this.weekActive = true;
                this.monthActive = false;
            } else if(moment(this.startTime).format('YYYY-MM-DD') == moment().dates(1).format('YYYY-MM-DD') && moment(this.endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                this.weekActive = false;
                this.monthActive = true;
            } else {
                this.weekActive = false;
                this.monthActive = false;
            }
        },
        handleEndTimeChange(e) {
            this.endTime = e.target.value;
            // if (this.weekBtnclick) {
            //     this.weekActive = true;
            //     this.weekBtnclick = false;
            // } else {
            //     this.weekActive = false;
            // }

            // if (this.monthBtnclick) {
            //     this.monthActive = true;
            //     this.monthBtnclick = false;
            // } else {
            //     this.monthActive = false;
            // }
            if(moment(this.startTime).format('YYYY-MM-DD') == moment().isoWeekday(1).format('YYYY-MM-DD') && moment(this.endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                this.weekActive = true;
                this.monthActive = false;
            } else if(moment(this.startTime).format('YYYY-MM-DD') == moment().dates(1).format('YYYY-MM-DD') && moment(this.endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                this.weekActive = false;
                this.monthActive = true;
            } else {
                this.weekActive = false;
                this.monthActive = false;
            }
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
                    // dialogUpdateInfoVm.manufacturerOptions = manuOptions;
                    // dialogUpdateInfoVm.defaultManufacturer = manuOptions.length > 0 ? manuOptions[0].value : '';
                    this.manufacturerOk = true;
                });
            }).fail(() => {
                this.manufacturerOk = true;
                this.modelOk = true;
            });
        },
        fetchManuToModel() {
            let manufacturer = String(this.$searchForm.record.manufacturer);
            // let url = `/gmvcs/uom/device/workstation/manufacturer/module/get?manufacturer=0`;
           /* let url = `/gmvcs/uom/device/gb28181/v1/device/model?manufacturer=&allType=`;

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
                    dialogUpdateInfoVm.modelOptions = modelOptions;
                    dialogUpdateInfoVm.defaultModel = modelOptions.length > 0 ? modelOptions[0].value : '';
                    this.modelOk = true;
                });
                this.isFirstFetch = false;
            });*/

            deviceApi.getModel('', 'DSJ2G').then((result) => {
                if (result.code != 0) {
                    sbzygl.showTips('error', result.msg);
                    this.modelOptions.clear();
                    this.isFirstFetch = false;
                    this.modelOk = true;
                    return;
                }
    
                // let dsjCode = [];
                // result.data.forEach((item, index) => {
                //     let data = {
                //         key: item,
                //         value: item
                //     }
                //     dsjCode.push(data)
                // });

                sbzygl.handleRemoteModel(result.data, (modelHasNullOptions, modelOptions) => {
                    this.modelOptions.clear();
                    this.modelOptions = modelHasNullOptions;
                    dialogUpdateInfoVm.modelOptions = modelOptions;
                    dialogUpdateInfoVm.defaultModel = modelOptions.length > 0 ? modelOptions[0].value : '';
                    this.modelOk = true;
                });
                this.isFirstFetch = false;
            });
        },
        fetchList() {
            $('div.popover').remove();
            this.$searchForm.validateFields().then(isAllValid => {
                if (isAllValid) {
                    let data = {
                        type: 3,
                        // manufacturer: String(this.$searchForm.record.manufacturer),
                        name: this.packageName, //新增，包名
                        manufacturer: "",
                        model: this.modelName === "-" ? "" : this.modelName,
                        page: this.current - 1,
                        pageSize: this.pageSize
                    };
                    data.startTime = this.startTime ? moment(this.startTime).format('X') * 1 : null;
                    data.endTime = this.endTime ? moment(this.endTime).add(1, 'days').subtract(1, 'seconds').format('X') * 1 : null;
                    if (!data.startTime && !data.endTime) {
                        notification.warn({
                            title: vm.sjbgl_txt.tip,
                            message: vm.sjbgl_txt.chooseUploadTime
                        });
                        return;
                    }
                    if (!data.startTime && data.endTime) {
                        notification.warn({
                            message: vm.sjbgl_txt.chooseStartTime,
                            title: vm.sjbgl_txt.tip
                        });
                        return;
                    }
                    if (data.startTime && !data.endTime) {
                        notification.warn({
                            message: vm.sjbgl_txt.chooseEndTime,
                            title: vm.sjbgl_txt.tip
                        });
                        return;
                    }
                    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
                        notification.warn({
                            message: vm.sjbgl_txt.startNotGreaterEnd,
                            title: vm.sjbgl_txt.tip
                        });
                        return;
                    }
                    // data.manufacturer = (data.manufacturer == "null" || data.manufacturer == "") ? -1 : Number(data.manufacturer);
                    this.loading = true;
                    let storageData = JSON.parse(JSON.stringify(data));
                    storageData.manufacturer = (storageData.manufacturer == -1 || storageData.manufacturer == null) ? "null" : String(storageData.manufacturer);
                    storageData.modelId = this.$searchForm.record.model ? String(this.$searchForm.record.model) : "null";
                    this.dataStr = JSON.stringify(storageData);
                    storage.setItem(name, this.dataStr, 0.5);
                    lxxzrwAjax.ajaxGetTableList(data).then(ret => {
                        if (ret.code != 0) {
                            notification.warning({
                                message: ret.msg,
                                title: vm.sjbgl_txt.tip
                            });
                            this.tableData = [];
                            this.total = 0;
                            this.loading = false;
                            this.isNull = true;
                            sbzygl.initDragList(listHeaderName);
                            return false;
                        } else if (ret.data.totalElements === 0) {
                            this.tableData = [];
                            this.total = 0;
                            this.loading = false;
                            this.isNull = true;
                            sbzygl.initDragList(listHeaderName);
                            return false;
                        }
                        // 总数据量
                        this.total = ret.data.totalElements;
                        //默认选中状态为false
                        avalon.each(ret.data.currentElements, (i, item) => {
                            // item.size = item.size.toFixed(2);
                            item.insertTime = moment(item.insertTime).format('YYYY-MM-DD HH:mm:ss')
                            item.checked = false;
                        });
                        let length = 0;
                        //是否选择状态
                        if (this.delDate.length) {
                            avalon.each(ret.data.currentElements, (i, item) => {
                                avalon.each(this.delDate, (index, el) => {
                                    if (item.id == el.updatePackageId) {
                                        item.checked = true;
                                        length += 1;
                                    }
                                });
                            });
                        }
                        //是否全选
                        if (ret.data.currentElements.length == length && ret.data.currentElements.length > 0) {
                            this.checkeds = true;
                        } else {
                            this.checkeds = false;
                        }
                        this.tableData = ret.data.currentElements;
                        this.loading = false;
                        this.isNull = false;
                        sbzygl.initList();
                        sbzygl.initDragList(listHeaderName);
                    }).fail(() => {
                        this.loading = false;
                        this.tableData = [];
                        this.total = 0;
                        this.isNull = true;
                        sbzygl.initDragList(listHeaderName);
                    });
                }
            });
        },
        //表格单选
        tableClick(index, item) {
            item.checked = item.checked == true ? false : true;
            if (item.checked) {
                this.delDate.push({
                    "updatePackageId": item.id
                });
                if (this.tableData.filter(n => n.checked == false).length == 0) {
                    this.checkeds = true;
                }
            } else {
                this.checkeds = false;
                for (let i = 0; i < this.delDate.length; i++) {
                    if (this.delDate[i].updatePackageId == item.id) {
                        this.delDate.splice(i, 1);
                        break;
                    }
                }
            }
        },
        //表格全选
        checkedAll() {
            if (!this.tableData.length) {
                return false;
            }
            this.checkeds = this.checkeds == true ? false : true;
            avalon.each(this.tableData, (i, el) => {
                if (this.checkeds) {
                    el.checked = true;
                    this.delDate.push({
                        "updatePackageId": el.id
                    });
                } else {
                    el.checked = false;
                    for (let i = 0; i < this.delDate.length; i++) {
                        if (this.delDate[i].updatePackageId == el.id) {
                            this.delDate.splice(i, 1);
                            break;
                        }
                    }
                }
            });
            this.delDate = uniqeByKeys(this.delDate, ['updatePackageId']);
        },
        //清除全选状态和数据
        cancelCheckedAll() {
            if (!this.delDate.length) {
                return false;
            }
            this.checkeds = false;
            avalon.each(this.tableData, (i, el) => {
                el.checked = false;
            });
            this.delDate = [];
        },
        getCurrent(current) {
            this.current = current;
        },
        //当页码改变时触发，参数current
        onChangePage(current) {
            this.current = current;
            this.fetchList();
        },
        //删除按钮点击
        handleDeleteClick(record) {
            dialogDeleteVm.show = true;
            this.delDate = [{
                "updatePackageId": record.id
            }];
            // if (!this.delDate.length) {
            //     return false;
            // } else {
            //     this.delNums = this.delDate.length;
            //     dialogDeleteVm.show = true;
            // }
        },
    }
});


//上传前弹窗vm定义
const dialogUpdateInfoVm = avalon.define({
    $id: 'sbzygl-upload-info-vm',
    sjbgl_txt: language_txt.xtpzgl.sjbgl,
    $uploadform: createForm(),
    show: false,
    manufacturerOptions: [],
    modelOptions: [],
    updateTypeOptions: [],
    defaultManufacturer: "",
    defaultModel: "",
    // defaultUpdateType: "",
    modelName: "",
    manufacturerName: "",
    inputJson: {
        "path": "",
        "version": "",
        "updateInfo": "",
    },
    validJson: {
        "manufacturer": true,
        "model": true,
        "path": true,
        "pathUnique": true,
        "version": true,
        "versionAccept": true,
        "updateInfo": true,
    },
    showJson: {
        "version": false
    },
    // versionReg: /^[a-zA-Z0-9-\._\s]+$/,
    versionReg: '',
    updateInfoReg: /(.|\n)+/,
    clear: false, //用来促使弹框里的input框清空
    handleFocus(name, event) {
        sbzygl.handleFocus(event, name, this);
        if (name == "version") {
            this.validJson.versionAccept = true;
        }
        $(event.target).siblings('.fa-close').show();
    },
    handleFormat(name, reg, length, event) {
        sbzygl.handleFormat(event, name, this, reg, length);
        $(event.target).siblings('.fa-close').hide();
    },
    handleClear(name, event) {
        sbzygl.handleClear(event, name, this);
    },
    handleManuChange(e) {
        this.validJson.manufacturer = true;
        this.fetchModelOptions();
    },
    handleModelChange(e) {
        this.validJson.model = true;
        //选择型号时判断该型号是否有相同包名的升级包或者有相同的版本号
        this.validJson.versionAccept = true; //为避免切换型号之前该值为false（该情况为切换型号前提交上传弹框内容时，存在同一型号有相同版本号的情况）
        // console.log(e, this.modelOptions, this.inputJson.path);
        let modelName = "";
        let pathName = this.inputJson.path;
        for(let i = 0; i < this.modelOptions.length; i++){
            if(e.target.value == this.modelOptions[i].value) {
                modelName = this.modelOptions[i].label;
            }
        }
        // console.log(modelName);
        let promise = new Promise(function (resolve, reject) {
            let tableListData = {
                type: 3,
                manufacturer: "",
                model: "",
                startTime: null,
                endTime: null,
                page: 0,
                pageSize: 99999
            };
            lxxzrwAjax.ajaxGetTableList(tableListData).done(ret => {
                // console.log(ret);
                if (ret.code == 0) {
                    avalon.each(ret.data.currentElements, (index, item) => {
                        if (item.name == pathName && item.model == modelName) {
                            // console.log('error');
                            reject('error');
                        }
                    });
                    resolve('success');
                } else {
                    resolve('success');
                }
            });
        });
        promise.then(function (data) {
            // success
            dialogUpdateInfoVm.validJson.pathUnique = true;
        }).catch(function (err) {
            // error
            dialogUpdateInfoVm.validJson.pathUnique = false;
        });
    },
    handleOk() {
        let pass = true;
        let record = this.$uploadform.record;
        let param = {
            "manufacturer": record.manufacturer,
            "model": record.model ? $('#sbzygl-modal-upload-info .model-item .ane-select-selected').text() : "",
            "path": this.inputJson.path,
            "version": this.inputJson.version,
            "updateInfo": this.inputJson.updateInfo,
            "updateType": 0
        }
        avalon.each(record, function (key, value) {
            if (Array.isArray(value)) {
                param[key] = value[0];
            }
        });
        avalon.each(this.validJson, (key, value) => {
            if (((key == 'model' || key == 'path' || key == 'version' || key == 'updateInfo') && !param[key]) || !value) {
                // console.log(key);
                this.validJson[key] = false;
                pass = false;
            }
        });
        if (!pass) {
            return;
        }
        param.manufacturer = Number(param.manufacturer);

        //验证版本号是否存在
        let data = {
            "manufacturer": param.manufacturer,
            "model": param.model,
            "versions": [param.version]
        }
        let url = '/gmvcs/uom/bwc/package/checkBwcPackageVersionIsExist';
        sbzygl.ajax(url, 'post', data).then(result => {
            if (result.code != 0) {
                sbzygl.showTips('error', result.msg);
                this.validJson.versionAccept = false;
                return;
            }
            if (result.data) {
                this.validJson.versionAccept = false;
                return;
            } else {
                this.validJson.versionAccept = true;
                uploader.setOption('multipart_params', {
                    "type": 3,
                    "manufacturer": param.manufacturer,
                    // "manufacturerName": $('#sbzygl-modal-upload-info .manu-item .ane-select-selected').text(),
                    "manufacturerName": '0',
                    "model": param.model,
                    "version": this.inputJson.version,
                    "changeLog": this.inputJson.updateInfo,
                    "updateType": param.updateType
                });
                dialogUploadVm.show = true;
                dialogUploadVm.ifsuccess = false;
                dialogUploadVm.progress = 0;
                uploader.start();
                this.show = false;
                this.clear = !this.clear;
            }
        });
    },
    handleCancle() {
        this.clear = !this.clear;
        this.show = false;
    },
    fetchModelOptions() {
        // let csid = String(this.$uploadform.record.manufacturer);
        // console.log(csid);
        // if (!csid) {
        //     return;
        // }
        // let url = '/gmvcs/uom/device/workstation/getByCsid?csid=' + csid;
        // sbzygl.ajax(url).then(result => {
        //     if (result.code != 0) {
        //         sbzygl.showTips('error', result.msg);
        //         this.modelOptions.clear();
        //         return;
        //     }
        //     //型号
        //     sbzygl.handleRemoteModel(result.data, (modelHasNullOptions, modelOptions) => {
        //         this.modelOptions.clear();
        //         this.modelOptions = modelOptions;
        //         console.log(modelOptions)
        //         this.defaultModel = modelOptions.length > 0 ? modelOptions[0].value : '';
        //     });
        // })
        deviceApi.getModel('', 'DSJ2G').then((result) => {
            if (result.code != 0) {
                sbzygl.showTips('error', result.msg);
                this.modelOptions.clear();
                return;
            }
            // 型号
            sbzygl.handleRemoteModel(result.data, (modelHasNullOptions, modelOptions) => {
                this.modelOptions.clear();
                this.modelOptions = modelOptions;
                this.defaultModel = modelOptions.length > 0 ? modelOptions[0].value : '';
            });
        });
    }
});
dialogUpdateInfoVm.$watch('clear', (v) => {
    dialogUpdateInfoVm.inputJson = {
        "path": "",
        "version": "",
        "updateInfo": ""
    }
    dialogUpdateInfoVm.showJson = {
        "version": false
    }
    dialogUpdateInfoVm.validJson = {
        "manufacturer": true,
        "model": true,
        "path": true,
        "pathUnique": true,
        "version": true,
        "versionAccept": true,
        "updateInfo": true,
    }
    dialogUpdateInfoVm.defaultManufacturer = "";
    dialogUpdateInfoVm.defaultModel = "";
    // dialogUpdateInfoVm.defaultUpdateType = "";
});

//上传弹窗vm定义
const dialogUploadVm = avalon.define({
    $id: 'sbzygl-upload-vm',
    sjbgl_txt: language_txt.xtpzgl.sjbgl,
    show: false,
    progress: 0,
    uploadCompelete: false,
    ifsuccess: false,
    // 上传弹窗确定操作
    handleOk() {
        this.show = false;
        this.progress = 0;
    },
    // 上传弹窗取消操作        
    handleCancel() {
        uploader.stop();
        this.show = false;
        this.progress = 0;
        notification.warn({
            message: vm.sjbgl_txt.cancelUpload,
            title: vm.sjbgl_txt.tip
        });
    },
});

//删除弹窗vm定义
const dialogDeleteVm = avalon.define({
    $id: 'sbzygl-delete-vm',
    sjbgl_txt: language_txt.xtpzgl.sjbgl,
    show: false,
    // 删除弹窗确定操作
    handleOk() {
        ajax({
            url: '/gmvcs/uom/bwc/package/removingBwcUpdatePackageList',
            method: 'post',
            data: vm.delDate
        }).done((data) => {
            if (data.code == 0) {
                notification.success({
                    message: vm.sjbgl_txt.deleteSuccess,
                    title: vm.sjbgl_txt.tip
                });
                if (vm.checkeds && vm.current > 1) {
                    vm.current = vm.current - 1;
                }
                vm.fetchList();
                vm.cancelCheckedAll();
            } else {
                notification.error({
                    message: data.msg,
                    title: vm.sjbgl_txt.tip
                });
            }
        }).fail(err => {
            notification.error({
                message: vm.sjbgl_txt.deleteFail,
                title: vm.sjbgl_txt.tip
            });
        });
        this.show = false;
    },
    // 删除弹窗取消操作
    handleCancel() {
        this.show = false;
        vm.delDate = [];
    },
});

const dialogModifyVm = avalon.define({
    $id: 'sbzygl-look-vm',
    sjbgl_txt: language_txt.xtpzgl.sjbgl,
    $uploadform: createForm(),
    show: false,
    manufacturerOptions: [],
    modelOptions: [],
    updateTypeOptions: [],
    defaultManufacturer: "",
    defaultModel: "",
    // defaultUpdateType: "",
    modelName: "",
    manufacturerName: "",
    inputJson: {
        "path": "",
        "version": "",
        "updateInfo": "",
    },
    validJson: {
        "manufacturer": true,
        "model": true,
        "path": true,
        "pathUnique": true,
        "version": true,
        "versionAccept": true,
        "updateInfo": true,
    },
    showJson: {
        "version": false
    },
    // versionReg: /^[a-zA-Z0-9-\._\s]+$/,
    versionReg: '',
    updateInfoReg: /(.|\n)+/,
    clear: false, //用来促使弹框里的input框清空
    handleFocus(name, event) {
        sbzygl.handleFocus(event, name, this);
        if (name == "version") {
            this.validJson.versionAccept = true;
        }
        $(event.target).siblings('.fa-close').show();
    },
    handleFormat(name, reg, length, event) {
        sbzygl.handleFormat(event, name, this, reg, length);
        $(event.target).siblings('.fa-close').hide();
    },
    handleClear(name, event) {
        sbzygl.handleClear(event, name, this);
    },
    handleManuChange(e) {
        this.validJson.manufacturer = true;
        this.fetchModelOptions();
    },
    handleModelChange(e) {
        this.validJson.model = true;
    },
    handleOk() {
        let pass = true;
        let record = this.$uploadform.record;
        let param = {
            "manufacturer": record.manufacturer,
            "model": record.model ? $('#sbzygl-modal-upload-info .model-item .ane-select-selected').text() : "",
            "path": this.inputJson.path,
            "version": this.inputJson.version,
            "updateInfo": this.inputJson.updateInfo,
            "updateType": 0
        }
        avalon.each(record, function (key, value) {
            if (Array.isArray(value)) {
                param[key] = value[0];
            }
        });
        avalon.each(this.validJson, (key, value) => {
            if (((key == 'model' || key == 'manufacturer' || key == 'path' || key == 'version' || key == 'updateInfo') && !param[key]) || !value) {
                this.validJson[key] = false;
                pass = false;
            }
        });
        if (!pass) {
            return;
        }
        param.manufacturer = Number(param.manufacturer);
        // param.updateType = Number(param.updateType);

        //验证版本号是否存在
        let data = {
            "manufacturer": param.manufacturer,
            "model": param.model,
            "versions": [param.version]
        }
        let url = '/gmvcs/uom/package/checkPackageVersionIsExist';
        sbzygl.ajax(url, 'post', data).then(result => {
            if (result.code != 0) {
                sbzygl.showTips('error', result.msg);
                this.validJson.versionAccept = false;
                return;
            }
            if (result.data) {
                this.validJson.versionAccept = false;
                return;
            } else {
                this.validJson.versionAccept = true;
                uploader.setOption('multipart_params', {
                    "type": 3,
                    "manufacturer": param.manufacturer,
                    "manufacturerName": $('#sbzygl-modal-upload-info .manu-item .ane-select-selected').text(),
                    "model": param.model,
                    "version": this.inputJson.version,
                    "changeLog": this.inputJson.updateInfo,
                    "updateType": param.updateType
                });
                dialogUploadVm.show = true;
                dialogUploadVm.ifsuccess = false;
                dialogUploadVm.progress = 0;
                uploader.start();
                this.show = false;
                this.clear = !this.clear;
            }
        });
    },
    handleCancle() {
        this.clear = !this.clear;
        this.show = false;
    },
    fetchModelOptions() {
        let csid = String(this.$uploadform.record.manufacturer);
        if (!csid) {
            return;
        }
        let url = '/gmvcs/uom/device/workstation/getByCsid?csid=' + csid;
        sbzygl.ajax(url).then(result => {
            if (result.code != 0) {
                sbzygl.showTips('error', result.msg);
                this.modelOptions.clear();
                return;
            }
            //型号
            sbzygl.handleRemoteModel(result.data, (modelHasNullOptions, modelOptions) => {
                this.modelOptions.clear();
                this.modelOptions = modelOptions;
                this.defaultModel = modelOptions.length > 0 ? modelOptions[0].value : '';
            });
        })
    }
});
dialogModifyVm.$watch('clear', (v) => {
    dialogModifyVm.inputJson = {
        "path": "",
        "version": "",
        "updateInfo": ""
    }
    dialogModifyVm.showJson = {
        "version": false
    }
    dialogModifyVm.validJson = {
        "manufacturer": true,
        "model": true,
        "path": true,
        "pathUnique": true,
        "version": true,
        "versionAccept": true,
        "updateInfo": true,
    }
    dialogModifyVm.defaultManufacturer = "";
    dialogModifyVm.defaultModel = "";
    // dialogModifyVm.defaultUpdateType = "";
});

// ajax 请求数据
const lxxzrwAjax = {
    // 获取部门列表
    ajaxGetDep: function () {
        return ajax({
            url: '/api/tyywglpt-sjgl-dep',
            type: 'get'
        });
    },
    // 获取表格数据
    ajaxGetTableList: function (data) {
        return ajax({
            url: '/gmvcs/uom/bwc/package/updateBwcPackageInfoList',
            method: 'post',
            data: data
        });
    }
};

//将对象元素转换成字符串以作比较
function obj2key(obj, keys) {
    var n = keys.length,
        key = [];
    while (n--) {
        key.push(obj[keys[n]]);
    }
    return key.join('|');
}

//去重操作
function uniqeByKeys(array, keys) {
    var arr = [];
    var hash = {};
    for (var i = 0, j = array.length; i < j; i++) {
        var k = obj2key(array[i], keys);
        if (!(k in hash)) {
            hash[k] = true;
            arr.push(array[i]);
        }
    }
    return arr;
}

function autoSetPanelTop() {
    let $toobar = $('.tyywglpt-tool-bar-inner');
    //extraPix = $toobar的margin-bottom为8 + list-header的负margin-top为34 || 当too-bar里面的按钮都因为权限而隐藏时，则只需要list-header的负margin-top为34
    let extraPix = $toobar.outerHeight() > 0 ? 42 : 34;
    $('.tyywglpt-list-panel').css({
        'top': $toobar.offset().top + $toobar.outerHeight() + extraPix
    });
}

/* 采集工作站存储服务-分配采集工作站 */
function stationAssignAjax(gbCode) {
    let record = dialogIssueComfirmVm.record;
    return ajax({
        url: '/gmvcs/uom/bwc/package/issuePackageForWs',
        method: 'post',
        data: {
            "packageId": record.id,
            "version": record.version,
            "name": record.name,
            "type": record.type,
            "downloadUrl": record.downloadUrl,
            "size": record.size,
            "checkSum": record.checkSum,
            "manufacturerName": record.manufacturerName,
            "manufacturer": record.manufacturer,
            "model": record.model,
            "changeLog": record.changeLog,
            "isForced": dialogIssueComfirmVm.isForced ? 1 : 0,
            "issueTime": (new Date()).getTime(),
            "pageSize": 73444,
            "gbCode": gbCode
        }
    });
}

/* 根据所属机构获取分配的采集工作站列表 */
function getStationByOrgIdAjax(orgId) {
    return ajax({
        url: '/gmvcs/uom/device/workstation/basicInfos/' + orgId,
        method: 'get',
        cache: false
    })
}

/* 模糊搜索采集工作站 */
function searchStationAjax(searchKey) {
    return ajax({
        url: '/gmvcs/uom/device/workstation/getOrgPathByWsName?name=' + encodeURIComponent(searchKey),
        method: 'get',
        cache: false,
        data: null
    });
}

const dialogIssueComfirmVm = avalon.define({
    $id: 'sbzygl-issueComfirm-vm',
    show: false,
    searchAjax: searchStationAjax,
    orgData: [],
    checkedKeys: [],
    expandedKeys: [],
    searchInputValue: '',
    searchResults: [],
    orgId: '',
    selectedTitle: '',
    orgPath: '',
    treeObj: null,
    getResultItems: [],
    isInitSelect: true,
    record: null,
    parentsNodeOrgIds: [], //存储左边已经获取过下面子集的机构id集合
    isForced: false, // 是否勾选强制升级(0/false代表不强制;1/true强制)
    // checkResults: [],
    lblForcedBWCsUpgradeImg: "/static/image/sszhxt/check_unselected.png",
    // handleExportCheck() {
    //     this.isForced = !this.isForced;
    //     if (this.isForced) {
    //         this.lblForcedBWCsUpgradeImg = "/static/image/sszhxt/check_selected_bek_en.png";
    //     } else {
    //         this.lblForcedBWCsUpgradeImg = "/static/image/sszhxt/check_unselected.png";
    //     }
    // },
    handleOk() {
        let _this = this;
        let gbCode = [],
            orgArr = [];
        if (this.getResultItems.length > 0) { //有勾选部门树，且不是初始化的勾选全树
            avalon.each(this.getResultItems, (index, item) => {
                if (item.isParent) {
                    let obj = {
                        orgId: item.orgId,
                        orgPath: item.orgPath,
                    }
                    orgArr.push(obj);
                } else {
                    gbCode.push(item.gbCode);
                }
            });
        } else {
            if (this.isInitSelect) { //默认勾选全树的时候
                avalon.each(dialogIssueComfirmVm.orgData, (i, el) => {
                    let obj = {
                        orgId: el.orgId,
                        orgPath: el.orgPath,
                    }
                    orgArr.push(obj);
                });
            }
        }

        if (orgArr.length == 0 && gbCode.length == 0) {
            notification.warn({
                message: language_txt.xtywgl.zfywjscfw.selectWS,
                title: language_txt.xtpzgl.sjbgl.tips
            });
            return;
        }

        if (orgArr.length > 0) { //有勾选设备和部门的时候，需要查出gbCode才可以下发
            let state = false,
                sendTimer = null;
            avalon.each(orgArr, (i, item) => {
                ajax({
                    url: '/gmvcs/uom/device/workstation/list',
                    method: 'post',
                    data: {
                        "orgId": item.orgId,
                        "orgPath": item.orgPath,
                        "csId": null,
                        "moduleNum": null,
                        "includeChild": true,
                        "page": 0,
                        "pageSize": 999999
                    }
                }).then(result => {
                    if (result.data.wss && result.data.wss.length > 0) {
                        avalon.each(result.data.wss, (k, v) => {
                            gbCode.push(v.gbCode);
                            if (i + 1 == orgArr.length) {
                                state = true;
                            }
                        });
                    } else {
                        if (i + 1 == orgArr.length) {
                            state = true;
                        }
                    }
                });
            });
            clearTimeout(sendTimer);
            sendTimer = setInterval(() => { //设置定时器，目的是为了等上面的接口返回了gbcode再进行下发
                if (state) {
                    clearTimeout(sendTimer);
                    state = false;
                    if (gbCode.length == 0) {
                        notification.warn({
                            message: language_txt.xtywgl.zfywjscfw.noSW,
                            title: language_txt.xtpzgl.sjbgl.tips
                        });
                        return;
                    }
                    stationAssignAjax(gbCode).then((ret) => {
                        if (ret.code == 0) {
                            notification.success({
                                message: language_txt.xtywgl.zfywjscfw.successSend,
                                title: language_txt.xtpzgl.sjbgl.tips
                            });
                            _this.show = false;
                            _this.parentsNodeOrgIds = [];
                            // dialogIssueComfirmVm.checkedKeys = [];
                        } else {
                            vm.sayError(ret.msg);
                        }
                    });
                }
            }, 200);
        } else { //只有设备的时候，可以直接下发
            stationAssignAjax(gbCode).then((ret) => {
                if (ret.code == 0) {
                    notification.success({
                        message: language_txt.xtywgl.zfywjscfw.successSend,
                        title: language_txt.xtpzgl.sjbgl.tips
                    });
                    this.show = false;
                    this.parentsNodeOrgIds = [];
                    // dialogIssueComfirmVm.checkedKeys = [];
                } else {
                    vm.sayError(ret.msg);
                }
            });
        }
        // initCcfwglAssignData(this);
    },
    handleCancle() {
        // dialogIssueComfirmVm.checkedKeys = [];
        this.parentsNodeOrgIds = [];
        this.show = false;
    },
    handleBeforeExpand(treeId, treeNode) {
        if (!treeNode.children || treeNode.children.length == 0) {
            this.extraExpandHandle(treeId, treeNode);
        }
        let _this = this;
        let orgId = treeNode['key'];
        _this.getNodesByOrgId(orgId, treeNode, treeId);
    },
    getNodesByOrgId(orgId, treeNode, treeId) {
        let _this = this;
        if (_this.parentsNodeOrgIds.indexOf(orgId) == -1) {
            _this.parentsNodeOrgIds.push(orgId);
            getStationByOrgIdAjax(orgId).then((ret) => {
                if (ret.code == 0) {
                    let data2;
                    data2 = ret.data.tBasicInfos;
                    data2 = data2.map((item) => { //获取执法仪的接口orgName会有空的情况,直接从树上拿名称才能在右边展示
                        return {
                            key: item['rid'],
                            title: item['name'],
                            storageId: item['storageId'],
                            gbCode: item['gbcode'],
                            orgId: item['orgId'],
                            orgName: item['orgName'] || treeNode['title'],
                            rid: item['rid'],
                            name: item['name'],
                            active: false
                        };
                    });
                    if (!treeNode.children || treeNode.children.length == 0) getStationByOrgIdAjax(treeId, treeNode); //先把部门加进去,并且不重复添加
                    let addResultNodes = _this.treeObj.addNodes(treeNode, 0, data2);

                    for (var i = 0, l = treeNode.children.length; i < l; i++) {
                        _this.treeObj.checkNode(treeNode.children[i], true, true);
                    }

                    // _this.hasAddChildNodes.pushArray(addResultNodes);
                    _this.highlightNodes(_this.hasAddChildNodes, _this.searchResults);
                    //标记与搜索结果相同的节点高亮
                    let nodeList = _this.treeObj.getNodesByFilter(function (node) {
                        if ($.trim(_this.searchInputValue) == "") {
                            node = null;
                            return node;
                        }
                        return new RegExp(_this.searchInputValue).test(node.name);
                    }, false, treeNode);
                    for (var j = 0; j < nodeList.length; j++) {
                        var node = nodeList[j];
                        if (node) {
                            node.highlight = true;
                            _this.treeObj.updateNode(node);
                        }
                    }
                } else {
                    vm.sayError(language_txt.xtywgl.cjzscfwgl.errorInObtainingTheCollectionStationAccordingToTheInstitutionIdErrorCode + ret.code);
                }
            });
        }
    },
    highlightNodes(hasAddChildNodes, searchNodes) {
        let _this = this;
        avalon.each(searchNodes, function (key, val) {
            avalon.each(hasAddChildNodes, function (index, value) {
                if (val['rid'] == value['key']) {
                    value.highlight = true;
                    _this.treeObj.updateNode(value);
                    if (_this.hasPosFlag == false) {
                        _this.posFirstHighlightNode();
                        _this.hasPosFlag = true;
                    }
                }
            });
        });
    },
    handleCheck(checkedKeys, e) {
        let _this = this;
        this.getResultItems = e.checkedNodes;
        this.isInitSelect = false;
        // this.checkedKeys = checkedKeys;
        // var nodes = this.treeObj.getCheckedNodes(true);
        // _this.checkResults = [];
        // for (var i = 0; i < nodes.length; i++) {
        //     if (!nodes[i].isParent) {
        //         _this.checkResults.push(nodes[i].key);
        //     }
        // }
    },
    onSelect(e, targetObj) {
        let _this = this;
        let node = targetObj['node'];
        if (/org/g.test(node['icon'])) { //单击父节点获取采集站
            let $ztree = $('#ccfwglassign .ztree');
            let treeId = $ztree.attr('id');
            _this.getNodesByOrgId(node['key'], node, treeId);
            _this.extraExpandHandle(treeId, node);
        } else { //单击采集站分配,支持ctrl多选
            // clearTimeout(_this.singleNodeClickTimer);
            // _this.singleNodeClickTimer = setTimeout(function () {
            //     if (targetObj.event.ctrlKey == true) {
            //         let matchIndex = _this.getMatchIndex(_this.curClickSelectNodes, 'rid', node['key']);
            //         if (matchIndex != -1) {
            //             _this.curClickSelectNodes.splice(matchIndex, 1);
            //             if (_this.curClickSelectNodes.length > 0) {
            //                 _this.rightDisabled = false;
            //             } else {
            //                 _this.rightDisabled = true;
            //             }
            //         } else {
            //             _this.curClickSelectNodes.push(node);
            //             _this.rightDisabled = false;
            //         }
            //     } else {
            //         _this.curClickSelectNodes = []; //清空是为了多选之后再单击，就只能选中一个
            //         _this.curClickSelectNodes.push(node);
            //         _this.rightDisabled = false;
            //     }
            // }, 250);
        }
        // avalon.each(_this.resultsGroup, function (key, val) {
        //     avalon.each(val.children, function (i, v) {
        //         v['active'] = false;
        //     })
        // });
    },
    handleSearchClick() {
        if ($.trim(this.searchInputValue) == "") return;
        let _this = this;
        _this.delightNodes();
        _this.hasPosFlag = false;
        _this.searchAjax(_this.searchInputValue).then((ret) => {
            if (ret.data.length <= 0) {
                vm.sayError(languageSelect == "en" ? "No Result" : "暂无数据");
                return;
            }
            //切割orgpath
            avalon.each(ret.data, function (index, value) {
                let temp = value.split('/');
                temp.splice(0, 1);
                avalon.each(temp, function (key, item) {
                    var nodes = _this.treeObj.getNodesByFilter(function (node) {
                        return (node.orgCode == item || node.orgId == item);
                    });
                    _this.treeObj.expandNode(nodes[0], true, false, true, true);
                })
            })
            //标记与搜索结果相同的节点高亮
            let nodeList = _this.treeObj.getNodesByFilter(function (node) {
                if ($.trim(_this.searchInputValue) == "") {
                    node = null;
                    return node;
                }
                // return new RegExp(_this.searchInputValue).test(node.usercode) || new RegExp(_this.searchInputValue).test(node.username) || new RegExp(_this.searchInputValue).test(node.name);
                return !node.isParent && new RegExp(_this.searchInputValue).test(node.name);
            }, false);
            for (var j = 0; j < nodeList.length; j++) {
                var node = nodeList[j];
                if (node) {
                    node.highlight = true;
                    _this.treeObj.updateNode(node);
                }
            }
        })
    },
    delightNodes() {
        let _this = this;
        let nodelist = _this.treeObj.getNodesByFilter(function (node) {
            return node.highlight == true;
        })
        avalon.each(nodelist, function (key, val) {
            val.highlight = false;
            _this.treeObj.updateNode(val);
        });

    },
    handleSearchEnter(e) {
        if (e.keyCode == 13 && ($.trim(this.searchInputValue) != "")) {
            this.handleSearchClick();
            return false; //阻止ie8弹框中的确定，取消按钮事件
        }
    },
    getTree() {
        const self = this;
        //所属机构下拉请求
        getOrgAll().then((ret) => {
            if (ret.code == 0) {
                dialogIssueComfirmVm.getResultItems = [];
                let data = changeTreeData(ret.data);
                dialogIssueComfirmVm.orgData = data;
                dialogIssueComfirmVm.orgId = data[0].orgId;
                dialogIssueComfirmVm.orgPath = data[0].path;
                // dialogIssueComfirmVm.checkedKeys = [data[0].orgId];
                dialogIssueComfirmVm.treeObj.checkAllNodes(true);
                dialogIssueComfirmVm.isInitSelect = true;
            } else {
                vm.sayError('Fail!');
            }
        });
    },
    addIcon(arr) {
        const self = this;
        // 深拷贝原始数据
        let dataSource = JSON.parse(JSON.stringify(arr))
        let res = [];
        // 每一层的数据都 push 进 res
        res.push(...dataSource);
        // res 动态增加长度
        for (let i = 0; i < res.length; i++) {
            let curData = res[i];
            curData.icon = icon_dep;
            curData.key = curData.orgId;
            curData.title = curData.orgName;
            curData.isParent = true;
            curData.name = curData.orgName;
            curData.open = false;
            //bmglMan.list_tree.expandedKeys.push(curData.orgId);
            curData.children = curData.childs;
            // null数据置空
            curData.orderNo = curData.orderNo == null ? '' : curData.orderNo;
            curData.dutyRange = curData.dutyRange == null ? '' : curData.dutyRange;
            curData.extend = curData.extend == null ? '' : curData.extend;
            // 如果有 children 则 push 进 res 中待搜索
            if (curData.childs) {
                if (curData.childs.length > 1) {
                    curData.childs.sort(function (a, b) {
                        if (Number(a.orderNo) > Number(b.orderNo)) {
                            return 1;
                        } else if (Number(a.orderNo) < Number(b.orderNo)) {
                            return -1;
                        } else {
                            return a.orgName.localeCompare(b.orgName, 'zh');
                        }
                    });
                }
                res.push(...curData.childs.map(d => {
                    return d;
                }))
            }
        }
        return dataSource;
    },
    extraExpandHandle(treeId, treeNode) {
        let _this = this;
        if (treeNode.hasExpand)
            return;
        //执行用户自定义操作       
        // 分级获取部门   
        ajax({
            url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.orgId + '&checkType=' + treeNode.checkType,
            method: 'get',
            data: null,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                if (ret.data) {
                    _this.treeObj.removeChildNodes(treeNode);
                    _this.treeObj.addNodes(treeNode, this.addIcon(ret.data));
                    treeNode.hasExpand = true;

                    for (var i = 0, l = treeNode.children.length; i < l; i++) {
                        _this.treeObj.checkNode(treeNode.children[i], true, true);
                    }

                    // _this.treeObj = null;
                } else {
                    vm.sayError(cjzscfwgl_language.demandForSubBranchDataFailed);
                }
            } else {
                vm.sayError(cjzscfwgl_language.demandForSubBranchDataFailed);
            }
        });
    },
})

/* 接口 */
/* 获取所属机构 */
function getOrgAll() {
    return ajax({
        url: '/gmvcs/uap/org/find/fakeroot/mgr',
        method: 'get',
        cache: false
    });
}

//将数据转换为key,title,children属性
function changeTreeData(treeData) {
    var i = 0,
        len = treeData.length,
        picture = '/static/image/tyywglpt/org.png';
    for (; i < len; i++) {
        treeData[i].icon = picture;
        treeData[i].key = treeData[i].orgId;
        treeData[i].title = treeData[i].orgName;
        treeData[i].path = treeData[i].path;
        treeData[i].children = treeData[i].childs;
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