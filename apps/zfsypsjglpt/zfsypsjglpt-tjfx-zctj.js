/*
 * @Author: mikey.liangzhu
 * @Date:   2018-07-28 15:57:29
 * @Last Modified by: mikey.liangzhu
 * @Last Modified time: 2018-09-06 15:12:32
 * @ modify 新需求 统计对象去掉 进来默认查询当前部门  点击部门查询下一级部门 time: Date:2018-07-28 15:57:29
 * @ modify 修改面包屑bug time: Date:2018-08-28 10:12:09
 */
import avalon from "avalon2";
import "ane";
import {
    message,
    notification,
    Loading
} from "ane";
import ajax from "/services/ajaxService";
import {
    apiUrl
} from '../../services/configService';
import * as menuServer from '../../services/menuService';
import {
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;
export const name = "zfsypsjglpt-tjfx-zctj";

require("/apps/zfsypsjglpt/zfsypsjglpt-tjfx-zctj.css");
require('/apps/common/common-org-breadcrumb');

var storage = require('../../services/storageService.js').ret;

let app_icon = "/static/image/xtpzgl-xtcd/app.png",
    menu_icon = "/static/image/xtpzgl-xtcd/menu.png",
    fuc_icon = "/static/image/xtpzgl-xtcd/function.gif";


let tableObject_zctj = {};
let zctj_vm = null;
avalon.component(name, {
    template: __inline("./zfsypsjglpt-tjfx-zctj.html"),
    defaults: {
        zctj_txt: language_txt.zfsypsjglpt.zfsypsjglpt_zctj,
        extra_class: languageSelect == "en" ? true : false,

        // 面包屑
        firstbreadcrumbList: {},
        breadcrumbList: [],
        breadcrumbClick(index, item) {
            this.breadcrumbList.splice(index, this.breadcrumbList.length - index)
            this.searchBtn(1, item, true)
        },

        device_id: "",
        police_check: "",

        table_pagination: {
            current: 0,
            pageSize: 17
        },
        authority: { // 按钮权限标识
            "EXPORT": false, //音视频库_统计分析_资产统计_导出
            "SEARCH": false, //音视频库_统计分析_资产统计_查询
        },
        getDepList() {
            let deptemp = [];
            ajax({
                // url: '/gmvcs/uap/org/all',
                url: '/gmvcs/uap/org/find/fakeroot/mgr',
                method: 'get',
                data: {},
                cache: false
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: language_txt.zfsypsjglpt.zfsypsjglpt_zctj.treeFail,
                        title: language_txt.zfsypsjglpt.zfsypsjglpt_zctj.notification
                    });
                    return;
                }

                getDepTree(result.data, deptemp);
                yspk_tree.yspk_data = deptemp;

                yspk_tree.tree_code = deptemp[0].path;
                yspk_tree.tree_key = deptemp[0].key;
                yspk_tree.tree_title = deptemp[0].title;

                this.firstbreadcrumbList = {
                    orgName: language_txt.zfsypsjglpt.zfsypsjglpt_zctj.home,
                    orgId: deptemp[0].key,
                    orgPath: deptemp[0].path
                }
            }).then(result => {
                this.ajaxList(0, 20);
            });
        },
        actions(type, text, record, index) {
            // console.log(type);
        },
        ajaxList(page, pageSize, level = 0, item, isbreadcrumbList) {
            count_type_vm.curType = level;
            let params = {
                "orgId": item ? item.orgId : yspk_tree.curTree || yspk_tree.tree_key,
                "level": level, // 统计对象 level: 1 下级部门 0当前部门
                "page": page,
                "pageSize": pageSize
            };
            zfsypsjglpt_tjfx_zcqktj_table.current = 1;
            zfsypsjglpt_tjfx_zcqktj_table.paramsData = params;
            zfsypsjglpt_tjfx_zcqktj_table.list = [];
            zfsypsjglpt_tjfx_zcqktj_table.fetch(params, item, isbreadcrumbList);
        },
        searchBtn(level = 0, item, isbreadcrumbList = false) {
            $('.popover.top.in').hide();

            if (level === 0) {
                this.breadcrumbList = []
                storage.setItem('zctj_vm_breadcrumbList', JSON.stringify(this.breadcrumbList))
                zfsypsjglpt_tjfx_zcqktj_table.tjfx_zctj_tabCont_top = 113;
            }

            if (level === 1) {
                zfsypsjglpt_tjfx_zcqktj_table.tjfx_zctj_tabCont_top = 158;
            }

            this.ajaxList(0, 20, level, item, isbreadcrumbList);
        },
        exportBtn() {
            zctjExportBtn();
        },
        dialogCancel() {
            this.import_show = false;
        },
        dialogOk() {
            this.import_show = false;
        },
        selectfuc(event, depNode) {

        },
        handleTableChange(table_pagination) {
            if (this.table_pagination.hasOwnProperty('current')) {
                this.table_pagination.current = table_pagination.current;
            }
        },
        onReady(event) {
            /*初始化统计对象级别*/
            if (count_type_vm.curType) {
                count_type_vm.count_type = [count_type_vm.curType];
            }

            if (yspk_tree.curTree) {
                yspk_tree.yspk_value = [yspk_tree.curTree];
            }

            $("body").bind('click', function () {
                zfsypsjglpt_tjfx_zcqktj_table.hintRjccl_flag = false;
                zfsypsjglpt_tjfx_zcqktj_table.hintPfl_flag = false;
            });

            let v_height = $(window).height() - 96;
            if (v_height > 740) {
                $(".zfsypsjglpt_tjfx_zctj_jjb").height(v_height);
            } else {
                $(".zfsypsjglpt_tjfx_zctj_jjb").height(740);
            }

            let s = $(".zcqktj-list-content").height();
            let len = zfsypsjglpt_tjfx_zcqktj_table.list.length;
            if (len * 34 > s) {
                $(".zcqktj-list-header-upper").addClass('table-padding-right16');
                $(".zcqktj-list-header").addClass('table-padding-right16');
            } else {
                $(".zcqktj-list-header-upper").removeClass('table-padding-right16');
                $(".zcqktj-list-header").removeClass('table-padding-right16');
            }
        },
        onInit(event) {
            let _this = this;
            zctj_vm = this;
            let breadcrumbList = storage.getItem('zctj_vm_breadcrumbList')
            if (breadcrumbList) {
                this.breadcrumbList = JSON.parse(breadcrumbList)
            }

            if (this.breadcrumbList.length) {
                zfsypsjglpt_tjfx_zcqktj_table.tjfx_zctj_tabCont_top = 158;
            } else {
                zfsypsjglpt_tjfx_zcqktj_table.tjfx_zctj_tabCont_top = 113;
            }

            tableObject_zctj = $.tableIndex({ //初始化表格jq插件
                id: 'tjfx_zctj_table',
                tableBody: tableBody_zctj
            });

            // 导出、查询按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_TJFX_ZCTJ_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                if (func_list.length == 0) {
                    $('.zcqktj-list-panel').css('top', '34px');
                    return;
                }

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_TJFX_ZCTJ_EXPORT_JJ":
                            _this.authority.EXPORT = true;
                            break;
                        case "AUDIO_FUNCTION_TJFX_ZCTJ_SEARCH_JJ":
                            _this.authority.SEARCH = true;
                            break;
                    }
                });
                if (false == _this.authority.EXPORT && false == _this.authority.SEARCH)
                    $('.zcqktj-list-panel').css('top', '34px');
            });
            if (!yspk_tree.curTree) {
                this.getDepList();
            }
        }
    }
});

