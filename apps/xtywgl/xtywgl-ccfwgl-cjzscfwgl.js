import ajax from '../../services/ajaxService.js';
import {
    createForm,
    notification
} from "ane";
import Sbzygl from '../common/common-sbzygl';
import FaajValidate from '../common/common-form-validate';
import moment from 'moment';
import * as menuServer from '../../services/menuService';
const storage = require('../../services/storageService.js').ret;
import {
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language,
    cjzscfwgl_language = language_txt.xtywgl.cjzscfwgl; //多语言
require('../common/common-tyywglpt.css');
require('../../apps/common/common-tyywglpt-ccfwgl.css');
require('./xtywgl-ccfwgl-cjzscfwgl.less');
let ec = require('echarts/dist/echarts.min');
export const name = 'xtywgl-ccfwgl-cjzscfwgl';
const listHeaderName = name + '-list-header';
let searchResult = []; //存储所属机构搜索结果
let vm = null;
let isExist = false;
let timeObj = {}; //用于存储分析弹框中的时间
let sbzygl = new Sbzygl();
let icon_dep = '../../static/image/xtpzgl-yhgl/icon_department.png';
let extra_class = languageSelect == "en" ? true : false;

const ccfwgl = avalon.component(name, {
    template: __inline('./xtywgl-ccfwgl-cjzscfwgl.html'),
    defaults: {
        cjzscfwgl_language: language_txt.xtywgl.cjzscfwgl, //多语言
        checkAll: false,
        checkBox: [], //存储已经选中的元素
        btnDisabled: true,
        loading: true,
        // online: "在线",
        // offline: "离线",
        online: language_txt.xtywgl.cjzscfwgl.online,
        offline: language_txt.xtywgl.cjzscfwgl.offline,
        noData: false, //获取列表没有数据
        tableData: [],
        editData: {},
        currentPage: 1, //主要用于查询时传给分页组件
        page: 1,
        pageSize: 20,
        orgData: [], //所属机构数据
        orgId: '', //外围所选所属机构id
        selectedTitle: '',
        orgPath: '',
        total: 0,
        checkedIsSource: false,
        storageJson: {},
        showServiceNameBelowTips: false,
        showIpBelowTips: false,
        showPortBelowTips: false,
        showPasswordBelowTips: false,
        showUploadPathBelowTips: false,
        showDownloadPathBelowTips: false,
        shownNormalDayBelowTips: false,
        showSpecialDayBelowTips: false,
        titleTimer: null,
        authority: { // 按钮权限标识
            "CCCL": false, //存储服务管理_采集工作站上传服务管理_存储策略
            "CCFX": false, //存储服务管理_采集工作站上传服务管理_存储分析
            "CJGZZFP": false, //存储服务管理_采集工作站上传服务管理_采集工作站分配
            "CHECK": false, //存储服务管理_采集工作站上传服务管理_查看
            "DELETE": false, //存储服务管理_采集工作站上传服务管理_删除
            "MODIFY": false, //存储服务管理_采集工作站上传服务管理_修改
            // "REGISTRY": false,  //存储服务管理_采集工作站上传服务管理_注册
            "SEARCH": false, //存储服务管理_采集工作站上传服务管理_查询
            "BATCHDELETE": false, // 批量删除
            "SAVE": false, // 添加
            "OPT_SHOW": false //操作栏-显隐
        },
        selectTab: 1,
        //页面切换
        tabClick(index) {
            // storage.removeItem("tjfx-tableDrag-style");
            if (index == 0) {
                avalon.history.setHash("/xtywgl-ccfwgl-index");
            }
        },
        //左侧部门树
        list_tree: avalon.define({
            $id: "lineTree_cjzscfwgl",
            zTreeObj: null,
            treeData: [],
            selectedDepTitle: '',
            editDepTitle: '',
            addTreeNode: '',
            editTreeNode: '',
            initTree(treeData) {
                const self = this;
                //初始化树
                let setting = {
                    treeId: "cjzscfwgl-depTree",
                    callback: {
                        onClick: vm.querySearch,
                        beforeClick: self.zTreeBeforeClick,
                        // beforeCollapse: zTreeBeforeCollapse,
                        // onCollapse: zTreeOnCollapse,
                        onRemove: self.onRemove, //(beforeRemove返回true之后可以进行onRemove)删除节点后触发，用户后台操作
                    },
                    view: {
                        showLine: false,
                        showIcon: true,
                        dblClickExpand: false, //屏蔽掉双击事件
                        // addHoverDom: self.addHoverDom,
                        removeHoverDom: self.removeHoverDom,
                        // fontCss: setFontCss,
                        // dblClickExpand: dblClickExpand
                    },
                    check: {
                        enable: false, //隐藏多选框
                    },
                    edit: {
                        enable: true,
                        showRemoveBtn: false,
                        showRenameBtn: false,
                    },
                    data: {
                        simpleData: {
                            enable: true
                        },
                        check: {
                            enable: false, // 显示多选框按钮
                        }
                    }
                };
                this.zTreeObj = $.fn.zTree.init($("#cjzscfwgl-depTree"), setting, treeData);
                //返回一个根节点 
                let node = this.zTreeObj.getNodesByFilter(function (node) {
                    return node.level == 0
                }, true);
                this.zTreeObj.selectNode(node);
                //初始化点击树的根节点
                setting.callback.beforeClick = self.zTreeBeforeClick(null, node, null);
            },
            addTreeNode(id, checkType) {
                //执行用户自定义操作          
                ajax({
                    url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + id + '&checkType=' + checkType,
                    method: 'get',
                    data: null,
                    cache: false
                }).then(ret => {
                    if (ret.code == 0) {
                        if (ret.data) {
                            let bmgl_tree = this.zTreeObj;
                            let nodes = bmgl_tree.getNodesByParam("orgId", id, null);
                            bmgl_tree.addNodes(nodes[0], this.addIcon(ret.data));
                            bmgl_tree = null;
                            nodes = null;
                        } else {
                            sayError(cjzscfwgl_language.demandForSubBranchDataFailed);
                        }
                    } else {
                        sayError(cjzscfwgl_language.demandForSubBranchDataFailed);
                    }
                });
            },
            getTree() {
                const self = this;
                ajax({
                    url: '/gmvcs/uap/org/find/fakeroot/mgr',
                    method: 'get',
                    cache: false,
                    data: null
                }).then(ret => {
                    if (ret.code == 0) {
                        let treeData = self.addIcon(ret.data);
                        self.initTree(treeData);
                    }
                });
                //所属机构下拉请求
                getOrgAll().then((ret) => {
                    vm.storageJson = "";
                    if (ret.code == 0) {
                        let data = changeTreeData(ret.data);
                        vm.orgData = data;
                        vm.orgId = data[0].orgId;
                        vm.orgPath = data[0].path;
                        ccfwglAddDialog.orgData = data;
                        ccfwglModifyDialog.orgData = data;
                        allocationVm.orgData = data;
                        vm.storageJson = storage.getItem(name);
                        // if (vm.storageJson) {
                        //     vm.orgId = vm.storageJson.orgId;
                        //     vm.orgPath = vm.storageJson.orgPath;
                        //     vm.currentPage = vm.storageJson.page;
                        //     vm.selectedTitle = vm.storageJson.selectedTitle;
                        // }
                        sbzygl.setListHeader(listHeaderName);
                        vm.ajaxTableList(vm.orgId);

                    } else {
                        // showMessage('error', '获取所属机构失败！');
                        showMessage('error',  cjzscfwgl_language.fails);
                    }
                });
            },
            addIcon(arr) {
                const self = this;
                // 深拷贝原始数据
                let dataSource = JSON.parse(JSON.stringify(arr))
                let res = [];
                // 每一层的数据都 push 进 res
                res.push(...dataSource);
                // res 动态增加长度
                for (let i = 0; i < res.length; i++) {
                    let curData = res[i];
                    curData.icon = icon_dep;
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
            extraExpandHandle(treeNode) {
                if (treeNode.hasExpand)
                    return;
                //执行用户自定义操作          
                ajax({
                    url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.orgId + '&checkType=' + treeNode.checkType,
                    method: 'get',
                    data: null,
                    cache: false
                }).then(ret => {
                    if (ret.code == 0) {
                        if (ret.data) {
                            let bmgl_tree = this.zTreeObj;
                            bmgl_tree.addNodes(treeNode, this.addIcon(ret.data));
                            treeNode.hasExpand = true;
                            bmgl_tree = null;
                            // nodes = null;
                        } else {
                            sayError(cjzscfwgl_language.demandForSubBranchDataFailed);
                        }
                    } else {
                        // sayError('请求下级部门数据失败');
                        sayError(cjzscfwgl_language.demandForSubBranchDataFailed);
                    }
                });
            },
            zTreeBeforeClick(treeId, treeNode, clickFlag) { //可用于禁止节点被选中
                vm.orgCode = treeNode.orgCode;
                vm.orgId = treeNode.orgId;
                vm.orgPath = treeNode.orgPath;
                this.selectedDepTitle = treeNode.name;
                this.editDepTitle = this.selectedDepTitle;
                this.zTreeObj.expandNode(treeNode);
                this.editTreeNode = treeNode;
                vm.selectedTitle = treeNode.name; //左边部门树选中的部门，即为添加弹窗默认的部门
                // 线上接口出来的时候，记得用下面的代码
                if (treeNode.open)
                    this.extraExpandHandle(treeNode);

            },
            formatTreeLevel(str) {
                return str.substring(0, 20) + "..."; //替换string后面三个字符
            },
            onRemove(e, treeId, treeNode) {
                if (treeNode.isParent) {
                    var childNodes = this.zTreeObj.removeChildNodes(treeNode);
                    var paramsArray = new Array();
                    for (var i = 0; i < childNodes.length; i++) {
                        paramsArray.push(childNodes[i].id);
                    }
                    // alert("删除父节点的id为：" + treeNode.id + "\r\n他的孩子节点有：" + paramsArray.join(","));
                    return;
                }
                // alert("你点击要删除的节点的名称为：" + treeNode.name + "\r\n" + "节点id为：" + treeNode.id);
            },
            addHoverDom(treeId, treeNode) {
                const self = this;
                let sObj = $("#" + treeNode.tId + "_span");
                if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) return;
                let addStr = "<span class='button add' id='addBtn_" + treeNode.tId +
                    "' title='add node' onfocus='this.blur();'></span>";
                sObj.after(addStr);
                let btn = $("#addBtn_" + treeNode.tId);
                if (btn) btn.bind("click", function () {
                    self.addTreeNode = treeNode;
                    //增加部门树弹窗
                    avalon['components'][name]['defaults'].yhgl_handleDepTree.height = 200;
                    avalon['components'][name]['defaults'].yhgl_handleDepTreeVm.title = 'increase subordinate departments';
                    avalon['components'][name]['defaults'].yhgl_handleDepTreeVm.dialogFlag = 0;
                    avalon['components'][name]['defaults'].yhgl_handleDepTree.show = true;
                    return false;
                });
            },
            removeHoverDom(treeId, treeNode) {
                $("#addBtn_" + treeNode.tId).unbind().remove();
            }
        }),
        //获取所属机构
        getSelected(key, title, node) {
            this.orgId = key;
            this.orgPath = node.path;
            this.selectedTitle = title;
        },
        handleTreeChange(e, selectedKeys) {
            this.orgId = e.node.orgId;
            this.orgPath = e.node.path;
        },
        clearEdit() {
            this.editData = {};
        },
        //获取当前页码
        getCurrent(current) {
            vm.currentPage = current;
        },
        //点击查询，获取数据
        querySearch() {
            //查询之前判断是否有权限，没有查询权限则不给查询
            if (false == vm.authority.SEARCH) {
                showMessage('error', cjzscfwgl_language.noPermission);
                return;
            }
            timeLimitQuery(this.ajaxTableList.bind(this), 2000, [this.orgId]);
            vm.currentPage = 1;
            storage.setItem(name, {
                orgId: this.orgId,
                page: this.currentPage,
                orgPath: this.orgPath,
                selectedTitle: this.selectedTitle
            }, 0.5);
        },
        //extraExpandHandle:avalon.noop,
        extraExpandHandle: function (treeId, treeNode, selectedKey) {
            getOrgbyExpand(treeNode.orgId, treeNode.checkType).then((ret) => {
                let treeObj = $.fn.zTree.getZTreeObj(treeId);
                if (ret.code == 0) {
                    treeObj.addNodes(treeNode, changeTreeData(ret.data));
                }
                if (selectedKey != treeNode.key) {
                    let node = treeObj.getNodeByParam('key', selectedKey, treeNode);
                    treeObj.selectNode(node);
                }
            });
        },
        authority_zfy: false,
        authority_wj: false,
        onInit(event) {
            var _this = this;
            // avalon.components['ms-common-layout'].defaults.sideSelectedKeys ;
            vm = event.vmodel;
            // let $toobar = $('.tyywglpt-tool-bar');
            // $('.tyywglpt-list-panel').css({
            //     'top': $toobar.offset().top + $toobar.outerHeight() + 42
            // });
            //折线图
            // getOrgAll().then((ret) => {
            //     chartVm.data = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
            // });

            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (el === 'UOM_MENU_CCFWGL_ZFYLXFW') {
                        vm.authority_zfy = true;
                    }
                    if (el === 'UOM_MENU_CCFWGL_WJSCFW') {
                        vm.authority_wj = true;
                    }
                    if (/^UOM_FUNCTION_CCFWGL_WJSCFW_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0)
                    return;
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_CCFWGL_WJSCFW_CCCL":
                            _this.authority.CCCL = true;
                            break;
                        case "UOM_FUNCTION_CCFWGL_WJSCFW_CCFX":
                            _this.authority.CCFX = true;
                            break;
                        case "UOM_FUNCTION_CCFWGL_WJSCFW_CJGZZFP":
                            _this.authority.CJGZZFP = true;
                            break;
                        case "UOM_FUNCTION_CCFWGL_WJSCFW_CHECK":
                            _this.authority.CHECK = true;
                            break;
                        case "UOM_FUNCTION_CCFWGL_WJSCFW_DELETE":
                            _this.authority.DELETE = true;
                            break;
                        case "UOM_FUNCTION_CCFWGL_WJSCFW_MODIFY":
                            _this.authority.MODIFY = true;
                            break;
                            // case "UOM_FUNCTION_CJZSCFWGL_REGISTRY":
                            //     _this.authority.REGISTRY = true;
                            //     break;
                        case "UOM_FUNCTION_CCFWGL_WJSCFW_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                        case "UOM_FUNCTION_CCFWGL_WJSCFW_BATCHDELETE":
                            _this.authority.BATCHDELETE = true;
                            break;
                        case "UOM_FUNCTION_CCFWGL_WJSCFW_SAVE":
                            _this.authority.SAVE = true;
                            break;
                    }
                });
                // 设置绝对定位的top，防止空白
                if (false == _this.authority.SAVE && false == _this.authority.CCCL && false == _this.authority.CJGZZFP) {
                    $(".tyywglpt-list-panel").css('top', '105px')
                }
                if (false == _this.authority.MODIFY && false == _this.authority.CHECK && false == _this.authority.DELETE)
                    _this.authority.OPT_SHOW = true;
            });
            this.$watch('checkBox', function (n, o) {
                if (n.length == 1)
                    this.editData = n[0];
            });
        },
        onReady() {
            this.list_tree.getTree();
        },
        onDispose() {
            clearInterval(this.titleTimer);
        },
        ajaxTableList(orgId, page, pageSize) {
            let _this = this;
            _this.loading = true;
            getTableData(orgId, page, pageSize, _this.orgPath).then((ret) => {
                if (ret.code == 0) {
                    let datas = ret['data']['storageInfos'];
                    let total = ret['data']['count'];
                    _this.total = total;
                    _this.loading = false;
                    if (datas.length == 0) {
                        _this.noData = true;
                    } else {
                        _this.noData = false;
                    }

                    avalon.each(datas, (i, el) => {
                        datas[i].active = false;
                        datas[i].checked = false;
                    });
                    _this.tableData = datas;
                    _this.clearEdit();
                    vm.checkBox = [];
                    vm.checkAll = false;
                    vm.btnDisabled = true;

                    // if ($('.tyywglpt-list-content').get(0).offsetHeight < $('.tyywglpt-list-content').get(0).scrollHeight - 1) {
                    //     $('.tyywglpt-list-header').css({
                    //         'padding-right': '17px'
                    //     });
                    // } else {
                    //     $('.tyywglpt-list-header').css({
                    //         'padding-right': 0
                    //     });
                    // }

                    $("[data-toggle='popover']").popoverX({
                        trigger: 'manual',
                        container: 'body',
                        placement: 'auto top',
                        //delay:{ show: 5000},
                        html: 'true',
                        content: function () {
                            return '<div class="title-content">' + $(this).attr('data-original-title') + '</div>';
                        },
                        animation: false
                    }).off("mouseenter").on("mouseenter", (event) => {
                        let target = event.target;
                        if ($(target).text() === '-') {
                            return;
                        }
                        vm.titleTimer = setTimeout(() => {
                            $("[data-toggle='popover']").popoverX("hide");
                            $(target).popoverX("show");
                            $(".popover").off("mouseleave").on("mouseleave", (event) => {
                                $(target).popoverX('hide');
                            });
                        }, 500);
                    }).off("mouseleave").on("mouseleave", (event) => {
                        let target = event.target;
                        clearTimeout(vm.titleTimer);
                        setTimeout(() => {
                            if (!$(".popover:hover").length) {
                                $(target).popoverX("hide");
                            }
                        }, 100);
                    });
                    sbzygl.initDragList(listHeaderName);
                } else {
                    showMessage('error', cjzscfwgl_language.errors + ret.code);
                    sbzygl.initDragList(listHeaderName);
                }


            });
        },
        handlePageChange(curpage, pageSize) {
            storage.setItem(name, {
                orgId: this.orgId,
                page: this.currentPage,
                orgPath: this.orgPath,
                selectedTitle: this.selectedTitle
            }, 0.5);
            this.ajaxTableList(this.orgId, --curpage, pageSize);
        },
        //全选复选框
        handleCheckAll(e) {
            let list = this.tableData;
            let bol = e.target.checked;
            this.checkBox.clear();
            avalon.each(list, (key, val) => {
                val.checked = bol;
                val.active = bol;
                if (bol)
                    this.checkBox.pushArray([val]);
                else
                    this.checkBox.clear();
            });
            let symbol = judgeCheckboxData(this.checkBox);
            if (symbol) {
                this.checkedIsSource = true;
                $(".bottom-tool-bar .btn-tool").addClass('disabled');
            } else {
                if (this.checkBox.length <= 0) {
                    $(".bottom-tool-bar .btn-tool").addClass('disabled');
                } else {
                    $(".bottom-tool-bar .btn-tool").removeClass('disabled');
                }
                this.checkedIsSource = false;
            }
            if (this.checkBox.length == 1)
                this.btnDisabled = false;
            else
                this.btnDisabled = true;
        },
        //单选复选框
        handleCheck($index, item, e) {
            let _this = this;
            let list = this.tableData;
            list[$index]['checked'] = item.checked;
            let ret = list.filter((item) => {
                return item['checked'];
            });
            if (ret.length == list.length)
                this.checkAll = true;
            else
                this.checkAll = false;
            if (e.target.checked == true)
                this.checkBox.ensure(item);
            else
                this.checkBox.remove(item);

            if (_this.checkBox.length == 1)
                _this.btnDisabled = false;
            else
                _this.btnDisabled = true;
            let symbol = judgeCheckboxData(this.checkBox);
            if (symbol) {
                this.checkedIsSource = true;
                $(".bottom-tool-bar .btn-tool").addClass('disabled');
            } else {
                if (this.checkBox.length <= 0) {
                    $(".bottom-tool-bar .btn-tool").addClass('disabled');
                } else {
                    $(".bottom-tool-bar .btn-tool").removeClass('disabled');
                }
                this.checkedIsSource = false;
            }
        },
        handleInputFocus(flag, ev) {
            switch (flag) {
                case 'ip':
                    this.showIpBelowTips = true;
                    break;
                case 'port':
                    this.showPortBelowTips = true;
                case 'normalDay':
                    this.shownNormalDayBelowTips = true;
                    break;
                case 'specialDay':
                    this.showSpecialDayBelowTips = true;
                    break;
            }
            if ($('.ccfwgl-' + flag + ' .ccfwgl-error-tips').length > 0)
                $('.ccfwgl-' + flag + ' .ccfwgl-error-tips').remove();
            $(ev.target).siblings('.close-clear').show();
        },
        handleInputBlur(flag, VmTag, ev) {
            let validate = new FaajValidate();
            let Vm = getDialogVm(VmTag);
            switch (flag) {
                case 'serviceName':
                    validate.add(Vm.json.name, 'isNoEmpty', vm.cjzscfwgl_language.serviceNameCannotBeNull + '&ccfwgl-serviceName');
                    validate.add(Vm.json.name, 'firstLastisNoEmpty', vm.cjzscfwgl_language.noSpacesBeforeOrAfterTheServiceName + '&ccfwgl-serviceName');
                    validate.add(Vm.json.name, 'includeSpecialChar', vm.cjzscfwgl_language.noSpecialCharactersInServiceName + '&ccfwgl-serviceName');
                    validate.add(Vm.json.name, 'maxLength:32', vm.cjzscfwgl_language.serviceNameCannotExceed32Characters + '&ccfwgl-serviceName');
                    // validate.add(Vm.json.name, 'isNoEmpty', '服务名称不能为空&ccfwgl-serviceName');
                    // validate.add(Vm.json.name, 'firstLastisNoEmpty', '服务名称前后不能有空格&ccfwgl-serviceName');
                    // validate.add(Vm.json.name, 'includeSpecialChar', '服务名称不能包含特殊字符&ccfwgl-serviceName');
                    // validate.add(Vm.json.name, 'maxLength:32', '服务名称不能超过32个字符&ccfwgl-serviceName');
                    break;
                case 'ip':
                    this.showIpBelowTips = false;
                    // validate.add(Vm.json.ip, 'isNoEmpty', 'IP不能为空&ccfwgl-ip');
                    // validate.add(Vm.json.ip, 'testIpNotPort', 'IP格式不正确&ccfwgl-ip');
                    validate.add(Vm.json.ip, 'isNoEmpty', vm.cjzscfwgl_language.iPCannotBeNull + '&ccfwgl-ip');
                    validate.add(Vm.json.ip, 'testIpNotPort', vm.cjzscfwgl_language.incorrectIPFormat + '&ccfwgl-ip');
                    //自动填充到上传或下载路径
                    Vm.json.uploadUrl = 'ftp://' + Vm.json.ip;
                    Vm.json.downloadUrl = 'https://' + Vm.json.ip;
                    break;
                case 'port':
                    this.showPortBelowTips = false;
                    // validate.add(Vm.json.port, 'isNoEmpty', '端口不能为空&ccfwgl-port');
                    // validate.add(Vm.json.port, 'isNumber', '端口必须为数字(正整数)&ccfwgl-port');
                    // validate.add(Vm.json.port, 'includeSpecialChar', '端口不能包含特殊字符&ccfwgl-port');
                    // validate.add(Vm.json.port, 'testPortRange', '端口不符合0~65535范围&ccfwgl-port');
                    validate.add(Vm.json.port, 'isNoEmpty', vm.cjzscfwgl_language.portCannotBeNull + '&ccfwgl-port');
                    validate.add(Vm.json.port, 'isNumber', vm.cjzscfwgl_language.portMustBeNumbersPositiveInteger + '&ccfwgl-port');
                    validate.add(Vm.json.port, 'includeSpecialChar', vm.cjzscfwgl_language.noSpecialCharactersInPort + '&ccfwgl-port');
                    validate.add(Vm.json.port, 'testPortRange', vm.cjzscfwgl_language.portIsNotFrom0To65535 + '&ccfwgl-port');
                    break;
                case 'account':
                    // validate.add(Vm.json.account, 'isNoEmpty', '账号不能为空&ccfwgl-account');
                    validate.add(Vm.json.account, 'isNoEmpty', vm.cjzscfwgl_language.accountCannotBeNull + '&ccfwgl-account');
                    break;
                case 'password':
                    // validate.add(Vm.json.password, 'isNoEmpty', '密码不能为空&ccfwgl-password');
                    validate.add(Vm.json.password, 'isNoEmpty', vm.cjzscfwgl_language.passwordCannotBeNull + '&ccfwgl-password');
                    break;
                case 'uploadPath':
                    // validate.add(Vm.json.uploadUrl, 'isNoEmpty', '上传路径不能为空&ccfwgl-uploadPath');
                    // validate.add(Vm.json.uploadUrl, 'isVaildUrl', '路径非法&ccfwgl-uploadPath');
                    validate.add(Vm.json.uploadUrl, 'isNoEmpty', vm.cjzscfwgl_language.uploadPathCannotBeNull + '&ccfwgl-uploadPath');
                    validate.add(Vm.json.uploadUrl, 'isVaildUrl', vm.cjzscfwgl_language.invalidPath + '&ccfwgl-uploadPath');
                    break;
                case 'downloadPath':
                    // validate.add(Vm.json.downloadUrl, 'isNoEmpty', '下载路径不能为空&ccfwgl-downloadPath');
                    // validate.add(Vm.json.downloadUrl, 'isVaildUrl', '路径非法&ccfwgl-downloadPath');
                    validate.add(Vm.json.downloadUrl, 'isNoEmpty', vm.cjzscfwgl_language.downloadPathCannotBeNull + '&ccfwgl-downloadPath');
                    validate.add(Vm.json.downloadUrl, 'isVaildUrl', vm.cjzscfwgl_language.invalidPath + '&ccfwgl-downloadPath');
                    break;
                case 'normalDay':
                    this.shownNormalDayBelowTips = false;
                    // validate.add(ccfwglMethodDialog.json.expireDaysNormal, 'isNoEmpty', '普通视音频存储期限不能为空&ccfwgl-normalDay');
                    // validate.add(ccfwglMethodDialog.json.expireDaysNormal, 'isNumber', '普通视音频存储期限必须为正整数&ccfwgl-normalDay');
                    // validate.add(ccfwglMethodDialog.json.expireDaysNormal, 'isMaxNumber9', '最大只能输入9位数字，且不能为0&ccfwgl-normalDay');
                    validate.add(ccfwglMethodDialog.json.expireDaysNormal, 'isNoEmpty', vm.cjzscfwgl_language.commonMediaStorageTermCannotBeNull + '&ccfwgl-normalDay');
                    validate.add(ccfwglMethodDialog.json.expireDaysNormal, 'isNumber', vm.cjzscfwgl_language.commonMediaStorageTermMustBeAPositiveInteger + '&ccfwgl-normalDay');
                    validate.add(ccfwglMethodDialog.json.expireDaysNormal, 'isMaxNumber9', vm.cjzscfwgl_language.atMost9DigitsAndCannotBe0 + '&ccfwgl-normalDay');
                    break;
                case 'specialDay':
                    this.showSpecialDayBelowTips = false;
                    // validate.add(ccfwglMethodDialog.json.expireDaysSpecial, 'isNoEmpty', '重要视音频存储期限不能为空&ccfwgl-specialDay');
                    // validate.add(ccfwglMethodDialog.json.expireDaysSpecial, 'isNumber', '重要视音频存储期限必须为正整数&ccfwgl-specialDay');
                    // validate.add(ccfwglMethodDialog.json.expireDaysSpecial, 'isMaxNumber9', '最大只能输入9位数字，且不能为0&ccfwgl-specialDay');
                    validate.add(ccfwglMethodDialog.json.expireDaysSpecial, 'isNoEmpty', vm.cjzscfwgl_language.markedMediaStorageTermCannotBeNull + '&ccfwgl-specialDay');
                    validate.add(ccfwglMethodDialog.json.expireDaysSpecial, 'isNumber', vm.cjzscfwgl_language.markedMediaStorageTermMustBeAPositiveInteger + '&ccfwgl-specialDay');
                    validate.add(ccfwglMethodDialog.json.expireDaysSpecial, 'isMaxNumber9', vm.cjzscfwgl_language.atMost9DigitsAndCannotBe0 + '&ccfwgl-specialDay');
                    break;
            }
            $(ev.target).siblings('.close-clear').hide();
            let closure = avalon.noop.before(validate.start.bind(validate));
            let msg = closure();
            if (msg) {
                let className = msg.split('&')[1];
                if ($('.' + VmTag + ' .ccfwgl-error-tips').length > 0)
                    $('.ccfwgl-error-tips').remove();
                $('.' + VmTag + '  .' + className).append(showFormErrorTips(msg.split('&')[0]));
                return true;
            } else {
                if ($('.' + VmTag + ' .ccfwgl-error-tips').length > 0)
                    $('.ccfwgl-error-tips').remove();
            }
            return false;
        },
        handleCloseClear(e) {
            let name = $(e.target).attr('name');
            let vmName = name.split('.')[0];
            let inputName = name.split('.')[1];
            getDialogVm(vmName)['json'][inputName] = '';
            $(e.target).siblings('input').focus();
            return false;
        },
        //查看点击
        handleLookClick($index, item) {
            lookModifyCommom(ccfwglLookDialog, item);
            ccfwglLookDialog.show = true;
        },
        //添加按钮点击
        handleAddClick() {
            if (this.checkBox.length != 0)
                return false;
            ccfwglAddDialog.json.orgId = this.orgId;
            ccfwglAddDialog.json.orgPath = this.orgPath;
            ccfwglAddDialog.selectedTitle = this.selectedTitle;
            ccfwglAddDialog.show = true;
            if ($('.ccfwgl-error-tips').length > 0)
                $('.ccfwgl-error-tips').remove();
        },
        //修改点击
        handleModifyClick($index, item) {
            if (item.source) {
                // showMessage('warn', '该条数据来自级联平台,不能修改');
                showMessage('warn', language_txt.xtywgl.cjzscfwgl.thisDataComesFromCascadedPlatformsAndCannotBeModified);
                return;
            }
            lookModifyCommom(ccfwglModifyDialog, item);
            ccfwglModifyDialog.orgId = item.orgRid;
            ccfwglModifyDialog.selectedTitle = item.orgName;
            ccfwglModifyDialog.show = true;
            if ($('.ccfwgl-error-tips').length > 0)
                $('.ccfwgl-error-tips').remove();
        },
        //列表删除按钮点击
        handleSingleDeleteClick($index, item) {
            // deleteVm.deleteCount = 1;
            if (item.source) {
                // showMessage('warn', '该条数据来自级联平台,不能删除!');
                showMessage('warn', language_txt.xtywgl.cjzscfwgl.thisDataIsFromCascadedPlatformsAndCannotBeDeleted);
                return;
            }
            deleteVm.item = [this.tableData[$index]];
            deleteVm.toggle = true;
            deleteVm.show = true;
        },

        //批量删除按钮点击
        handleDeleteClick() {
            let length = this.checkBox.length;
            if (length == 0) {
                // showMessage('info', '请至少选择一项!');
                return false;
            } else {
                let tip = judgeCheckboxData(this.checkBox);
                if (tip) {
                    // showMessage('warn', '含有来自级联平台的数据,不能删除!');
                    showMessage('warn', language_txt.xtywgl.cjzscfwgl.containsDataFromCascadedPlatformsCanNotBeDeleted);
                    return;
                }
                deleteVm.deleteCount = length;
            }
            deleteVm.toggle = false;
            deleteVm.show = true;
        },
        //存储策略按钮点击
        // handleMethodClick() {
        //     if (this.btnDisabled == true)
        //         return false;
        //     ccfwglMethodDialog.show = true;
        //     ccfwglMethodDialog.json.strategyId = vm.editData['strategyId'],
        //         ccfwglMethodDialog.json.expireDaysNormal = this.editData.expireDaysNormal === undefined ? vm.tableData[0]['expireDaysNormal'] : this.editData.expireDaysNormal;
        //     ccfwglMethodDialog.json.expireDaysSpecial = this.editData.expireDaysSpecial === undefined ? vm.tableData[0]['expireDaysSpecial'] : this.editData.expireDaysSpecial;
        //     if ($('.ccfwgl-error-tips').length > 0)
        //         $('.ccfwgl-error-tips').remove();
        // },
        handleMethodClick2() {
            if (this.btnDisabled == true)
                return false;
            ccfwglMethodDialog.show = true;
            ccfwglMethodDialog.json.strategyId = vm.editData['strategyId'],
                ccfwglMethodDialog.json.expireDaysNormal = this.editData.expireDaysNormal === undefined ? vm.tableData[0]['expireDaysNormal'] : this.editData.expireDaysNormal;
            ccfwglMethodDialog.json.expireDaysSpecial = this.editData.expireDaysSpecial === undefined ? vm.tableData[0]['expireDaysSpecial'] : this.editData.expireDaysSpecial;
            if ($('.ccfwgl-error-tips').length > 0)
                $('.ccfwgl-error-tips').remove();
            pieChartVm.totalCapacity = vm.editData['totalCapacity'];
            pieChartVm.leftCapacity = vm.editData['remainCapacity'];
            pieChartVm.renderChart();
        },
        //存储分析按钮点击
        handleAnalysisClick() {
            if (this.btnDisabled == true)
                return false;
            ccfwglAnalysisDialog.show = true;
            chartVm.renderChart();
        },

        //新采集工作站分配按钮点击
        handleAllocation() {
            if (this.btnDisabled == true)
                return false;
            allocationVm.show = true;
            allocationVm.listStorageId = getServerId();
        },
        handleTest(vmName) {
            let VM = getDialogVm(vmName);
            //点击配置测试时去掉点击前已存在的错误提示信息，避免造成用户点击配置测试时感觉还会验证其他字段（实际上是由于blur验证的，禅道bug4585）
            $('.ccfwgl-error-tips').remove();
            deviceTestVm.json = {
                ip: VM['json']['ip'],
                port: VM['json']['port']
            };
            if (testStorageValidateForm(VM, testStorageConfirm)) {
                let msg = testStorageValidateForm(VM, testStorageConfirm);
                let className = msg.split('&')[1]; //为了区分是显示哪个input的tips
                if ($('.' + vmName + '.ccfwgl-error-tips').length > 0)
                    $('.ccfwgl-error-tips').remove();
                $('.' + vmName + '  .' + className).append(showFormErrorTips(msg.split('&')[0]));
            }
        }
    }
});
//查看弹框vm
let ccfwglLookDialog = avalon.define({
    $id: 'ccfwglLookDialog',
    title: language_txt.xtywgl.cjzscfwgl.look,
    okText: language_txt.xtywgl.cjzscfwgl.save,
    show: false,
    modalWidth: 660,
    json: {
        name: "",
        ip: "",
        orgId: "",
        port: "",
        worktimeBegin: "",
        worktimeEnd: "",
        account: "",
        password: "",
        uploadUrl: "",
        downloadUrl: "",
        //  pointPlayUrl: "",
        id: "",
        belong: "",
        serviceTime: ""
    },
    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        this.show = false;

    }

});

