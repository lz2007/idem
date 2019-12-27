/*
 * @Author: mikey.liangzhu 
 * @Date: 2019-08-23 11:32:59 
 * @Last Modified by: mikey.xuanyanqing
 * @Last Modified time: 2019-08-30 15:35:36
 */
import {
    apiUrl
}
from '/services/configService';

import ajax from '/services/ajaxService';

import Sbzygl from '/apps/common/common-sbzygl';

import {
    isDevice,
    isDSJDevice,
    isNotDSJDevice,
    getTypeName
} from "/apps/common/common-gb28181-tyywglpt-device-type";

import {
    findRoleByOrgPath
} from '/apps/common/common-gb28181-tyywglpt-device-api';

import {
    setPlatformId,
    isPlatformId,
    clearhighlightNodes,
    findonExpandtNodes,
    deviceNodes
} from '/apps/common/common-gb28181-ztree-ctl';

import {
    subStrEllipsis
} from "/apps/common/common-used";

import {
    dialogDelVm
} from './tyywglpt-ptjlgl-bywgl-dialogDelVm';

import {
    dialogAddVm
} from './tyywglpt-ptjlgl-bywgl-dialogAddVm';

import {
    dialogEquipmentVm
} from './tyywglpt-ptjlgl-bywgl-dialogEquipmentVm';

import {
    dialogJurisdictionVm
} from './tyywglpt-ptjlgl-bywgl-dialogJurisdictionVm';

import {
    dialogViewVm
} from './tyywglpt-ptjlgl-bywgl-dialogViewVm';

import {
    createForm
} from 'ane';

import {
    languageSelect
} from '../../services/configService';

import '/apps/common/common-mask-element/common-mask-element';
import '/apps/common/common--tree-bygl/ms-tree-bygl';
import '/apps/common/common-ms-table/common-ms-table';
import '/apps/common/common-ms-ztree/common-ms-ztree';
import '/apps/common/common-tyywglpt.css';
import './xtywgl-bygl.less';

import * as menuServer from '/services/menuService';

let language_txt = require('../../vendor/language').language;

let sbzygl = null;
let vm = null;

