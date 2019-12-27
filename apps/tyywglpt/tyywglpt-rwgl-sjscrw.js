import avalon from 'avalon2';
import {
    createForm,
    notification
} from "ane";
import {
    demo as demoStore
} from '../../services/storeService';
import moment from 'moment';
import ajax from '../../services/ajaxService';
import Sbzygl from '../common/common-sbzygl';
import * as menuServer from '../../services/menuService';
require('../common/common-tyywglpt.css');
require('/apps/tyywglpt/tyywglpt-rwgl.css');
const storage = require('../../services/storageService.js').ret;
export const name = 'tyywglpt-rwgl-sjscrw';
let vm = null,
    enableQuery = true,
    queryTimer = null,
    sbzygl = null;
const listHeaderName = name + "-list-header";
avalon.component(name, {
    template: __inline('./tyywglpt-rwgl-sjscrw.html'),
    defaults: {
        getWorkStationData: [],
        wsFindIndex: [],
        wsGbcode: '',
        showStatusReason: false, //是否显示失败原因下拉框
        isStationSelectMode: false, //是否为通过选择部门导致的采集工作站下拉列表获取
        isFailTypeSelectMode: false, //是否为通过选择任务状态导致的失败原因改变
        isStatusFirstChange: true, //任务状态是否为第一次进入页面时触发相应的任务状态改变事件
        taskStatusOk: false,
        failReasonOk: false,
        isDuration: false,
        timeMode: 1,
        fileName: "",
        startTime: moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD'),
        endTime: moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD'),
        dataStr: "",
        dataJson: {},
        titleTimer: "", //popover用的的定时器，代码在common-sbzygl.js
        authority: { // 按钮权限标识
            "RESET": false, //任务管理_数据上传任务_重置
            "SEARCH": false, //任务管理_数据上传任务_查询
        },
        onInit(event) {
            vm = event.vmodel;
            sbzygl = new Sbzygl(vm);
            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^UOM_FUNCTION_XTRWGL_WJSCRW_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                if (func_list.length == 0)
                    return;
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_XTRWGL_WJSCRW_RWCQ":
                            _this.authority.RESET = true;
                            break;
                        case "UOM_FUNCTION_XTRWGL_WJSCRW_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                    }
                });
                autoSetPanelTop();
            });
            this.$watch('dataJson', (v) => {
                if (v) {
                    this.current = v.page + 1;
                    this.fileName = v.fileName || "";
                    this.startTime = v.startTime ? moment(v.startTime).format('YYYY-MM-DD') : moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD');
                    this.endTime = v.endTime ? moment(v.endTime).format('YYYY-MM-DD') : moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD');
                    this.timeMode = v.timeMode;
                    this.isDuration = v.timeMode === 3;
                }
            })
        },
        onReady() {
            this.dataStr = storage.getItem(name);
            this.dataJson = this.dataStr ? JSON.parse(this.dataStr) : null;
            //表头宽度设置
            sbzygl.setListHeader(listHeaderName);
            // 部门组织树
            this.fetchOrgData(() => {
                let timer = setInterval(() => {
                    if (vm.taskStatusOk && vm.failReasonOk) {
                        vm.fetchList();
                        clearInterval(timer);
                    }
                }, 100);
            });
            // 任务状态
            this.getTaskStatus();
            // 失败原因
            this.getFailReason();
            autoSetPanelTop();
        },
        onDispose() {
            clearTimeout(queryTimer);
            clearTimeout(this.titleTimer);
            enableQuery = true;
            $('div.popover').remove();
        },
        getDefaultWorkStation(getWorkStationData, isStationSelectMode, dataJson) {
            return getWorkStationData.length > 0 ? (isStationSelectMode ? getWorkStationData[0].value : (dataJson ? dataJson.executorRid : getWorkStationData[0].value)) : null;
        },
        getDefaultStatus(getTaskStatusData, dataJson) {
            return getTaskStatusData.length > 0 ? (dataJson ? dataJson.taskStatus : getTaskStatusData[0].value) : null;
        },
        getDefaultReason(getFailReasonData, isFailTypeSelectMode, dataJson) {
            return getFailReasonData.length > 0 ? (isFailTypeSelectMode ? getFailReasonData[0].value : (dataJson ? dataJson.failType : getFailReasonData[0].value)) : null;
        },
        resetIsDisabled(checkedIsFailed, selectedRowsLength) {
            return (!checkedIsFailed || selectedRowsLength < 1) ? 'disabled' : '';
        },
        orgData: [],
        orgCode: "",
        orgPath: "",
        orgId: "",
        orgName: "",
        fetchOrgData(callback) {
            sbzygl.fetchOrgData(this.orgData, (orgData) => {
                this.orgData = orgData;
                if (orgData.length > 0) {
                    this.orgCode = this.dataJson ? this.dataJson.orgCode : this.orgData[0].code;
                    this.orgId = this.dataJson ? this.dataJson.orgId : this.orgData[0].key;
                    this.orgPath = this.dataJson ? this.dataJson.orgPath : this.orgData[0].path;
                    this.orgName = this.dataJson ? this.dataJson.orgName : orgData[0].title;
                }
                this.getWorkStation(callback);
            });
        },
        // 部门修改相应修改工作站，即根据部门id获取工作站
        orgTreeChange(e, selectedKeys) {
            this.orgId = e.node.key;
            this.orgCode = e.node.code;
            this.orgPath = e.node.path;
            this.orgName = e.node.title;
            this.isStationSelectMode = true;
            this.getWorkStation();
        },
        extraExpandHandle(treeId, treeNode, selectedKey) {
            sbzygl.fetchOrgWhenExpand(treeId, treeNode, selectedKey);
        },
        handleTimeChange(e) {
            this.timeMode = e.target.value;
            switch (e.target.value) {
                case 2:
                    this.startTime = moment().startOf('month').format('YYYY-MM-DD');
                    this.endTime = moment().endOf('month').format('YYYY-MM-DD');
                    this.isDuration = false;
                    break;
                case 3:
                    this.startTime = moment().subtract(3, 'months').format('YYYY-MM-DD');
                    this.endTime = moment().format('YYYY-MM-DD');
                    this.isDuration = true;
                    break;
                default:
                    //moment从星期天开始一个星期，所以需要加一天才能从星期一开始一个星期
                    this.startTime = moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD');
                    this.endTime = moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD');
                    this.isDuration = false;
            }
        },
        // 获取工作站
        getWorkStation: function (callback) {
            let data = {};
            data.orgId = this.orgId;
            data.orgPath = this.orgPath;
            data.page = 0;
            data.pageSize = 40;
            sjscrwAjax.ajaxGetWorkStation(data).then(ret => {
                if (ret.code !== 0) {
                    notification.error({
                        title: '通知',
                        message: '采集工作站获取失败！'
                    });
                    avalon.isFunction(callback) && callback();
                    return;
                } else if (!ret.data || !ret.data.total) {
                    this.getWorkStationData = [];
                    avalon.isFunction(callback) && callback();
                    return;
                }
                let options = [];
                let indexs = ['不限'];
                if (ret.data.total != 0) {
                    options.push({
                        "label": "不限",
                        "value": "不限"
                    });
                }
                avalon.each(ret.data.wss, function (index, el) {
                    let items = {
                        "label": el.wsName,
                        "value": el.wsId,
                        "gbcode": el.gbCode
                    };
                    options.push(items);
                    indexs.push(el.wsId);
                });
                this.getWorkStationData = options;
                this.wsFindIndex = indexs;
                avalon.isFunction(callback) && callback();
            }).fail(() => {
                avalon.isFunction(callback) && callback();
            });
        },
        //采集工作站下拉框改变回调
        handleWsChange(e) {
            let value = e.target.value;
            let index = this.wsFindIndex.indexOf(value);
            if (index >= 0) {
                this.wsGbcode = this.getWorkStationData[index].gbcode;
            } else {
                this.wsGbcode = this.dataJson ? this.dataJson.wsGbcode : '';
            }
        },
        getTaskStatusData: [],
        //获取任务状态下拉列表数据
        getTaskStatus: function () {
            sjscrwAjax.ajaxGetStatus().then(ret => {
                if (ret.code !== 0 || !ret.data || !ret.data.length) {
                    notification.error({
                        title: '通知',
                        message: '任务状态获取失败！'
                    });
                    this.taskStatusOk = true;
                    return;
                }
                let options = [];
                if (ret.data.length != 0) {
                    options.push({
                        "label": "不限",
                        "value": "不限"
                    });
                }
                avalon.each(ret.data, function (index, el) {
                    let items = {
                        "label": el.descript,
                        "value": el.id
                    };
                    options.push(items);
                });
                this.getTaskStatusData = options;
                this.taskStatusOk = true;
            }).fail(() => {
                this.taskStatusOk = true
            });
        },
        //任务状态下拉框改变回调
        handleStatusChange: function (e) {
            if (!this.isStatusFirstChange) {
                this.isFailTypeSelectMode = true;
            } else {
                this.isStatusFirstChange = false;
            }
            if (e.target.value === 5)
                this.showStatusReason = true;
            else
                this.showStatusReason = false;
        },
        // 失败原因
        failReason: null,
        getFailReasonData: [],
        //获取失败原因下拉列表数据
        getFailReason: function () {
            sjscrwAjax.ajaxGetFailReason().then(ret => {
                if (ret.code !== 0 || !ret.data || !ret.data.length) {
                    notification.error({
                        title: '通知',
                        message: '失败原因获取失败！'
                    });
                    this.failReasonOk = true;
                    return;
                }
                let options = [];
                if (ret.data.length != 0) {
                    options.push({
                        "label": "不限",
                        "value": "不限"
                    });
                }
                avalon.each(ret.data, function (index, el) {
                    let items = {
                        "label": el.descript,
                        "value": el.id
                    };
                    options.push(items);
                });
                this.getFailReasonData = options;
                this.failReasonOk = true;
            }).fail(() => {
                this.failReasonOk = true
            });
        },

        // 任务概况
        totalTask: 0,
        totalFinished: 0,
        totalQueue: 0,
        totalFail: 0,
        getTaskState: function (searchData) {
            sjscrwAjax.ajaxGetTaskState(searchData).then(ret => {
                let el = ret.data;
                this.totalTask = el.total;
                this.totalFinished = el.totalFinished;
                this.totalQueue = el.totalQueue;
                this.totalFail = el.totalFail;
            })
        },

        // 加载表格数据 begin
        list: [],
        toggleOnline: true,
        current: 1,
        //每页显示页数
        pageSize: 20,
        // 数据总量
        total: 0,
        getCurrent(current) {
            this.current = current;
        },
        //当页码改变时触发，参数current
        onChangePage(current) {
            this.current = current;
            this.fetchList();
        },
        // 查找
        $searchForm: createForm(),
        pattern: /^\d+-\d+-\d+( \d+:\d+:\d+)?$/,
        loading: true,
        isNull: false,
        query() {
            if (enableQuery) {
                this.current = 1;
                this.fetchList();
                enableQuery = false;
                queryTimer = setTimeout(() => {
                    enableQuery = true;
                }, 2000)
            }
        },
        fetchList() {
            $('div.popover').remove();
            this.$searchForm.validateFields().then(isAllValid => {
                if (isAllValid) {
                    let data = JSON.parse(JSON.stringify(this.$searchForm.record));
                    avalon.each(data, function (key, value) {
                        if (Array.isArray(value)) {
                            data[key] = value[0];
                        }
                    });
                    let searchData = {};
                    let nameReg = /^[^\\/:\*\?"<>|]+$/;
                    searchData.orgId = this.orgId;
                    searchData.fileName = $.trim(this.fileName) || null;
                    searchData.startTime = this.isDuration ? (data.startTime ? moment(data.startTime).format('X') * 1000 : null) : (this.startTime ? moment(this.startTime).format('X') * 1000 : null);
                    searchData.endTime = this.isDuration ? (data.endTime ? moment(data.endTime).add(1, 'days').subtract(1, 'seconds').format('X') * 1000 : null) : (this.endTime ? moment(this.endTime).add(1, 'days').subtract(1, 'seconds').format('X') * 1000 : null);
                    let oneYearTime = moment(searchData.endTime).subtract(1, 'days').subtract(1, 'years').add(1, 'seconds').format('X') * 1000;
                    if (!searchData.startTime && !searchData.endTime) {
                        notification.warning({
                            title: '通知',
                            message: '请选择开始时间与结束时间！'
                        });
                        return;
                    }
                    if (!searchData.startTime && searchData.endTime) {
                        notification.warning({
                            title: '通知',
                            message: '请选择开始时间！'
                        });
                        return;
                    }
                    if (searchData.startTime && !searchData.endTime) {
                        notification.warning({
                            title: '通知',
                            message: '请选择结束时间！'
                        });
                        return;
                    }
                    if (searchData.startTime && searchData.endTime && searchData.startTime >= searchData.endTime) {
                        notification.warning({
                            title: '通知',
                            message: '开始时间不能大于结束时间！'
                        });
                        return;
                    }
                    if (oneYearTime > searchData.startTime) {
                        notification.warning({
                            title: '通知',
                            message: '选择的时间跨度不能超过一年！'
                        });
                        return;
                    }
                    if (searchData.fileName && !nameReg.test(searchData.fileName)) {
                        notification.warning({
                            title: '通知',
                            message: '文件名称不能包含\\ /:*?"<>|'
                        });
                        return false;
                    }
                    let status = Number(data.taskStatus);
                    //判断status是否为NaN,null,undefined
                    if (status === status && data.taskStatus != null && data.taskStatus != undefined) {
                        searchData.taskStatus = status;
                    } else {
                        searchData.taskStatus = null;
                    }
                    let failtype = Number(data.failReason);
                    //判断failtype是否为NaN,null,undefined
                    if (failtype === failtype && data.failReason != null && data.failReason != undefined && data.taskStatus === 5) {
                        searchData.failType = failtype;
                    } else {
                        searchData.failType = null;
                    }
                    if (data.station === '不限') {
                        searchData.executorRid = null;
                        searchData.wsGbcode = '';
                    } else {
                        searchData.executorRid = data.station || null;
                        searchData.wsGbcode = searchData.executorRid ? this.wsGbcode : '';
                    }
                    this.loading = true;
                    this.checkAll = false;
                    this.selectedRowsLength = 0;
                    let storageData = JSON.parse(JSON.stringify(searchData));
                    storageData.taskStatus = storageData.taskStatus !== null ? storageData.taskStatus : '不限';
                    storageData.failType = storageData.failType !== null ? storageData.failType : '不限';
                    storageData.executorRid = storageData.executorRid !== null ? storageData.executorRid : '不限';
                    storageData.orgPath = this.orgPath;
                    storageData.orgName = this.orgName;
                    storageData.orgCode = this.orgCode;
                    storageData.timeMode = this.timeMode;
                    storageData.page = this.current - 1;
                    // 根据部门id查询任务概况(测试说先隐藏)
                    // this.getTaskState(searchData);
                    this.dataStr = JSON.stringify(storageData);
                    storage.setItem(name, this.dataStr, 0.5);
                    sjscrwAjax.ajaxGetTableList(searchData, this.current - 1, this.pageSize).then(ret => {
                        if (ret.code != 0) {
                            notification.error({
                                message: ret.msg,
                                title: '通知'
                            });
                            this.list = [];
                            this.total = 0;
                            this.loading = false;
                            this.isNull = true;
                            sbzygl.initDragList(listHeaderName);
                            return false;
                        }
                        // 没有数据
                        this.total = ret.data.totalElements;
                        if (this.total === 0 || ret.data.totalElements === null) {
                            this.total = 0;
                            this.list = [];
                            this.loading = false;
                            this.isNull = true;
                            sbzygl.initDragList(listHeaderName);
                            return false;
                        }
                        let tableList = [];

                        avalon.each(ret.data.currentElements, function (index, el) {
                            el.checked = false;
                            el.retryTime = String(el.retryTime)
                        });
                        this.list = ret.data.currentElements;
                        this.loading = false;
                        this.isNull = false;
                        sbzygl.initList();
                        sbzygl.initDragList(listHeaderName);
                    }).fail(() => {
                        this.loading = false;
                        this.list = [];
                        this.total = 0;
                        this.isNull = true;
                        sbzygl.initDragList(listHeaderName);
                    });
                }
            });
        },
        // 重启已取消任务
        checkAll: false,
        checkedIsFailed: false,
        selectedRowsLength: 0,
        // 勾选列表
        checkedData: [],
        // 全选列表
        handleCheckAll(e) {
            sbzygl.handleCheckAll(e, (list) => {
                this.checkedData = list;
                let checkedFailed = list.filter((item) => {
                    return (item.status === 5 || item.status === 6);
                });
                if (checkedFailed.length > 0 && checkedFailed.length === this.checkedData.length) {
                    this.checkedIsFailed = true;
                } else {
                    this.checkedIsFailed = false;
                }
            });
        },
        handleCheck(index, record, e) {
            sbzygl.handleCheck(index, record, e, (hasChecked, record) => {
                this.checkedData = hasChecked;
                let checkedFailed = hasChecked.filter((item) => {
                    return (item.status === 5 || item.status === 6);
                });
                if (checkedFailed.length > 0 && checkedFailed.length === this.checkedData.length) {
                    this.checkedIsFailed = true;
                } else {
                    this.checkedIsFailed = false;
                }
            });
        },
        // 重启任务
        beginTaskAgain() {
            if (this.selectedRowsLength < 1 || !this.checkedIsFailed) {
                return;
            }
            let taskAgainIdArr = [];
            avalon.each(this.checkedData, (index, el) => {
                taskAgainIdArr.push(el.id);
            })
            dialogTaskAgainVm.taskIdArr = taskAgainIdArr;
            dialogTaskAgainVm.show = true;
        },
        // 回车搜索
        enterClick(e) {
            let keyCode = e.keyCode || e.which;
            if (this.authority.SEARCH && keyCode === 13) {
                this.query();
            } else if (keyCode === 32 && e.target.selectionStart === 0) {
                return false;
            }
        },
        handleFileNameBlur(event) {
            event.target.value = $.trim(event.target.value);
            $(event.target).siblings('.fa-close').hide();
        },
        handleFileNameFocus(event) {
            $(event.target).siblings('.fa-close').show();
        },
        handleClear(event) {
            this.fileName = '';
            $(event.target).siblings('input').focus();
        },
    }
});

