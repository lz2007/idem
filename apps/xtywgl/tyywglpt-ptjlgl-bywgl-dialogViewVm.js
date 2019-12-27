/*
 * @Description: 视图管理弹窗vm定义
 * @Author: lz
 * @Date: 2019-05-16 14:27:17
 * @LastEditTime: 2019-06-27 11:19:18
 * @LastEditors: Please set LastEditors
 */

import {
    distinct
} from "/apps/common/common-used";

import {
    createForm
} from 'ane';

import {
    orgIcon
} from "/apps/common/common-gb28181-tyywglpt-device-type";

import ajax from '/services/ajaxService';

let language_txt = require('../../vendor/language').language;

export let dialogViewVm = avalon.define({
    $id: 'ptjlgl-bywgl-view-vm',
    bygl_language: language_txt.xtywgl.bygl,
    show: false,
    sbzygl: '',
    vm: '',
    getTopArchetypeInfo: '',
    handleCancel(e) {
        if (this.isAjax) {
            this.sbzygl.showTips('info', this.bygl_language.indatasubmissionpleasewaitamoment);
            return;
        }
        this.show = false;
        this.isAjax = false;
        $.mask_close_all();
    },
    isAjax: false,
    handleOk() {
        if (this.isAjax) {
            this.sbzygl.showTips('info', this.bygl_language.indatasubmissionpleasewaitamoment);
            return;
        }
        this.isAjax = true;
        $.mask_element('#ptjlgl-bywgl-modal-view', this.bygl_language.indatasubmissionpleasewaitamoment);
        // 业务分组
        let ywfzTreeObj = $.fn.zTree.getZTreeObj('bywgl-ywfz-View');
        let ywfzTreeNodes = [];
        if (ywfzTreeObj && this.viewSelected) {
            // ywfzTreeNodes = ywfzTreeObj.getChangeCheckedNodes();
            ywfzTreeNodes = ywfzTreeObj.transformToArray(ywfzTreeObj.getNodes());
        }

        // 行政区划
        let xzqhTreeObj = $.fn.zTree.getZTreeObj('bywgl-xzqh-View');
        let xzqhTreeNodes = [];

        if (xzqhTreeObj && !this.viewSelected) {
            // xzqhTreeNodes = xzqhTreeObj.getChangeCheckedNodes();
            xzqhTreeNodes = xzqhTreeObj.transformToArray(xzqhTreeObj.getNodes());
        }

        let addViewPathList = [];
        let deleteViewPathList = [];
        let ExcludeViewPathList = [];

        ywfzTreeNodes.forEach(item => {
            let checkStatus = item.getCheckStatus();
            if (checkStatus.checked != item.checkedOld || checkStatus.half != item.halfCheckOld) {
                
                if (checkStatus.checked && !checkStatus.half) {
                    var flab = ExcludeViewPathList.some(v=>{
                        return v == item.key;
                    });

                    if (!flab) {
                        addViewPathList.push(item.key);
                    }

                    // 是否部门
                    if (item.icon == orgIcon) {
                        if (item.children && item.children.length) {
                            item.children.forEach(childItem=>{
                                ExcludeViewPathList.push(childItem.key);
                            });
                        }
                    }
                }

                if (!checkStatus.checked) {
                    deleteViewPathList.push(item.key);
                }
            }
        });

        xzqhTreeNodes.forEach(item => {
            let checkStatus = item.getCheckStatus();
            if (checkStatus.checked != item.checkedOld || checkStatus.half != item.halfCheckOld) {
                
                if (checkStatus.checked && !checkStatus.half) {
                    var flab = ExcludeViewPathList.some(v=>{
                        return v == item.key;
                    });

                    if (!flab) {
                        addViewPathList.push(item.key);
                    }

                    // 是否部门
                    if (item.icon == orgIcon) {
                        if (item.children && item.children.length) {
                            item.children.forEach(childItem=>{
                                ExcludeViewPathList.push(childItem.key);
                            });
                        }
                    }
                }

                if (!checkStatus.checked) {
                    deleteViewPathList.push(item.key);
                }
            }
        });

        // 去重
        addViewPathList = distinct(addViewPathList);
        deleteViewPathList = distinct(deleteViewPathList);

        

        let platformId = `/${this.vm.platformId}/`
        for (let index = 0; index < deleteViewPathList.length; index++) {
            const item = deleteViewPathList[index];
            if (item == platformId) {
                deleteViewPathList.splice(index, 1);
                break;
            }
        }

        // 释放内存
        ywfzTreeNodes = [];
        xzqhTreeNodes = [];

        if (!addViewPathList.length && !deleteViewPathList.length) {
            this.isAjax = false;
            this.handleCancel();
            this.sbzygl.showTips('success', this.bygl_language.successfulPreservation);
        } else {
            let orgType = 0;
            if (this.viewSelected) {
                orgType = 0;
            } else {
                orgType = 1;
            }
            addViewItem(addViewPathList, deleteViewPathList, this.vm.defaultTreeDeviceId, orgType);
        }

        // 释放内存
        addViewPathList = [];
        deleteViewPathList = [];
    },
    data: [],
    data2: [],
    setChkDisabled: false,
    setChkDisabled2: false,

    viewSelected: true,
    handleView(view) {
        // 业务分组
        let ywfzTreeObj = $.fn.zTree.getZTreeObj('bywgl-ywfz-View');
        let ywfzTreeNodes = [];
        // 行政区划
        let xzqhTreeObj = $.fn.zTree.getZTreeObj('bywgl-xzqh-View');
        let xzqhTreeNodes = [];
        switch (view) {
            case 'ywfz':
                if (xzqhTreeObj) {
                    xzqhTreeNodes = xzqhTreeObj.getChangeCheckedNodes();

                    if (xzqhTreeNodes.length) {
                        // 行政区划已编辑过
                        this.sbzygl.showTips('info', this.bygl_language.administrativedivisionshavebeenedited);
                        this.setChkDisabled = true;
                        this.setChkDisabled2 = false;
                        let nodes = ywfzTreeObj.getNodes();
                        for (let i = 0, l = nodes.length; i < l; i++) {
                            ywfzTreeObj.setChkDisabled(nodes[i], true, true, true);
                        }
                    } else {
                        let nodes = xzqhTreeObj.getNodes();
                        for (let i = 0, l = nodes.length; i < l; i++) {
                            xzqhTreeObj.setChkDisabled(nodes[i], false, true, true);
                        }
                        this.setChkDisabled = false;
                        this.setChkDisabled2 = false;
                    }
                }

                this.viewSelected = true;
                break;
            case 'xzqh':
                this.viewSelected = false;
                if (ywfzTreeObj) {
                    ywfzTreeNodes = ywfzTreeObj.getChangeCheckedNodes();


                    if (ywfzTreeNodes.length) {
                        // 业务分组已编辑过
                        this.sbzygl.showTips('info', this.bygl_language.businessgrouphasbeenedited);
                        this.setChkDisabled = false;
                        this.setChkDisabled2 = true;
                        let nodes = xzqhTreeObj.getNodes();
                        for (let i = 0, l = nodes.length; i < l; i++) {
                            xzqhTreeObj.setChkDisabled(nodes[i], true, true, true);
                        }
                    } else {
                        let nodes = ywfzTreeObj.getNodes();
                        for (let i = 0, l = nodes.length; i < l; i++) {
                            ywfzTreeObj.setChkDisabled(nodes[i], false, true, true);
                        }
                        this.setChkDisabled = false;
                        this.setChkDisabled2 = false;
                    }
                }

                break;
        }
    },
    $form: createForm()
});

