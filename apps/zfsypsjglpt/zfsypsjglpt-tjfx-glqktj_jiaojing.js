import avalon from "avalon2";
import "ane";
import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
import {
    apiUrl
} from '/services/configService';
import * as menuServer from '../../services/menuService';
var storage = require('../../services/storageService.js').ret;
import {
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;
export const name = "zfsypsjglpt-tjfx-glqktj_jiaojing";
require("/apps/zfsypsjglpt/zfsypsjglpt-tjfx-glqktj_jiaojing.css");
require('/apps/common/common-org-breadcrumb');

let glqktj_jjb_vm,
    ajax_data_g = {},
    clickDept = {},
    bugPage = 1,
    tableObject_glqktj_jjb = {},
    search_condition = {},
    local_storage = {
        "timeStamp": "",
        "ajax_data": {},
        "table_list": [],
        "list_total": "",
        "current_len": "",
        "list_totalPages": "",
        "range_flag": ""
    };
avalon.component(name, {
    template: __inline("./zfsypsjglpt-tjfx-glqktj_jiaojing.html"),
    defaults: {
        // zfsypsjglpt_language: getLan(), //英文翻译
        glqktj_jjb_table_data: [],
        curPage: 1,
        table_pagination: {
            current: 0,
            pageSize: 20,
            total: 0,
            current_len: 0,
            totalPages: 0
        },
        isSearch: true, // 是否是点击查询按钮

        change_page: false, //判断是查询还是翻页触发的刷新数据 查询-false 翻页-true

        page_type: false, //fasle 显示总条数; true 显示大于多少条

        count_obj: true, //true 统计部门; fasle 统计人员
        ajax_url: "/gmvcs/stat/l/match/info",
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
            bugPage = page;
            this.table_pagination.current = page;
            tableObject_glqktj_jjb.page(page, this.table_pagination.pageSize);
            this.glqktj_jjb_table_data = [];
            tableObject_glqktj_jjb.tableDataFnc([]);
            tableObject_glqktj_jjb.loading(true);
            this.get_table_list();
        },

        opt_glqktj_jjb: avalon.define({
            $id: "opt_glqktj_jjb",
            authority: { // 按钮权限标识
                "SEARCH": false, //统计分析_关联情况统计_查询
                "EXPORT": false, //统计分析_关联情况统计_导出
            }
        }),

        // 面包屑数组
        breadcrumbList: [
            {
                orgName: '首页',
                orgId: '',
                orgPath: ''
            }
        ],
        // 面包屑点击事件
        breadcrumbClick(index, item, list) {
            this.breadcrumbList = list.$model;
            if (0 === index) {
                let orgObj = storage.getItem('tjfx-glqktj-breadcrumb-obj');
                this.searchBtnFormTable(orgObj, true);
            } else {
                this.searchBtnFormTable(item, false);
            }
        },

        glqktj_jjb_tree: avalon.define({
            $id: "glqktj_jjb_tree",
            glqktj_jjb_data: [],
            tree_key: "",
            tree_title: "",
            tree_code: "",
            orgId: "",
            orgPath: "",
            getSelected(key, title, e) {
                this.tree_key = key;
                this.tree_title = title;
            },
            select_change(e, selectedKeys) {
                this.orgId = e.node.key;
                this.orgPath = e.node.path;
                glqktj_jjb_object_type.curType = 0;
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
                            title: '通知'
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
            glqktj_jjb_vm = e.vmodel;
            ajax_data_g = {};

            tableObject_glqktj_jjb = $.tableIndex({ //初始化表格jq插件
                id: 'glqktj_jjb_table',
                tableBody: tableBody_glqktj_jjb
            });

            glqktj_jjb_vm.count_obj = true;
            glqktj_jjb_vm.ajax_url = "/gmvcs/stat/l/match/info";

            glqktj_jjb_man_type.curType = "";
            glqktj_jjb_object_type.curType = "0";
            glqktj_jjb_object_type.search_flag = false;
            glqktj_jjb_vm.glqktj_jjb_tree.orgPath = "";
            glqktj_jjb_vm.glqktj_jjb_tree.orgId = "";

            this.glqktj_jjb_table_data = [];
            tableObject_glqktj_jjb.tableDataFnc([]);
            tableObject_glqktj_jjb.loading(true);

            glqktj_jjb_time_vm.select_time = false;
            glqktj_jjb_time_vm.range_flag = 0;
            glqktj_jjb_time_vm.time_range = ["0"];

            let init_data = storage.getItem("zfsypsjglpt-tjfx-glqktj-jjb");
            neet_init = true; //判断是否需要初始化页面；true为重新从后台拿数据初始化，false为从Local Storage拿数据填充。

            // set_size();

            if (init_data) {
                if ((getTimestamp() - init_data.timeStamp) > 1800) //1800 = 30 * 60
                    neet_init = true;
                else {
                    neet_init = false;

                    glqktj_jjb_vm.glqktj_jjb_tree.tree_key = init_data.tree_key;
                    glqktj_jjb_vm.glqktj_jjb_tree.tree_title = init_data.tree_title;

                    glqktj_jjb_time_vm.range_flag = init_data.range_flag;
                    glqktj_jjb_time_vm.time_range = new Array(init_data.range_flag.toString());
                    if (glqktj_jjb_time_vm.range_flag == 2) {
                        glqktj_jjb_startTime_vm.glqktj_jjb_startTime = init_data.ajax_data.beginTime;
                        glqktj_jjb_endTime_vm.glqktj_jjb_endTime = init_data.ajax_data.endTime;
                        glqktj_jjb_time_vm.select_time = true;
                    }

                    if (init_data.ajax_data.target == "-1") {
                        glqktj_jjb_vm.count_obj = false;
                        glqktj_jjb_vm.ajax_url = "/gmvcs/stat/l/match/info/byUser";
                    }

                    glqktj_jjb_man_type.man_type = new Array(init_data.ajax_data.policeType);
                    glqktj_jjb_object_type.object_type = new Array(init_data.ajax_data.target);
                    glqktj_jjb_object_type.curType = init_data.ajax_data.target;

                    this.page_type = init_data.page_type;
                    this.curPage = init_data.ajax_data.page + 1;
                    this.table_pagination.current = init_data.ajax_data.page + 1;
                    this.table_pagination.total = init_data.list_total;
                    this.table_pagination.current_len = init_data.current_len;
                    this.table_pagination.totalPages = init_data.list_totalPages;
                    this.breadcrumbList = init_data.breadcrumbList;

                    search_condition = {
                        "page": init_data.ajax_data.page,
                        "pageSize": init_data.ajax_data.pageSize,
                        "orgId": init_data.ajax_data.orgId,
                        "orgPath": init_data.ajax_data.orgPath,
                        "policeType": init_data.ajax_data.policeType,
                        "beginTime": init_data.ajax_data.beginTime,
                        "endTime": init_data.ajax_data.endTime,
                        "target": init_data.ajax_data.target
                    };

                    ajax_data_g = search_condition;
                    this.glqktj_jjb_table_data = init_data.table_list;
                    // tableObject_glqktj_jjb.tableDataFnc(init_data.table_list);
                }
            }

            let deptemp = [];
            ajax({
                // url: '/api/dep_tree',
                // url: '/gmvcs/uap/org/all',
                url: '/gmvcs/uap/org/find/fakeroot/mgr',
                // url: '/gmvcs/uap/org/find/root',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: '获取部门树失败，请稍后再试',
                        title: '通知'
                    });
                    return;
                }

                getDepTree(result.data, deptemp);
                glqktj_jjb_vm.glqktj_jjb_tree.glqktj_jjb_data = deptemp;
                glqktj_jjb_vm.glqktj_jjb_tree.tree_code = deptemp[0].path;
                glqktj_jjb_vm.glqktj_jjb_tree.tree_key = deptemp[0].key;
                glqktj_jjb_vm.glqktj_jjb_tree.tree_title = deptemp[0].title;

                if (neet_init) {
                    this.search_list();
                    let orgObj = {};
                    orgObj.orgName = glqktj_jjb_vm.glqktj_jjb_tree.tree_title;
                    orgObj.orgId = glqktj_jjb_vm.glqktj_jjb_tree.tree_key;
                    orgObj.orgPath = glqktj_jjb_vm.glqktj_jjb_tree.tree_code;
                    this.breadcrumbList = [
                        {
                            orgName: '首页',
                            orgId: orgObj.orgId,
                            orgPath: orgObj.orgPath
                        }
                    ];
                    storage.setItem('tjfx-glqktj-breadcrumb-obj', orgObj, 0.5);
                } else {
                    glqktj_jjb_vm.glqktj_jjb_tree.tree_code = init_data.ajax_data.orgPath;
                    glqktj_jjb_vm.glqktj_jjb_tree.tree_key = init_data.tree_key;
                    glqktj_jjb_vm.glqktj_jjb_tree.tree_title = init_data.tree_title;
                }
            });

            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_TJFX_GLQKTJ/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询无权限时页面留白
                    $(".glqktj_jjb_tabCont").css("top", "34px");
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_TJFX_GLQKTJ_EXPORT_JJ":
                            _this.opt_glqktj_jjb.authority.EXPORT = true;
                            break;
                        case "AUDIO_FUNCTION_TJFX_GLQKTJ_SEARCH_JJ":
                            _this.opt_glqktj_jjb.authority.SEARCH = true;
                            break;
                    }
                });

                // 防止查询无权限时页面留白
                if (false == _this.opt_glqktj_jjb.authority.SEARCH)
                    $(".glqktj_jjb_tabCont").css("top", "34px");

            });
        },
        onReady() {
            let _this = this;

            set_size();
            if (storage.getItem("zfsypsjglpt-tjfx-glqktj-jjb") && neet_init == false) {
                tableObject_glqktj_jjb.tableDataFnc(this.glqktj_jjb_table_data);
                tableObject_glqktj_jjb.loading(false);
            }

            setTimeout(function () {
                $(".zfyps_input_panel .policeId").width($(".zfyps_input_panel").width() - 24);
                $(".zfyps_input_panel .key_name").width($(".zfyps_input_panel").width() - 24);
            }, 500);

            $(window).resize(function () {
                set_size();
                tableObject_glqktj_jjb.setForm();
            });
        },
        onDispose() {
            window.clearTimeout(search_timer);
            click_search = true;
            this.glqktj_jjb_table_data = [];
            tableObject_glqktj_jjb.destroy();
            // tableObject_glqktj_jjb.tableDataFnc([]);
        },
        select_table(record, selected, selectedRows) {
            // this.selected_arr = selectedRows;
        },
        selectAll_table(selected, selectedRows) {
            // this.selected_arr = selectedRows;
        },
        get_table_list() {
            if (glqktj_jjb_object_type.search_flag) {
                storage.removeItem("glqktj-jjb-tableDrag-style");
                $('.glqktj_jjb_table_parent li').attr("style", "");
                $('.glqktj_jjb_table_son li').attr("style", "");
                glqktj_jjb_object_type.search_flag = false;
            }

            if (glqktj_jjb_object_type.curType == "-1") {
                glqktj_jjb_vm.count_obj = false;
            } else {
                glqktj_jjb_vm.count_obj = true;
            }

            let start_time, end_time;
            if (glqktj_jjb_time_vm.range_flag == "0") {
                if (moment().format('d') == "0") {
                    start_time = moment().day(-6).format('YYYY-MM-DD');
                    end_time = moment().day(0).format('YYYY-MM-DD');
                } else {
                    start_time = moment().day(1).format('YYYY-MM-DD');
                    end_time = moment().day(7).format('YYYY-MM-DD');
                }
            }

            if (glqktj_jjb_time_vm.range_flag == "1") {
                start_time = moment().startOf('month').format('YYYY-MM-DD');
                end_time = moment().endOf('month').format('YYYY-MM-DD');
            }

            if (glqktj_jjb_time_vm.range_flag == "2") {
                start_time = glqktj_jjb_startTime_vm.glqktj_jjb_startTime;
                end_time = glqktj_jjb_endTime_vm.glqktj_jjb_endTime;
            }

            ajax_data_g = {
                "page": this.curPage - 1,
                "pageSize": this.table_pagination.pageSize,
                "orgId": glqktj_jjb_vm.glqktj_jjb_tree.orgId || glqktj_jjb_vm.glqktj_jjb_tree.tree_key,
                "orgPath": glqktj_jjb_vm.glqktj_jjb_tree.orgPath || glqktj_jjb_vm.glqktj_jjb_tree.tree_code,
                "policeType": glqktj_jjb_man_type.curType || glqktj_jjb_man_type.man_type[0],
                "beginTime": getTimeByDateStr(start_time),
                "endTime": getTimeByDateStr(end_time, true),
                "target": glqktj_jjb_object_type.curType || glqktj_jjb_object_type.object_type[0]
            };

            if (this.change_page) {
                ajax_data_g = search_condition;
                ajax_data_g.page = this.curPage - 1;
            } else
                search_condition = ajax_data_g;

            clickDept = storage.getItem('zfsypsjglpt-tjfx-glqktj-jjb-forclick');
            if (clickDept) {
                ajax_data_g.orgId = clickDept.orgId;
                ajax_data_g.orgPath = clickDept.orgPath;
            } else {
                ajax_data_g.orgId = glqktj_jjb_vm.glqktj_jjb_tree.orgId || glqktj_jjb_vm.glqktj_jjb_tree.tree_key;
                ajax_data_g.orgPath = glqktj_jjb_vm.glqktj_jjb_tree.orgPath || glqktj_jjb_vm.glqktj_jjb_tree.tree_code;
            }
            ajax({
                // url: '/api/matchInfo',
                url: glqktj_jjb_vm.ajax_url,
                method: 'post',
                data: ajax_data_g
            }).then(result => {
                if (result.code != 0) {
                    notification.warn({
                        message: result.msg,
                        title: '通知'
                    });
                    return;
                }
                // if (result.data.totalElements == 1) { //某条件下查询部门下的人员
                //     // glqktj_jjb_object_type.curType = -1;
                //     // this.get_table_list();
                //     // return;
                // }
                let temp_data = {
                    "page": ajax_data_g.page,
                    "pageSize": ajax_data_g.pageSize,
                    "orgId": ajax_data_g.orgId,
                    "orgPath": ajax_data_g.orgPath,
                    "policeType": ajax_data_g.policeType,
                    "beginTime": start_time,
                    "endTime": end_time,
                    "target": ajax_data_g.target
                };

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    clickDept = {};
                    storage.setItem('zfsypsjglpt-tjfx-glqktj-jjb-forclick', ''); //当部门返回条数为0，清空点击部门
                    if (glqktj_jjb_object_type.curType == 0) {
                        this.curPage = 0;
                        this.table_pagination.current = 0;
                        tableObject_glqktj_jjb.page(0, this.table_pagination.pageSize);
                        this.glqktj_jjb_table_data = [];
                        tableObject_glqktj_jjb.tableDataFnc([]);
                        tableObject_glqktj_jjb.loading(false);
                        this.table_pagination.total = 0;

                        local_storage.timeStamp = getTimestamp();
                        local_storage.ajax_data = temp_data;
                        // local_storage.tree_key = glqktj_jjb_vm.glqktj_jjb_tree.tree_key;
                        // local_storage.tree_title = glqktj_jjb_vm.glqktj_jjb_tree.tree_title;
                        local_storage.range_flag = glqktj_jjb_time_vm.range_flag;
                        local_storage.table_list = [];
                        local_storage.list_total = "0";
                        local_storage.current_len = "0";
                        local_storage.list_totalPages = "0";

                        storage.setItem('zfsypsjglpt-tjfx-glqktj-jjb', local_storage);
                    } else {
                        tableObject_glqktj_jjb.tableDataFnc(this.glqktj_jjb_table_data);
                        tableObject_glqktj_jjb.loading(false);
                        tableObject_glqktj_jjb.page(bugPage, this.table_pagination.pageSize);
                        this.table_pagination.current = bugPage;

                        local_storage.timeStamp = getTimestamp();
                        local_storage.ajax_data = temp_data;
                        // local_storage.tree_key = glqktj_jjb_vm.glqktj_jjb_tree.tree_key;
                        // local_storage.tree_title = glqktj_jjb_vm.glqktj_jjb_tree.tree_title;
                        local_storage.range_flag = glqktj_jjb_time_vm.range_flag;
                        local_storage.table_list = this.glqktj_jjb_table_data;
                        local_storage.list_total = this.table_pagination.total;
                        local_storage.current_len = this.table_pagination.current_len;
                        local_storage.list_totalPages = this.table_pagination.totalPages;

                        storage.setItem('zfsypsjglpt-tjfx-glqktj-jjb', local_storage);
                    }
                    return;
                }
                if (clickDept) {
                    glqktj_jjb_vm.glqktj_jjb_tree.tree_key = clickDept.orgId;
                    glqktj_jjb_vm.glqktj_jjb_tree.tree_title = clickDept.orgName;
                    glqktj_jjb_vm.glqktj_jjb_tree.orgId = clickDept.orgId;
                    glqktj_jjb_vm.glqktj_jjb_tree.orgPath = clickDept.orgPath;
                    let tempData = this.breadcrumbList.$model;
                    if(!clickDept.breadcrumbFlag) {
                        this.breadcrumbList = [];
                        tempData.push({
                            orgName: clickDept.orgName,
                            orgId: clickDept.orgId,
                            orgPath: clickDept.orgPath,
                        });
                        this.breadcrumbList = tempData;
                    } else {
                        this.breadcrumbList = this.breadcrumbList.splice(0, 1);
                    }
                }
                // 点击查询按钮时隐藏面包屑
                if(this.isSearch) {
                    $("#glqktj-breadcrumb").css({
                        'display': 'none'
                    });
                    $('.zfsypsjglpt_tjfx_glqktj_jjb .glqktj_jjb_tabCont').css({
                        'top': '134px'
                    });
                } else {
                    $("#glqktj-breadcrumb").css({
                        'display': 'block'
                    });
                    $('.zfsypsjglpt_tjfx_glqktj_jjb .glqktj_jjb_tabCont').css({
                        'top': '176px'
                    });
                }

                let ret_data = [];
                let temp = (this.curPage - 1) * this.table_pagination.pageSize + 1;
                avalon.each(result.data.currentElements, function (index, item) {
                    ret_data[index] = {};
                    ret_data[index].index = temp + index; //行序号
                    ret_data[index].orgName = item.orgName; //所属部门
                    ret_data[index].orgId = item.orgId; //所属部门id
                    ret_data[index].orgPath = item.orgPath; //部门路径
                    if (item.userCode)
                        ret_data[index].userName = item.userName + "(" + item.userCode + ")"; //警员（警号）
                    else
                        ret_data[index].userName = "-"; //警员（警号）

                    ret_data[index].zfzsl = item.zfzsl; //执法总数量
                    ret_data[index].yglzsl = item.yglzsl; //已关联总数量
                    ret_data[index].zgll = formatPercent(item.zgll); //总关联率

                    //简易程序
                    ret_data[index].jycxzs = item.jycxzs; // 执法数量
                    ret_data[index].jycxgls = item.jycxgls; //已关联数量
                    ret_data[index].jycxgll = formatPercent(item.jycxgll); //关联率
                    //非现场处罚
                    ret_data[index].fxccfzs = item.fxccfzs; // 执法数量
                    ret_data[index].fxccfgls = item.fxccfgls; //已关联数量
                    ret_data[index].fxccfgll = formatPercent(item.fxccfgll); //关联率
                    //强制措施
                    ret_data[index].qzcszs = item.qzcszs; // 执法数量
                    ret_data[index].qzcsgls = item.qzcsgls; //已关联数量
                    ret_data[index].qzcsgll = formatPercent(item.qzcsgll); //关联率

                    //事故处理
                    ret_data[index].sgclzs = item.sgclzs; //执法数量
                    ret_data[index].sgclgls = item.sgclgls; //已关联数量
                    ret_data[index].sgclgll = formatPercent(item.sgclgll); //关联率

                    ret_data[index].time_range = glqktj_jjb_time_vm.range_flag; //时间范围
                    ret_data[index].startTime = start_time; //开始时间
                    ret_data[index].endTime = end_time; //结束时间
                });

                this.glqktj_jjb_table_data = ret_data;
                tableObject_glqktj_jjb.tableDataFnc(ret_data);
                tableObject_glqktj_jjb.loading(false);

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
                local_storage.tree_key = glqktj_jjb_vm.glqktj_jjb_tree.tree_key;
                local_storage.tree_title = glqktj_jjb_vm.glqktj_jjb_tree.tree_title;
                local_storage.range_flag = glqktj_jjb_time_vm.range_flag;
                local_storage.table_list = ret_data;
                local_storage.page_type = this.page_type;
                local_storage.list_total = this.table_pagination.total;
                local_storage.current_len = this.table_pagination.current_len;
                local_storage.list_totalPages = this.table_pagination.totalPages;
                local_storage.breadcrumbList = this.breadcrumbList;
                storage.setItem('zfsypsjglpt-tjfx-glqktj-jjb', local_storage);
            });
        },
        importBtn() {
            // if (!glqktj_jjb_object_type.search_flag) {
            //     notification.warn({
            //         message: '请查询数据后再导出！',
            //         title: '通知'
            //     });
            //     return;
            // }
            let baseUrl;
            let data = 'orgId=' + ajax_data_g.orgId + '&orgPath=' + ajax_data_g.orgPath + '&policeType=' + ajax_data_g.policeType + '&beginTime=' + ajax_data_g.beginTime + '&endTime=' + ajax_data_g.endTime;
            // console.log(ajax_data_g);
            if (ajax_data_g.target == "-1") {
                baseUrl = "/gmvcs/stat/l/match/info/exportByUser?";
            } else {
                baseUrl = "/gmvcs/stat/l/match/info/exportByDept?";
                data += '&target=' + ajax_data_g.target;
            }

            let downURL = "http://" + window.location.host + apiUrl + baseUrl + data; //远程服务器使用
            // console.log(downURL);
            window.location.href = downURL; //远程服务器使用
        },
        searchBtn() {
            if (click_search == true) {
                this.change_page = false;
                glqktj_jjb_object_type.curType = 0;
                storage.setItem('zfsypsjglpt-tjfx-glqktj-jjb-forclick', '');
                this.search_list();
                click_search = false;
                search_timer = setTimeout(function () {
                    click_search = true;
                }, 0);
                this.isSearch = true;
                let breadcrumbObj = storage.getItem('tjfx-glqktj-breadcrumb-obj');
                this.breadcrumbList = [
                    {
                        orgName: '首页',
                        orgId: breadcrumbObj.orgId,
                        orgPath: breadcrumbObj.orgPath
                    }
                ];
            }
        },
        searchBtnFormTable(item, mainBreadcrumbflag) {
            if (click_search == true) {
                this.change_page = false;

                // var orgId = $(e.currentTarget).attr('orgId');
                // var orgPath = $(e.currentTarget).attr('orgPath');
                // var orgName = $(e.currentTarget).attr('orgName');
                glqktj_jjb_object_type.curType = mainBreadcrumbflag ? 0 : 1; // 首页查当前部门
                // glqktj_jjb_vm.glqktj_jjb_tree.tree_key = orgId;
                // glqktj_jjb_vm.glqktj_jjb_tree.tree_title = orgName;
                // glqktj_jjb_vm.glqktj_jjb_tree.orgId = orgId;
                // glqktj_jjb_vm.glqktj_jjb_tree.orgPath = orgPath;
                item.breadcrumbFlag = mainBreadcrumbflag;
                storage.setItem('zfsypsjglpt-tjfx-glqktj-jjb-forclick', item);
                $(".popover").hide();
                this.search_list();
                click_search = false;
                search_timer = setTimeout(function () {
                    click_search = true;
                }, 0);
                this.isSearch = false;
            }
        },
        search_list() {
            if (glqktj_jjb_time_vm.range_flag == 2) {
                if (getTimeByDateStr(glqktj_jjb_startTime_vm.glqktj_jjb_startTime) > getTimeByDateStr(glqktj_jjb_endTime_vm.glqktj_jjb_endTime)) {
                    notification.warn({
                        message: '开始时间不能晚于结束时间，请重新设置！',
                        title: '通知'
                    });
                    return;
                }
                let time_interval = getTimeByDateStr(glqktj_jjb_endTime_vm.glqktj_jjb_endTime) - getTimeByDateStr(glqktj_jjb_startTime_vm.glqktj_jjb_startTime);
                if (time_interval / 86400000 > 365) { //86400000 = 24 * 60 * 60 * 1000
                    notification.warn({
                        message: '时间间隔不能超过一年，请重新设置！',
                        title: '通知'
                    });
                    return;
                }
            }

            this.curPage = 1;
            this.table_pagination.current = 1;
            tableObject_glqktj_jjb.page(1, this.table_pagination.pageSize);
            // this.glqktj_jjb_table_data = [];
            tableObject_glqktj_jjb.tableDataFnc([]);
            tableObject_glqktj_jjb.loading(true);
            this.get_table_list();
        }
    }
});

