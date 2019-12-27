import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
import * as menuServer from '../../services/menuService';
var storage = require('../../services/storageService.js').ret;
import {
    Gm
} from '../common/common-tools.js';
export const name = "zfsypsjglpt-jdkp-kphczl_gongan";
require("/apps/zfsypsjglpt/zfsypsjglpt-jdkp-kphczl_jiaojing.css");
require('/apps/common/common-rate-input');

let policeType = storage.getItem('policeType');
let zhkp_vm;

function Tools() {};

function Format() {};

function Reg() {};
Tools.prototype = Object.create(new Gm().tool);
Format.prototype = Object.create(new Gm().format);
Reg.prototype = Object.create(new Gm().reg);
let Gm_tool = new Tools();
let Gm_format = new Format();
let Gm_reg = new Reg();


avalon.filters.toper = function (str) {
    if (str == '-') {
        return str
    }
    return (Number(str) * 100).toFixed(2) + '%';
}

avalon.component(name, {
    template: __inline("./zfsypsjglpt-jdkp-kphczl_gongan.html"),
    defaults: {
        showScroll: false,
        isPolice: true, // 是否为警员        
        authority: { // 按钮权限标识
            "SEARCH": true, // 查询权限
            "QZPZ": true // 权重配置权限
        },

        //人员类别
        searchForm_rylb: avalon.define({
            $id: 'kpcczl_rylb_ga',
            policeType: [''],
            searchForm_rylb_Change(e, a) {
                this.policeType[0] = e.target.value;
            }
        }),
        searchForm_timetype: avalon.define({
            $id: 'kpcczl_timetype_ga',
            timetype: ['-'],
            searchForm_timetype_Change(e, a) {
                this.timetype[0] = e.target.value;
            }
        }),
        //table
        curPage: 1,
        list: [],
        table_pagination: {
            current: 0,
            pageSize: 20,
            total: 0,
            current_len: 0,
            totalPages: 0
        },
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
            this.curPage = page;
            this.table_pagination.current = page;
            this.get_table_list();
        },

        // xx率计算描述弹窗
        zhkp_tips: avalon.define({
            $id: 'zhkp-tips-kpcczl-ga',
            show: false,
            handleCancel(e) {
                this.show = false;
            },
            handleOk() {
                this.show = false;
            }
        }),
        zhkp_tips_vm: avalon.define({
            $id: 'zhkp-tipsVm-kpcczl-ga',
            title: '算法说明'
        }),
        alert_tips() {
            this.zhkp_tips.show = true;
            if (!$('.modal-dialog').hasClass('zhkp-tips')) {
                $('.modal-dialog').addClass('zhkp-tips');
            }
        },

        // 部门树VM
        zhkp_tree: avalon.define({
            $id: "zhkp_kpcczl_tree_ga",
            zhkp_data: [],
            zhkp_value: [],
            zhkp_expandedKeys: [],
            tree_code: "",
            orgId: "",
            tree_id: "",
            tree_key: "",
            tree_title: "",
            tree_path: '',
            tree_orgCode: '',
            getSelected(key, title, e) {
                this.tree_key = key;
                this.tree_title = title;
                this.tree_code = e.path;
            },
            select_change(e, selectedKeys) {
                this.orgId = e.node.id;
            },
            extraExpandHandle(treeId, treeNode, selectedKey) {
                let deptemp_child = [];
                ajax({
                    url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.key + '&checkType=' + treeNode.checkType,
                    method: 'get',
                    data: {}
                }).then(result => {
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
        // 查询按钮
        searchBtn() {
            // Gm_tool.resetTableWidth('zcqktj-list-content', window.kpcczl_ga_table, ['zcqktj-list-header', 'zcqktj-list-header-upper']);                
            this.search_list();
        },

        // 导出按钮
        output() {
            Gm_tool.saySuccess('开发中...');
        },
        // 查询数据
        search_list() {

            if (zhkp_startTime_vm.start_null == "inline-block" || zhkp_endTime_vm.end_null == "inline-block") {
                return;
            }

            if (Gm_format.dateTransToTime(zhkp_startTime_vm.zhkp_startTime) > Gm_format.dateTransToTime(zhkp_endTime_vm.zhkp_endTime)) {
                notification.warn({
                    message: '开始时间不能晚于结束时间，请重新设置！',
                    title: '通知'
                });
                return;
            }
            let time_interval = Gm_format.dateTransToTime(zhkp_endTime_vm.zhkp_endTime) - Gm_format.dateTransToTime(zhkp_startTime_vm.zhkp_startTime);

            if (time_interval / 86400000 > 365) { //86400000 = 24 * 60 * 60 * 1000
                notification.warn({
                    message: '时间间隔不能超过一年，请重新设置！',
                    title: '通知'
                });
                return;
            }
            this.curPage = 1;
            this.table_pagination.current = 1;
            this.get_table_list();
        },
        // 获取表格数据
        get_table_list() {
            let page = this.curPage;
            let pageSize = this.table_pagination.pageSize;
            zhkp_tableObject.page(page, pageSize);
            let start_time, end_time, curTree, orgId, policeType;

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
                start_time = zhkp_startTime_vm.zhkp_startTime;
                end_time = zhkp_endTime_vm.zhkp_endTime;
            }

            orgId = zhkp_vm.zhkp_tree.tree_key || zhkp_vm.zhkp_tree.tree_id;
            policeType = zhkp_vm.searchForm_rylb.policeType[0];

            data_mid.zhkp_startTime = Gm_format.dateTransToTime(start_time);
            data_mid.zhkp_endTime = Gm_format.dateTransToTime(end_time);
            let params = {
                "page": this.curPage - 1,
                "pageSize": this.table_pagination.pageSize,
                "beginTime": Gm_format.dateTransToTime(start_time),
                "endTime": Gm_format.dateTransToTime(end_time),
                "orgId": orgId,
                "orgPath": zhkp_vm.zhkp_tree.tree_code,
                "policeType": policeType,
            };
            let url = '/gmvcs/stat/l/ga/eva/info';
            // let url = '/api/faketable.json';
            zhkp_tableObject.loading(true);

            ajax({
                url: url,
                method: 'POST',
                data: params
            }).then(result => {

                if (result.code != 0) {
                    notification.error({
                        message: '服务器后端错误，请联系管理员',
                        title: '通知'
                    });
                    zhkp_tableObject.loading(false);
                    return;
                }

                if (result.code == 0) {
                    let ret_data = [];
                    let temp = (this.curPage - 1) * this.table_pagination.pageSize + 1;
                    avalon.each(result.data.currentElements, function (index, item) {
                        ret_data[index] = {};
                        ret_data[index].index = temp + index;
                        ret_data[index].space = item.space;
                        ret_data[index].orgName = item.orgName;
                        ret_data[index].orgCode = item.orgCode;
                        ret_data[index].orgId = item.orgId;
                        ret_data[index].orgPath = item.orgPath;

                        let al = item.scccl * 100;
                        let bl = item.ywccl * 100;
                        let cl = item.jqclcctgbl * 100;
                        let dl = item.jqclccbtgbl * 100;
                        let el = item.ajclcctgbl * 100;
                        let fl = item.ajclccbtgbl * 100;

                        ret_data[index].scccl = Gm_reg.positive.test(Number(item.scccl)) ? ((al.toFixed(2)) + '%') : item.scccl;
                        ret_data[index].ywccl = Gm_reg.positive.test(Number(item.ywccl)) ? ((bl.toFixed(2)) + '%') : item.ywccl;
                        ret_data[index].jqclcctgs = item.jqclcctgs;
                        ret_data[index].jqclcctgbl = Gm_reg.positive.test(Number(item.jqclcctgbl)) ? ((cl.toFixed(2)) + '%') : item.jqclcctgbl;
                        ret_data[index].jqclccbtgs = item.jqclccbtgs;
                        ret_data[index].jqclccbtgbl = Gm_reg.positive.test(Number(item.jqclccbtgbl)) ? ((dl.toFixed(2)) + '%') : item.jqclccbtgbl;
                        ret_data[index].jqclfhqkss = item.jqclfhqkss;
                        ret_data[index].jqclfhqkbss = item.jqclfhqkbss;
                        ret_data[index].jqclfhkfqk = item.jqclfhkfqk;
                        ret_data[index].ajclcctgs = item.ajclcctgs;
                        ret_data[index].ajclcctgbl = Gm_reg.positive.test(Number(item.ajclcctgbl)) ? ((el.toFixed(2)) + '%') : item.ajclcctgbl;
                        ret_data[index].ajclccbtgs = item.ajclccbtgs;
                        ret_data[index].ajclccbtgbl = Gm_reg.positive.test(Number(item.ajclccbtgbl)) ? ((fl.toFixed(2)) + '%') : item.ajclccbtgbl;
                        ret_data[index].ajclfhqkss = item.ajclfhqkss;
                        ret_data[index].ajclfhqkbss = item.ajclfhqkbss;
                        ret_data[index].ajclfhkfqk = item.ajclfhkfqk;
                        ret_data[index].cctgl = item.cctgl;
                        ret_data[index].fhqkss = item.fhqkss;
                        ret_data[index].fhqkbss = item.fhqkbss;
                        ret_data[index].fhkfqk = item.fhkfqk;
                    });
                    this.table_pagination.total = result.data.totalElements;
                    this.table_pagination.current_len = result.data.currentElements.length;
                    this.table_pagination.totalPages = result.data.totalPages;
                    this.list = ret_data;
                    zhkp_tableObject.tableDataFnc(ret_data);
                    zhkp_tableObject.loading(false);

                    let storageData = {
                        time_range: time_range_vm.range_flag,
                        params: params,
                        current: page,
                        total: this.table_pagination.total,
                        current_len: this.table_pagination.current_len,
                        totalPages: this.table_pagination.totalPages,
                        startTime: zhkp_startTime_vm.zhkp_startTime,
                        endTime: zhkp_endTime_vm.zhkp_endTime,
                        tableList: ret_data,
                        tree_key: zhkp_vm.zhkp_tree.tree_key,
                        tree_title: zhkp_vm.zhkp_tree.tree_title,
                    };

                    storage.setItem('zfsypsjglpt-jdkp-kpcczl-ga', storageData, 0.5);
                    listenTableScrollHeight();
                    _popover();
                }
            });
        },
        actions(type, text, record, index) {
            // console.log(type);
        },
        config() {
            let hash = "/zfsypsjglpt-jdkp-kphczl_gongan";
            avalon.history.setHash(hash);
        },
        tableConfig: {
            body: 'zcqktj-list-content',
            name: 'kpcczl_ga_table_width',
            arr: ['zcqktj-list-header', 'zcqktj-list-header-upper'],
        },
        onInit(e) {
            zhkp_vm = this;
            let deptemp = [];

            ajax({
                // url: '/gmvcs/uap/org/all',
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

                let getFromStorage = !!storage.getItem('zfsypsjglpt-jdkp-kpcczl-ga'); // getFromStorage 判断是否需要初始化页面；false为重新从后台拿数据初始化，true为从Storage拿数据填充
                let storageData = storage.getItem('zfsypsjglpt-jdkp-kpcczl-ga');
                getDepTree(result.data, deptemp);

                try {
                    zhkp_vm.zhkp_tree.zhkp_data = deptemp;
                } catch (error) {

                }

                zhkp_vm.zhkp_tree.tree_id = deptemp[0].id;
                zhkp_vm.zhkp_tree.tree_code = deptemp[0].path;
                zhkp_vm.zhkp_tree.tree_key = deptemp[0].key;
                zhkp_vm.zhkp_tree.tree_title = deptemp[0].title;

                if (!getFromStorage) {
                    this.search_list();
                } else {

                    if (!!window.hadSaveConf) { // hadSaveConf 是否保存权重配置数据，true为重新更新数据，false时直接取localstorage的数据
                        // 修改权重配置后重置查询条件等数据
                        storage.removeItem('zfsypsjglpt-jdkp-kpcczl-ga');
                        time_range_vm.time_range = ["0"];
                        time_range_vm.range_flag = "0";
                        time_range_vm.select_time = false;
                        zhkp_startTime_vm.zhkp_startTime = moment().subtract(7, 'days').format('YYYY-MM-DD');
                        zhkp_endTime_vm.zhkp_endTime = moment().format('YYYY-MM-DD');
                        zhkp_vm.zhkp_tree.tree_key = deptemp[0].key;
                        zhkp_vm.zhkp_tree.tree_title = deptemp[0].title;
                        zhkp_vm.zhkp_tree.tree_id = deptemp[0].id;
                        zhkp_vm.zhkp_tree.tree_code = deptemp[0].path;
                        this.search_list();
                    } else {
                        zhkp_vm.zhkp_tree.tree_key = storageData.tree_key;
                        zhkp_vm.zhkp_tree.tree_title = storageData.tree_title;
                        zhkp_vm.zhkp_tree.tree_id = storageData.params.orgId;
                        zhkp_vm.zhkp_tree.tree_code = storageData.params.orgPath;
                        zhkp_startTime_vm.zhkp_startTime = storageData.startTime;
                        zhkp_endTime_vm.zhkp_endTime = storageData.endTime;
                        zhkp_tableObject.tableDataFnc(storageData.tableList);
                        zhkp_vm.list = storageData.tableList;
                        _popover();
                        time_range_vm.time_range = [String(storageData.time_range)];

                        if (storageData.time_range == "2") {
                            time_range_vm.select_time = true;
                        } else {
                            time_range_vm.select_time = false;
                        }

                        this.table_pagination.current = storageData.current;
                        this.table_pagination.total = storageData.total;
                        this.table_pagination.current_len = storageData.current_len;
                        this.table_pagination.totalPages = storageData.totalPages;
                        listenTableScrollHeight();
                    }
                }
                Gm_tool.rebackTableWidth(this.tableConfig);
            });

            $(".header").css({
                "min-width": "1349px"
            });

            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_JDKP_KPCCZL_GA/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询等按钮都无权限时页面留白
                    $(".zhkp_tabCont").css("top", "0px");
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_JDKP_KPCCZL_GA_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                    }
                });

                // 防止查询等按钮无权限时页面留白
                if (false == _this.authority.SEARCH)
                    $(".zhkp_tabCont").css("top", "54px");

                if (this.isPolice) {
                    // 警员屏蔽所属部门和统计对象
                    $(".zfsypsjglpt_jdkp_zhkp_jj").find(".search_box").find(".tips-img").css({
                        "right": "285px",
                        "top": "48px"
                    });
                    $('.zhkp_tabCont').css("top", "96px");
                }
            });

            titleResize();
        },
        onReady() {
            Gm_tool.makeTableDrag(this.tableConfig);
            windowResize();
            $(window).resize(function () {
                titleResize();
                windowResize();
            });
        },
        onDispose() {}
    }
});

