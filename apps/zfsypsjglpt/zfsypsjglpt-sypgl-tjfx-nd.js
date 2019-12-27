import avalon from "avalon2";
import "ane";
import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
import * as menuServer from '../../services/menuService';
var storage = require('../../services/storageService.js').ret;
let language_txt = require('../../vendor/language').language;
import {
    languageSelect
} from '../../services/configService';
import '/services/filterService';

export const name = "zfsypsjglpt-sypgl-tjfx-nd";
require("/apps/zfsypsjglpt/zfsypsjglpt-sypgl-tjfx.less");

let tjfx_vm,
    tableObject_tjfx = {},
    search_condition = {},
    local_storage = {
        "timeStamp": "",
        "ajax_data": {},
        "table_list": [],
        "list_total": "",
        "current_len": "",
        "list_totalPages": ""
    },
    deptemp = [];
avalon.component(name, {
    template: __inline("./zfsypsjglpt-sypgl-tjfx-nd.html"),
    defaults: {
        sypgl_txt: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl,
        tjfx_txt: language_txt.zfsypsjglpt.zfsypsjglpt_tjfx,
        extra_class: languageSelect == "en" ? true : false,

        crumbsArr: [],
        returnBtn() {
            this.crumbsArr.pop();
            tjfx_vm.change_page = false;
            tjfx_vm.tjfx_tree.tree_code = this.crumbsArr[this.crumbsArr.length - 1].orgPath;
            tjfx_vm.tjfx_tree.orgId = this.crumbsArr[this.crumbsArr.length - 1].orgId;
            tjfx_vm.tjfx_tree.tree_key = this.crumbsArr[this.crumbsArr.length - 1].orgId;
            tjfx_vm.tjfx_tree.tree_title = this.crumbsArr[this.crumbsArr.length - 1].orgName;
            this.ajaxLevel = this.crumbsArr[this.crumbsArr.length - 1].level;
            tjfx_vm.searchFuc();
        },

        zfyps_table_data: [],
        curPage: 1,
        table_pagination: {
            current: 0,
            pageSize: 20,
            total: 0,
            current_len: 0,
            totalPages: 0
        },
        record_item: {},
        selected_arr: [],
        media_info: {},

        dataBtnActive: true,
        btnClickActive: true,
        weekClick() {
            this.dataBtnActive = true;
            this.btnClickActive = true;

            if (moment().format('d') == "0") {
                tjfx_startTime_vm.tjfx_startTime = moment().day(-6).format('YYYY-MM-DD');
                tjfx_endTime_vm.tjfx_endTime = moment().day(0).format('YYYY-MM-DD');
                // tjfx_endTime_vm.tjfx_endTime = moment().day(0).format('YYYY-MM-DD');
            } else {
                tjfx_startTime_vm.tjfx_startTime = moment().day(1).format('YYYY-MM-DD');
                // tjfx_endTime_vm.tjfx_endTime = moment().day(7).format('YYYY-MM-DD');
            }
            tjfx_endTime_vm.tjfx_endTime = moment().format('YYYY-MM-DD');
        },
        monthClick() {
            this.dataBtnActive = true;
            this.btnClickActive = false;

            tjfx_startTime_vm.tjfx_startTime = moment().startOf('month').format('YYYY-MM-DD');
            tjfx_endTime_vm.tjfx_endTime = moment().format('YYYY-MM-DD');
            // tjfx_endTime_vm.tjfx_endTime = moment().endOf('month').format('YYYY-MM-DD');
        },

        change_page: false, //判断是查询还是翻页触发的刷新数据 查询-false 翻页-true

        page_type: false, //fasle 显示总条数; true 显示大于多少条
        getCurrent(current) {
            this.table_pagination.current = current;
            this.curPage = current;
            // console.log("当前页码:" + this.table_pagination.current);
        },
        getPageSize(pageSize) {
            this.table_pagination.pageSize = pageSize;
            // console.log("当前页面大小:" + this.table_pagination.pageSize);
        },
        handlePageChange(page) {
            this.change_page = true;
            this.curPage = page;
            this.table_pagination.current = page;
            tableObject_tjfx.page(page, this.table_pagination.pageSize);
            this.zfyps_table_data = [];
            tableObject_tjfx.tableDataFnc([]);
            tableObject_tjfx.loading(true);
            this.get_table_list_device();
        },

        opt_tjfx: avalon.define({
            $id: "opt_tjfx_nd",
            authority: { // 按钮权限标识
                "SLQKTJ": false, //统计分析_摄录情况统计
                "SLQKTJSEARCH": false, //统计分析_摄录情况统计_查询
                "ZCTJ": false, //统计分析_资产统计
                "ZCTJSEARCH": false, //统计分析_资产统计_查询
            }
        }),

        tjfx_tree: avalon.define({
            $id: "tjfx_tree",
            yspk_data: [],
            // yspk_value: [],
            orgId: "",
            tree_key: "",
            tree_title: "",
            // yspk_expandedKeys: [],
            tree_code: "",
            curTree: "",
            getSelected(key, title, e) {
                this.tree_key = key;
                this.tree_title = title;
            },
            select_change(e, selectedKeys) {
                this.curTree = e.node.path;
                this.orgId = e.node.orgId;
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
                            title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
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
        }),
        onInit(e) {
            set_size();
            tjfx_vm = e.vmodel;

            tableObject_tjfx = $.tableIndex({ //初始化表格jq插件
                id: 'tjfx_table',
                tableBody: tableBody_tjfx
            });

            // orgKey = "";
            // orgPath = "";
            this.ajaxLevel = 0;
            this.crumbsArr = [];
            tjfx_vm.tjfx_tree.curTree = "";
            this.zfyps_table_data = [];
            tableObject_tjfx.tableDataFnc([]);
            tableObject_tjfx.loading(true);

            let init_data = storage.getItem("zfsypsjglpt-sypgl-tjfx-nd");
            neet_init = true; //判断是否需要初始化页面；true为重新从后台拿数据初始化，false为从Local Storage拿数据填充。

            // set_size();

            if (init_data) {
                if ((getTimestamp() - init_data.timeStamp) > 1800 || !init_data) //1800 = 30 * 60
                    neet_init = true;
                else {
                    neet_init = false;

                    tjfx_vm.tjfx_tree.orgId = init_data.orgId;
                    tjfx_vm.tjfx_tree.tree_code = init_data.orgPath;
                    tjfx_vm.tjfx_tree.tree_key = init_data.tree_key;
                    tjfx_vm.tjfx_tree.tree_title = init_data.tree_title;
                    // orgPath = init_data.ajax_data.orgPath;

                    this.ajaxLevel = init_data.ajax_data.level;
                    let obj = {
                        orgPath: tjfx_vm.tjfx_tree.tree_code,
                        orgId: tjfx_vm.tjfx_tree.orgId,
                        orgName: tjfx_vm.tjfx_tree.tree_title,
                        level: this.ajaxLevel,
                    };
                    this.crumbsArr.push(obj);

                    this.page_type = init_data.page_type;
                    this.curPage = init_data.ajax_data.page + 1;
                    this.table_pagination.current = init_data.ajax_data.page + 1;
                    this.table_pagination.total = init_data.list_total;
                    this.table_pagination.current_len = init_data.current_len;
                    this.table_pagination.totalPages = init_data.list_totalPages;
                    search_condition = {
                        "page": init_data.ajax_data.page,
                        "pageSize": init_data.ajax_data.pageSize,
                        "orgPath": init_data.ajax_data.orgPath,
                        "orgId": init_data.ajax_data.orgId,
                        "target": init_data.ajax_data.target,
                        // "psStartTime": getTimeByDateStr(init_data.ajax_data.psStartTime),
                        // "psEndTime": getTimeByDateStr(init_data.ajax_data.psEndTime, true)
                    };

                    this.zfyps_table_data = init_data.table_list;
                    // tableObject_tjfx.tableDataFnc(init_data.table_list);
                }
            }

            deptemp = [];
            ajax({
                url: '/gmvcs/uap/org/find/fakeroot/mgr',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.treeFail,
                        title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
                    });
                    return;
                }
                getDepTree(result.data, deptemp);
                tjfx_vm.tjfx_tree.yspk_data = deptemp;
                // tjfx_vm.tjfx_tree.yspk_value = new Array(deptemp[0].key);
                // tjfx_vm.tjfx_tree.yspk_expandedKeys = new Array(deptemp[0].key);
                tjfx_vm.tjfx_tree.tree_code = deptemp[0].path;
                tjfx_vm.tjfx_tree.orgId = deptemp[0].orgId;
                tjfx_vm.tjfx_tree.tree_key = deptemp[0].key;
                tjfx_vm.tjfx_tree.tree_title = deptemp[0].title;
                // this.initObj = {
                //     orgPath: deptemp[0].path,
                //     orgId: deptemp[0].orgId,
                //     orgName: deptemp[0].title,
                //     level: 0,
                // }

                if (neet_init) {
                    // tjfx_vm.tjfx_tree.yspk_value = new Array(deptemp[0].key);
                    this.searchBtn();
                } else {
                    // this.initObj = {
                    //     orgPath: init_data.ajax_data.orgPath,
                    //     orgId: init_data.ajax_data.orgId,
                    //     orgName: init_data.tree_title,
                    //     level: parseInt(init_data.ajax_data.level),
                    // }
                    tjfx_vm.tjfx_tree.tree_code = init_data.ajax_data.orgPath;
                    tjfx_vm.tjfx_tree.orgId = init_data.orgId;
                    tjfx_vm.tjfx_tree.tree_key = init_data.tree_key;
                    tjfx_vm.tjfx_tree.tree_title = init_data.tree_title;
                }
            });

            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_TJFX/.test(el) || /^AUDIO_MENU_TJFX/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_TJFX_ZCTJ_SEARCH_JJ":
                            _this.opt_tjfx.authority.ZCTJSEARCH = true;
                            break;
                    }
                });
            });
        },
        onReady() {
            let _this = this;

            set_size();
            if (storage.getItem("zfsypsjglpt-sypgl-tjfx-nd") && neet_init == false) {
                this.get_table_list_device();
            }

            setTimeout(function () {
                $(".zfyps_input_panel .policeId").width($(".zfyps_input_panel").width() - 24);
                $(".zfyps_input_panel .key_name").width($(".zfyps_input_panel").width() - 24);
            }, 500);

            $(window).resize(function () {
                set_size();
                tableObject_tjfx.setForm();
            });
        },
        onDispose() {
            this.zfyps_table_data = [];
            tableObject_tjfx.destroy();
            // tableObject_tjfx.tableDataFnc([]);
        },
        select_table(record, selected, selectedRows) {
            this.selected_arr = selectedRows;
        },
        selectAll_table(selected, selectedRows) {
            this.selected_arr = selectedRows;
        },

        included_status: false, //true 包含子部门；false 不包含子部门
        clickBranchBack(e) {
            this.included_status = e;
        },
        get_table_list_recording() {
            let start_time, end_time;
            start_time = tjfx_startTime_vm.tjfx_startTime;
            end_time = tjfx_endTime_vm.tjfx_endTime;

            let ajax_data = {
                "includeChild": this.included_status,
                "page": this.curPage - 1,
                "pageSize": this.table_pagination.pageSize,
                "orgPath": tjfx_vm.tjfx_tree.curTree || tjfx_vm.tjfx_tree.tree_code,
                "policeType": "LEVAM_JYLB_ALL",
                "psStartTime": getTimeByDateStr(start_time),
                "psEndTime": getTimeByDateStr(end_time, true)
            };

            if (this.change_page) {
                ajax_data = search_condition;
                ajax_data.page = this.curPage - 1;
            } else
                search_condition = ajax_data;

            ajax({
                // url: '/api/tjfxInfo',
                url: '/gmvcs/stat/l/search/statistics/pageable',
                // url: '/gmvcs/stat/l/rs/info',
                method: 'post',
                data: ajax_data
            }).then(result => {
                if (result.code != 0) {
                    notification.warn({
                        message: result.msg,
                        title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
                    });
                    return;
                }
                this.selected_arr = [];
                let temp_data = {
                    "includeChild": ajax_data.includeChild,
                    "page": ajax_data.page,
                    "pageSize": ajax_data.pageSize,
                    "orgPath": ajax_data.orgPath,
                    "policeType": ajax_data.policeType,
                    "psStartTime": start_time,
                    "psEndTime": end_time
                };

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    this.curPage = 0;
                    this.table_pagination.current = 0;
                    tableObject_tjfx.page(0, this.table_pagination.pageSize);
                    this.zfyps_table_data = [];
                    tableObject_tjfx.tableDataFnc([]);
                    tableObject_tjfx.loading(false);
                    this.table_pagination.total = 0;

                    local_storage.timeStamp = getTimestamp();
                    local_storage.ajax_data = temp_data;
                    local_storage.orgId = tjfx_vm.tjfx_tree.orgId;
                    local_storage.tree_key = tjfx_vm.tjfx_tree.tree_key;
                    local_storage.tree_title = tjfx_vm.tjfx_tree.tree_title;
                    local_storage.table_list = [];
                    local_storage.list_total = "0";
                    local_storage.current_len = "0";
                    local_storage.list_totalPages = "0";

                    // storage.setItem('zfsypsjglpt-sypgl-tjfx-nd', local_storage);
                    return;
                }

                let ret_data = [];
                let temp = (this.curPage - 1) * this.table_pagination.pageSize + 1;
                avalon.each(result.data.currentElements, function (index, item) {
                    ret_data[index] = {};
                    ret_data[index].index = temp + index; //行序号
                    ret_data[index].orgName = item.orgName; //所属部门
                    ret_data[index].orgId = item.orgId; //所属部门di
                    ret_data[index].orgPath = item.orgPath; //部门路径
                    ret_data[index].space = ""; //空title需要
                    ret_data[index].policeType = item.policeType; //人员类别code
                    ret_data[index].policeTypeName = item.policeTypeName || "-"; //人员类别name
                    ret_data[index].userName = item.userName; //警员
                    ret_data[index].userCode = item.userCode; // 警号（警员） 或者 身份证号（辅警）
                    ret_data[index].name_id = item.userName + "(" + item.userCode + ")"; //警员（警号）
                    ret_data[index].videoCount = item.videoCount; //视频数合计
                    ret_data[index].videoMatchCount = item.videoMatchCount; //业务关联
                    ret_data[index].videoKeyCount = item.videoKeyCount; //执法仪标记
                    ret_data[index].videoNoMark = item.videoNoMark; //无标记
                    ret_data[index].audioOnlyCount = item.audioOnlyCount; //音频数
                    ret_data[index].picOnlyCount = item.picOnlyCount; //图片数

                    ret_data[index].startTime = start_time; //开始时间
                    ret_data[index].endTime = end_time; //结束时间
                    ret_data[index].includeChild = ajax_data.includeChild; //是否包含子部门
                });

                this.zfyps_table_data = ret_data;
                tableObject_tjfx.tableDataFnc(ret_data);
                tableObject_tjfx.loading(false);

                if (result.data.overLimit) {
                    this.page_type = true;

                    this.table_pagination.total = result.data.limit * this.table_pagination.pageSize; //总条数
                    this.table_pagination.totalPages = result.data.limit; //总页数
                } else {
                    this.page_type = false;

                    this.table_pagination.total = result.data.totalElements; //总条数
                    this.table_pagination.totalPages = result.data.totalPages; //总页数
                }
                this.table_pagination.current_len = result.data.currentElements.length;

                local_storage.timeStamp = getTimestamp();
                local_storage.ajax_data = temp_data;
                local_storage.orgId = tjfx_vm.tjfx_tree.orgId;
                local_storage.tree_key = tjfx_vm.tjfx_tree.tree_key;
                local_storage.tree_title = tjfx_vm.tjfx_tree.tree_title;
                local_storage.table_list = ret_data;
                local_storage.page_type = this.page_type;
                local_storage.list_total = this.table_pagination.total;
                local_storage.current_len = this.table_pagination.current_len;
                local_storage.list_totalPages = this.table_pagination.totalPages;
                // storage.setItem('zfsypsjglpt-sypgl-tjfx-nd', local_storage);
            });
        },
        ajaxLevel: 0,
        searchBtn() {
            this.ajaxLevel = 0;
            this.crumbsArr = [];
            let obj = {
                orgPath: this.tjfx_tree.tree_code,
                orgId: this.tjfx_tree.orgId,
                orgName: this.tjfx_tree.tree_title,
                level: 0,
            };
            this.crumbsArr.push(obj);
            this.searchFuc();
        },
        searchFuc() {
            this.change_page = false;
            this.curPage = 1;
            this.table_pagination.current = 1;
            tableObject_tjfx.page(1, this.table_pagination.pageSize);
            this.zfyps_table_data = [];
            tableObject_tjfx.tableDataFnc([]);
            tableObject_tjfx.loading(true);

            this.get_table_list_device();
        },
        get_table_list_device() {
            let ajax_data = {
                "page": this.curPage - 1,
                "pageSize": this.table_pagination.pageSize,
                "orgId": tjfx_vm.tjfx_tree.orgId,
                "level": this.ajaxLevel,
                // "level": this.crumbsArr.length > 1 ? "1" : "0",
            };

            if (this.change_page) {
                ajax_data = search_condition;
                ajax_data.page = this.curPage - 1;
            } else
                search_condition = ajax_data;

            ajax({
                // url: '/api/tjfxInfo',
                // url: '/gmvcs/uom/device/statistics/assets/statistics',
                url: '/gmvcs/uom/device/statistics/assets/statistics?level=' + ajax_data.level + "&orgId=" + ajax_data.orgId + "&vpage=" + ajax_data.page + "&vpageSize=" + ajax_data.pageSize,

                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.warn({
                        message: result.msg,
                        title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
                    });
                    return;
                }
                this.selected_arr = [];
                let temp_data = {
                    "page": ajax_data.page,
                    "pageSize": ajax_data.pageSize,
                    "orgId": ajax_data.orgId,
                    "level": ajax_data.level,
                };

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    this.curPage = 0;
                    this.table_pagination.current = 0;
                    tableObject_tjfx.page(0, this.table_pagination.pageSize);
                    this.zfyps_table_data = [];
                    tableObject_tjfx.tableDataFnc([]);
                    tableObject_tjfx.loading(false);
                    this.table_pagination.total = 0;

                    local_storage.timeStamp = getTimestamp();
                    local_storage.ajax_data = temp_data;
                    local_storage.orgId = tjfx_vm.tjfx_tree.orgId;
                    local_storage.orgPath = tjfx_vm.tjfx_tree.tree_code;
                    local_storage.tree_key = tjfx_vm.tjfx_tree.tree_key;
                    local_storage.tree_title = tjfx_vm.tjfx_tree.tree_title;
                    local_storage.table_list = [];
                    local_storage.list_total = "0";
                    local_storage.current_len = "0";
                    local_storage.list_totalPages = "0";
                    storage.setItem('zfsypsjglpt-sypgl-tjfx-nd', local_storage);
                    return;
                }

                // if (this.ajaxLevel == 1 && !result.data.overLimit && result.data.totalElements == 1) {
                //     console.log(this.crumbsArr);
                // }

                let ret_data = [];
                let temp = (this.curPage - 1) * this.table_pagination.pageSize + 1;
                avalon.each(result.data.currentElements, function (index, item) {
                    ret_data[index] = {};
                    ret_data[index].index = temp + index; //行序号
                    ret_data[index].orgName = item.orgName; //所属部门
                    ret_data[index].orgId = item.orgId; //所属部门id
                    ret_data[index].orgPath = item.orgPath; //部门路径
                    ret_data[index].space = ""; //空title需要
                    ret_data[index].orgUserTotal = item.orgUserTotal; //部门人数
                    ret_data[index].countTotal = item.assetsDSJInfo.countTotal; //执法仪台数
                    ret_data[index].allotRatio = item.assetsDSJInfo.allotRatio; //执法仪配发率
                    // ret_data[index].zfyspzdx = (item.zfyspzdx / (1024 * 1024 * 1024)).toFixed(2); //执法仪视频大小
                    ret_data[index].workstationTotal = item.assetsWorkstationInfo.workstationTotal; //台数
                    ret_data[index].spaceTotal = item.assetsWorkstationInfo.spaceTotal; //总容量
                    ret_data[index].spacePerDsjUser = item.assetsWorkstationInfo.spacePerDsjUser; //人均存储量
                });

                this.zfyps_table_data = ret_data;
                tableObject_tjfx.tableDataFnc(ret_data);
                tableObject_tjfx.loading(false);

                if (result.data.overLimit) {
                    this.page_type = true;

                    this.table_pagination.total = result.data.limit * this.table_pagination.pageSize; //总条数
                    this.table_pagination.totalPages = result.data.limit; //总页数
                } else {
                    this.page_type = false;

                    this.table_pagination.total = result.data.totalElements; //总条数
                    this.table_pagination.totalPages = result.data.totalPages; //总页数
                }
                this.table_pagination.current_len = result.data.currentElements.length;

                local_storage.timeStamp = getTimestamp();
                local_storage.ajax_data = temp_data;
                local_storage.orgId = tjfx_vm.tjfx_tree.orgId;
                local_storage.orgPath = tjfx_vm.tjfx_tree.tree_code;
                local_storage.tree_key = tjfx_vm.tjfx_tree.tree_key;
                local_storage.tree_title = tjfx_vm.tjfx_tree.tree_title;
                local_storage.table_list = ret_data;
                local_storage.page_type = this.page_type;
                local_storage.list_total = this.table_pagination.total;
                local_storage.current_len = this.table_pagination.current_len;
                local_storage.list_totalPages = this.table_pagination.totalPages;
                storage.setItem('zfsypsjglpt-sypgl-tjfx-nd', local_storage);
            });

        }

    }
});