//查询定时器
let search_timer;
let click_search = true;

let glqktj_jjb_table = avalon.define({
    $id: "tjfx_glqktj_jjb_table",
    loading: false
});

let neet_init;

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

//统计对象
let glqktj_jjb_object_type = avalon.define({
    $id: 'glqktj_jjb_object_type',
    curType: "0",
    object_type_options: [{
            value: "0",
            label: "当前部门"
        }, {
            value: "1",
            label: "下级部门"
        },
        {
            value: "-1",
            label: "人员"
        }
    ],
    object_type: ["0"],
    search_flag: false,
    onChangeO(e) {
        let _this = this;

        if (ajax_data_g.target != e.target.value) {
            _this.search_flag = true;
        } else {
            _this.search_flag = false;
        }
        _this.curType = e.target.value;
        if (e.target.value == "-1")
            glqktj_jjb_vm.ajax_url = "/gmvcs/stat/l/match/info/byUser";
        else
            glqktj_jjb_vm.ajax_url = "/gmvcs/stat/l/match/info";
    }
});

//人员类别
let glqktj_jjb_man_type = avalon.define({
    $id: 'glqktj_jjb_man_type',
    curType: "",
    man_type_options: [{
            value: "LEVAM_JYLB_ALL",
            label: "不限"
        }, {
            value: "LEVAM_JYLB_JY",
            label: "警员"
        },
        {
            value: "LEVAM_JYLB_FJ",
            label: "辅警"
        }
    ],
    man_type: ["LEVAM_JYLB_ALL"],
    onChangeT(e) {
        let _this = this;
        _this.curType = e.target.value;
    }
});

