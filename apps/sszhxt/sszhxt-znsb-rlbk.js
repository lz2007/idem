import avalon from "avalon2";
import "ane";
import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
let storage = require('/services/storageService.js').ret;
let echarts = require("echarts/dist/echarts.min");
export const name = "sszhxt-znsb-rlbk";
require("/apps/sszhxt/sszhxt-znsb-rlbk.less");
import '../common/common-ms-table';
import '/services/filterService';
import * as menuServer from '../../services/menuService';

let language_txt = require('../../vendor/language').language;
let {
    languageSelect
} = require('/services/configService');

let rlbk_vm;
avalon.component(name, {
    template: __inline("./sszhxt-znsb-rlbk.html"),
    defaults: {
        included_status: false, //true 包含子部门；false 不包含子部门
        included_dep_img: "",
        included_dep_click() {
            this.included_status = !this.included_status;
        },

        police_id: "",
        police_id_title: getLan().rlbkInputTips,
        police_id_close: false,
        police_name: "",
        police_name_title: getLan().rlbkInputTips,
        police_name_close: false,

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
        checksDocData: {},

        echart_option: {
            color: ['#c2c2c2', '#be3335'].reverse(),
            series: [{
                hoverAnimation: false,
                type: 'pie',
                radius: ['80%', '100%'],
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
                    x: 35,
                    y: 70,
                    fill: '#be3335',
                    font: '32px "Microsoft YaHei", sans-serif'
                }
            }]
        },

        actions(type, text, record, index) {
            if (type == "check") {
                storage.setItem('sszhxt-znsb-rlbk-recordID', record.id);
                avalon.history.setHash("/sszhxt-znsb-rlbk-detail");
            }
            if (type == "comparison") {
                rlbk_dialog_vm.scene_img = record.shootPersonImgFilePath;
                rlbk_dialog_vm.recognition_img = record.personRegImgFilePath;
                this.rlbk_dialog_show = true;

                rlbk_vm.echart_option.series[0].data = [{
                        value: Number(record.personSimilarity).toFixed(2)
                    },
                    {
                        value: (100 - Number(record.personSimilarity)).toFixed(2)
                    }
                ];
                rlbk_vm.echart_option.graphic[0].style.text = Number(record.personSimilarity).toFixed(2) + "%";

                let echart = echarts.init(document.getElementById("show_percent"));
                echart.setOption(rlbk_vm.echart_option);
            }
        },

        rlbk_dialog_show: false,
        dialogCancel() {
            this.rlbk_dialog_show = false;
        },
        dialogOk() {
            this.rlbk_dialog_show = false;
        },

        tree_init: false,
        type_init: false,
        rlbk_language: getLan(),
        extra_class: languageSelect == "en" ? true : false,
        onInit(e) {
            rlbk_vm = e.vmodel;

            this.tree_init = false;
            this.type_init = false;
            let storage_item = storage.getItem('sszhxt-znsb-rlbk');

            this.$watch("included_status", (v) => {
                if (v)
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectYes.png?__sprite";
                else
                    this.included_dep_img = "/static/image/xtpzgl-yhgl/selectNo.png?__sprite";

            });
            this.$fire('included_status', this.included_status);

            this.$watch("tree_init", (v) => {
                if (v && this.type_init) {
                    if (storage_item)
                        this.getTableList();
                    else
                        this.searchBtn();
                }
            });
            this.$fire('tree_init', this.tree_init);

            this.$watch("type_init", (v) => {
                if (v && this.tree_init) {
                    if (storage_item)
                        this.getTableList();
                    else
                        this.searchBtn();
                }

            });
            this.$fire('type_init', this.type_init);

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
                rlbk_vm.rlbk_tree_vm.tree_data = deptemp;

                if (storage_item) {
                    rlbk_vm.rlbk_tree_vm.tree_code = storage_item.ajax_data.orgPath;
                    rlbk_vm.rlbk_tree_vm.tree_key = storage_item.tree_key;
                    rlbk_vm.rlbk_tree_vm.tree_title = storage_item.tree_title;
                } else {
                    rlbk_vm.rlbk_tree_vm.tree_code = deptemp[0].path;
                    rlbk_vm.rlbk_tree_vm.tree_key = deptemp[0].key;
                    rlbk_vm.rlbk_tree_vm.tree_title = deptemp[0].title;
                }

                this.tree_init = true;
            });

            ajax({
                url: '/gmvcs/uap/person/type/listAll',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: '获取人员类型失败，请稍后再试',
                        title: '通知'
                    });
                    return;
                }

                let ret_data = [{
                    value: "buxian",
                    label: getLan().all,
                }];

                for (let i = 0; i < result.data.length; i++) {
                    let obj = {
                        value: result.data[i].id,
                        label: result.data[i].name,
                    }
                    ret_data.push(obj);
                }

                man_type_vm.type_options = ret_data;
                if (storage_item) {
                    man_type_vm.type_val = new Array(storage_item.ajax_data.personType || "buxian");
                    man_type_vm.ajax_type = storage_item.ajax_data.personType || "buxian";
                } else {
                    man_type_vm.type_val = new Array(ret_data[0].value);
                    man_type_vm.ajax_type = ret_data[0].value;
                }

                this.type_init = true;
            });

            if (storage_item) {
                rlbk_time_range.range_flag = storage_item.range_flag;
                rlbk_time_range.time_range = new Array(storage_item.range_flag.toString());
                if (rlbk_time_range.range_flag == 2) {
                    rlbk_startTime_vm.rlbk_startTime = storage_item.ajax_data.beginTime;
                    rlbk_endTime_vm.rlbk_endTime = storage_item.ajax_data.endTime;
                    rlbk_time_range.select_time = true;
                }

                this.included_status = storage_item.ajax_data.includeChild;
                man_category_vm.ajax_category = storage_item.ajax_data.policeType || "buxian";
                man_category_vm.category_val = new Array(storage_item.ajax_data.policeType || "buxian");
                this.police_id = storage_item.ajax_data.jy || "";
                this.police_id_title = this.police_id || rlbk_vm.rlbk_language.rlbkInputTips;
                this.police_name = storage_item.ajax_data.personSpellAbbr || "";
                this.police_name_title = this.police_name || rlbk_vm.rlbk_language.rlbkInputTips;

                // this.table_pagination.total = storage_item.total;
                this.loading = true;
                this.change_page = true;
                this.search_data = storage_item.ajax_data;
                this.search_data.beginTime = getTimeByDateStr(storage_item.ajax_data.beginTime);
                this.search_data.endTime = getTimeByDateStr(storage_item.ajax_data.endTime);

                this.table_pagination.current = storage_item.ajax_data.page + 1;

                // this.getTableList();
            } else {
                rlbk_time_range.range_flag = 0;
                rlbk_time_range.time_range = ["0"];
                this.included_status = false;
                man_category_vm.ajax_category = "buxian";
                man_category_vm.category_val = ["buxian"];
                this.police_id = "";
                this.police_name = "";
                this.change_page = false;
                this.search_data = {};

                // this.searchBtn();
            }
        },
        onReady() {
            let _this = this;
            menuServer.menu.then(menu => {
                let list = menu.SSZH_MENU_SSZHXT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^INSTRUCT_FUNCTION_ZNSB_RLBK/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询无权限时页面留白
                    $(".znsb_rlbk .rlbk-table .common-list-panel").css("cssText", "position: absolute; top: 108px !important; bottom: 46px !important; left: 8px; right: 8px;");
                    return;
                }

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "INSTRUCT_FUNCTION_ZNSB_RLBK_CK":
                            _this.opt_rlbk.authority.CHECK = true;
                            break;
                        case "INSTRUCT_FUNCTION_ZNSB_RLBK_CX":
                            _this.opt_rlbk.authority.SEARCH = true;
                            break;
                    }
                });

                if (false == _this.opt_rlbk.authority.CHECK)
                    _this.opt_rlbk.authority.OPT_SHOW = true;

                // 防止查询无权限时页面留白
                if (false == _this.opt_rlbk.authority.SEARCH)
                    $(".znsb_rlbk .rlbk-table .common-list-panel").css("cssText", "position: absolute; top: 108px !important; bottom: 46px !important; left: 8px; right: 8px;");
            });
        },

        opt_rlbk: avalon.define({
            $id: "opt_rlbk",
            authority: { // 按钮权限标识
                "CHECK": false, //智能识别-人脸布控-查看
                "SEARCH": false, //智能识别-人脸布控-查询
                "OPT_SHOW": false, //操作栏显示方式
            }
        }),

        rlbk_tree_vm: avalon.define({
            $id: "rlbk_tree",
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
            if (rlbk_time_range.range_flag == "0") {
                if (moment().format('d') == "0") {
                    start_time = moment().day(-6).format('YYYY-MM-DD');
                    end_time = moment().day(0).format('YYYY-MM-DD');
                } else {
                    start_time = moment().day(1).format('YYYY-MM-DD');
                    end_time = moment().day(7).format('YYYY-MM-DD');
                }
            }

            if (rlbk_time_range.range_flag == "1") {
                start_time = moment().startOf('month').format('YYYY-MM-DD');
                end_time = moment().endOf('month').format('YYYY-MM-DD');
            }

            if (rlbk_time_range.range_flag == "2") {
                start_time = rlbk_startTime_vm.rlbk_startTime;
                end_time = rlbk_endTime_vm.rlbk_endTime;
            }

            let ajax_data = {
                "includeChild": this.included_status,
                "page": 0,
                "pageSize": this.table_pagination.pageSize,
                "orgPath": rlbk_vm.rlbk_tree_vm.curTree || rlbk_vm.rlbk_tree_vm.tree_code,
                "policeType": man_category_vm.ajax_category == "buxian" ? "" : man_category_vm.ajax_category,
                "personType": man_type_vm.ajax_type == "buxian" ? "" : man_type_vm.ajax_type,
                "beginTime": getTimeByDateStr(start_time),
                "endTime": getTimeByDateStr(end_time, true)
            };

            if (this.police_id)
                ajax_data.jy = $.trim(this.police_id);

            if (this.police_name)
                ajax_data.personSpellAbbr = $.trim(this.police_name);

            if (this.change_page) {
                ajax_data = this.search_data;
                ajax_data.page = this.table_pagination.current - 1;
            } else
                this.search_data = ajax_data;

            ajax({
                // url: '/api/recognition',
                url: '/gmvcs/instruct/face/monitoring/search/recognition',
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
                    "personType": ajax_data.personType,
                    "beginTime": start_time,
                    "endTime": end_time,
                    "jy": ajax_data.jy || "",
                    "personSpellAbbr": ajax_data.personSpellAbbr || ""
                };

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    this.table_pagination.current = 0;
                    this.table_pagination.total = 0;
                    this.table_list = [];
                    this.loading = false;

                    let storage_item = {
                        "ajax_data": temp_data,
                        "range_flag": rlbk_time_range.range_flag,
                        "total": 0,
                        "tree_key": rlbk_vm.rlbk_tree_vm.tree_key,
                        "tree_title": rlbk_vm.rlbk_tree_vm.tree_title
                    };

                    storage.setItem('sszhxt-znsb-rlbk', storage_item, 0.5);
                    return;
                }

                if (!this.change_page)
                    this.table_pagination.current = 1;

                let ret_data = [];
                let temp = (this.table_pagination.current - 1) * this.table_pagination.pageSize + 1;
                avalon.each(result.data.currentElements, function (index, item) {
                    ret_data[index] = item;
                    ret_data[index].table_index = temp + index; //行序号
                    if (languageSelect == "zhcn") {
                        ret_data[index].policeTypeName = item.policeType == "LEVAM_JYLB_JY" ? "警员" : "辅警"; //人员类别
                        ret_data[index].sex = item.personGender == 1 ? "男" : "女";
                    } else {
                        ret_data[index].policeTypeName = item.policeType == "LEVAM_JYLB_JY" ? "Police" : "Auxiliary Police"; //人员类别
                        ret_data[index].sex = item.personGender == 1 ? "Male" : "Female";
                    }
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
                    "range_flag": rlbk_time_range.range_flag,
                    "total": this.table_pagination.total,
                    "tree_key": rlbk_vm.rlbk_tree_vm.tree_key,
                    "tree_title": rlbk_vm.rlbk_tree_vm.tree_title
                };
                storage.setItem('sszhxt-znsb-rlbk', storage_item, 0.5);
            });
        },
        name_input_enter(e) {
            let val = e.target.id;
            switch (val) {
                case 'police_id':
                    if (e.target.value != "") {
                        this.police_id_title = e.target.value;
                    } else
                        this.police_id_title = rlbk_vm.rlbk_language.rlbkInputTips;
                    break;
                case 'police_name':
                    if (e.target.value != "") {
                        this.police_name_title = e.target.value;
                    } else
                        this.police_name_title = rlbk_vm.rlbk_language.rlbkInputTips;
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
                    _this.police_id_title = rlbk_vm.rlbk_language.rlbkInputTips;
                    return false;
                    break;
                case 'police_name':
                    _this.police_name = "";
                    _this.police_name_title = rlbk_vm.rlbk_language.rlbkInputTips;
                    return false;
                    break;
            }
        },
        input_focus(e) {
            let _this = this;
            switch (e) {
                case 'police_id':
                    _this.police_id_close = true;
                    $(".znsb_rlbk .dataFormBox .police_id").width($(".rlbk_input_panel").innerWidth() - 33);
                    break;
                case 'police_name':
                    _this.police_name_close = true;
                    $(".znsb_rlbk .dataFormBox .police_name").width($(".rlbk_input_panel").innerWidth() - 33);
                    break;
            }
        },
        input_blur(e) {
            let _this = this;
            switch (e) {
                case 'police_id':
                    _this.police_id_close = false;
                    $(".znsb_rlbk .dataFormBox .police_id").width($(".rlbk_input_panel").innerWidth() - 23);
                    break;
                case 'police_name':
                    _this.police_name_close = false;
                    $(".znsb_rlbk .dataFormBox .police_name").width($(".rlbk_input_panel").innerWidth() - 23);
                    break;
            }
        }
    }
});