dialogViewVm.$watch('show', newShow => {
    if (newShow) {
        dialogViewVm.isAjax = false;
        dialogViewVm.viewSelected = true;
        dialogViewVm.setChkDisabled = false;
        dialogViewVm.setChkDisabled2 = false;
        // 业务分组 、行政区划
        setTimeout(() => {
            $.mask_element('#ptjlgl-bywgl-modal-view', language_txt.xtywgl.bygl.indatasubmissionpleasewaitamoment);

            $.when(dialogViewVm.getTopArchetypeInfo(0, dialogViewVm.vm.defaultTreeDeviceId, true), dialogViewVm.getTopArchetypeInfo(1, dialogViewVm.vm.defaultTreeDeviceId, true)).always(() => {
                $.mask_close_all();
            }).fail(() => {
                $.mask_close_all();
            });
        }, 180);
    }
});

/**
 * 添加视图项和删除视图项
 *
 * @param {*} [addViewPathList=[]] 需要添加的视图节点路径列表 ,
 * @param {*} [deleteViewPathList=[]] 需要移除的视图节点路径列表 
 * @param {*} [platformId=null] 视图所属上级平台ID
 */
function addViewItem(addViewPathList = [], deleteViewPathList = [], platformId = null, orgType = 0) {
    let url = '/gmvcs/uom/device/gb28181/v1/view/addViewItemByNodes';
    ajax({
        url,
        method: 'post',
        data: {
            addViewPathList,
            deleteViewPathList,
            platformId,
            orgType
        }
    }).then(result => {
        if (result.code == 0) {
            dialogViewVm.sbzygl.showTips('success', language_txt.xtywgl.bygl.successfulPreservation);
            dialogViewVm.show = false;
        } else {
            dialogViewVm.sbzygl.showTips('error', result.msg);
        }
    }).always(() => {
        $.mask_close_all();
        dialogViewVm.isAjax = false;
    }).fail(() => {
        dialogViewVm.isAjax = false;
    });
}