//添加弹框vm
let ccfwglAddDialog = avalon.define({
    $id: 'ccfwglAddDialog',
    show: false,
    title: language_txt.xtywgl.cjzscfwgl.add,
    searchResult: "",
    orgId: "",
    selectedTitle: '',
    isClick: false,
    orgData: [],
    $skipArray: ['searchResult'],
    json: {
        name: "",
        ip: "",
        orgId: "",
        port: 5021,
        worktimeBegin: "00:00:00",
        worktimeEnd: "23:59:59",
        account: "",
        password: "",
        uploadUrl: "",
        downloadUrl: "",
        orgPath: "",
        //  pointPlayUrl: "",
        type: 0
    },
    beginTime: "",
    endTime: "",
    belong: "默认值4",
    getSelected(key, title, node) {
        this.json.orgId = key;
        this.json.orgPath = node.path;
        this.selectedTitle = node.title;
    },
    handleTreeChange(e, selectedKeys) {
        this.json.orgId = e.node.orgId;
        this.json.orgPath = e.node.path;
    },
    handleTimePiker3(obj, type) {
        this.json.worktimeBegin = obj.target.value;
        if ($('.ccfwglAddDialog .ccfwgl-error-tips').length > 0)
            $('.ccfwgl-error-tips').remove();
    },
    handleTimePiker4(obj, type) {
        this.json.worktimeEnd = obj.target.value;
        if ($('.ccfwglAddDialog .ccfwgl-error-tips').length > 0)
            $('.ccfwgl-error-tips').remove();
    },
    handleCancel(e) {
        this.show = false;
        clearInput(this);
    },
    handleOk() {
        if (this.isClick == true)
            return false;
        //为了解决点击查询按钮orgid为空
        if (ccfwglAddDialog.json['orgId'] == '')
            ccfwglAddDialog.json['orgId'] = vm.orgData[0]['orgId'];
        // console.log(validateForm(ccfwglAddDialog, addConfirm)); 
        if (validateForm(ccfwglAddDialog, addConfirm)) {
            let msg = validateForm(ccfwglAddDialog, addConfirm);
            // console.log(msg);
            let className = msg.split('&')[1]; //为了区分是显示哪个input的tips
            if ($('.ccfwglAddDialog .ccfwgl-error-tips').length > 0)
                $('.ccfwgl-error-tips').remove();
            $('.ccfwglAddDialog' + '  .' + className).append(showFormErrorTips(msg.split('&')[0]));
        }
        this.isClick = true;
        setTimeout(() => {
            this.isClick = false;
        }, 3000);
        // this.show = false;
        // clearInput(this);
    }

});
//修改弹框vm
let ccfwglModifyDialog = avalon.define({
    $id: 'ccfwglModifyDialog',
    title: language_txt.xtywgl.cjzscfwgl.modify,
    json: {
        name: "",
        ip: "",
        orgId: "",
        port: "",
        worktimeBegin: "",
        worktimeEnd: "",
        account: "",
        password: "",
        uploadUrl: "",
        downloadUrl: "",
        orgPath: "",
        //  pointPlayUrl: "",
        id: ""
    },
    orgId: "",
    selectedTitle: '',
    orgData: [],
    show: false,
    beginTime: "开始",
    endTime: "结束",
    getSelected(key, title, node) {
        this.json.orgId = key;
        this.json.orgPath = node.path;
        this.selectedTitle = node.title;
    },
    handleTreeChange(e, selectedKeys) {
        this.json.orgId = e.node.orgId;
        this.json.orgPath = e.node.path;
    },
    handleTimePiker1(obj, type) {
        this.json.worktimeBegin = obj.target.value;
        if ($('.ccfwglModifyDialog .ccfwgl-error-tips').length > 0)
            $('.ccfwgl-error-tips').remove();
    },
    handleTimePiker2(obj, type) {
        this.json.worktimeEnd = obj.target.value;
        if ($('.ccfwglModifyDialog .ccfwgl-error-tips').length > 0)
            $('.ccfwgl-error-tips').remove();
    },

    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        //为了解决点击查询按钮orgid为空
        if (ccfwglModifyDialog.json['orgId'] == '')
            ccfwglModifyDialog.json['orgId'] = vm.orgData[0]['orgId'];
        if (validateForm(ccfwglModifyDialog, ModifyConfirm)) {
            let msg = validateForm(ccfwglModifyDialog, ModifyConfirm);
            let className = msg.split('&')[1]; //为了区分是显示哪个input的tips
            if ($('.ccfwglModifyDialog .ccfwgl-error-tips').length > 0)
                $('.ccfwgl-error-tips').remove();
            $('.ccfwglModifyDialog' + '  .' + className).append(showFormErrorTips(msg.split('&')[0]));
        }
        // this.show = false;
    }



});