function windowResize() {
    let v_height = $(window).height() - 96;
    let v_min_height = $(window).height() - 68;
    let menu_height = $("body")[0].clientHeight;
    if (v_height > 740) {
        $(".zfsypsjglpt_jdkp_zhkp_jj").height(v_height);
        $("#sidebar .zfsypsjglpt-menu").css("min-height", v_min_height - 68 + "px");
        if (8 == avalon.msie) {
            $("#sidebar").css("min-height", menu_height - 68 + "px");
        }
    } else {
        $(".zfsypsjglpt_jdkp_zhkp_jj").height(740);
        $("#sidebar .zfsypsjglpt-menu").css("min-height", "765px");
        if (8 == avalon.msie) {
            $("#sidebar").css("min-height", "765px");
        }
    }
}

// 防止表格出现滚动条时表格列偏移
function listenTableScrollHeight() {
    let $this = $(".zfsypsjglpt_jdkp_zhkp_jj_table .zcqktj-list-content");
    let clientHeight = $this[0].clientHeight;
    let scrollHeight = $this[0].scrollHeight;
    if (scrollHeight > clientHeight) {
        zhkp_vm.showScroll = true;
        $(".zfsypsjglpt_jdkp_zhkp_jj_table .zcqktj-list-header-upper").css({
            "padding-right": "17px"
        });
        $(".zfsypsjglpt_jdkp_zhkp_jj_table .zcqktj-list-header").css({
            "padding-right": "17px"
        });
    } else {
        zhkp_vm.showScroll = false;
        $(".zfsypsjglpt_jdkp_zhkp_jj_table .zcqktj-list-header-upper").css({
            "padding-right": "0px"
        });
        $(".zfsypsjglpt_jdkp_zhkp_jj_table .zcqktj-list-header").css({
            "padding-right": "0px"
        });
    }
}

