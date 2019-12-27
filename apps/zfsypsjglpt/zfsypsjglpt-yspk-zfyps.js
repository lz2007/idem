import avalon from "avalon2";
import "ane";
import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
import * as menuServer from '../../services/menuService';
var storage = require('../../services/storageService.js').ret;

export const name = "zfsypsjglpt-yspk-zfyps";
require("/apps/zfsypsjglpt/zfsypsjglpt-yspk-zfyps.css");

let zfyps_vm,
    tableObject_zfyps = {},
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
    template: __inline("./zfsypsjglpt-yspk-zfyps.html"),
    defaults: {
        cancelText: "取消",
        modify_toggle: true,
        zfyps_dialog_show: false,
        search_key: "",
        search_key_title: "支持案件编号、涉案人员、案件类别、标注类型、采集地点、受理单位查询",
        search_policeId_title: "支持姓名、警号查询",
        police_check: "",
        operation_type: "", //1 删除记录；2 批量删除纪录；3 单选删除时该记录为关联；4 多选时所有数据均为关联
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
        delete_all_if: false,
        media_info: {},

        web_width: "",
        web_height: "",
        key_format: "none",
        name_format: "none",
        change_page: false, //判断是查询还是翻页触发的刷新数据 查询-false 翻页-true
        // search_condition: {},
        zfyps_close_key: false,
        zfyps_close_policeId: false,
        zfyps_dialog_width: 300,
        zfyps_dialog_height: 178,
        delete_post_data: [],

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
            tableObject_zfyps.page(page, this.table_pagination.pageSize);
            this.zfyps_table_data = [];
            tableObject_zfyps.tableDataFnc([]);
            tableObject_zfyps.loading(true);
            this.get_table_list();
        },

        opt: avalon.define({
            $id: "opt",
            authority: { // 按钮权限标识
                "CHECK": false, //音视频库_执法仪拍摄_查看
                "DELETE": false, //音视频库_执法仪拍摄_删除
                "SEARCH": false, //音视频库_执法仪拍摄_查询
                "OPT_SHOW": false, //操作栏显示方式
            }
        }),

        yspk_tree: avalon.define({
            $id: "yspk_tree",
            yspk_data: [],
            // yspk_value: [],
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
            zfyps_vm = e.vmodel;

            tableObject_zfyps = $.tableIndex({ //初始化表格jq插件
                id: 'zfyps_table',
                tableBody: tableBody_zfyps
            });

            // orgKey = "";
            // orgPath = "";
            file_logo_vm.curFile = "";
            time_type_vm.curType = "";
            media_type_vm.curMedia = "";
            zfyps_vm.yspk_tree.curTree = "";

            this.zfyps_table_data = [];
            tableObject_zfyps.tableDataFnc([]);
            tableObject_zfyps.loading(true);

            this.delete_all_if = false;

            time_range_vm.select_time = false;
            time_range_vm.range_flag = 0;
            time_range_vm.time_range = ["0"];

            this.modify_toggle = true;

            let init_data = storage.getItem("zfsypsjglpt-yspk-zfyps");
            neet_init = true; //判断是否需要初始化页面；true为重新从后台拿数据初始化，false为从Local Storage拿数据填充。

            // set_size();

            if (init_data) {
                if ((getTimestamp() - init_data.timeStamp) > 1800) //1800 = 30 * 60
                    neet_init = true;
                else {
                    neet_init = false;

                    zfyps_vm.yspk_tree.tree_key = init_data.tree_key;
                    zfyps_vm.yspk_tree.tree_title = init_data.tree_title;
                    // orgPath = init_data.ajax_data.orgPath;
                    if (init_data.ajax_data.jymc)
                        this.police_check = init_data.ajax_data.jymc;
                    if (init_data.ajax_data.key)
                        this.search_key = init_data.ajax_data.key;

                    time_range_vm.range_flag = init_data.range_flag;
                    time_range_vm.time_range = new Array(init_data.range_flag.toString());
                    if (time_range_vm.range_flag == 2) {
                        zfyps_startTime_vm.zfyps_startTime = init_data.ajax_data.startTime;
                        zfyps_endTime_vm.zfyps_endTime = init_data.ajax_data.endTime;
                        time_range_vm.select_time = true;
                    }
                    time_type_vm.time_type = new Array(init_data.ajax_data.timeType);
                    file_logo_vm.file_type = new Array(init_data.ajax_data.keyMark);
                    media_type_vm.media_type = new Array(init_data.ajax_data.type);

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
                        "timeType": init_data.ajax_data.timeType,
                        "type": init_data.ajax_data.type,
                        "keyMark": init_data.ajax_data.keyMark,
                        "startTime": getTimeByDateStr(init_data.ajax_data.startTime),
                        "endTime": getTimeByDateStr(init_data.ajax_data.endTime),
                        "key": init_data.ajax_data.key,
                        "jymc": init_data.ajax_data.jymc
                    }

                    this.zfyps_table_data = init_data.table_list;
                    // tableObject_zfyps.tableDataFnc(init_data.table_list);
                    // _popover();
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
                zfyps_vm.yspk_tree.yspk_data = deptemp;
                // zfyps_vm.yspk_tree.yspk_value = new Array(deptemp[0].key);
                // zfyps_vm.yspk_tree.yspk_expandedKeys = new Array(deptemp[0].key);
                zfyps_vm.yspk_tree.tree_code = deptemp[0].path;
                zfyps_vm.yspk_tree.tree_key = deptemp[0].key;
                zfyps_vm.yspk_tree.tree_title = deptemp[0].title;

                if (neet_init) {
                    // zfyps_vm.yspk_tree.yspk_value = new Array(deptemp[0].key);
                    this.search_list();
                } else {
                    zfyps_vm.yspk_tree.tree_code = init_data.ajax_data.orgPath;
                    zfyps_vm.yspk_tree.tree_key = init_data.tree_key;
                    zfyps_vm.yspk_tree.tree_title = init_data.tree_title;

                    // if (orgKey != "") {
                    //     // zfyps_vm.yspk_tree.yspk_value = new Array(orgKey);
                    //     zfyps_vm.yspk_tree.tree_code = orgPath;
                    // } else {
                    //     // zfyps_vm.yspk_tree.yspk_value = new Array(deptemp[0].key);
                    //     notification.info({
                    //         message: '部门数据更新，已重新加载数据！',
                    //         title: '通知',
                    //         timeout: '5000'
                    //     });
                    //     this.police_check = "";
                    //     this.search_key = "";

                    //     time_range_vm.range_flag = "0";
                    //     time_range_vm.time_range = ["0"];
                    //     time_range_vm.select_time = false;
                    //     time_type_vm.time_type = ["1"];
                    //     file_logo_vm.file_type = ["0"];
                    //     media_type_vm.media_type = ["0"];

                    //     this.search_list();
                    // }
                }
            });

            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_SYPGL_ZFYSYP/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询无权限时页面留白
                    $(".zfyps_tabCont").css("top", "34px");
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_CHECK":
                            _this.opt.authority.CHECK = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_DELETE":
                            _this.opt.authority.DELETE = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_SEARCH":
                            _this.opt.authority.SEARCH = true;
                            break;
                    }
                });

                if (false == _this.opt.authority.CHECK && false == _this.opt.authority.DELETE)
                    _this.opt.authority.OPT_SHOW = true;

                // 防止查询无权限时页面留白
                if (false == _this.opt.authority.SEARCH)
                    $(".zfyps_tabCont").css("top", "34px");

                // _this.delete_all_if = true;
            });
        },
        onReady() {
            let _this = this;
            this.delete_all_if = true;

            set_size();
            if (storage.getItem("zfsypsjglpt-yspk-zfyps") && neet_init == false) {
                if (storage.getItem("zfsypsjglpt-yspk-zfypsFlag") == "true") {
                    _this.get_table_list();
                    storage.setItem('zfsypsjglpt-yspk-zfypsFlag', "false");
                } else {
                    tableObject_zfyps.tableDataFnc(this.zfyps_table_data);
                    tableObject_zfyps.loading(false);
                    _popover();
                }
            }

            setTimeout(function () {
                $(".zfyps_input_panel .policeId").width($(".zfyps_input_panel").width() - 24);
                $(".zfyps_input_panel .key_name").width($(".zfyps_input_panel").width() - 24);
            }, 500);

            $(window).resize(function () {
                set_size();
                tableObject_zfyps.setForm();
                if (_this.zfyps_close_policeId)
                    $(".zfyps_input_panel .policeId").width($(".zfyps_input_panel").width() - 34);
                else
                    $(".zfyps_input_panel .policeId").width($(".zfyps_input_panel").width() - 24);

                if (_this.zfyps_close_key)
                    $(".zfyps_input_panel .key_name").width($(".zfyps_input_panel").width() - 34);
                else
                    $(".zfyps_input_panel .key_name").width($(".zfyps_input_panel").width() - 24);
            });
        },
        onDispose() {
            window.clearTimeout(search_timer);
            // window.clearTimeout(save_timer);
            // window.clearTimeout(change_timer);
            click_search = true;
            // click_save = true;
            // click_change = true;
            this.zfyps_table_data = [];
            tableObject_zfyps.destroy();

            // tableObject_zfyps.tableDataFnc([]);
        },
        select_table(record, selected, selectedRows) {
            this.selected_arr = selectedRows;
        },
        selectAll_table(selected, selectedRows) {
            this.selected_arr = selectedRows;
        },
        delete_all() {
            let _this = this;
            if (!this.selected_arr.length) {
                return;
            }
            _this.delete_post_data = [];
            let i = 0;
            avalon.each(this.selected_arr, function (index, item) {
                if (!item.is_rel)
                    _this.delete_post_data[i++] = item.rid;
            });

            zfyps_common_dialog.title = "确定删除";
            this.operation_type = 2;
            zfyps_common_dialog.txt_rows = false;

            if (_this.delete_post_data.length == "0") {
                this.operation_type = 4;
                zfyps_common_dialog.title = "提示";
                zfyps_common_dialog.dialog_txt = "选中的" + _this.selected_arr.length + "条关联数据需解除关联后才可删除！";
                _this.zfyps_dialog_width = 400;
                _this.zfyps_dialog_height = 178;

                this.cancelText = "关闭";
                this.zfyps_dialog_show = true;
                if (!$(".zfyps_dialog_common").hasClass("dialog_big_close"))
                    $(".zfyps_dialog_common").addClass("dialog_big_close");
            } else if (_this.delete_post_data.length == _this.selected_arr.length) {
                zfyps_common_dialog.title = "确定删除";
                zfyps_common_dialog.dialog_txt = "是否确定删除选中的" + _this.selected_arr.length + "条数据?";
                _this.zfyps_dialog_width = 300;
                _this.zfyps_dialog_height = 178;

                this.cancelText = "取消";
                this.zfyps_dialog_show = true;

            } else {
                let rel_len = _this.selected_arr.length - _this.delete_post_data.length;
                zfyps_common_dialog.txt_rows = true;
                zfyps_common_dialog.title = "确定删除";
                zfyps_common_dialog.dialog_txt = "选中的数据中，有" + rel_len + "条数据已关联，需解除关联才可删除；没有关联的" + _this.delete_post_data.length + "条数据将会被删除。是否继续您的操作？";
                _this.zfyps_dialog_width = 521;
                _this.zfyps_dialog_height = 220;

                this.cancelText = "取消";
                this.zfyps_dialog_show = true;
                if (!$(".zfyps_dialog_common").hasClass("dialog_biger_footer"))
                    $(".zfyps_dialog_common").addClass("dialog_biger_footer");
            }
        },
        get_table_list() {
            let start_time, end_time;
            if (time_range_vm.range_flag == "0") {
                if (moment().format('d') == "0") {
                    start_time = moment().day(-6).format('YYYY-MM-DD');
                    end_time = moment().day(0).format('YYYY-MM-DD');
                } else {
                    start_time = moment().day(1).format('YYYY-MM-DD');
                    end_time = moment().day(7).format('YYYY-MM-DD');
                }
            }

            if (time_range_vm.range_flag == "1") {
                start_time = moment().startOf('month').format('YYYY-MM-DD');
                end_time = moment().endOf('month').format('YYYY-MM-DD');
            }

            if (time_range_vm.range_flag == "2") {
                start_time = zfyps_startTime_vm.zfyps_startTime;
                end_time = zfyps_endTime_vm.zfyps_endTime;
            }

            let ajax_data = {
                "page": this.curPage - 1,
                "pageSize": this.table_pagination.pageSize,
                "orgPath": zfyps_vm.yspk_tree.curTree || zfyps_vm.yspk_tree.tree_code,
                "timeType": time_type_vm.curType || time_type_vm.time_type[0],
                "type": media_type_vm.curMedia || media_type_vm.media_type[0],
                "keyMark": file_logo_vm.curFile || file_logo_vm.file_type[0],
                "startTime": getTimeByDateStr(start_time),
                "endTime": getTimeByDateStr(end_time, true)
            };

            if (this.search_key)
                ajax_data.key = this.search_key;
            if (this.police_check)
                ajax_data.jymc = this.police_check;

            if (this.change_page) {
                ajax_data = search_condition;
                ajax_data.page = this.curPage - 1;
            } else
                search_condition = ajax_data;

            ajax({
                // url: '/api/table_list',
                url: '/gmvcs/audio/basefile/search',
                method: 'post',
                data: ajax_data
            }).then(result => {
                if (result.code != 0) {
                    notification.warn({
                        message: result.msg,
                        title: '通知'
                    });
                    return;
                }
                this.selected_arr = [];
                let temp_data = {
                    "page": ajax_data.page,
                    "pageSize": ajax_data.pageSize,
                    "orgPath": ajax_data.orgPath,
                    "timeType": ajax_data.timeType,
                    "type": ajax_data.type,
                    "keyMark": ajax_data.keyMark,
                    "startTime": start_time,
                    "endTime": end_time
                };

                if (!this.search_key)
                    temp_data.key = "";
                else
                    temp_data.key = ajax_data.key;
                if (!this.police_check)
                    temp_data.jymc = "";
                else
                    temp_data.jymc = ajax_data.jymc;

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    this.curPage = 0;
                    this.table_pagination.current = 0;
                    tableObject_zfyps.page(0, this.table_pagination.pageSize);
                    this.zfyps_table_data = [];
                    tableObject_zfyps.tableDataFnc([]);
                    tableObject_zfyps.loading(false);
                    this.table_pagination.total = 0;

                    local_storage.timeStamp = getTimestamp();
                    local_storage.ajax_data = temp_data;
                    local_storage.tree_key = zfyps_vm.yspk_tree.tree_key;
                    local_storage.tree_title = zfyps_vm.yspk_tree.tree_title;
                    local_storage.range_flag = time_range_vm.range_flag;
                    local_storage.table_list = [];
                    local_storage.list_total = "0";
                    local_storage.current_len = "0";
                    local_storage.list_totalPages = "0";

                    storage.setItem('zfsypsjglpt-yspk-zfyps', local_storage);
                    return;
                }

                let ret_data = [];
                let temp = (this.curPage - 1) * this.table_pagination.pageSize + 1;
                avalon.each(result.data.currentElements, function (index, item) {
                    ret_data[index] = {};
                    ret_data[index].index = temp + index; //行序号
                    ret_data[index].orgName = item.orgName; //所属部门
                    ret_data[index].space = ""; //空title需要
                    ret_data[index].importTime = formatDate(item.importTime); //导入时间
                    ret_data[index].startTime = formatDate(item.startTime); //拍摄时间
                    ret_data[index].duration = formatSeconds(item.duration); //拍摄时长
                    ret_data[index].name_id = item.userName + "(" + item.userCode + ")"; //姓名（警号）
                    ret_data[index].rid = item.rid; //文件唯一标识
                    // ret_data[index].fileName = item.fileName || "暂时无法获取文件名称！";

                    ret_data[index].file_flag = "";
                    ret_data[index].common_file = false;
                    ret_data[index].is_rel = false; //关联
                    ret_data[index].is_tag = false; //标注
                    ret_data[index].is_imp = false; //重要

                    if (item.type == "0") {
                        ret_data[index].type = "视频";
                        ret_data[index].file_flag = "0";
                    } else if (item.type == "1") {
                        ret_data[index].type = "音频";
                        ret_data[index].file_flag = "1";
                    } else if (item.type == "2") {
                        ret_data[index].type = "图片";
                        ret_data[index].file_flag = "2";
                    } else if (item.type == "3") {
                        ret_data[index].type = "文本";
                    } else
                        ret_data[index].type = "其他";

                    if (!item.match && !item.label && !item.keyFile) {
                        ret_data[index].common_file = true;
                        ret_data[index].common_file_img = "/static/image/zfsypsjglpt/ywgl.png";
                    }
                    if (item.match) {
                        ret_data[index].rel_img = "/static/image/zfsypsjglpt/ywgl.png";
                        ret_data[index].rel_title = "业务关联";
                        ret_data[index].is_rel = true;
                    }
                    if (item.label) {
                        ret_data[index].tag_img = "/static/image/zfsypsjglpt/bzxx.png";
                        ret_data[index].tag_title = "标注信息";
                        ret_data[index].is_tag = true;
                    }
                    if (item.keyFile) {
                        ret_data[index].imp_img = "/static/image/zfsypsjglpt/zfybj.png";
                        ret_data[index].imp_title = "执法仪标记";
                        ret_data[index].is_imp = true;
                    }

                });

                this.zfyps_table_data = ret_data;
                tableObject_zfyps.tableDataFnc(ret_data);
                tableObject_zfyps.loading(false);

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

                _popover();

                local_storage.timeStamp = getTimestamp();
                local_storage.ajax_data = temp_data;
                local_storage.tree_key = zfyps_vm.yspk_tree.tree_key;
                local_storage.tree_title = zfyps_vm.yspk_tree.tree_title;
                local_storage.range_flag = time_range_vm.range_flag;
                local_storage.table_list = ret_data;
                local_storage.page_type = this.page_type;
                local_storage.list_total = this.table_pagination.total;
                local_storage.current_len = this.table_pagination.current_len;
                local_storage.list_totalPages = this.table_pagination.totalPages;
                storage.setItem('zfsypsjglpt-yspk-zfyps', local_storage);
            });
        },
        searchBtn() {
            if (this.key_format == "inline-block" || this.name_format == "inline-block")
                return;
            if (click_search == true) {
                this.change_page = false;
                this.search_list();
                click_search = false;
                search_timer = setTimeout(function () {
                    click_search = true;
                }, 2000);
            }
        },
        search_list() {
            if (time_range_vm.range_flag == 2) {
                if (zfyps_startTime_vm.start_null == "inline-block" || zfyps_endTime_vm.end_null == "inline-block") {
                    return;
                }
                if (getTimeByDateStr(zfyps_startTime_vm.zfyps_startTime) > getTimeByDateStr(zfyps_endTime_vm.zfyps_endTime)) {
                    notification.warn({
                        message: '开始时间不能晚于结束时间，请重新设置！',
                        title: '通知'
                    });
                    return;
                }
                let time_interval = getTimeByDateStr(zfyps_endTime_vm.zfyps_endTime) - getTimeByDateStr(zfyps_startTime_vm.zfyps_startTime);
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
            tableObject_zfyps.page(1, this.table_pagination.pageSize);
            this.zfyps_table_data = [];
            tableObject_zfyps.tableDataFnc([]);
            tableObject_zfyps.loading(true);
            this.search_key = $.trim(this.search_key);
            this.police_check = $.trim(this.police_check);
            this.get_table_list();
        },
        dialogCancel() {
            this.zfyps_dialog_show = false;
        },
        dialogOk() {
            if (this.operation_type == 1) {
                ajax({
                    url: '/gmvcs/audio/basefile/delete/' + this.record_item.rid,
                    method: 'get',
                    data: {}
                }).then(result => {
                    if (result.code != 0) {
                        notification.error({
                            message: result.msg,
                            title: '通知'
                        });
                    }
                    if (result.code == 0) {
                        notification.success({
                            message: '删除文件成功！',
                            title: '通知'
                        });
                        if (this.curPage == 1) {
                            this.search_list();
                            return;
                        }
                        if (!this.page_type && this.table_pagination.totalPages == this.curPage && "1" == this.table_pagination.current_len) { //删除的是最后一页&&删除的是所有数据
                            this.curPage -= 1;
                            tableObject_zfyps.page(this.curPage, this.table_pagination.pageSize);
                        }
                        this.table_pagination.current = this.curPage;
                        this.zfyps_table_data = [];
                        tableObject_zfyps.tableDataFnc([]);
                        tableObject_zfyps.loading(true);
                        this.get_table_list();
                    }
                });
            } else if (this.operation_type == 2) {
                let _this = this;

                ajax({
                    url: '/gmvcs/audio/basefile/batch/delete',
                    method: 'post',
                    data: _this.delete_post_data
                }).then(result => {
                    if (result.code != 0) {
                        notification.error({
                            message: result.msg,
                            title: '通知'
                        });
                    }
                    if (result.code == 0) {
                        notification.success({
                            message: '批量删除文件成功！',
                            title: '通知'
                        });
                        if (this.curPage == 1) {
                            this.search_list();
                            return;
                        }
                        if (!this.page_type && this.table_pagination.totalPages == this.curPage && this.delete_post_data.length == this.table_pagination.current_len) { //删除的是最后一页&&删除的是所有数据
                            this.curPage -= 1;
                            tableObject_zfyps.page(this.curPage, this.table_pagination.pageSize);
                        }
                        this.table_pagination.current = this.curPage;
                        this.zfyps_table_data = [];
                        tableObject_zfyps.tableDataFnc([]);
                        tableObject_zfyps.loading(true);
                        this.get_table_list();
                    }
                });
            }


            this.zfyps_dialog_show = false;
        },
        name_input_enter(e) {
            if (e.target.value != "") {
                this.search_policeId_title = e.target.value;
            } else
                this.search_policeId_title = "支持姓名、警号查询";

            if (e.keyCode == "13")
                this.searchBtn();
        },
        key_input_enter(e) {
            if (e.target.value != "") {
                this.search_key_title = e.target.value;
            } else
                this.search_key_title = "支持案件编号、涉案人员、案件类别、标注类型、采集地点、受理单位查询";

            if (e.keyCode == "13")
                this.searchBtn();
        },
        key_enter(e) {
            if (e.keyCode == "13")
                this.searchBtn();
            else {
                let txt = e.target.value;
                let key_exp = new RegExp("^[a-zA-z0-9\u4E00-\u9FA5-]*$"); //正则判断名称
                if (!key_exp.test(txt)) {
                    this.key_format = "inline-block";
                } else
                    this.key_format = "none";
            }
        },
        name_enter(e) {
            if (e.keyCode == "13")
                this.searchBtn();
            else {
                let txt = e.target.value;
                let name_exp = new RegExp("^[a-zA-z0-9\u4E00-\u9FA5]*$"); //正则判断名称
                if (!name_exp.test(txt)) {
                    this.name_format = "inline-block";
                } else
                    this.name_format = "none";
            }
        },
        close_click(e) {
            let _this = this;
            switch (e) {
                case 'policeId':
                    _this.police_check = "";
                    _this.search_policeId_title = "支持姓名、警号查询";
                    return false;
                    break;
                case 'key':
                    _this.search_key = "";
                    _this.search_key_title = "支持案件编号、涉案人员、案件类别、标注类型、采集地点、受理单位查询";
                    return false;
                    break;
            }
        },
        input_focus(e) {
            let _this = this;
            switch (e) {
                case 'policeId':
                    _this.zfyps_close_policeId = true;
                    $(".zfsypsjglpt_yspk_zfyps .dataFormBox .policeId").width($(".zfyps_input_panel").innerWidth() - 34);
                    break;
                case 'key':
                    _this.zfyps_close_key = true;
                    $(".zfsypsjglpt_yspk_zfyps .dataFormBox .key_name").width($(".zfyps_input_panel").innerWidth() - 34);
                    break;
            }
        },
        input_blur(e) {
            let _this = this;
            switch (e) {
                case 'policeId':
                    _this.zfyps_close_policeId = false;
                    $(".zfsypsjglpt_yspk_zfyps .dataFormBox .policeId").width($(".zfyps_input_panel").innerWidth() - 24);
                    break;
                case 'key':
                    _this.zfyps_close_key = false;
                    $(".zfsypsjglpt_yspk_zfyps .dataFormBox .key_name").width($(".zfyps_input_panel").innerWidth() - 24);
                    break;
            }
        },
    }
});

