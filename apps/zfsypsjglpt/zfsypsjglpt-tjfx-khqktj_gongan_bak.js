import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
import * as menuServer from '/services/menuService';
var storage = require('/services/storageService.js').ret;
import {
    apiUrl
} from '/services/configService';

export const name = "zfsypsjglpt-tjfx-khqktj_gongan";
require("/apps/zfsypsjglpt/zfsypsjglpt-tjfx-khqktj_gongan.css");
require('/apps/common/common-rate-input');

let policeType = storage.getItem('policeType');
let zhkp_vm;
// 保留三位小数
avalon.filters.toFixed3 = function (str) {
    return str.substr(0, str.indexOf(".") + 3)
}
avalon.component(name, {
    template: __inline("./zfsypsjglpt-tjfx-khqktj_gongan.html"),
    defaults: {
        tableToggle: true,
        saveDone: false, // 保存权重配置信息后更新表格数据标志
        isPolice: true, // 是否为警员
        dsjEQRateWeight: 10, // 执法记录仪配发率权重分
        dsjUsageRateWeight: 10, // 执法记录仪使用率权重分
        videoImportOnTimeRateWeight: 10, // 执法按时导入率权重分
        psMatchRateWeight: 20, // 警情关联率权重分
        cmMatchRateWeight: 20, // 案件关联率权重分
        evaRateWeight: 10, // 基层考评率得分权重分
        legalEVAPoint: 20, // 法制考评得分权重分
        authority: { // 按钮权限标识
            "SEARCH": false, // 查询权限
            "EXPOERT": false, // 导出
            "QZPZ": false // 权重配置权限
        },
        curPage: 1,
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
            $id: 'khqktj_ga_tips',
            show: false,
            handleCancel(e) {
                this.show = false;
            },
            handleOk() {
                this.show = false;
            }
        }),
        zhkp_tips_vm: avalon.define({
            $id: 'khqktj_ga_tipsVm',
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
            $id: "zhkp_tree",
            zhkp_data: [],
            zhkp_value: [],
            zhkp_expandedKeys: [],
            tree_code: "",
            // curTree: "",
            orgId: "",
            tree_id: "",
            tree_key: "",
            tree_title: "",
            // select_change(e) {
            //     this.curTree = e.target.selection.code;
            //     this.orgId = e.target.selection.id;
            // },
            getSelected(key, title, e) {
                this.tree_key = key;
                this.tree_title = title;
                this.tree_code = e.path;
            },
            select_change(e, selectedKeys) {
                // this.curTree = e.node.path;
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
            this.search_list();
        },
        // 查询数据
        search_list() {
            if (khqktj_ga_startTime_vm.zhkp_startTime > khqktj_ga_zhkp_endTime_vm.zhkp_endTime) {
                notification.warn({
                    message: '开始时间不能晚于结束时间，请重新设置！',
                    title: '通知'
                });
                return;
            }
            let time_interval = khqktj_ga_zhkp_endTime_vm.zhkp_endTime - khqktj_ga_startTime_vm.zhkp_startTime;
            if (time_interval / 86400000 > 365) { //86400000 = 24 * 60 * 60 * 1000
                notification.warn({
                    message: '时间间隔不能超过一年，请重新设置！',
                    title: '通知'
                });
                return;
            }

            if ('-1' == khqktj_ga_count_type_vm.curType) {
                this.tableToggle = false;
            } else {
                this.tableToggle = true;
            }

            // zhkp_table.table_loading = true;
            // zhkp_tableObject.loading(true);
            this.curPage = 1;
            this.table_pagination.current = 1;
            //zhkp_table.zhkp_table_data = [];
            this.get_table_list();
        },
        // 获取表格数据
        get_table_list() {
            let page = this.curPage;
            let pageSize = this.table_pagination.pageSize;
            zhkp_tableObject.page(page, pageSize);

            let start_time, end_time, target, orgId, orgPath, end_time_data, police_type;

            if (khqktj_ga_time_range_vm.range_flag == "0") {
                if (moment().format('d') == "0") {
                    start_time = getTimeByDateStr(moment().day(-6).format('YYYY-MM-DD'));
                    end_time = moment().day(0).format('YYYY-MM-DD');
                } else {
                    start_time = getTimeByDateStr(moment().day(1).format('YYYY-MM-DD'));
                    end_time = moment().day(7).format('YYYY-MM-DD');
                }
                end_time_data = getTimeByDateStr(end_time, true);
            }

            if (khqktj_ga_time_range_vm.range_flag == "1") {
                start_time = getTimeByDateStr(moment().startOf('month').format('YYYY-MM-DD'));
                end_time = moment().endOf('month').format('YYYY-MM-DD');
                end_time_data = getTimeByDateStr(end_time, true);
            }

            if (khqktj_ga_time_range_vm.range_flag == "2") {
                start_time = khqktj_ga_startTime_vm.zhkp_startTime;
                end_time = khqktj_ga_zhkp_endTime_vm.zhkp_endTime;
                end_time_data = end_time;
            }
            orgId = zhkp_vm.zhkp_tree.tree_key || zhkp_vm.zhkp_tree.tree_id;
            target = khqktj_ga_count_type_vm.curType;

            orgPath = zhkp_vm.zhkp_tree.tree_code;
            police_type = khqktj_ga_manType.curType;
            let params = {
                "page": this.curPage - 1,
                "pageSize": this.table_pagination.pageSize,
                "beginTime": start_time,
                "endTime": end_time_data,
                "orgId": orgId,
                "orgPath": orgPath,
                "target": target
            };
            if (police_type !== "0") {
                params.policeType = police_type;
            } else {
                params.policeType = "";
            }

            let url = '/gmvcs/stat/l/ga/eva/complete';
            if ('-1' == target || this.isPolice) {
                url = '/gmvcs/stat/l/ga/eva/complete/byUser';
            }

            zhkp_tableObject.loading(true);
            ajax({
                // url: '/api/jdkp_zhkp_table',
                url: url,
                method: 'POST',
                data: params
            }).then(result => {
                // zhkp_table.table_loading = false;
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
                    if ('-1' == target) {
                        avalon.each(result.data.currentElements, function (index, item) {
                            ret_data[index] = {};
                            ret_data[index].index = temp + index; //行序号
                            ret_data[index].orgName = item.orgName; //所属部门
                            ret_data[index].userName = item.userName + "(" + item.userCode + ")"; // 警员（警号）
                            ret_data[index].zpf = item.zpf;
                            ret_data[index].zfysyldf = item.zfysyldf;
                            ret_data[index].zfypbldf = item.zfypbldf;
                            ret_data[index].spjsdrudf = item.spjsdrudf;
                            ret_data[index].jqglldf = item.jqglldf;
                            ret_data[index].ajglldf = item.ajglldf;
                            ret_data[index].jckpldf = item.jckpldf;
                            ret_data[index].fzkhdf = item.fzkhdf;
                            ret_data[index].zfysyl = item.zfysyl; // xx率 鼠标hover绿色角标时显示
                            ret_data[index].zfypbl = item.zfypbl;
                            ret_data[index].spjsdru = item.spjsdru;
                            ret_data[index].jqgll = item.jqgll;
                            ret_data[index].ajgll = item.ajgll;
                            ret_data[index].jckpl = item.jckpl;
                            ret_data[index].fzkh = item.fzkh;
                        });
                    } else {
                        avalon.each(result.data.currentElements, function (index, item) {
                            ret_data[index] = {};
                            ret_data[index].index = temp + index; //行序号
                            ret_data[index].orgName = item.orgName; //所属部门
                            ret_data[index].zpf = item.zpf;
                            ret_data[index].zfysyldf = item.zfysyldf;
                            ret_data[index].zfypbldf = item.zfypbldf;
                            ret_data[index].spjsdrudf = item.spjsdrudf;
                            ret_data[index].jqglldf = item.jqglldf;
                            ret_data[index].ajglldf = item.ajglldf;
                            ret_data[index].jckpldf = item.jckpldf;
                            ret_data[index].fzkhdf = item.fzkhdf;
                            ret_data[index].zfysyl = item.zfysyl; // xx率 鼠标hover绿色角标时显示
                            ret_data[index].zfypbl = item.zfypbl;
                            ret_data[index].spjsdru = item.spjsdru;
                            ret_data[index].jqgll = item.jqgll;
                            ret_data[index].ajgll = item.ajgll;
                            ret_data[index].jckpl = item.jckpl;
                            ret_data[index].fzkh = item.fzkh;
                        });
                    }

                    this.table_pagination.total = result.data.totalElements;
                    this.table_pagination.current_len = result.data.currentElements.length;
                    this.table_pagination.totalPages = result.data.totalPages;

                    zhkp_tableObject.tableDataFnc(ret_data);
                    zhkp_tableObject.loading(false);
                    // zhkp_table.zhkp_table_data = ret_data;

                    let storageData = {
                        time_range: khqktj_ga_time_range_vm.range_flag,
                        params: params,
                        current: page,
                        total: this.table_pagination.total,
                        current_len: this.table_pagination.current_len,
                        totalPages: this.table_pagination.totalPages,
                        startTime: khqktj_ga_startTime_vm.zhkp_startTime,
                        endTime: khqktj_ga_zhkp_endTime_vm.zhkp_endTime,
                        tableList: ret_data,
                        // orgPath: orgPath,
                        tree_key: zhkp_vm.zhkp_tree.tree_key,
                        tree_title: zhkp_vm.zhkp_tree.tree_title,
                        tableToggle: this.tableToggle
                    };

                    storage.setItem('zfsypsjglpt-tjfx-khqktj-ga', storageData, 0.5);
                    _popover();
                }
            });
        },
        // 导出按钮
        exportBtn() {
            let start_time, end_time, end_time_data, target, orgId, orgPath, police_type;

            if (khqktj_ga_time_range_vm.range_flag == "0") {
                if (moment().format('d') == "0") {
                    start_time = getTimeByDateStr(moment().day(-6).format('YYYY-MM-DD'));
                    end_time = moment().day(0).format('YYYY-MM-DD');
                } else {
                    start_time = getTimeByDateStr(moment().day(1).format('YYYY-MM-DD'));
                    end_time = moment().day(7).format('YYYY-MM-DD');
                }
                end_time_data = getTimeByDateStr(end_time, true);
            }

            if (khqktj_ga_time_range_vm.range_flag == "1") {
                start_time = getTimeByDateStr(moment().startOf('month').format('YYYY-MM-DD'));
                end_time = moment().endOf('month').format('YYYY-MM-DD');
                end_time_data = getTimeByDateStr(end_time, true);
            }

            if (khqktj_ga_time_range_vm.range_flag == "2") {
                start_time = khqktj_ga_startTime_vm.zhkp_startTime;
                end_time = khqktj_ga_zhkp_endTime_vm.zhkp_endTime;
                end_time_data = end_time;
            }

            orgId = zhkp_vm.zhkp_tree.tree_key || zhkp_vm.zhkp_tree.tree_id;
            orgPath = zhkp_vm.zhkp_tree.tree_code;
            target = khqktj_ga_count_type_vm.curType;
            police_type = khqktj_ga_manType.curType;

            let temp_data = {
                "beginTime": start_time,
                "endTime": end_time_data,
                "orgId": orgId,
                "orgPath": orgPath,
                "target": target
            };
            if (police_type !== "0") {
                temp_data.policeType = police_type;
            } else {
                temp_data.policeType = "";
            }

            let baseUrl = khqktj_ga_count_type_vm.curType === "-1" ? '/gmvcs/stat/l/ga/eva/complete/exportByUser?' : '/gmvcs/stat/l/ga/eva/complete/exportByDept?';
            let downURL = "http://" + window.location.host + apiUrl + baseUrl + encodeSearchParams(temp_data); //远程服务器使用
            window.location.href = downURL; //远程服务器使用
        },
        actions(type, text, record, index) {

        },
        config() {
            let hash = "/zfsypsjglpt-tjfx-khqktj-qzpz_gongan";
            // avalon.router.navigate(hash, 2);
            avalon.history.setHash(hash);
        },
        getConfigInfo() {
            ajax({
                // url: '/api/zhkp_qzpz',
                url: '/gmvcs/stat/ge/ga/config/info',
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

                // 数据填充
                this.dsjEQRateWeight = result.data.dsjEQRate.maxPoint;
                this.dsjUsageRateWeight = result.data.dsjUsageRate.maxPoint;
                this.videoImportOnTimeRateWeight = result.data.videoImportOnTimeRate.maxPoint;
                this.psMatchRateWeight = result.data.psMatchRate.maxPoint;
                this.cmMatchRateWeight = result.data.cmMatchRate.maxPoint;
                this.evaRateWeight = result.data.evaRate.maxPoint;
                // this.legalEVAPoint = result.data.legalEVAPoint;

                // 动态改变表头
                zhkp_table.zfypbldfTitle = '执法记录仪配发率得分（' + this.dsjEQRateWeight + '分）';
                zhkp_table.zfysyldfTitle = '执法记录仪使用率得分（' + this.dsjUsageRateWeight + '分）';
                zhkp_table.spjsdrudfTitle = '视频及时导入率得分（' + this.videoImportOnTimeRateWeight + '分）';
                zhkp_table.jqglldfTitle = '警情关联率得分（' + this.psMatchRateWeight + '分）';
                zhkp_table.ajglldfTitle = '案件关联率得分（' + this.cmMatchRateWeight + '分）';
                zhkp_table.jckpldfTitle = '考评率得分（' + this.evaRateWeight + '分）';
                // zhkp_table.fzkhdfTitle = '法制考评得分（' + this.legalEVAPoint + '分）';
            });
        },
        onInit(e) {
            this.isPolice = !policeType; // 是否为警员

            zhkp_vm = e.vmodel;
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

                let getFromStorage = !!storage.getItem('zfsypsjglpt-tjfx-khqktj-ga'); // getFromStorage 判断是否需要初始化页面；false为重新从后台拿数据初始化，true为从Storage拿数据填充
                let storageData = storage.getItem('zfsypsjglpt-tjfx-khqktj-ga');
                // if (getFromStorage) {
                //     orgPath = storageData.orgPath; // 要在getDepTree方法执行前
                // }

                getDepTree(result.data, deptemp);
                try {
                    zhkp_vm.zhkp_tree.zhkp_data = deptemp;
                } catch (error) {}
                // zhkp_vm.zhkp_tree.zhkp_value = new Array(deptemp[0].key);
                // zhkp_vm.zhkp_tree.zhkp_expandedKeys = new Array(deptemp[0].key);
                // zhkp_vm.zhkp_tree.tree_code = deptemp[0].code;
                zhkp_vm.zhkp_tree.tree_id = deptemp[0].id;
                zhkp_vm.zhkp_tree.tree_code = deptemp[0].path;
                zhkp_vm.zhkp_tree.tree_key = deptemp[0].key;
                zhkp_vm.zhkp_tree.tree_title = deptemp[0].title;
                if (!getFromStorage) {
                    this.search_list();
                } else {
                    if (!!window.hadSaveConf) { // hadSaveConf 是否保存权重配置数据，true为重新更新数据，false时直接取localstorage的数据
                        // 修改权重配置后重置查询条件等数据
                        storage.removeItem('zfsypsjglpt-tjfx-khqktj-ga');
                        khqktj_ga_time_range_vm.time_range = ["0"];
                        khqktj_ga_time_range_vm.range_flag = "0";
                        khqktj_ga_time_range_vm.select_time = false;
                        khqktj_ga_startTime_vm.zhkp_startTime = moment().subtract(7, 'days').format('YYYY-MM-DD');
                        khqktj_ga_zhkp_endTime_vm.zhkp_endTime = moment().format('YYYY-MM-DD');
                        khqktj_ga_count_type_vm.count_type = ["0"];
                        khqktj_ga_count_type_vm.curType = "0";
                        // zhkp_vm.zhkp_tree.zhkp_value = new Array(deptemp[0].key);
                        // zhkp_vm.zhkp_tree.orgId = deptemp[0].id;
                        khqktj_ga_manType.count_type = ["0"];
                        khqktj_ga_manType.curType = "0";
                        zhkp_vm.zhkp_tree.tree_key = deptemp[0].key;
                        zhkp_vm.zhkp_tree.tree_title = deptemp[0].title;
                        this.search_list();
                    } else {
                        let policeType = storageData.params.policeType;
                        let count_type = '';
                        if (policeType == 'LEVAM_JYLB_JY') {
                            count_type = "1";
                        } else if (e.target.value == 'LEVAM_JYLB_FJ') {
                            count_type = "2";
                        } else {
                            count_type = "0";
                        }
                        // if (orgKey != "") {
                        // 从localstorage拿数据填充
                        // zhkp_vm.zhkp_tree.zhkp_value = new Array(orgKey);
                        // zhkp_vm.zhkp_tree.tree_code = orgPath;
                        zhkp_vm.zhkp_tree.tree_key = storageData.tree_key;
                        zhkp_vm.zhkp_tree.tree_title = storageData.tree_title;
                        khqktj_ga_count_type_vm.count_type = [storageData.params.target];
                        khqktj_ga_manType.count_type = [count_type];
                        khqktj_ga_startTime_vm.zhkp_startTime = storageData.startTime;
                        khqktj_ga_zhkp_endTime_vm.zhkp_endTime = storageData.endTime;
                        zhkp_tableObject.tableDataFnc(storageData.tableList);

                        khqktj_ga_time_range_vm.time_range = [String(storageData.time_range)];
                        if (storageData.time_range == "2") {
                            khqktj_ga_time_range_vm.select_time = true;
                        } else {
                            khqktj_ga_time_range_vm.select_time = false;
                        }
                        this.table_pagination.current = storageData.current;
                        this.table_pagination.total = storageData.total;
                        this.table_pagination.current_len = storageData.current_len;
                        this.table_pagination.totalPages = storageData.totalPages;
                        this.tableToggle = storageData.tableToggle;
                        // } else {
                        //     notification.info({
                        //         message: '部门数据更新，已重新加载数据！',
                        //         title: '通知',
                        //         timeout: '5000'
                        //     });

                        //     khqktj_ga_time_range_vm.select_time = false;
                        //     khqktj_ga_startTime_vm.zhkp_startTime = moment().subtract(7, 'days').format('YYYY-MM-DD');
                        //     khqktj_ga_zhkp_endTime_vm.zhkp_endTime = moment().format('YYYY-MM-DD');
                        //     khqktj_ga_count_type_vm.count_type = ["0"];

                        //     this.search_list();
                        // }
                    }
                }
                this.getConfigInfo();
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
                    if (/^AUDIO_FUNCTION_JDKP_ZHKP/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询等按钮都无权限时页面留白
                    $(".zhkp_tabCont").css("top", "0px");
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_JDKP_ZHKP_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                        case "AUDIO_FUNCTION_JDKP_ZHKP_QZPZ":
                            _this.authority.QZPZ = true;
                            break;
                        case "AUDIO_FUNCTION_JDKP_ZHKP_EXPORT":
                            _this.authority.EXPOERT = true;
                            break;
                    }
                });

                // if (this.isPolice) {
                //     // 警员屏蔽所属部门和统计对象
                //     $(".zfsypsjglpt_jdkp_zhkp").find(".search_box").find(".tips-img").css({
                //         "right": "280px",
                //         "top": "14px"
                //     });
                //     $('.zhkp_tabCont').css("top", "96px");
                // }
                // 防止查询等按钮无权限时页面留白
                if (!_this.authority.SEARCH)
                    $(".zhkp_tabCont").css("top", "54px");
                if (!_this.authority.SEARCH && !_this.authority.QZPZ && _this.authority.EXPOERT)
                    $(".zhkp_tabCont").css("top", "0px");
            });

            titleResize();
        },
        onReady() {
            let v_height = $(window).height() - 96;
            let v_min_height = $(window).height() - 68;
            let menu_height = $("body")[0].clientHeight;
            if (v_height > 740) {
                $(".zfsypsjglpt_jdkp_zhkp").height(v_height);
                $("#sidebar .zfsypsjglpt-menu").css("min-height", v_min_height - 68 + "px");
                if (8 == avalon.msie) {
                    $("#sidebar").css("min-height", menu_height - 68 + "px");
                }
            } else {
                $(".zfsypsjglpt_jdkp_zhkp").height(740);
                $("#sidebar .zfsypsjglpt-menu").css("min-height", "765px");
                if (8 == avalon.msie) {
                    $("#sidebar").css("min-height", "765px");
                }
            }
            $(window).resize(function () {
                titleResize();
            });
        },
        onDispose() {}
    }
});

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
        // dataTree[i].id = item.orgId;
        // dataTree[i].code = item.path;
        // dataTree[i].key = item.orgCode;
        dataTree[i].path = item.path;
        dataTree[i].isParent = true;
        dataTree[i].icon = "/static/image/zfsypsjglpt/users.png";
        dataTree[i].children = new Array();
        dataTree[i].checkType = item.checkType;

        // if (item.path == orgPath)
        //     orgKey = item.orgCode;

        getDepTree(item.childs, dataTree[i].children);
    }
}