// 新需求 统计对象去掉 进来默认查询当前部门  点击部门查询下一级部门
let count_type_vm = avalon.define({
    $id: 'zctj_count_type_jjb',
    curType: "",
    //  count_type_options: [],
    count_type_options: [{
        value: "0",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_zctj.currentDepartment
    }, {
        value: "1",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_zctj.juniorDepartment
    }],
    count_type: ["0"],
    onChangeT(e) {
        let _this = this;
        _this.curType = e.target.value;
    }
});
/*生成统计对象*/
function initCountObject() {
    if (!yspk_tree.orgPath) {
        return;
    }
    let countURL = '/gmvcs/uap/org/count/level?path=' + yspk_tree.orgPath;
    ajax({
        //         url: '/api/tjfx-slqktj-countOBJ',
        url: countURL,
        method: 'get',
        data: {},
        cache: false
    }).then(result => {
        if (result.code != 0) {
            notification.error({
                message: language_txt.zfsypsjglpt.zfsypsjglpt_zctj.getStatisticsF,
                title: language_txt.zfsypsjglpt.zfsypsjglpt_zctj.notification
            });
            return;
        }
        let countLevel = [];
        for (let a = 0; a < result.data; a++) {
            if (a == 0) {
                let levelObj = {
                    value: '0',
                    label: language_txt.zfsypsjglpt.zfsypsjglpt_zctj.currentDepartment
                };
                countLevel.push(levelObj);
                continue;
            }
            let objTxt = languageSelect == "en" ? "Next " + a : "下" + a + "级";
            let levelObj = {
                value: a,
                label: objTxt
            };
            countLevel.push(levelObj);
        }
        count_type_vm.count_type_options = []; //清空
        count_type_vm.count_type_options = countLevel;
    });
}

