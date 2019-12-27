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

export const name = "zfsypsjglpt-jdkp-sjqzcskp";
require("/apps/zfsypsjglpt/zfsypsjglpt-jdkp-sjqzcskp.css");

let sjqzcskp_vm,
    ajax_data_g = {},
    tableObject_sjqzcskp = {},
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
    template: __inline("./zfsypsjglpt-jdkp-sjqzcskp.html"),
    defaults: {
        sjqzcskp_table_data: [],
        curPage: 1,
        table_pagination: {
            current: 0,
            pageSize: 20,
            total: 0,
            current_len: 0,
            totalPages: 0
        },

        change_page: false, //判断是查询还是翻页触发的刷新数据 查询-false 翻页-true
        page_type: false, //fasle 显示总条数; true 显示大于多少条

        search_num: 20,
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
            tableObject_sjqzcskp.page(page, this.table_pagination.pageSize);
            this.sjqzcskp_table_data = [];
            tableObject_sjqzcskp.tableDataFnc([]);
            tableObject_sjqzcskp.loading(true);
            this.get_table_list();
        },

        opt_sjqzcskp: avalon.define({
            $id: "opt_sjqzcskp",
            authority: { // 按钮权限标识
                // "CHECK": true, //监督考评_强制措施考评_查看
                "OPT_SHOW": false, //操作栏显示方式
                "SEARCH": false //监督考评_强制措施考评_查询
            }
        }),

        sjqzcskp_tree: avalon.define({
            $id: "sjqzcskp_tree",
            sjqzcskp_data: [],
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
            sjqzcskp_vm = e.vmodel;
            ajax_data_g = {};

            tableObject_sjqzcskp = $.tableIndex({ //初始化表格jq插件
                id: 'sjqzcskp_table',
                tableBody: tableBody_sjqzcskp
            });

            sjqzcskp_vm.sjqzcskp_tree.orgPath = "";
            sjqzcskp_vm.sjqzcskp_tree.orgId = "";

            this.sjqzcskp_table_data = [];
            tableObject_sjqzcskp.tableDataFnc([]);
            tableObject_sjqzcskp.loading(true);

            sjqzcskp_time_vm.select_time = false;
            sjqzcskp_time_vm.range_flag = 0;
            sjqzcskp_time_vm.time_range = ["0"];

            let init_data = storage.getItem("zfsypsjglpt-jdkp-sjqzcskp");
            neet_init = true; //判断是否需要初始化页面；true为重新从后台拿数据初始化，false为从Local Storage拿数据填充。

            // set_size();

            if (init_data) {
                if ((getTimestamp() - init_data.timeStamp) > 1800) //1800 = 30 * 60
                    neet_init = true;
                else {
                    neet_init = false;

                    sjqzcskp_vm.sjqzcskp_tree.tree_key = init_data.tree_key;
                    sjqzcskp_vm.sjqzcskp_tree.tree_title = init_data.tree_title;

                    sjqzcskp_time_vm.range_flag = init_data.range_flag;
                    sjqzcskp_time_vm.time_range = new Array(init_data.range_flag.toString());
                    if (sjqzcskp_time_vm.range_flag == 2) {
                        sjqzcskp_startTime_vm.sjqzcskp_startTime = init_data.ajax_data.wfsjStart;
                        sjqzcskp_endTime_vm.sjqzcskp_endTime = init_data.ajax_data.wfsjEnd;
                        sjqzcskp_time_vm.select_time = true;
                    }

                    this.search_num = init_data.ajax_data.checkNum;
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
                        "wfsjStart": init_data.ajax_data.wfsjStart,
                        "wfsjEnd": init_data.ajax_data.wfsjEnd,
                        "checkNum": init_data.ajax_data.checkNum
                    };

                    ajax_data_g = search_condition;
                    this.sjqzcskp_table_data = init_data.table_list;
                    // tableObject_sjqzcskp.tableDataFnc(init_data.table_list);
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
                sjqzcskp_vm.sjqzcskp_tree.sjqzcskp_data = deptemp;
                sjqzcskp_vm.sjqzcskp_tree.tree_code = deptemp[0].path;
                sjqzcskp_vm.sjqzcskp_tree.tree_key = deptemp[0].key;
                sjqzcskp_vm.sjqzcskp_tree.tree_title = deptemp[0].title;

                if (neet_init) {
                    this.search_list();
                } else {
                    sjqzcskp_vm.sjqzcskp_tree.tree_code = init_data.ajax_data.orgPath;
                    sjqzcskp_vm.sjqzcskp_tree.tree_key = init_data.tree_key;
                    sjqzcskp_vm.sjqzcskp_tree.tree_title = init_data.tree_title;
                }
            });

            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_JDKP_JTWFKP_QZCS/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询无权限时页面留白
                    $(".sjqzcskp_tabCont").css("top", "34px");
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_JDKP_JTWFKP_QZCS_SEARCH":
                            _this.opt_sjqzcskp.authority.SEARCH = true;
                            break;
                    }
                });

                // 防止查询无权限时页面留白
                if (false == _this.opt_sjqzcskp.authority.SEARCH) {
                    _this.opt_sjqzcskp.authority.OPT_SHOW = true;
                    $(".sjqzcskp_tabCont").css("top", "34px");
                }

            });
        },
        onReady() {
            let _this = this;

            set_size();
            if (storage.getItem("zfsypsjglpt-jdkp-sjqzcskp") && neet_init == false) {
                tableObject_sjqzcskp.tableDataFnc(this.sjqzcskp_table_data);
                tableObject_sjqzcskp.loading(false);
            }

            setTimeout(function () {
                $(".zfyps_input_panel .policeId").width($(".zfyps_input_panel").width() - 24);
                $(".zfyps_input_panel .key_name").width($(".zfyps_input_panel").width() - 24);
            }, 500);

            $(window).resize(function () {
                set_size();
                tableObject_sjqzcskp.setForm();
            });
        },
        onDispose() {
            window.clearTimeout(search_timer);
            // window.clearTimeout(save_timer);
            // window.clearTimeout(change_timer);
            click_search = true;
            // click_save = true;
            // click_change = true;
            this.sjqzcskp_table_data = [];
            tableObject_sjqzcskp.destroy();
            // tableObject_sjqzcskp.tableDataFnc([]);
        },
        select_table(record, selected, selectedRows) {
            // this.selected_arr = selectedRows;
        },
        selectAll_table(selected, selectedRows) {
            // this.selected_arr = selectedRows;
        },
        get_table_list() {
            let start_time, end_time;
            if (sjqzcskp_time_vm.range_flag == "0") {
                if (moment().format('d') == "0") {
                    start_time = moment().day(-6).format('YYYY-MM-DD');
                    end_time = moment().day(0).format('YYYY-MM-DD');
                } else {
                    start_time = moment().day(1).format('YYYY-MM-DD');
                    end_time = moment().day(7).format('YYYY-MM-DD');
                }
            }

            if (sjqzcskp_time_vm.range_flag == "1") {
                start_time = moment().startOf('month').format('YYYY-MM-DD');
                end_time = moment().endOf('month').format('YYYY-MM-DD');
            }

            if (sjqzcskp_time_vm.range_flag == "2") {
                start_time = sjqzcskp_startTime_vm.sjqzcskp_startTime;
                end_time = sjqzcskp_endTime_vm.sjqzcskp_endTime;
            }

            ajax_data_g = {
                "page": this.curPage - 1,
                "pageSize": this.table_pagination.pageSize,
                "orgPath": sjqzcskp_vm.sjqzcskp_tree.orgPath || sjqzcskp_vm.sjqzcskp_tree.tree_code,
                "wfsjStart": getTimeByDateStr(start_time),
                "wfsjEnd": getTimeByDateStr(end_time, true),
                "checkNum": this.search_num
            };

            if (this.change_page) {
                ajax_data_g = search_condition;
                ajax_data_g.page = this.curPage - 1;
            } else
                search_condition = ajax_data_g;

            ajax({
                // url: '/gmvcs/audio/force/search/eva',
                url: '/gmvcs/audio/force/search/randomEva',
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
                let temp_data = {
                    "page": ajax_data_g.page,
                    "pageSize": ajax_data_g.pageSize,
                    "orgPath": ajax_data_g.orgPath,
                    "wfsjStart": start_time,
                    "wfsjEnd": end_time,
                    "checkNum": ajax_data_g.checkNum
                };

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    this.curPage = 0;
                    this.table_pagination.current = 0;
                    tableObject_sjqzcskp.page(0, this.table_pagination.pageSize);
                    this.sjqzcskp_table_data = [];
                    tableObject_sjqzcskp.tableDataFnc([]);
                    tableObject_sjqzcskp.loading(false);
                    this.table_pagination.total = 0;

                    local_storage.timeStamp = getTimestamp();
                    local_storage.ajax_data = temp_data;
                    local_storage.tree_key = sjqzcskp_vm.sjqzcskp_tree.tree_key;
                    local_storage.tree_title = sjqzcskp_vm.sjqzcskp_tree.tree_title;
                    local_storage.range_flag = sjqzcskp_time_vm.range_flag;
                    local_storage.table_list = [];
                    local_storage.list_total = "0";
                    local_storage.current_len = "0";
                    local_storage.list_totalPages = "0";

                    storage.setItem('zfsypsjglpt-jdkp-sjqzcskp', local_storage);
                    return;
                }

                let ret_data = [];
                let temp = (this.curPage - 1) * this.table_pagination.pageSize + 1;
                avalon.each(result.data.currentElements, function (index, item) {
                    ret_data[index] = {};
                    ret_data[index].index = temp + index; //行序号
                    ret_data[index].orgName = item.orgName; //所属部门
                    ret_data[index].space = ""; //空title需要

                    if (item.userCode)
                        ret_data[index].userName = item.userName + "(" + item.userCode + ")"; //警员（警号）
                    else
                        ret_data[index].userName = "-"; //警员（警号）

                    ret_data[index].wfsj = formatDate(item.wfsj); //违法时间
                    ret_data[index].dsr = item.dsr; //当事人
                    ret_data[index].jszh = item.jszh; //驾驶证号
                    ret_data[index].hphm = item.hphm; //车牌号码
                    ret_data[index].pzbh = item.pzbh; //凭证编号
                    ret_data[index].wfdz = item.wfdz; //违法地点

                    if (item.relation) //关联媒体
                        ret_data[index].relation = "已关联";
                    else
                        ret_data[index].relation = "未关联";

                    ret_data[index].xh = item.xh; //序号-主键，跳转时传
                });

                this.sjqzcskp_table_data = ret_data;
                tableObject_sjqzcskp.tableDataFnc(ret_data);
                tableObject_sjqzcskp.loading(false);

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
                local_storage.tree_key = sjqzcskp_vm.sjqzcskp_tree.tree_key;
                local_storage.tree_title = sjqzcskp_vm.sjqzcskp_tree.tree_title;
                local_storage.range_flag = sjqzcskp_time_vm.range_flag;
                local_storage.table_list = ret_data;
                local_storage.page_type = this.page_type;
                local_storage.list_total = this.table_pagination.total;
                local_storage.current_len = this.table_pagination.current_len;
                local_storage.list_totalPages = this.table_pagination.totalPages;
                storage.setItem('zfsypsjglpt-jdkp-sjqzcskp', local_storage);
            });
        },
        search_num_enter(e) {
            if (e.keyCode == "13")
                this.searchBtn();
        },
        searchBtn() {
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
            if (sjqzcskp_time_vm.range_flag == 2) {
                if (getTimeByDateStr(sjqzcskp_startTime_vm.sjqzcskp_startTime) > getTimeByDateStr(sjqzcskp_endTime_vm.sjqzcskp_endTime)) {
                    notification.warn({
                        message: '开始时间不能晚于结束时间，请重新设置！',
                        title: '通知'
                    });
                    return;
                }
                let time_interval = getTimeByDateStr(sjqzcskp_endTime_vm.sjqzcskp_endTime) - getTimeByDateStr(sjqzcskp_startTime_vm.sjqzcskp_startTime);
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
            tableObject_sjqzcskp.page(1, this.table_pagination.pageSize);
            this.sjqzcskp_table_data = [];
            tableObject_sjqzcskp.tableDataFnc([]);
            tableObject_sjqzcskp.loading(true);
            this.get_table_list();
        }
    }
});