//配置测试弹框
let deviceTestVm = avalon.define({
    $id: "deviceTest",
    title: language_txt.xtywgl.cjzscfwgl.tip,
    show: false,
    modalWidth: 273,
    okText: language_txt.xtywgl.cjzscfwgl.save,
    testResult: language_txt.xtywgl.cjzscfwgl.testing,
    json: {
        ip: '',
        port: 0
    },
    handleCancel(e) {
        this.show = false;
    },
    deviceTestClick() {
        this.show = false;
    }
});

//删除弹框
let deleteVm = avalon.define({
    $id: "delete",
    title: language_txt.xtywgl.cjzscfwgl.delete,
    extra_classen: extra_class,
    show: false,
    modalWidth: 293,
    okText: language_txt.xtywgl.cjzscfwgl.save,
    toggle: true,
    deleteCount: 1,
    item: [], //列表中的删除的对象
    handleCancel(e) {
        this.show = false;
        deleteVm.item = [];
    },
    handleOk() {
        let serverId = getServerId();
        deleteAjax(serverId).then((ret) => {
            if (ret.code == 0) {
                if (ret.data.notDelete.length >= 1) {
                    // showMessage('warn', '该数据因已经绑定工作站无法删除，请先解绑');
                    showMessage('warn', language_txt.xtywgl.cjzscfwgl.someDataCanNotBeDeletedBecauseTheLawEnforcementRecorderHasBeenBoundPleaseUnbindItFirst);
                    return;
                }
                showMessage('success', language_txt.xtywgl.cjzscfwgl.deletedSuccessfully);
                vm.ajaxTableList(vm.orgId);
                vm.checkAll = false;
            } else {
                showMessage('error', ret.msg);
            }

        });
        deleteVm.item = [];
        this.show = false;
    },
});