//定义树
let yspk_tree = avalon.define({
    $id: "zcqktj_tree_jjb",
    yspk_data: [],
    tree_key: "",
    tree_title: "",
    tree_code: "",
    curTree: "",
    getSelected(key, title, e) {
        this.tree_key = key;
        this.tree_title = title;
    },
    select_change(e, selectedKeys) {
        this.curTree = e.node.key;
    },
    extraExpandHandle(treeId, treeNode, selectedKey) {
        let deptemp_child = [];
        ajax({
            url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.key + '&checkType=' + treeNode.checkType,
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: result.msg,
                    title: language_txt.zfsypsjglpt.zfsypsjglpt_zctj.notification
                });
            }
            let treeObj = $.fn.zTree.getZTreeObj(treeId);
            if (result.code == 0) {
                getDepTree(result.data, deptemp_child);
                treeObj.addNodes(treeNode, deptemp_child);
            }
            if (selectedKey != treeNode.key) {
                let node = treeObj.getNodeByParam("key", selectedKey, treeNode);
                treeObj.selectNode(node);
            }
        });

    }
});

function getDepTree(treelet, dataTree) {
    if (!treelet) {
        return;
    }

    for (let i = 0, item; item = treelet[i]; i++) {
        dataTree[i] = new Object();

        dataTree[i].key = item.orgId; //---部门id
        dataTree[i].title = item.orgName; //---部门名称

        dataTree[i].orgCode = item.orgCode; //---部门code
        dataTree[i].checkType = item.checkType; //---部门code
        dataTree[i].path = item.path; //---部门路径，search的时候需要发

        dataTree[i].isParent = true;
        dataTree[i].icon = "/static/image/zfsypsjglpt/users.png";
        dataTree[i].children = new Array();

        // if (item.path == orgPath)
        //     orgKey = item.orgCode;

        getDepTree(item.childs, dataTree[i].children);
    }
}

