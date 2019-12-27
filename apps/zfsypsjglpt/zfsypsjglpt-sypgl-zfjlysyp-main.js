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

export const name = "zfsypsjglpt-sypgl-zfjlysyp-main";
require("/apps/zfsypsjglpt/zfsypsjglpt-sypgl-zfjlysyp-main.css");

let zfyps_vm,
    tableObject_zfypsjj_main = {},
    search_condition = {},
    local_storage = {
        "timeStamp": "",
        "ajax_data": {},
        "list_total": "",
        "current_len": "",
        "list_totalPages": "",
        "range_flag": ""
    };
avalon.component(name, {
    template: __inline("./zfsypsjglpt-sypgl-zfjlysyp-main.html"),
    defaults: {
        sypgl_txt: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl,
        extra_class: languageSelect == "en" ? true : false,
        timeLableClass: languageSelect == "en" ? 'time_range_label' : 'time_range_label time_range_label_en',
        okText: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.confirm,
        cancelText: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.cancel,
        modify_toggle: true,
        zfyps_dialog_show: false,
        // search_key: "",
        // search_key_title: "支持案件编号、涉案人员、案件类别、标注类型、采集地点、受理单位查询",
        included_status: false, //true 包含子部门；false 不包含子部门
        table_status: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.chartMode,
        table_status_flag: true, //true 对应列表模式，按钮显示图表模式；false 对应图表模式，按钮显示列表模式
        search_policeId_title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.policeId_tips,
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

        weekActive: true,
        monthActive: false,
        weekBtnclick: false,
        monthBtnclick: false,
        weekClick() {
            this.weekBtnclick = true;
            this.monthBtnclick = false;
            this.weekActive = true;
            this.monthActive = false;

            if (moment().format('d') == "0") {
                zfypsjj_startTime_vm.zfypsjj_startTime = moment().day(-6).format('YYYY-MM-DD');
                // zfypsjj_endTime_vm.zfysypjj_endTime = moment().day(0).format('YYYY-MM-DD');
            } else {
                zfypsjj_startTime_vm.zfypsjj_startTime = moment().day(1).format('YYYY-MM-DD');
                // zfypsjj_endTime_vm.zfysypjj_endTime = moment().day(7).format('YYYY-MM-DD');
            }
            zfypsjj_endTime_vm.zfysypjj_endTime = moment().format('YYYY-MM-DD');
        },
        monthClick() {
            this.weekBtnclick = false;
            this.monthBtnclick = true;
            this.weekActive = false;
            this.monthActive = true;

            zfypsjj_startTime_vm.zfypsjj_startTime = moment().startOf('month').format('YYYY-MM-DD');
            zfypsjj_endTime_vm.zfysypjj_endTime = moment().format('YYYY-MM-DD');
            // zfypsjj_endTime_vm.zfysypjj_endTime = moment().endOf('month').format('YYYY-MM-DD');
        },

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
        tree_flag: false, //true 为1页跳到2页的初始化为true，其他为false

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
            tableObject_zfypsjj_main.page(page, this.table_pagination.pageSize);
            this.zfyps_table_data = [];
            tableObject_zfypsjj_main.tableDataFnc([]);
            tableObject_zfypsjj_main.loading(true);
            if (storage.getItem("zfsypsjglpt-yspk-zfypsjj-actions")) //someone
                this.someone_ajax();
            else
                this.get_table_list();
        },

        optjj_main: avalon.define({
            $id: "optjj_main",
            authority: { // 按钮权限标识
                "CHECK": false, //音视频库_执法仪拍摄_查看
                "DELETE": false, //音视频库_执法仪拍摄_删除
                "SEARCH": false, //音视频库_执法仪拍摄_查询
                "OPT_SHOW": false, //操作栏显示方式
            }
        }),

        zfysyp_main_tree: avalon.define({
            $id: "zfysyp_main_tree",
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
            this.weekClick();
            zfyps_vm = e.vmodel;

            tableObject_zfypsjj_main = $.tableIndex({ //初始化表格jq插件
                id: 'zfypsjj_table',
                tableBody: tableBody_zfyps
            });

            // orgKey = "";
            // orgPath = "";
            filejj_logo_vm.curFile = "";
            zfypsjj_man_type.curType = "";
            mediajj_type_vm.curMedia = "";
            zfyps_vm.zfysyp_main_tree.curTree = "";
            mediajj_type_vm.jj_media_type = ["-1"];
            zfypsjj_man_type.police_type = ["LEVAM_JYLB_ALL"];
            filejj_logo_vm.file_type = ["0"];

            this.tree_flag = false;

            this.zfyps_table_data = [];
            tableObject_zfypsjj_main.tableDataFnc([]);
            tableObject_zfypsjj_main.loading(true);

            this.delete_all_if = false;
            this.table_status_flag = true;

            zfysypjj_time_range.time_select == "1";
            zfysypjj_time_range.time_range_label = ["1"];
            zfysypjj_time_range.select_time = false;
            zfysypjj_time_range.range_flag = 0;
            zfysypjj_time_range.time_range = ["0"];

            this.modify_toggle = true;

            let init_data = storage.getItem("zfsypsjglpt-sypgl-zfjlysyp-main");
            let item_record = storage.getItem("zfsypsjglpt-yspk-zfypsjj-record");

            neet_init = true; //true为缓存超时，相当于重新刷新；false为从Local Storage拿数据填充，表格数据重新请求。

            // set_size();
            if (storage.getItem("zfsypsjglpt-yspk-zfypsjj-actions")) { //someone
                this.curPage = 1;
                this.table_pagination.current = 1;
                tableObject_zfypsjj_main.page(1, this.table_pagination.pageSize);
                this.zfyps_table_data = [];
                tableObject_zfypsjj_main.tableDataFnc([]);
                tableObject_zfypsjj_main.loading(true);

                if (item_record.policeType == "LEVAM_JYLB_ALL" || item_record.policeType == "LEVAM_JYLB_JY" || item_record.policeType == "LEVAM_JYLB_FJ")
                    zfypsjj_man_type.police_type = new Array(item_record.policeType);
                else
                    zfypsjj_man_type.police_type = ["LEVAM_JYLB_ALL"];

                this.police_check = item_record.userName || item_record.userCode || "";

                if (item_record.includeChild) {
                    this.included_status = true;
                } else {
                    this.included_status = false;
                }

                zfysypjj_time_range.range_flag = item_record.time_range;
                zfysypjj_time_range.time_range = new Array(item_record.time_range.toString());
                this.tree_flag = true;
                zfyps_vm.zfysyp_main_tree.tree_code = item_record.orgPath;
                zfyps_vm.zfysyp_main_tree.tree_key = item_record.orgId;
                zfyps_vm.zfysyp_main_tree.tree_title = item_record.orgName;

                // if (zfysypjj_time_range.range_flag == 2) {
                zfypsjj_startTime_vm.zfypsjj_startTime = item_record.startTime;
                zfypsjj_endTime_vm.zfysypjj_endTime = item_record.endTime;
                zfysypjj_time_range.select_time = true;
                // }
                neet_init = false;

                if (storage.getItem('zfsypsjglpt-yspk-zfypsjj-returnFlag')) {
                    this.table_status_flag = storage.getItem('zfsypsjglpt-yspk-zfypsjj-tableStatus');
                    if (this.table_status_flag) {
                        this.table_status = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.chartMode;
                    } else
                        this.table_status = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.listMode;
                }
                //设置“本周”“本月”的高亮情况
                if(item_record.startTime == moment().isoWeekday(1).format('YYYY-MM-DD') && item_record.endTime == moment().format('YYYY-MM-DD')) {
                    // console.log('week');
                    this.weekActive = true;
                    this.monthActive = false;
                } else if(item_record.startTime == moment().dates(1).format('YYYY-MM-DD') && item_record.endTime == moment().format('YYYY-MM-DD')) {
                    // console.log('month');
                    this.weekActive = false;
                    this.monthActive = true;
                } else {
                    this.weekActive = false;
                    this.monthActive = false;
                }
                this.someone_ajax();
            } else if (storage.getItem("zfsypsjglpt-yspk-zfypsjj-returnFlag")) {
                // console.log(init_data);
                //从详情页面返回来后，设置“本周”“本月”的高亮情况
                if(init_data.ajax_data.startTime == moment().isoWeekday(1).format('YYYY-MM-DD') && init_data.ajax_data.endTime == moment().format('YYYY-MM-DD')) {
                    // console.log('week');
                    this.weekActive = true;
                    this.monthActive = false;
                } else if(init_data.ajax_data.startTime == moment().dates(1).format('YYYY-MM-DD') && init_data.ajax_data.endTime == moment().format('YYYY-MM-DD')) {
                    // console.log('month');
                    this.weekActive = false;
                    this.monthActive = true;
                } else {
                    this.weekActive = false;
                    this.monthActive = false;
                }
                storage.setItem("zfsypsjglpt-yspk-zfypsjj-returnFlag", false);
                if ((getTimestamp() - init_data.timeStamp) > 1800 || !init_data) { //1800 = 30 * 60              
                    neet_init = true;
                    // this.search_list();
                } else {
                    neet_init = false;
                    zfyps_vm.zfysyp_main_tree.tree_key = init_data.tree_key;
                    zfyps_vm.zfysyp_main_tree.tree_title = init_data.tree_title;
                    zfyps_vm.zfysyp_main_tree.curTree = init_data.ajax_data.orgPath;
                    // orgPath = init_data.ajax_data.orgPath;

                    zfysypjj_time_range.range_flag = init_data.range_flag;
                    zfysypjj_time_range.time_range = new Array(init_data.range_flag.toString());
                    // if (zfysypjj_time_range.range_flag == 2) {
                    zfypsjj_startTime_vm.zfypsjj_startTime = init_data.ajax_data.startTime;
                    zfypsjj_endTime_vm.zfysypjj_endTime = init_data.ajax_data.endTime;
                    zfysypjj_time_range.select_time = true;
                    // }
                    zfypsjj_man_type.police_type = new Array(init_data.ajax_data.policeType);
                    filejj_logo_vm.file_type = new Array(init_data.ajax_data.keyMark);
                    mediajj_type_vm.jj_media_type = new Array(init_data.ajax_data.type);

                    if (init_data.ajax_data.includeChild) {
                        this.included_status = true;
                    } else {
                        this.included_status = false;
                    }

                    if (init_data.ajax_data.timeType == "1") {
                        zfysypjj_time_range.time_select = "1";
                        zfysypjj_time_range.time_range_label = ["1"];
                    } else {
                        zfysypjj_time_range.time_select = "2";
                        zfysypjj_time_range.time_range_label = ["2"];
                    }

                    this.page_type = init_data.page_type;
                    this.curPage = init_data.ajax_data.page + 1;
                    this.table_pagination.current = init_data.ajax_data.page + 1;
                    this.table_pagination.total = init_data.list_total;
                    this.table_pagination.current_len = init_data.current_len;
                    this.table_pagination.totalPages = init_data.list_totalPages;

                    search_condition = {
                        "includeChild": init_data.ajax_data.includeChild,
                        "page": init_data.ajax_data.page,
                        "pageSize": init_data.ajax_data.pageSize,
                        "orgPath": init_data.ajax_data.orgPath,
                        "policeType": init_data.ajax_data.policeType,
                        "type": init_data.ajax_data.type,
                        "keyMark": init_data.ajax_data.keyMark,
                        "timeType": init_data.ajax_data.timeType,
                        "startTime": getTimeByDateStr(init_data.ajax_data.startTime),
                        "endTime": getTimeByDateStr(init_data.ajax_data.endTime)
                    };

                    if (init_data.ajax_data.jymc) {
                        this.police_check = init_data.ajax_data.jymc;
                        search_condition.jymc = init_data.ajax_data.jymc;
                    }

                    this.table_status_flag = storage.getItem('zfsypsjglpt-yspk-zfypsjj-tableStatus');
                    if (this.table_status_flag) {
                        this.table_status = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.chartMode;
                    } else
                        this.table_status = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.listMode;

                    this.get_table_list();
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
                        message: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.treeFail,
                        title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
                    });
                    return;
                }

                getDepTree(result.data, deptemp);
                zfyps_vm.zfysyp_main_tree.yspk_data = deptemp;
                // zfyps_vm.zfysyp_main_tree.yspk_value = new Array(deptemp[0].key);
                // zfyps_vm.zfysyp_main_tree.yspk_expandedKeys = new Array(deptemp[0].key);
                if (neet_init) {
                    zfyps_vm.zfysyp_main_tree.tree_code = deptemp[0].path;
                    zfyps_vm.zfysyp_main_tree.tree_key = deptemp[0].key;
                    zfyps_vm.zfysyp_main_tree.tree_title = deptemp[0].title;
                    if (!storage.getItem("zfsypsjglpt-yspk-zfypsjj-actions")) {
                        this.search_list();
                    }
                } else {
                    if (!this.tree_flag) {
                        zfyps_vm.zfysyp_main_tree.tree_code = init_data.ajax_data.orgPath;
                        zfyps_vm.zfysyp_main_tree.tree_key = init_data.tree_key;
                        zfyps_vm.zfysyp_main_tree.tree_title = init_data.tree_title;
                    }
                }

                if (this.tree_flag) {
                    zfyps_vm.zfysyp_main_tree.tree_code = item_record.orgPath;
                    zfyps_vm.zfysyp_main_tree.tree_key = item_record.orgId;
                    zfyps_vm.zfysyp_main_tree.tree_title = item_record.orgName;
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
                    $(".zfyps_main_tabCont").css("top", "34px");
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_CHECK_JJ":
                            _this.optjj_main.authority.CHECK = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_DELETE_JJ":
                            _this.optjj_main.authority.DELETE = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_SEARCH_JJ":
                            _this.optjj_main.authority.SEARCH = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_DOWNLOAD_JJ":
                            _this.optjj_main.authority.DOWNLOAD = true;
                            break;
                    }
                });

                if (false == _this.optjj_main.authority.CHECK && false == _this.optjj_main.authority.DELETE && false == _this.optjj_main.authority.DOWNLOAD)
                    _this.optjj_main.authority.OPT_SHOW = true;

                // 防止查询无权限时页面留白
                if (false == _this.optjj_main.authority.SEARCH)
                    $(".zfyps_main_tabCont").css("top", "34px");

                // _this.delete_all_if = true;
            });
        },
        onReady() {
            let _this = this;
            this.delete_all_if = true;

            set_size();
            // if (storage.getItem("zfsypsjglpt-sypgl-zfjlysyp-main") && neet_init == false) {
            //     if (storage.getItem("zfsypsjglpt-yspk-zfypsFlag") == "true") {
            //         _this.get_table_list();
            //         storage.setItem('zfsypsjglpt-yspk-zfypsFlag', "false");
            //     } else {
            //         tableObject_zfypsjj_main.tableDataFnc(this.zfyps_table_data);
            //         tableObject_zfypsjj_main.loading(false);
            //         _popover();
            //     }
            // }

            setTimeout(function () {
                $(".zfyps_input_panel .policeId").width($(".zfyps_input_panel").width() - 24);
                $(".zfyps_input_panel .key_name").width($(".zfyps_input_panel").width() - 24);
            }, 500);

            $(window).resize(function () {
                set_size();
                tableObject_zfypsjj_main.setForm();
                if (_this.zfyps_close_policeId)
                    $(".zfyps_input_panel .policeId").width($(".zfyps_input_panel").width() - 34);
                else
                    $(".zfyps_input_panel .policeId").width($(".zfyps_input_panel").width() - 24);

                if (_this.zfyps_close_key)
                    $(".zfyps_input_panel .key_name").width($(".zfyps_input_panel").width() - 34);
                else
                    $(".zfyps_input_panel .key_name").width($(".zfyps_input_panel").width() - 24);
            });

            // this.$watch("weekBtnclick", (v) => {
            //     console.log(v);
            // });
            // this.$fire('weekBtnclick', this.weekBtnclick);
        },
        onDispose() {
            window.clearTimeout(search_timer);
            // window.clearTimeout(save_timer);
            // window.clearTimeout(change_timer);
            click_search = true;
            // click_save = true;
            // click_change = true;
            this.zfyps_table_data = [];
            tableObject_zfypsjj_main.destroy();

            // tableObject_zfypsjj_main.tableDataFnc([]);
        },
        someone_ajax() {
            let _this = this;
            let item_record = storage.getItem("zfsypsjglpt-yspk-zfypsjj-record");
            if(item_record.userName == null) {
                item_record.userName = item_record.userCode;
            }
            let ajax_data = {
                "includeChild": item_record.includeChild,
                "page": (_this.curPage - 1),
                "pageSize": 20,
                "orgPath": item_record.orgPath,
                "policeType": item_record.policeType ? item_record.policeType : "LEVAM_JYLB_ALL", //人员类别空的时候传不限
                // "timeType": zfysypjj_time_range.time_select,
                "startTime": getTimeByDateStr(item_record.startTime),
                "endTime": getTimeByDateStr(item_record.endTime, true),
                "userName": item_record.userName
            };

            if (item_record.policeType == "LEVAM_JYLB_JY") {
                ajax_data.userCode = item_record.userCode;
            }
            else {
                ajax_data.idCard = item_record.userCode;
            }

            if (this.change_page) {
                ajax_data = search_condition;
                ajax_data.page = this.curPage - 1;
            } else {
                search_condition = ajax_data;
                if (storage.getItem("zfsypsjglpt-yspk-zfypsjj-returnFlag")) {
                    let mainPage = storage.getItem("zfsypsjglpt-yspk-zfypsjj-mainPage");
                    this.curPage = mainPage;
                    this.table_pagination.current = mainPage;
                    tableObject_zfypsjj_main.page(mainPage, this.table_pagination.pageSize);
                    ajax_data.page = mainPage - 1;
                }
            }

            if(ajax_data.userName) {
                let regex = new RegExp('^[\\sA-Za-z0-9\u4e00-\u9fa5_-]{1,20}$');  //验证人员正则
                if(!regex.test(ajax_data.userName)) { //验证人员，人员输入不正确
                    notification.warn({
                        message:language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.corretUserCode,
                        title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
                    });
                    tableObject_zfypsjj_main.loading(false);
                    return;
                }else {
    
                }
            }

            ajax({
                // url: '/api/table_list',
                url: '/gmvcs/audio/basefile/search/someone',
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

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    this.curPage = 0;
                    this.table_pagination.current = 0;
                    tableObject_zfypsjj_main.page(0, this.table_pagination.pageSize);
                    this.zfyps_table_data = [];
                    tableObject_zfypsjj_main.tableDataFnc([]);
                    tableObject_zfypsjj_main.loading(false);
                    this.table_pagination.total = 0;
                    return;
                }

                dealWithResult(result.data);

                storage.setItem("zfsypsjglpt-yspk-zfypsjj-mainPage", this.curPage);
            });
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

            zfypsjj_common_dialog.title = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.confirmDelete;
            this.operation_type = 2;
            zfypsjj_common_dialog.txt_rows = false;

            if (_this.delete_post_data.length == "0") {
                this.operation_type = 4;
                zfypsjj_common_dialog.title = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.tips;
                if (languageSelect == "en") {
                    zfypsjj_common_dialog.dialog_txt = "The associated data can't be deleted.";
                } else {
                    zfypsjj_common_dialog.dialog_txt = "选中的" + _this.selected_arr.length + "条关联数据需解除关联后才可删除！";
                }
                _this.zfyps_dialog_width = 400;
                _this.zfyps_dialog_height = 178;

                this.cancelText = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.close;
                this.zfyps_dialog_show = true;
                if (!$(".zfyps_dialog_common").hasClass("dialog_big_close"))
                    $(".zfyps_dialog_common").addClass("dialog_big_close");
            } else if (_this.delete_post_data.length == _this.selected_arr.length) {
                zfypsjj_common_dialog.title = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.confirmDelete;
                if (languageSelect == "en") {
                    zfypsjj_common_dialog.dialog_txt = "Are you sure you want to delete?";
                } else {
                    zfypsjj_common_dialog.dialog_txt = "是否确定删除选中的" + _this.selected_arr.length + "条数据?";
                }
                _this.zfyps_dialog_width = 300;
                _this.zfyps_dialog_height = 178;

                this.cancelText = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.cancel;
                this.zfyps_dialog_show = true;

            } else {
                let rel_len = _this.selected_arr.length - _this.delete_post_data.length;
                zfypsjj_common_dialog.txt_rows = true;
                zfypsjj_common_dialog.title = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.confirmDelete;
                if (languageSelect == "en") {
                    zfypsjj_common_dialog.dialog_txt = "Are you sure you want to delete?";
                } else {
                    zfypsjj_common_dialog.dialog_txt = "选中的数据中，有" + rel_len + "条数据已关联，需解除关联才可删除；没有关联的" + _this.delete_post_data.length + "条数据将会被删除。是否继续您的操作？";
                }
                _this.zfyps_dialog_width = 521;
                _this.zfyps_dialog_height = 220;

                this.cancelText = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.cancel;
                this.zfyps_dialog_show = true;
                if (!$(".zfyps_dialog_common").hasClass("dialog_biger_footer"))
                    $(".zfyps_dialog_common").addClass("dialog_biger_footer");
            }
        },
        get_table_list() {
            let start_time, end_time;
            start_time = zfypsjj_startTime_vm.zfypsjj_startTime;
            end_time = zfypsjj_endTime_vm.zfysypjj_endTime;

            let ajax_data = {
                "includeChild": this.included_status,
                "page": this.curPage - 1,
                "pageSize": this.table_pagination.pageSize,
                "orgPath": zfyps_vm.zfysyp_main_tree.curTree || zfyps_vm.zfysyp_main_tree.tree_code,
                "policeType": zfypsjj_man_type.curType || zfypsjj_man_type.police_type[0],
                "type": mediajj_type_vm.curMedia || mediajj_type_vm.jj_media_type[0],
                "keyMark": filejj_logo_vm.curFile || filejj_logo_vm.file_type[0],
                "timeType": zfysypjj_time_range.time_select,
                "startTime": getTimeByDateStr(start_time),
                "endTime": getTimeByDateStr(end_time, true)
            };

            if (this.police_check) {
                ajax_data.jymc = this.police_check;
            }

            if (this.change_page) {
                ajax_data = search_condition;
                ajax_data.page = this.curPage - 1;
            } else {
                search_condition = ajax_data;
            }

            if(ajax_data.jymc) {
                let regex = new RegExp('^[\\sA-Za-z0-9\u4e00-\u9fa5_-]{1,20}$');  //验证人员正则
                if(!regex.test(ajax_data.jymc)) { //验证人员，人员输入不正确
                    notification.warn({
                        message:language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.corretUserCode,
                        title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
                    });
                    tableObject_zfypsjj_main.loading(false);
                    return;
                }else {
    
                }
            }

            ajax({
                // url: '/api/table_list',
                url: '/gmvcs/audio/basefile/search',
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
                    "type": ajax_data.type,
                    "keyMark": ajax_data.keyMark,
                    "timeType": ajax_data.timeType,
                    "startTime": start_time,
                    "endTime": end_time
                };

                if (!this.police_check)
                    temp_data.jymc = "";
                else
                    temp_data.jymc = ajax_data.jymc;

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    this.curPage = 0;
                    this.table_pagination.current = 0;
                    tableObject_zfypsjj_main.page(0, this.table_pagination.pageSize);
                    this.zfyps_table_data = [];
                    tableObject_zfypsjj_main.tableDataFnc([]);
                    tableObject_zfypsjj_main.loading(false);
                    this.table_pagination.total = 0;

                    local_storage.timeStamp = getTimestamp();
                    local_storage.ajax_data = temp_data;
                    local_storage.tree_key = zfyps_vm.zfysyp_main_tree.tree_key;
                    local_storage.tree_title = zfyps_vm.zfysyp_main_tree.tree_title;
                    local_storage.range_flag = zfysypjj_time_range.range_flag;
                    local_storage.list_total = "0";
                    local_storage.current_len = "0";
                    local_storage.list_totalPages = "0";

                    storage.setItem('zfsypsjglpt-sypgl-zfjlysyp-main', local_storage);
                    return;
                }

                dealWithResult(result.data);

                local_storage.timeStamp = getTimestamp();
                local_storage.ajax_data = temp_data;
                local_storage.tree_key = zfyps_vm.zfysyp_main_tree.tree_key;
                local_storage.tree_title = zfyps_vm.zfysyp_main_tree.tree_title;
                local_storage.range_flag = zfysypjj_time_range.range_flag;
                local_storage.page_type = this.page_type;
                local_storage.list_total = this.table_pagination.total;
                local_storage.current_len = this.table_pagination.current_len;
                local_storage.list_totalPages = this.table_pagination.totalPages;
                storage.setItem('zfsypsjglpt-sypgl-zfjlysyp-main', local_storage);
            });
        },
        clickBranchBack(e) {
            this.included_status = e;
        },

        tableStatusBtn() {
            this.table_status_flag = !this.table_status_flag;
            // console.log(this.table_status_flag,this.extra_class);
            _popover();

            storage.removeItem("zfypsjj-main-tableDrag-style");
            $('.zfsypsjglpt_sypgl_zfysypjj_table li div').attr("style", "");

            if (this.table_status_flag) {
                // console.log('list');
                this.table_status = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.chartMode;
                tableObject_zfypsjj_main.tableDataFnc(this.zfyps_table_data);

                $(".file_abnormal_li").parent().css({
                    "background-color": "transparent"
                });

                $(".expireFile").css({
                    "background-color": "#dfdfdf"
                });
                $(".expireFile").siblings().css({
                    "background-color": "#dfdfdf"
                });

            } else {
                // console.log('chart');
                this.table_status = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.listMode;

                $(".file_abnormal_li").parent().css({
                    "background-color": "#E6E6E6"
                });

                $(".expireFile").css({
                    "background-color": "transparent"
                });
                $(".expireFile").siblings().css({
                    "background-color": "transparent"
                });
            }
        },
        returnBtn() {
            this.zfyps_table_data = [];
            tableObject_zfypsjj_main.tableDataFnc([]);

            storage.setItem("zfsypsjglpt-yspk-zfypsjj-returnFlag", false);
            avalon.history.setHash("/zfsypsjglpt-sypgl-zfjlysyp");
        },
        searchBtn() {
            if (this.key_format == "inline-block" || this.name_format == "inline-block")
                return;
            storage.setItem('zfsypsjglpt-yspk-zfypsjj-actions', false);
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
            // if (zfysypjj_time_range.range_flag == 2) {
            //     if (zfypsjj_startTime_vm.start_null == "inline-block" || zfypsjj_endTime_vm.end_null == "inline-block") {
            //         return;
            //     }
            if (getTimeByDateStr(zfypsjj_startTime_vm.zfypsjj_startTime) > getTimeByDateStr(zfypsjj_endTime_vm.zfysypjj_endTime)) {
                notification.warn({
                    message: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.timeSelectionException,
                    title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
                });
                return;
            }
            let time_interval = getTimeByDateStr(zfypsjj_endTime_vm.zfysypjj_endTime) - getTimeByDateStr(zfypsjj_startTime_vm.zfypsjj_startTime);
            if (time_interval / 86400000 > 365) { //86400000 = 24 * 60 * 60 * 1000
                notification.warn({
                    message: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.timeTooLarge,
                    title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
                });
                return;
            }
            // }

            this.curPage = 1;
            this.table_pagination.current = 1;
            tableObject_zfypsjj_main.page(1, this.table_pagination.pageSize);
            this.zfyps_table_data = [];
            tableObject_zfypsjj_main.tableDataFnc([]);
            tableObject_zfypsjj_main.loading(true);
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
                            title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
                        });
                    }
                    if (result.code == 0) {
                        notification.success({
                            message: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.deleteFlies,
                            title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
                        });
                        if (this.curPage == 1) {
                            if (storage.getItem("zfsypsjglpt-yspk-zfypsjj-actions")) //someone
                            {
                                this.someone_ajax();
                            } else {
                                this.search_list();
                            }
                            return;
                        }
                        if (!this.page_type && this.table_pagination.totalPages == this.curPage && "1" == this.table_pagination.current_len) { //删除的是最后一页&&删除的是所有数据
                            this.curPage -= 1;
                            tableObject_zfypsjj_main.page(this.curPage, this.table_pagination.pageSize);
                        }
                        this.table_pagination.current = this.curPage;
                        this.zfyps_table_data = [];
                        tableObject_zfypsjj_main.tableDataFnc([]);
                        tableObject_zfypsjj_main.loading(true);
                        if (storage.getItem("zfsypsjglpt-yspk-zfypsjj-actions")) //someone
                        {
                            this.someone_ajax();
                        } else {
                            this.get_table_list();
                        }
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
                            title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
                        });
                    }
                    if (result.code == 0) {
                        notification.success({
                            message: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.batchDeleteFlies,
                            title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
                        });
                        if (this.curPage == 1) {
                            if (storage.getItem("zfsypsjglpt-yspk-zfypsjj-actions")) //someone
                            {
                                this.someone_ajax();
                            } else {
                                this.search_list();
                            }
                            return;
                        }
                        if (!this.page_type && this.table_pagination.totalPages == this.curPage && this.delete_post_data.length == this.table_pagination.current_len) { //删除的是最后一页&&删除的是所有数据
                            this.curPage -= 1;
                            tableObject_zfypsjj_main.page(this.curPage, this.table_pagination.pageSize);
                        }
                        this.table_pagination.current = this.curPage;
                        this.zfyps_table_data = [];
                        tableObject_zfypsjj_main.tableDataFnc([]);
                        tableObject_zfypsjj_main.loading(true);
                        if (storage.getItem("zfsypsjglpt-yspk-zfypsjj-actions")) //someone
                        {
                            this.someone_ajax();
                        } else {
                            this.get_table_list();
                        }
                    }
                });
            }


            this.zfyps_dialog_show = false;
        },
        name_input_enter(e) {
            if (e.target.value != "") {
                this.search_policeId_title = e.target.value;
            } else
                this.search_policeId_title = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.policeId_tips;

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
                    _this.search_policeId_title = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.policeId_tips;
                    return false;
                    break;
                    // case 'key':
                    //     _this.search_key = "";
                    //     _this.search_key_title = "支持案件编号、涉案人员、案件类别、标注类型、采集地点、受理单位查询";
                    //     return false;
                    //     break;
            }
        },
        input_focus(e) {
            let _this = this;
            switch (e) {
                case 'policeId':
                    _this.zfyps_close_policeId = true;
                    $(".zfsypsjglpt_yspk_zfyps_main .dataFormBox .policeId").width($(".zfyps_input_panel").innerWidth() - 34);
                    break;
                case 'key':
                    _this.zfyps_close_key = true;
                    $(".zfsypsjglpt_yspk_zfyps_main .dataFormBox .key_name").width($(".zfyps_input_panel").innerWidth() - 34);
                    break;
            }
        },
        input_blur(e) {
            let _this = this;
            switch (e) {
                case 'policeId':
                    _this.zfyps_close_policeId = false;
                    $(".zfsypsjglpt_yspk_zfyps_main .dataFormBox .policeId").width($(".zfyps_input_panel").innerWidth() - 24);
                    break;
                case 'key':
                    _this.zfyps_close_key = false;
                    $(".zfsypsjglpt_yspk_zfyps_main .dataFormBox .key_name").width($(".zfyps_input_panel").innerWidth() - 24);
                    break;
            }
        }
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

