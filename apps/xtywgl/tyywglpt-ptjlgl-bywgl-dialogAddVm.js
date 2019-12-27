/*
 * @Description: 添加弹窗vm定义
 * @Author: liangzhu
 * @Date: 2019-05-16 11:09:20
 * @LastEditTime: 2019-05-16 11:38:28
 * @LastEditors: Please set LastEditors
 */
import {
    createForm
} from 'ane';

import {
    autoCreateCode
} from '/apps/common/common-gb28181-tyywglpt-device-api';

import {
    refreshList
} from '/apps/common/common-gb28181-ztree-ctl';

import ajax from '/services/ajaxService';

let language_txt = require('../../vendor/language').language;

export let dialogAddVm = avalon.define({
    $id: 'ptjlgl-bywgl-add-vm',
    bygl_language: language_txt.xtywgl.bygl,
    show: false,
    treeId: '',
    treeNode: '',
    treeNodeIndex: '-1',
    title: language_txt.xtywgl.bygl.add,
    type: 'add',
    typeName: language_txt.xtywgl.bygl.commCode,
    handleModifyType: '',
    handleAddType: '',
    handleModifyData: null,
    $form: createForm(),
    manufacturerOptions: [],
    manuReg: /^[a-zA-Z\u4e00-\u9fa5]{1,32}$/,
    modelReg: /^[a-zA-Z0-9\u4e00-\u9fa5-]{1,32}$/,
    orderReg: /^[1-9]{1}[0-9]{0,8}$/,
    lengthReg: /^\s{0}/, //仅限制长度的非必填项
    clear: false, //用来促使弹框里的input框清空
    sbzygl: '',
    vm: '',
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
        this.sbzygl.handleFocus(event, name, this);
    },
    handleFormat(name, reg, event) {
        this.sbzygl.handleFormat(event, name, this, reg, null);
    },
    handleClear(name, event) {
        this.sbzygl.handleClear(event, name, this);
    },
    handleManuFocus(event) {
        this.sbzygl.handleFocus(event, 'manufacturerName', this);
    },
    handleManuFormat(event) {
        this.sbzygl.handleFormat(event, 'manufacturerName', this, this.manuReg, null);
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
        //------------表单验证开始----------------------------------------------------------
        let pass = true;

        if (!this.validJson.manufacturerName || !this.validJson.workstationCode) {
            return false;
        }

        if (!this.inputJson.manufacturerName || this.inputJson.manufacturerName.length > 32) {
            this.validJson.manufacturerName = false;
            pass = false;
        }

        if (!this.inputJson.workstationCode || this.inputJson.workstationCode.length > 20) {
            this.validJson.workstationCode = false;
            pass = false;
        }

        if (this.type == 'add') {

            switch (this.handleAddType) {
                case 'ywfz':
                    if (this.inputJson.workstationCode.length != 20 || !Number(this.inputJson.workstationCode)) {
                        this.validJson.workstationCode = false;
                        this.sbzygl.showTips('error', this.bygl_language.correctCommunicationCode);
                        pass = false;
                        break;
                    }
                    if (this.inputJson.workstationCode.search(/215/) != 10) {
                        this.validJson.workstationCode = false;
                        this.sbzygl.showTips('error', this.bygl_language.thebusinessgroupingtypeis215);
                        pass = false;
                        break;
                    }

                    break;
                case 'xnzz':
                    if (this.inputJson.workstationCode.length != 20 || !Number(this.inputJson.workstationCode)) {
                        this.validJson.workstationCode = false;
                        this.sbzygl.showTips('error', this.bygl_language.correctCommunicationCode);
                        pass = false;
                        break;
                    }
                    if (this.inputJson.workstationCode.search(/216/) != 10) {
                        this.validJson.workstationCode = false;
                        this.sbzygl.showTips('error', this.bygl_language.thevirtualorganizationtypeis216);
                        pass = false;
                        break;
                    }
                    break;
                case 'xzqh':
                    if (this.inputJson.workstationCode.length > 8 || this.inputJson.workstationCode.length % 2 != 0 || !Number(this.inputJson.workstationCode)) {
                        this.validJson.workstationCode = false;
                        this.sbzygl.showTips('error', this.bygl_language.correctzoningNumber);
                        pass = false;
                        break;
                    }
                    break;
            }
            // 输入的国标编码位数不正确，请输入正确的2或4或6或8位数字组合
        }

        if (!pass) {
            return;
        }

        //------------表单验证结束----------------------------------------------------------
        // 新增
        if (this.type == 'add') {
            addBusinessGroup({
                civilCode: this.inputJson.workstationCode,
                name: this.inputJson.manufacturerName,
                parentRid: this.treeNode.rid,
                parentId: this.treeNode.parentId,
                platformId: this.treeNode.platformId,
                treeId: this.treeId,
                treeNode: this.treeNode,
            });
        } else {
            // 设备修改
            if (this.handleModifyType == 'PERIPHERAL_DEVICE') {
                modifyDevice(this.handleModifyData.rid, this.inputJson, this.handleModifyData, this.treeId, this.treeNode);
                return;
            }

            // 虚拟组织  业务分组 行政区划 修改
            modifyBusinessGroup({
                Rid: this.handleModifyData.rid,
                civilCode: this.inputJson.workstationCode,
                name: this.inputJson.manufacturerName,
                parentRid: this.handleModifyData.parentRid,
                parentId: this.handleModifyData.parentId,
                platformId: this.handleModifyData.platformId,
                treeId: this.treeId,
                treeNode: this.treeNode,
                treeNodeIndex: this.treeNodeIndex,
            });
        }

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
});