let zfsypsjglpt_tjfx_zcqktj_table = avalon.define({
    $id: 'zfsypsjglpt_tjfx_zcqktj_table_jjb',
    tjfx_zctj_tabCont_top: 113,
    //页面表格数据渲染
    loading: false,
    hintPfl_flag: false,
    hintRjccl_flag: false,
    list: [],
    changeData: [], //保存需要编辑或者删除的用户
    total: 0,
    isNull: false,
    current: 0,
    pageSize: 20,
    paramsData: {},
    $computed: {
        pagination: function () {
            return {
                current: this.current,
                pageSize: this.pageSize,
                total: this.total,
                onChange: this.pageChange
            };
        }
    },
    hint_Rjccl() {
        this.hintPfl_flag = false;
        if (this.hintRjccl_flag == true) {
            this.hintRjccl_flag = false;
        } else {
            this.hintRjccl_flag = true;
        }
        if (languageSelect == "en") {
            $(".zfsypsjglpt_tjfx_zctj_jjb .zctj-hint-content2").css({
                "width": "495px",
                "left": "-475px"
            });
        }
    },
    hint_Pfl() {
        this.hintRjccl_flag = false;
        if (this.hintPfl_flag == true) {
            this.hintPfl_flag = false;
        } else {
            this.hintPfl_flag = true;
        }

        if (languageSelect == "en") {
            $(".zfsypsjglpt_tjfx_zctj_jjb .zctj-hint-content1").css({
                "width": "580px",
                "left": "-510px"
            });
        }
    },
    sortup() {
        this.list.sort(function (l, p) {
            return p.orgUserTotal - l.orgUserTotal
        });
    },
    getCurrent(current) {
        this.current = current;
    },
    getPageSize(pageSize) {
        this.pageSize = pageSize;
    },
    pageChange() {
        this.list = [];
        tableObject_zctj.tableDataFnc([]);

        let params = this.paramsData;
        params.pageSize = this.pageSize;
        params.page = this.current - 1;
        this.fetch(params);
    },
    fetch(params, item, isbreadcrumbList) {
        // this.loading = true;
        tableObject_zctj.loading(true);

        ajax({
            //                      url: '/api/tjfx-glqktj-table',
            url: '/gmvcs/uom/device/statistics/assets/statistics?level=' + params.level + "&orgId=" + params.orgId + "&vpage=" + params.page + "&vpageSize=" + params.pageSize,
            method: 'get',
            data: {
                //              "orgId": params.orgId,
                //              "page":params.page,
                //              "pageSize":params.pageSize
            }
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: language_txt.zfsypsjglpt.zfsypsjglpt_zctj.searchF,
                    title: language_txt.zfsypsjglpt.zfsypsjglpt_zctj.notification
                });

                this.list = [];
                tableObject_zctj.tableDataFnc([]);

                // this.loading = false;
                tableObject_zctj.loading(false);

                this.isNull = true;
                return;
            }

            if (!result.data.currentElements.length) {
                this.loading = false;
                return
            }
            if (item) {
                yspk_tree.curTree = item.orgId;
                yspk_tree.tree_key = item.orgId;
                yspk_tree.tree_code = item.orgPath;
                yspk_tree.tree_title = item.orgName;
                let list = zctj_vm.breadcrumbList.$model;
                list.unshift(zctj_vm.firstbreadcrumbList.$model);
                list.push({
                    orgName: item.orgName,
                    orgId: item.orgId,
                    orgPath: item.orgPath
                });
                list = unique(list);

                zctj_vm.breadcrumbList = JSON.parse(JSON.stringify(list));
                storage.setItem('zctj_vm_breadcrumbList', JSON.stringify(zctj_vm.breadcrumbList))
            }
            // console.log(zctj_vm.breadcrumbList)
            if (result.data.currentElements) {
                this.changeData = []; //当表格刷新当前页数据置空
                this.total = result.data.totalElements;
                let ret = [];
                avalon.each(result.data.currentElements, function (index, el) {
                    ret.push(el);
                });
                // let ret = result.data.currentElements;
                let len = ret.length; //记录当前页面的数据长度
                this.list = [];
                tableObject_zctj.tableDataFnc([]);

                if (ret.length % 20 == 0) {
                    $(".zcqktj-list-header-upper").addClass('table-padding-right16');
                    $(".zcqktj-list-header").addClass('table-padding-right16');
                } else {
                    $(".zcqktj-list-header-upper").removeClass('table-padding-right16');
                    $(".zcqktj-list-header").removeClass('table-padding-right16');
                }
                // this.loading = false;
                tableObject_zctj.loading(false);
                this.isNull = false;
                this.list = avalon.range(len).map(n => ({
                    orgName: ret[n].orgName,
                    orgId: ret[n].orgId,
                    orgPath: ret[n].orgPath,
                    orgUserTotal: ret[n].orgUserTotal,
                    countTotal: ret[n].assetsDSJInfo.countTotal,
                    deactiveTotal: ret[n].assetsDSJInfo.deactiveTotal,
                    normalTotal: ret[n].assetsDSJInfo.normalTotal,
                    repairTotal: ret[n].assetsDSJInfo.repairTotal,
                    scrapTotal: ret[n].assetsDSJInfo.scrapTotal,
                    allotRatio: ret[n].assetsDSJInfo.allotRatio,
                    //                  allotRatio: ret[n].assetsDSJInfo.allotRatio+'%',
                    workstationTotal: ret[n].assetsWorkstationInfo.workstationTotal,
                    spaceTotal: ret[n].assetsWorkstationInfo.spaceTotal,
                    spacePerDsjUser: ret[n].assetsWorkstationInfo.spacePerDsjUser,
                    //                  spaceTotal: (ret[n].assetsWorkstationInfo.spaceTotal/(1024*1024*1024)).toFixed(2),
                    //                  spacePerDsjUser: (ret[n].assetsWorkstationInfo.spacePerDsjUser/(1024*1024*1024)).toFixed(2),
                    index: 1 + 20 * (this.current - 1) + n
                }));
                tableObject_zctj.tableDataFnc(this.list);

            }
            if (result.data.totalElements == 0) {
                this.current = 0;
                // this.loading = false;
                tableObject_zctj.loading(false);

                this.isNull = true;
                return;
            }
        }).then(result => {
            _popover(); //激活title功能
            let s = $(".zcqktj-list-content").height();
            let len = this.list.length;
            if (len * 34 > s) {
                $(".zcqktj-list-header-upper").addClass('table-padding-right16');
                $(".zcqktj-list-header").addClass('table-padding-right16');
            } else {
                $(".zcqktj-list-header-upper").removeClass('table-padding-right16');
                $(".zcqktj-list-header").removeClass('table-padding-right16');
            }
        });
    },
    handleSelect(record, selected, selectedRows) {
        table.changeData = selectedRows;
    },
    handleSelectAll(selected, selectedRows) {
        for (let i = 0; i < selectedRows.length; i++) {
            table.changeData[i] = selectedRows[i];
        }
    },
});

