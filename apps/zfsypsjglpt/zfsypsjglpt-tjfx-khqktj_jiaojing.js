import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
import * as menuServer from '../../services/menuService';
var storage = require('../../services/storageService').ret;
import '/services/filterService';
import {
    apiUrl
} from '/services/configService';
import {
    Gm
} from '../common/common-tools';

function Tools() {};
Tools.prototype = Object.create(new Gm().tool);
let Gm_tool = new Tools();

export const name = "zfsypsjglpt-tjfx-khqktj_jiaojing";
import '../common/common-ms-table/common-ms-table';
require("/apps/zfsypsjglpt/zfsypsjglpt-tjfx-khqktj_jiaojing.css");
require('/apps/common/common-rate-input');
require('/apps/common/common-org-breadcrumb');

let policeType = storage.getItem('policeType');
let zhkp_vm;

avalon.component(name, {
    template: __inline("./zfsypsjglpt-tjfx-khqktj_jiaojing.html"),
    defaults: {
        isSearch: true, // 是否点击查询按钮
        currentTable: 'main',
        btnName: '权重配置',
        tableLoading: false,
        tableShowObj: { // 表格显示对象
            tableMain: true,
            tableJdqk: false, // 建档情况
            tableSyqk: false, // 使用情况
            tableScqk: false, // 时长情况
            tableCcqk: false, // 抽查关联情况
            tableGlqk: false // 关联情况
        },
        tableToggle: false, // 人员列是否显示
        tdWidth: 0,
        showScroll: false,
        isPolice: true, // 是否为警员        
        authority: { // 按钮权限标识
            "SEARCH": false, // 查询权限
            "QZPZ": false, // 权重配置权限
            "EXPORT": false // 导出
        },
        configPoint: {
            jdlkh: 0,
            sylkh: 0,
            sclkh: 0,
            gllkh: 0,
            cclkh: 0,
        },
        curPage: 1,
        list: [],
        loading: false,
        table_pagination: {
            current: 0,
            pageSize: 20,
            total: 0,
            current_len: 0,
            totalPages: 0
        },
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
                let orgObj = storage.getItem('tjfx-khqktj-breadcrumb-obj');
                countType.curType = '0'; // 首页查当前部门
                this.search_list(orgObj, 'main', true);
            } else {
                this.search_list(item, 'main');
            }
            this.isSearch = false;
        },
        // 表格行点击事件
        rowClick(item, type) {
            if (!item.parentOrgId && 'main' != type) {
                return;
            }
            this.currentTable = type;
            $(".popover").hide();
            countType.curType = '1'; // 查下级部门

            for (let i in this.tableShowObj) {
                this.tableShowObj[i] = false;
            }
            switch (type) {
                case 'main':
                    this.tableShowObj.tableMain = true;
                    break;
                case 'jdqk':
                    this.tableShowObj.tableJdqk = true;
                    break;
                case 'syqk':
                    this.tableShowObj.tableSyqk = true;
                    break;
                case 'scqk':
                    this.tableShowObj.tableScqk = true;
                    break;
                case 'glqk':
                    this.tableShowObj.tableGlqk = true;
                    break;
                case 'ccqk':
                    this.tableShowObj.tableCcqk = true;
                    break;
            }

            if(type == 'main') {
                this.isSearch = false;
            }

            this.search_list(item, type);
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
            $id: 'zhkp-tips',
            show: false,
            handleCancel(e) {
                this.show = false;
            },
            handleOk() {
                this.show = false;
            }
        }),
        zhkp_tips_vm: avalon.define({
            $id: 'zhkp-tipsVm',
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
            $id: "zhkp_jj_tree",
            zhkp_data: [],
            zhkp_value: [],
            zhkp_expandedKeys: [],
            tree_code: "",
            orgId: "",
            orgPath: "",
            tree_id: "",
            tree_key: "",
            tree_title: "",
            getSelected(key, title, e) {
                this.tree_key = key;
                this.tree_title = title;
                this.tree_code = e.path;
            },
            select_change(e, selectedKeys) {
                this.orgId = e.node.id;
                this.orgPath = e.node.path;
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
        // 导出按钮
        exportBtn() {
            let start_time, end_time, orgId, orgPath, target, timeType, months, police_type;

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

            let a = moment(start_time);
            let b = moment(end_time);
            let days = b.diff(a, 'days') + 1;

            // let end_time_data = "";
            // if (time_range_vm.range_flag == "0") {
            //     if (moment().format('d') == "0") {
            //         start_time = getTimeByDateStr(moment().day(-6).format('YYYY-MM-DD'));
            //         end_time = moment().day(0).format('YYYY-MM-DD');
            //     } else {
            //         start_time = getTimeByDateStr(moment().day(1).format('YYYY-MM-DD'));
            //         end_time = moment().day(7).format('YYYY-MM-DD');
            //     }
            //     end_time_data = getTimeByDateStr(end_time, true);
            //     timeType = 0;
            // }

            // if (time_range_vm.range_flag == "1") {
            //     start_time = getTimeByDateStr(moment().startOf('month').format('YYYY-MM-DD'));
            //     end_time = moment().endOf('month').format('YYYY-MM-DD');
            //     end_time_data = getTimeByDateStr(end_time, true);
            //     timeType = 1;
            // }
            // months = 1;

            // if (time_range_vm.range_flag == "2") {
            //     start_time = zhkp_startTime_vm.zhkp_startTime;
            //     end_time = zhkp_endTime_vm.zhkp_endTime;
            //     end_time_data = end_time;
            //     timeType = 1;
            //     let a = moment(zhkp_startTime_vm.zhkp_time_val);
            //     let b = moment(zhkp_endTime_vm.zhkp_time_val);
            //     months = b.diff(a, 'months') + 1;
            // }
            orgId = zhkp_vm.zhkp_tree.tree_key || zhkp_vm.zhkp_tree.tree_id;
            orgPath = zhkp_vm.zhkp_tree.tree_code;
            target = countType.curType;
            police_type = manType.curType;

            let temp_data = {
                "orgId": orgId,
                "orgPath": orgPath,
                "policeType": policeType,
                "days": days,
                "beginTime": getTimeByDateStr(start_time),
                "endTime": getTimeByDateStr(end_time, true),
                // "beginTime": start_time,
                // "endTime": end_time_data,
                "timeType": 0,
                "months": 0
            };
            if ('main' == this.currentTable) {
                temp_data.target = target;
            }
            if (police_type !== "0") {
                temp_data.policeType = police_type;
            } else {
                temp_data.policeType = "";
            }

            let baseUrl = '';
            switch (this.currentTable) {
                case 'main':
                    baseUrl = '/gmvcs/stat/l/eva/complete/info/exportByDept';
                    break;
                case 'jdqk':
                    baseUrl = '/gmvcs/stat/l/eva/complete/fileCreate/info/exportByExcel';
                    break;
                case 'syqk':
                    baseUrl = '/gmvcs/stat/l/eva/complete/usage/info/exportByExcel';
                    break;
                case 'scqk':
                    baseUrl = '/gmvcs/stat/l/eva/complete/duration/info/exportByExcel';
                    break;
                case 'glqk':
                    baseUrl = '/gmvcs/stat/l/eva/complete/match/info/exportByExcel';
                    break;
                case 'ccqk':
                    baseUrl = '/gmvcs/stat/l/eva/complete/spotCheck/info/exportByExcel';
                    break;
            }

            // let baseUrl = countType.curType === "-1" ? '/gmvcs/stat/l/eva/complete/info/exportByUser' : '/gmvcs/stat/l/eva/complete/info/exportByDept';
            let downURL = "http://" + window.location.host + apiUrl + baseUrl + '?' + encodeSearchParams(temp_data); //远程服务器使用
            window.location.href = downURL; //远程服务器使用
        },
        // 查询按钮
        searchBtn() {
            countType.curType = '0'; // 查当前部门
            this.isSearch = true;
            this.search_list();
        },
        // 查询数据
        search_list(item, type, breadcrumbMainClick) {
            if (zhkp_startTime_vm.start_null == "inline-block" || zhkp_endTime_vm.end_null == "inline-block") {
            // if (getTimeByDateStr(zhkp_startTime_vm.zhkp_startTime) > getTimeByDateStr(zhkp_endTime_vm.zhkp_endTime)) {
                return;
            }

            if (getTimeByDateStr(zhkp_startTime_vm.zhkp_startTime) > getTimeByDateStr(zhkp_endTime_vm.zhkp_endTime)) {
                notification.warn({
                    message: '开始时间不能晚于结束时间，请重新设置！',
                    title: '通知'
                });
                return;
            }
            let time_interval = getTimeByDateStr(zhkp_endTime_vm.zhkp_endTime) - getTimeByDateStr(zhkp_startTime_vm.zhkp_startTime);

            // let time_interval = zhkp_endTime_vm.zhkp_endTime - zhkp_startTime_vm.zhkp_startTime;

            if (time_interval / 86400000 > 365) { //86400000 = 24 * 60 * 60 * 1000
                notification.warn({
                    message: '时间间隔不能超过一年，请重新设置！',
                    title: '通知'
                });
                return;
            }
            this.curPage = 1;
            this.table_pagination.current = 1;
            this.get_table_list(item, type, breadcrumbMainClick);
        },
        // 获取表格数据
        get_table_list(item, type, breadcrumbMainClick) {
            if (!type) {
                this.list = [];
            }
            let page = this.curPage;

            // 统计对象为人员是列表显示人员列
            this.tableToggle = countType.curType === "-1";

            let start_time, end_time, orgId, orgPath, target, timeType, months, police_type;
            // let end_time_data = "";

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


            // if (time_range_vm.range_flag == "0") {
            //     if (moment().format('d') == "0") {
            //         start_time = getTimeByDateStr(moment().day(-6).format('YYYY-MM-DD'));
            //         end_time = moment().day(0).format('YYYY-MM-DD');
            //     } else {
            //         start_time = getTimeByDateStr(moment().day(1).format('YYYY-MM-DD'));
            //         end_time = moment().day(7).format('YYYY-MM-DD');
            //     }
            //     end_time_data = getTimeByDateStr(end_time, true);
            //     timeType = 0;
            // }

            // if (time_range_vm.range_flag == "1") {
            //     start_time = getTimeByDateStr(moment().startOf('month').format('YYYY-MM-DD'));
            //     end_time = moment().endOf('month').format('YYYY-MM-DD');
            //     end_time_data = getTimeByDateStr(end_time, true);
            //     timeType = 1;
            // }
            // months = 1;

            // if (time_range_vm.range_flag == "2") {
            //     start_time = zhkp_startTime_vm.zhkp_startTime;
            //     end_time = zhkp_endTime_vm.zhkp_endTime;
            //     end_time_data = end_time;
            //     timeType = 1;
            //     let a = moment(zhkp_startTime_vm.zhkp_time_val);
            //     let b = moment(zhkp_endTime_vm.zhkp_time_val);
            //     months = b.diff(a, 'months') + 1;
            // }
            let a = moment(start_time);
            let b = moment(end_time);
            let days = b.diff(a, 'days') + 1;

            orgId = zhkp_vm.zhkp_tree.tree_key || zhkp_vm.zhkp_tree.tree_id;
            orgPath = zhkp_vm.zhkp_tree.tree_code;
            target = countType.curType;
            police_type = manType.curType;

            let url;
            let params = {
                "page": this.curPage - 1,
                "pageSize": this.table_pagination.pageSize,
                "beginTime": getTimeByDateStr(start_time),
                "endTime": getTimeByDateStr(end_time, true),
                // "beginTime": start_time,
                // "endTime": end_time_data,
                // "timeType": timeType,
                // "months": months,
                "days": days,
                "target": target,
                "orgId": orgId,
                "orgPath": orgPath
            };
            switch (this.currentTable) {
                case 'main':
                    url = '/gmvcs/stat/l/eva/complete/info';
                    break;
                case 'jdqk':
                    url = '/gmvcs/stat/l/eva/complete/fileCreate/info';
                    break;
                case 'syqk':
                    url = '/gmvcs/stat/l/eva/complete/usage/info';
                    break;
                case 'scqk':
                    url = '/gmvcs/stat/l/eva/complete/duration/info';
                    break;
                case 'glqk':
                    url = '/gmvcs/stat/l/eva/complete/match/info';
                    break;
                case 'ccqk':
                    url = '/gmvcs/stat/l/eva/complete/spotCheck/info';
                    break;
            }
            // url = countType.curType === "-1" ? '/gmvcs/stat/l/eva/complete/info/byUser' : '/gmvcs/stat/l/eva/complete/info';
            if (item) {
                params.orgId = item.orgId;
                params.orgPath = item.orgPath;
            }

            if (police_type !== "0") {
                params.policeType = police_type;
            } else {
                params.policeType = "";
            }
            this.loading = true;
            this.tableLoading = true;
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
                    this.loading = false;
                    this.tableLoading = false;
                    return;
                }

                if (result.code == 0) {
                    let ret_data = [];
                    let temp = (this.curPage - 1) * this.table_pagination.pageSize + 1;
                    if ('main' == this.currentTable) {
                        avalon.each(result.data.currentElements, function (index, item) {
                            ret_data[index] = {};
                            ret_data[index].index = temp + index; // 行序号
                            ret_data[index].orgName = item.orgName; // 所属部门
                            ret_data[index].orgId = item.orgId; // 所属部门ID
                            ret_data[index].orgPath = item.orgPath; // 所属部门orgPath
                            ret_data[index].parentOrgId = item.parentOrgId; // 所属部门parentOrgId
                            ret_data[index].policeTypeName = item.policeTypeName; // 人员类别
                            if (countType.curType === "-1")
                                ret_data[index].userName = item.userName + '/' + item.userCode; // 警员/警号
                            ret_data[index].totalRank = item.totalRank; // 总排名
                            ret_data[index].totalScore = item.totalScore; // 总分

                            ret_data[index].jdrate = item.fileCreatedStatInfo.rete; // 建党率
                            ret_data[index].jdpoint = item.fileCreatedStatInfo.score; // 得分
                            ret_data[index].jdrange = item.fileCreatedStatInfo.rank; // 名次

                            ret_data[index].syrate = item.usageStatInfo.rete; // 使用率
                            ret_data[index].sypoint = item.usageStatInfo.score; // 得分
                            ret_data[index].syrange = item.usageStatInfo.rank; // 名次

                            ret_data[index].scrate = item.durationStatInfo.rete; // 时长率
                            ret_data[index].scpoint = item.durationStatInfo.score; // 得分
                            ret_data[index].scrange = item.durationStatInfo.rank; // 名次

                            ret_data[index].glrate = item.matchStatInfo.rete; // 关联率
                            ret_data[index].glpoint = item.matchStatInfo.score; // 得分
                            ret_data[index].glrange = item.matchStatInfo.rank; // 名次

                            ret_data[index].ccnum = item.spotCheckStatInfo.num; // 抽查数
                            ret_data[index].ccrate = item.spotCheckStatInfo.rete; // 抽查率
                            ret_data[index].ccpoint = item.spotCheckStatInfo.score; // 得分
                            ret_data[index].ccrange = item.spotCheckStatInfo.rank; // 名次
                        });
                    } else if ('jdqk' == this.currentTable) {
                        ret_data = result.data.currentElements;
                        avalon.each(result.data.currentElements, function (index, item) {
                            ret_data[index].index = temp + index; // 行序号
                            ret_data[index].fileCreateDate = null == item.fileCreateDate ? '-' : formatDate(item.fileCreateDate);
                        });
                    } else {
                        ret_data = result.data.currentElements;
                        avalon.each(result.data.currentElements, function (index, item) {
                            ret_data[index].index = temp + index; // 行序号
                        });
                    }
                    // this.table_pagination.total = result.data.totalElements;
                    // this.table_pagination.current_len = result.data.currentElements.length;
                    // this.table_pagination.totalPages = result.data.totalPages;
                    this.table_pagination.total = result.data.totalElements;
                    this.table_pagination.current_len = result.data.currentElements.length;
                    this.table_pagination.totalPages = result.data.totalPages;

                    this.loading = false;
                    this.tableLoading = false;

                    if (type && ret_data.length > 0) {
                        zhkp_vm.zhkp_tree.tree_key = item.orgId;
                        zhkp_vm.zhkp_tree.orgPath = item.orgPath;
                        zhkp_vm.zhkp_tree.tree_code = item.orgPath;
                        zhkp_vm.zhkp_tree.tree_title = item.orgName;
                        let tempData = this.breadcrumbList.$model;
                        if(!breadcrumbMainClick) {
                            this.breadcrumbList = [];
                            tempData.push({
                                orgId: item.orgId,
                                orgPath: item.orgPath,
                                orgName: item.orgName
                            });
                            this.breadcrumbList = tempData;
                        } else {
                            this.breadcrumbList = this.breadcrumbList.splice(0, 1);
                        }
                    } else if ('main' == type && 0 == ret_data.length) {
                        let storageData = storage.getItem('zfsypsjglpt-tjfx-khqktj');
                        this.list = storageData.tableList;
                        this.table_pagination.current = storageData.current;
                        this.table_pagination.total = storageData.total;
                        this.table_pagination.current_len = storageData.current_len;
                        this.table_pagination.totalPages = storageData.totalPages;
                        this.inintTableDrag();
                        return;
                    }

                    this.list = ret_data;

                    _popover();
                    // listenTableScrollHeight();

                    this.inintTableDrag();

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
                        breadcrumbList: this.breadcrumbList,
                        isSearch: this.isSearch
                    };


                    if ('main' == this.currentTable) {
                        if(this.isSearch) {
                            let breadcrumbObj = storage.getItem('tjfx-khqktj-breadcrumb-obj');
                            this.breadcrumbList = [
                                {
                                    orgName: '首页',
                                    orgId: breadcrumbObj.orgId,
                                    orgPath: breadcrumbObj.orgPath
                                }
                            ];
                            $("#khqktj-breadcrumb").css({
                                'display': 'none'
                            });
                            $('.zfsypsjglpt_tjfx_khqktj_jj_table').css({
                                'top': '108px'
                            });
                        } else {
                            $("#khqktj-breadcrumb").css({
                                'display': 'block'
                            });
                            $('.zfsypsjglpt_tjfx_khqktj_jj_table').css({
                                'top': '148px'
                            });
                        }
                        storage.setItem('zfsypsjglpt-tjfx-khqktj', storageData, 0.5);
                    } else {
                        storage.setItem('zfsypsjglpt-tjfx-khqktj-table-detail', storageData, 0.5);
                    }
                    let tableObj =  {};
                    tableObj.showType = this.currentTable;
                    storage.setItem('tjfx-khqktj-table-obj', tableObj, 0.5);
                }
            });
        },
        inintTableDrag() {
            if (this.tableToggle) {
                Gm_tool.saveTableWidth(this.tableConfig_01.arr, this.tableConfig_01.name);
                Gm_tool.makeTableDrag(this.tableConfig_01);
                Gm_tool.rebackTableWidth(this.tableConfig_01);
            } else {
                Gm_tool.saveTableWidth(this.tableConfig_02.arr, this.tableConfig_02.name);
                Gm_tool.makeTableDrag(this.tableConfig_02);
                Gm_tool.rebackTableWidth(this.tableConfig_02);
            }
        },
        actions(type, text, record, index) {

        },
        config() {
            if ('main' == this.currentTable) {
                let hash = "/zfsypsjglpt-tjfx-khqktj-qzpz_jiaojing";
                avalon.history.setHash(hash);
            } else {
                this.currentTable = 'main';
                for (let i in this.tableShowObj) {
                    this.tableShowObj[i] = false;
                }
                this.tableShowObj.tableMain = true;
                let tableObj = {};
                tableObj.showType = this.currentTable;
                storage.setItem('tjfx-khqktj-table-obj', tableObj);
            }
        },
        getConfigInfo() {
            ajax({
                // url: '/api/jj-qzpz',
                url: '/gmvcs/stat/ge/config/info',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: '服务器后端错误，请联系管理员',
                        title: '通知'
                    });
                    return;
                }
                let data = result.data;
                // 动态改变头部
                this.configPoint = {
                    jdlkh: data.fileWeight,
                    sylkh: data.usageWeight,
                    sclkh: data.durationWeight,
                    gllkh: data.matchWeight,
                    cclkh: data.spotCheckWeight.maxPoint,
                };
            });
        },
        tableConfig_01: {
            body: 'khqktj-list-content',
            name: 'tjfx-khqktj-table_01',
            arr: ['khqktj-list-header', 'khqktj-list-header-upper']
        },
        tableConfig_02: {
            body: 'khqktj-list-content',
            name: 'tjfx-khqktj-table_02',
            arr: ['khqktj-list-header', 'khqktj-list-header-upper']
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

                let getFromStorage = !!storage.getItem('zfsypsjglpt-tjfx-khqktj'); // getFromStorage 判断是否需要初始化页面；false为重新从后台拿数据初始化，true为从Storage拿数据填充
                let storageData = storage.getItem('zfsypsjglpt-tjfx-khqktj');
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
                    // 存储面包屑第一级部门
                    let orgObj = {};
                    orgObj.orgName = zhkp_vm.zhkp_tree.tree_title;
                    orgObj.orgId = zhkp_vm.zhkp_tree.tree_key;
                    orgObj.orgPath = zhkp_vm.zhkp_tree.tree_code;
                    storage.setItem('tjfx-khqktj-breadcrumb-obj', orgObj, 0.5);
                } else {

                    if (!!window.hadSaveKhqktjConf) { // hadSaveConf 是否保存权重配置数据，true为重新更新数据，false时直接取localstorage的数据
                        // 修改权重配置后重置查询条件等数据
                        storage.removeItem('zfsypsjglpt-tjfx-khqktj');
                        time_range_vm.time_range = ["0"];
                        time_range_vm.range_flag = "0";
                        time_range_vm.select_time = false;
                        zhkp_startTime_vm.zhkp_startTime = moment().startOf('month').format('YYYY-MM-DD');
                        zhkp_endTime_vm.zhkp_endTime = moment().format('YYYY-MM-DD');
                        countType.count_value = ["0"];
                        countType.curType = "0";
                        manType.count_type = ["0"];
                        manType.curType = "0";
                        zhkp_vm.zhkp_tree.tree_key = deptemp[0].key;
                        zhkp_vm.zhkp_tree.tree_title = deptemp[0].title;

                        // 存储面包屑第一级部门
                        let orgObj = {};
                        orgObj.orgName = zhkp_vm.zhkp_tree.tree_title;
                        orgObj.orgId = zhkp_vm.zhkp_tree.tree_key;
                        orgObj.orgPath = zhkp_vm.zhkp_tree.tree_code;
                        storage.setItem('tjfx-khqktj-breadcrumb-obj', orgObj, 0.5);
                        this.search_list();
                    } else {
                        let tableObj = storage.getItem('tjfx-khqktj-table-obj');
                        switch (tableObj.showType) {
                            case 'main':
                            this.tableShowObj.tableMain = true;
                            break;
                            case 'jdqk':
                            this.tableShowObj.tableJdqk = true;
                            break;
                            case 'syqk':
                            this.tableShowObj.tableSyqk = true;
                            break;
                            case 'scqk':
                            this.tableShowObj.tableScqk = true;
                            break;
                            case 'glqk':
                            this.tableShowObj.tableGlqk = true;
                            break;
                            case 'ccqk':
                            this.tableShowObj.tableCcqk = true;
                            break;
                        }
                        this.currentTable = tableObj.showType;
                        if ('main' != tableObj.showType) {
                            storageData = storage.getItem('zfsypsjglpt-tjfx-khqktj-table-detail');
                        } else {
                            if(storageData.isSearch) {
                                $("#khqktj-breadcrumb").css({
                                    'display': 'none'
                                });
                                $('.zfsypsjglpt_tjfx_khqktj_jj_table').css({
                                    'top': '108px'
                                });
                            } else {
                                $("#khqktj-breadcrumb").css({
                                    'display': 'block'
                                });
                                $('.zfsypsjglpt_tjfx_khqktj_jj_table').css({
                                    'top': '148px'
                                });
                            }
                        }
                        let policeType = storageData.params.policeType;
                        let count_type = '';
                        if (policeType == 'LEVAM_JYLB_JY') {
                            count_type = "1";
                        } else if (e.target.value == 'LEVAM_JYLB_FJ') {
                            count_type = "2";
                        } else {
                            count_type = "0";
                        }
                        zhkp_vm.zhkp_tree.tree_key = storageData.tree_key;
                        zhkp_vm.zhkp_tree.orgPath = storageData.params.orgPath;
                        zhkp_vm.zhkp_tree.tree_code = storageData.params.orgPath;
                        zhkp_vm.zhkp_tree.tree_title = storageData.tree_title;
                        countType.count_value = [storageData.params.target];
                        this.tableToggle = countType.count_value == -1;
                        manType.count_type = [count_type];
                        zhkp_startTime_vm.zhkp_startTime = moment(storageData.startTime).format('YYYY-MM-DD');
                        zhkp_endTime_vm.zhkp_endTime = moment(storageData.endTime).format('YYYY-MM-DD');
                        zhkp_vm.list = storageData.tableList;
                        time_range_vm.time_range = [String(storageData.time_range)];
                        time_range_vm.range_flag = String(storageData.time_range);
                        this.breadcrumbList = storageData.breadcrumbList;

                        if (storageData.time_range == "2") {
                            time_range_vm.select_time = true;
                        } else {
                            time_range_vm.select_time = false;
                        }

                        this.table_pagination.current = storageData.current;
                        this.table_pagination.total = storageData.total;
                        this.table_pagination.current_len = storageData.current_len;
                        this.table_pagination.totalPages = storageData.totalPages;
                        _popover();


                        if (this.tableToggle) {
                            // Gm_tool.saveTableWidth(this.tableConfig_01.arr, this.tableConfig_01.name);
                            Gm_tool.makeTableDrag(this.tableConfig_01);
                        } else {
                            // Gm_tool.saveTableWidth(this.tableConfig_02.arr, this.tableConfig_02.name); 
                            Gm_tool.makeTableDrag(this.tableConfig_02);
                        }
                        if (this.tableToggle)
                            Gm_tool.rebackTableWidth(this.tableConfig_01);
                        else
                            Gm_tool.rebackTableWidth(this.tableConfig_02);
                    }
                }
                this.getConfigInfo();

            });

            $(".header").css({
                "min-width": "1454px"
            });

            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_TJFX_KHQKTJ/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询等按钮都无权限时页面留白
                    $(".zhkp_tabCont").css("top", "0px");
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_TJFX_KHQKTJ_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                        case "AUDIO_FUNCTION_TJFX_KHQKTJ_QZPZ":
                            _this.authority.QZPZ = true;
                            break;
                        case "AUDIO_FUNCTION_TJFX_KHQKTJ_EXPORT":
                            _this.authority.EXPORT = true;
                            break;
                    }
                });

                if (this.isPolice) {
                    // 警员屏蔽所属部门和统计对象
                    $(".zfsypsjglpt_tjfx_khqktj").find(".search_box").find(".tips-img").css({
                        "right": "400px",
                        "top": "14px"
                    });
                    // $('.zfsypsjglpt_tjfx_khqktj_jj_table').css("top", "96px");
                }
                // 防止查询等按钮无权限时页面留白
                if (false == _this.authority.SEARCH)
                    $(".zfsypsjglpt_tjfx_khqktj_jj_table").css("top", "54px");
                if (!_this.authority.SEARCH && !_this.authority.QZPZ && !_this.authority.EXPORT)
                    $(".zfsypsjglpt_tjfx_khqktj_jj_table").css("top", "0px");
            });

            this.$watch('currentTable', (newVal) => {
                _this.btnName = 'main' == newVal ? '权重配置' : '返回';

                let storageData = storage.getItem('zfsypsjglpt-tjfx-khqktj');
                if ('main' == _this.currentTable) {
                    let policeType = storageData.params.policeType;
                    let count_type = '';
                    if (policeType == 'LEVAM_JYLB_JY') {
                        count_type = "1";
                    } else if (e.target.value == 'LEVAM_JYLB_FJ') {
                        count_type = "2";
                    } else {
                        count_type = "0";
                    }
                    zhkp_vm.zhkp_tree.tree_key = storageData.tree_key;
                    zhkp_vm.zhkp_tree.orgPath = storageData.params.orgPath;
                    zhkp_vm.zhkp_tree.tree_code = storageData.params.orgPath;
                    zhkp_vm.zhkp_tree.tree_title = storageData.tree_title;
                    countType.count_value = [storageData.params.target];
                    _this.tableToggle = countType.count_value == -1;
                    manType.count_type = [count_type];
                    zhkp_startTime_vm.zhkp_startTime = moment(storageData.startTime).format('YYYY-MM-DD');
                    zhkp_endTime_vm.zhkp_endTime = moment(storageData.endTime).format('YYYY-MM-DD');
                    time_range_vm.time_range = [String(storageData.time_range)];
                    _this.breadcrumbList = storageData.breadcrumbList;
                    _this.list = storageData.tableList;

                    if (_this.tableToggle) {
                        Gm_tool.makeTableDrag(_this.tableConfig_01);
                        Gm_tool.rebackTableWidth(_this.tableConfig_01);
                    } else {
                        Gm_tool.makeTableDrag(_this.tableConfig_02);
                        Gm_tool.rebackTableWidth(_this.tableConfig_02);
                    }

                    if (storageData.time_range == "2") {
                        time_range_vm.select_time = true;
                    } else {
                        time_range_vm.select_time = false;
                    }

                    _this.table_pagination.current = storageData.current;
                    _this.table_pagination.total = storageData.total;
                    _this.table_pagination.current_len = storageData.current_len;
                    _this.table_pagination.totalPages = storageData.totalPages;
                    _popover();

                    _this.getConfigInfo();
                }
            });
        },
        onReady() {
            // Gm_tool.makeTableDrag(this.tableConfig);
            if (this.tableToggle)
                Gm_tool.makeTableDrag(this.tableConfig_01);
            else
                Gm_tool.makeTableDrag(this.tableConfig_02);
            windowResize();
            $(window).resize(function () {
                windowResize();
            });
        },
        onDispose() {
            $(".header").css({
                "min-width": "1349px"
            });
        }
    }
});

