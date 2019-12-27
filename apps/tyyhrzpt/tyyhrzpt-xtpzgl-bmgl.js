import avalon from 'avalon2';
import {
    createForm,
    notification
} from 'ane';
import * as bootbox from 'bootbox';
import ajax from '../../services/ajaxService';
import {
    bmgl as bmglCtrl
} from '../../services/storeService';
import * as menuServer from '../../services/menuService';
let storage = require('/services/storageService.js').ret;
require('./tyyhrzpt-xtpzgl-bmgl.css');
import {
    Gm
} from '../common/common-tools.js';
export const name = 'tyyhrzpt-xtpzgl-bmgl';

let bmglMan = null;
let bmgl_orgId = '';
let checkType = '';
let bmgl_orgName = '';
let bmgl_last = null;
$('.ztree').click(function (e) {
    bmgl_orgId = '';
});
let Gm_tool = null;
(function() {
    function Tools() {};
    Tools.prototype = Object.create(new Gm().tool);
    Gm_tool = new Tools(); 
})()
avalon.component(name, {
    template: __inline('./tyyhrzpt-xtpzgl-bmgl.html'),
    defaults: {
        tableConfig: {
            body: 'table-saika-tbody',
            name: 'bmgl_table_width',
            arr: ['table-saika-thead'],
        },
        //左键点击部门树时保存点击数据的表单
        $searchForm: createForm({
            autoAsyncChange: true,
            onFieldsChange: function () {

            },
            record: bmgl_initialData()
        }),

        //编辑角色打开弹窗后的默认信息
        editBoard: avalon.define({
            $id: 'edit_info',
            dep_code: '',
            dep_name: '',
            dep_order: ''
        }),
        editRc: avalon.define({
            $id: 'edit_info_rc',
            dep_code: '',
            dep_name: '',
            dep_order: ''
        }),

        //表格操作Vm
        bmgl_operation: avalon.define({
            $id: 'bmgl-operation',
            authority: { // 部门管理功能权限标识
                "CREATE": false, //部门管理_新增
                "DELETE": false, //部门管理_删除
                "EDIT": false, //部门管理_编辑
                "TREE_SHOW": true, //部门树右键的显隐
                "OPT_SHOW": false //操作栏显示方式
            }
        }),

        //右键点击部门树的菜单
        rightMenu: avalon.define({
            $id: 'rMenu',
            left: '',
            top: '',
            display: 'none',
            mouseleave(e) {
                this.display = 'none';
            },
            click: 'btn',
            menuData: [], //右键时存储数据
        }),

        //左侧部门树
        list_tree: avalon.define({
            $id: "lineTree",
            data: [],
            selectedKey: '',
            changeTree: false,
            expandedKeys: [],
            $rightClick: [],
            top: '0px',
            depName: [],
            checking: {},
            selectedTitle: '',
            selectTree(e, treeId, node) {
                bmgl_orgId = node.orgId;
                checkType = node.checkType;
            },
            changeTreeData: changeTreeData,
            extraExpandHandle(treeId, treeNode) {


                //执行用户自定义操作          
                ajax({
                    url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.orgId + '&checkType=' + treeNode.checkType,
                    method: 'get',
                    data: null,
                    cache: false
                }).then(ret => {

                    if (ret.code == 0) {

                        if (ret.data) {
                            var bmgl_tree = $.fn.zTree.getZTreeObj($('#bmgl_orgId .ztree').attr('id'));
                            bmgl_tree.addNodes(treeNode, Tools.addIcon(ret.data));
                            bmgl_tree = null;
                            // nodes = null;
                        } else {
                            this.sayError('请求下级部门数据失败');
                        }
                    } else {
                        this.sayError('请求下级部门数据失败');
                    }
                });
            },
            handleCheck(e, treeId, node) {

                //对部门树点击左键
                //保存数据
                node = e.node;
                bmglMan.rightMenu.menuData = [node];
                window.menuData = [node];
                bmgl_orgId = treeId[0];
                this.selectedKey = bmgl_orgId;
                this.selectedTitle = e.node.orgName;
                checkType = e.node.checkType;

                dataKeeper.setRecord(node);

                //每次左键点击树枝重置选择和默认信息
                bmglMan.editBoard.dep_code = '';
                bmglMan.editBoard.dep_name = '';
                bmglMan.editBoard.dep_order = '';
                table.fetch(true);
                if (node.children && node.children.length) {

                    //已经有子部门 = 已经请求过
                    return;
                } else {
                   
                    if (checkType) {
                        Tools.addTreeNode(bmgl_orgId, checkType);
                    } else {
                        return;
                    }
                }
            }
        }),
        $store: bmglCtrl,
        dialogMain: avalon.define({
            $id: 'dialog_main',
            title: '新增部门',
            isAdd: false,
            isEdit: false,
            isDelete: false,
            isDeleteSingle: false, //单个删除体
            $form: createForm({
                autoAsyncChange: false,
                record: bmgl_initialData(),
            }),
            $record: null,
            manNum: 0,
            record: bmgl_initialData(),
            handleClear: function (dia, prop) {
                $(".add-dialog input[name=" + prop + "]").val('');
                $(".add-dialog input[name=" + prop + "]").focus();
            },
            order_isNull: 'none',
            order_display: 'none',
            orgName_isNull: 'none',
            orgName_display: 'none',
            orgCode_isNull: 'none',
            orgCode_display: 'none',
            dep_code: '',
            dep_name: '',
            dep_order: '',
            path: '', //编辑路径
            orgId: '', //编辑部门id
            updateTime: '', //编辑时间
            bmgl_left_focus(type) {
                switch (type) {
                    case 'order':
                        bmglMan.dialogMain.order_display = 'inline-block';
                        bmglMan.dialogMain.order_isNull = 'none';
                        break;
                    case 'orgName':
                        bmglMan.dialogMain.orgName_display = 'inline-block';
                        bmglMan.dialogMain.orgName_isNull = 'none';
                        break;
                    case 'orgCode':
                        bmglMan.dialogMain.orgCode_display = 'inline-block';
                        bmglMan.dialogMain.orgCode_isNull = 'none';
                        break;
                }
            },
            bmgl_left_blur(type) { //光标失去
                switch (type) {
                    case 'order':
                        bmglMan.dialogMain.order_display = 'none';
                        bmglMan.dialogMain.order_isNull = 'none';
                        break;
                    case 'orgName':
                        bmglMan.dialogMain.orgName_display = 'none';
                        bmglMan.dialogMain.orgName_isNull = 'none';
                        break;
                    case 'orgCode':
                        bmglMan.dialogMain.orgCode_display = 'none';
                        bmglMan.dialogMain.orgCode_isNull = 'none';
                        // this.idCard_display = 'none'; 

                        let orgCode = bmglMan.dialogMain.$form.cachedRecord.orgCode;

                        if (orgCode === '') {
                            return;
                        }
                        if (orgCode.length < 8) {
                            bmglMan.dialogMain.orgCode_isNull = 'block';
                        }
                        if (/[^a-zA-Z0-9]/ig.test(orgCode)) {
                            bmglMan.dialogMain.orgCode_isNull = 'block';
                        }
                        break;
                }
            },
            checkOrder(e, k) {
                var reg = /\d+/g,
                    r = reg.test(String.fromCharCode(e.keyCode || e.charCode));

                if (!r) {
                    // Tools.sayWarn('排序只能输入正整数');
                    bmglMan.dialogMain.order_display = 'none';
                    bmglMan.dialogMain.order_isNull = 'inline-block';
                } else {
                    bmglMan.dialogMain.order_display = 'inline-block';
                    bmglMan.dialogMain.order_isNull = 'none';
                    // if ((e.target.value + String.fromCharCode(e.keyCode)).length > 9) {
                    //     Tools.sayWarn('输入数字的已超过9位数');
                    // }
                }
            },
            checkInput(e) {
                var obj = Tools.checkIE() ? e.srcElement : e.currentTarget;
                $(obj).val(obj.value.replace(/\s+/g, ''));
            },
            beginaCreate(record) {
                this.configOperation('add', record, '新增部门');
            },
            beginUpdate(record) {
                this.configOperation('edit', record, '编辑部门');
            },
            delhandle(record) {
                this.configOperation('delete', record, '确定删除');
            },
            delSghandle(record) {
                this.configOperation('deleteSingle', record, '确定删除');
            },
            configOperation(type, record, content) {
                this.isAdd = false;
                this.isEdit = false;
                this.isDelete = false;
                this.isDeleteSingle = false;
                this.$record = record;
                this.title = content;

                if (type == 'add') {
                    this.isAdd = true;
                } else if (type == 'edit') {
                    this.isEdit = true;
                } else if (type == 'delete') {
                    this.isDelete = true;
                } else if (type == 'deleteSingle') {
                    this.isDeleteSingle = true;
                } else {
                    return;
                }
            },
            submit() {

                if (this.isDelete || this.isDeleteSingle || Tools.checkSpace('Main')) {
                    return [this.isAdd, this.isEdit, this.isDelete, this.$record, this.$form.record, this.isDeleteSingle];
                } else {
                    //no
                }
            }
        }),
        dialogRc: avalon.define({
            $id: 'dialog_main_rc',
            title: '新增部门',
            isAdd: false,
            isEdit: false,
            isDelete: false,
            $form: createForm({
                autoAsyncChange: false,
                record: bmgl_initialData(),
            }),
            $record: null,
            record: bmgl_initialData(),
            order_isNull: 'none',
            order_display: 'none',
            orgName_isNull: 'none',
            orgName_display: 'none',
            orgCode_isNull: 'none',
            orgCode_display: 'none',
            handleClear: function (dia, prop) {
                $(".add-dialog input[name=" + prop + "]").val('');
                $(".add-dialog input[name=" + prop + "]").focus();
            },
            bmgl_left_focus(type) {
                switch (type) {
                    case 'order':
                        bmglMan.dialogRc.order_display = 'inline-block';
                        bmglMan.dialogRc.order_isNull = 'none';
                        break;
                    case 'orgName':
                        bmglMan.dialogRc.orgName_display = 'inline-block';
                        bmglMan.dialogRc.orgName_isNull = 'none';
                        break;
                    case 'orgCode':
                        bmglMan.dialogRc.orgCode_display = 'inline-block';
                        bmglMan.dialogRc.orgCode_isNull = 'none';
                        break;
                        break;
                }
            },
            bmgl_left_blur(type) { //光标失去
                switch (type) {
                    case 'order':
                        bmglMan.dialogRc.order_display = 'none';
                        bmglMan.dialogRc.order_isNull = 'none';
                        break;
                    case 'orgName':
                        bmglMan.dialogRc.orgName_display = 'none';
                        bmglMan.dialogRc.orgName_isNull = 'none';
                        break;
                    case 'orgCode':
                        bmglMan.dialogRc.orgCode_display = 'none';
                        bmglMan.dialogRc.orgCode_isNull = 'none';
                        // this.idCard_display = 'none'; 
                        let orgCode = bmglMan.dialogRc.$form.cachedRecord.orgCode;

                        if (orgCode === '') {
                            return;
                        }
                        if (orgCode.length < 8) {
                            bmglMan.dialogRc.orgCode_isNull = 'block';
                        }
                        if (/[^a-zA-Z0-9]/ig.test(orgCode)) {
                            bmglMan.dialogRc.orgCode_isNull = 'block';
                        }
                        break;
                }
            },
            dep_code: '',
            dep_name: '',
            dep_order: '',
            checkOrder(e, k) {
                var reg = /\d+/g,
                    r = reg.test(String.fromCharCode(e.keyCode));

                if (!r) {
                    // Tools.sayWarn('排序只能输入正整数');
                    bmglMan.dialogRc.order_display = 'none';
                    bmglMan.dialogRc.order_isNull = 'inline-block';
                } else {
                    bmglMan.dialogRc.order_display = 'inline-block';
                    bmglMan.dialogRc.order_isNull = 'none';

                    // if ((e.target.value + String.fromCharCode(e.keyCode)).length > 9) {
                    //     Tools.sayWarn('输入数字的已超过9位数');
                    // }
                }

            },
            beginaCreate(record) {
                this.configOperation('add', record, '新增部门');
            },
            beginUpdate(record) {
                this.configOperation('edit', record, '编辑部门');
            },
            delhandle(record) {
                this.configOperation('delete', record, '确定删除');
            },
            configOperation(type, record, content) {
                this.isAdd = false;
                this.isEdit = false;
                this.isDelete = false;
                this.$record = record;
                this.title = content;

                if (type == 'add') {
                    this.isAdd = true;

                } else if (type == 'edit') {
                    this.isEdit = true;

                } else if (type == 'delete') {
                    this.isDelete = true;

                } else {
                    return;
                }
            },
            submit() {

                if (this.isDelete || Tools.checkSpace('Rc')) {
                    return [this.isAdd, this.isEdit, this.isDelete, this.$record, this.$form.record];
                } else {

                    //no
                }
            }
        }),
        show: false,
        show_rc: false,
        show_confirm: false, //成功后的确认
        handleOk_confirm(e) {
            this.show_confirm = false;
        },
        handleCancel_confirm() {
            this.show_confirm = false;
        },
        handle: {},
        _handle: {

            /*
             *    handle封装了所有dialogs服务逻辑
             *    add    --  点击新增部门逻辑
             *    edit   --  点击编辑部门逻辑
             *    del    --  点击删除部门逻辑
             *    xx_rc  --  点击右键菜单相应的操作
             */
            edit(text, record, index) {

                var edit = avalon.components['tyyhrzpt-xtpzgl-bmgl'].defaults.editBoard;
                this.dialogMain.beginUpdate(record);

                //写入默认信息
                this.dialogMain.$form.record.orgName = this.dialogMain.dep_name = record.orgName ? record.orgName : '';
                this.dialogMain.$form.record.orgCode = this.dialogMain.dep_code = record.orgCode ? record.orgCode : '';
                this.dialogMain.$form.record.orderNo = this.dialogMain.dep_order = record.orderNo ? record.orderNo : '';
                this.dialogMain.path = record.path ? record.path : '';
                this.dialogMain.orgId = record.orgId ? record.orgId : '';
                this.show = true;
                setTimeout(function () {
                    $('[name=orgCode]').attr('disabled', true);
                    $('.bmgl-modalDialog input.form-control[name]').each(function (index, ele) {

                        if ($(ele).parent().attr('class') != 'bmgl-inputWrap') {
                            $(ele).wrap('<div class="bmgl-inputWrap" />');
                        } else {
                            return;
                        }
                    });
                }, 100);
                Tools.addDialogClass('add');
            },
            delSingle(text, record, index) { //删除单个
                this.dialogMain.delSghandle(record);
                this.show = true;
                Tools.addDialogClass('delete');
            },
            del(text, record, index) {

                if (table.$selectOption.length == 0) {
                    notification.error({
                        message: '请勾选表格内的部门',
                        title: '温馨提示'
                    });
                    return;
                };
                var flag = table.$selectOption.every(function (val, key) {
                    return val.children.length == 0;
                });

                if (flag) {
                    this.dialogMain.delhandle(record);
                    this.dialogMain.manNum = table.$selectOption.length;
                    this.show = true;
                    Tools.addDialogClass('delete');
                } else {
                    notification.error({
                        message: '勾选的部门存在子部门无法删除',
                        title: '温馨提示'
                    });
                    return;
                }
            },
            add_rc(text, record, index) {

                if (bmglMan.rightMenu.menuData.length == 0) {
                    notification.error({
                        message: '请选择所属部门',
                        title: '温馨提示'
                    });
                    return;
                };
                this.dialogRc.beginaCreate(this.$store.initialData()); //初始化一套空数据
                this.show_rc = true;

                setTimeout(function () {
                    $('.bmgl-modalDialog input.form-control[name]').each(function (index, ele) {

                        if ($(ele).parent().attr('class') != 'bmgl-inputWrap') {
                            $(ele).wrap('<div class="bmgl-inputWrap" />');
                        } else {
                            return;
                        }
                    });
                }, 100)
                Tools.addDialogClass('add');
            }
        },
        actions(type, text, record, index) {
            this.handle[type] && this.handle[type].apply(this, [text, record, index]);
        },

        //右键菜单的弹窗确认和取消
        handleOk_rc() {

            //弹窗确认的逻辑
            var arr = this.dialogRc.submit();

            if (!(arr instanceof Array)) {
                return;
            }

            var isAdd = arr[0],
                isEdit = arr[1],
                isDelete = arr[2],
                record = arr[3],
                formRecord = bmglMan.dialogRc.$form.cachedRecord;

            if (typeof isAdd === 'boolean' && typeof isEdit === 'boolean' && typeof isDelete === 'boolean') {

                if (isAdd) {

                    if (typeof bmglMan.rightMenu.menuData[0] != 'object') {
                        bmglMan.rightMenu.menuData = Tools.findPathBFS(bmglMan.list_tree.data, bmglMan.rightMenu.menuData[0]);
                    }
                    let arr = bmglMan.rightMenu.menuData[0] ? bmglMan.rightMenu.menuData[0] : window.menuData[0];
                    var params = {
                        orgName: formRecord.orgName,
                        orgCode: formRecord.orgCode,
                        orderNo: formRecord.orderNo,
                        parent: {
                            orgCode:arr.orgCode,
                            path: arr.path,
                            orgId: arr.orgId
                        }
                    }
                    return this.$store.create(params).then(result => {

                        Tools.checkResult(result, {
                            success: '新增部门成功',
                            error: '新增部门请求失败'
                        }, '_rc', 'add', params);
                    });
                } else {
                    throw error('操作异常！');
                }
            }
        },
        handleCancel_rc() {
            $('[name=orgCode]').removeAttr('disabled');
            this.show_rc = false;
            this.dialogRc.$form.record.orgName = this.dialogRc.dep_name = '';
            this.dialogRc.$form.record.orgCode = this.dialogRc.dep_code = '';
            this.dialogRc.$form.record.orderNo = this.dialogRc.dep_order = '';
            Tools.clearInfo();
        },
        handleCancel() {
            $('[name=orgCode]').removeAttr('disabled');
            this.show = false;
            this.dialogMain.$form.record.orgName = this.dialogMain.dep_name = '';
            this.dialogMain.$form.record.orgCode = this.dialogMain.dep_code = '';
            this.dialogMain.$form.record.orderNo = this.dialogMain.dep_order = '';
            Tools.clearInfo();
        },
        handleOk() {

            //弹窗确认的逻辑
            var arr = this.dialogMain.submit();

            if (!(arr instanceof Array)) {
                return;
            }

            var isAdd = arr[0],
                isEdit = arr[1],
                isDelete = arr[2],
                record = arr[3],
                isDeleteSingle = arr[5],
                formRecord = bmglMan.dialogMain.$form.cachedRecord;

            if (typeof isAdd === 'boolean' && typeof isEdit === 'boolean' && typeof isDelete === 'boolean' && typeof isDeleteSingle === 'boolean') {

                //确认编辑部门
                if (isEdit) {
                    return this.$store.update({
                        orgName: formRecord.orgName,
                        orgCode: formRecord.orgCode,
                        orderNo: formRecord.orderNo,
                        path: this.dialogMain.path,
                        orgId: this.dialogMain.orgId,
                        updateTime: Tools.getTimeByDateStr(new Date().Format("yyyy-MM-dd hh:mm:ss")) //当前编辑的时间
                    }).then(result => {

                        //请求成功后重置默认编辑信息
                        Tools.checkResult(result, {
                            success: '编辑成功',
                            error: '编辑请求失败'
                        }, '', 'edit', {
                            orgName: formRecord.orgName,
                            orgCode: formRecord.orgCode,
                            orderNo: formRecord.orderNo,
                            path: this.dialogMain.path,
                            orgId: this.dialogMain.orgId,
                            updateTime: Tools.getTimeByDateStr(new Date().Format("yyyy-MM-dd hh:mm:ss")) //当前编辑的时间
                        });
                    });

                    //确认删除部门
                } else if (isDelete) {
                    var data = [];
                    table.$selectOption.forEach(function (val, key) {
                        data.push(val.orgId);
                    });
                    ajax({
                        url: '/gmvcs/uap/org/batch/delete',
                        type: 'post',
                        data: data,
                        cache: false
                    }).then(result => {

                        if (result.code == '0') {
                            Tools.saySuccess('删除部门成功');
                            table.fetch(true);
                            Tools.refreshTreeNode();
                            bmglMan.show = false;
                            Tools.clearInfo();
                        } else {
                            Tools.sayError(result.msg);
                        }
                    });

                } else if (isDeleteSingle) { //单个删除
                    ajax({
                        url: '/gmvcs/uap/org/batch/delete',
                        type: 'post',
                        data: [record.orgId],
                        cache: false
                    }).then(result => {

                        if (result.code == '0') {
                            Tools.saySuccess('删除部门成功');
                            table.fetch(true);
                            Tools.refreshTreeNode();
                            bmglMan.show = false;
                            Tools.clearInfo();
                        } else {
                            Tools.sayError(result.msg);

                            // if (result.data.ORGANIZE_HAS_CHILDS_ERROR.length != 0) {
                            //     Tools.sayError('该部门存在子部门');
                            // } else if (result.data.ORGANIZE_HAS_USER_ERROR.length != 0) {
                            //     Tools.sayError('该部门存在人员');
                            // }
                        }
                    });
                } else {
                    throw error('操作异常！');
                }
            }
        },
        onReady() {
            $('.table-saika-thead li').each((key, val) => {
                $(val).attr('data-order', key + 1);
            });
            Gm_tool.rebackTableWidth(this.tableConfig);
            Gm_tool.makeTableDrag(this.tableConfig);
            Tools.init();
        },
        onDispose() {
            // bmglMan.list_tree.data = [];
            $('.yhgl-search').css('display', 'none');
        },
        onInit(event) {

            bmglMan = this;
            this.handle = avalon.mix(this._handle, this.handle);
            // Tools.init();

            //在模块切换时重置所有的查询表单字段
            Tools.clearForm();
            // bmglMan.rightMenu.menuData = [];
            dataKeeper.clearData();
            table.clear();

            // 新增、编辑、删除按钮权限控制
            menuServer.menu.then(menu => {

                let list = menu.CAS_FUNC_TYYHRZPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^CAS_FUNC_BMGL/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                if (0 == func_list.length) {
                    // 设置绝对定位的top，防止空白
                    $('#bmglTable').css('top', '75px');
                    return;
                }

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "CAS_FUNC_BMGL_EDIT":
                            bmglMan.bmgl_operation.authority.EDIT = true;
                            break;
                        case "CAS_FUNC_BMGL_CREATE":
                            bmglMan.bmgl_operation.authority.CREATE = true;
                            break;
                        case "CAS_FUNC_BMGL_DELETE":
                            bmglMan.bmgl_operation.authority.DELETE = true;
                            break;
                    }
                });

                if (false == bmglMan.bmgl_operation.authority.EDIT && false == bmglMan.bmgl_operation.authority.DELETE)
                    bmglMan.bmgl_operation.authority.OPT_SHOW = true;
                if (false == bmglMan.bmgl_operation.authority.EDIT && false == bmglMan.bmgl_operation.authority.CREATE && false == bmglMan.bmgl_operation.authority.DELETE)
                    bmglMan.bmgl_operation.authority.TREE_SHOW = false;
                // 设置绝对定位的top，防止空白
                if (false == bmglMan.bmgl_operation.authority.CREATE) {
                    $('#bmglTable').css('top', '75px');
                }
            });
        }
    }
});

