/**
 * 统一运维管理平台--设备资源管理--执法仪管理
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
export const name = 'tyywglpt-sbxhgl-cjzxhgl';
require('../common/common-tyywglpt.css');
require('../common/common-sbzygl.css');
let vm = null,
    sbzygl = null,
    enableQuery = true,
    queryTimer = null;
const listHeaderName = name + "-list-header";
//页面组件
avalon.component(name, {
    template: __inline('./tyywglpt-sbxhgl-cjzxhgl.html'),
    defaults: {
        $form: createForm(),
        loading: true,
        isNull: false,
        list: [],
        total: 0,
        current: 1,
        pageSize: 20,
        selectedRowsLength: 0,
        selectedRowsData: [],
        checkAll: false,
        manufacturerOptions: [],
        modelOptions: [],
        modelName: "",
        manufacturerOk: false,
        modelOk: false,
        isFirstFetch: true,
        isManuSelectMode: false,
        hasFetchManu: false,
        dataStr: "",
        checkedData: [],
        dataJson: {},
        titleTimer: "", //popover用的的定时器，代码在common-sbzygl.js
        authority: { // 按钮权限标识
            "SEARCH": false, //设备资源管理_设备型号管理_采集站管理_查询
            "CREATE": false, // 设备资源管理_设备型号管理_采集站管理_新增
            "EDIT": false, // 设备资源管理_设备型号管理_采集站管理_编辑
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
                    if (/^UOM_FUNCTION_SBZYGL_SBXHGL_CJGZZ_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                if (func_list.length == 0)
                    return;
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_SBZYGL_SBXHGL_CJGZZ_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_SBXHGL_CJGZZ_CREATE":
                            _this.authority.CREATE = true;
                            break;
                        case "UOM_FUNCTION_SBZYGL_SBXHGL_CJGZZ_EDIT":
                            _this.authority.EDIT = true;
                            break;
                    }
                });
                sbzygl.autoSetListPanelTop();
            });
            sbzygl.autoSetListPanelTop();
            this.$watch('dataJson', (v) => {
                if (v) {
                    this.modelName = v.dsjCode;
                    this.current = v.page + 1;
                }
            })
        },
        onReady() {
            this.dataStr = storage.getItem(name);
            this.dataJson = this.dataStr ? JSON.parse(this.dataStr) : null;
            //表头宽度设置
            sbzygl.setListHeader(listHeaderName);
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
        handleAdd() {
            if (this.selectedRowsLength !== 0)
                return;
            dialogAddVm.show = true;
        },
        handleEdit() {
            if (this.selectedRowsLength !== 1)
                return;
            let selectedRowsData = [this.selectedRowsData];
            selectedRowsData[0].status = String(selectedRowsData[0].status);
            dialogEditVm.selectedRowsData = selectedRowsData;
            dialogEditVm.inputJson = {
                "workstationCode": selectedRowsData[0].workstationCode || '',
                "disOrder": selectedRowsData[0].disOrder || '',
                "manufacturer": String(selectedRowsData[0].manufacturer) == "null" ? '' : String(selectedRowsData[0].manufacturer),
                "manufacturerName": String(selectedRowsData[0].manufacturerName || ''),
            }
            dialogEditVm.show = true;
        },
        getCurrent(current) {
            this.current = current;
        },
        //全选列表
        handleCheckAll(e) {
            sbzygl.handleCheckAll(e)
        },
        //勾选列表
        handleCheck(index, record, e) {
            sbzygl.handleCheck(index, record, e, (hasChecked, record) => {
                if (record.checked) {
                    this.selectedRowsData = JSON.parse(JSON.stringify(record));
                }
            });
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
        fetchList() {
            $('div.popover').remove();
            let data = {
                "manufacturer": this.$form.record.manufacturer,
                "workstationCode": this.modelName == "" ? null : this.modelName,
                "status": this.$form.record.status
            };
            let url = '/gmvcs/uom/device/workstation/deviceworkstation/search?page=' + (this.current - 1) + '&pageSize=' + this.pageSize;
            this.loading = true;
            data.manufacturer = (data.manufacturer == "null" || !data.manufacturer) ? null : Number(data.manufacturer);
            data.status = (data.status == "null" || data.status == "") ? null : Number(data.status);
            this.checkAll = false;
            this.selectedRowsLength = 0;
            let storageData = JSON.parse(JSON.stringify(data));
            storageData.page = this.current - 1;
            storageData.manufacturer = storageData.manufacturer == null ? "null" : String(storageData.manufacturer);
            storageData.modelId = this.$form.record.model ? String(this.$form.record.model) : "null";
            storageData.status = (storageData.status == null) ? "null" : String(storageData.status);
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
                    el.createdTimeFormat = moment(el.createdTime).format("YYYY-MM-DD HH:mm:ss");
                    el.statusName = el.status == 1 ? '正常' : '废弃';
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
                    dialogAddVm.manufacturerOptions = manuOptions;
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
})

//添加弹窗vm定义
const dialogAddVm = avalon.define({
    $id: 'cjzxhgl-add-vm',
    show: false,
    $form: createForm(),
    manufacturerOptions: [],
    manuReg: /^[a-zA-Z\u4e00-\u9fa5]{1,32}$/,
    modelReg: /^[a-zA-Z0-9\u4e00-\u9fa5-]{1,32}$/,
    orderReg: /^[1-9]{1}[0-9]{0,8}$/,
    lengthReg: /^\s{0}/, //仅限制长度的非必填项
    clear: false, //用来促使弹框里的input框清空
    inputJson: {
        "manufacturer": "",
        "manufacturerName": "",
        "workstationCode": "",
        "disOrder": ""
    },
    validJson: {
        "workstationCode": true,
        "disOrder": true,
        "manufacturerName": true
    },
    showJson: {
        "workstationCode": false,
        "disOrder": false,
        "manufacturerName": false
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
    handleManuFocus(event) {
        sbzygl.handleFocus(event, 'manufacturerName', this);
    },
    handleManuFormat(event) {
        sbzygl.handleFormat(event, 'manufacturerName', this, this.manuReg, null);
    },
    getSearchLabel(label) {
        this.inputJson.manufacturerName = label;
    },
    getSelected(label, value) {
        this.inputJson.manufacturerName = label;
        this.inputJson.manufacturer = value;
    },
    handleCancel(e) {
        this.clear = !this.clear;
        this.show = false;
    },
    handleOk() {
        let url = '/gmvcs/uom/device/workstation/deviceworkstation/saveorupdate';
        addOrEdit(url, dialogAddVm, '添加成功')
    },
});
dialogAddVm.$watch('clear', (v) => {
    dialogAddVm.inputJson = {
        "manufacturer": "",
        "manufacturerName": "",
        "workstationCode": "",
        "disOrder": "",
    }
    dialogAddVm.validJson = {
        "workstationCode": true,
        "disOrder": true,
        "manufacturerName": true
    }
    dialogAddVm.showJson = {
        "workstationCode": false,
        "disOrder": false,
        "manufacturerName": false
    }
})


//编辑弹窗vm定义
const dialogEditVm = avalon.define({
    $id: 'cjzxhgl-edit-vm',
    show: false,
    $form: createForm(),
    selectedRowsData: [],
    modelReg: /^[a-zA-Z0-9\u4e00-\u9fa5-]{1,32}$/,
    orderReg: /^[1-9]{1}[0-9]{0,8}$/,
    lengthReg: /^\s{0}/, //仅限制长度的非必填项
    clear: false, //用来促使弹框里的input框清空
    inputJson: {
        "workstationCode": "",
        "disOrder": "",
        "manufacturer": "",
        "manufacturerName": ""
    },
    validJson: {
        "workstationCode": true,
        "disOrder": true,
        "status": true,
        "manufacturer": true,
    },
    showJson: {
        "disOrder": false
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
        let url = '/gmvcs/uom/device/workstation/deviceworkstation/saveorupdate';
        addOrEdit(url, dialogEditVm, '编辑成功', this.selectedRowsData[0])
    }
});
dialogEditVm.$watch('clear', (v) => {
    dialogEditVm.inputJson = {
        "workstationCode": "",
        "disOrder": "",
        "manufacturer": "",
        "manufacturerName": ""
    }
    dialogEditVm.validJson = {
        "workstationCode": true,
        "disOrder": true,
        "status": true,
        "manufacturer": true,
    }
    dialogEditVm.showJson = {
        "disOrder": false
    }
    //直接设成[]，下拉框选了之后会一直保持选择的值
    dialogEditVm.selectedRowsData = [''];
})


/**
 * 发送添加或编辑请求
 * @param {string} url 添加或编辑的请求地址
 * @param {vm} dialogVm 添加或编辑弹窗的vm
 * @param {string} successMsg 请求成功后的提示消息
 */