function windowResize() {
    let v_height = $(window).height() - 96;
    let v_min_height = $(window).height() - 68;
    let menu_height = $("body")[0].clientHeight;
    if (v_height > 740) {
        $(".zfsypsjglpt_tjfx_khqktj").height(v_height);
        $("#sidebar .zfsypsjglpt-menu").css("min-height", v_min_height - 68 + "px");
        if (8 == avalon.msie) {
            $("#sidebar").css("min-height", menu_height - 68 + "px");
        }
    } else {
        $(".zfsypsjglpt_tjfx_khqktj").height(740);
        $("#sidebar .zfsypsjglpt-menu").css("min-height", "765px");
        if (8 == avalon.msie) {
            $("#sidebar").css("min-height", "765px");
        }
    }
}

// 防止表格出现滚动条时表格列偏移
function listenTableScrollHeight() {
    let $this = $(".zfsypsjglpt_tjfx_khqktj .khqktj-list-content");
    let clientHeight = $this[0].clientHeight;
    let scrollHeight = $this[0].scrollHeight;
    if (scrollHeight > clientHeight) {
        zhkp_vm.showScroll = true;
        $(".zfsypsjglpt_tjfx_khqktj .khqktj-list-header-upper").css({
            "padding-right": "17px"
        });
        $(".zfsypsjglpt_tjfx_khqktj .khqktj-list-header").css({
            "padding-right": "17px"
        });
    } else {
        zhkp_vm.showScroll = false;
        $(".zfsypsjglpt_tjfx_khqktj .khqktj-list-header-upper").css({
            "padding-right": "0px"
        });
        $(".zfsypsjglpt_tjfx_khqktj .khqktj-list-header").css({
            "padding-right": "0px"
        });
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
    $id: "zfsypsjglpt_jdkp_zhkp_table",
    isHeaderTitle: false,
    table_loading: false,
    zhkp_table_data: [],
});
// 人员类别VM
let manType = avalon.define({
    $id: 'manType',
    curType: "0",
    count_type: ["0"],
    count_type_options: [{
        value: "0",
        label: "不限"
    }, {
        value: "1",
        label: "警员"
    }, {
        value: "2",
        label: "辅警"
    }],
    onChangeType(e) {
        let _this = this;

        if (e.target.value == '1') {
            _this.curType = "LEVAM_JYLB_JY";
        } else if (e.target.value == '2') {
            _this.curType = "LEVAM_JYLB_FJ";
        } else {
            _this.curType = "0";
        }
    }
});

