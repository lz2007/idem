//添加设备弹窗vm定义
import {
    apiUrl
}
from '/services/configService';
import {
    orgIcon,
    isDevice,
    isDSJDevice,
    isNotDSJDevice
} from "/apps/common/common-gb28181-tyywglpt-device-type";

import {
    split_array
} from "/apps/common/common-used";

import {
    searchDevice,
    getMgr
} from '/apps/common/common-gb28181-tyywglpt-device-api';

import {
    refreshList,
    clearhighlightNodes,
    findonExpandtNodes
} from '/apps/common/common-gb28181-ztree-ctl';

import ajax from '/services/ajaxService';

let language_txt = require('../../vendor/language').language;

export let dialogEquipmentVm = avalon.define({
    $id: 'ptjlgl-bywgl-equipment-vm',
    bygl_language: language_txt.xtywgl.bygl,
    show: false,
    bywglEquipmentTreeId: 'ptjlgl-bywgl-equipment-vm-tree',
    treeId: '',
    treeNode: '',
    title: language_txt.xtywgl.bygl.addingdevicenodes,
    gbcodeList: '',
    page: 0,
    pageSize: 40,
    totalPages: 0,
    ExcludeData: [],
    equipmentTreeData: [],
    enable: true,
    sbzygl: '',
    zTreeOnCheck(event, treeId, treeNode) {
        let treeObj = $.fn.zTree.getZTreeObj(treeId);
        let ParentNode = treeNode.getParentNode();
        if (ParentNode) {
            ParentNode.halfCheck = false;
            treeObj.updateNode(ParentNode);
        }

        // if (treeNode.children.length) {
        //     treeNode.children.forEach(item => {
        //         item.halfCheck = false;
        //         treeObj.updateNode(item);
        //     })
        // }

        treeNode.halfCheck = false;
        treeObj.updateNode(treeNode);
    },
    zTreeOnClick(event, treeId, treeNode) {
        console.log(treeNode);
        let treeObj = $.fn.zTree.getZTreeObj(treeId);
        treeObj.expandNode(treeNode, true, true, true, true);
    },
    asyncTime: false,
    async: {
        enable: true,
        type: "post",
        dataType: "json",
        url: apiUrl + "/gmvcs/uom/device/gb28181/v1/device/queryDeviceInfoForArch",
        autoParam: ["orgPath", "orgId"],
        otherParam: {
            "pageSize": 20000,
            "page": 0,
            "archId": ''
        },
        dataFilter: ajaxDataFilter
    },
    onAsyncError() {
        this.sbzygl.showTips('error', this.bygl_language.acquisitionfailure);
    },
    onAsyncSuccess(event, treeId, treeNode, data) {
        let treeObj = $.fn.zTree.getZTreeObj(treeId);
        let checkStatus = treeNode.getCheckStatus();

        if (data.length && this.asyncTime) {
            var halfCheck = data.some((item, index) => {
                if (item.check === 1) {
                    return true;
                } else {
                    return false;
                }
            });

            if (halfCheck) {
                treeNode.checked = true;
                treeNode.halfCheck = true;
                treeNode.checkedOld = true;
                treeObj.updateNode(treeNode);
            }

            let checked = data.every((item, index) => {
                if (item.check === 2) {
                    return true;
                } else {
                    return false;
                }
            });

            if (checked) {
                treeNode.checked = true;
                treeNode.halfCheck = false;
                treeNode.checkedOld = true;
                treeNode.chkDisabled = true;
                treeObj.updateNode(treeNode);
            }

            this.asyncTime = false;
        }

        if (checkStatus && checkStatus.checked && !checkStatus.half) {
            if (treeNode.children.length) {
                treeNode.children.forEach(node => {
                    if (!node.chkDisabled) {
                        node.checked = true;
                        treeObj.updateNode(node);
                    }
                });
            }
        }

        if (checkStatus && !checkStatus.checked && !checkStatus.half) {
            if (treeNode.children.length) {
                treeNode.children.forEach(node => {
                    if (!node.chkDisabled) {
                        node.checked = false;
                        treeObj.updateNode(node);
                    }
                });
            }
        }

    },
    query() {
        if (!this.gbcodeList) {
            this.sbzygl.showTips('info', this.bygl_language.pleaseenterwhatyouneedtoquery);
            return false;
        }
        let data = {
            deviceExtendValue: this.gbcodeList,
            deviceName: '',
            gbcode: '',
            localDevice: 0,
            manufacturer: '',
            model: '',
            orgPath: '',
            page: 0,
            pageSize: 2000,
            registerTimeBegin: 0,
            registerTimeEnd: 0,
            searchSubOrg: true,
            status: 0,
            type: [],
            excludeGbCodeList: []
        }
        searchDevice(data).then(result => {
            if (result.code == 0) {
                // console.log(result);
                let treeObj = $.fn.zTree.getZTreeObj(this.bywglEquipmentTreeId);
                let len = result.data.currentElements.length;
                clearhighlightNodes(treeObj);
                result.data.currentElements.forEach(item => {
                    findonExpandtNodes((item.orgPath + item.gbcode + '/'), false, treeObj, null, true);
                });

                if (len) {
                    // if (result.data.totalElements > 100) {
                    //     this.sbzygl.showTips('success', `搜索成功,搜索结果有${result.data.totalElements}条数据,目前展示前100条结果`);
                    // } else {
                    this.sbzygl.showTips('success', this.bygl_language.successfulsearch);
                    // }
                } else {
                    this.sbzygl.showTips('success', this.bygl_language.successfulsearchnosearchdatayet);
                }
            } else {
                this.sbzygl.showTips('success', result.msg);
            }
        });
    },

    keydownQuery(e) {
        if (e.keyCode === 13 || e.code == "Enter") {
            this.query();
        }
    },

    handleCancel(e) {
        this.show = false;
        this.isSubmit = false;
        $.mask_close_all();
    },
    isSubmit: false,
    handleOk() {
        let treeObj = $.fn.zTree.getZTreeObj(this.bywglEquipmentTreeId);
        let nodes = treeObj.getCheckedNodes(true);
        let addNode = [];
        let ExcludeNode = [];

        nodes.forEach(item => {
            let checkStatus = item.getCheckStatus();
            if (checkStatus.checked && !checkStatus.half) {
                
                var flab = ExcludeNode.some(v=>{
                    return v == item.deviceId;
                });

                if (!flab) {
                    addNode.push(item);
                }
                 // 是否部门
                 if (item.icon == orgIcon) {
                    if (item.children && item.children.length) {
                        item.children.forEach(childItem=>{
                            ExcludeNode.push(childItem.deviceId);
                        });
                    }
                }
            }
        });

        if (addNode.length && !this.isSubmit) {
            $.mask_element('#cjzxhgl-bywgl-modal-equipment', this.bygl_language.indatasubmissionpleasewaitamoment);
            this.isSubmit = true;
            addDevice(addNode, this.treeId, this.treeNode);
        } else {
            this.handleCancel();
            this.sbzygl.showTips('success', this.bygl_language.successfulPreservation);
        }
    },
});