//存储策略新弹框vm
let ccfwglMethodDialog = avalon.define({
    $id: 'ccfwglMethodDialog',
    show: false,
    title: language_txt.xtywgl.cjzscfwgl.storageStrategy,
    okText: language_txt.xtywgl.cjzscfwgl.save,
    cancelText: language_txt.xtywgl.cjzscfwgl.cancel,
    modalWidth: 410,
    showNormalInput: false,
    showSpecialInput: false,
    json: {
        strategyId: "",
        expireDaysNormal: "",
        expireDaysSpecial: "",
    },
    displayValue: '显示默认值',
    handleCancel(e) {
        this.show = false;
        this.showNormalInput = false;
        this.showSpecialInput = false;
    },
    handleOk() {
        let msg = "";
        let validate = new FaajValidate();
        // validate.add(ccfwglMethodDialog.json.expireDaysNormal, 'isNoEmpty', '普通视音频存储期限不能为空&ccfwgl-normalDay');
        // validate.add(ccfwglMethodDialog.json.expireDaysNormal, 'isNumber', '普通视音频存储期限必须为正整数&ccfwgl-normalDay');
        // validate.add(ccfwglMethodDialog.json.expireDaysNormal, 'isMaxNumber9', '最大只能输入9位数字，且不能为0&ccfwgl-normalDay');
        // validate.add(ccfwglMethodDialog.json.expireDaysSpecial, 'isNoEmpty', '重要视音频存储期限不能为空&ccfwgl-specialDay');
        // validate.add(ccfwglMethodDialog.json.expireDaysSpecial, 'isNumber', '重要视音频存储期限必须为正整数&ccfwgl-specialDay');
        // validate.add(ccfwglMethodDialog.json.expireDaysSpecial, 'isMaxNumber9', '最大只能输入9位数字，且不能为0&ccfwgl-specialDay');
        validate.add(ccfwglMethodDialog.json.expireDaysNormal, 'isNoEmpty', language_txt.xtywgl.cjzscfwgl.commonMediaStorageTermCannotBeNull + '&ccfwgl-normalDay');
        validate.add(ccfwglMethodDialog.json.expireDaysNormal, 'isNumber', language_txt.xtywgl.cjzscfwgl.commonMediaStorageTermMustBeAPositiveInteger + '&ccfwgl-normalDay');
        validate.add(ccfwglMethodDialog.json.expireDaysNormal, 'isMaxNumber9', language_txt.xtywgl.cjzscfwgl.atMost9DigitsAndCannotBe0 + '&ccfwgl-normalDay');
        validate.add(ccfwglMethodDialog.json.expireDaysSpecial, 'isNoEmpty', language_txt.xtywgl.cjzscfwgl.markedMediaStorageTermCannotBeNull + '&ccfwgl-specialDay');
        validate.add(ccfwglMethodDialog.json.expireDaysSpecial, 'isNumber', language_txt.xtywgl.cjzscfwgl.markedMediaStorageTermMustBeAPositiveInteger + '&ccfwgl-specialDay');
        validate.add(ccfwglMethodDialog.json.expireDaysSpecial, 'isMaxNumber9', language_txt.xtywgl.cjzscfwgl.atMost9DigitsAndCannotBe0 + '&ccfwgl-specialDay');
        let closure = methodComfirm.before(validate.start.bind(validate));
        if (msg = closure()) { //返回错误信息msg
            let className = msg.split('&')[1]; //为了区分是显示哪个input的tips
            if ($('.ccfwglMethodDialog .ccfwgl-error-tips').length > 0) //防止多次增加错误提示
                $('.ccfwgl-error-tips').remove();
            $('.ccfwglMethodDialog' + '  .' + className).append(showFormErrorTips(msg.split('&')[0]));
            return false;

        }
        this.show = false;
        this.showNormalInput = false;
        this.showSpecialInput = false;
    },
    handleComfirm(num, $event) {
        let wrong = vm.handleInputBlur((num == 1 ? 'specialDay' : 'normalDay'), 'ccfwglMethodDialog', $event);
        if (wrong)
            return false;
        if (num == 1) { //重要音视频存储
            this.showSpecialInput = false;
        } else {
            this.showNormalInput = false;
        }
    },
    handleModify(num) {
        if (num == 1) { //重要音视频存储
            this.showSpecialInput = true;
        } else {
            this.showNormalInput = true;

        }
    }

});