dialogAddVm.$watch('show', (v) => {
    if (v) {
        if (dialogAddVm.type == 'add') {
            let codeType = '';
            let type = 0;
            switch (dialogAddVm.handleAddType) {
                case 'ywfz':
                    codeType = '215';
                    type = 1;
                    break;
                case 'xnzz':
                    codeType = '216';
                    type = 1;
                    break;
                case 'xzqh':
                    codeType = '00';
                    type = 0;
                    break;
            }
            autoCreateCode(dialogAddVm.treeNode.deviceId, codeType, type).then(result => {
                if (result.code == 0) {
                    dialogAddVm.inputJson.workstationCode = String(result.data);
                }
            });
        }
    }
});

//添加 业务分组 | 虚拟分组 | 行政区划
function addBusinessGroup({
    civilCode = null,
    deviceID = civilCode,
    name = null,
    parentRid = '',
    parentId = '',
    platformId = '',
    treeId = '',
    treeNode = '',
} = {}) {
    let url = '';
    let data = {};
    switch (dialogAddVm.handleAddType) {
        case 'ywfz':
            url = `/gmvcs/uom/device/gb28181/v1/arch/addBusinessGroup`;
            data = {
                civilCode: null,
                deviceID,
                name,
                parentId,
                parentRid,
                platformId
            }
            break;
        case 'xnzz':
            url = `/gmvcs/uom/device/gb28181/v1/arch/addVirtualOrg`;
            data = {
                businessGroupID: null,
                civilCode: null,
                deviceID,
                name,
                parentId,
                parentRid,
                platformId
            }
            break;

        case 'xzqh':
            url = `/gmvcs/uom/device/gb28181/v1/arch/addCivil`;
            data = {
                civilCode,
                deviceID,
                name,
                parentId,
                parentRid,
                platformId
            }
            break;
    }
    ajax({
        url,
        method: 'post',
        data
    }).then(result => {
        if (result.code !== 0) {
            if (dialogAddVm.handleAddType == 'xzqh') {
                dialogAddVm.sbzygl.showTips('error', result.msg ? result.msg : language_txt.xtywgl.bygl.addFail);
            } else {
                dialogAddVm.sbzygl.showTips('error', result.msg ? result.msg : language_txt.xtywgl.bygl.addFail);
            }
        } else {
            dialogAddVm.sbzygl.showTips('success', language_txt.xtywgl.bygl.addSuccess);
            dialogAddVm.show = false;
            refreshList(treeId, treeNode, 'add', result, dialogAddVm.vm);
        }
    });

}


