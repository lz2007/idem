/**
 * 统一运维管理平台--升级管理--升级包管理
 *caojiacong
 */
import avalon from 'avalon2';
import ajax from '../../services/ajaxService';
import moment from 'moment';
import './tyywglpt-sjgl-sjbgl.css';
import '../../apps/common/common-progress';
import '../../apps/common/common-pages';
import {
    apiUrl
} from '../../services/configService';
import Sbzygl from '../common/common-sbzygl';
import * as menuServer from '../../services/menuService';
const storage = require('../../services/storageService.js').ret;
import {
    createForm,
    notification
} from 'ane';
export const name = 'tyywglpt-sjbgl-zfysjbgl';
import '../../apps/common/common-ms-modal';

import {
    ret
} from '../../services/storageService';
const plupload = require('../../vendor/plupload/plupload.full.min.js');

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
    template: __inline('./tyywglpt-sjbgl-zfysjbgl.html'),
    defaults: {
        dataStr: "",
        dataJson: {},
        type: null,
        authority: { // 按钮权限标识
            "DELETE": false, //升级管理_升级包管理_删除
            "SEARCH": false, //升级管理_升级包管理_查询
            "UPLOAD": false, //升级管理_升级包管理_上传升级包
            "CHECK": false //升级管理_升级包管理_查看
        },
        titleTimer: "", //popover用的的定时器，代码在common-sbzygl.js
        manufacturerOptions: [],
        modelOptions: [],
        manufacturerOk: false,
        modelOk: false,
        modelName: "",
        isFirstFetch: true, //是否为第一次获取搜索栏中的型号
        isManuSelectMode: false, //是否为厂商改变导致的类型/型号获取
        hasFetchManu: false, //是否已经获取厂商字典
        $searchForm: createForm(),
        // 查询
        loading: true,
        isNull: false,
        // 表格数据
        tableData: [],
        // 获取表格数据
        searchName: '',
        startTime: moment().subtract(3, 'months').format('YYYY-MM-DD'),
        endTime: moment().format('YYYY-MM-DD'),
        checkeds: false,
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
                    if (/^UOM_FUNCTION_YCSJGL_SJBGL_ZFJLY_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0)
                    return;
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_YCSJGL_SJBGL_ZFJLY_DELETE":
                            _this.authority.DELETE = true;
                            break;
                        case "UOM_FUNCTION_YCSJGL_SJBGL_ZFJLY_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                        case "UOM_FUNCTION_YCSJGL_SJBGL_ZFJLY_SCSJB":
                            _this.authority.UPLOAD = true;
                            break;
                        case "UOM_FUNCTION_YCSJGL_SJBGL_ZFJLY_CHECK":
                            _this.authority.CHECK = true;
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
            //表头宽度设置
            sbzygl.setListHeader(listHeaderName);
            this.fetchUpdateTypeOptions();
            let timer = setInterval(() => {
                //等到this.$searchForm.record不为{}，而有具体内容时再fetchManuModelOptions，否则ie8下有问题
                if (!this.hasFetchManu) {
                    let recordStr = JSON.stringify(this.$searchForm.record);
                    let length = recordStr.match(/:/g) ? recordStr.match(/:/g).length : 0;
                    length && this.fetchManuModelOptions();
                }
                if (vm.manufacturerOk && vm.modelOk) {
                    vm.fetchList();
                    clearInterval(timer);
                }
            }, 100);
            uploader = new plupload.Uploader({
                runtimes: 'html5,flash',
                browse_button: 'fileupload', //触发文件选择对话框的按钮，为那个元素id
                url: "http://" + window.location.host + apiUrl + '/gmvcs/uom/package/uploadUpdatePackageNew', //服务器端的上传页面地址
                flash_swf_url: '/static/vendor/plupload/Moxie.swf', //swf文件，当需要使用swf方式进行上传时需要配置该参数
                filters: {
                    max_file_size: '1gb',
                    mime_types: [{
                        title: "Zip files",
                        extensions: "zip"
                    }]
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
                        dialogUpdateInfoVm.validJson.path = true;
                        dialogUpdateInfoVm.validJson.pathUnique = true;
                        //清除队列
                        for (let i = 0; i < uploader.files.length - 1; i++) {
                            uploader.removeFile(uploader.files[i]);
                        }
                        let promise = new Promise(function (resolve, reject) {
                            let tableListData = {
                                type: 1,
                                manufacturer: -1,
                                model: "",
                                startTime: null,
                                endTime: null,
                                page: 0,
                                pageSize: 99999
                            };
                            lxxzrwAjax.ajaxGetTableList(tableListData).done(ret => {
                                if (ret.code == 0) {
                                    avalon.each(ret.data.currentElements, (index, item) => {
                                        if (item.name == file.name) {
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
                                message: '上传失败，已存在最新版本的升级包',
                                title: '通知'
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
                                title: '通知'
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
                                message: "仅支持上传zip压缩文件",
                                title: '通知'
                            });
                        } else if (code === -600) {
                            notification.warn({
                                message: "上传的文件大小不能超过1GB",
                                title: '通知'
                            });
                        } else {
                            notification.error({
                                message: "上传出错，请重新上传",
                                title: '通知'
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
            if (String(record.manufacturer) == "null" || !record.manufacturer) {
                dialogUpdateInfoVm.defaultManufacturer = dialogUpdateInfoVm.manufacturerOptions.length > 0 ? dialogUpdateInfoVm.manufacturerOptions[0].value : "";
            } else {
                dialogUpdateInfoVm.defaultManufacturer = String(record.manufacturer);
            }
            dialogUpdateInfoVm.defaultUpdateType = dialogUpdateInfoVm.updateTypeOptions.length > 0 ? dialogUpdateInfoVm.updateTypeOptions[0].value : "";
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
            return modelOptions.length > 0 ? (isManuSelectMode ? modelOptions[0].value : (dataJson ? dataJson.modelId : modelOptions[0].value)) : '';
        },
        handleLook(record) {
            dialogLookVm.show = true;
            dialogLookVm.updateContent = record.changeLog.replace(/(\r\n)|(\n)/g, '<br>');
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
        },
        handleEndTimeChange(e) {
            this.endTime = e.target.value;
        },
        //获取升级类型下拉框数据
        fetchUpdateTypeOptions() {
            let url = '/gmvcs/uom/package/getUpdateTypes';
            sbzygl.ajax(url, 'post', null).then((result) => {
                if (result.code != 0) {
                    sbzygl.showTips('error', result.msg);
                    dialogUpdateInfoVm.updateTypeOptions.clear();
                    return;
                } else if (!result.data || !result.data.length) {
                    dialogUpdateInfoVm.updateTypeOptions.clear();
                    return;
                }
                let options = [];
                avalon.each(result.data, function (index, el) {
                    let items = {
                        "label": el.description,
                        "value": String(el.id)
                    };
                    options.push(items);
                });
                dialogUpdateInfoVm.updateTypeOptions = options;
            })
        },
        fetchManuModelOptions() {
            this.hasFetchManu = true;
            let url = '/gmvcs/uom/device/dsj/device/dsj/type/cascade/unfiltered';
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
                    dsjCode
                } = result.data;
                //厂商
                sbzygl.handleRemoteManu(manufacturer, (manuHasNullOptions, manuOptions) => {
                    this.manufacturerOptions = manuHasNullOptions;
                    dialogUpdateInfoVm.manufacturerOptions = manuOptions;
                    dialogUpdateInfoVm.defaultManufacturer = manuOptions.length > 0 ? manuOptions[0].value : '';
                    this.manufacturerOk = true;
                });
            }).fail(() => {
                this.manufacturerOk = true;
                this.modelOk = true;
            });
        },
        fetchManuToModel() {
            let manufacturer = String(this.$searchForm.record.manufacturer);
            let url = '/gmvcs/uom/device/dsj/device/dsj/type/cascade/unfiltered';
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
        fetchList() {
            $('div.popover').remove();
            this.$searchForm.validateFields().then(isAllValid => {
                if (isAllValid) {
                    let data = {
                        type: 1,
                        manufacturer: String(this.$searchForm.record.manufacturer),
                        model: this.modelName === "-" ? "" : this.modelName,
                        page: this.current - 1,
                        pageSize: this.pageSize
                    };
                    data.startTime = this.startTime ? moment(this.startTime).format('X') * 1 : null;
                    data.endTime = this.endTime ? moment(this.endTime).add(1, 'days').subtract(1, 'seconds').format('X') * 1 : null;
                    if (!data.startTime && !data.endTime) {
                        notification.warn({
                            title: '通知',
                            message: '请选择上传时间！'
                        });
                        return;
                    }
                    if (!data.startTime && data.endTime) {
                        notification.warn({
                            message: '请选择开始时间！',
                            title: '通知'
                        });
                        return;
                    }
                    if (data.startTime && !data.endTime) {
                        notification.warn({
                            message: '请选择结束时间！',
                            title: '通知'
                        });
                        return;
                    }
                    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
                        notification.warn({
                            message: '开始时间不能大于结束时间！',
                            title: '通知'
                        });
                        return;
                    }
                    data.manufacturer = (data.manufacturer == "null" || data.manufacturer == "") ? -1 : Number(data.manufacturer);
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
                                title: '通知'
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
                            item.size = item.size.toFixed(2);
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
        handleDeleteClick() {
            if (!this.delDate.length) {
                return false;
            } else {
                this.delNums = this.delDate.length;
                dialogDeleteVm.show = true;
            }
        },
    }
});


//上传前弹窗vm定义
const dialogUpdateInfoVm = avalon.define({
    $id: 'zfysjbgl-upload-info-vm',
    $uploadform: createForm(),
    show: false,
    manufacturerOptions: [],
    modelOptions: [],
    updateTypeOptions: [],
    defaultManufacturer: "",
    defaultModel: "",
    defaultUpdateType: "",
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
        "updateType": true
    },
    showJson: {
        "version": false
    },
    versionReg: /^[a-zA-Z0-9-\._]+$/,
    updateInfoReg: /(.|\n)+/,
    clear: false, //用来促使弹框里的input框清空
    handleFocus(name, event) {
        sbzygl.handleFocus(event, name, this);
        if (name == "version") {
            this.validJson.versionAccept = true;
        }
    },
    handleFormat(name, reg, length, event) {
        sbzygl.handleFormat(event, name, this, reg, length);
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
            "model": record.model ? $('#zfysjbgl-modal-upload-info .model-item .ane-select-selected').text() : "",
            "path": this.inputJson.path,
            "version": this.inputJson.version,
            "updateInfo": this.inputJson.updateInfo,
            "updateType": record.updateType,
        }
        avalon.each(record, function (key, value) {
            if (Array.isArray(value)) {
                param[key] = value[0];
            }
        });
        avalon.each(this.validJson, (key, value) => {
            if (((key == 'model' || key == 'manufacturer' || key == 'path' || key == 'version' || key == 'updateInfo' || key == 'updateType') && !param[key]) || !value) {
                this.validJson[key] = false;
                pass = false;
            }
        });
        if (!pass) {
            return;
        }
        param.manufacturer = Number(param.manufacturer);
        param.updateType = Number(param.updateType);

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
                //开始上传升级包
                uploader.setOption('multipart_params', {
                    "type": 1,
                    "manufacturer": param.manufacturer,
                    "manufacturerName": $('#zfysjbgl-modal-upload-info .manu-item .ane-select-selected').text(),
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
        let dsjManufacturerId = String(this.$uploadform.record.manufacturer);
        if (!dsjManufacturerId) {
            return;
        }
        let url = '/gmvcs/uom/device/dsj/model/manufacturerId?dsjManufacturerId=' + dsjManufacturerId;
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
                this.defaultModel = modelOptions.length > 0 ? modelOptions[0].value : '';;
            });
        })
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
        "updateType": true
    }
    dialogUpdateInfoVm.defaultManufacturer = "";
    dialogUpdateInfoVm.defaultModel = "";
    dialogUpdateInfoVm.defaultUpdateType = "";
});

//上传弹窗vm定义
const dialogUploadVm = avalon.define({
    $id: 'zfysjbgl-upload-vm',
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
            message: "已取消上传",
            title: '通知'
        });
    },
});

//删除弹窗vm定义
const dialogDeleteVm = avalon.define({
    $id: 'zfysjbgl-delete-vm',
    show: false,
    // 删除弹窗确定操作
    handleOk() {
        if (!vm.delDate.length) {
            notification.warn({
                message: '请选择升级包',
                title: '通知'
            });
            return false;
        }
        ajax({
            url: '/gmvcs/uom/package/removingUpdatePackageList',
            method: 'post',
            data: vm.delDate
        }).done((data) => {
            if (data.code == 0) {
                notification.success({
                    message: '删除成功',
                    title: '通知'
                });
                if (vm.checkeds && vm.current > 1) {
                    vm.current = vm.current - 1;
                }
                vm.fetchList();
                vm.cancelCheckedAll();
            } else {
                notification.error({
                    message: data.msg,
                    title: '通知'
                });
            }
        }).fail(err => {
            notification.error({
                message: '删除失败',
                title: '通知'
            });
        });
        this.show = false;
    },
    // 删除弹窗取消操作
    handleCancel() {
        this.show = false;
    },
});

//查看弹窗vm定义
const dialogLookVm = avalon.define({
    $id: 'zfysjbgl-look-vm',
    show: false,
    updateContent: "",
    handleOk() {
        this.show = false;
    }
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
            url: '/gmvcs/uom/package/updatePackageInfoList',
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