//查询定时器
let search_timer;
let click_search = true;

let sjqzcskp_table = avalon.define({
    $id: "jdkp_sjqzcskp_table",
    loading: false,
    actions(type, text, record, index) {
        if (type == "check_click") {
            let sjqzcskpData = {
                "xh": record.xh,
                "sjqzcskp": true,
                "evaStatus": false,
                "reviewStatus": false
            };
            storage.setItem("zfsypsjglpt-jdkp-qzcs-current-qzcsData", sjqzcskpData);
            avalon.history.setHash('/zfsypsjglpt-jdkp-qzcs-wkp_jiaojing');
        }
    }
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

/* 主页面时间控制  start */
let sjqzcskp_time_vm = avalon.define({
    $id: 'sjqzcskp_time_range',
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
            sjqzcskp_endTime_vm.sjqzcskp_endTime = moment().format('YYYY-MM-DD');
            sjqzcskp_startTime_vm.sjqzcskp_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');
            _this.select_time = true;
        } else
            _this.select_time = false;
    }
});

let sjqzcskp_startTime_vm = avalon.define({
    $id: "sjqzcskp_startTime",
    sjqzcskp_startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    handleTimeChange(e) {
        let _this = this;
        _this.sjqzcskp_startTime = e.target.value;
    }
});