dialogEquipmentVm.$watch('show', newVal => {
    if (newVal) {
        dialogEquipmentVm.async.otherParam.archId = dialogEquipmentVm.treeNode.rid;
        getMgr().then(result => {
            if (result.code == 0) {
                result.data.forEach(item => {
                    item.key = item.orgId;
                    item.name = item.orgName;
                    item.title = item.orgName;
                    item.icon = isDevice(item.type, 1);
                    item.isParent = true;
                    item.children = [];
                    // item.checked = false;
                    // item.halfCheck = false;
                })
                dialogEquipmentVm.equipmentTreeData = result.data;
                setTimeout(() => {
                    let treeObj = $.fn.zTree.getZTreeObj(dialogEquipmentVm.bywglEquipmentTreeId);
                    equipmentExpandNode(treeObj);
                }, 50);
            }
        });
    } else {
        dialogEquipmentVm.equipmentTreeData = [];
    }
});

/**
 *用于对 Ajax 返回数据进行预处理的函数
 *
 * @param {*} treeId
 * @param {*} parentNode
 * @param {*} responseData
 * @returns 返回已处理成树结构数据
 */
function ajaxDataFilter(treeId, parentNode, responseData) {
    if (responseData.length) {
        responseData.forEach(item => {
            item.key = item.deviceId;
            item.name = item.type ? item.deviceName : item.orgName;
            item.title = item.type ? item.deviceName : item.orgName;
            item.icon = isDevice(item.type, 1);
            item.isParent = item.type ? false : true;
            item.path = (isDSJDevice(item.type) || isNotDSJDevice(item.type)) ? item.orgPath + item.deviceId + '/' : item.orgPath;
            item.checked = item.check > 0 ? true : false;
            item.halfCheck = item.check == 1 ? true : false;
            item.checkedOld = item.check > 0 ? true : false;
            item.chkDisabled = item.check == 2 ? true : false;
            item.children = [];
        });
        return responseData;
    } else {
        return [];
    }
}