// tableVM
let zhkp_table = avalon.define({
    $id: "zfsypsjglpt_tjfx_khqktj_ga_table",
    isHeaderTitle: false,
    table_loading: false,
    zhkp_table_data: [],
    zfypbldfTitle: '执法记录仪配发率得分（' + avalon.components['zfsypsjglpt-tjfx-khqktj_gongan'].defaults.dsjEQRateWeight + '分）', // 括号内的分数可以变化，故要动态变化title
    zfysyldfTitle: '执法记录仪使用率得分（' + avalon.components['zfsypsjglpt-tjfx-khqktj_gongan'].defaults.dsjUsageRateWeight + '分）',
    spjsdrudfTitle: '视频及时导入率得分（' + avalon.components['zfsypsjglpt-tjfx-khqktj_gongan'].defaults.videoImportOnTimeRateWeight + '分）',
    jqglldfTitle: '警情关联率得分（' + avalon.components['zfsypsjglpt-tjfx-khqktj_gongan'].defaults.psMatchRateWeight + '分）',
    ajglldfTitle: '案件关联率得分（' + avalon.components['zfsypsjglpt-tjfx-khqktj_gongan'].defaults.cmMatchRateWeight + '分）',
    jckpldfTitle: '基层考评率得分（' + avalon.components['zfsypsjglpt-tjfx-khqktj_gongan'].defaults.evaRateWeight + '分）',
    fzkhdfTitle: '法制考评得分（' + avalon.components['zfsypsjglpt-tjfx-khqktj_gongan'].defaults.legalEVAPoint + '分）'
});