//存储分析弹框vm
let ccfwglAnalysisDialog = avalon.define({
    $id: 'ccfwglAnalysisDialog',
    show: false,
    modalWidth: 660,
    title: '存储分析',
    showTime: false,
    curValue: '1', //用于标识选中的radio
    startTime: moment().format('YYYY-MM-DD'),
    endtTime: moment().format('YYYY-MM-DD'),
    json: '',
    radioOptions: [{
            label: '过去7天',
            value: '1'
        },
        {
            label: '过去30天',
            value: '2'
        },
        {
            label: '一段时间',
            value: '3'
        },
    ],
    options1: {
        col: 'startTime',
        placeholder: '请选择开始时间',
        format: 'YYYY-MM-DD',
        startDate: moment().subtract(0.5, 'year').format('YYYY-MM-DD'),
        endDate: new Date().toLocaleString().split(" ")[0],
        value: moment().format('YYYY-MM-DD'),
        showTime: true,
        languageSelect: extra_class ? 'en' : ''
    },
    options2: {
        col: 'endTime',
        placeholder: '请选择结束时间',
        format: 'YYYY-MM-DD',
        startDate: moment().subtract(0.5, 'year').format('YYYY-MM-DD'),
        endDate: new Date().toLocaleString().split(" ")[0],
        value: moment().format('YYYY-MM-DD'),
        showTime: true,
        languageSelect: extra_class ? 'en' : ''
    },
    $timeForm: createForm({
        onFieldsChange(fields, record) {
            if (record.startTime && record.endTime) {
                timeObj = record;
            }


        }
    }),

    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        this.show = false;
    },
    handleChange(e) {
        switch (e.target.value) {
            case '1':
            case '2':
                this.showTime = false;
                //  ccfwglAnalysisDialog.getAnalysisData();
                break;
            default:
                this.showTime = true;

        }
    },

    getAnalysisData() {
        getAnalysisDataAjax().then((ret) => {

        });
    }


});



//采集工作站新分配弹窗
let allocationVm = avalon.define({
    $id: 'stationAllocation2',
    title: language_txt.xtywgl.cjzscfwgl.storageAllocation,
    okText: language_txt.xtywgl.cjzscfwgl.save,
    cancelText: language_txt.xtywgl.cjzscfwgl.cancel,
    modalWidth: 680,
    show: false,
    searchAjax: searchStationAjax,
    getItemsByOrgIdAjax: getStationByOrgIdAjax,
    getRightItemsByStorageId: getStationAjax,
    orgData: [],
    listStorageId: '',
    searchInputValue: '',
    searchResults: [],
    parentsNodeOrgIds: [],
    getResultItems: [],
    curClickSelectNodes: [],
    curClickRightItems: [],
    treeObj: null,
    hasAddNodes: [],
    parentsNodes: [],
    settings: {
        type: 0,
        leftTitle: language_txt.xtywgl.ccgl.collectionWorkstationNotAssignedtotheserver,
        rightTitle: language_txt.xtywgl.ccgl.collectionWorkstationAssignedtotheserver,
        rightEmptyTip: language_txt.xtywgl.ccgl.noResult,
        searchPlaceHolder: language_txt.xtywgl.cjzscfwgl.enterWs,        
    },
    $skipArray: ['treeObj', 'hasAddNodes', 'parentsNodes'],
    returnRightItems: function (items) {
        this.getResultItems = items;
    },
    returnHasAddNodes: function (treeObj, hasAddNodes, parentsNodes) {
        this.treeObj = treeObj;
        this.hasAddNodes = hasAddNodes;
        this.parentsNodes = parentsNodes;
    },
    handleCancel(e) {
        initCcfwglAssignData(this);
    },
    handleOk() {
        let serverId = getServerId();
        stationAssignAjax(serverId, allocationVm.getResultItems).then((ret) => {
            if (ret.code == 0) {
                showMessage('success', language_txt.xtywgl.cjzscfwgl.allocationOfStorageSuccessfully);
                // showMessage('success', '分配采集工作站成功！');
                vm.ajaxTableList(vm.orgId);
                vm.btnDisabled = true;
                vm.checkBox = [];
                vm.checkAll = false;
            } else
                showMessage('error', language_txt.xtywgl.cjzscfwgl.allocationOfStorageFailed);
            // showMessage('error', '分配采集工作站失败！');
        });
        initCcfwglAssignData(this);
    }

});





//显示存储策略中的饼图
const pieChartVm = avalon.define({
    $id: 'ccfwglMethodChart',
    totalCapacity: 0,
    leftCapacity: 0,
    data: [],
    renderChart() {
        let _this = this;
        var options = {
            title: {
                text: language_txt.xtywgl.cjzscfwgl.capacityStatistics,
                left: 'center',
                top: 20,
                textStyle: {
                    fontFamily: "Microsoft YaHei",
                    fontWeight: "bolder",
                    color: ' #536b82',
                    fontSize: '18'
                }

            },
            tooltip: {
                trigger: 'item',
                formatter: "{b}<br/>({d}%)"
            },
            legend: {
                orient: 'vertical',
                bottom: 3,
                left: 'left',
                data: [language_txt.xtywgl.cjzscfwgl.expectedUse + (_this.totalCapacity - _this.leftCapacity) + 'GB', language_txt.xtywgl.cjzscfwgl.esstimatedRemaining + _this.leftCapacity + 'GB'],
                textStyle: {
                    fontFamily: "Microsoft YaHei",
                    fontWeight: "bolder",
                    color: ' #536b82'
                }
            },
            color: ['#19C2F9', '#FEB940'],
            series: [{
                type: 'pie',
                radius: '65%',
                center: ['50%', '50%'],
                selectedMode: 'single',
                data: [{
                        value: _this.leftCapacity,
                        name: language_txt.xtywgl.cjzscfwgl.esstimatedRemaining + _this.leftCapacity + 'GB'
                    },
                    {
                        value: _this.totalCapacity - _this.leftCapacity,
                        name: language_txt.xtywgl.cjzscfwgl.expectedUse + (_this.totalCapacity - _this.leftCapacity) + 'GB'
                    }
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    },
                    normal: {
                        label: {
                            show: false //隐藏标示文字
                        },
                        labelLine: {
                            show: false //隐藏标示线
                        }
                    }
                }
            }]
        };
        var myChart = ec.init(pieChartVm.$element);
        myChart.setOption(options);
        //    console.log(calculateMA(10));
    }
});