// 统计对象VM
let countType = avalon.define({
    $id: 'countType',
    curType: "0",
    count_value: ["0"],
    count_type_options: [{
        value: "0",
        label: "当前部门"
    }, {
        value: "1",
        label: "下级部门"
    }, {
        value: "-1",
        label: "人员"
    }],
    onChangeType(e) {
        let _this = this;
        _this.curType = e.target.value;
    }
});

/* 主页面时间控制  start */
let time_range_vm = avalon.define({
    $id: 'zhkp_time_range',
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
        if (e.target.value == 0) {
            this.range_flag = 0;
            zhkp_endTime_vm.end_null = "none";
            zhkp_startTime_vm.start_null = "none";
        }

        if (e.target.value == 1) {
            this.range_flag = 1;
            zhkp_endTime_vm.end_null = "none";
            zhkp_startTime_vm.start_null = "none";
        }

        if (e.target.value == 2) {
            this.range_flag = 2;
            this.select_time = true;
            zhkp_endTime_vm.end_null = "none";
            zhkp_endTime_vm.zhkp_endTime = moment().format('YYYY-MM-DD');
            zhkp_startTime_vm.start_null = "none";
            zhkp_startTime_vm.zhkp_startTime = moment().subtract(3, 'month').format('YYYY-MM-DD');

            // zhkp_startTime_vm.zhkp_time_val = moment().subtract(3, 'months').format('YYYY-MM');
            // zhkp_startTime_vm.zhkp_startTime = moment().subtract(3, 'months').startOf('month').unix() * 1000;
            // zhkp_endTime_vm.zhkp_endTime = moment().unix() * 1000;
            // zhkp_endTime_vm.zhkp_time_val = moment().format('YYYY-MM');
        } else {
            this.select_time = false;
        }
    }
});