function addOrEdit(url, dialogVm, successMsg, selectedRowsData) {
    let record = JSON.parse(JSON.stringify(dialogVm.$form.record));
    let inputJson = sbzygl.trimData(dialogVm.inputJson);
    let pass = true;
    //这么写是为了兼容ie8
    let param = {
        "workstationCode": inputJson.workstationCode,
        "disOrder": Number(inputJson.disOrder)
    };
    if (dialogVm == dialogAddVm) {
        if (inputJson.manufacturer) {
            param.manufacturer = inputJson.manufacturer;
        } else {
            param.manufacturerName = inputJson.manufacturerName;
        }
    }
    if (dialogVm == dialogEditVm) {
        param.manufacturer = inputJson.manufacturer;
        param.status = record.status;
        param.id = selectedRowsData.id;
        param.createdTime = new Date(selectedRowsData.createdTime);
        param.creatorCode = selectedRowsData.creatorCode;
        param.updateTime = new Date();
    }
    avalon.each(record, function (key, value) {
        if (Array.isArray(value)) {
            param[key] = value[0];
        }
    });
    if (dialogVm == dialogEditVm) {
        param.status = param.status === "" ? null : param.status;
    }
    //------------表单验证开始----------------------------------------------------------
    avalon.each(dialogVm.validJson, (key, value) => {
        if (((!inputJson.manufacturerName && key == 'manufacturerName') || (key == 'manufacturer' || key == 'disOrder' || key == 'workstationCode' || key == 'status') && !param[key]) || !value) {
            dialogVm.validJson[key] = false;
            pass = false;
        }
    });
    if (!pass) {
        return;
    }
    if (param.manufacturer) {
        param.manufacturer = Number(param.manufacturer);
    }
    if (dialogVm == dialogEditVm) {
        param.status = Number(param.status);
    }
    //------------表单验证结束----------------------------------------------------------
    sbzygl.ajax(url, 'post', param).then(result => {
        if (result.code !== 0) {
            sbzygl.showTips('error', result.msg);
            return;
        }
        dialogVm.show = false;
        sbzygl.showTips('success', successMsg);
        dialogVm.clear = !dialogVm.clear;
        if (dialogVm == dialogAddVm) {
            vm.current = 1;
            //重新载入页面（因为可能新增了厂商或型号，如果不重新载入在搜索栏中看不到这个新增的厂商或型号）
            avalon.router.navigate('/tyywglpt-sbxhgl-cjzxhgl');
        }
        vm.fetchList();
    })
}