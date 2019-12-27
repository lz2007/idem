import {
    apiUrl
}
from '/services/configService';
import {
    isDevice,
    getTypeName,
    isDSJDevice,
    isNotDSJDevice
} from "../common-gb28181-tyywglpt-device-type";

import './common-ms-ztree.less';

avalon.component('ms-ztree', {
    template: __inline('./common-ms-ztree.html'),
    defaults: {
        treeId: "treeId" + new Date().getTime(),
        treeData: [],
        switchType: 'ywfz',
        checkable: false,
        chkStyle: "checkbox",
        setChkDisabled: false,
        beforeAsync(treeId, treeNode) {
            // 注意死循环
            if (!treeNode.key) {
                return false;
            }
        },
        zTreeOnAsyncSuccess(event, treeId, treeNode, msg) {
            let treeObj = $.fn.zTree.getZTreeObj(treeId);
            let checkStatus = treeNode.getCheckStatus();

            if (treeNode.checked != treeNode.checkedOld) {

                if (checkStatus.checked) {
                    if (treeNode.children.length) {
                        treeNode.children.forEach(node => {
                            if (!node.chkDisabled) {
                                node.checked = true;
                                treeObj.updateNode(node);
                            }
                        });
                    }
                } else {
                    if (treeNode.children.length) {
                        treeNode.children.forEach(node => {
                            if (!node.chkDisabled) {
                                node.checked = false;
                                treeObj.updateNode(node);
                            }
                        });
                    }
                }

            }

        },
        zTreeOnCheck(event, treeId, treeNode) {
            let treeObj = $.fn.zTree.getZTreeObj(treeId);
            let ParentNode = treeNode.getParentNode();
            if (ParentNode) {
                ParentNode.halfCheck = false;
                treeObj.updateNode(ParentNode);
            }
            treeNode.halfCheck = false;
            treeObj.updateNode(treeNode);
        },
        onDblClick: avalon.noop,
        watchzTreeNodes: '',
        initwatchzTreeNodes() {
            this.watchzTreeNodes = this.$watch('treeData.length', () => {
                if (this.treeData.length) {
                    zTreeInit(this);
                } else {
                    $.fn.zTree.destroy(this.treeId);
                }
            });
        },
        onInit() {
            this.initwatchzTreeNodes();
        },
        onDispose() {
            this.watchzTreeNodes = '';
            $.fn.zTree.destroy(this.treeId);
        }
    }
});

/**
 *树初始化
 *
 * @param {*} params
 */

function zTreeInit(vm) {
    let setting = {
        data: {
            key: {
                name: "title"
            }
        },
        view: {
            selectedMulti: false,
            fontCss: getFontCss
        },
        callback: {
            beforeAsync: vm.beforeAsync,
            onDblClick: vm.onDblClick,
            onAsyncSuccess: vm.zTreeOnAsyncSuccess,
            onCheck: vm.zTreeOnCheck
        },
        check: {
            enable: true,
            chkStyle: 'checkbox'
        },
        async: {
            enable: true,
            type: "get",
            dataType: "json",
            url: apiUrl + "/gmvcs/uom/device/gb28181/v1/arch/getChildArchetypeInfo",
            autoParam: ["rid=id", "superiorPlatformId"],
            dataFilter: function ajaxDataFilter(treeId, parentNode, responseData) {
                if (responseData.code == 0) {
                    if (vm.switchType == 'ywfz') {
                        responseData.data = responseData.data.filter(item => {
                            return (item.type != "CIVIL")
                        });

                    } else {
                        responseData.data = responseData.data.filter(item => {
                            return (item.type == "CIVIL" || isDSJDevice(item.type) || isNotDSJDevice(item.type))
                        })
                    }
                    return handleToTreeData(responseData.data, parentNode, vm);
                } else {
                    return [];
                }
            }
        }
    };

    //初始化节点 
    let treeObj = $.fn.zTree.init($("#" + vm.treeId), setting, vm.treeData);
    let nodes = treeObj.getNodes();

    if (nodes.length > 0) {
        treeObj.expandNode(nodes[0], true, false, true, true);
    }
}

/**
 *处理数据为节点数据
 *
 * @param {*} data
 * @returns
 */
function handleToTreeData(data, parentNode, vm) {
    let nodes = [];
    if (data) {
        data.forEach(item => {
            let keyItem = {
                key: item.path,
                deviceId: item.deviceId,
                title: item.name,
                icon: isDevice(item.type, 1),
                parentId: item.parentId,
                rid: item.rid,
                parentRid: item.parentRid,
                chkDisabled: vm.setChkDisabled,
                checked: item.check > 0 ? true : false,
                checkedOld: item.check > 0 ? true : false,
                halfCheck: item.check == 1 ? true : false,
                halfCheckOld: item.check == 1 ? true : false,
                type: item.type,
                path: item.path,
                isParent: isDSJDevice(item.type) ? false : getTypeName(parentNode.type) ? false : true,
                children: [],
                superiorPlatformId: parentNode.superiorPlatformId
            }
            nodes.push(keyItem);
        });
    }

    return nodes;
}

/**
 *设置树样式
 *
 * @param {*} treeId
 * @param {*} treeNode
 * @returns
 */
function getFontCss(treeId, treeNode) {
    return !!treeNode.highlight ? {
        color: "#A60000",
        "font-weight": "bold"
    } : {
        color: "#333",
        "font-weight": "normal"
    };
}