function titleResize() {
    let width = $('.zhkp_tabCont').width();
    if (width < 1667) {
        zhkp_table.isHeaderTitle = true;
    } else {
        zhkp_table.isHeaderTitle = false;
        $('#zhkp_table_id').find('.table-index-thead').find('li').removeAttr('title');
    }
}

// let orgKey = "",
//     orgPath = "";
/**
 * 获取部门树
 * @param {部门原始数据} treelet 
 * @param {部门树} dataTree 
 */
function getDepTree(treelet, dataTree) {
    if (!treelet) {
        return;
    }

    for (let i = 0, item; item = treelet[i]; i++) {
        dataTree[i] = new Object();
        dataTree[i].title = item.orgName;
        dataTree[i].key = item.orgId; // 部门id
        dataTree[i].orgCode = item.orgCode;
        dataTree[i].path = item.path;
        dataTree[i].isParent = true;
        dataTree[i].icon = "/static/image/zfsypsjglpt/users.png";
        dataTree[i].children = new Array();
        dataTree[i].checkType = item.checkType;
        getDepTree(item.childs, dataTree[i].children);
    }
}

// tableVM
let zhkp_table = avalon.define({
    $id: "zfsypsjglpt_jdkp_kpcczl_table_ga",
    isHeaderTitle: false,
    table_loading: false,
    zhkp_table_data: [],
});

