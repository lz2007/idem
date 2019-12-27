/*
 * @Description: 设备树操作
 * @Author: liangzhu
 * @Date: 2019-05-16 10:25:26
 * @LastEditTime: 2019-07-02 14:25:12
 * @LastEditors: Please set LastEditors
 */

import {
    subStrEllipsis,
    uniqueArray
} from "../common/common-used";

import {
    isDevice,
    isDSJDevice,
    isNotDSJDevice,
    getTypeName,
} from "../common/common-gb28181-tyywglpt-device-type";

/**
 * 刷新树
 *
 * @export
 * @param {*} treeId
 * @param {*} treeNode
 * @param {*} type
 * @param {*} result
 * @param {*} treeNodeIndex
 */
export function refreshList(treeId, treeNode, type, result, vm) {
    let treeObj = $.fn.zTree.getZTreeObj(treeId);

    if (type == 'add') {
        let item = result.data;
        let keyItem = {
            key: item.path,
            deviceId: item.deviceId,
            title: subStrEllipsis(item.name) + isPlatformId(item.platformId),
            name: `${item.name} [${item.deviceId}]`,
            oldName: item.name,
            icon: isDevice(item.type, 1),
            rid: item.rid,
            parentRid: item.parentRid,
            parentId: item.parentId,
            isParent: isDSJDevice(item.type) ? false : getTypeName(treeNode.type) ? false : true,
            type: item.type,
            path: item.path,
            checked: false,
            children: [],
            civilCode: item.civilCode,
            manufacturer: item.manufacturer,
            model: item.model,
            status: item.status,
            platformId: item.platformId,
            orgCode: item.orgCode,
            orgId: item.orgId,
            orgName: item.orgName,
            orgPath: item.orgPath,
            createTime: item.createTime,
            createUser: item.createUser,
            treeId: treeId,
            superiorPlatformId: treeNode.superiorPlatformId
        }

        if (treeNode.zAsync) {
            treeObj.expandNode(treeNode, true, false, true);
            setTimeout(() => {
                treeObj.addNodes(treeNode, -1, [keyItem], true);
            }, 300);
        } else {
            treeObj.addNodes(treeNode, -1, [keyItem], true);
        }

    }

    if (type == 'mod') {
        let item = result.data;

        if (vm.JurisdictionData.rid == treeNode.rid) {
            vm.JurisdictionData = treeNode;
        }

        let rid = treeNode.rid;
        let node = treeObj.getNodeByParam("rid", rid, null);

        if (node) {
            node.title = subStrEllipsis(item.name) + isPlatformId(item.platformId);
            node.name = item.name;
            treeObj.updateNode(node);
        } else {
            treeNode.title = subStrEllipsis(item.name) + isPlatformId(item.platformId);
            treeNode.name = item.name;
            treeObj.updateNode(treeNode);
        }
    }

    if (type == 'del') {
        // debugger
        // if (!isNotDSJDevice(treeNode.type)) {
        //     if (treeNode.children.length) {
        //         if (vm.switchType == 'ywfz') {
        //             vm.deviceTreeData.clear();
        //         } else {
        //             vm.deviceTreeData2.clear();
        //         }
        //     }
        // }

        if (isDSJDevice(treeNode.type) || isNotDSJDevice(treeNode.type)) {
            let parentNodeTreeId = treeNode.treeId;
            let parenttreeObj = $.fn.zTree.getZTreeObj(parentNodeTreeId);
            let rid = treeNode.rid;
            let node = parenttreeObj.getNodeByParam("rid", rid, null);
            parenttreeObj.hideNode(node);
        } else {
            if (vm.JurisdictionData.rid == treeNode.rid) {
                vm.JurisdictionData = {};
                vm.list = [];
            }

        }

        treeObj.hideNode(treeNode);
    }

    if (type == 'addDevice') {
        treeObj.reAsyncChildNodes(treeNode, "refresh", true);
    }

    if (type == 'modDevice') {
        let item = result.data;
        treeNode.title = item.name + isPlatformId(item.platformId);
        treeNode.name = item.name;
        treeObj.updateNode(treeNode);

        let parentNodeTreeId = treeNode.treeId;
        let parenttreeObj = $.fn.zTree.getZTreeObj(parentNodeTreeId);
        let rid = treeNode.rid;
        let node = parenttreeObj.getNodeByParam("rid", rid, null);

        node.title = item.name + isPlatformId(item.platformId);
        node.name = item.name;
        parenttreeObj.updateNode(node);

    }
}

// 设置本域平台ip
export let setPlatformId = {
    platformId: ''
};

/**
 *判断是否是本级平台
 *
 * @param {*} platformId 平台id
 * @returns
 */
export function isPlatformId(platformId, isSetPlatformId = true) {
    if (isSetPlatformId) {
        // 是本级平台
        if (platformId == setPlatformId.platformId) {
            return '<span class="badge benyu">本域</span>';
        } else {
            // 下级平台
            return '<span class="badge xiaji">下级</span>';
        }
    } else {
        return ''
    }
}


/**
 * 处理并高亮展开所有查询到的内容
 * 用于设备树搜索
 *
 * @param {*} value 查询内容
 * @param {*} treeObj
 * @returns
 */

let highlightNodes = [];

export function clearhighlightNodes(treeObj) {
    // 去除高亮
    if (highlightNodes.length) {
        for (var i = 0; i < highlightNodes.length; i++) {
            highlightNodes[i].highlight = false;
            treeObj.updateNode(highlightNodes[i]);
        }
        highlightNodes = [];
    }
}

