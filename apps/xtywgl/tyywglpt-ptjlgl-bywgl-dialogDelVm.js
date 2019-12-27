//删除弹窗vm定义
import {
    deleteRole,
    forceDelete
} from '/apps/common/common-gb28181-tyywglpt-device-api';

import {
    refreshList
} from '/apps/common/common-gb28181-ztree-ctl';

import {
    errOK,
    ajaxInfo
} from '/apps/common/common-gb28181-tyywglpt-api';

let language_txt = require('../../vendor/language').language;

export let dialogDelVm = avalon.define({
    $id: 'ptjlgl-bywgl-delete-vm',
    bygl_language: language_txt.xtywgl.bygl,
    show: false,
    isDel: false,
    type: 'device',
    userCode: '',
    treeId: '',
    treeNode: '',
    deviceRids: [],
    isGroup: false,
    isSubmit: false,
    vm: '',
    handleCancel(e) {
        this.show = false;
        this.isSubmit = false;
        $.mask_close_all();
    },
    handleOk() {
        if (!this.isSubmit) {
            this.isSubmit = true;
            $.mask_element('#ptjlgl-bywgl-del-body', this.bygl_language.indatasubmissionpleasewaitamoment);
            if (this.type == 'device') {
                forceDelete(this.deviceRids).then(result => {
                    if (result.code !== errOK) {
                        ajaxInfo('error', (result.msg ? result.msg : this.bygl_language.delFail));
                    } else {
                        ajaxInfo('success', this.bygl_language.delSuccess);
                    }
                    refreshList(this.treeId, this.treeNode, 'del', result, this.vm);
                }).always(() => {
                    this.handleCancel();
                });
            } else {
                deleteRole(this.vm.JurisdictionData.path, this.userCode).then(result => {
                    if (result.code == errOK) {
                        ajaxInfo('success', this.bygl_language.delSuccess);
                        this.vm.queryfindRoleByOrgPath(this.vm.JurisdictionData.path);
                    } else {
                        ajaxInfo('error', result.msg ? result.msg : this.bygl_language.delFail);
                    }
                }).always(() => {
                    this.handleCancel();
                });
            }
        }
    }
});