export let name = 'xtywgl-bygl';
//页面组件
avalon.component(name, {
    template: __inline('./xtywgl-bygl.html'),
    defaults: {
        authority: {
            DELETE: true, //删除
            MODIFY: true, //修改
            SAVE: true, //保存
            QXGL: true, //权限管理
            STGL: true //视图管理
        },
        bygl_language: language_txt.xtywgl.bygl,
        extra_class: languageSelect == 'en' ? true : false,
        Treeheight: '0',
        $form: createForm(),
        name: '', //名称
        number: '', //编号
        // input 清空操作-s
        handlePress(event) {
            let keyCode = event.keyCode || event.which;
            if (keyCode == 13) {
                this.query();
            } else if (keyCode === 32 && event.target.selectionStart === 0) {
                return false;
            }
        },
        async: {
            enable: true,
            type: "get",
            dataType: "json",
            url: apiUrl + "/gmvcs/uom/device/gb28181/v1/arch/getChildArchetypeInfo",
            autoParam: ["rid=id", "superiorPlatformId"],
            otherParam: {},
            dataFilter: ajaxDataFilter
        },
        onAsyncSuccess(event, treeId, treeNode, data) {
            if (!treeNode.isNoHideNodes) {
                deviceNodes(treeNode, this);
            }
        },
        orgData: [],
        orgData2: [],
        deviceTreeData: [],
        deviceTreeData2: [],
        addHoverDom(treeId, treeNode) {
            if (treeNode.editNameFlag || $("#modifyBtn" + treeNode.tId).length > 0 || $("#addxnizzBtn" + treeNode.tId).length > 0 || $("#addywfzBtn" + treeNode.tId).length > 0 || $("#addXzqhBtn" + treeNode.tId).length > 0 || $("#delBtn" + treeNode.tId).length > 0) return;

            let sObj = $("#" + treeNode.tId + "_span");

            let addStr = '';

            addStr = "<div class='btnIcon-box'>";

            if (treeNode.type != 'PLATFORM_DEVICE' || isDSJDevice(treeNode.type) || isNotDSJDevice(treeNode.type)) {
                let parentNode = treeNode.getParentNode();
                if (!(parentNode && isNotDSJDevice(parentNode.type))) {
                    addStr += "<div class='btnIcon addDeviceBtn' id='addDeviceBtn" + treeNode.tId +
                        "' title='" + this.bygl_language.addDevice + "' onfocus='this.blur();'><img src='../../static/image/tyywglpt/addDevice.png'></div>";
                }
            }

            if (treeNode.type == 'PLATFORM_DEVICE' && this.switchType == 'ywfz') {
                addStr += "<div class='btnIcon addywfzBtn' id='addywfzBtn" + treeNode.tId +
                    "' title='" + this.bygl_language.addBusinessGroup + "' onfocus='this.blur();'><img src='../../static/image/tyywglpt/addywfzBtn.png'></div>";
            }

            if (this.switchType == 'ywfz' && !isDSJDevice(treeNode.type) && !isNotDSJDevice(treeNode.type)) {
                addStr += "<div class='btnIcon addxnizzBtn' id='addxnizzBtn" + treeNode.tId +
                    "' title='" + this.bygl_language.addVirtualOrganization + "' onfocus='this.blur();'><img src='../../static/image/tyywglpt/addxnizzBtn.png'></div>";
            }

            if (this.switchType == 'xzqh' && !isDSJDevice(treeNode.type) && !isNotDSJDevice(treeNode.type)) {
                addStr += "<div class='btnIcon addXzqhBtn' id='addXzqhBtn" + treeNode.tId +
                    "' title='" + this.bygl_language.addAdministrativeDivision + "' onfocus='this.blur();'><img src='../../static/image/tyywglpt/addxnizzBtn.png'></div>";
            }

            if (treeNode.type != 'PLATFORM_DEVICE' && !isDSJDevice(treeNode.type) & !isNotDSJDevice(treeNode.type)) {
                addStr += "<div class='btnIcon modifyBtn' id='modifyBtn" + treeNode.tId +
                    "' title='" + this.bygl_language.edit + "' onfocus='this.blur();'><img src='../../static/image/tyywglpt/modifyBtn.png'></div>";
            }

            if (treeNode.type != 'PLATFORM_DEVICE') {
                addStr += "<div class='btnIcon delBtn' id='delBtn" + treeNode.tId +
                    "' title='" + this.bygl_language.delete + "' onfocus='this.blur();'><img src='../../static/image/tyywglpt/delBtn.png'></div>";
            }

            addStr += "</div>";

            sObj.after(addStr);
            let addywfzBtn = $("#addywfzBtn" + treeNode.tId);

            if (addywfzBtn) addywfzBtn.bind("click", () => {
                this.handleAdd('ywfz', treeId, treeNode);
                return false;
            });

            let addxnizzBtn = $("#addxnizzBtn" + treeNode.tId);

            if (addxnizzBtn) addxnizzBtn.bind("click", () => {
                this.handleAdd('xnzz', treeId, treeNode);
                return false;
            });

            let addXzqhBtn = $("#addXzqhBtn" + treeNode.tId);

            if (addXzqhBtn) addXzqhBtn.bind("click", () => {
                // alert('新增行政区划')
                this.handleAdd('xzqh', treeId, treeNode);
                return false;
            });

            let addDeviceBtn = $("#addDeviceBtn" + treeNode.tId);

            if (addDeviceBtn) addDeviceBtn.bind("click", () => {
                // alert('新增')
                this.handleEquipment(treeId, treeNode);
                return false;
            });

            let modifyBtn = $("#modifyBtn" + treeNode.tId);

            if (modifyBtn) modifyBtn.bind("click", () => {
                // alert('修改')
                let treeObj = $.fn.zTree.getZTreeObj(treeId);
                let index = treeObj.getNodeIndex(treeNode);
                this.actions('modify', treeId, treeNode, index);
                return false;
            });

            let delBtn = $("#delBtn" + treeNode.tId);

            if (delBtn) delBtn.bind("click", () => {
                // alert('删除')
                this.actions('delete', treeId, treeNode);
                return false;
            });
        },
        removeHoverDom(treeId, treeNode) {
            $("#addywfzBtn" + treeNode.tId).unbind().remove();
            $("#addxnizzBtn" + treeNode.tId).unbind().remove();
            $("#addXzqhBtn" + treeNode.tId).unbind().remove();
            $("#addDeviceBtn" + treeNode.tId).unbind().remove();
            $("#modifyBtn" + treeNode.tId).unbind().remove();
            $("#delBtn" + treeNode.tId).unbind().remove();
        },
        JurisdictionData: {},
        zTreeOnClick(event, treeId, treeNode) {
            console.log(treeNode);

            // 权限管理添加需要的数据
            let treeObj = $.fn.zTree.getZTreeObj(treeId);
            treeObj.reAsyncChildNodes(treeNode, "refresh", false);
            if (isDSJDevice(treeNode.type) || isNotDSJDevice(treeNode.type)) {
                return false;
            }

            this.JurisdictionData = treeNode;
            this.queryfindRoleByOrgPath(treeNode.path);
        },
        // 权限管理
        jurisdiction() {
            dialogJurisdictionVm.show = true;
        },
        // 查询
        isQuery: false,
        query(e, page = 0) {
            if (!this.name) {
                sbzygl.showTips('info', this.bygl_language.pleaseenterthequerycontent);
                return false;
            }

            if (this.isQuery) {
                return false;
            }

            let type = '';
            let name = '';
            let deviceId = '';

            if (this.switchType == 'ywfz') {
                type = 'BUSINESS_GROUP';
            } else {
                type = 'CIVIL'
            }

            deviceId = this.name;
            name = this.name;

            this.isQuery = true;
            fetchList({
                name,
                page,
                deviceId,
                type: type,
                isOrg: true
            });
        },
        // 获取权限
        queryfindRoleByOrgPath(orgPath) {
            this.loading = true;
            findRoleByOrgPath(orgPath).then(result => {
                if (result.code == 0) {
                    this.list = result.data;
                } else {
                    sbzygl.showTips('error', result.msg);
                }
            }).fail(() => {
                this.list = [];
            }).always(() => {
                this.loading = false;
            });
        },
        actionsRoleByOrgPath(type, text, record, index) {
            if (type == 'delete') {
                dialogDelVm.type = 'actionsRoleByOrgPath';
                dialogDelVm.userCode = record.userCode;
                dialogDelVm.show = true;
            }
        },
        //switchView 
        switchType: 'ywfz',
        ywfzatcive: 'active',
        xzqhatcive: '',
        ywfzatciveClass() {
            this.ywfzatcive = 'active';
            this.xzqhatcive = '';
        },
        xzqhatciveClass() {
            this.ywfzatcive = '';
            this.xzqhatcive = 'active';
        },
        switchView(view, page = 0, isheader = false) {
            this.isDeviceType = false;
            this.rid = this.defaultTreerid;
            this.name = '';
            this.number = '';
            this.switchType = view;
            this.recordType = 'header';
        },

        // 表格
        loading: false,
        // data
        list: [],
        // 表格-操作回调
        recordType: '',
        deviceId: '',
        parentId: '',
        rid: '',
        businessGroupID: '',
        isDeviceType: false,
        actions(type, treeId, record, index) {
            // 修改
            if (type == 'modify') {
                switch (record.type) {
                    case 'BUSINESS_GROUP':
                        dialogAddVm.title = this.bygl_language.editBusinessGroup;
                        dialogAddVm.typeName = this.bygl_language.commCode;
                        break;
                    case 'VIRTUAL_ORGANIZATION':
                        dialogAddVm.title = this.bygl_language.editVirtualOrganization;
                        dialogAddVm.typeName = this.bygl_language.commCode;
                        break;
                    case 'CIVIL':
                        dialogAddVm.title = this.bygl_language.editAdministrativeDivision;
                        dialogAddVm.typeName = this.bygl_language.zoningNumber;
                        break;
                    case 'PERIPHERAL_DEVICE':
                    case 'DSJNONET':
                    case 'DSJ4G':
                    case 'DSJ2G':
                    case 'DSJ4GGB':
                    case 'MAIN_DEVICE':
                    case 'WRJ':
                    case 'KSBK':
                    case 'CZSL':
                        dialogAddVm.title = this.bygl_language.editDevice;
                        record.type = 'PERIPHERAL_DEVICE';
                        break;
                }
                dialogAddVm.handleModifyType = record.type;
                dialogAddVm.handleModifyData = record;
                dialogAddVm.treeId = treeId;
                dialogAddVm.treeNode = record;
                dialogAddVm.treeNodeIndex = index;

                dialogAddVm.inputJson = {
                    manufacturer: '',
                    manufacturerName: $('#' + record.tId + '_span').text().replace(/本域|下级/g, ''),
                    workstationCode: record.deviceId,
                    disOrder: ''
                }
                dialogAddVm.type = 'modify';
                dialogAddVm.show = true;
            }

            // 删除
            if (type == 'delete') {
                this.handleDelete(treeId, record);
            }
        },
        // 删除
        handleDelete(treeId, record) {
            dialogDelVm.treeId = treeId;
            dialogDelVm.type = 'device';
            dialogDelVm.treeNode = record;
            dialogDelVm.deviceRids = [record.rid];
            dialogDelVm.show = true;
        },
        // 视图管理
        handleView() {
            dialogViewVm.show = true;
        },

        // 新增
        handleAdd(type, treeId, treeNode) {
            switch (type) {
                case 'ywfz':
                    if (this.xzywfzBtn) {
                        return false;
                    }
                    dialogAddVm.title = this.bygl_language.addBusinessGroup;
                    dialogAddVm.typeName = this.bygl_language.commCode;
                    break;
                case 'xnzz':
                    if (this.xzBtn) {
                        return false;
                    }
                    dialogAddVm.title = this.bygl_language.addVirtualOrganization;
                    dialogAddVm.typeName = this.bygl_language.commCode;
                    break;
                case 'xzqh':
                    if (this.xzBtn) {
                        return false;
                    }
                    dialogAddVm.title = this.bygl_language.addAdministrativeDivision;
                    dialogAddVm.typeName = this.bygl_language.zoningNumber;
                    break;
            }
            dialogAddVm.type = 'add';
            dialogAddVm.treeId = treeId;
            dialogAddVm.treeNode = treeNode;
            dialogAddVm.handleAddType = type;
            dialogAddVm.inputJson = {
                manufacturer: "",
                manufacturerName: "",
                workstationCode: "",
                disOrder: ""
            }
            dialogAddVm.show = true;
        },

        // 添加设备
        handleEquipment(treeId, treeNode) {
            dialogEquipmentVm.treeId = treeId;
            dialogEquipmentVm.treeNode = treeNode;
            dialogEquipmentVm.show = true;
        },

        defaultTreeName: '',
        // 业务分组 || 行政区划顶级骨架
        defaultTreeDeviceId: '',
        // 本级平台id
        platformId: '',
        defaultTreePath: '',
        defaultTreerid: '',
        // 按钮权限控制
        accessControl() {
            let _this = this;

            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];

                avalon.each(list, function (index, el) {
                    if (/^UOM_FUNCTION_PTJLGL_DOMAIN/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0)
                    return;

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_PTJLGL_DOMAIN_DELETE":
                            _this.authority.DELETE = true;
                            break;
                        case "UOM_FUNCTION_PTJLGL_DOMAIN_MODIFY":
                            _this.authority.MODIFY = true;
                            break;
                        case "UOM_FUNCTION_PTJLGL_DOMAIN_SAVE":
                            _this.authority.SAVE = true;
                            break;
                        case "UOM_FUNCTION_PTJLGL_DOMAIN_QXGL":
                            _this.authority.QXGL = true;
                            break;
                        case "UOM_FUNCTION_PTJLGL_DOMAIN_STGL":
                            _this.authority.STGL = true;
                            break;
                    }
                });
                // 获取本机平台信息
                getLocalPlatformInfo();
            });
        },
        initTreeheight() {
            let h = $(window).height();
            this.Treeheight = (Number(h) - 217-36) + 'px';
        },
        onInit(){
            sbzygl = new Sbzygl(this);
        },
        onReady() {
            // this.accessControl();
            // 获取本机平台信息
            getLocalPlatformInfo();
            this.initTreeheight();

            vm = this;
            dialogDelVm.vm = this;
            dialogAddVm.sbzygl = sbzygl;
            dialogAddVm.vm = this;
            dialogEquipmentVm.sbzygl = sbzygl;
            dialogJurisdictionVm.sbzygl = sbzygl;
            dialogJurisdictionVm.vm = this;
            dialogViewVm.sbzygl = sbzygl;
            dialogViewVm.vm = this;
            dialogViewVm.getTopArchetypeInfo = getTopArchetypeInfo;
        }
    }
});