function changeTreeData(arr) {
    return Tools.addIcon(arr);
}
//保存着当前操作的部门数据
let dataKeeper = (function () {
    var record = {};
    var selection = null;
    return {
        setRecord: function (data) {
            record = {};
            for (var i in data) {
                record[i] = data[i];
            }
        },
        getRecord: function () {
            return record;
        },
        setSelection: function (data) {
            selection = data;
        },
        getSelection: function () {
            return selection;
        },
        clearData: function () {
            record = {};
            selection = null;
        }
    };
})();
let success_confirm = avalon.define({
    $id: 'success-confirm',
    title: '提示',
    confirmText: ''
});
let table = avalon.define({
    $id: 'doc-table-remote',
    remoteList: [],
    loading: false,
    $store: bmglCtrl,
    $cache: {}, //数据缓存对象，缓存着每次请求的当页数据
    $selectOption: [], //勾选表格行保存该行的数据
    selectedLen: 0,
    pagination: {
        pageSize: 20,
        total: 0,
        current: 0
    },
    flag: 0,
    getCurrent(current) {
        this.pagination.current = current;
    },
    getPageSize(pageSize) {
        this.pagination.pageSize = pageSize;
    },
    handleSelect(record, selected, selectedRows) {
        this.$selectOption = selectedRows;
        Tools.banButton();
    },
    selectChange(selectedRowKeys, selectedRows) {

    },
    handleSelectAll(selectedRowKeys, selectedRows) {
        this.$selectOption = selectedRows;
        Tools.banButton();
    },
    fetch(search, clearMark, initMark) {

        if (!search) {
            var page = this.pagination.current == 0 ? 0 : this.pagination.current - 1;
            this.ajax_table(clearMark, initMark);
        } else {
            this.pagination.current = 0;
            this.$cache = {};
            this.loading = false;
            this.remoteList = [];
            this.flag = 1;
            this.ajax_table(clearMark, initMark);
        }
    },
    ajax_table(clearMark, initMark) {

        var page = this.pagination.current == 0 ? 0 : this.pagination.current - 1,
            id = dataKeeper.getRecord().orgId || bmgl_orgId,
            pageSize = this.pagination.pageSize;
        this.loading = true;

        var bmgl_form_data = null;
        if (storage && storage.getItem) {

            if (storage.getItem('tyyhrzpt-xtpzgl-bmgl')) {
                bmgl_form_data = JSON.parse(storage.getItem('tyyhrzpt-xtpzgl-bmgl'));
            } else {

            }
        } else {

        };

        if (bmgl_form_data == null) {

        } else {
            bmgl_last = bmgl_form_data;
            if (initMark) {
                page = bmgl_form_data.page;
                id = bmgl_form_data.orgId;
                pageSize = bmgl_form_data.pageSize;
            }
        }

        if (!id) {
            table.clear();
            return;
        }
        ajax({
            url: '/gmvcs/uap/org/findChildrenByOrgId',
            type: 'post',
            data: {
                "orgId": id,
                "page": page,
                "pageSize": pageSize
            },
            cache: false
        }).then(ret => {

            if (ret.code == 0) {

                if (storage && storage.setItem) {
                    storage.setItem('tyyhrzpt-xtpzgl-bmgl', JSON.stringify({
                        page: page,
                        orgId: id,
                        pageSize: pageSize
                    }), 0.5);

                } else {

                };
                Tools.clearForm();

                if (!ret.data) {
                    this.$cache[page] = [];
                    this.pagination.total = 0;
                    this.loading = false;
                    return;
                }

                if (ret.data.currentElements && ret.data.currentElements.length == 0) {
                    this.$cache[page] = [];
                    this.pagination.total = 0;
                    this.loading = false;
                } else {

                    //矫正当前页码
                    if (this.flag == 1) {
                        this.pagination.current = 1;
                    }
                    this.flag = 0;

                    this.pagination.total = ret.data.totalElements;
                    this.pagination.current = page + 1;
                    ret.data.currentElements.forEach(function (val, key) {
                        val.space = '';
                        val.orderNo = val.orderNo == null ? '' : val.orderNo;
                        val.extend = val.extend == null ? '' : val.extend;
                        val.dutyRange = val.dutyRange == null ? '' : val.dutyRange;
                        val.index = key + (table.pagination.current - 1) * table.pagination.pageSize + 1; //手动增加表格行号
                    });
                    this.$cache[page] = this.remoteList = ret.data.currentElements;
                    this.loading = false;
                };
            }
        }, () => {
            this.loading = false;
        });
    },
    clear() {
        this.pagination = {
            pageSize: 20,
            total: 0,
            current: 0
        };
        this.$cache = {};
        this.loading = false;
        this.remoteList = [];
        this.flag = 0;
        this.$selectOption = [];
        Tools.banButton();
    },
    handleTableChange(pagination) {

        if (this.pagination.hasOwnProperty('current')) {
            this.pagination.current = pagination;
        }
        this.fetch();
    },
});