let rlbk_time_range = avalon.define({
    $id: 'rlbk_time_range',
    select_time: false,
    time_range_options: [{
        value: "0",
        label: getLan().week
    }, {
        value: "1",
        label: getLan().month
    }, {
        value: "2",
        label: getLan().customize
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
            rlbk_endTime_vm.end_null = "none";
            rlbk_endTime_vm.rlbk_endTime = moment().format('YYYY-MM-DD');
            rlbk_startTime_vm.start_null = "none";
            rlbk_startTime_vm.rlbk_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');
            _this.select_time = true;
        } else
            _this.select_time = false;
    }
});

let rlbk_startTime_vm = avalon.define({
    $id: "rlbk_startTime",
    rlbk_startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    handlerChange(e) {
        this.rlbk_startTime = e.target.value;
    }
});

let rlbk_endTime_vm = avalon.define({
    $id: "rlbk_endTime",
    rlbk_endTime: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.rlbk_endTime = e.target.value;
    }
});

let man_category_vm = avalon.define({
    $id: 'rlbk_man_category',
    ajax_category: "buxian",
    category_options: [{
        value: "buxian",
        label: getLan().all
    }, {
        value: "LEVAM_JYLB_JY",
        label: getLan().police
    }, {
        value: "LEVAM_JYLB_FJ",
        label: getLan().auxiliaryPolice
    }],
    category_val: ["buxian"],
    onChangeT(e) {
        let _this = this;
        _this.ajax_category = e.target.value;
    }
});

let man_type_vm = avalon.define({
    $id: 'rlbk_man_type',
    ajax_type: "",
    type_options: [],
    type_val: [""],
    onChangeT(e) {
        let _this = this;
        _this.ajax_type = e.target.value;
    }
});

let rlbk_dialog_vm = avalon.define({
    $id: "rlbk_dialog",
    title: getLan().imageContrast,
    resemblance: getLan().resemblance,
    sceneImgTxt: getLan().sceneImgTxt,
    recognitionImgTxt: getLan().recognitionImgTxt,
    extra_class_dialog: languageSelect == "en" ? true : false,
    scene_img: "",
    recognition_img: ""
});

// ------------function---------------

function getLan() {
    return language_txt.sszhxt.sszhxt_znsb;
}

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