//查询定时器
let search_timer;
let click_search = true;
//保存标注定时器
// let save_timer;
// let click_save = true;
//更改存储时间定时器
// let change_timer;
// let click_change = true;

let zfyps_table = avalon.define({
    $id: "zfsypsjglpt_yspk_zfyps_table",
    loading: false,
    actions(type, text, record, index) {
        zfyps_vm.record_item = record;
        if (type == "check_click") {
            storage.setItem('zfsypsjglpt-yspk-zfyps-detail', record);
            avalon.history.setHash("/zfsypsjglpt-yspk-zfyps-detail");
        }
        if (type == "del_click") {
            zfyps_vm.zfyps_dialog_width = 300;
            zfyps_vm.zfyps_dialog_height = 178;
            zfyps_common_dialog.txt_rows = false;

            if (record.is_rel) {
                zfyps_vm.operation_type = 3;
                zfyps_common_dialog.title = "提示";
                zfyps_common_dialog.dialog_txt = "关联数据需解除关联后才可删除！";
                zfyps_vm.cancelText = "关闭";

                zfyps_vm.zfyps_dialog_show = true;

                if (!$(".zfyps_dialog_common").hasClass("dialog_close"))
                    $(".zfyps_dialog_common").addClass("dialog_close");
            } else {
                zfyps_vm.operation_type = 1;
                zfyps_common_dialog.title = "确定删除";
                zfyps_common_dialog.dialog_txt = "是否确定删除选中的1条数据?";
                zfyps_vm.cancelText = "取消";

                zfyps_vm.zfyps_dialog_show = true;
            }
        }
    },
    handleSelect(record, selected, selectedRows) {
        zfyps_vm.select_table(record, selected, selectedRows);
    },
    handleSelectAll(selected, selectedRows) {
        zfyps_vm.selectAll_table(selected, selectedRows);
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
        dataTree[i].path = item.path; //---部门路径，search的时候需要发

        dataTree[i].isParent = true;
        dataTree[i].icon = "/static/image/zfsypsjglpt/users.png";
        dataTree[i].children = new Array();

        // if (item.path == orgPath)
        //     orgKey = item.orgCode;

        getDepTree(item.childs, dataTree[i].children);
    }
}

let time_type_vm = avalon.define({
    $id: 'zfyps_time_type',
    curType: "",
    time_type_options: [{
            value: "1",
            label: "拍摄时间"
        },
        {
            value: "2",
            label: "导入时间"
        }
    ],
    time_type: ["1"],
    onChangeT(e) {
        let _this = this;
        _this.curType = e.target.value;
    }
});

/* 主页面时间控制  start */
let time_range_vm = avalon.define({
    $id: 'zfyps_time_range',
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
            zfyps_endTime_vm.end_null = "none";
            zfyps_endTime_vm.zfyps_endTime = moment().format('YYYY-MM-DD');
            zfyps_startTime_vm.start_null = "none";
            zfyps_startTime_vm.zfyps_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');
            _this.select_time = true;
        } else
            _this.select_time = false;
    }
});