/* 主页面时间控制  start */
let time_range_vm = avalon.define({
    $id: 'zhkp_time_range_kpcczl_ga',
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
    time_status: '',
    onChangeTR(e) {
        if (e.target.value == 0) {
            this.range_flag = 0;
            this.time_status = 'last-week';
        }

        if (e.target.value == 1) {
            this.range_flag = 1;
            this.time_status = 'last-month';
        }

        if (e.target.value == 2) {
            this.range_flag = 2;
            this.time_status = 'last-past-of-time';
            zhkp_endTime_vm.end_null = "none";
            zhkp_endTime_vm.zhkp_endTime = moment().format('YYYY-MM-DD');
            zhkp_startTime_vm.start_null = "none";
            zhkp_startTime_vm.zhkp_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');
            this.select_time = true;
        } else {
            this.select_time = false;
        }
    }
});

// 开始时间VM
let zhkp_startTime_vm = avalon.define({
    $id: "zhkp_startTime_kpcczl_ga",
    start_null: "none",
    endDate: moment().format('YYYY-MM-DD'),
    zhkp_startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.zhkp_startTime = e.target.value;
        if (_this.zhkp_startTime == "") {
            _this.start_null = "inline-block";
            $(".zhkp_start_time_tip").prev().children("input").addClass("input_error");
        } else {
            _this.start_null = "none";
            $(".zhkp_start_time_tip").prev().children("input").removeClass("input_error");
        }
    }
});