let zfysypjj_table_vm = avalon.define({
    $id: "zfsypsjglpt_tjfx_table",
    extra_class: languageSelect == "en" ? true : false,
    loading: false,
    actions(type, text, record, index) {
        tjfx_vm.record_item = record;
        if (type == "check_click") {
            $(".popover").hide();
            tjfx_vm.ajaxLevel = 1;
            tjfx_vm.change_page = false;
            let obj = {
                orgPath: record.orgPath,
                orgId: record.orgId,
                orgName: record.orgName,
                level: 1,
            }
            if (tjfx_vm.crumbsArr[tjfx_vm.crumbsArr.length - 1].level == obj.level && tjfx_vm.crumbsArr[tjfx_vm.crumbsArr.length - 1].orgId == obj.orgId) {
                // console.log(tjfx_vm.crumbsArr);
                return;
            }
            tjfx_vm.crumbsArr.push(obj);
            tjfx_vm.tjfx_tree.tree_code = record.orgPath;
            tjfx_vm.tjfx_tree.orgId = record.orgId;
            tjfx_vm.tjfx_tree.tree_key = record.orgId;
            tjfx_vm.tjfx_tree.tree_title = record.orgName;
            tjfx_vm.searchFuc();
            // console.log(tjfx_vm.crumbsArr);
        }
    },
    handleSelect(record, selected, selectedRows) {
        tjfx_vm.select_table(record, selected, selectedRows);
    },
    handleSelectAll(selected, selectedRows) {
        tjfx_vm.selectAll_table(selected, selectedRows);
    }
});