let Tools = {
    checkSpace: function (type) {
        var arr = ['orgName', 'orgCode', 'orderNo'],
            isOk = true,
            order = bmglMan['dialog' + type].$form.cachedRecord.orderNo.toString().replace(/\s+/g, ''),
            orgCode = bmglMan['dialog' + type].$form.cachedRecord.orgCode.toString().replace(/\s+/g, '');
        for (var i = 0, len = arr.length; i < len; i++) {

            if (!bmglMan['dialog' + type].$form.cachedRecord[arr[i]].toString().replace(/\s+/g, '')) {
                isOk = false;
                switch (arr[i]) {
                    case 'orgName':
                        // Tools.sayError('部门名称不能为空');
                        bmglMan['dialog' + type].orgName_isNull = 'inline-block';
                        break;
                    case 'orgCode':
                        bmglMan['dialog' + type].orgCode_isNull = 'inline-block';
                        // Tools.sayError('部门编号不能为空');
                        break;
                    case 'orderNo':
                        bmglMan['dialog' + type].order_isNull = 'inline-block';
                        // Tools.sayError('排序不能为空');
                        break;
                }
                return isOk;
                break;
            } else {

            }
        };
        if (order != '' && order.indexOf('.') == -1 && order.indexOf('-') == -1 && !isNaN(order)) {

            if (Number(order) >= 9999) {
                isOk = false;
                bmglMan['dialog' + type].order_isNull = 'inline-block';
                // Tools.sayError('排序值最大已经超过200000000');
            } else {

            }
        } else {
            isOk = false;
            bmglMan['dialog' + type].order_isNull = 'inline-block';
            // Tools.sayError('排序只能为正整数');
        }

        if (orgCode.length < 8) {
            isOk = false;
            bmglMan['dialog' + type].orgCode_isNull = 'inline-block';
        }
        if (/[^a-zA-Z0-9]/ig.test(orgCode)) {
            isOk = false;
            bmglMan['dialog' + type].orgCode_isNull = 'inline-block';
        }
        return isOk;
    },
    sayWarn: function (word) {
        notification.warning({
            message: word,
            title: '温馨提示'
        });
    },
    sayError: function (word) {
        notification.error({
            message: word,
            title: '温馨提示'
        });
    },
    saySuccess: function (word) {
        notification.success({
            message: word,
            title: '温馨提示'
        });
    },
    addIcon: function (arr) {

        // 深拷贝原始数据
        var dataSource = JSON.parse(JSON.stringify(arr))
        var res = [];

        // 每一层的数据都 push 进 res
        res.push(...dataSource);

        // res 动态增加长度
        for (var i = 0; i < res.length; i++) {
            var curData = res[i];
            curData.icon = '/static/image/tyywglpt/org.png?__sprite';
            curData.key = curData.orgId;
            curData.title = curData.orgName;
            curData.isParent = true;
            curData.name = curData.orgName;
            curData.open = false;
            //bmglMan.list_tree.expandedKeys.push(curData.orgId);
            curData.children = curData.childs;

            // null数据置空
            curData.orderNo = curData.orderNo == null ? '' : curData.orderNo;
            curData.dutyRange = curData.dutyRange == null ? '' : curData.dutyRange;
            curData.extend = curData.extend == null ? '' : curData.extend;

            // 如果有 children 则 push 进 res 中待搜索
            if (curData.childs) {

                if (curData.childs.length > 1) {
                    curData.childs.sort(function (a, b) {

                        if (Number(a.orderNo) > Number(b.orderNo)) {
                            return 1;
                        } else if (Number(a.orderNo) < Number(b.orderNo)) {
                            return -1;
                        } else {
                            return a.orgName.localeCompare(b.orgName, 'zh');
                        }
                    });
                }
                res.push(...curData.childs.map(d => {
                    return d;
                }))
            }
        }
        return dataSource;
    },
    addDialogClass: function (type) {
        var className = type + 'Class'
        $('.modal-content').addClass(className);
        $('.modal-content').addClass('draggable');

        if (!$('.modal-dialog').hasClass('bmgl-modalDialog')) {
            $('.modal-dialog').addClass('bmgl-modalDialog');
        } else {
            return;
        }
    },
    checkIE: function () {

        if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE8.0") {
            return true;
        } else {
            return false;
        };
    },
    checkResult: function (result, content, showType, which, params) {

        if (result.code == '0') {
            Tools.saySuccess(content.success);
            // Tools.getTree();
            table.fetch(true);
            bmglMan['show' + showType] = false;
            Tools.clearInfo();
            Tools.refreshTreeNode();
        } else if (result.code == '1032') {
            notification.error({
                message: '部门在用户的管理范围中',
                title: '温馨提示'
            });
        } else {
            result.msg ? notification.error({
                message: result.msg,
                title: '温馨提示'
            }) : notification.error({
                message: content.error,
                title: '温馨提示'
            });
            return;
        }
    },
    banButton: function () {

        if (table.$selectOption.length >= 1) {
            $('#addDep').addClass('ban-label').attr({
                "disabled": "disabled"
            });
            $(".bmgl-del-all-btn").removeClass('disabled').attr('disabled', false);
        } else {
            $('#addDep').removeClass('ban-label').attr({
                "disabled": false
            });
            $(".bmgl-del-all-btn").addClass('disabled').attr('disabled', 'disabled');
        };

        if (table.$selectOption.length > 1) {
            $('#editDep').addClass('ban-label').attr({
                "disabled": "disabled"
            });
        } else {
            $('#editDep').removeClass('ban-label').attr({
                "disabled": false
            });
        };
    },
    clearForm: function () {
        table.$selectOption = [];
        Tools.banButton();
        bmglMan.editBoard.dep_code = '';
        bmglMan.editBoard.dep_name = '';
        bmglMan.editBoard.dep_order = '';
    },
    clearInfo: function () {
        ['dialogRc', 'dialogMain'].forEach(function (val, key) {
            bmglMan[val].order_isNull = 'none';
            bmglMan[val].order_display = 'none';
            bmglMan[val].orgName_isNull = 'none';
            bmglMan[val].orgName_display = 'none';
            bmglMan[val].orgCode_isNull = 'none';
            bmglMan[val].orgCode_display = 'none';
        });
    },
    findPathBFS: function (source, goal) {

        if (goal == '') {
            notification.error({
                message: '请准确右键点击部门！',
                title: '温馨提示'
            });
            return;
        };

        // 深拷贝原始数据
        var dataSource = JSON.parse(JSON.stringify(source))
        var res = [];

        // 每一层的数据都 push 进 res
        res.push(...dataSource);

        // res 动态增加长度
        for (var i = 0; i < res.length; i++) {
            var curData = res[i];

            // 匹配成功
            if (curData.orgId === goal) {
                var result = [];

                // 返回当前对象及其父节点所组成的结果
                return (function findParent(data) {
                    result.unshift(curData);
                    return result;
                })(curData)
            }

            // 如果有 children 则 push 进 res 中待搜索
            if (curData.childs) {
                res.push(...curData.childs.map(d => {

                    // 在每一个数据中增加 parent，为了记录路径使用
                    d.parent = curData
                    return d
                }))
            }
        }

        // 没有搜索到结果，默认返回空数组
        return []
    },
    toggleTree: function () {
        var zTree = $.fn.zTree.getZTreeObj("xtree");
        var nodes = zTree.getSelectedNodes();
        for (var i = 0, l = nodes.length; i < l; i++) {
            zTree.setting.view.fontCss = {};
            zTree.expandNode(nodes[i], null, null, null, true);
        }
    },
    refreshTreeNode: function () {
        var bmgl_tree = $.fn.zTree.getZTreeObj($('#bmgl_orgId .ztree').attr('id'));
        var nodes = bmgl_tree.getNodesByParam("orgId", bmgl_orgId, null);
        bmgl_tree.removeChildNodes(nodes[0]);
        Tools.addTreeNode(bmgl_orgId, nodes[0].checkType);
        bmgl_tree = null;
        nodes = null;
    },
    addTreeNode: function (id, checkType) {

        //执行用户自定义操作          
        ajax({
            url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + id + '&checkType=' + checkType,
            method: 'get',
            data: null,
            cache: false
        }).then(ret => {

            if (ret.code == 0) {

                if (ret.data) {
                    var bmgl_tree = $.fn.zTree.getZTreeObj($('#bmgl_orgId .ztree').attr('id'));
                    var nodes = bmgl_tree.getNodesByParam("orgId", id, null);
                    bmgl_tree.addNodes(nodes[0], Tools.addIcon(ret.data));
                    bmgl_tree = null;
                    nodes = null;
                } else {
                    this.sayError('请求下级部门数据失败');
                }
            } else {
                this.sayError('请求下级部门数据失败');
            }
        });
    },
    getTree: function (mark) {
        ajax({
            url: '/gmvcs/uap/org/find/fakeroot/mgr',
            method: 'get',
            cache: false,
            data: null
        }).then(ret => {

            if (ret.code == 0) {
                var bmgl_form_data = null;

                if (storage && storage.getItem) {

                    if (storage.getItem('tyyhrzpt-xtpzgl-bmgl')) {
                        bmgl_form_data = JSON.parse(storage.getItem('tyyhrzpt-xtpzgl-bmgl'));
                    } else {

                    }
                } else {

                };
                var vmtree = avalon.components['tyyhrzpt-xtpzgl-bmgl'].defaults.list_tree;
                vmtree.data = Tools.addIcon(ret.data);
                vmtree.changeTree = !vmtree.changeTree;
                bmglMan.rightMenu.menuData = [bmgl_form_data ? bmgl_form_data.orgId : ret.data[0]];
                bmgl_orgId = bmgl_form_data ? bmgl_form_data.orgId : ret.data[0].orgId;
                checkType = ret.data[0].checkType;
                vmtree.selectedKey = bmgl_form_data ? bmgl_form_data.orgId : (ret.data ? ret.data[0].orgId : '');
                // vmtree.expandedKeys = bmgl_form_data ? [bmgl_form_data.orgId] : (ret.data ? [ret.data[0].orgId] : ['']);
                table.fetch(true, '', true);

                var bmgl_tree = $.fn.zTree.getZTreeObj($('#bmgl_orgId .ztree').attr('id'));
                var nodes = bmgl_tree.getNodesByParam("orgId", bmgl_orgId, null);
                bmgl_tree.selectNode(nodes[0], true, true, true);
                // bmgl_tree.expandNode(nodes[0], true, true, true);

                if (!bmgl_form_data) {
                    Tools.addTreeNode(bmgl_orgId, checkType);
                }
                bmgl_tree = null;
                nodes = null;
                bmgl_form_data = null;
                vmtree = null;
            }
        });
    },
    getTimeByDateStr: function (stringTime) {
        var s = stringTime.split(" ");
        var s1 = s[0].split("-");
        var s2 = s[1].split(":");
        if (s2.length == 2) {
            s2.push("00");
        }

        return new Date(s1[0], s1[1] - 1, s1[2], s2[0], s2[1], s2[2]).getTime();

        // 火狐不支持该方法，IE CHROME支持
        //var dt = new Date(stringTime.replace(/-/, "/"));
        //return dt.getTime();
    },
    init: function () {
        this.getTree(true);
        // table.fetch(true);
    }
};

