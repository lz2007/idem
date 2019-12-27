import avalon from 'avalon2';
import ajax from '../../services/ajaxService';
import Sbzygl from '../common/common-sbzygl';
import '../common/common-tyywglpt.css';
import '../common/common-ms-table/common-ms-table';

import {
    createForm,
    message,
    notification
} from 'ane';

let sbzygl = null;
let vm = null;
export const name = 'tyywglpt-ptjlgl-slwgl';

//页面组件
avalon.component(name, {
    template: __inline('./tyywglpt-ptjlgl-slwgl.html'),
    defaults: {
        loading: false,
        // 表格
        list: [],
        // 表格-操作回调
        actions(type, text, record, index) {
            if (type == 'delete') {
                this.list.removeAll(el => el.id == record.id);
                message.success({
                    content: '删除成功'
                });
            }
        },
        // 表格-选择回调
        selectChange(type, data) {
            for (let i = 0; i < this.list.length; i++) {
                if (this.list[i].checked) {
                    this.selectedRowsLength = 1;
                    break;
                } else {
                    this.selectedRowsLength = 0;
                }
            }
            console.log(type)
            console.log(data)
            console.log(this.list)
        },

        // 分页
        pagination: {
            total: 100,
            pageSize: 20,
            current: 1
        },
        getCurrent(current) {
            console.log(current)
        },
        onReady() {
            sbzygl = new Sbzygl(this);
            vm = this;
            fetchList();
            fetchDownData('LEVAM_UOM_PLATFORM_TYPE', 'typeOptions', 'defaultType');
            fetchDownData('LEVAM_UOM_PLATFORM_MAN', 'manuOptions', 'defaultManu');
            fetchDownData('LEVAM_UOM_PLATFORM_PROTOCOL', 'protocolOptions', 'defaultProtocol');
        },

        // 按钮
        selectedRowsLength: 0,
        // 新增
        handleAdd() {
            if (this.selectedRowsLength !== 0) {
                return;
            }
            dialogAddVm.defaultType = dialogAddVm.typeOptions.length > 0 ? dialogAddVm.typeOptions[0].value : "";
            dialogAddVm.defaultManu = dialogAddVm.manuOptions.length > 0 ? dialogAddVm.manuOptions[0].value : "";
            dialogAddVm.defaultProtocol = dialogAddVm.protocolOptions.length > 0 ? dialogAddVm.protocolOptions[0].value : "";
            createPlatformId();
            dialogAddVm.show = true;
        },

        // 修改
        handleModify() {
            if (this.selectedRowsLength !== 1) {
                return;
            }
            let selectedData = this.checkedData[0];
            dialogModifyVm.inputJson = {
                "name": selectedData.name,
                "id": selectedData.id,
                "ip": selectedData.ip,
                "port": selectedData.port,
                "version": selectedData.version,
                "description": selectedData.description
            }
            dialogModifyVm.defaultType = selectedData.type;
            dialogModifyVm.defaultManu = selectedData.manufacturer;
            dialogModifyVm.defaultProtocol = selectedData.protocol;
            dialogModifyVm.unMatchJson = {
                "type": selectedData.type,
                "manu": selectedData.manufacturer,
                "protocol": selectedData.protocol
            }
            dialogModifyVm.show = true;
        },

        // 删除
        handleDelete() {
            if (this.selectedRowsLength < 1) {
                return;
            }
            let deviceRidArr = [];
            avalon.each(this.checkedData, (index, el) => {
                deviceRidArr.push(el.rid);
            })
            dialogDelVm.deviceRids = deviceRidArr.join(',');
            dialogDelVm.show = true;
        },

        // 视图
        handleView() {

        }
    }
});

//删除弹窗vm定义
const dialogDelVm = avalon.define({
    $id: 'ptjlgl-delete-vm',
    show: false,
    deviceRids: [],
    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        let url = '/gmvcs/uom/platform/delete/' + this.deviceRids;
        sbzygl.ajax(url, 'post', null).then(result => {
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
            fetchList();
        })
    }
});