let neet_init;
// orgKey = "",
// orgPath = "";

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
        dataTree[i].orgId = item.orgId; //---部门路径，search的时候需要发
        dataTree[i].path = item.orgPath; //---部门路径，search的时候需要发

        dataTree[i].isParent = true;
        dataTree[i].icon = "/static/image/zfsypsjglpt/users.png";
        dataTree[i].children = new Array();

        // if (item.path == orgPath)
        //     orgKey = item.orgCode;

        getDepTree(item.childs, dataTree[i].children);
    }
}

let tjfx_startTime_vm = avalon.define({
    $id: "tjfx_startTime_1",
    endDate: moment().format('YYYY-MM-DD'),
    tjfx_startTime: moment().format('d') == "0" ? moment().day(-6).format('YYYY-MM-DD') : moment().day(1).format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.tjfx_startTime = e.target.value;
    }
});

let tjfx_endTime_vm = avalon.define({
    $id: "tjfx_endTime_1",
    endDate: moment().format('YYYY-MM-DD'),
    tjfx_endTime: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.tjfx_endTime = e.target.value;
    }
});
/* 主页面时间控制  end */

function set_size() {
    let v_height = $(window).height() - 96;
    let v_min_height = $(window).height() - 68;
    if (v_height > 740) {
        // $(".zfsypsjglpt_yspk_zfypsjj").height(v_height);
        $("#sidebar .zfsypsjglpt-menu").css("min-height", v_min_height + "px");
    } else {
        // $(".zfsypsjglpt_yspk_zfypsjj").height(740);
        $("#sidebar .zfsypsjglpt-menu").css("min-height", "765px");
    }
}