//显示折线图
const chartVm = avalon.define({
    $id: 'ccfwglAnalysisChart',
    data: [],
    renderChart() {
        var options = {
            title: {
                text: '增长',
                left: 0,
                textStyle: {
                    fontWeight: 400,
                    fontSize: 14,
                    color: '#6B7C8E'

                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            legend: {
                data: ['已使用容量', '总容量', 'MA5'],
                itemWidth: 12,
                itemHeight: 12,
                left: 25,
                bottom: 0,

            },
            grid: {
                left: '10%',
                right: '10%',
                bottom: '15%'
            },
            xAxis: {
                type: 'category',
                data: data0.categoryData,
                scale: true,
                boundaryGap: false,
                axisLine: {
                    onZero: false
                },
                splitLine: {
                    show: false
                },
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax'
            },
            yAxis: {
                scale: true,
                splitArea: {
                    show: true
                }
            },
            dataZoom: [{
                    type: 'inside',
                    start: 50,
                    end: 100
                },
                {
                    show: true,
                    type: 'slider',
                    y: '90%',
                    start: 50,
                    end: 100
                }
            ],
            series: [

                {
                    name: 'MA5',
                    type: 'line',
                    //  data: calculateMA(5),
                    data: [4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040
                    ],
                    smooth: true,
                    lineStyle: {
                        normal: {
                            opacity: 0.5
                        }
                    }
                },
                {
                    name: '已使用容量',
                    type: 'bar',
                    stack: 'de',
                    data: [2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040,
                        2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040,
                        2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040,
                        2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040,
                        2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040,
                        2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040,
                        2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040,
                        2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040,
                        2220, 3040, 2220, 3040, 2220, 3040, 2220, 3040
                    ],
                    itemStyle: {
                        normal: {
                            color: '#00995D'
                        }
                    }
                },
                {
                    name: '总容量',
                    type: 'bar',
                    stack: 'de',
                    data: [4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040, 5420, 3040,
                        4480, 5000, 4509, 3500, 5000, 3040, 4470, 3040
                    ],
                    itemStyle: {
                        normal: {
                            color: '#12D134'
                        }
                    }
                }

            ]
        };
        var myChart = ec.init(chartVm.$element);
        myChart.setOption(options);
        //    console.log(calculateMA(10));
    }
});

//查看，修改弹框共用逻辑
function lookModifyCommom(vm, editData) {
    let data = editData;
    vm['json']['name'] = data.name; //服务名称
    vm['json']['account'] = data.account; //账号
    vm['json']['password'] = data.password; //密码
    vm['json']['downloadUrl'] = data.downloadUrl; //下载路径
    vm['json']['ip'] = data.ip; //服务类型
    vm['json']['uploadUrl'] = data.uploadUrl; //上传路径
    vm['json']['port'] = data.port; //存储服务地址
    vm['json']['id'] = data.rid; //存储服务Id
    if (vm == ccfwglModifyDialog) {
        vm['beginTime'] = data.worktimeBegin;
        vm['endTime'] = data.worktimeEnd;
        vm['json']['worktimeBegin'] = data.worktimeBegin;
        vm['json']['worktimeEnd'] = data.worktimeEnd;
    } else {
        vm['json']['serviceTime'] = data.worktimeBegin + '-' + data.worktimeEnd; //服务时段
        vm['json']['belong'] = data.orgName; //归属机构

    }
}



//提示框提示
function showMessage(type, content) {
    notification[type]({
        title: cjzscfwgl_language.tips,
        message: content
    });
}
//【添加弹框】 点击确定，或取消按钮清除input框
function clearInput(Vm) {
    Vm.json = {
        name: "",
        ip: "",
        orgId: "",
        port: 5021,
        worktimeBegin: "00:00:00",
        worktimeEnd: "23:59:59",
        account: "",
        password: "",
        uploadUrl: "",
        downloadUrl: "",
        orgPath: ""
        //  pointPlayUrl: "",
    };
};

function getDialogVm(name) {
    let obj = {
        'ccfwglAddDialog': ccfwglAddDialog,
        'ccfwglModifyDialog': ccfwglModifyDialog,
        'ccfwglMethodDialog': ccfwglMethodDialog
    };
    return obj[name];
}
//获取存储服务Id
function getServerId() {
    let data = deleteVm.item.length != 0 ? deleteVm.item : vm.checkBox.$model;
    let json = data.map(function (item) {
        return item['rid'];
    });
    json = json.join(',');
    return json;
}


//比较开始时段与结束时段
function checkTime(beginTime, endTime) {
    let beginTimeArr = $.trim(beginTime).split(":");
    let endTimeArr = $.trim(endTime).split(":");
    let beginSecondsTotal = beginTimeArr[0] * 3600 + beginTimeArr[1] * 60 + (beginTimeArr[2] - 0);
    let endSecondsTotal = endTimeArr[0] * 3600 + endTimeArr[1] * 60 + (endTimeArr[2] - 0);
    if (beginSecondsTotal > endSecondsTotal)
        return true;
    return false;
};
//添加弹框中确定请求
function addConfirm() {
    addAjax(ccfwglAddDialog.json).then((ret) => {
        if (ret.code == 0) {
            showMessage('success', language_txt.xtywgl.cjzscfwgl.addedSuccessfully);
            vm.ajaxTableList(vm.orgId);
            vm.checkAll = false;
            ccfwglAddDialog.show = false;
            clearInput(ccfwglAddDialog);

        } else if(ret.code == 1038) {
            showMessage('error', language_txt.xtywgl.cjzscfwgl.sameIPorportalreadyexists);
        } else {
            showMessage('error', ret.msg);

        }
    });
};
//修改弹框中修改请求s
function ModifyConfirm() {
    modifyAjax(ccfwglModifyDialog.json).then((ret) => {
        if (ret.code == 0) {
            showMessage('success', language_txt.xtywgl.cjzscfwgl.changedSuccessfully);
            vm.ajaxTableList(vm.orgId);
            vm.checkAll = false;
            ccfwglModifyDialog.show = false;
        } else if(ret.code == 1038) {
            showMessage('error', language_txt.xtywgl.cjzscfwgl.sameIPorportalreadyexists);
        }  else {
            showMessage('error', ret.msg);
        }
    });
};
//配置测试弹框请求
function testStorageConfirm() {
    deviceTestVm.show = true;
    deviceTestVm.testResult = language_txt.xtywgl.cjzscfwgl.testing;
    testStorageAvailableAjax(deviceTestVm.json).then((ret) => {
        if (ret.code == 0) {
            deviceTestVm.testResult = language_txt.xtywgl.cjzscfwgl.ok;
        } else {
            deviceTestVm.testResult = language_txt.xtywgl.cjzscfwgl.ipOrPortConfigurationError;
        }
    });
}



//存储策略弹框中存储策略确定请求
function methodComfirm() {
    let json = {
        'strategyId': ccfwglMethodDialog.json.strategyId,
        'expireDaysNormal': ccfwglMethodDialog.json.expireDaysNormal,
        'expireDaysSpecial': ccfwglMethodDialog.json.expireDaysSpecial
    };
    methodComfirmAjax(json).then((ret) => {
        if (ret.code == 0)
            showMessage('success', language_txt.xtywgl.cjzscfwgl.storageDaysChangedSuccessfully);
        else
            showMessage('warn', ret.msg);
        vm.ajaxTableList(vm.orgId);
        vm.btnDisabled = true;
        vm.checkBox = [];
    });
};

//将数据转换为key,title,children属性
function changeTreeData(treeData) {
    var i = 0,
        len = treeData.length,
        picture = '/static/image/tyywglpt/org.png';
    for (; i < len; i++) {
        treeData[i].icon = picture;
        treeData[i].key = treeData[i].orgId;
        treeData[i].title = treeData[i].orgName;
        treeData[i].path = treeData[i].path;
        treeData[i].children = treeData[i].childs;
        treeData[i].isParent = true;
        if (treeData[i].hasOwnProperty('dutyRange'))
            delete(treeData[i]['dutyRange']);
        if (treeData[i].hasOwnProperty('extend'))
            delete(treeData[i]['extend']);
        if (treeData[i].hasOwnProperty('orderNo'))
            delete(treeData[i]['orderNo']);

        if (!(treeData[i].childs && treeData[i].childs.length)) {

        } else {
            changeTreeData(treeData[i].childs);
        };
    };
    return treeData;
}
//添加，修改弹框共用表单验证逻辑
function validateForm(Vm, ajaxMethod) {
    let validate = new FaajValidate();
    // validate.add(Vm.json.name, 'isNoEmpty', '服务名称不能为空&ccfwgl-serviceName');
    // validate.add(Vm.json.name, 'firstLastisNoEmpty', '服务名称前后不能有空格&ccfwgl-serviceName');
    // validate.add(Vm.json.name, 'includeSpecialChar', '服务名称不能包含特殊字符&ccfwgl-serviceName');
    // validate.add(Vm.json.name, 'maxLength:32', '服务名称不能超过32个字符&ccfwgl-serviceName');
    // validate.add(Vm.json.ip, 'isNoEmpty', 'IP不能为空&ccfwgl-ip');
    // validate.add(Vm.json.ip, 'testIpNotPort', 'IP格式不正确&ccfwgl-ip');
    // validate.add(Vm.json.port, 'isNoEmpty', '端口不能为空&ccfwgl-port');
    // validate.add(Vm.json.port, 'isNumber', '端口必须为数字(正整数)&ccfwgl-port');
    // validate.add(Vm.json.port, 'testPortRange', '端口不符合0~65535范围&ccfwgl-port');
    // validate.add(Vm.json.port, 'includeSpecialChar', '端口不能包含特殊字符&ccfwgl-port');
    // validate.add(Vm.json.account, 'isNoEmpty', '账号不能为空&ccfwgl-account');
    // validate.add(Vm.json.password, 'isNoEmpty', '密码不能为空&ccfwgl-password');
    // validate.add(Vm.json.worktimeBegin, 'isNoEmpty', '开始时段不能为空&ccfwgl-beginTime');
    // validate.add(Vm.json.worktimeEnd, 'isNoEmpty', '结束时段不能为空&ccfwgl-endTime');
    // validate.add(checkTime(Vm.json.worktimeBegin, Vm.json.worktimeEnd), 'isCommon', '开始时段不能大于结束时段&ccfwgl-beginTime');
    // validate.add(Vm.json.uploadUrl, 'isNoEmpty', '上传路径不能为空&ccfwgl-uploadPath');
    // validate.add(Vm.json.uploadUrl, 'isVaildUrl', '路径非法&ccfwgl-uploadPath');
    // validate.add(Vm.json.downloadUrl, 'isNoEmpty', '下载路径不能为空&ccfwgl-downloadPath');
    // validate.add(Vm.json.downloadUrl, 'isVaildUrl', '路径非法&ccfwgl-downloadPath');
    validate.add(Vm.json.name, 'isNoEmpty', language_txt.xtywgl.cjzscfwgl.serviceNameCannotBeNull + '&ccfwgl-serviceName');
    validate.add(Vm.json.name, 'firstLastisNoEmpty', language_txt.xtywgl.cjzscfwgl.noSpacesBeforeOrAfterTheServiceName + '&ccfwgl-serviceName');
    validate.add(Vm.json.name, 'includeSpecialChar', language_txt.xtywgl.cjzscfwgl.noSpecialCharactersInServiceName + '&ccfwgl-serviceName');
    validate.add(Vm.json.name, 'maxLength:32', language_txt.xtywgl.cjzscfwgl.serviceNameCannotExceed32Characters + '&ccfwgl-serviceName');
    validate.add(Vm.json.ip, 'isNoEmpty', language_txt.xtywgl.cjzscfwgl.iPCannotBeNull + '&ccfwgl-ip');
    validate.add(Vm.json.ip, 'testIpNotPort', language_txt.xtywgl.cjzscfwgl.incorrectIPFormat + '&ccfwgl-ip');
    validate.add(Vm.json.port, 'isNoEmpty', language_txt.xtywgl.cjzscfwgl.portCannotBeNull + '&ccfwgl-port');
    validate.add(Vm.json.port, 'isNumber', language_txt.xtywgl.cjzscfwgl.portMustBeNumbersPositiveInteger + '&ccfwgl-port');
    validate.add(Vm.json.port, 'testPortRange', cjzscfwgl_language.portIsNotFrom0To65535 + '&ccfwgl-port');
    validate.add(Vm.json.port, 'includeSpecialChar', cjzscfwgl_language.noSpecialCharactersInPort + '&ccfwgl-port');
    validate.add(Vm.json.account, 'isNoEmpty', cjzscfwgl_language.accountCannotBeNull + '&ccfwgl-account');
    validate.add(Vm.json.password, 'isNoEmpty', cjzscfwgl_language.passwordCannotBeNull + '&ccfwgl-password');
    validate.add(Vm.json.worktimeBegin, 'isNoEmpty', cjzscfwgl_language.startTimeCannotBeNull + '&ccfwgl-beginTime');
    validate.add(Vm.json.worktimeEnd, 'isNoEmpty', cjzscfwgl_language.endTimeCannotBeNull + '&ccfwgl-endTime');
    validate.add(checkTime(Vm.json.worktimeBegin, Vm.json.worktimeEnd), 'isCommon', cjzscfwgl_language.startTimeCannotBeLaterThanEndTime + '&ccfwgl-beginTime');
    validate.add(Vm.json.uploadUrl, 'isNoEmpty', cjzscfwgl_language.uploadPathCannotBeNull + '&ccfwgl-uploadPath');
    validate.add(Vm.json.uploadUrl, 'isVaildUrl', cjzscfwgl_language.invalidPath + '&ccfwgl-uploadPath');
    validate.add(Vm.json.downloadUrl, 'isNoEmpty', cjzscfwgl_language.downloadPathCannotBeNull + '&ccfwgl-downloadPath');
    validate.add(Vm.json.downloadUrl, 'isVaildUrl', cjzscfwgl_language.invalidPath + '&ccfwgl-downloadPath');
    //validate.add(Vm.json.pointPlayUrl,'isNoEmpty','点播路径不能为空');
    let closure = ajaxMethod.before(validate.start.bind(validate));
    return closure();
}

//配置测试弹框ip,端口验证逻辑
function testStorageValidateForm(Vm, ajaxMethod) {
    let validate = new FaajValidate();
    // validate.add(Vm.json.ip, 'isNoEmpty', 'IP不能为空&ccfwgl-ip');
    // validate.add(Vm.json.ip, 'testIpNotPort', 'IP格式不正确&ccfwgl-ip');
    // validate.add(Vm.json.port, 'isNoEmpty', '端口不能为空&ccfwgl-port');
    // validate.add(Vm.json.port, 'isNumber', '端口必须为数字(正整数)&ccfwgl-port');
    // validate.add(Vm.json.port, 'testPortRange', '端口不符合0~65535范围&ccfwgl-port');
    // validate.add(Vm.json.port, 'includeSpecialChar', '端口不能包含特殊字符&ccfwgl-port');
    validate.add(Vm.json.ip, 'isNoEmpty', cjzscfwgl_language.iPCannotBeNull + '&ccfwgl-ip');
    validate.add(Vm.json.ip, 'testIpNotPort', cjzscfwgl_language.incorrectIPFormat + '&ccfwgl-ip');
    validate.add(Vm.json.port, 'isNoEmpty', cjzscfwgl_language.portCannotBeNull + '&ccfwgl-port');
    validate.add(Vm.json.port, 'isNumber', cjzscfwgl_language.portMustBeNumbersPositiveInteger + '&ccfwgl-port');
    validate.add(Vm.json.port, 'testPortRange', cjzscfwgl_language.portIsNotFrom0To65535 + '&ccfwgl-port');
    validate.add(Vm.json.port, 'includeSpecialChar', cjzscfwgl_language.noSpecialCharactersInPort + '&ccfwgl-port');
    let closure = ajaxMethod.before(validate.start.bind(validate));
    return closure();
}

//分配弹框确定或取消时初始化数据(由于不同的记录共用一颗树，只能remove掉已经添加的节点)
function initCcfwglAssignData(vm) {
    let treeObj = vm.treeObj;
    let hasAddNodes = vm.hasAddNodes;
    let parentsNodes = vm.parentsNodes;
    for (var i = 0, l = hasAddNodes.length; i < l; i++) {
        treeObj && treeObj.removeNode(hasAddNodes[i]);
    }
    // for (var j = 0, k = parentsNodes.length; j < k; j++) {
    //     let node = treeObj.getNodesByParam("key", parentsNodes[j], null);
    //     treeObj.expandNode(node[0], false, null, null, false);
    // }
    treeObj && treeObj.expandAll(false); //谢敏辉2/27
    vm.listStorageId = '';
    vm.parentsNodeOrgIds = [];
    vm.curClickSelectNodes = [];
    vm.curClickRightItems = [];
    vm.searchInputValue = '';
    vm.searchResults = [];
    vm.show = false;
}

//显示表单错误信息
function showFormErrorTips(errMsg) {
    return `<span class="ccfwgl-error-tips" title="${errMsg}">${errMsg}</span>`;
}
// 限制两秒有效发请求一次
let timeLimitQuery = (function () {
    let timer = null;
    return function (fn, limitTime, arg) {
        let now = new Date().getTime();
        let limit = now - timer;
        if (limit > limitTime)
            fn.apply(null, arg);
        timer = now;
    };
})();

//获取对象中的values
function getValues(arr, attr) {
    let ret = [];
    for (var i = 0; i < arr.length; i++) {
        if (typeof arr[i] == 'object') {
            for (var key in arr[i]) {
                if (key == attr)
                    ret.push(arr[i][key]);
            }
        } else {
            ret.push(arr[i]);
        }
    }
    return ret;
}
//判断数组中是否含有某个值
function contains(arr, value) {
    let flag = false;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == value) {
            flag = true;
        }
    }
    return flag;
}
//获取对象中符合条件的某个对象
function getMatch(arr, attr, value) {
    var match = null;
    for (var i = 0; i < arr.length; i++) {
        if (typeof arr[i] == 'object') {
            for (var key in arr[i]) {
                if (key == attr && arr[i][key] == value)
                    match = arr[i];
            }
        }
    }
    return match;
}
//去除数据前后空格
function trimData(json) {
    for (let i in json) {
        json[i] = $.trim(json[i]);
    };
    return json;
}


