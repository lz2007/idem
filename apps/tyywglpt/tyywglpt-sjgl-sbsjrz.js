import avalon from 'avalon2';
import {
    createForm,
    notification
} from "ane";
import * as menuServer from '../../services/menuService';
import moment from 'moment';
import Sbzygl from '../common/common-sbzygl';
import ajax from '../../services/ajaxService';
const storage = require('../../services/storageService.js').ret;
require('../common/common-tyywglpt.css');
export const name = 'tyywglpt-sjgl-sbsjrz';
let vm = null,
    sbzygl = null,
    enableQuery = true,
    queryTimer = null;
const listHeaderName = name + "-list-header";
avalon.component(name, {
    template: __inline('./tyywglpt-sjgl-sbsjrz.html'),
    defaults: {
        // 加载表格数据 begin
        list: [],
        current: 1,
        //每页显示页数
        pageSize: 20,
        // 数据总量
        total: 0,
        dataStr: "",
        dataJson: {},
        titleTimer: "", //popover用的的定时器，代码在common-sbzygl.js
        orgData: [],
        orgCode: "",
        orgId: "",
        orgPath: "",
        orgName: "",
        authority: { // 按钮权限标识
            "SEARCH": false //升级管理_设备升级日志_查询
        },
        getCurrent(current) {
            this.current = current;
        },
        //当页码改变时触发，参数current
        onChangePage(current) {
            this.current = current;
            this.fetchList();
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
                    if (/^UOM_FUNCTION_YCSJGL_SBSJZT_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0)
                    return;
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_YCSJGL_SBSJZT_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                    }
                });
                autoSetPanelTop();
            });
            this.$watch('dataJson', (v) => {
                if (v) {
                    this.beginTime = v.startTime ? moment(v.startTime * 1000).format('YYYY-MM-DD') : moment().subtract(3, 'months').format('YYYY-MM-DD');
                    this.endTime = v.endTime ? moment(v.endTime * 1000).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
                    this.typeMode = v.typeMode;
                    this.updateMode = v.updateMode;
                    this.deviceType = v.type;
                    this.updateStatus = v.statusType;
                    this.current = v.page + 1;
                }
            })
        },
        onReady() {
            this.dataStr = storage.getItem(name);
            this.dataJson = this.dataStr ? JSON.parse(this.dataStr) : null;
            //表头宽度设置
            sbzygl.setListHeader(listHeaderName);
            this.fetchOrgData(() => {
                this.fetchList();
            })
            autoSetPanelTop();
        },
        onDispose() {
            clearTimeout(queryTimer);
            clearTimeout(this.titleTimer);
            enableQuery = true;
            $('div.popover').remove();
        },
        getSelected(key, title) {
            this.orgId = key;
        },
        handleTreeChange(e, selectedKeys) {
            this.orgCode = e.node.code;
            this.orgPath = e.node.path;
            this.orgName = e.node.title;
        },
        extraExpandHandle(treeId, treeNode, selectedKey) {
            sbzygl.fetchOrgWhenExpand(treeId, treeNode, selectedKey);
        },
        // 查找
        json: '',
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
        // to do
        fetchList() {
            this.$searchForm.validateFields().then(isAllValid => {
                if (isAllValid) {
                    this.loadTableList();
                }
            });
        },
        // to do
        fetchOrgData(callback) {
            sbzygl.fetchOrgData(this.orgData, (orgData) => {
                this.orgData = orgData;
                if (orgData.length > 0) {
                    this.orgId = this.dataJson ? this.dataJson.orgId : orgData[0].key;
                    this.orgName = this.dataJson ? this.dataJson.orgName : orgData[0].title;
                }
                avalon.isFunction(callback) && callback();
            });
        },
        deviceType: null,
        typeMode: 1,
        updateStatus: -1,
        updateMode: 1,
        beginTime: moment().subtract(3, 'months').format('YYYY-MM-DD'),
        endTime: moment().format('YYYY-MM-DD'),
        handleTypeChange(e) {
            this.typeMode = e.target.value;
            switch (e.target.value) {
                case 1:
                    this.deviceType = null;
                    break;
                case 2:
                    this.deviceType = 1;
                    break;
                case 3:
                    this.deviceType = 0;
                    break;
                default:
                    this.deviceType = null;
            }
        },
        handleStatusChange(e) {
            this.updateMode = e.target.value;
            switch (e.target.value) {
                case 1:
                    this.updateStatus = -1;
                    break;
                case 2:
                    this.updateStatus = 0;
                    break;
                case 3:
                    this.updateStatus = 1;
                    break;
                case 4:
                    this.updateStatus = 2;
                    break;
                default:
                    this.updateStatus = -1;
            }
        },
        handleStartTimeChange(e) {
            this.beginTime = e.target.value;
        },
        handleEndTimeChange(e) {
            this.endTime = e.target.value;
        },

        // 加载表格
        loadTableList: function () {
            $('div.popover').remove();
            let data = {};
            data.type = this.deviceType;
            data.statusType = this.updateStatus;
            data.orgId = this.orgId;
            data.startTime = this.beginTime ? moment(this.beginTime).format('X') * 1 : null;
            data.endTime = this.endTime ? moment(this.endTime).add(1, 'days').subtract(1, 'seconds').format('X') * 1 : null;
            if (!data.startTime && !data.endTime) {
                notification.warning({
                    title: '通知',
                    message: '请选择升级时间！'
                });
                return;
            }
            if (!data.startTime && data.endTime) {
                notification.warn({
                    message: '请选择开始时间！',
                    title: '通知'
                });
                return;
            }
            if (data.startTime && !data.endTime) {
                notification.warn({
                    message: '请选择结束时间！',
                    title: '通知'
                });
                return;
            }
            if (data.startTime && data.endTime && data.startTime >= data.endTime) {
                notification.warn({
                    message: '开始时间不能大于结束时间！',
                    title: '通知'
                });
                return;
            }
            this.loading = true;
            data.page = this.current - 1;
            data.pageSize = this.pageSize;
            let storageData = JSON.parse(JSON.stringify(data));
            storageData.typeMode = this.typeMode;
            storageData.updateMode = this.updateMode;
            storageData.orgName = this.orgName;
            this.dataStr = JSON.stringify(storageData);
            storage.setItem(name, this.dataStr, 0.5);
            lxxzrwAjax.ajaxGetTableList(data).then(ret => {
                if (ret.code != 0) {
                    notification.warning({
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
                // 总数据量
                this.total = ret.data.totalElements;
                if (this.total === 0) {
                    this.list = [];
                    this.loading = false;
                    this.isNull = true;
                    sbzygl.initDragList(listHeaderName);
                    return false;
                }
                avalon.each(ret.data.currentElements, (i, item) => {
                    item.insertTime = moment(item.insertTime).format('YYYY-MM-DD HH:mm:ss')
                });
                // 数据
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
    }
});

// ajax 请求数据
const lxxzrwAjax = {
    // 获取表格数据
    ajaxGetTableList: function (data) {
        return ajax({
            url: '/gmvcs/uom/package/getWorkstationUpdateTask',
            // url: `/gmvcs/uap/dic/findByDicTypeCode/0001?page=${page}&pageSize=${pageSize}&time=${Date.parse(new Date)}`,
            method: 'post',
            data: data
        });
    }
}

// 表格数据判空
avalon.filters.fillterEmpty = function (str) {
    return (str === "" || str === null) ? "-" : str;
}

function autoSetPanelTop() {
    let $searchbox = $('.tyywglpt-search-box');
    if (vm.authority.SEARCH) {
        $('.tyywglpt-list-panel').css({
            'top': $searchbox.offset().top + $searchbox.outerHeight() + 42
        });
    } else {
        $('.tyywglpt-list-panel').css({
            'top': 108
        }); //108 = 66+8+34
    }
}