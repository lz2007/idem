import avalon from "avalon2";
import "ane";
import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import * as menuServer from '../../services/menuService';
import moment from 'moment';
let storage = require('/services/storageService.js').ret;
let echarts = require("echarts/dist/echarts.min");
export const name = "sszhxt-znsb-cpbk";
require("/apps/sszhxt/sszhxt-znsb-cpbk.less");
import '../common/common-ms-table';
import '/services/filterService';

let cpbk_vm;
avalon.component(name, {
    template: __inline("./sszhxt-znsb-cpbk.html"),
    defaults: {
        included_status: false, //true 包含子部门；false 不包含子部门
        included_dep_img: "",
        included_dep_click() {
            this.included_status = !this.included_status;
        },

        police_id: "",
        police_id_title: "支持名字首字母小写",
        police_id_close: false,
        car_num: "",
        car_num_title: "支持模糊搜索",
        car_num_close: false,

        change_page: false,
        table_pagination: {
            current: 0,
            pageSize: 20,
            total: 0
        },
        page_type: false, //false 显示总条数; true 显示大于多少条
        handlePageChange(currentPage) {
            this.change_page = true;
            this.table_pagination.current = currentPage;
            this.loading = true;
            this.getTableList();
        },
        getCurrent(current) {
            this.table_pagination.current = current;
        },

        search_data: {},
        table_list: [],
        loading: false,

        echart_option: {
            color: ['#fff', '#ff0000'].reverse(),
            series: [{
                hoverAnimation: false,
                type: 'pie',
                radius: ['55%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        show: false,
                        textStyle: {
                            fontSize: '30',
                            fontWeight: 'bold'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data: [{
                        value: 98
                    },
                    {
                        value: 2
                    }
                ]
            }],
            graphic: [{
                    id: 'percent_txt',
                    type: 'text',
                    style: {
                        text: '98%',
                        x: 55,
                        y: 40,
                        fill: 'red',
                        font: '14px "Microsoft YaHei", sans-serif'
                    }
                },
                {
                    type: 'text',
                    style: {
                        text: '相似度',
                        x: 45,
                        y: 70,
                        fill: '#536b82',
                        font: '14px "Microsoft YaHei", sans-serif'
                    },
                }
            ]
        },

        actions(type, text, record, index) {
            if (type == "check") {
                let item = {
                    id: record.id,
                    carNumber: record.carNumber
                }
                storage.setItem('sszhxt-znsb-cpbk-record-item', item);
                avalon.history.setHash("/sszhxt-znsb-cpbk-detail");
            }
        },

        cpbk_dialog_show: false,
        dialogCancel() {
            this.cpbk_dialog_show = false;
        },
        dialogOk() {
            this.cpbk_dialog_show = false;
        },

        onInit(e) {
            cpbk_vm = e.vmodel;

            let storage_item = storage.getItem('sszhxt-znsb-cpbk');

            this.$watch("included_status", (v) => {
                if (v)
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectYes.png?__sprite";
                else
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectNo.png?__sprite";

            });
            this.$fire('included_status', this.included_status);

            if (storage_item) {
                cpbk_time_range.range_flag = storage_item.range_flag;
                cpbk_time_range.time_range = new Array(storage_item.range_flag.toString());
                if (cpbk_time_range.range_flag == 2) {
                    cpbk_startTime_vm.cpbk_startTime = storage_item.ajax_data.beginTime;
                    cpbk_endTime_vm.cpbk_endTime = storage_item.ajax_data.endTime;
                    cpbk_time_range.select_time = true;
                }

                this.included_status = storage_item.ajax_data.includeChild;
                man_category_vm.ajax_category = storage_item.ajax_data.policeType || "0";
                man_category_vm.category_val = new Array(storage_item.ajax_data.policeType || "0");
                this.police_id = storage_item.ajax_data.jy || "";
                this.police_id_title = this.police_id || "支持名字首字母小写";
                this.car_num = storage_item.ajax_data.carNumber || "";
                this.car_num_title = this.car_num || "支持模糊搜索";

                // this.table_pagination.total = storage_item.total;
                this.loading = true;
                this.change_page = true;
                this.search_data = storage_item.ajax_data;
                this.search_data.beginTime = getTimeByDateStr(storage_item.ajax_data.beginTime);
                this.search_data.endTime = getTimeByDateStr(storage_item.ajax_data.endTime);

                this.table_pagination.current = storage_item.ajax_data.page + 1;
            } else {
                cpbk_time_range.range_flag = 0;
                cpbk_time_range.time_range = ["0"];
                this.included_status = false;
                man_category_vm.ajax_category = "0";
                man_category_vm.category_val = ["0"];
                this.police_id = "";
                this.car_num = "";
                this.change_page = false;
                this.search_data = {};
            }

            let deptemp = [];
            ajax({
                url: '/gmvcs/uap/org/find/fakeroot/mgr',
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
                cpbk_vm.cpbk_tree_vm.tree_data = deptemp;

                if (storage_item) {
                    cpbk_vm.cpbk_tree_vm.tree_code = storage_item.ajax_data.orgPath;
                    cpbk_vm.cpbk_tree_vm.tree_key = storage_item.tree_key;
                    cpbk_vm.cpbk_tree_vm.tree_title = storage_item.tree_title;

                    this.getTableList();
                } else {
                    cpbk_vm.cpbk_tree_vm.tree_code = deptemp[0].path;
                    cpbk_vm.cpbk_tree_vm.tree_key = deptemp[0].key;
                    cpbk_vm.cpbk_tree_vm.tree_title = deptemp[0].title;

                    this.searchBtn();
                }
            });
        },
        onReady() {
            let _this = this;
            menuServer.menu.then(menu => {
                let list = menu.SSZH_MENU_SSZHXT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^INSTRUCT_FUNCTION_ZNSB_CPBK/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询无权限时页面留白
                    $(".znsb_cpbk .cpbk-table .common-list-panel").css("cssText", "position: absolute; top: 108px !important; bottom: 46px !important; left: 8px; right: 8px;");
                    return;
                }

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "INSTRUCT_FUNCTION_ZNSB_CPBK_CK":
                            _this.opt_cpbk.authority.CHECK = true;
                            break;
                        case "INSTRUCT_FUNCTION_ZNSB_CPBK_CX":
                            _this.opt_cpbk.authority.SEARCH = true;
                            break;
                    }
                });

                if (false == _this.opt_cpbk.authority.CHECK)
                    _this.opt_cpbk.authority.OPT_SHOW = true;

                // 防止查询无权限时页面留白
                if (false == _this.opt_cpbk.authority.SEARCH)
                    $(".znsb_cpbk .cpbk-table .common-list-panel").css("cssText", "position: absolute; top: 108px !important; bottom: 46px !important; left: 8px; right: 8px;");
            });
        },

        opt_cpbk: avalon.define({
            $id: "opt_cpbk",
            authority: { // 按钮权限标识
                "CHECK": false, //智能识别-车牌布控-查看
                "SEARCH": false, //智能识别-车牌布控-查询
                "OPT_SHOW": false, //操作栏显示方式
            }
        }),

        cpbk_tree_vm: avalon.define({
            $id: "cpbk_tree",
            tree_data: [],
            tree_key: "",
            tree_title: "",
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

        searchBtn() {
            this.change_page = false;
            this.table_pagination.current = 0;
            this.table_pagination.total = 0; //总条数
            this.loading = true;
            this.getTableList();
        },
        getTableList() {
            let start_time, end_time;
            if (cpbk_time_range.range_flag == "0") {
                if (moment().format('d') == "0") {
                    start_time = moment().day(-6).format('YYYY-MM-DD');
                    end_time = moment().day(0).format('YYYY-MM-DD');
                } else {
                    start_time = moment().day(1).format('YYYY-MM-DD');
                    end_time = moment().day(7).format('YYYY-MM-DD');
                }
            }

            if (cpbk_time_range.range_flag == "1") {
                start_time = moment().startOf('month').format('YYYY-MM-DD');
                end_time = moment().endOf('month').format('YYYY-MM-DD');
            }

            if (cpbk_time_range.range_flag == "2") {
                start_time = cpbk_startTime_vm.cpbk_startTime;
                end_time = cpbk_endTime_vm.cpbk_endTime;
            }

            let ajax_data = {
                "includeChild": this.included_status,
                "page": 0,
                "pageSize": this.table_pagination.pageSize,
                "orgPath": cpbk_vm.cpbk_tree_vm.curTree || cpbk_vm.cpbk_tree_vm.tree_code,
                "policeType": man_category_vm.ajax_category == "0" ? "" : man_category_vm.ajax_category,
                "beginTime": getTimeByDateStr(start_time),
                "endTime": getTimeByDateStr(end_time, true)
            };

            if (this.police_id)
                ajax_data.jy = $.trim(this.police_id);

            if (this.car_num)
                ajax_data.carNumber = $.trim(this.car_num);

            if (this.change_page) {
                ajax_data = this.search_data;
                ajax_data.page = this.table_pagination.current - 1;
            } else
                this.search_data = ajax_data;

            ajax({
                // url: '/api/carRecognition',
                url: '/gmvcs/instruct/car/monitoring/search/recognition',
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
                let temp_data = {
                    "includeChild": ajax_data.includeChild,
                    "page": ajax_data.page,
                    "pageSize": ajax_data.pageSize,
                    "orgPath": ajax_data.orgPath,
                    "policeType": ajax_data.policeType,
                    "beginTime": start_time,
                    "endTime": end_time,
                    "jy": ajax_data.jy || "",
                    "carNumber": ajax_data.carNumber || ""
                };

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    this.table_pagination.current = 0;
                    this.table_pagination.total = 0;
                    this.table_list = [];
                    this.loading = false;

                    let storage_item = {
                        "ajax_data": temp_data,
                        "range_flag": cpbk_time_range.range_flag,
                        "total": 0,
                        "tree_key": cpbk_vm.cpbk_tree_vm.tree_key,
                        "tree_title": cpbk_vm.cpbk_tree_vm.tree_title
                    };

                    storage.setItem('sszhxt-znsb-cpbk', storage_item, 0.5);
                    return;
                }

                if (!this.change_page)
                    this.table_pagination.current = 1;

                let ret_data = [];
                let temp = (this.table_pagination.current - 1) * this.table_pagination.pageSize + 1;
                avalon.each(result.data.currentElements, function (index, item) {
                    ret_data[index] = item;
                    ret_data[index].table_index = temp + index; //行序号
                    ret_data[index].policeTypeName = item.policeType == "LEVAM_JYLB_JY" ? "警员" : "辅警"; //人员类别
                    ret_data[index].name_id = (item.userName || "-") + "(" + (item.userCode || "-") + ")"; //姓名（警号）
                    ret_data[index].time = moment(item.shootTime).format("YYYY-MM-DD HH:mm:ss"); //拍摄时间
                });

                if (result.data.overLimit) {
                    this.page_type = true;
                    this.table_pagination.total = result.data.limit * this.table_pagination.pageSize; //总条数
                } else {
                    this.page_type = false;
                    this.table_pagination.total = result.data.totalElements; //总条数
                }

                this.table_list = ret_data;
                this.loading = false;

                let storage_item = {
                    "ajax_data": temp_data,
                    "range_flag": cpbk_time_range.range_flag,
                    "total": this.table_pagination.total,
                    "tree_key": cpbk_vm.cpbk_tree_vm.tree_key,
                    "tree_title": cpbk_vm.cpbk_tree_vm.tree_title
                };
                storage.setItem('sszhxt-znsb-cpbk', storage_item, 0.5);
            });
        },
        name_input_enter(e) {
            let val = e.target.id;
            switch (val) {
                case 'police_id':
                    if (e.target.value != "") {
                        this.police_id_title = e.target.value;
                    } else
                        this.police_id_title = "支持名字首字母小写";
                    break;
                case 'car_num':
                    if (e.target.value != "") {
                        this.car_num_title = e.target.value;
                    } else
                        this.car_num_title = "支持模糊搜索";
                    break;
            }
            if (e.keyCode == "13")
                this.searchBtn();
        },
        close_click(e) {
            let _this = this;
            switch (e) {
                case 'police_id':
                    _this.police_id = "";
                    _this.police_id_title = "支持名字首字母小写";
                    return false;
                    break;
                case 'car_num':
                    _this.car_num = "";
                    _this.car_num_title = "支持模糊搜索";
                    return false;
                    break;
            }
        },
        input_focus(e) {
            let _this = this;
            switch (e) {
                case 'police_id':
                    _this.police_id_close = true;
                    $(".znsb_cpbk .dataFormBox .police_id").width($(".cpbk_input_panel").innerWidth() - 33);
                    break;
                case 'car_num':
                    _this.car_num_close = true;
                    $(".znsb_cpbk .dataFormBox .car_num").width($(".cpbk_input_panel").innerWidth() - 33);
                    break;
            }
        },
        input_blur(e) {
            let _this = this;
            switch (e) {
                case 'police_id':
                    _this.police_id_close = false;
                    $(".znsb_cpbk .dataFormBox .police_id").width($(".cpbk_input_panel").innerWidth() - 23);
                    break;
                case 'car_num':
                    _this.car_num_close = false;
                    $(".znsb_cpbk .dataFormBox .car_num").width($(".cpbk_input_panel").innerWidth() - 23);
                    break;
            }
        }
    }
});