/**
 * 查找节点并高亮
 * 用于设备树搜索
 * @param {*} value
 * @param {*} treeObj
 */

export function getNodesByParam(value, treeObj, vm = null) {
    let node = treeObj.getNodeByParam("path", $.trim(value), null);
    if (node) {
        // treeObj.showNode(node); //显示查到节点
        if (node.getParentNode()) {
            // treeObj.showNode(node.getParentNode()); //显示其父节点
            treeObj.expandNode(node.getParentNode(), true, false, true); //展开所有查询到的内容
        }
        treeObj.selectNode(node);
        node.highlight = true;
        highlightNodes.push(node);
        treeObj.updateNode(node);

        if (vm) {
            if (isDSJDevice(node.type) || isNotDSJDevice(node.type)) {
                let parentNode = node.getParentNode();
                if (isDSJDevice(parentNode.type) || isNotDSJDevice(parentNode.type)) {
                    deviceNodes(parentNode.getParentNode(), vm);
                    treeObj.selectNode(parentNode.getParentNode());
                }else{
                    deviceNodes(parentNode, vm);
                    treeObj.selectNode(parentNode);
                }

                let treeObjequipment = null;

                if (vm.switchType == 'ywfz') {
                    treeObjequipment = $.fn.zTree.getZTreeObj("tyywglpt-bywgl-ywfz-equipment-text");
                } else {
                    treeObjequipment = $.fn.zTree.getZTreeObj("tyywglpt-bywgl-xzqh-equipment-text");
                }

                let treeObjequipmentNode = treeObjequipment.getNodeByParam("path", $.trim(value), null);
                let showNodes = treeObjequipment.getNodesByParam("isHidden", true);
                
                treeObjequipment.showNodes(showNodes);
                treeObjequipment.selectNode(treeObjequipmentNode);
            }
        }

    } else {
        sbzygl.showTips('error', '查不到对应的节点');
    }
}

/**
 * 查询设备，部门 需要展开加载树 再查找树节点
 * 用于设备树搜索
 * 
 * @param {*} path
 * @param {boolean} [checkNode=false]
 * @param {*} treeObj
 * @param {boolean} [callbackFlag=false]
 */
export function findonExpandtNodes(path, checkNode = false, treeObj, vm = null, callbackFlag) {
    // 将部门路径字符串转化为数组
    let newPath = [];

    path.split("/").forEach(item => {
        if (item) {
            newPath.push(item);
        }
    });

    let tenpPath = [];
    for (let k = 0; k < newPath.length; k++) {
        let str = "";
        for (let l = 0; l <= k; l++) {
            str = str + "/" + newPath[l];
        }
        tenpPath.push(str + "/");
    }

    let nodes = treeObj.getNodes();
    for (let i = 0; i < tenpPath.length; i++) {
        const p = tenpPath[i];
        let flag = false;
        for (let j = 0; j < nodes.length; j++) {
            const node = nodes[j];
            if (p == node.path) {
                tenpPath = tenpPath.slice(i);
                flag = true;
                break;
            }
        }

        if (flag) {
            break;
        }
    }

    let len = tenpPath.length;
    let IT = null;
    let i = 0;

    if (len) {
        let parentNode = null;
        IT = setInterval(() => {
            if (i > len - 1) {
                clearInterval(IT);
                if (checkNode) {
                    //查找节点
                    let node = treeObj.getNodeByParam("path", $.trim(path), null);
                    if (node) {
                        treeObj.showNode(node); //显示查到节点
                        treeObj.checkNode(node, true, true, false);
                    }
                } else {
                    getNodesByParam(path, treeObj, vm);
                }
                return true;
            }

            let nodes = treeObj.getNodesByParam("path", tenpPath[i++], parentNode);

            if (nodes.length > 0) {
                if (checkNode) {
                    // 判断节点是否已经加载过，如果已经加载过则不需要再加载
                    if (!nodes[0].zAsync) {
                        treeObj.reAsyncChildNodes(nodes[0], "", true);
                    }
                } else {
                    // 解决addNodes 之后查找不到节点的bug
                    if (callbackFlag) {
                        treeObj.expandNode(nodes[0], true, false, true, callbackFlag);
                    } else {
                        treeObj.reAsyncChildNodes(nodes[0], "refresh", true);
                    }
                }
            } else {
                console.log(`查不到不到节点i=${i}`);
                i--;
            }
        }, 60);
    }
}

/**
 *显示设备
 *
 * @param {*} treeNode
 * @returns
 */
export function deviceNodes(treeNode, vm) {

    if (isDSJDevice(treeNode.type) || isNotDSJDevice(treeNode.type)) {
        return false;
    }
    if (treeNode.children.length) {
        let deviceNode = treeNode.children.filter(node => {
            return (isDSJDevice(node.type) || isNotDSJDevice(node.type));
        });

        let nodes = JSON.parse(JSON.stringify(deviceNode));

        nodes.forEach(node => {
            node.isHidden = false;
            node.isDevice = true;
            node.isNoHideNodes = true;
        });

        if (nodes.length) {
            nodes = uniqueArray(nodes, 'key');
        }
        if (vm.switchType == 'ywfz') {
            vm.deviceTreeData.clear();
            vm.deviceTreeData = nodes;
        } else {
            vm.deviceTreeData2.clear();
            vm.deviceTreeData2 = nodes;
        }
    } else {
        if (vm.switchType == 'ywfz') {
            vm.deviceTreeData.clear();
        } else {
            vm.deviceTreeData2.clear();
        }
    }
}