// ajax 请求数据
const sjscrwAjax = {
    // 根据机构id获取工作站
    ajaxGetWorkStation: function (data) {
        return ajax({
            url: '/gmvcs/uom/device/workstation/list',
            // url: '/api/rwgl-workStation',
            method: 'POST',
            data: data
        });
    },
    // 获取任务状态
    ajaxGetStatus: function () {
        return ajax({
            url: '/gmvcs/uom/task/fileUpload/status/type',
            method: 'get',
            // async: false
        });
    },

    // 获取失败原因
    ajaxGetFailReason: function () {
        return ajax({
            url: '/gmvcs/uom/task/fileUpload/fail/type',
            // url: '/api/tyywglpt-rwgl-failReason',
            method: 'get',
            // async: false
        });
    },

    // 获取任务概况
    ajaxGetTaskState: function (data) {
        return ajax({
            url: '/gmvcs/uom/task/fileUpload/state',
            method: 'POST',
            data: data
        });
    },

    // 获取表格数据
    ajaxGetTableList: function (data, page, pageSize) {
        return ajax({
            url: `/gmvcs/uom/task/fileUpload/list?vPage=${page}&vPageSize=${pageSize}&time=${Date.parse(new Date)}`,
            // url: '/api/tyywglpt-rwgl-sjscrw-tableList',
            method: 'POST',
            data: data
        });
    },

    // 重启任务
    ajaxBeginTaskAgain: function (data) {
        return ajax({
            url: `/gmvcs/uom/task/fileUpload/reset/${data}`,
            method: 'get'
        });
    }
}

// 表格数据判空
avalon.filters.fillterEmpty = function (str) {
    return (str === "" || str === null || str === undefined || str === "无") ? "-" : str;
}


// 重启确认弹窗vm定义
const dialogTaskAgainVm = avalon.define({
    $id: 'sjscrw-beginTaskAgain-vm',
    show: false,
    taskIdArr: [],
    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        sjscrwAjax.ajaxBeginTaskAgain(this.taskIdArr).then(ret => {
            if (ret.code !== 0) {
                notification.error({
                    message: ret.msg,
                    title: '通知'
                });
            } else {
                notification.success({
                    message: '重启成功',
                    title: '通知'
                });
                vm.fetchList();
            }
            this.show = false;
        })
    }
});

function autoSetPanelTop() {
    let $toobar = $('.tyywglpt-tool-bar');
    let $describe = $('.tyyw-describe-bar');
    if (vm.authority.RESET) {
        $('.tyywglpt-list-panel').css({
            'top': $toobar.offset().top + $toobar.outerHeight() + 42
        });
    } else {
        $('.tyywglpt-list-panel').css({
            'top': $describe.offset().top + $describe.outerHeight() + 42
        });
    }
}