/* 接口 */
/* 获取所属机构 */
function getOrgAll() {
    return ajax({
        url: '/gmvcs/uap/org/find/fakeroot/mgr',
        //url: '/gmvcs/uap/org/all',
        //   url: '/api/tyywglpt-cczscfwgl',

        method: 'get',
        cache: false
    });
}
/*
 *分级获取部门
 *  */
function getOrgbyExpand(orgId, checkType) {
    return ajax({
        url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + orgId + '&&checkType=' + checkType,
        method: 'get',
        cache: false
    });

}

/* 获取列表记录 */
function getTableData(orgId, page = 0, pageSize = 20, orgPath) {
    return ajax({
        url: '/gmvcs/uom/storage/workstation/get',
        method: 'post',
        data: {
            orgId: orgId || null,
            type: 0,
            page: page,
            pageSize: pageSize,
            orgPath: orgPath
        }
    });
}
/* 修改 */
function modifyAjax(json) {
    return ajax({
        url: '/gmvcs/uom/storage/workstation/modify',
        method: 'post',
        data: trimData(json.$model)
    });
}
/* 添加 */
function addAjax(json) {
    return ajax({
        url: '/gmvcs/uom/storage/workstation/add',
        method: 'post',
        data: trimData(json.$model)
    });
}
/* 删除 */
function deleteAjax(serverIds) {
    return ajax({
        url: '/gmvcs/uom/storage/workstation/delete/' + serverIds,
        method: 'get'
    });
}
/* 存储策略确定*/
function methodComfirmAjax(json) {
    return ajax({
        url: '/gmvcs/uom/storage/workstation/strategy/modify',
        method: 'post',
        data: trimData(json)
    });
}
/* 获取存储分析图表数据*/
function getAnalysisDataAjax() {
    return ajax({
        url: '/api/ccfwgl-chart',
        method: 'get',
    });
}
/* 根据所属机构获取分配的采集工作站列表 */
function getStationByOrgIdAjax(orgId) {
    return ajax({
        url: '/gmvcs/uom/device/workstation/basicInfos/' + orgId,
        method: 'get',
        cache: false
    });
}
/* 根据存储服务ID获取分配的采集工作站列表 */
function getStationAjax(storageId) {
    return ajax({
        url: '/gmvcs/uom/device/workstation/basicinfos/' + storageId,
        method: 'get',
        cache: false
    });
}
/* 采集工作站存储服务-分配采集工作站 */
function stationAssignAjax(serverId, stationsIds) {
    return ajax({
        url: '/gmvcs/uom/storage/workstation/assign',
        method: 'post',
        data: {
            storageId: serverId,
            workstationIds: stationsIds
        }
    });
}
/* 模糊搜索采集工作站 */
function searchStationAjax(searchKey) {
    return ajax({
        // url: '/gmvcs/uom/device/workstation/searchkey/?key=' + encodeURIComponent(searchKey),
        url: '/gmvcs/uom/device/workstation/getOrgPathByWsName?name=' + encodeURIComponent(searchKey),
        method: 'get',
        cache: false,
        data: null
    });
}
/* 获取所有的采集工作站，包含机构id */
function getAllStationsAjax() {
    return ajax({
        url: '/gmvcs/uom/device/workstation/org/all',
        method: 'get'
    });
}
/*配置测试接口 */
function testStorageAvailableAjax(json) {
    return ajax({
        url: '/gmvcs/uom/storage/service/available?Ip=' + json.ip + '&Port=' + parseInt(json.port),
        method: 'get'
    });
}