function zctjExportBtn() {
    let temp_data = {
        "orgId": yspk_tree.curTree || yspk_tree.tree_key,
    };
    let targ = count_type_vm.curType || count_type_vm.count_type[0];

    let data = 'orgId=' + temp_data.orgId + '&level=' + targ;
    window.location.href = "http://" + window.location.host + apiUrl + "/gmvcs/uom/device/statistics/assets/statistics/excel?" + data; //远程服务器使用
}

// 表格数据判空
avalon.filters.fillterEmpty = function (str) {
    return (str === "" || str === null) ? "-" : str;
}

/*title显示,方便复制*/
function _popover() { //title的bootstrap tooltip
    let timer;
    $("[data-toggle=tooltip]").popover({
        trigger: 'manual',
        container: 'body',
        placement: 'top',
        html: 'true',
        content: function () {
            return '<div class="title-content">' + $(this)[0].innerText + '</div>';
        },
        animation: false
    }).on("mouseenter", function () {
        let _this = this;
        if ($(this)[0].innerText == "-")
            return;
        timer = setTimeout(function () {
            $('div').siblings(".popover").popover("hide");
            $(_this).popover("show");

            $(".popover").on("mouseleave", function () {
                $(_this).popover('hide');
            });
        }, 500);
    }).on("mouseleave", function () {
        let _this = this;
        clearTimeout(timer);
        setTimeout(function () {
            if (!$(".popover:hover").length) {
                $(_this).popover("hide");
            }
        }, 100);
    });
    $('.popover.top.in').hide();
}

let tableBody_zctj = avalon.define({ //表格定义组件
    $id: 'tjfx_zctj_table',
    data: [],
    key: 'rid',
    currentPage: 1,
    prePageSize: 20,
    loading: false,
    paddingRight: 0, //有滚动条时内边距
    checked: [],
    selection: [],
    isAllChecked: false,
    isColDrag: true, //true代表表格列宽可以拖动
    dragStorageName: 'zfypsjj-tableDrag-style',
    debouleHead: ["table-index-thead", "zctjjj_table_parent"], //多级表头，需要将所有表头的class名当做数组传入；单级表格可以忽略这个参数
    handleCheckAll: function (e) {
        var _this = this;
        var data = _this.data;
        if (e.target.checked) {
            data.forEach(function (record) {
                _this.checked.ensure(record[_this.key]);
                _this.selection.ensure(record);
            });
        } else {
            if (data.length > 0) {
                this.checked.clear();
                this.selection.clear();
            } else {
                this.checked.removeAll(function (el) {
                    return data.map(function (record) {
                        return record[_this.key];
                    }).indexOf(el) !== -1;
                });
                this.selection.removeAll(function (el) {
                    return data.indexOf(el) !== -1;
                });
            }
        }
        // this.selectionChange(this.checked, this.selection.$model);
        zfsypsjglpt_tjfx_zcqktj_table.handleSelectAll(e.target.checked, this.selection.$model);
    },
    handleCheck: function (checked, record) {
        if (checked) {
            this.checked.ensure(record[this.key]);
            this.selection.ensure(record);
        } else {
            this.checked.remove(record[this.key]);
            this.selection.remove(record);
        }
        // this.selectionChange(this.checked, this.selection.$model);
        zfsypsjglpt_tjfx_zcqktj_table.handleSelect(record.$model, checked, this.selection.$model);
    },
    handle: function (type, col, record, $index) { //操作函数
        var extra = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            extra[_i - 4] = arguments[_i];
        }
        var text = record[col].$model || record[col];
        zfsypsjglpt_tjfx_zcqktj_table.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});

// 去重
function unique(arr) {
    var res = [arr[0]];
    for (var i = 0; i < arr.length; i++) {
        var repeat = false;
        for (let j = 0; j < res.length; j++) {
            if (isObjectValueEqual(arr[i], res[j])) {
                repeat = true;
                break;
            }
        }
        if (!repeat) {
            res.push(arr[i]);
        }
    }
    return res;
}

//判断两对象是否相等
function isObjectValueEqual(a, b) {
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);
    if (aProps.length != bProps.length) {
        return false;
    }
    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];
        if (a[propName] !== b[propName]) {
            return false;
        }
    }
    return true;
}