/*================== 时间控制函数 start =============================*/
//获取当前时间戳
function getTimestamp() {
    return Math.round(new Date().getTime() / 1000);
    //getTime()返回数值的单位是毫秒
}

//日期转时间戳
function getTimeByDateStr(stringTime, end_flag) {
    // var s = stringTime.split(" ");
    // var s1 = s[0].split("-");
    var s1 = stringTime.split("-");
    var s2 = ["00", "00", "00"];
    // if (s2.length == 2) {
    //     s2.push("00");
    // }
    if (end_flag == true)
        s2 = ["23", "59", "59"];

    return new Date(s1[0], s1[1] - 1, s1[2], s2[0], s2[1], s2[2]).getTime();

    // 火狐不支持该方法，IE CHROME支持
    //var dt = new Date(stringTime.replace(/-/, "/"));
    //return dt.getTime();
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

//秒 转 00:00:00格式
function formatSeconds(value) {
    var second = parseInt(value); // 秒
    var minute = 0; // 分
    var hour = 0; // 小时
    var result = "";
    // alert(second);
    if (second >= 60) {
        minute = parseInt(second / 60);
        second = parseInt(second % 60);
        // alert(minute+"-"+second);
        if (minute >= 60) {
            hour = parseInt(minute / 60);
            minute = parseInt(minute % 60);
        }
    }
    if (hour < 10)
        hour = "0" + hour;
    if (minute < 10)
        minute = "0" + minute;
    if (second < 10)
        second = "0" + second;

    result = hour + ":" + minute + ":" + second;
    return result;
}
/*================== 时间控制函数 end =============================*/
let tableBody_tjfx = avalon.define({ //表格定义组件
    $id: 'tjfx_table',
    extra_class: languageSelect == "en" ? true : false,
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
    dragStorageName: 'tjfx-tableDrag-style',
    debouleHead: ["table-index-thead", "tjfx_table_parent"], //多级表头，需要将所有表头的class名当做数组传入；单级表格可以忽略这个参数
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
        zfysypjj_table_vm.handleSelectAll(e.target.checked, this.selection.$model);
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
        zfysypjj_table_vm.handleSelect(record.$model, checked, this.selection.$model);
    },
    handle: function (type, col, record, $index) { //操作函数
        var extra = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            extra[_i - 4] = arguments[_i];
        }
        var text = record[col].$model || record[col];
        zfysypjj_table_vm.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});