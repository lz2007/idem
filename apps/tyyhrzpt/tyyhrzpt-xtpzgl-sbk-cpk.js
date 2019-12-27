import avalon from 'avalon2';
import ajax from '../../services/ajaxService';
import * as menuServer from '../../services/menuService';
import "ane";
import {
    createForm,
    notification,
    message
} from 'ane';
import {
    apiUrl,
    accountType
} from '../../services/configService';
require('/apps/common/common-ajax-fileupload');
import '../../vendor/jquery/jquery.ztree.all.js';
import moment from 'moment';
import './tyyhrzpt-xtpzgl-sbk-cpk.less';
import {
    picFuc
} from "/vendor/pic_player/picasa.js";
import '../common/common-ms-table/common-ms-table';
import '../common/common-progress';
let storage = require('/services/storageService.js').ret;

export const name = 'xtpzgl-sbk-cpk';

/**
 *      ┌─┐       ┌─┐
 *   ┌──┘ ┴───────┘ ┴──┐
 *   │                 │
 *   │       ───       │
 *   │  ─┬┘       └┬─  │
 *   │                 │
 *   │       ─┴─       │
 *   │                 │
 *   └───┐         ┌───┘
 *       │         │
 *       │         │
 *       │         │
 *       │         └──────────────┐
 *       │                        │
 *       │                        ├─┐
 *       │                        ┌─┘
 *       │                        │
 *       └─┐  ┐  ┌───────┬──┐  ┌──┘
 *         │ ─┤ ─┤       │ ─┤ ─┤
 *         └──┴──┘       └──┴──┘
 *                神兽保佑
 *               代码无BUG!
 */
/**
 *      ┌─┐       ┌─┐
 *   ┌──┘ ┴───────┘ ┴──┐
 *   │                 │
 *   │       ───       │
 *   │  ─┬┘       └┬─  │
 *   │                 │
 *   │       ─┴─       │
 *   │                 │
 *   └───┐         ┌───┘
 *       │         │
 *       │         │
 *       │         │
 *       │         └──────────────┐
 *       │                        │
 *       │                        ├─┐
 *       │                        ┌─┘
 *       │                        │
 *       └─┐  ┐  ┌───────┬──┐  ┌──┘
 *         │ ─┤ ─┤       │ ─┤ ─┤
 *         └──┴──┘       └──┴──┘
 *                神兽保佑
 *               代码无BUG!
 */

Array.prototype.in_array = function (e) {
    var r = new RegExp(',' + e + ',');
    return (r.test(',' + this.join(this.S) + ','));
};