// 结束时间VM
let zhkp_endTime_vm = avalon.define({
    $id: "zhkp_endTime_kpcczl_ga",
    end_null: "none",
    endDate: moment().format('YYYY-MM-DD'),
    zhkp_endTime: moment().format('YYYY-MM-DD'),
    handlerChange(e) {
        let _this = this;
        _this.zhkp_endTime = e.target.value;
        if (_this.zhkp_endTime == "") {
            _this.end_null = "inline-block";
            $(".zhkp_end_time_tip").prev().children("input").addClass("input_error");
        } else {
            _this.end_null = "none";
            $(".zhkp_end_time_tip").prev().children("input").removeClass("input_error");
        }
    }
});

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

// 表格JQ插件
require('/apps/common/common-table-index.css');
(function ($, window, document) {
    var pluginName = 'tableIndex';
    var defaults = {
        'id': 'table-index', //表格id
        'controller': 'table-index', //表格controller
        'tableObj': {}, //界面表格controller对象
        'currentPage': 1,
        'prePageSize': 20,
        'key': 'id',
        'actions': function () {}, //操作函数
        'handleSelect': function () {}, //选择事件函数
        'handleSelectAll': function () {} //选择所有事件函数
    };

    var tableIndex = function (options) {
        this.settings = $.extend({}, defaults, options);
        this.defaults = defaults;
    };
    let tableBody = {};
    tableIndex.prototype = {
        init: function () {
            var that = this;
            tableBody = avalon.define({ //表格定义组件
                $id: that.settings.controller,
                data: [],
                key: that.settings.key,
                currentPage: that.settings.currentPage,
                prePageSize: that.settings.prePageSize,
                loading: false,
                paddingRight: 0, //有滚动条时内边距
                checked: [],
                selection: [],
                isAllChecked: false,
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
                    that.settings.tableObj.handleSelectAll(e.target.checked, this.selection.$model);
                    that.settings.handleSelectAll(e.target.checked, this.selection.$model);
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
                    that.settings.tableObj.handleSelect(record.$model, checked, this.selection.$model);
                    that.settings.handleSelect(record.$model, checked, this.selection.$model);
                },
                handle: function (type, col, record, $index) { //操作函数
                    var extra = [];
                    for (var _i = 4; _i < arguments.length; _i++) {
                        extra[_i - 4] = arguments[_i];
                    }
                    var text = record[col].$model || record[col];
                    // that.settings.tableObj.actions.apply(this, [type, text, record.$model, $index].concat(extra));
                    that.settings.actions.apply(this, [type, text, record.$model, $index].concat(extra));
                },
                setForm() { //调整表格界面自适应
                    let _this = this;
                    let hg = $('#' + that.settings.id).find('.table-index-tbody').get(0);
                    if (hg && (hg.offsetHeight < hg.scrollHeight)) {
                        _this.paddingRight = 17;
                    } else if (hg && !(hg.offsetHeight < hg.scrollHeight)) {
                        _this.paddingRight = 0;
                    }
                },
                popoverX() { //title的bootstrap tooltip
                    let timer = {};
                    $("[rel=drevil]").popoverX({
                        trigger: 'manual',
                        container: 'body',
                        placement: 'top',
                        //delay:{ show: 5000},
                        //viewport:{selector: 'body',padding:0},
                        //title : '<div style="font-size:14px;">title</div>',  
                        html: 'true',
                        content: function () {
                            return '<div class="title-content">' + $(this).attr('tdval') + '</div>';
                        },
                        animation: false
                    }).on("mouseenter", function () {
                        var _this = this;
                        timer = setTimeout(function () {
                            $('div').siblings(".popover").popoverX("hide");
                            $(_this).popoverX("show");
                        }, 500);
                        $(this).siblings(".popover").on("mouseleave", function () {
                            $(_this).popoverX('hide');
                        });
                    }).on("mouseleave", function () {
                        var _this = this;
                        clearTimeout(timer);
                        setTimeout(function () {
                            if (!$(".popover:hover").length) {
                                $(_this).popoverX("hide");
                            }
                        }, 100);
                        $(".popover").on("mouseleave", function () {
                            $('.popover').hide();
                        });
                    }).on('shown.bs.popover', function () {
                        $('.popover').mouseleave(function () {
                            $('.popover').hide();
                        });
                    });
                }
            });
            that.watchFnc(tableBody);
        },
        watchFnc: function (tableBody) { //监听函数
            let _this = tableBody;
            _this.$watch('checked.length', function (newV) {
                var currentPageKeys = _this.data
                    .map(function (record) {
                        return record[_this.key];
                    });
                _this.isAllChecked = currentPageKeys
                    .filter(function (key) {
                        return _this.checked.contains(key);
                    })
                    .length == currentPageKeys.length;
            });
            _this.$watch('data', function (v) {
                _this.isAllChecked = false;
                _this.checked.clear();
                _this.selection.clear();
            });
            _this.$watch('data.length', function (v) {
                _this.isAllChecked = false;
                _this.checked.clear();
                _this.selection.clear();
            });
            _this.$watch('loading', function (v) {
                if (v) {
                    _this.data = [];
                } else {
                    _this.setForm();
                    _this.popoverX();
                }
            });
            $(window).resize(function () { //监测浏览器发生大小变化
                _this.setForm();
            });
        },
        tableDataFnc(data) { //表格数据赋值
            tableBody.data = data;
            tableBody.setForm();
            tableBody.popoverX();
        },
        loading(result) {
            tableBody.loading = result;
        },
        page(currentPage, prePageSize) { //保存当前页面的分页情况
            tableBody.currentPage = currentPage;
            tableBody.prePageSize = prePageSize;
        }
    };

    $.tableIndex_zhkp = function (opt) {
        var tableindex = new tableIndex(opt);
        tableindex.init();
        return tableindex;
    };
}(jQuery, window, document));
var tab = ['zfsypsjglpt-jdkp-jqkpQjzb-searchForm', 'zfsypsjglpt-jdkp-ajkp_gongan'];
var tab_data = {
    'zfsypsjglpt-jdkp-jqkpQjzb-searchForm': {
        bjsjEnd: '',
        bjsjStart: '',
        cjdw: '',
        glmt: 'ALL',
        jqbh: '',
        bjr: '',
        bjdh: '',
        sfdd: '',
        evaStatus: 'ALL',
        evaResult: 'ALL',
        reviewStatus: 'ALL',
        reviewResult: 'ALL',
        page: 0,
        pageSize: 20,
    },
    'zfsypsjglpt-jdkp-ajkp_gongan': {
        bjsjEnd: '',
        bjsjStart: '',
        sjdw: '',
        ajbh: '',
        ajmc: '',
        jqbh: '',
        gllb: 'ALL',
        sary: '',
        jy: '',
        evaStatus: 'ALL',
        evaResult: 'ALL',
        reviewStatus: 'ALL',
        reviewResult: 'ALL',
        page: 0,
        pageSize: 20,
    }
}