// 开始时间VM
let zhkp_startTime_vm = avalon.define({
    $id: "zhkp_startTime",
    start_null: "none",
    endDate: moment().format('YYYY-MM-DD'),
    // zhkp_startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    zhkp_startTime: moment().startOf('month').format('YYYY-MM-DD'),

    // zhkp_time_val: moment().subtract(3, 'months').format('YYYY-MM'),
    // zhkp_startTime: moment().subtract(3, 'months').startOf('month').unix() * 1000,
    // handleTimeChange(e) {
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

        // _this.zhkp_time_val = e.target.value;
        // _this.zhkp_startTime = moment(e.target.value).startOf('month').unix() * 1000;
    }
});

// 结束时间VM
let zhkp_endTime_vm = avalon.define({
    $id: "zhkp_endTime",
    end_null: "none",
    endDate: moment().format('YYYY-MM-DD'),
    zhkp_endTime: moment().format('YYYY-MM-DD'),

    // zhkp_time_val: moment().format('YYYY-MM'),
    // zhkp_endTime: moment().unix() * 1000,
    // handleTimeChange(e) {
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

        // _this.zhkp_time_val = e.target.value;
        // let isSame = moment(moment().format('YYYY-MM')).isSame(e.target.value, 'month');
        // _this.zhkp_endTime = isSame ? moment().unix() * 1000 : moment(e.target.value).endOf('month').unix() * 1000;
    }
});
/* 主页面时间控制  end */

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


/**
 * 拼接对象为请求字符串
 * @param {Object} obj - 待拼接的对象
 * @returns {string} - 拼接成的请求字符串
 */
function encodeSearchParams(obj) {
    const params = [];

    Object.keys(obj).forEach((key) => {
        let value = obj[key];
        // 如果值为undefined我们将其置空
        if (typeof value === 'undefined') {
            value = '';
        }
        // 对于需要编码的文本（比如说中文）我们要进行编码
        params.push([key, encodeURIComponent(value)].join('='));
    });

    return params.join('&');
}