var data0 = splitData([
    ['2013/1/24', 2320.26, 2320.26, 2287.3, 2362.94],
    ['2013/1/25', 2300, 2291.3, 2288.26, 2308.38],
    ['2013/1/28', 2295.35, 2346.5, 2295.35, 2346.92],
    ['2013/1/29', 2347.22, 2358.98, 2337.35, 2363.8],
    ['2013/1/30', 2360.75, 2382.48, 2347.89, 2383.76],
    ['2013/1/31', 2383.43, 2385.42, 2371.23, 2391.82],
    ['2013/2/1', 2377.41, 2419.02, 2369.57, 2421.15],
    ['2013/2/4', 2425.92, 2428.15, 2417.58, 2440.38],
    ['2013/2/5', 2411, 2433.13, 2403.3, 2437.42],
    ['2013/2/6', 2432.68, 2434.48, 2427.7, 2441.73],
    ['2013/2/7', 2430.69, 2418.53, 2394.22, 2433.89],
    ['2013/2/8', 2416.62, 2432.4, 2414.4, 2443.03],
    ['2013/2/18', 2441.91, 2421.56, 2415.43, 2444.8],
    ['2013/2/19', 2420.26, 2382.91, 2373.53, 2427.07],
    ['2013/2/20', 2383.49, 2397.18, 2370.61, 2397.94],
    ['2013/2/21', 2378.82, 2325.95, 2309.17, 2378.82],
    ['2013/2/22', 2322.94, 2314.16, 2308.76, 2330.88],
    ['2013/2/25', 2320.62, 2325.82, 2315.01, 2338.78],
    ['2013/2/26', 2313.74, 2293.34, 2289.89, 2340.71],
    ['2013/2/27', 2297.77, 2313.22, 2292.03, 2324.63],
    ['2013/2/28', 2322.32, 2365.59, 2308.92, 2366.16],
    ['2013/3/1', 2364.54, 2359.51, 2330.86, 2369.65],
    ['2013/3/4', 2332.08, 2273.4, 2259.25, 2333.54],
    ['2013/3/5', 2274.81, 2326.31, 2270.1, 2328.14],
    ['2013/3/6', 2333.61, 2347.18, 2321.6, 2351.44],
    ['2013/3/7', 2340.44, 2324.29, 2304.27, 2352.02],
    ['2013/3/8', 2326.42, 2318.61, 2314.59, 2333.67],
    ['2013/3/11', 2314.68, 2310.59, 2296.58, 2320.96],
    ['2013/3/12', 2309.16, 2286.6, 2264.83, 2333.29],
    ['2013/3/13', 2282.17, 2263.97, 2253.25, 2286.33],
    ['2013/3/14', 2255.77, 2270.28, 2253.31, 2276.22],
    ['2013/3/15', 2269.31, 2278.4, 2250, 2312.08],
    ['2013/3/18', 2267.29, 2240.02, 2239.21, 2276.05],
    ['2013/3/19', 2244.26, 2257.43, 2232.02, 2261.31],
    ['2013/3/20', 2257.74, 2317.37, 2257.42, 2317.86],
    ['2013/3/21', 2318.21, 2324.24, 2311.6, 2330.81],
    ['2013/3/22', 2321.4, 2328.28, 2314.97, 2332],
    ['2013/3/25', 2334.74, 2326.72, 2319.91, 2344.89],
    ['2013/3/26', 2318.58, 2297.67, 2281.12, 2319.99],
    ['2013/3/27', 2299.38, 2301.26, 2289, 2323.48],
    ['2013/3/28', 2273.55, 2236.3, 2232.91, 2273.55],
    ['2013/3/29', 2238.49, 2236.62, 2228.81, 2246.87],
    ['2013/4/1', 2229.46, 2234.4, 2227.31, 2243.95],
    ['2013/4/2', 2234.9, 2227.74, 2220.44, 2253.42],
    ['2013/4/3', 2232.69, 2225.29, 2217.25, 2241.34],
    ['2013/4/8', 2196.24, 2211.59, 2180.67, 2212.59],
    ['2013/4/9', 2215.47, 2225.77, 2215.47, 2234.73],
    ['2013/4/10', 2224.93, 2226.13, 2212.56, 2233.04],
    ['2013/4/11', 2236.98, 2219.55, 2217.26, 2242.48],
    ['2013/4/12', 2218.09, 2206.78, 2204.44, 2226.26],
    ['2013/4/15', 2199.91, 2181.94, 2177.39, 2204.99],
    ['2013/4/16', 2169.63, 2194.85, 2165.78, 2196.43],
    ['2013/4/17', 2195.03, 2193.8, 2178.47, 2197.51],
    ['2013/4/18', 2181.82, 2197.6, 2175.44, 2206.03],
    ['2013/4/19', 2201.12, 2244.64, 2200.58, 2250.11],
    ['2013/4/22', 2236.4, 2242.17, 2232.26, 2245.12],
    ['2013/4/23', 2242.62, 2184.54, 2182.81, 2242.62],
    ['2013/4/24', 2187.35, 2218.32, 2184.11, 2226.12],
    ['2013/4/25', 2213.19, 2199.31, 2191.85, 2224.63],
    ['2013/4/26', 2203.89, 2177.91, 2173.86, 2210.58],
    ['2013/5/2', 2170.78, 2174.12, 2161.14, 2179.65],
    ['2013/5/3', 2179.05, 2205.5, 2179.05, 2222.81],
    ['2013/5/6', 2212.5, 2231.17, 2212.5, 2236.07],
    ['2013/5/7', 2227.86, 2235.57, 2219.44, 2240.26],
    ['2013/5/8', 2242.39, 2246.3, 2235.42, 2255.21],
    ['2013/5/9', 2246.96, 2232.97, 2221.38, 2247.86],
    ['2013/5/10', 2228.82, 2246.83, 2225.81, 2247.67],
    ['2013/5/13', 2247.68, 2241.92, 2231.36, 2250.85],
    ['2013/5/14', 2238.9, 2217.01, 2205.87, 2239.93],
    ['2013/5/15', 2217.09, 2224.8, 2213.58, 2225.19],
    ['2013/5/16', 2221.34, 2251.81, 2210.77, 2252.87],
    ['2013/5/17', 2249.81, 2282.87, 2248.41, 2288.09],
    ['2013/5/20', 2286.33, 2299.99, 2281.9, 2309.39],
    ['2013/5/21', 2297.11, 2305.11, 2290.12, 2305.3],
    ['2013/5/22', 2303.75, 2302.4, 2292.43, 2314.18],
    ['2013/5/23', 2293.81, 2275.67, 2274.1, 2304.95],
    ['2013/5/24', 2281.45, 2288.53, 2270.25, 2292.59],
    ['2013/5/27', 2286.66, 2293.08, 2283.94, 2301.7],
    ['2013/5/28', 2293.4, 2321.32, 2281.47, 2322.1],
    ['2013/5/29', 2323.54, 2324.02, 2321.17, 2334.33],
    ['2013/5/30', 2316.25, 2317.75, 2310.49, 2325.72],
    ['2013/5/31', 2320.74, 2300.59, 2299.37, 2325.53],
    ['2013/6/3', 2300.21, 2299.25, 2294.11, 2313.43],
    ['2013/6/4', 2297.1, 2272.42, 2264.76, 2297.1],
    ['2013/6/5', 2270.71, 2270.93, 2260.87, 2276.86],
    ['2013/6/6', 2264.43, 2242.11, 2240.07, 2266.69],
    ['2013/6/7', 2242.26, 2210.9, 2205.07, 2250.63],
    ['2013/6/13', 2190.1, 2148.35, 2126.22, 2190.1]
]);


function splitData(rawData) {
    var categoryData = [];
    var values = []
    for (var i = 0; i < rawData.length; i++) {
        categoryData.push(rawData[i].splice(0, 1)[0]);
        values.push(rawData[i])
    }
    return {
        categoryData: categoryData,
        values: values
    };
}

function calculateMA(dayCount) {
    var result = [];
    for (var i = 0, len = data0.values.length; i < len; i++) {
        if (i < dayCount) {
            result.push('-');
            continue;
        }
        var sum = 0;
        for (var j = 0; j < dayCount; j++) {
            sum += data0.values[i - j][1];
        }
        result.push(sum / dayCount);
    }
    return result;
}
//用于判断选择的数据是否来自级联平台
function judgeCheckboxData(data) {
    let arr = [];
    avalon.each(data, function (index, value) {
        if (value.source) {
            arr.push(index);
        }
    });
    //let stringtip ='';
    // if(arr.length>0){
    //     avalon.each(arr, function (index,val) {
    //         stringtip = stringtip + val + ',';
    //     })
    // }
    if (arr.length > 0) return true;
    return false;
}

function yhglDepTree(treeData) {
    var i = 0,
        len = treeData.length;
    for (; i < len; i++) {
        treeData[i].icon = icon_dep;
        treeData[i].key = treeData[i].orgId;
        treeData[i].title = treeData[i].orgName;
        treeData[i].orgCode = treeData[i].orgCode;
        if (!treeData[i].childs) {
            treeData[i].children = new Array();
        } else {
            treeData[i].children = treeData[i].childs;
        }
        treeData[i].isParent = true;
        if (treeData[i].hasOwnProperty('dutyRange'))
            delete(treeData[i]['dutyRange']);
        if (treeData[i].hasOwnProperty('extend'))
            delete(treeData[i]['extend']);
        if (treeData[i].hasOwnProperty('orderNo'))
            delete(treeData[i]['orderNo']);

        if (!(treeData[i].childs && treeData[i].childs.length)) {

        } else {
            yhglDepTree(treeData[i].childs);
        };
    };
    return treeData;
}