function changeStoraeProp(prop, value) {
    tab.forEach((val, index) => {
        let storagedata = storage.getItem(val);
        let copyObj = JSON.parse(JSON.stringify(tab_data[val]));
        storagedata = storagedata ? JSON.parse(storagedata) : copyObj;
        storagedata.evaStatus = copyObj.evaStatus;
        storagedata.evaResult = copyObj.evaResult;
        storagedata.reviewStatus = copyObj.reviewStatus;
        storagedata.reviewResult = copyObj.reviewResult;
        storagedata.glmt = copyObj.glmt;
        storagedata.gllb = copyObj.gllb;
        storagedata[prop] = value;
        storagedata.timeStatus = time_range_vm.time_status || 'last-week';
        storagedata.orgPath = data_mid.orgPath;
        storagedata.orgId = data_mid.orgId;
        storagedata.cjdw = data_mid.orgId;
        storagedata.sjdw = data_mid.orgId;
        storagedata.orgName = data_mid.orgName;
        storagedata.orgCode = data_mid.orgCode;
        storagedata.page = 0;
        storagedata.bjsjStart = data_mid.zhkp_startTime;
        storagedata.bjsjEnd = data_mid.zhkp_endTime;
        storage.setItem(val, JSON.stringify(storagedata), 0.5);
    });
};
let data_mid = {};
var zhkp_tableObject = $.tableIndex_zhkp({ //初始化表格jq插件
    id: 'kpcczl_table_id',
    controller: 'kpcczl_table_vm_ga',
    currentPage: 1,
    prePageSize: 20,
    actions: function (type, text, record, index, mark) {

        // if (text == 0) {
        //     Gm_tool.sayWarn('暂无数据');
        //     return;
        // }

        Object.keys(record).forEach((val, key) => {
            data_mid[val] = record[val];
        });

        window.checkChildren_ga = data_mid.orgId == zhkp_vm.zhkp_tree.tree_key ? false : true;

        // 警情考评结果
        if (type == 'jqkpjg') {
            switch (mark) {
                case 'jq_passed':
                    changeStoraeProp('evaResult', '1');
                    break;
                case 'jq_no_passed':
                    changeStoraeProp('evaResult', '0');
                    break;
            }
            setHash('jq');
            return;
        }

        // 案件考评结果
        if (type == 'ajkpjg') {
            switch (mark) {
                case 'aj_passed':
                    changeStoraeProp('evaResult', '1');
                    break;
                case 'aj_no_passed':
                    changeStoraeProp('evaResult', '0');
                    break;
            }
            setHash('aj');
            return;
        }

        // 核查结果
        if (type == 'fhqk') {
            checksDialog.show = true;
            checksDialog._setData = arguments;
        }

        // 核查结果 - 警情
        if (type == 'fhqk_jq') {
            switch (mark) {
                case 'real':
                    changeStoraeProp('reviewResult', '1');
                    break;
                case 'no_real':
                    changeStoraeProp('reviewResult', '0');
                    break;
            }
            setHash('jq');
            return;
        }

        // 核查结果 - 案件
        if (type == 'fhqk_aj') {
            switch (mark) {
                case 'real':
                    changeStoraeProp('reviewResult', '1');
                    break;
                case 'no_real':
                    changeStoraeProp('reviewResult', '0');
                    break;
            }
            setHash('aj');
            return;
        }

        function setHash(hash) {
            switch (hash) {
                case 'jq':
                    avalon.history.setHash('/zfsypsjglpt-jdkp-jqkp_gongan');
                    break;
                case 'aj':
                    avalon.history.setHash('/zfsypsjglpt-jdkp-ajkp_gongan');
                    break;
            }
        }

        return

        if (type == 'sgcl') {

            switch (mark) {
                case 'sg_passed':
                    changeStoraeProp('evaResult', '1');
                    break;
                case 'sg_no_passed':
                    changeStoraeProp('evaResult', '0');
                    break;
                case 'sg_real':
                    changeStoraeProp('reviewResult', '1');
                    break;
                case 'sg_no_real':
                    changeStoraeProp('reviewResult', '0');
                    break;

            }
            avalon.history.setHash('/zfsypsjglpt-jdkp-ajkp_gongan');
            return;
        };




        switch (mark) {
            case 'jt_passed':
                changeStoraeProp('evaResult', '1');
                break;
            case 'jt_no_passed':
                changeStoraeProp('evaResult', '0');
                break;
            case 'jt_real':
                changeStoraeProp('reviewResult', '1');
                break;
            case 'jt_no_real':
                changeStoraeProp('reviewResult', '0');
                break;
        }

        avalon.history.setHash('/zfsypsjglpt-jdkp-jqkp_gongan');
    }
});

// xx率计算描述弹窗
let checksDialog = avalon.define({
    $id: 'checks-dialog',
    show: false,
    title: '选择业务',
    handleCancel() {
        this.show = false;
    },
    handCick(type) {
        this._setData[0] = type;
        this.show = false;
        zhkp_tableObject.settings.actions(this._setData[0], this._setData[1], this._setData[2], this._setData[3], this._setData[4]);
    },
    _setData: []
});