let sjqzcskp_endTime_vm = avalon.define({
    $id: "sjqzcskp_endTime",
    sjqzcskp_endTime: moment().format('YYYY-MM-DD'),
    handleTimeChange(e) {
        let _this = this;
        _this.sjqzcskp_endTime = e.target.value;
    }
});
/* 主页面时间控制  end */

function set_size() {
    let v_height = $(window).height() - 96;
    let v_min_height = $(window).height() - 68;
    if (v_height > 740) {
        $(".zfsypsjglpt_jdkp_sjqzcskp").height(v_height);
        $("#sidebar .zfsypsjglpt-menu").css("min-height", v_min_height + "px");
    } else {
        $(".zfsypsjglpt_jdkp_sjqzcskp").height(740);
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
let tableBody_sjqzcskp = avalon.define({ //表格定义组件
    $id: 'sjqzcskp_table',
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
    dragStorageName: 'sjqzcskp-tableDrag-style',
    // debouleHead: ["table-index-thead"], //多级表头，需要将所有表头的class名当做数组传入；单级表格可以忽略这个参数
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
        sjqzcskp_table.handleSelectAll(e.target.checked, this.selection.$model);
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
        sjqzcskp_table.handleSelect(record.$model, checked, this.selection.$model);
    },
    handle: function (type, col, record, $index) { //操作函数
        var extra = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            extra[_i - 4] = arguments[_i];
        }
        var text = record[col].$model || record[col];
        sjqzcskp_table.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});