let zfyps_startTime_vm = avalon.define({
    $id: "zfyps_startTime",
    start_null: "none",
    zfyps_startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.zfyps_startTime = e.target.value;
        if (_this.zfyps_startTime == "") {
            _this.start_null = "inline-block";
            $(".zfyps_start_time_tip").prev().children("input").addClass("input_error");
        } else {
            _this.start_null = "none";
            $(".zfyps_start_time_tip").prev().children("input").removeClass("input_error");
        }
    }
});

let zfyps_endTime_vm = avalon.define({
    $id: "zfyps_endTime",
    end_null: "none",
    zfyps_endTime: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.zfyps_endTime = e.target.value;
        if (_this.zfyps_endTime == "") {
            _this.end_null = "inline-block";
            $(".zfyps_end_time_tip").prev().children("input").addClass("input_error");
        } else {
            _this.end_null = "none";
            $(".zfyps_end_time_tip").prev().children("input").removeClass("input_error");
        }
    }
});
/* 主页面时间控制  end */

let media_type_vm = avalon.define({
    $id: 'media_type',
    curMedia: "",
    media_options: [{
            value: "-1",
            label: "不限"
        },
        {
            value: "0",
            label: "视频"
        }, {
            value: "1",
            label: "音频"
        }, {
            value: "2",
            label: "图片"
        }, {
            value: "4",
            label: "其他"
        }
    ],
    media_type: ["-1"],
    onChangeM(e) {
        let _this = this;
        _this.curMedia = e.target.value;
    }
});