// 获取本机平台信息
function getLocalPlatformInfo() {
    let url = `/gmvcs/uom/device/gb28181/v1/arch/getLocalPlatformInfo`;
    sbzygl.ajax(url).then(result => {
        if (result.code == 0) {
            // 业务分组 || 行政区划顶级骨架
            let data = result.data;
            vm.defaultTreeDeviceId = data.deviceId;
            vm.defaultTreeDeviceId = data.deviceId;
            vm.platformId = data.platformId;
            setPlatformId.platformId = data.platformId;
            // 业务分组
            getTopArchetypeInfo(0, vm.defaultTreeDeviceId);
            // 行政区划
            getTopArchetypeInfo(1, vm.defaultTreeDeviceId);
        } else {
            sbzygl.showTips('error', result.msg);
        }
    });
}

// 获取顶级骨架
function getTopArchetypeInfo(orgType, superiorPlatformId, isView = false) {
    let url = `/gmvcs/uom/device/gb28181/v1/arch/getTopArchetypeInfo?orgType=${orgType}&superiorPlatformId=${superiorPlatformId}`;

    return sbzygl.ajax(url).then(result => {
        if (result.code == 0) {
            let data = result.data;
            let orgData = [];

            data.forEach(org => {
                let keyItem = {
                    key: org.path,
                    deviceId: org.deviceId,
                    path: org.path,
                    title: subStrEllipsis(org.name),
                    name: `${org.name} [${org.deviceId}]`,
                    oldName: org.name,
                    icon: isDevice(org.type, 1),
                    rid: org.rid,
                    parentRid: org.parentRid,
                    parentId: org.parentId,
                    civilCode: org.civilCode,
                    manufacturer: org.manufacturer,
                    model: org.model,
                    status: org.status,
                    platformId: org.platformId,
                    isParent: true,
                    type: org.type,
                    children: [],
                    orgCode: org.orgCode,
                    orgId: org.orgId,
                    orgName: org.orgName,
                    orgPath: org.orgPath,
                    createTime: org.createTime || '-',
                    createUser: org.createUser,
                    superiorPlatformId,
                    checked: org.check > 0 ? true : false,
                    checkedOld: org.check > 0 ? true : false,
                    halfCheck: org.check == 1 ? true : false,
                    halfCheckOld: org.check == 1 ? true : false,
                }
                orgData.push(keyItem);
            });

            if (orgType == 0) {
                if (!isView) {
                    vm.orgData = orgData;
                }
                dialogViewVm.data = [];
                dialogViewVm.data = orgData;
            } else {
                if (!isView) {
                    vm.orgData2 = orgData;
                }
                dialogViewVm.data2 = [];
                dialogViewVm.data2 = orgData;
            }
        } else {
            dialogViewVm.data = [];
            dialogViewVm.data2 = [];
            sbzygl.showTips('error', result.msg);
        }
        return result;
    }).fail(() => {
        dialogViewVm.data = [];
        dialogViewVm.data2 = [];
    });
}