let cpbk_time_range = avalon.define({
    $id: 'cpbk_time_range',
    select_time: false,
    time_range_options: [{
        value: "0",
        label: "本周"
    }, {
        value: "1",
        label: "本月"
    }, {
        value: "2",
        label: "自定义时间"
    }],
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
            cpbk_endTime_vm.end_null = "none";
            cpbk_endTime_vm.cpbk_endTime = moment().format('YYYY-MM-DD');
            cpbk_startTime_vm.start_null = "none";
            cpbk_startTime_vm.cpbk_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');
            _this.select_time = true;
        } else
            _this.select_time = false;
    }
});

let cpbk_startTime_vm = avalon.define({
    $id: "cpbk_startTime",
    cpbk_startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    handlerChange(e) {
        this.cpbk_startTime = e.target.value;
    }
});

let cpbk_endTime_vm = avalon.define({
    $id: "cpbk_endTime",
    cpbk_endTime: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.cpbk_endTime = e.target.value;
    }
});

let man_category_vm = avalon.define({
    $id: 'cpbk_man_category',
    ajax_category: "0",
    category_options: [{
        value: "0",
        label: "不限"
    }, {
        value: "LEVAM_JYLB_JY",
        label: "警员"
    }, {
        value: "LEVAM_JYLB_FJ",
        label: "辅警"
    }],
    category_val: ["0"],
    onChangeT(e) {
        let _this = this;
        _this.ajax_category = e.target.value;
    }
});

// ------------function---------------

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

        getDepTree(item.childs, dataTree[i].children);
    }
}

//日期转时间戳
function getTimeByDateStr(stringTime, end_flag) {
    var s1 = stringTime.split("-");
    var s2 = ["00", "00", "00"];

    if (end_flag == true)
        s2 = ["23", "59", "59"];

    return new Date(s1[0], s1[1] - 1, s1[2], s2[0], s2[1], s2[2]).getTime();
}