//添加弹窗vm定义
const dialogAddVm = avalon.define({
    $id: 'ptjlgl-add-vm',
    show: false,
    $form: createForm(),
    typeOptions: [],
    manuOptions: [],
    protocolOptions: [],
    defaultType: "",
    defaultManu: "",
    defaultProtocol: "",
    ipReg: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
    portReg: /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
    versionReg: /^[a-zA-Z0-9-\._]+$/,
    idReg: /^[a-zA-Z0-9]+$/,
    descriptionReg: /(.|\n)+/,
    clear: false, //用来促使弹框里的input框清空
    inputJson: {
        "name": "",
        "id": "",
        "ip": "",
        "port": "",
        "version": "",
        "description": "",
    },
    validJson: {
        "name": true,
        "type": true,
        "manufacturer": true,
        "protocol": true,
        "id": true,
        "version": true,
        "description": true,
        "ip": true,
        "port": true,
    },
    showJson: {
        "id": false,
        "version": false,
        "ip": false,
        "port": false,
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
        let url = '/gmvcs/uom/platform/add';
        addOrModify(url, dialogAddVm, '添加成功')
    },
});

dialogAddVm.$watch('clear', (v) => {
    dialogAddVm.inputJson = {
        "name": "",
        "id": "",
        "ip": "",
        "port": "",
        "version": "",
        "description": "",
    }
    dialogAddVm.validJson = {
        "name": true,
        "type": true,
        "manufacturer": true,
        "protocol": true,
        "id": true,
        "version": true,
        "description": true,
        "ip": true,
        "port": true,
    }
    dialogAddVm.showJson = {
        "id": false,
        "version": false,
        "ip": false,
        "port": false,
    }
    dialogAddVm.defaultType = "";
    dialogAddVm.defaultManu = "";
    dialogAddVm.defaultProtocol = "";
})

//修改弹窗vm定义
const dialogModifyVm = avalon.define({
    $id: 'ptjlgl-modify-vm',
    show: false,
    $form: createForm(),
    typeOptions: [],
    manuOptions: [],
    protocolOptions: [],
    defaultType: "",
    defaultManu: "",
    defaultProtocol: "",
    ipReg: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
    portReg: /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
    versionReg: /^[a-zA-Z0-9-\._]+$/,
    descriptionReg: /(.|\n)+/,
    clear: false, //用来促使弹框里的input框清空
    inputJson: {
        "name": "",
        "id": "",
        "ip": "",
        "port": "",
        "version": "",
        "description": "",
    },
    validJson: {
        "name": true,
        "type": true,
        "manufacturer": true,
        "protocol": true,
        "id": true,
        "version": true,
        "description": true,
        "ip": true,
        "port": true,
    },
    showJson: {
        "id": false,
        "version": false,
        "ip": false,
        "port": false,
    },
    unMatchJson: {
        "type": "",
        "manu": "",
        "protocol": "",
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
        let url = '/gmvcs/uom/platform/modify';
        addOrModify(url, dialogModifyVm, '修改成功', vm.checkedData[0])
    },
});

dialogModifyVm.$watch('clear', (v) => {
    dialogModifyVm.inputJson = {
        "name": "",
        "id": "",
        "ip": "",
        "port": "",
        "version": "",
        "description": "",
    }
    dialogModifyVm.validJson = {
        "name": true,
        "type": true,
        "manufacturer": true,
        "protocol": true,
        "id": true,
        "version": true,
        "description": true,
        "ip": true,
        "port": true,
    }
    dialogModifyVm.showJson = {
        "id": false,
        "version": false,
        "ip": false,
        "port": false,
    }
    dialogModifyVm.defaultType = "";
    dialogModifyVm.defaultManu = "";
    dialogModifyVm.defaultProtocol = "";
})

/**
 * 获取下拉框数据
 * @param {String} typeCode 字典类型
 * @param {String} optionsName 下拉框类型 -- typeOptions/manuOptions/protocolOptions
 * @param {String} defaultName 下拉框类型默认值类型 -- defaultType/defaultManu/defaultProtocol
 * LEVAM_UOM_PLATFORM_TYPE -- 平台类型
 * LEVAM_UOM_PLATFORM_MAN -- 平台厂商
 * LEVAM_UOM_PLATFORM_PROTOCOL -- 对接协议
 */