/**
 *
 *
 * @param {*} [type=null] type: BUSINESS_GROUP 业务分组 PLATFORM_DEVICE 平台 CIVIL 行政区划 VIRTUAL_ORGANIZATION 虚拟组织
 * @param {*} [localPlatform=1] 0不限,1本域,2外域
 */
function fetchList({
    type = '',
    parentId = '',
    parentRid = '',
    param = {},
    page = 0,
    pageSize = 40,
    name = '',
    deviceId = '',
    isOrg = false,
    isPush = false
} = {}) {
    let url = '';
    let methods = '';
    let data = '';
    let requestType = 0;
    if (type == 'BUSINESS_GROUP') {
        requestType = 0;
    } else {
        requestType = 1;
    }
    url = `/gmvcs/uom/device/gb28181/v1/arch/searchItem?requestType=${requestType}`;
    methods = 'post';
    data = avalon.mix({}, {
        page,
        pageSize,
        parentId,
        type: [],
        localPlatform: 0,
        name,
        deviceId,
        parentRid
    }, param);

    ajax({
        url,
        method: methods,
        data
    }).then(result => {
        if (result.code != 0) {
            sbzygl.showTips('error', result.msg);
            return;
        }

        if (isOrg) {
            // 业务
            let len = 0,
                treeObj = '';
            if (type == 'BUSINESS_GROUP') {
                treeObj = $.fn.zTree.getZTreeObj('tyywglpt-bywgl-ywfz-department');
            }
            // 区划
            if (type == 'CIVIL') {
                treeObj = $.fn.zTree.getZTreeObj('tyywglpt-bywgl-xzqh-department');
            }

            let data = {
                data: result.data.currentElements || []
            }

            dialogSelectVm.currentPages = result.data.currentPages;
            dialogSelectVm.totalPages = result.data.totalPages;
            dialogSelectVm.selectParm = {
                type,
                parentId,
                parentRid,
                param,
                page,
                pageSize,
                name,
                deviceId,
                isOrg
            }

            if (isPush) {
                let pushData = handleToTreeData(data, '', {}, true, false, false);
                pushData.forEach(item => {
                    dialogSelectVm.selectData.push(item);
                });
                dialogSelectVm.falb = false;
                $.mask_close_all();
                return;
            }

            dialogSelectVm.selectData = [];
            dialogSelectVm.selectData = handleToTreeData(data, '', {}, true, false, false);
            len = dialogSelectVm.selectData.length;
            // console.log(dialogSelectVm.selectData);

            clearhighlightNodes(treeObj);

            if (len == 1) {
                findonExpandtNodes(result.data.currentElements[0].path, false, treeObj, vm);
                sbzygl.showTips('success', language_txt.xtywgl.bygl.successfulsearch);
            } else if (len > 1) {

                dialogSelectVm.treeObj = treeObj;
                dialogSelectVm.show = true;
                sbzygl.showTips('success', language_txt.xtywgl.bygl.searchformultipleresultspleaseselect);
            } else {
                sbzygl.showTips('success', language_txt.xtywgl.bygl.successfulsearchnosearchdatayet);
            }

        }

    }).always(() => {
        setTimeout(() => {
            vm.isQuery = false;
        }, 1500);
    });
}