let file_logo_vm = avalon.define({
    $id: 'file_logo',
    curFile: "",
    file_options: [{
        value: "0",
        label: "不限"
    }, {
        value: "1",
        label: "普通文件"
    }, {
        value: "2",
        label: "业务关联"
    }, {
        value: "3",
        label: "标注信息"
    }, {
        value: "4",
        label: "执法仪标记"
    }],
    file_type: ["0"],
    onChangeF(e) {
        let _this = this;
        _this.curFile = e.target.value;
    }
});

let zfyps_common_dialog = avalon.define({
    $id: "zfyps_common_dialog",
    title: "",
    dialog_txt: "",
    txt_rows: true //true 两行 false 一行
});

function set_size() {
    let v_height = $(window).height() - 96;
    let v_min_height = $(window).height() - 68;
    if (v_height > 740) {
        $(".zfsypsjglpt_yspk_zfyps").height(v_height);
        $("#sidebar .zfsypsjglpt-menu").css("min-height", v_min_height + "px");
    } else {
        $(".zfsypsjglpt_yspk_zfyps").height(740);
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

/*================== 弹出tooltips start =============================*/
function _popover() { //title的bootstrap tooltip
    let timer;
    $("[data-toggle=tooltip]").popoverX({
        trigger: 'manual',
        container: 'body',
        placement: 'top',
        //delay:{ show: 5000},
        //viewport:{selector: 'body',padding:0},
        //title : '<div style="font-size:14px;">title</div>',  
        html: 'true',
        content: function () {
            let html = "";
            if ($(this)[0].outerHTML.indexOf("data-title-img-four") > 0)
                html = $(this)[0].outerHTML.substring($(this)[0].outerHTML.indexOf("data-title-img-four") + 21, $(this)[0].outerHTML.indexOf("data-title-img-four") + 25);
            else if ($(this)[0].outerHTML.indexOf("data-title-img-five") > 0)
                html = $(this)[0].outerHTML.substring($(this)[0].outerHTML.indexOf("data-title-img-five") + 21, $(this)[0].outerHTML.indexOf("data-title-img-five") + 26);
            else
                html = $(this)[0].innerText;
            return '<div class="title-content">' + html + '</div>';
        },
        animation: false
    }).on("mouseenter", function () {
        let _this = this;
        if ($(this)[0].innerText == "-")
            return;
        timer = setTimeout(function () {
            $('div').siblings(".popover").popoverX("hide");
            $(_this).popoverX("show");

            $(".popover").on("mouseleave", function () {
                $(_this).popoverX('hide');
            });
        }, 500);
    }).on("mouseleave", function () {
        let _this = this;
        clearTimeout(timer);
        setTimeout(function () {
            if (!$(".popover:hover").length) {
                $(_this).popoverX("hide");
            }
        }, 100);
    });
}
/*================== 弹出tooltips end =============================*/

// let tableObject_zfyps = $.tableIndex({ //初始化表格jq插件
//     id: 'zfyps_table',
//     controller: 'zfyps_table',
//     tableObj: zfyps_table,
//     currentPage: 1,
//     prePageSize: 20,
//     key: "rid"
// });
let tableBody_zfyps = avalon.define({ //表格定义组件
    $id: 'zfyps_table',
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
    dragStorageName: 'zfyps-tableDrag-style',
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
        zfyps_table.handleSelectAll(e.target.checked, this.selection.$model);
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
        zfyps_table.handleSelect(record.$model, checked, this.selection.$model);
    },
    handle: function (type, col, record, $index) { //操作函数
        var extra = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            extra[_i - 4] = arguments[_i];
        }
        var text = record[col].$model || record[col];
        zfyps_table.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});