/**
 * 修改设备
 *
 * @param {*} Id id
 * @param {*} name name
 */
function modifyDevice(Id, inputJson, handleModifyData, treeId, treeNode) {
    let dataObj = {
        "name": inputJson.manufacturerName,
        "address": "",
        "certifiable": "",
        "civilCode": handleModifyData.civilCode,
        "deviceID": handleModifyData.deviceId,
        "endTime": "",
        "errCode": "",
        "manufacturer": handleModifyData.manufacturer,
        "model": handleModifyData.model,
        "owner": "",
        "parentRid": handleModifyData.parentRid,
        "parentId": handleModifyData.parentId,
        "parental": 0,
        "port": "",
        "registerWay": "",
        "safetyWay": 0,
        "secrecy": "",
        "status": handleModifyData.status ? handleModifyData.status : "0",
        "platformId": handleModifyData.platformId,
    }
    let url = `/gmvcs/uom/device/gb28181/v1/arch/modifyDevice?Rid=${Id}`;
    ajax({
        url,
        method: 'post',
        data: dataObj
    }).then(result => {
        if (result.code !== 0) {
            dialogAddVm.sbzygl.showTips('error', (result.msg ? result.msg : language_txt.xtywgl.bygl.editFail));
        } else {
            dialogAddVm.sbzygl.showTips('success', language_txt.xtywgl.bygl.editSuccess);
            dialogAddVm.show = false;
            refreshList(treeId, treeNode, 'modDevice', result, dialogAddVm.vm);
        }
    });
}

//修改 业务分组 | 虚拟分组 | 行政区划
function modifyBusinessGroup({
    Rid = null,
    civilCode = null,
    deviceID = civilCode,
    name = null,
    parentId = '',
    parentRid = '',
    platformId = '',
    treeId = '',
    treeNode = '',
    treeNodeIndex = ''
} = {}) {
    let url = "";
    let data = {};
    switch (dialogAddVm.handleModifyType) {
        case 'BUSINESS_GROUP':
            // dialogAddVm.title = '修改业务分组';
            url = `/gmvcs/uom/device/gb28181/v1/arch/modifyBusinessGroup?Rid=${Rid}`;
            data = {
                civilCode,
                deviceID,
                name,
                parentId,
                parentRid,
                platformId
            }
            break;
        case 'VIRTUAL_ORGANIZATION':
            // dialogAddVm.title = '修改虚拟组织';
            url = `/gmvcs/uom/device/gb28181/v1/arch/modifyVirtualOrg?Rid=${Rid}`;
            data = {
                businessGroupID: null,
                civilCode: null,
                deviceID,
                name,
                parentId,
                parentRid,
                platformId
            }
            break;
        case 'CIVIL':
            // dialogAddVm.title = '修改行政区划';
            url = `/gmvcs/uom/device/gb28181/v1/arch/modifyCivil?Rid=${Rid}`;
            data = {
                civilCode: null,
                deviceID,
                name,
                parentId,
                parentRid,
                platformId
            }
            break;
    }

    ajax({
        url,
        method: 'post',
        data
    }).then(result => {
        if (result.code !== 0) {
            dialogAddVm.sbzygl.showTips('error', (result.msg ? result.msg : language_txt.xtywgl.bygl.editFail));
        } else {
            dialogAddVm.sbzygl.showTips('success', language_txt.xtywgl.bygl.editSuccess);
            dialogAddVm.show = false;
            refreshList(treeId, treeNode, 'mod', result, dialogAddVm.vm);
        }
    });
}