/**
 *树节点处理
 *
 * @param {Array} responseData
 * @returns 返回标准树节点
 */
function handleToTreeData(responseData, treeId, treeNode, setIsParent = false, isParent = false, isSetPlatformId = true) {
    let data = [];

    responseData.data.forEach(item => {
        let keyItem = {
            key: item.path,
            deviceId: item.deviceId,
            title: subStrEllipsis(item.name) + isPlatformId(item.platformId, isSetPlatformId),
            name: `${item.name} [${item.deviceId}]`,
            oldName: item.name,
            icon: isDevice(item.type, 1),
            rid: item.rid,
            parentRid: item.parentRid,
            parentId: item.parentId,
            isParent: setIsParent ? isParent : (isDSJDevice(item.type) ? getTypeName(treeNode.type) ? false : true : getTypeName(treeNode.type) ? false : true),
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
            superiorPlatformId: treeNode.superiorPlatformId,
            isHidden: false
        }

        data.push(keyItem);
    });

    if (vm.switchType == 'ywfz') {
        data = data.filter(item => {
            return (item.type != "CIVIL")
        });

    } else {
        data = data.filter(item => {
            return (item.type == "CIVIL" || isDSJDevice(item.type) || isNotDSJDevice(item.type))
        })
    }

    return data;
}