//初始化searchForm的record和远程获取Tree数据
function bmgl_initialData() {
    return {}
};

//自定义事件
function EventTarget() {
    this.handlers = {};
};
EventTarget.prototype = {
    constructor: EventTarget,
    addHandler: function (type, handler) {

        if (typeof this.handlers[type] == 'undefined') {
            this.handlers[type] = [];
        };
        this.handlers[type].push(handler);
    },
    fire: function (event) {

        if (!event.target) {
            event.target = this;
        };

        if (this.handlers[event.type] instanceof Array) {
            var handlers = this.handlers[event.type];
            for (var i = 0, len = handlers.length; i < len; i++) {
                handlers[i](event);
            };
        };
    },
    removeHandler: function (type, handler) {

        if (this.handlers[event.type] instanceof Array) {
            var handlers = this.handlers[type];
            for (var i = 0, len = handlers.length; i < len; i++) {

                if (handlers[i] === handler) {
                    break;
                }
            };
            handlers.splice(i, 1);
        }
    }
};

//拖放
var DragDrop = function () {
    var dragdrap = new EventTarget(),
        dragging = null,
        diffX = 0,
        diffY = 0;

    function handleEvent(event) {

        event = event || window.event;
        var target = event.target || event.srcElement,
            targetParent = target.offsetParent;

        if (targetParent == null) {
            return;
        }

        switch (event.type) {
            case 'mousedown':

                if (targetParent.className && targetParent.className.indexOf('draggable') > -1) {
                    dragging = targetParent;
                    diffX = event.clientX - targetParent.offsetLeft;
                    diffY = event.clientY - targetParent.offsetTop;
                    dragdrap.fire({
                        type: 'dragstart',
                        target: dragging,
                        x: event.clientX,
                        y: event.clientY
                    });
                } else {
                    return;
                }
                break;

            case 'mousemove':

                if (dragging !== null) {
                    dragging.style.left = (event.clientX - diffX) + 'px';
                    dragging.style.top = (event.clientY - diffY) + 'px';
                    dragdrap.fire({
                        type: 'drag',
                        target: dragging,
                        x: event.clientX,
                        y: event.clientY
                    });
                } else {
                    return;
                }
                break;

            case 'mouseup':

                if (dragging !== null) {
                    dragdrap.fire({
                        type: 'dragend',
                        target: dragging,
                        x: event.clientX,
                        y: event.clientY
                    });
                    dragging = null;
                } else {
                    return;
                }
                break;
        };
    };
    dragdrap.enable = function () {
        $(document).mousedown(handleEvent);
        $(document).mousemove(handleEvent);
        $(document).mouseup(handleEvent);
    };
    dragdrap.disable = function () {
        $(document).unbind('mousedown');
        $(document).unbind('mousemove');
        $(document).unbind('mouseup');
    }
    return dragdrap;
}();
DragDrop.addHandler('dragstart', function (event) {

});
DragDrop.addHandler('drag', function (event) {

});
DragDrop.addHandler('dragend', function (event) {

});
DragDrop.enable();