/* 主页面时间控制  start */
let glqktj_jjb_time_vm = avalon.define({
    $id: 'glqktj_jjb_time_range',
    select_time: false,
    time_range_options: [{
            value: "0",
            label: "本周"
        },
        {
            value: "1",
            label: "本月"
        },
        {
            value: "2",
            label: "自定义时间"
        }
    ],
    time_range: ["0"],
    range_flag: 0,
    onChangeTR(e) {
        let _this = this;
        if (e.target.value == 0)
            _this.range_flag = 0;

        if (e.target.value == 1)
            _this.range_flag = 1;

        if (e.target.value == 2) {
            _this.range_flag = 2;
            glqktj_jjb_endTime_vm.glqktj_jjb_endTime = moment().format('YYYY-MM-DD');
            glqktj_jjb_startTime_vm.glqktj_jjb_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');
            _this.select_time = true;
        } else
            _this.select_time = false;
    }
});

let glqktj_jjb_startTime_vm = avalon.define({
    $id: "glqktj_jjb_startTime",
    glqktj_jjb_startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    handleTimeChange(e) {
        let _this = this;
        _this.glqktj_jjb_startTime = e.target.value;
    }
});

let glqktj_jjb_endTime_vm = avalon.define({
    $id: "glqktj_jjb_endTime",
    glqktj_jjb_endTime: moment().format('YYYY-MM-DD'),
    handleTimeChange(e) {
        let _this = this;
        _this.glqktj_jjb_endTime = e.target.value;
    }
});
/* 主页面时间控制  end */