let zfypsjj_table = avalon.define({
    $id: "zfsypsjglpt_sypgl_zfysypjj_table",
    loading: false,
    actions(type, text, record, index) {
        zfyps_vm.record_item = record;
        if (type == "check_click") {
            storage.setItem('zfsypsjglpt-yspk-zfypsjj-tableStatus', zfyps_vm.table_status_flag);
            storage.setItem('zfsypsjglpt-sypgl-zfjlysyp-detail', record);
            avalon.history.setHash("/zfsypsjglpt-sypgl-zfjlysyp-detail");
        } else if (type == "download_click") {
            if (!record.file_status) {
                return;
            }
            ajax({
                url: '/gmvcs/uom/file/fileInfo/vodInfo?vFileList[]=' + record.rid,
                // url: '/api/findVideoPlayByRid',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.noFoundURL,
                        title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
                    });
                    return;
                }

                let download_url = result.data[0].storageFileURL || result.data[0].wsFileURL || result.data[0].storageTransFileURL || result.data[0].wsTransFileURL;

                if (download_url == "") {
                    notification.error({
                        message: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.noFoundURL,
                        title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
                    });
                    return;
                }
                window.open(download_url);
            });

        } else if (type == "del_click") {
            if (!record.file_status) {
                return;
            }
            zfyps_vm.zfyps_dialog_width = 300;
            zfyps_vm.zfyps_dialog_height = 178;
            zfypsjj_common_dialog.txt_rows = false;

            if (record.is_rel) {
                zfyps_vm.operation_type = 3;
                zfypsjj_common_dialog.title = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.tips;
                zfypsjj_common_dialog.dialog_txt = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.msg1;
                zfyps_vm.cancelText = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.close;

                zfyps_vm.zfyps_dialog_show = true;

                if (!$(".zfyps_dialog_common").hasClass("dialog_close"))
                    $(".zfyps_dialog_common").addClass("dialog_close");
            } else {
                zfyps_vm.operation_type = 1;
                zfypsjj_common_dialog.title = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.confirmDelete;
                zfypsjj_common_dialog.dialog_txt = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.msg2;
                zfyps_vm.cancelText = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.cancel;

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

let zfypsjj_man_type = avalon.define({
    $id: 'zfypsjj_man_type',
    curType: "",
    time_type_options: [{
        value: "LEVAM_JYLB_ALL",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.all
    }, {
        value: "LEVAM_JYLB_JY",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.police
    }, {
        value: "LEVAM_JYLB_FJ",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.auxiliaryPolice
    }],
    police_type: ["LEVAM_JYLB_ALL"],
    onChangeT(e) {
        let _this = this;
        _this.curType = e.target.value;
    }
});

/* 主页面时间控制  start */
let zfysypjj_time_range = avalon.define({
    $id: 'zfysypjj_time_range',
    select_time: false,
    time_range_arr: [{
            value: "1",
            label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.takenDateandTime
        },
        {
            value: "2",
            label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.importTime
        }
    ],
    time_range_options: [{
        value: "0",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.week
    }, {
        value: "1",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.month
    }, {
        value: "2",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.customize
    }],
    time_range_label: ["1"],
    time_range: ["0"],
    time_select: "1",
    range_flag: 0,
    onChangeL(e) {
        let _this = this;
        _this.time_select = e.target.value;
    },
    onChangeTR(e) {
        let _this = this;
        if (e.target.value == 0)
            _this.range_flag = 0;

        if (e.target.value == 1)
            _this.range_flag = 1;

        if (e.target.value == 2) {
            _this.range_flag = 2;
            zfypsjj_endTime_vm.end_null = "none";
            zfypsjj_endTime_vm.zfysypjj_endTime = moment().format('YYYY-MM-DD');
            zfypsjj_startTime_vm.start_null = "none";
            zfypsjj_startTime_vm.zfypsjj_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');
            _this.select_time = true;
        } else
            _this.select_time = false;
    }
});

let zfypsjj_startTime_vm = avalon.define({
    $id: "zfypsjj_startTime",
    start_null: "none",
    endDate: moment().format('YYYY-MM-DD'),
    zfypsjj_startTime: moment().format('d') == "0" ? moment().day(-6).format('YYYY-MM-DD') : moment().day(1).format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.zfypsjj_startTime = e.target.value;
        if (_this.zfypsjj_startTime == "") {
            _this.start_null = "inline-block";
            $(".zfyps_start_time_tip").prev().children("input").addClass("input_error");
        } else {
            _this.start_null = "none";
            $(".zfyps_start_time_tip").prev().children("input").removeClass("input_error");
        }

        if (zfyps_vm.weekBtnclick) {
            zfyps_vm.weekActive = true;
            zfyps_vm.weekBtnclick = false;
        } else {
            zfyps_vm.weekActive = false;
        }

        if (zfyps_vm.monthBtnclick) {
            zfyps_vm.monthActive = true;
            zfyps_vm.monthBtnclick = false;
        } else {
            zfyps_vm.monthActive = false;
        }

        if(moment(_this.zfypsjj_startTime).format('YYYY-MM-DD') == moment().isoWeekday(1).format('YYYY-MM-DD') && moment(zfypsjj_endTime_vm.zfysypjj_endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
            // console.log('week');
            zfyps_vm.weekActive = true;
            zfyps_vm.monthActive = false;
        } else if(moment(_this.zfypsjj_startTime).format('YYYY-MM-DD') == moment().dates(1).format('YYYY-MM-DD') && moment(zfypsjj_endTime_vm.zfysypjj_endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
            // console.log('month');
            zfyps_vm.weekActive = false;
            zfyps_vm.monthActive = true;
        } else {
            zfyps_vm.weekActive = false;
            zfyps_vm.monthActive = false;
        }

    }
});

let zfypsjj_endTime_vm = avalon.define({
    $id: "zfysypjj_endTime",
    end_null: "none",
    endDate: moment().format('YYYY-MM-DD'),
    zfysypjj_endTime: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.zfysypjj_endTime = e.target.value;
        if (_this.zfysypjj_endTime == "") {
            _this.end_null = "inline-block";
            $(".zfyps_end_time_tip").prev().children("input").addClass("input_error");
        } else {
            _this.end_null = "none";
            $(".zfyps_end_time_tip").prev().children("input").removeClass("input_error");
        }

        if (zfyps_vm.weekBtnclick) {
            zfyps_vm.weekActive = true;
            zfyps_vm.weekBtnclick = false;
        } else {
            zfyps_vm.weekActive = false;
        }

        if (zfyps_vm.monthBtnclick) {
            zfyps_vm.monthActive = true;
            zfyps_vm.monthBtnclick = false;
        } else {
            zfyps_vm.monthActive = false;
        }

        if(moment(zfypsjj_startTime_vm.zfypsjj_startTime).format('YYYY-MM-DD') == moment().isoWeekday(1).format('YYYY-MM-DD') && moment(_this.zfysypjj_endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
            // console.log('week');
            zfyps_vm.weekActive = true;
            zfyps_vm.monthActive = false;
        } else if(moment(zfypsjj_startTime_vm.zfypsjj_startTime).format('YYYY-MM-DD') == moment().dates(1).format('YYYY-MM-DD') && moment(_this.zfysypjj_endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
            // console.log('month');
            zfyps_vm.weekActive = false;
            zfyps_vm.monthActive = true;
        } else {
            zfyps_vm.weekActive = false;
            zfyps_vm.monthActive = false;
        }

    }
});
/* 主页面时间控制  end */

let mediajj_type_vm = avalon.define({
    $id: 'jj_media_type',
    curMedia: "",
    media_options: [{
        value: "-1",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.all
    }, {
        value: "0",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.video
    }, {
        value: "1",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.audio
    }, {
        value: "2",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.picture
    }],
    jj_media_type: ["-1"],
    onChangeM(e) {
        let _this = this;
        _this.curMedia = e.target.value;
    }
});

let filejj_logo_vm = avalon.define({
    $id: 'filejj_logo',
    curFile: "",
    file_options: languageSelect == "en" ? [{
        value: "0",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.all
    }, {
        value: "1",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.ordinaryFile
    }, {
        value: "3",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.markInformation
    }, {
        value: "4",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.bodyCameraMarking
    }] : [{
        value: "0",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.all
    }, {
        value: "1",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.ordinaryFile
    }, {
    //     value: "2",
    //     label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.businessAssociation
    // }, {
        value: "3",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.markInformation
    }, {
        value: "4",
        label: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.bodyCameraMarking
    }],
    file_type: ["0"],
    onChangeF(e) {
        let _this = this;
        _this.curFile = e.target.value;
    }
});

let zfypsjj_common_dialog = avalon.define({
    $id: "zfypsjj_common_dialog",
    title: "",
    dialog_txt: "",
    txt_rows: true //true 两行 false 一行
});

function set_size() {
    let v_height = $(window).height() - 96;
    let v_min_height = $(window).height() - 68;
    if (v_height > 740) {
        // $(".zfsypsjglpt_yspk_zfyps_main").height(v_height);
        $("#sidebar .zfsypsjglpt-menu").css("min-height", v_min_height + "px");
    } else {
        // $(".zfsypsjglpt_yspk_zfyps_main").height(740);
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
            if (languageSelect == "en") {
                // console.log($(this)[0].outerHTML);
                if ($(this)[0].outerHTML.indexOf("data-tip-en-b") > 0)
                    html = $(this)[0].outerHTML.substring($(this)[0].outerHTML.indexOf("data-tip-en-b") + 15, $(this)[0].outerHTML.indexOf("data-tip-en-b") + 35);
                else if ($(this)[0].outerHTML.indexOf("data-tip-en-m") > 0)
                    html = $(this)[0].outerHTML.substring($(this)[0].outerHTML.indexOf("data-tip-en-m") + 15, $(this)[0].outerHTML.indexOf("data-tip-en-m") + 47);
                else if ($(this)[0].outerHTML.indexOf("data-tip-en-c") > 0)
                    html = $(this)[0].outerHTML.substring($(this)[0].outerHTML.indexOf("data-tip-en-c") + 15, $(this)[0].outerHTML.indexOf("data-tip-en-c") + 63);
                else if ($(this)[0].outerHTML.indexOf("data-tip-en-o") > 0)
                    html = $(this)[0].outerHTML.substring($(this)[0].outerHTML.indexOf("data-tip-en-o") + 15, $(this)[0].outerHTML.indexOf("data-tip-en-o") + 28);
                else
                    html = $(this)[0].innerText;
            } else {
                if ($(this)[0].outerHTML.indexOf("data-title-img-four") > 0)
                    html = $(this)[0].outerHTML.substring($(this)[0].outerHTML.indexOf("data-title-img-four") + 21, $(this)[0].outerHTML.indexOf("data-title-img-four") + 25);
                else if ($(this)[0].outerHTML.indexOf("data-title-img-seven") > 0)
                    html = $(this)[0].outerHTML.substring($(this)[0].outerHTML.indexOf("data-title-img-seven") + 22, $(this)[0].outerHTML.indexOf("data-title-img-seven") + 29);
                else
                    html = $(this)[0].innerText;
            }

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

// let tableObject_zfypsjj_main = $.tableIndex({ //初始化表格jq插件
//     id: 'zfypsjj_table',
//     controller: 'zfypsjj_table',
//     tableObj: zfypsjj_table,
//     currentPage: 1,
//     prePageSize: 20,
//     key: "rid"
// });
let tableBody_zfyps = avalon.define({ //表格定义组件
    $id: 'zfypsjj_table',
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
    dragStorageName: 'zfypsjj-main-tableDrag-style',

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
        zfypsjj_table.handleSelectAll(e.target.checked, this.selection.$model);
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
        zfypsjj_table.handleSelect(record.$model, checked, this.selection.$model);
    },
    handle: function (type, col, record, $index) { //操作函数
        var extra = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            extra[_i - 4] = arguments[_i];
        }
        var text = record[col].$model || record[col];
        zfypsjj_table.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});

function dealWithResult(result) {
    let ret_data = [],
        rid_arr = [];
    let temp = (zfyps_vm.curPage - 1) * zfyps_vm.table_pagination.pageSize + 1;
    avalon.each(result.currentElements, function (index, item) {
        ret_data[index] = {};
        ret_data[index].index = temp + index; //行序号
        ret_data[index].orgName = item.orgName; //所属部门
        ret_data[index].space = ""; //空title需要
        ret_data[index].policeType = item.policeType; //人员类别code
        ret_data[index].policeTypeName = item.policeTypeName || "-"; //人员类别name
        ret_data[index].importTime = formatDate(item.importTime); //导入时间
        ret_data[index].startTime = formatDate(item.startTime); //拍摄时间
        ret_data[index].duration = formatSeconds(item.duration); //拍摄时长
        ret_data[index].name_id = item.userName + "(" + item.userCode + ")"; //警员（警号）
        ret_data[index].rid = item.rid; //文件唯一标识

        ret_data[index].beginTime = item.startTime;
        ret_data[index].endTime = item.endTime;
        ret_data[index].deviceId = item.deviceId;
        ret_data[index].fileType = item.type;

        // rid_arr.push(item.rid);
        rid_arr[index] = item.rid; //媒体状态

        ret_data[index].search_status = false; //查询状态
        ret_data[index].file_status = true; //媒体状态 true 正常 false 异常
        ret_data[index].file_status_txt = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.normal; //媒体状态

        // ret_data[index].fileName = item.fileName || "暂时无法获取文件名称！";
        if(item.saveTime !== -2 && item.storageThumbnailURL == null && item.wsThumbnailURL == null) {  //时间少于3秒的文件,初始缩略图，避免显示缩略图时先闪过文件异常图
            ret_data[index].screenshot = "/static/image/zfsypsjglpt/video_abnormal2.png";
        }else {
            ret_data[index].screenshot = item.storageThumbnailURL || item.wsThumbnailURL || "/static/image/zfsypsjglpt/video_abnormal.png";
        }
        ret_data[index].list_close = "/static/image/zfsypsjglpt/del.png";

        ret_data[index].file_flag = "";
        ret_data[index].common_file = false;
        ret_data[index].is_rel = false; //关联
        ret_data[index].is_tag = false; //标注
        ret_data[index].is_imp = false; //重要

        if (item.match)
            ret_data[index].match_txt = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.beRelated;
        else
            ret_data[index].match_txt = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.unRelated;

        if (item.type == "0") {
            ret_data[index].type = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.video;
            ret_data[index].file_flag = "0";
        } else if (item.type == "1") {
            ret_data[index].type = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.audio;
            ret_data[index].file_flag = "1";
            ret_data[index].screenshot = "/static/image/zfsypsjglpt/audio_normal.png";
        } else if (item.type == "2") {
            ret_data[index].type = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.picture;
            ret_data[index].file_flag = "2";
            ret_data[index].screenshot = item.storageThumbnailURL || item.wsThumbnailURL || "/static/image/zfsypsjglpt/picture_abnormal.png";
        } else if (item.type == "3") {
            ret_data[index].type = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.file;
        } else
            ret_data[index].type = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.other;

        if (!item.match && !item.label && !item.keyFile) {
            ret_data[index].common_file = true;
            ret_data[index].common_file_img = "/static/image/zfsypsjglpt/ywgl.png";
        }
        if (item.match) {
            ret_data[index].rel_img = "/static/image/zfsypsjglpt/ywgl.png";
            ret_data[index].rel_title = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.businessAssociation;
            ret_data[index].is_rel = true;
        }
        if (item.label) {
            ret_data[index].tag_img = "/static/image/zfsypsjglpt/mark_icon.png";
            ret_data[index].tag_title = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.markInformation;
            ret_data[index].is_tag = true;
        }
        if (item.keyFile) {
            ret_data[index].imp_img = "/static/image/zfsypsjglpt/important_icon.png";
            ret_data[index].imp_title = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.bodyCameraMarking;
            ret_data[index].is_imp = true;
        }

        if (item.saveTime == -2) {
            ret_data[index].screenshot = "/static/image/zfsypsjglpt/video_abnormal.png";
            ret_data[index].isExpire = true;
        }
    });

    zfyps_vm.zfyps_table_data = ret_data;
    tableObject_zfypsjj_main.tableDataFnc(ret_data);
    tableObject_zfypsjj_main.loading(false);

    ajax({
        url: '/gmvcs/uom/file/fileInfo/fileAccessible',
        // url: '/api/fileAccessible',
        method: 'post',
        data: rid_arr
    }).then(ret => {
        if (ret.code != 0) {
            notification.error({
                message: ret.msg,
                title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
            });
        }
        let ret_arr = ret.data;

        for (let i = 0; i < ret_arr.length; i++) {
            ret_data[i].search_status = true;

            if (ret_arr[i].canPlay) {
                ret_data[i].file_status = true;
                ret_data[i].file_status_txt = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.normal;
                
                switch (ret_data[i].fileType) {
                    case 1:
                        ret_data[i].screenshot = "/static/image/zfsypsjglpt/audio_normal.png";
                        break;
                    default:
                        if(ret_arr[i].thumbNailHttpUrl == null) {
                            ret_data[i].screenshot = "/static/image/zfsypsjglpt/video_abnormal2.png";
                        }else {
                            ret_data[i].screenshot = ret_arr[i].thumbNailHttpUrl;
                        }
                }
            } else {
                ret_data[i].file_status = false;
                ret_data[i].file_status_txt = language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.abnormal;
                switch (ret_data[i].fileType) {
                    case 0:
                        ret_data[i].screenshot = "/static/image/zfsypsjglpt/video_abnormal.png";
                        break;
                    case 1:
                        ret_data[i].screenshot = "/static/image/zfsypsjglpt/audio_abnormal.png";
                        break;
                    case 2:
                        ret_data[i].screenshot = "/static/image/zfsypsjglpt/picture_abnormal.png";
                        break;
                }
            }
        }

        zfyps_vm.zfyps_table_data = ret_data;
        tableObject_zfypsjj_main.tableDataFnc(ret_data);
    });

    $(".expireFile").css({
        "background-color": "#dfdfdf"
    });
    $(".expireFile").siblings().css({
        "background-color": "#dfdfdf"
    });

    $(".file_abnormal_li").parent().css({
        "background-color": "transparent"
    });

    if (!zfyps_vm.table_status_flag) {
        $(".file_abnormal_li").parent().css({
            "background-color": "#E6E6E6"
        });

        $(".expireFile").css({
            "background-color": "transparent"
        });
        $(".expireFile").siblings().css({
            "background-color": "transparent"
        });
    }

    if (result.overLimit) {
        zfyps_vm.page_type = true;

        zfyps_vm.table_pagination.total = result.limit * zfyps_vm.table_pagination.pageSize; //总条数
        zfyps_vm.table_pagination.totalPages = result.limit; //总页数
    } else {
        zfyps_vm.page_type = false;

        zfyps_vm.table_pagination.total = result.totalElements; //总条数
        zfyps_vm.table_pagination.totalPages = result.totalPages; //总页数
    }
    zfyps_vm.table_pagination.current_len = result.currentElements.length;

    _popover();
}