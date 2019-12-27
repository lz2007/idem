import avalon from 'avalon2';
import ajax from '../../services/ajaxService';
import {
    createForm,
    message,
    notification
} from 'ane';
import '../common/common-ms-table/common-ms-table'
import './tyyhrzpt-xtpzgl-sbk-rlk.less'
import '../common/common-progress'

export const name = 'xtpzgl-sbk-rlk';
let aaa = null;
avalon.component(name, {
    template: __inline('./tyyhrzpt-xtpzgl-sbk-rlk.html'),
    defaults: {
        loading: false,
        // 表格
        list: avalon.range(23).map(n => ({
            id: n,
            name: '老狼' + n,
            address: '深山',
            province: '老林',
            checked: false
        })),
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
            // console.log(type)
            // console.log(data)
            // console.log(this.list)
        },

        // 分页
        pagination: {
            total: 100,
            pageSize: 20,
            current: 1
        },

        // 分页-当前页
        getCurrent(current) {
            console.log(current)
        },

        // 弹窗-新增
        dialogAddShow: false,

        dialogAddOk() {
            this.dialogAddCel();
        },

        dialogAddCel() {
            this.dialogAddShow = false;
        },

        // 弹窗-删除
        dialogDelShow: false,

        dialogDelOk() {
            this.dialogDelCel();
        },

        dialogDelCel() {
            this.dialogDelShow = false;
        },

        // 弹窗-批量导入
        dialogImportShow: false,

        dialogImportOk() {
            this.dialogImportCel();
        },

        dialogImportCel() {
            this.dialogImportShow = false;
        },

        // 批量导出
        exportExcel() {
            alert('批量导出')
        },

        // 弹窗-新增失败
        dialogaddFailShow: false,

        dialogaddFailtOk() {
            this.dialogaddFailCel();
        },

        dialogaddFailCel() {
            this.dialogaddFailShow = false;
        },

        // 弹窗-人员类型库设置
        dialogRylxkszShow: false,

        dialogRylxkszOk() {
            if (rylxksz.threshold < 80 || rylxksz.threshold > 100) {
                notification.error({
                    message: '识别阀值不在设置范围内',
                    title: '温馨提示'
                });
                return false;
            }
            let selectedIds = [];
            avalon.each(rylxksz.personlistAll, (i, el) => {
                if (el.enable) {
                    selectedIds.push(el.id);
                }
            });

            if (!selectedIds.length) {
                notification.error({
                    message: '人员类型库至少勾选一选',
                    title: '温馨提示'
                });
                return false;
            }
            ajax({
                url: '/gmvcs/uap/person/type/setting',
                method: 'post',
                data: {
                    "selectedIds": selectedIds.join(),
                    "threshold": rylxksz.threshold
                }
            }).then(ret => {
                if (ret.code == 0) {
                    notification.success({
                        message: '修改成功',
                        title: '温馨提示'
                    });
                } else {
                    notification.error({
                        message: ret.msg,
                        title: '温馨提示'
                    });
                }
            });
            this.dialogRylxkszCel();
        },

        dialogRylxkszCel() {
            this.dialogRylxkszShow = false;
        },

        onInit() {
            // 人员类型库设置list
            this.$watch('dialogRylxkszShow', newVal => {
                if (newVal) {
                    ajax({
                        url: '/gmvcs/uap/person/type/find/setting',
                        method: 'get'
                    }).then(ret => {
                        if (ret.code == 0) {
                            rylxksz.personlistAll = ret.data.personTypes;
                            rylxksz.threshold = ret.data.threshold;

                            // 全选是否打钩
                            let flab = true;
                            for (let i = 0; i < rylxksz.personlistAll.length; i++) {
                                if (!rylxksz.personlistAll[i].enable) {
                                    flab = false;
                                    break;
                                }
                            }
                            if (flab) {
                                rylxksz.checkedAll = true;
                            }
                        }
                    });
                }
            });
        }

    }
});

// 弹窗-新增
let docDialogDdd = avalon.define({
    $id: 'doc-dialog-add',
    title: '新增',
    json: '',
    registerPic() {

    },
    $form: createForm({
        onFieldsChange(fields, record) {
            docDialogDdd.json = JSON.stringify(record);
        }
    }),
    save() {
        docDialogDdd.$form.validateFields().then(isAllValid => {
            if (isAllValid) {
                message.success({
                    content: JSON.stringify(docDialogDdd.$form.record)
                });
            }
        })
    }
});

// 弹窗-删除
avalon.define({
    $id: 'doc-dialog-del',
    title: '删除确定'
});

// 弹窗-批量导入
avalon.define({
    $id: 'doc-dialog-import',
    title: '批量导入',
    importUrl: '请选择导入文件路径',
    progress: 0,
    importBtn() {

    },
});

// 弹窗-新增失败
let addFail = avalon.define({
    $id: 'doc-dialog-addFail',
    title: '新增失败人员信息',
    // 表单
    json: '',
    $form: createForm({
        onFieldsChange(fields, record) {
            addFail.json = JSON.stringify(record);
        }
    }),
    search() {
        addFail.$form.validateFields().then(isAllValid => {
            if (isAllValid) {
                message.success({
                    content: JSON.stringify(addFail.$form.record)
                });
            }
        })
    },
    del() {

    },
    delAll() {

    },
    loading: false,
    // 表格
    list: avalon.range(23).map(n => ({
        id: n,
        name: '老狼' + n,
        address: '深山',
        province: '老林',
        checked: false
    })),
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
        // console.log(type)
        // console.log(data)
        // console.log(this.list)
    },
    // 分页
    pagination: {
        total: 100,
        pageSize: 20,
        current: 1
    },
    // 分页-当前页
    getCurrent(current) {
        console.log(current)
    },
});

// 弹窗-人员类型库设置
let rylxksz = avalon.define({
    $id: 'doc-dialog-rylxksz',
    title: '人员类型库设置',
    checkedAll: false,
    threshold: 82,
    personlistAll: [],
    handleChange(config) {
        if (config.value == 'ALL') {
            this.checkedAll = config.checked;
            avalon.each(this.personlistAll, (i, el) => {
                el.enable = config.checked;
            });
        } else {
            this.personlistAll[config.index].enable = config.checked;
            let flab = true;
            if (config.checked) {
                for (let i = 0; i < this.personlistAll.length; i++) {
                    if (!this.personlistAll[i].enable) {
                        flab = false;
                        break;
                    }
                }
                if (flab) {
                    this.checkedAll = true;
                }
            } else {
                this.checkedAll = false;
            }
        }
    },
});

avalon.component('ms-comtable-checkbox', {
    template: `<i class="fa" :css="[checkboxStyle,(config.checked?checkStyle:uncheckStyle)]" :click="@chage | stop | prevent" :class="[(config.checked?'fa-check-square checked':'fa-square-o')]">
                    <span :if="config.label" :html="config.label" :css="{marginLeft:14}"></span>
               </i>`,
    defaults: {
        onInit(e) {},
        config: {},
        checkboxStyle: {
            cursor: 'pointer',
            fontSize: '16px'
        },
        checkStyle: {
            color: '#536b82'
        },
        uncheckStyle: {
            color: '#536b82'
        },
        onChange: avalon.noop,
        chage(event) {
            if (this.config.hasOwnProperty('checked')) {
                this.config.checked = !this.config.checked;
                this.onChange(this.config);
            } else {
                avalon.error('ms-gdkl-checkbox组件 config 参数未传入checked');
            };

        }
    }
});