function set_size() {
    let v_height = $(window).height() - 96;
    let v_min_height = $(window).height() - 68;
    if (v_height > 740) {
        $(".zfsypsjglpt_tjfx_glqktj_jjb").height(v_height);
        $("#sidebar .zfsypsjglpt-menu").css("min-height", v_min_height + "px");
    } else {
        $(".zfsypsjglpt_tjfx_glqktj_jjb").height(740);
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

//转百分率
function formatPercent(val) {
    return '-' === val ? val : Number(val * 100).toFixed(2) + '%';
}
/*================== 时间控制函数 end =============================*/
let tableBody_glqktj_jjb = avalon.define({ //表格定义组件
    $id: 'glqktj_jjb_table',
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
    dragStorageName: 'glqktj-jjb-tableDrag-style',
    debouleHead: ["table-index-thead", "glqktj_jjb_table_parent"], //多级表头，需要将所有表头的class名当做数组传入；单级表格可以忽略这个参数
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
        glqktj_jjb_table.handleSelectAll(e.target.checked, this.selection.$model);
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
        glqktj_jjb_table.handleSelect(record.$model, checked, this.selection.$model);
    },
    handle: function (type, col, record, $index) { //操作函数
        var extra = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            extra[_i - 4] = arguments[_i];
        }
        var text = record[col].$model || record[col];
        glqktj_jjb_table.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});