// 统计对象VM
let khqktj_ga_count_type_vm = avalon.define({
    $id: 'khqktj_ga_count_type',
    curType: "0",
    count_type: ["0"],
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
        if (e.target.value == '-1') {
            /*人员的时候增加 '警员/警号'字段*/

            /*清空表格数据*/
            // zhkp_table.zhkp_table_data=[];
        } else {
            /*部门的时候减去 '警员/警号'字段*/

            /*重新初始化部门统计对象*/
            //      	initCountObject();
            /*清空表格数据*/
            // zhkp_table.zhkp_table_data=[];
        }
    }
});

// 人员类别VM
let khqktj_ga_manType = avalon.define({
    $id: 'khqktj_ga_manType',
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

/* 主页面时间控制  start */
let khqktj_ga_time_range_vm = avalon.define({
    $id: 'khqktj_ga_time_range_vm',
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
        if (e.target.value == 0)
            this.range_flag = 0;

        if (e.target.value == 1)
            this.range_flag = 1;

        if (e.target.value == 2) {
            this.range_flag = 2;
            khqktj_ga_startTime_vm.zhkp_time_val = moment().subtract(3, 'months').format('YYYY-MM');
            khqktj_ga_startTime_vm.zhkp_startTime = moment().subtract(3, 'months').startOf('month').unix() * 1000;
            khqktj_ga_zhkp_endTime_vm.zhkp_endTime = moment().unix() * 1000;
            khqktj_ga_zhkp_endTime_vm.zhkp_time_val = moment().format('YYYY-MM');
            this.select_time = true;
        } else {
            this.select_time = false;
        }
    }
});

// 开始时间VM
let khqktj_ga_startTime_vm = avalon.define({
    $id: "khqktj_ga_startTime_vm",
    zhkp_time_val: moment().subtract(3, 'months').format('YYYY-MM'),
    zhkp_startTime: moment().subtract(3, 'months').startOf('month').unix() * 1000,
    handleTimeChange(e) {
        let _this = this;
        _this.zhkp_time_val = e.target.value;
        _this.zhkp_startTime = moment(e.target.value).startOf('month').unix() * 1000;
    }
});

// 结束时间VM
let khqktj_ga_zhkp_endTime_vm = avalon.define({
    $id: "khqktj_ga_zhkp_endTime_vm",
    zhkp_time_val: moment().format('YYYY-MM'),
    zhkp_endTime: moment().unix() * 1000,
    handleTimeChange(e) {
        let _this = this;
        _this.zhkp_time_val = e.target.value;
        let isSame = moment(moment().format('YYYY-MM')).isSame(e.target.value, 'month');
        _this.zhkp_endTime = isSame ? moment().unix() * 1000 : moment(e.target.value).endOf('month').unix() * 1000;
    }
});
/* 主页面时间控制  end */


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
                isColDrag: true, //true代表表格列宽可以拖动
                dragStorageName: 'zhkp-tableDrag-style', //表格拖动样式style存储storage名称，另外：在表格内所有元素中切记不要使用style定义样式以免造成影响
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
                    that.settings.tableObj.actions.apply(this, [type, text, record.$model, $index].concat(extra));
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
            let that = this;
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
                    that.makeTableDrag('table-index-thead', 'table-index-tbody');
                }
            });
            $(window).resize(function () { //监测浏览器发生大小变化
                _this.setForm();
            });
        },
        tableDataFnc(data) { //表格数据赋值
            let _this = this;
            tableBody.data = data;
            tableBody.setForm();
            tableBody.popoverX();
            $('.table-index-thead>li').attr('style', '');
            $('.table-index-tbody .list-null').attr('style', '');
            _this.rebackTableWidth();
            _this.makeTableDrag('table-index-thead', 'table-index-tbody');
        },
        loading(result) {
            tableBody.loading = result;
        },
        page(currentPage, prePageSize) { //保存当前页面的分页情况
            tableBody.currentPage = currentPage;
            tableBody.prePageSize = prePageSize;
        },
        makeTableDrag(head, body, arr) {
            let that = this;

            function isNullOrUndefined(obj) {
                if (typeof (obj) == "undefined" || obj == null || obj == false) {
                    return true;
                }
                return false;
            }

            function registerTableDragEvent() {

                var dragTH; //记录拖拽的列
                //第一步按下
                $('.' + head + ' li').mousedown(function (e) {

                    if ($(this).attr('parent')) {
                        return;
                    }
                    e = e || window.event;
                    if (e.offsetX > $(this).innerWidth() - 10) {
                        dragTH = $(this);
                        dragTH.mouseDown = true;
                        dragTH.oldX = e.pageX || e.clientX;
                        dragTH.oldWidth = $(this).innerWidth();
                        if ($('.' + body).find('.list-null').length > 0)
                            dragTH.listNullWidth = $('.' + body).find('.list-null').innerWidth();
                    }
                });
                //第二步 拖动
                $('.' + head + ' li').mousemove(function (e) {
                    if ($(this).attr('parent')) {
                        return;
                    }
                    //改鼠标样式
                    if (e.offsetX > $(this).innerWidth() - 10) {
                        $(this).css({
                            cursor: "e-resize"
                        });
                    } else {
                        $(this).css({
                            cursor: "default"
                        });
                    }
                    if (isNullOrUndefined(dragTH)) {
                        dragTH = $(this);
                    }
                    if (!isNullOrUndefined(dragTH.mouseDown) && dragTH.mouseDown == true) {
                        var difference = (e.pageX - dragTH.oldX) || (e.clientX - dragTH.oldX);
                        var newWidth = dragTH.oldWidth + difference; //新的宽度
                        dragTH.outerWidth(newWidth);
                        if ($('.' + body).find('.list-null').length > 0) {
                            let list_null_width = dragTH.listNullWidth + difference;
                            $('.' + body + '>li').outerWidth(list_null_width);
                        } else {
                            $('.' + body + '>li>div:nth-child(' + dragTH.attr('data-order') + ')').outerWidth(newWidth);
                        }
                        if (!dragTH.attr('son')) {
                            // return;
                        } else {
                            var dw = 0;
                            $('[son= ' + dragTH.attr('son') + ']').each(function () {
                                dw += $(this).outerWidth();
                            });
                            $('[parent=' + dragTH.attr('son') + ' ]').outerWidth(dw);
                        }
                    }
                });
                // 第三步，释放
                $(window).mouseup(function () {
                    if (dragTH && dragTH.mouseDown) {
                        dragTH.mouseDown = false;
                    }
                });
                $('.' + head + ' li').mouseup(function (e) {
                    if ($(this).attr('parent')) {
                        return;
                    }
                    dragTH.mouseDown = false;
                    if (!arr) arr = [head];
                    that.saveTableWidth(arr);
                });
                $('.' + body).scroll(function (e) {
                    // $('.' + head).css('margin-left', -e.target.scrollLeft);
                    // $('.' + head).css('margin-left', -e.target.scrollLeft);
                    if (!arr) {
                        arr = [head];
                    };
                    arr.forEach((val, key) => {
                        $('.' + val).css('margin-left', -e.target.scrollLeft);
                    });
                });
            }
            registerTableDragEvent();
            $(window).resize(function () {
                $('[parent]').each(function () {
                    let w = 0;
                    $('[son=' + $(this).attr('parent') + ']').each(function () {
                        w += $(this).outerWidth();
                    });
                    $(this).outerWidth(w);
                });
            });
        },
        saveTableWidth(arr) {
            /*
             * 该方法保存所有表头的长度数据
             * 因为组件ondispose访问不到原表格DOM
             * 所以默认在makeTableDrag中的表头mouseup事件中保存
             */
            let that = this;
            if (arr instanceof Array != true || !arr.length) {
                throw new Error('参数类型不正确');
            }
            let obj = {};
            for (let i = 0; i < arr.length; i++) {
                obj['head' + i] = [];
            };
            arr.forEach((val, key) => {
                $('.' + val + ' li').each(function (value, keyli) {
                    obj['head' + key].push($(this).outerWidth());
                });
            });
            let dragStorageName = tableBody.dragStorageName;
            storage.setItem(dragStorageName, obj, 0.5);
            // return obj;
        },
        rebackTableWidth() {
            /*
             * 该方法切换模块还原上次操作的表格长度 
             */
            let that = this;
            let dragStorageName = tableBody.dragStorageName;
            let obj = storage.getItem(dragStorageName);
            if (!obj) {
                return;
            }
            let head = 'table-index-thead',
                body = 'table-index-tbody',
                arr = [];
            if (!tableBody.debouleHead) {
                arr[0] = head;
            } else {
                arr = [].concat(tableBody.debouleHead);
            }
            //第一步复原表头
            let headWidth = 0; //记录表头总长度
            arr.forEach((val, key) => {
                $('.' + val + ' li').each(function (value, keyli) {
                    $(this).outerWidth(obj['head' + key][value]);
                    if (key == 0) headWidth = headWidth + obj['head' + key][value];
                });
            });
            //第二步复原表格
            if (!$('.' + body + ' li').length) {
                return;
            } else if ($('.' + body).find('.list-null').length > 0) { //如果表格没有数据
                $('.' + body).find('.list-null').outerWidth(headWidth - 1);
                return;
            } else {
                $('.' + body + ' li').each(function (val, key) {
                    $(this).find('.tbody').each(function (value, keydiv) {
                        $(this).outerWidth(obj['head0'][value]);
                    });
                });
            }
        }
    };

    $.tableIndex_zhkp = function (opt) {
        var tableindex = new tableIndex(opt);
        tableindex.init();
        return tableindex;
    };
}(jQuery, window, document));

var zhkp_tableObject = $.tableIndex_zhkp({ //初始化表格jq插件
    id: 'zhkp_table_id',
    controller: 'zhkp_table_vm',
    currentPage: 1,
    prePageSize: 20
});