/**
 * 展开第一级
 */
function equipmentExpandNode(treeObj) {
    if (dialogEquipmentVm.equipmentTreeData.length && treeObj) {
        let node = treeObj.getNodeByParam("key", dialogEquipmentVm.equipmentTreeData[0].key, null);
        if (node) {
            dialogEquipmentVm.asyncTime = true;
            treeObj.reAsyncChildNodes(node, "refresh", false);
        }
    }
}

/**
 * 添加设备
 *
 * @param {*} [data=[]]
 */
function addDevice(deviceData = [], treeId, treeNode) {
    let checkData = [];

    for (let i = 0; i < deviceData.length; i++) {
        let dataObj = {
            "address": '',
            "certifiable": '',
            "civilCode": '',
            "deviceID": '',
            "endTime": '',
            "errCode": '',
            "ipaddress": '',
            "manufacturer": '',
            "model": '',
            "name": '',
            "owner": '',
            "parentRid": treeNode.rid,
            "parentId": treeNode.deviceId,
            'platformId': treeNode.platformId,
            "parental": 0,
            "port": '',
            "registerWay": '',
            "safetyWay": 0,
            "secrecy": '',
            "status": ''
        }
        if (deviceData[i].type) {
            checkData.push(deviceData[i].deviceId);
        } else {
            checkData.push(deviceData[i].orgCode);
        }
    }

    if (!checkData.length) {
        dialogEquipmentVm.handleCancel();
        return;
    }

    let checkNewData = split_array(checkData, 1000);

    ajaxAddDevice(checkNewData, 0, checkNewData.length, treeId, treeNode)
}

function ajaxAddDevice(datas, time = 0, len = 1, treeId, treeNode) {
    let url = `/gmvcs/uom/device/gb28181/v1/arch/addDeviceForArch?parentRid=${treeNode.rid}`;

    ajax({
        url,
        method: 'post',
        data: datas[time],

    }).then(result => {
        if (result.code !== 0) {
            dialogEquipmentVm.sbzygl.showTips('error', result.msg);
        } else {
            if ((time + 1) == len) {
                dialogEquipmentVm.sbzygl.showTips('success', language_txt.xtywgl.bygl.addSuccess);
                refreshList(treeId, treeNode, 'addDevice', result);
            }
        }

        if (len > (time + 1)) {
            ajaxAddDevice(datas, (time + 1), len, treeId, treeNode);
        }

    }).always(() => {
        if ((time + 1) == len) {
            dialogEquipmentVm.handleCancel();
        }
    });
}