let cpk_man = null;
avalon.component(name, {
    template: __inline('./tyyhrzpt-xtpzgl-sbk-cpk.html'),
    defaults: {
        // 权限控制
        CAS_FUNC_TYYHRZPT: [],
        newAddCPKtypeObj: {}, //新增车牌库
        tree_data: [], //车牌类型库数据
        selectCPKId: '', //左侧选中的车牌库ID

        // 右侧勾选的列表行ID

        checked_cpkInfo: [], //保存勾选对象
        checked_cpkInfoID: [], //保存勾选对象ID        

        search_close: false,
        isClick: true, //如果是 edit/empty/del，就不查询
        newCount: '1',
        CPK_DELETE: true,

        showIconForTree(treeId, treeNode) {
            return !treeNode.isParent;
        },
        searchFunc() {
            this.change_page = false;
            this.curPage = 1;
            this.table_pagination.current = 1;
            Tools.listAllByPageCPKInfo();
        },

        input_focus(e) {
            switch (e) {
                case 'search':
                    this.search_close = true;
                    break;
                default:
            }
        },
        input_blur(e, name) {
            //修复查询输入框复制黏贴bug
            $(e.target).val($(e.target).val().replace(/[`~!.;:,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, ''));
            $('#exampleInputAmount').val = $(e.target).val();
            switch (name) {
                case 'search':
                    this.search_close = false;
                    break;
                default:
            }
        },
        close_click(e) {
            switch (e) {
                case 'search':
                    $('#exampleInputAmount').val('');
                    $('#exampleInputAmount').attr("title", "");
                    $('#exampleInputAmount').focus();
                    break;
                default:
            }
        },
        // 显示树 
        show_cpk_tree(zTreeNodes) {
            let setting = {
                    view: {
                        addHoverDom: Tools.addHoverDom,
                        removeHoverDom: Tools.removeHoverDom,
                        selectedMulti: false,
                        showIcon: false,
                        showLine: false
                    },
                    edit: {
                        enable: false
                        // showRemoveBtn: true,
                        // showRenameBtn: true
                    },
                    data: {
                        keep: {
                            parent: true,
                            leaf: true
                        },
                        simpleData: {
                            enable: true
                        }
                    },
                    callback: {
                        onClick: this.click_tree,
                        onRename: this.edit,
                        onRemove: Tools.deleteCPK,
                    }
                },
                zTreeObj = $.fn.zTree.init($("#cpkTree"), setting, zTreeNodes);
        },

        click_tree(event, treeId, treeNode) {
            if (!this.isClick) {
                return;
            }
            this.selectCPKId = treeNode.id;

            if (treeNode.id == '9999') {
                return;
            } //点击全部，不作处理
            if (this.selectCPKId) {
                //移除置灰样式
                $('.newAdd-disabled').removeClass('selectedCPK');

                $('.BatchImport-disabled').removeClass('selectedCPK');
                $('.addFail-disabled').removeClass('selectedCPK');
                $('.carType-disabled').removeClass('selectedCPK');
                $('.carModelExl-disabled').removeClass('selectedCPK');

                $('.input-group-addon').addClass('input-group-addonOK');
            }
            this.searchFunc();
            // if (treeNode.level == 0) { return false; }
            // var zTree = $.fn.zTree.getZTreeObj("cpkTree"),
            //     nodes = zTree.getSelectedNodes(),
            //     treeNode = nodes[0];
            // if (nodes.length == 0) {
            //     alert("请先选择车辆类型库");
            //     return;
            // }
            // zTree.editName(treeNode);
        },

        // 新增车牌库
        addCPK(e) {
            // Tools.saveCPK();
            addCarDb.carDbName = '';
            addCarDb.carDbdescription = '';
            this.dialogAddCarDb = true;
            addCarDb.isEdit = false;
        },
        edit(treeNode) {
            this.dialogAddCarDb = true;

            addCarDb.carDbName = treeNode.name;
            addCarDb.carDbdescription = treeNode.dbDesc;
            addCarDb.treeNode = treeNode;
            addCarDb.isEdit = true;
        },

        // =====================================================左侧列表=================================================================       
        dialogCarDbCancel() {
            this.isClick = true;
            this.dialogAddCarDb = false;
        },
        dialogCarDbOk() {
            if (addCarDb.isEdit) {
                addCarDb.treeNode = addCarDb.treeNode;
                addCarDb.treeNode.dbName = addCarDb.carDbName;
                addCarDb.treeNode.dbDesc = addCarDb.carDbdescription;
                Tools.editCPK(addCarDb.treeNode);
            } else {
                Tools.saveCPK();
            }
        },
        //弹窗-新增车辆库类型
        dialogAddCarDb: false,
        // 弹窗-新增
        dialogAddShow: false,
        // 图片放大弹窗
        dialogBigPicShow: false,
        // 弹窗-删除
        dialogDelShow: false,
        // 弹窗-批量导入
        dialogImportShow: false,
        // 弹窗-新增失败
        dialogaddFailShow: false,
        // 弹窗-车辆类型库设置
        dialogRylxkszShow: false,

        change_page: false,
        search_data: {},

        loading: false,
        table_pagination: {
            current: 0,
            pageSize: 20,
            total: 0,
            current_len: 0,
            totalPages: 0
        },
        // 表格
        list: [],
        curPage: 1,
        //翻页
        $computed: {
            pagination: function () {
                return {
                    current: this.table_pagination.current,
                    pageSize: this.table_pagination.pageSize,
                    total: this.table_pagination.total,
                    onChange: this.handlePageChange
                };
            }
        },
        getCurrent(current) {
            this.table_pagination.current = current;
            this.curPage = current;
        },
        getPageSize(pageSize) {
            this.table_pagination.pageSize = pageSize;
        },
        handlePageChange(page) {

            this.change_page = true;
            this.curPage = page;
            this.table_pagination.current = page;
            Tools.listAllByPageCPKInfo(); //查询
        },
        // 表格-操作回调
        actions(type, text, record, index) {
            if (type == 'delete') {
                // this.list.removeAll(el => el.id == record.id);
                Tools.deleteCPKInfo(record.carId);
            } else if (type == 'modify') {
                cpk_man.dialogAddShow = true;
                docDialogDdd.title = '修改';
                // console.log(record);
                docDialogDdd.$form.record = record;
                
                docDialogDdd.carBrand = record.carBrand;
                docDialogDdd.carColor = record.carColor;
                docDialogDdd.carEngineNo = record.carEngineNo;
                docDialogDdd.carId = record.carId;
                docDialogDdd.carIdCard = record.carIdCard;
                docDialogDdd.carNumber = record.carNumber;
                docDialogDdd.carOwner = record.carOwner;
                docDialogDdd.carOwnerAddress = record.carOwnerAddress;
                docDialogDdd.carRegImgUrl = record.carRegImgUrl;
                docDialogDdd.carTypeCode = record.carTypeCode;
                // docDialogDdd.carTypeDbId = record.selectCPKId;
                docDialogDdd.carUseCode = record.carUseCode;
                docDialogDdd.carTypeDbId = record.carTypeDbId;
                docDialogDdd.carValid = record.carValid;

                docDialogDdd.carRegImgUrl = record.carRegImgUrl;
            } else if ((type == 'big')) {
                picVM.picSRC = record.carRegImgUrl;
                cpk_man.dialogBigPicShow = true;
                $("#bigPic").attr("rel", "Picasa[" + encodeURI(record.carRegImgUrl) + "]");
                let pic_obj = new picFuc();
                pic_obj.picasa_init("bigPic");
            }
        },

        // 权限
        opt_rlbk: avalon.define({
            $id: "opt_rlbk",
            authority: { // 按钮权限标识
                "CAS_FUNC_SBK_CPK_EDIT": false, //智能识别-人脸布控-修改
                "CAS_FUNC_SBK_CPK_DELETE": false, //智能识别-人脸布控-查询
            }
        }),

        // 表格-勾选回调(表格一)
        selectChange(type, data) {
            let objs = this.list;
            this.checked_cpkInfo = [];
            objs.forEach((val, key) => {
                if (val.checked) {
                    this.checked_cpkInfo.push(val);
                }
            });
            if (this.checked_cpkInfo.length > 0) {
                $('.BatchExport-disabled').removeClass('selectedCPK');
                $('.BatchDelete-disabled').removeClass('selectedCPK');
            } else {
                $('.BatchExport-disabled').addClass('selectedCPK');
                $('.BatchDelete-disabled').addClass('selectedCPK');
            }

            if (type == 'one') {
                if (data.checked) {
                    //有勾选则保存勾选数据

                } else {

                }
            } else if (type == 'all') {
                if (data.checked) {

                } else {
                    this.checked_cpkInfo = [];
                }
            }
        },
        handleSelect(record, selected, selectedRows) {
            this.$selectOption = selectedRows;
            // Tools.banButton();
        },
        handleSelectAll(selectedRowKeys, selectedRows) {
            // this.$selectOption = selectedRows;
            // Tools.banButton();
        },

        dialogAddOk() {
            let params = docDialogDdd.$form.record;

            if (!params.carNumber) { //车牌号码
                notification.warn({
                    message: "请填写车牌号码！",
                    title: "温馨提示"
                });
                return;
            }
            if (!params.carTypeCode) { //车牌类型
                notification.warn({
                    message: "请填写车牌类型！",
                    title: "温馨提示"
                });
                return;
            }
            if (!params.carValid) { //有效日期
                notification.warn({
                    message: "请填写有效日期！",
                    title: "温馨提示"
                });
                return;
            }
            if (!params.carOwner) { //所有人
                notification.warn({
                    message: "请填写所有人！",
                    title: "温馨提示"
                });
                return;
            }
            if (!params.carUseCode) { //使用性质
                notification.warn({
                    message: "请填写使用性质！",
                    title: "温馨提示"
                });
                return;
            }
            if (!params.carBrand) { //品牌型号
                notification.warn({
                    message: "请填写品牌型号！",
                    title: "温馨提示"
                });
                return;
            }
            // if (params.carColor) { //车辆颜色：
            //     notification.warn({
            //         message: "请填写车牌号码！",
            //         title: "温馨提示"
            //     });
            //     return;
            // }
            // if (!params.carOwnerAddress) { //住址：
            //     notification.warn({
            //         message: "请填写住址！",
            //         title: "温馨提示"
            //     });
            //     return;
            // }
            // if (!params.remarks) { //备注：
            //     notification.warn({
            //         message: "请填写备注！",
            //         title: "温馨提示"
            //     });
            //     return;
            // }
            if (!params.carIdCard) { //车辆识别代号：
                notification.warn({
                    message: "请填写车辆识别代号！",
                    title: "温馨提示"
                });
                return;
            }
            if (!params.carEngineNo) { //发动机号码：
                notification.warn({
                    message: "请填写发动机号码！",
                    title: "温馨提示"
                });
                return;
            }
            //判断注册照片
            if (!docDialogDdd.carRegImgUrl) {
                notification.warn({
                    message: "请选择注册图片！",
                    title: "温馨提示"
                });
                return;
            }
            if (cpk_man.selectCPKId == '') {
                alert('请选择车辆库类型！');
                // notification.warn({
                //     message: "请选择车辆库类型！",
                //     title: "温馨提示"
                // });
                return;
            }

            docDialogDdd.save(); //保存
        },

        dialogAddCel() {
            this.dialogAddShow = false;
            // 关闭新增，初始化数据
            docDialogDdd.carBrand = '';
            docDialogDdd.carColor = '';
            docDialogDdd.carEngineNo = '';
            docDialogDdd.carId = '';
            docDialogDdd.carIdCard = '';
            docDialogDdd.carNumber = '';
            docDialogDdd.carOwner = '';
            docDialogDdd.carOwnerAddress = '';
            docDialogDdd.carRegImgUrl = '';
            docDialogDdd.carTypeCode = '';
            docDialogDdd.carTypeDbId = this.selectCPKId;
            docDialogDdd.carUseCode = '';
            docDialogDdd.carTypeDbId = '';
            docDialogDdd.carValid = '';
            // docDialogDdd.remarks = {
            //     "carBrand": "",
            //     "carColor": "",
            //     "carEngineNo": "",
            //     "carId": "",
            //     "carIdCard": "",
            //     "carNumber": "",
            //     "carOwner": "",
            //     "carOwnerAddress": "",
            //     "carRegImgUrl": "",
            //     "carTypeCode": "",
            //     "carTypeDbId": this.selectCPKId,
            //     "carUseCode": "",
            //     "carValid": "",
            //     "remarks": ""
            // };
        },

        //车辆类型库设置
        click_typeSet() {
            if ($('.carType-disabled').hasClass('selectedCPK')) {
                return;
            }
            this.dialogRylxkszShow = true;
        },

        // 车辆信息导出模板
        click_exportModel() {
            if ($('.carModelExl-disabled').hasClass('selectedCPK')) {
                return;
            }
            Tools.exportCarTemplate();
        },


        // 新增按钮
        click_newAdd() {
            // 判断是否点击车辆库
            if ($('.newAdd-disabled').hasClass('selectedCPK')) {
                return;
            }
            this.dialogAddShow = true;
            docDialogDdd.title = '新增';
            
        },
        // 批量导入按钮
        click_dialogBatchImport() {
            if ($('.BatchImport-disabled').hasClass('selectedCPK')) {
                return;
            }
            if (!this.selectCPKId) {
                notification.warn({
                    message: '请选择需要导入的车辆库',
                    title: '温馨提示'
                });
                return;
            }
            this.dialogImportShow = true;
            importEXL.progress = 0;
        },
        // 批量删除按钮
        click_dialogDel() {
            if ($('.BatchDelete-disabled').hasClass('selectedCPK')) {
                return;
            }
            this.dialogDelShow = true;
            // if (this.checked_cpkInfo.length == 0) {
            //     this.dialogDelShow = false;
            //     notification.warn({
            //         message: '请勾选需要删除数据',
            //         title: '温馨提示'
            //     });
            //     return;
            // } else {
            //     this.dialogDelShow = true;
            // }
        },

        dialogDelCancel() {
            this.dialogDelShow = false;

            addFail.isdel = false;
            addFail.isBatchDel = false;
            this.cpkIsDel = false;
        },

        dialogPicCancel() {
            this.dialogBigPicShow = false;
        },
        cpkIsDel: false,
        //删除按钮-确定        
        dialogDelCel() {
            //确认删除     
            // 新增失败   删除or全部删除
            if (addFail.isdel) {
                Tools.batchDeleteAddFailInfo();
                return;
            }
            if (addFail.isBatchDel) {
                Tools.deleteCPKFailInfo(cpk_man.selectCPKId); //全部
                return;
            }
            if (this.cpkIsDel) {
                Tools.deleteCPK(cpk_man.selectCPKId);
                return;
            }
            //车辆信息确认删除
            let objs = this.list;
            let ids = [];
            objs.forEach((val, key) => {
                if (val.checked) {
                    ids.push(val.carId);
                }
            });
            Tools.batchDeleteCPKInfo(ids);


        },


        dialogImportOk() {
            if (importEXL.importUrl == '请选择导入文件路径') {
                notification.info({
                    message: "请先选择文件，谢谢",
                    title: "温馨提示"
                });
                return;
            }
            Tools.importCars();
        },

        dialogImportCel() {
            importEXL.importUrl = '请选择导入文件路径';
            this.dialogImportShow = false;
            importEXL.progress = 0;
        },

        // 批量导出按钮
        exportExcel() {
            if ($('.BatchExport-disabled').hasClass('selectedCPK')) {
                return;
            }
            if (!this.selectCPKId) {
                notification.warn({
                    message: '请选择需要导出的车辆库',
                    title: '温馨提示'
                });
                return;
            }
            let ids = [];
            cpk_man.list.forEach((val, key) => {
                if (val.checked) {
                    ids.push(val.carId);
                }
            });
            let carNumber = $("#exampleInputAmount").val();
            window.location.href = "http://" + window.location.host + apiUrl + '/gmvcs/uap/car/recognition/listAllByPage/excel?carTypeDbId=' + this.selectCPKId + '&&carNumber=' + carNumber + '&&carIdList=' + ids; //远程服务器使用       
        },
        //新增失败
        click_newFail() {
            if ($('.addFail-disabled').hasClass('selectedCPK')) {
                return;
            }
            addFail.list = [];
            addFail.endTime = moment().format('YYYY-MM-DD 23:59:59');
            addFail.beginTime = moment().format('YYYY-MM-DD 00:00:00');
            addFail.search();
            cpk_man.dialogaddFailShow = true;

        },

        dialogaddFailtOk() {

        },

        dialogaddFailCel() {
            this.dialogaddFailShow = false;
        },

        dialogRylxkszOk() {

            let selectedIds = [];
            avalon.each(rylxksz.personlistAll, (i, el) => {
                let obj = {};
                obj.enable = el.enable;
                obj.id = el.id;
                selectedIds.push(obj);
            });

            if (!selectedIds.length) {
                notification.warn({
                    message: '车辆类型库至少勾选一选',
                    title: '温馨提示'
                });
                return false;
            }
            ajax({
                url: '/gmvcs/uap/car/type/setting',
                method: 'post',
                data: {
                    "list": selectedIds
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
        onInit(event) {
            // 初始化            
            // 获取权限
            menuServer.menu.then(menu => {
                this.CAS_FUNC_TYYHRZPT = menu.CAS_FUNC_TYYHRZPT;
                this.opt_rlbk.authority.CAS_FUNC_SBK_CPK_EDIT = this.CAS_FUNC_TYYHRZPT.in_array('CAS_FUNC_SBK_CPK_EDIT');
                this.opt_rlbk.authority.CAS_FUNC_SBK_CPK_DELETE = this.CAS_FUNC_TYYHRZPT.in_array('CAS_FUNC_SBK_CPK_DELETE');
            });

            cpk_man = this;

            Tools.findByDicTypeCode(); //获取车辆类型信息

            // 车辆类型库设置list
            this.$watch('dialogRylxkszShow', newVal => {
                if (newVal) {
                    ajax({
                        url: '/gmvcs/uap/car/type/listAll',
                        method: 'get'
                    }).then(ret => {
                        if (ret.code == 0) {
                            rylxksz.personlistAll = ret.data;

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
        },
        onReady() {
            // 页面准备
            $("#addCKP").bind("click", {
                isParent: true
            }, this.addCPK);
            $(window).resize(function () {
                set_size();
                // tableObject_zfypsjj.setForm();
            });

            let storage_item = storage.getItem('tyyhrzpt-xtpzgl-sbk-cpk');
            if (storage_item) {
                this.selectCPKId = storage_item.carTypeDbId;
                if (this.selectCPKId) {
                    //移除置灰样式
                    $('.newAdd-disabled').removeClass('selectedCPK');

                    $('.BatchImport-disabled').removeClass('selectedCPK');
                    $('.addFail-disabled').removeClass('selectedCPK');
                    $('.carType-disabled').removeClass('selectedCPK');
                    $('.carModelExl-disabled').removeClass('selectedCPK');

                    $('.input-group-addon').addClass('input-group-addonOK');
                }
                this.search_data = storage_item;
                this.change_page = true;
                $("#exampleInputAmount").val(storage_item.carNumber);
                this.curPage = storage_item.page + 1;
                this.table_pagination.current = storage_item.page + 1;
                // Tools.listAllByPageCPKInfo();
                Tools.cpk_listAll(storage_item.carTypeDbId); //获取车辆库列表
            } else {
                Tools.cpk_listAll(); //获取车辆库列表
            }
        },
        onDispose() {
            // 页面消亡
        }

    }
});

// 弹窗-新增
let docDialogDdd = avalon.define({
    $id: 'doc-dialog-addCPKInfo',
    title: '新增',
    json: '',
    carTypeObj: [],
    // registerUrl: '',
    carRegImgUrl: '',
    carBrand: '',
    carColor: '',
    carEngineNo: '',
    carId: '',
    carIdCard: '',
    carNumber:'',
    carOwner:'',
    carOwnerAddress:'',
    carRegImgUrl:'',
    carTypeCode:'',
    carTypeDbId:0,
    carUseCode: '',
    carValid: '',
    remarks: '',
    // contentRecond: {
    //     "carBrand": "",
    //     "carColor": "",
    //     "carEngineNo": "",
    //     "carId": "",
    //     "carIdCard": "",
    //     "carNumber": "",
    //     "carOwner": "",
    //     "carOwnerAddress": "",
    //     "carRegImgUrl": "",
    //     "carTypeCode": "",
    //     "carTypeDbId": 0,
    //     "carUseCode": "",
    //     "carValid": "",
    //     "remarks": ""
    // },
    handleCarTypeChnage(e) {

    },
    
    registerPic(e) { // 注册图片change方法,有bug,只能生效一次        
        Tools.CPK_upload();
    },

    $form: createForm({
        onFieldsChange(fields, record) {
            docDialogDdd.json = JSON.stringify(record);
        }
    }),
    save() {
        docDialogDdd.$form.validateFields().then(isAllValid => {

            let data = docDialogDdd.$form.record;
            data.carRegImgUrl = this.carRegImgUrl;
            data.carTypeDbId = cpk_man.selectCPKId;
            if (!docDialogDdd.carId) {
                data.carId = ''; //新增不用传
                Tools.saveCPKInfo(data);
            } else {
                data.carId = docDialogDdd.carId;
                Tools.editCPKInfo(data);
            }
        })
    }
});

// 弹窗-添加车辆类型库
let addCarDb = avalon.define({
    $id: 'doc-dialog-addCarDb',
    title: '增加车辆类型库',
    treeNode: {},
    isEdit: false,
    carDbName: '',
    carDbdescription: ''
});


// 弹窗-删除
avalon.define({
    $id: 'doc-dialog-del',
    title: '删除确定'
});

// 弹窗-图片放大
let picVM = avalon.define({
    $id: 'doc-dialog-picBig',
    picSRC: '',
    // bigPic_footerHtml: '',
    title: '注册照片',
});

// 弹窗-批量导入
let importEXL = avalon.define({
    $id: 'doc-dialog-import',
    title: '批量导入',
    importUrl: '请选择导入文件路径',
    progress: 0,
    importBtn(e) {
        this.importUrl = e.target.value;
        this.progress = 100;
    },
});

// 弹窗-新增失败
let addFail = avalon.define({
    $id: 'doc-dialog-addCarFail',
    title: '新增失败车辆信息',
    //弹窗
    isdel: false,
    isBatchDel: false,
    // 表单
    loading: false,
    checked_cpkInfo: [],
    table_pagination: {
        current: 0,
        pageSize: 20,
        total: 0,
        current_len: 0,
        totalPages: 0
    },
    // 表格
    // 分页
    list: [],
    curPage: 1,
    //翻页
    $computed: {
        pagination: function () {
            return {
                current: addFail.table_pagination.current,
                pageSize: addFail.table_pagination.pageSize,
                total: addFail.table_pagination.total,
                onChange: addFail.handlePageChange
            };
        }
    },
    getCurrent(current) {
        addFail.table_pagination.current = current;
        addFail.curPage = current;
    },
    getPageSize(pageSize) {
        addFail.table_pagination.pageSize = pageSize;
    },
    handlePageChange(page) {
        // let objs = this.list;
        // this.checked_cpkInfo = [];
        // objs.forEach((val, key) => {
        //     if (val.checked) {
        //         this.checked_cpkInfo.push(val);
        //     }
        // });
        // if (this.checked_cpkInfo.length > 0) {
        //     $('.addFailDelete-disabled').removeClass('selectedCPK');
        //     $('.addFailAllDelete-disabled').removeClass('selectedCPK');
        // } else {
        //     $('.addFailDelete-disabled').addClass('selectedCPK');
        //     $('.addFailAllDelete-disabled').addClass('selectedCPK');
        // }

        addFail.curPage = page;
        addFail.table_pagination.current = page;
        let data = {};
        data.beginTime = addFail.beginTime;
        data.endTime = addFail.endTime;
        Tools.listAllByPage(data); //查询新增失败
    },
    json: '',
    // checkedID: '',
    $form: createForm({
        onFieldsChange(fields, record) {
            addFail.json = JSON.stringify(record);
        }
    }),
    xzsb_endDate: moment().format('YYYY-MM-DD'), //禁止选择未来时间
    beginTime: moment().format('YYYY-MM-DD 00:00:00'),
    // beginTime: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'),
    endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    startTimeHandleChange(e) {
        this.beginTime = e.target.value;
    },
    endTimeHandleChange(e) {
        this.endTime = e.target.value;
    },
    search() {
        this.curPage = 1;
        this.table_pagination.current = 1;
        addFail.$form.validateFields().then(isAllValid => {
            if (isAllValid) {
                let data = {};
                data.beginTime = addFail.beginTime;
                data.endTime = addFail.endTime;
                if (!data.endTime || !data.beginTime) {
                    notification.warn({
                        message: '请正确选择查询的开始时间或结束时间！',
                        title: "温馨提示"
                    });
                    return;
                }
                Tools.listAllByPage(data);
            }
        })
    },
    // 新增失败-删除按钮
    del() {
        if ($('.addFailDelete-disabled').hasClass('selectedCPK')) {
            return;
        }
        addFail.isdel = true;
        cpk_man.dialogDelShow = true;
        // Tools.batchDeleteAddFailInfo();
    },
    // 新增失败-全部删除按钮
    delAll() {
        if ($('.addFailDelete-disabled').hasClass('selectedCPK')) {
            return;
        }
        addFail.isBatchDel = true;
        cpk_man.dialogDelShow = true;
        // Tools.deleteCPKFailInfo(cpk_man.selectCPKId);
    },

    // 表格-操作回调
    actions(type, text, record, index) {
        if (type == 'delete') {

        } else if (type == 'big') {
            picVM.picSRC = record.carRegImgUrl;
            cpk_man.dialogBigPicShow = true;
            
        }
    },
    // 表格-勾选回调
    selectChange(type, data) {
        let objs = this.list;
        this.checked_cpkInfo = [];
        objs.forEach((val, key) => {
            if (val.checked) {
                this.checked_cpkInfo.push(val);
            }
        });
        if (this.checked_cpkInfo.length > 0) {
            $('.addFailDelete-disabled').removeClass('selectedCPK');
            $('.addFailAllDelete-disabled').removeClass('selectedCPK');
        } else {
            $('.addFailDelete-disabled').addClass('selectedCPK');
            $('.addFailAllDelete-disabled').addClass('selectedCPK');
        }

        if (type == 'one') {
            if (data.checked) {
                //有勾选则保存勾选数据

            } else {

            }
        } else if (type == 'all') {
            if (data.checked) {

            } else {
                this.checked_cpkInfo = [];
            }
        }
    }
});

// 弹窗-车辆类型库设置
let rylxksz = avalon.define({
    $id: 'doc-dialog-cllxksz',
    title: '车辆类型库设置',
    checkedAll: false,
    personlistAll: [],
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
    selectedAll() {
        this.checkedAll = !this.checkedAll;
        avalon.each(this.personlistAll, (i, el) => {
            el.enable = this.checkedAll;
        });
    },
    selectedOne(config, index) {
        this.personlistAll[index].enable = !this.personlistAll[index].enable;
        let flab = true;
        if (this.personlistAll[index].enable) {
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
    },
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

/**********通用函数工具********************************************************************************************************************************************************************************************************************************************************************************************************************************/
let Tools = {
    initlistAll: function (data) {
        let listAll = [{
            id: '9999',
            // pId: 0,
            name: "全部",
            open: true,
            isParent: true,
            children: []
        }];
        if (data.length > 0) {
            data.forEach(function (val, index) {
                var obj = {};
                obj.id = val.id;
                obj.name = val.dbName;
                obj.dbName = val.dbName;
                obj.dbType = val.dbType;
                obj.dbDesc = val.dbDesc;
                obj.createTime = val.createTime;
                obj.updateTime = val.updateTime;
                obj.enable = val.enable;
                obj.isHidden = val.deleted; //显示或隐藏
                obj.isParent = false;
                listAll[0].children.push(obj);
            });
            return listAll;
        }
    },
    //车牌识别信息控制器==========================================================================================
    // GET /car/recognition/delete/all
    // 清空车辆类型库中的车辆信息
    deleteCPKCarsInfo: function (carTypeDbId) {
        ajax({
            url: '/gmvcs/uap/car/recognition/delete/all?carTypeDbId=' + carTypeDbId,
            method: 'get',
            data: null,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                cpk_man.isClick = true;
                cpk_man.searchFunc();
                notification.success({
                    message: "车辆库车辆信息清除成功！",
                    title: "温馨提示"
                });
            } else {
                notification.warn({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }

        })
    },
    // 批量删除注册的信息
    batchDeleteCPKInfo: function (ids) {

        ajax({
            url: '/gmvcs/uap/car/recognition/batch/delete',
            method: 'post',
            data: ids,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                cpk_man.checked_cpkInfo = [];
                cpk_man.dialogDelShow = false;

                Tools.listAllByPageCPKInfo();
                notification.success({
                    message: "车辆信息删除成功！",
                    title: "温馨提示"
                });
            } else {
                notification.warn({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }
        })
    },
    // 删除车辆注册的信息
    deleteCPKInfo: function (id) {
        let params = {
            "id": id
        };
        ajax({
            url: '/gmvcs/uap/car/recognition/delete?id=' + params.id,
            method: 'get',
            data: null,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                cpk_man.checked_cpkInfo = [];
                cpk_man.dialogDelShow = false;
                Tools.listAllByPageCPKInfo();
                notification.success({
                    message: "车辆信息删除成功！",
                    title: "温馨提示"
                });
            } else {
                notification.warn({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }

        })
    },
    // 编辑车辆信息
    editCPKInfo: function (data) {
        let params = {
            "carBrand": data.carBrand,
            "carColor": data.carColor,
            "carEngineNo": data.carEngineNo,
            "carId": data.carId,
            "carIdCard": data.carIdCard,
            "carNumber": data.carNumber,
            "carOwner": data.carOwner,
            "carOwnerAddress": data.carOwnerAddress,
            "carRegImgUrl": data.carRegImgUrl,
            "carTypeCode": data.carTypeCode,
            "carTypeDbId": data.carTypeDbId,
            "carUseCode": data.carUseCode,
            "carValid": data.carValid,
            "remarks": data.remarks
        };
        ajax({
            url: '/gmvcs/uap/car/recognition/edit',
            method: 'post',
            data: params,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                notification.success({
                    message: "新增车辆信息成功！",
                    title: "温馨提示"
                });
                cpk_man.dialogAddShow = false;
                cpk_man.searchFunc();
            } else {
                notification.error({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }
        })
    },
    // 车辆信息模板导出
    exportCarTemplate: function () {
        window.location.href = "http://" + window.location.host + apiUrl + "/gmvcs/uap/car/recognition/exportCarTemplate"; //远程服务器使用        
    },
    // 查询车辆信息
    findCPKInfo: function () {
        let params = {
            "id": 0
        };
        ajax({
            url: '/gmvcs/uap/car/recognition/find',
            method: 'get',
            data: params,
            cache: false
        }).then(ret => {});
    },
    // 车辆注册信息导入
    importCars: function () {
        if (!cpk_man.selectCPKId) {
            notification.info({
                message: "请先选择车辆库类型，谢谢",
                title: "温馨提示"
            });
            return;
        }
        let params = {
            "carTypeDbId": parseInt(cpk_man.selectCPKId)
        };
        $.ajaxFileUpload({
            url: "http://" + window.location.host + apiUrl + '/gmvcs/uap/car/recognition/importCars',
            secureuri: false,
            fileElementId: 'fileToUpload', //file标签的id  
            dataType: 'string', //返回数据的类型
            data: params,
            success: function (data, status) {
                let result = eval('(' + data + ')');
                if (result.code == 0) {
                    notification.success({
                        message: "车辆注册信息导入成功！",
                        title: "温馨提示"
                    });
                    cpk_man.dialogImportShow = false;
                    importEXL.progress = 0;
                } else {
                    notification.error({
                        message: result.msg,
                        title: "温馨提示"
                    });
                    return;
                }
            },
            error: function (data, status, e) {
                notification.success({
                    message: "导入用户失败！请到新增失败查看",
                    title: "温馨提示"
                });
                return;
            }
        });
    },
    // 分页查询车辆信息
    listAllByPageCPKInfo: function () {
        cpk_man.loading = true;
        let page = cpk_man.curPage;
        if (!cpk_man.selectCPKId) {
            cpk_man.loading = false;
            return;
        }
        let params = {
            "carNumber": $("#exampleInputAmount").val(),
            "carTypeDbId": parseInt(cpk_man.selectCPKId),
            "page": cpk_man.curPage - 1,
            "pageSize": cpk_man.table_pagination.pageSize
        };
        if (cpk_man.change_page) {
            params = cpk_man.search_data;
            params.page = cpk_man.table_pagination.current - 1;
        } else
            cpk_man.search_data = params;

        ajax({
            url: '/gmvcs/uap/car/recognition/listAllByPage',
            method: 'post',
            data: params,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                let temp = (cpk_man.curPage - 1) * cpk_man.table_pagination.pageSize + 1;
                avalon.each(ret.data.currentElements, (i, el) => {
                    el.checked = false;
                    el.index = temp + i; // 行序号
                });
                storage.setItem('tyyhrzpt-xtpzgl-sbk-cpk', params);

                cpk_man.list = ret.data.currentElements;
                //新数据没勾选置灰
                $('.BatchExport-disabled').addClass('selectedCPK');
                $('.BatchDelete-disabled').addClass('selectedCPK');
                cpk_man.table_pagination.total = ret.data.totalElements;
                cpk_man.table_pagination.current_len = ret.data.currentElements.length;
                cpk_man.table_pagination.totalPages = ret.data.totalPages;
                cpk_man.loading = false;
            }
        })
    },

    // 新增车辆信息
    saveCPKInfo: function (data) {
        let params = {
            "carBrand": data.carBrand,
            "carColor": data.carColor,
            "carEngineNo": data.carEngineNo,
            "carId": data.carId,
            "carIdCard": data.carIdCard,
            "carNumber": data.carNumber,
            "carOwner": data.carOwner,
            "carOwnerAddress": data.carOwnerAddress,
            "carRegImgUrl": data.carRegImgUrl,
            "carTypeCode": data.carTypeCode,
            "carTypeDbId": data.carTypeDbId,
            "carUseCode": data.carUseCode,
            "carValid": data.carValid,
            "remarks": data.remarks
        };
        ajax({
            url: '/gmvcs/uap/car/recognition/save',
            method: 'post',
            data: params,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                notification.success({
                    message: "新增车辆信息成功！",
                    title: "温馨提示"
                });
                cpk_man.dialogAddShow = false;
                cpk_man.searchFunc();
            } else {
                notification.error({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }
        })
    },

    // 车辆类型库控制器===========================================================================================
    cpk_listAll: function (val) {
        ajax({
            url: '/gmvcs/uap/car/type/listAll',
            method: 'get',
            data: null,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                if (ret.data.length > 0) {
                    cpk_man.tree_data = ret.data; //保存车辆类型库数据
                    cpk_man.show_cpk_tree(this.initlistAll(cpk_man.tree_data));

                    if (val) {
                        let cpkTree_obj = $.fn.zTree.getZTreeObj("cpkTree");
                        let nodes = cpkTree_obj.getNodes();

                        for (let i = 0; i < nodes[0].children.length; i++) {
                            if (nodes[0].children[i].id == val) {
                                cpkTree_obj.selectNode(nodes[0].children[i]);
                                break;
                            }
                        }
                    }
                    Tools.listAllByPageCPKInfo();
                } else {
                    cpk_man.tree_data = []; //保存车辆类型库数据
                    cpk_man.show_cpk_tree(this.initlistAll(cpk_man.tree_data));
                }
            }
        });
    },

    //添加车牌库
    saveCPK: function () {
        if (addCarDb.carDbdescription == '') {
            notification.error({
                message: '请填写车牌库描述信息！',
                title: "温馨提示"
            });
            return;
        }
        let params = {
            "createTime": this.getTimestamp(),
            "dbDesc": addCarDb.carDbdescription,
            "dbName": addCarDb.carDbName,
            "dbType": 0,
            "deleted": false,
            "enable": true,
            // "id": 0,
            "updateTime": this.getTimestamp()
        };
        ajax({
            url: '/gmvcs/uap/car/type/save',
            method: 'post',
            data: params,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                cpk_man.isClick = true;
                cpk_man.tree_data.unshift(ret.data); //新增车牌库，往车牌类型库列表数组的开头添加
                cpk_man.show_cpk_tree(this.initlistAll(cpk_man.tree_data));
                cpk_man.dialogAddCarDb = false;
            } else {
                notification.error({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }
        });
    },
    //编辑车牌库
    editCPK: function (treeNode) {
        var obj = treeNode;
        let params = {
            "createTime": obj.createTime,
            "dbDesc": obj.dbDesc,
            "dbName": obj.dbName,
            "dbType": obj.dbType,
            "deleted": obj.deleted,
            "enable": obj.enable,
            "id": obj.id,
            "updateTime": obj.updateTime
        };
        ajax({
            url: '/gmvcs/uap/car/type/edit',
            method: 'post',
            data: params,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                cpk_man.isClick = true;
                var zTree = $.fn.zTree.getZTreeObj("cpkTree"),
                    nodes = zTree.getNodesByParam('id', ret.data.id);
                nodes[0].name = ret.data.dbName;
                nodes[0].dbType = ret.data.dbType;
                nodes[0].dbDesc = ret.data.dbDesc;
                nodes[0].createTime = ret.data.createTime;
                nodes[0].updateTime = ret.data.updateTime;
                nodes[0].enable = ret.data.enable;
                nodes[0].deleted = ret.data.deleted;
                zTree.updateNode(nodes[0]);
                cpk_man.dialogAddCarDb = false;
            } else {
                notification.error({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }

        })
    },
    // 删除车牌库
    deleteCPK: function (id) {
        ajax({
            url: '/gmvcs/uap/car/type/delete?id=' + id,
            method: 'get',
            data: null,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                cpk_man.isClick = true;
                if (ret.data.deleted) {
                    var zTree = $.fn.zTree.getZTreeObj("cpkTree"),
                        nodes = zTree.getNodesByParam('id', ret.data.id);
                    zTree.moveNode(nodes[0]);
                }
                cpk_man.cpkIsDel = false;
                cpk_man.dialogDelShow = false;
                Tools.cpk_listAll();
            } else {
                notification.error({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }
        })
    },
    // ==================================================车辆识别信息添加失败记录控制器==========================================================
    //分页查询车辆新增失败记录
    listAllByPage: function (data) {
        addFail.loading = true;
        if (!cpk_man.selectCPKId) {
            alert('车辆库ID为空！');
            addFail.loading = false;
            return;
        }
        let params = {
            "beginTime": getTimeByDateStr(data.beginTime),
            "endTime": getTimeByDateStr(data.endTime),
            "carTypeDbId": parseInt(cpk_man.selectCPKId),
            "page": addFail.curPage - 1,
            "pageSize": addFail.table_pagination.pageSize
        };
        ajax({
            url: '/gmvcs/uap/car/recognition/fail/listAllByPage',
            method: 'post',
            data: params,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                let temp = (addFail.curPage - 1) * addFail.table_pagination.pageSize + 1;
                avalon.each(ret.data.currentElements, (i, el) => {
                    el.checked = false;
                    el.index = temp + i;
                    el.createTime = null == el.createTime ? '-' : formatDate(el.createTime);
                });

                //新数据没勾选置灰
                $('.addFailDelete-disabled').addClass('selectedCPK');
                $('.addFailAllDelete-disabled').addClass('selectedCPK');

                addFail.list = ret.data.currentElements;
                addFail.table_pagination.total = ret.data.totalElements;
                addFail.table_pagination.current_len = ret.data.currentElements.length;
                addFail.table_pagination.totalPages = ret.data.totalPages;
                addFail.loading = false;
            }

        });
    },
    // 批量删除的车辆新增失败记录POST /car/recognition/fail/batch/delete
    batchDeleteAddFailInfo: function () {
        let objs = addFail.list;
        let ids = [];
        if (objs.length > 0) {
            objs.forEach((val, key) => {
                if (val.checked) {
                    ids.push(val.id);
                }
            });
        } else {

        }
        ajax({
            url: '/gmvcs/uap/car/recognition/fail/batch/delete',
            method: 'post',
            data: ids,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                notification.success({
                    message: '删除成功！',
                    title: "温馨提示"
                });
                addFail.search();
                cpk_man.dialogDelShow = false;
                addFail.isBatchDel = false;
            } else {
                notification.warn({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }
        })
    },
    // 删除车辆库全部新增失败记录GET /car/recognition/fail/delete/all
    deleteCPKFailInfo: function (id) {
        let params = {
            "id": parseInt(id) //车辆库ID，可选，不传则删除所有类型库的失败记录
        };
        ajax({
            url: '/gmvcs/uap/car/recognition/fail/delete/all?carTypeDbId=' + params.id,
            method: 'get',
            data: null,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                notification.success({
                    message: '全部删除成功！',
                    title: "温馨提示"
                });
                addFail.search();
                cpk_man.dialogDelShow = false;
                addFail.isdel = false;
            } else {
                notification.warn({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }

        })
    },
    // ================================================================================================================================
    // 车辆类型库图片上传
    CPK_upload: function () {
        $.ajaxFileUpload({
            url: "http://" + window.location.host + apiUrl + '/gmvcs/uap/file/upload',
            secureuri: false,
            fileElementId: 'fileToUploadAdd', //file标签的id  
            dataType: 'text/html', //返回数据的类型
            success: function (data, status) {
                let result = eval('(' + data + ')');
                if (result.code == 0) {
                    document.getElementById("showIMG").src = result.data.filePath ? result.data.filePath : ''; //预览上传图片 
                    docDialogDdd.carRegImgUrl = result.data.filePath ? result.data.filePath : '';
                    docDialogDdd.carRegImgUrl = result.data.filePath ? result.data.filePath : '';
                    $('#fileToUploadAdd').remove();
                    $('.registerPic-btn').css('background-color', 'grey');

                } else {
                    notification.error({
                        message: result.msg,
                        title: "温馨提示"
                    });
                    return;
                }
            },
            error: function (data, status, e) {
                notification.success({
                    message: "导入用户失败！",
                    title: "温馨提示"
                });
                return;
            }
        });
    },

    //=================字典操作控制器========================================================================================================================================
    // 使用字典类型的code查询数据字典 (301:车辆类型)
    findByDicTypeCode: function (id) {
        ajax({
            url: '/gmvcs/uap//dic/findByDicTypeCode?dicTypeCode=301',
            method: 'get',
            data: null,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                let options = [];
                avalon.each(ret.data, function (index, el) {
                    let items = {
                        "label": el.name,
                        "value": el.code
                    };
                    options.push(items);
                });
                docDialogDdd.carTypeObj = options; //车辆类型          
            } else {
                notification.warn({
                    message: ret.msg,
                    title: "温馨提示"
                });
            }

        });
    },
    // 车辆类型库设置
    settingCPK: function () {
        var params = {
            "list": [{
                "enable": true,
                "id": 0
            }]
        };
        ajax({
            url: '/gmvcs/uap/car/type/setting',
            method: 'post',
            data: params,
            cache: false
        }).then(ret => {})
    },
    getTimestamp: function () {
        return Math.round(new Date().getTime() / 1000);
        //getTime()返回数值的单位是毫秒
    },
    //=========================================================================树函数=========================================
    addHoverDom: function (treeId, treeNode) {
        if (treeNode.parentNode && treeNode.parentNode.id != '9999') return; //有父节点，并且不是父节点，添加DIY
        var aObj = $("#" + treeNode.tId + '_a');
        if (treeNode.id == '9999') {
            return;
        } //全部，不作处理
        if ($("#diyBtn_edit_" + treeNode.id).length > 0) return;
        if ($("#diyBtn_empty_" + treeNode.id).length > 0) return;
        if ($("#diyBtn_del_" + treeNode.id).length > 0) return;
        var editStr = "<span class='editPic' id='diyBtn_edit_" + treeNode.id + "' title='" + '编辑' + "' onfocus='this.blur();'></span>" +
            "<span class='emptyPic' id='diyBtn_empty_" + treeNode.id + "' title='" + '清空' + "' onfocus='this.blur();'></span>" +
            "<span class='delPic' id='diyBtn_del_" + treeNode.id + "' title='" + '删除' + "' onfocus='this.blur();'></span>";
        aObj.append(editStr);
        //编辑
        var btn = $("#diyBtn_edit_" + treeNode.id);
        if (btn) btn.bind("click", function () {
            cpk_man.isClick = false;
            cpk_man.edit(treeNode);
        }); //点击事件
        //清空
        var btn = $("#diyBtn_empty_" + treeNode.id);
        if (btn) btn.bind("click", function () {
            cpk_man.isClick = false;
            Tools.deleteCPKCarsInfo(treeNode.id);
        });
        //删除
        var btn = $("#diyBtn_del_" + treeNode.id);
        if (btn) btn.bind("click", function () {
            cpk_man.isClick = false;
            cpk_man.dialogDelShow = true;
            cpk_man.cpkIsDel = true;
            cpk_man.selectCPKId = treeNode.id;
            // Tools.deleteCPK(treeNode);
        });
    },
    removeHoverDom: function (treeId, treeNode) {
        if (treeNode.parentTId && treeNode.getParentNode().id != '9999') return;
        //编辑
        $("#diyBtn_edit_" + treeNode.id).unbind().remove();
        // $("#diyBtn_space_edit_" + treeNode.id).unbind().remove();
        //清空
        $("#diyBtn_empty_" + treeNode.id).unbind().remove();
        // $("#diyBtn_space_empty_" + treeNode.id).unbind().remove();
        //删除
        $("#diyBtn_del_" + treeNode.id).unbind().remove();
        // $("#diyBtn_space_del_" + treeNode.id).unbind().remove();
    }
}

function getTimeByDateStr(stringTime) {
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
}

function set_size() {
    let v_height = $(window).height() - 96;
    // let v_min_height = $(window).height() - 68;
    if (v_height > 740) {
        $(".sbk-content-cpk").height(v_height);
        // $("#sidebar .zfsypsjglpt-menu").css("min-height", v_min_height + "px");
    } else {
        $(".sbk-content-cpk").height(740);
        // $("#sidebar .zfsypsjglpt-menu").css("min-height", "765px");
    }
}
//时间戳转日期
function formatDate(date) {
    var d = new Date(date);
    var year = d.getFullYear();
    var month = (d.getMonth() + 1) < 10 ? ("0" + (d.getMonth() + 1)) : (d.getMonth() + 1);
    var date = d.getDate() < 10 ? ("0" + d.getDate()) : d.getDate();
    var hour = d.getHours() < 10 ? ("0" + d.getHours()) : d.getHours();
    var minute = d.getMinutes() < 10 ? ("0" + d.getMinutes()) : d.getMinutes();
    var second = d.getSeconds() < 10 ? ("0" + d.getSeconds()) : d.getSeconds();

    return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
}