/**
 *用于对 Ajax 返回数据进行预处理的函数
 *
 * @param {*} treeId
 * @param {*} parentNode
 * @param {*} responseData
 * @returns 返回已处理成树结构数据
 */
function ajaxDataFilter(treeId, parentNode, responseData) {
    if (responseData.code == 0) {
        return filterDSJ(treeId, parentNode, handleToTreeData(responseData, treeId, parentNode));
    } else {
        return [];
    }
}

/**
 *设置树节点设备isHidden 为 true
 *
 * @param {*} treeNode
 * @param {*} data
 * @returns
 */
function filterDSJ(treeId, treeNode, data) {
    if (!treeNode.isNoHideNodes) {
        data.forEach(node => {
            if (isDSJDevice(node.type) || isNotDSJDevice(node.type)) {
                node.isHidden = true;
            }
        });
    }
    return data;
}

//选择弹窗vm定义
let dialogSelectVm = avalon.define({
    $id: 'ptjlgl-bywgl-select-vm',
    show: false,
    treeObj: '',
    currentPages: 0,
    totalPages: 0,
    selectData: [],
    selectParm: {},
    falb: false,
    selectScroll(e) {
        // 是否滚动到底部
        if (this.currentPages + 1 == this.totalPages || this.falb) {
            return;
        }

        let scrollHeight = e.target.scrollHeight;
        let scrollTop = e.target.scrollTop;
        let clientHeight = e.target.clientHeight;

        if (scrollHeight == (scrollTop + clientHeight)) {
            this.selectParm.page = this.currentPages + 1;
            this.selectParm.isPush = true;
            this.falb = true;
            $.mask_element('#ptjlgl-bywgl-select-body', language_txt.xtywgl.bygl.loading);
            fetchList(this.selectParm);
        }
    },
    zTreeOnClick(event, treeId, treeNode) {
        clearhighlightNodes(this.treeObj);

        if (isDSJDevice(treeNode.type) || isNotDSJDevice(treeNode.type)) {
            findonExpandtNodes(treeNode.path, false, this.treeObj, vm, true);
        } else {
            findonExpandtNodes(treeNode.path, false, this.treeObj, vm);
        }
    },
    handleCancel(e) {
        this.show = false;
        this.falb = false;
        this.selectData = [];
        $.mask_close_all();
    },
    handleOk() {
        this.handleCancel();
    }
});