function fetchDownData(typeCode, optionsName, defaultName) {
    let url = '/gmvcs/uap/dic/findByDicTypeCode/' + typeCode + '?page=0&pageSize=1000';
    sbzygl.ajax(url).then(result => {
        if (result.code !== 0) {
            sbzygl.showTips('error', result.msg);
            dialogAddVm[optionsName].clear();
            // dialogModifyVm[optionsName].clear();
            return;
        } else if (!result.data.totalElements) {
            dialogAddVm[optionsName].clear();
            // dialogModifyVm[optionsName].clear();
            return;
        }
        let options = [];
        let unDiscardedData = result.data.currentElements.filter((item) => {
            return !item.deleted;
        })
        avalon.each(unDiscardedData, (index, el) => {
            let item = {
                "label": el.name,
                "value": el.name
            };
            options.push(item);
        });
        // dialogAddVm[optionsName] = dialogModifyVm[optionsName] = options;
        // dialogAddVm[defaultName] = dialogModifyVm[defaultName] = options.length ? options[0].value : "";
        dialogAddVm[optionsName] = options;
        dialogAddVm[defaultName] = options.length ? options[0].value : "";
    });
}

//自动生成平台ID
function createPlatformId() {
    let url = '/gmvcs/uom/platform/id'
    sbzygl.ajax(url).then(result => {
        if (result.code !== 0) {
            sbzygl.showTips('error', result.msg || '自动生成平台ID的过程出错');
            return;
        }
        dialogAddVm.inputJson.id = result.data;
        dialogAddVm.validJson.id = true;
    });
}

/**
 * 发送添加或修改请求
 * @param {string} url 添加或修改的请求地址
 * @param {vm} dialogVm 添加或修改弹窗的vm
 * @param {string} successMsg 请求成功后的提示消息
 */
function addOrModify(url, dialogVm, successMsg, selectedRowsData) {
    let record = JSON.parse(JSON.stringify(dialogVm.$form.record));
    let inputJson = sbzygl.trimData(dialogVm.inputJson);
    let pass = true;
    //这么写是为了兼容ie8
    let param = {
        "id": inputJson.id,
        "ip": inputJson.ip,
        "port": inputJson.port,
        "name": inputJson.name,
        "type": record.type,
        "manufacturer": record.manufacturer,
        "version": inputJson.version,
        "description": inputJson.description,
        "protocol": record.protocol

    };
    if (dialogVm == dialogModifyVm) {
        param.rid = selectedRowsData.rid;
    }
    avalon.each(record, function (key, value) {
        if (Array.isArray(value)) {
            param[key] = value[0];
        }
    });
    //------------表单验证开始----------------------------------------------------------
    avalon.each(dialogVm.validJson, (key, value) => {
        if (!param[key] || !value) {
            dialogVm.validJson[key] = false;
            pass = false;
        }
    });
    if (!pass) {
        return;
    }
    param.port = Number(param.port);
    //------------表单验证结束----------------------------------------------------------
    sbzygl.ajax(url, 'post', param).then(result => {
        if (result.code !== 0) {
            sbzygl.showTips('error', result.msg || result.data);
            return;
        }
        dialogVm.show = false;
        sbzygl.showTips('success', successMsg);
        dialogVm.clear = !dialogVm.clear;
        if (dialogVm == dialogAddVm) {
            vm.current = 1;
        }
        fetchList();
    })
}

//获取表格列表
function fetchList() {
    let url = '/gmvcs/uom/platform/list';
    let data = {
        page: vm.pagination.current - 1,
        pageSize: vm.pagination.pageSize
    }
    vm.checkAll = false;
    vm.selectedRowsLength = 0;
    vm.dataStr = JSON.stringify(data);
    vm.loading = true;
    // storage.setItem(name, vm.dataStr, 0.5);
    sbzygl.ajax(url, 'post', data).then(result => {
        vm.loading = false;
        if (result.code !== 0) {
            sbzygl.showTips('error', result.msg);
            vm.list = [];
            vm.pagination.total = 0;
            return;
        } else if (!result.data.totalElements) {
            vm.list = [];
            vm.pagination.total = 0;
            return;
        }
        avalon.each(result.data.currentElements, (index, el) => {
            el.checked = false
        });
        vm.list = result.data.currentElements;
        vm.pagination.total = result.data.totalElements;
    }).fail(() => {
        vm.loading = false;
        vm.list = [];
        vm.pagination.total = 0;
    });
}