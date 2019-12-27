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
import {
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language,
    sbsjzt_language = language_txt.xtywgl.sbsjzt;
export const name = 'xtywgl-cjgzz-index-sbsjzt';
let vm = null,
    sbzygl = null,
    enableQuery = true,
    queryTimer = null;
const listHeaderName = name + "-list-header";
avalon.component(name, {
    template: __inline('./xtywgl-cjgzz-index-sbsjzt.html'),
    defaults: {
        sbsjzt_language: language_txt.xtywgl.sbsjzt, //多语言
        extra_class: languageSelect == "en" ? true : false,
        // 加载表格数据 begin
        list: [],
        current: 1,
        //每页显示页数
        pageSize: 20,
        // 数据总量
        total: 0,
        dataStr: "",
        dataJson: {},
        // 的选项
        selectOptions: [{
            label: sbsjzt_language.all,
            value: 1
        }, {
            label: sbsjzt_language.Upgraded,
            value: 2
        }, {
            label: sbsjzt_language.NotUpgraded,
            value: 3
        }, {
            label: sbsjzt_language.UpgradeFailed,
            value: 4
        }],
        // Model的选项
        modelOptions: [],
        // selectModelOptions: [{
        //     label: sbsjzt_language.all,
        //     value: 1
        // }, {
        //     label: sbsjzt_language.dockingStation,
        //     value: 3
        // }],
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
            this.fetchManuToModel();
            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function(index, el) {
                    if (/^UOM_FUNCTION_SBZYGL_CJGZZGL_SJZT_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0)
                    return;
                avalon.each(func_list, function(k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_SBZYGL_CJGZZGL_SJZT_SEARCH":
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
            if(this.dataJson) {
                if(moment(this.dataJson.beginTime).format('YYYY-MM-DD') == moment().isoWeekday(1).format('YYYY-MM-DD') && moment(this.dataJson.endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                    // console.log('week');
                    $(".thisMonth").removeClass('active');
                    $(".thisWeek").addClass('active');
                } else if(moment(this.dataJson.beginTime).format('YYYY-MM-DD') == moment().dates(1).format('YYYY-MM-DD') && moment(this.dataJson.endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                    // console.log('month');
                    $(".thisWeek").removeClass('active');
                    $(".thisMonth").addClass('active');
                }
            }
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
        fetchManuToModel() {
            // let url = `/gmvcs/uom/device/workstation/manufacturer/module/get?manufacturer=0`;
            let url = `/gmvcs/uom/device/workstation/manufacturer/module/get`;

            sbzygl.ajax(url).then((result) => {
                if (result.code != 0) {
                    sbzygl.showTips('error', result.msg);
                    this.modelOptions.clear();
                    return;
                }
                let {
                    workstationCode
                } = result.data;
                //型号
                sbzygl.handleRemoteModel(workstationCode, (modelHasNullOptions, modelOptions) => {
                    this.modelOptions.clear();
                    this.modelOptions = modelHasNullOptions;
                });
            });
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
        beginTime: moment().isoWeekday(1).format('YYYY-MM-DD'),
        endTime: moment().format('YYYY-MM-DD'),
        handleTypeChange(e) {
            this.deviceType = this.typeMode = e.target.value;
            // this.typeMode = e.target.value;
            // switch (e.target.value) {
            //     case 1:
            //         this.deviceType = null;
            //         break;
            //     case 2:
            //         this.deviceType = 1;
            //         break;
            //     case 3:
            //         this.deviceType = 0;
            //         break;
            //     default:
            //         this.deviceType = null;
            // }
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
            //如果是按钮控制时间的改变就返回
            if (this.isBtnChangeTime)
                return;
            $(".thisMonth").removeClass('active');
            $(".thisWeek").removeClass('active');
            this.beginTime = e.target.value;
            if(moment(this.beginTime).format('YYYY-MM-DD') == moment().isoWeekday(1).format('YYYY-MM-DD') && moment(this.endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                // console.log('week');
                $(".thisMonth").removeClass('active');
                $(".thisWeek").addClass('active');
            } else if(moment(this.beginTime).format('YYYY-MM-DD') == moment().dates(1).format('YYYY-MM-DD') && moment(this.endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                // console.log('month');
                $(".thisWeek").removeClass('active');
                $(".thisMonth").addClass('active');
            }
        },
        handleEndTimeChange(e) {
            //如果是按钮控制时间的改变就返回
            if (this.isBtnChangeTime)
                return;
            $(".thisMonth").removeClass('active');
            $(".thisWeek").removeClass('active');
            this.endTime = e.target.value;
            if(moment(this.beginTime).format('YYYY-MM-DD') == moment().isoWeekday(1).format('YYYY-MM-DD') && moment(this.endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                // console.log('week');
                $(".thisMonth").removeClass('active');
                $(".thisWeek").addClass('active');
            } else if(moment(this.beginTime).format('YYYY-MM-DD') == moment().dates(1).format('YYYY-MM-DD') && moment(this.endTime).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                // console.log('month');
                $(".thisWeek").removeClass('active');
                $(".thisMonth").addClass('active');
            }
        },
        //采集时间
        chooseDate(time) {
            this.isBtnChangeTime = true;
            //这部分逻辑还需确认
            switch (time) {
                case "week":
                    $(".thisMonth").removeClass('active');
                    $(".thisWeek").addClass('active');
                    this.beginTime = moment().isoWeekday(1).format('YYYY-MM-DD');
                    //这样操作的目的解决ane datepicker组件因前后两次赋值相同而页面显示的label不会改变的bug
                    this.endTime = '';
                    break;
                case "month":
                    $(".thisWeek").removeClass('active');
                    $(".thisMonth").addClass('active');
                    this.beginTime = moment().dates(1).format('YYYY-MM-DD');
                    //这样操作的目的解决ane datepicker组件因前后两次赋值相同而页面显示的label不会改变的bug
                    this.endTime = '';
                    break;
            }
            //默认的值为当天的时间
            this.endTime = moment().format('YYYY-MM-DD');
            this.isBtnChangeTime = false;
        },

        // 加载表格
        loadTableList: function() {
            $('div.popover').remove();
            let data = {};
            // data.type = Number(this.deviceType);
            data.type = 0;
            data.statusType = this.updateStatus;
            data.orgId = this.orgId;
            data.startTime = this.beginTime ? moment(this.beginTime).format('X') * 1 : null;
            data.endTime = this.endTime ? moment(this.endTime).add(1, 'days').subtract(1, 'seconds').format('X') * 1 : null;
            if (!data.startTime && !data.endTime) {
                notification.warning({
                    title: sbsjzt_language.notification,
                    message: sbsjzt_language.chooseUpgradeTime
                });
                return;
            }
            if (!data.startTime && data.endTime) {
                notification.warn({
                    message: sbsjzt_language.chooseStartTime,
                    title: sbsjzt_language.notification
                });
                return;
            }
            if (data.startTime && !data.endTime) {
                notification.warn({
                    message: sbsjzt_language.chooseEndTime,
                    title: sbsjzt_language.notification
                });
                return;
            }
            if (data.startTime && data.endTime && data.startTime >= data.endTime) {
                notification.warn({
                    message: sbsjzt_language.timeSelectWarn,
                    title: sbsjzt_language.notification
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
                        title: sbsjzt_language.notification
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
                    item.insertTime = moment(item.insertTime).format('YYYY-MM-DD HH:mm:ss');
                    if(item.updateStatusName == "Not  upgraded") {
                        item.updateStatusName = sbsjzt_language.NotUpgraded;
                    }else if(item.updateStatusName == "Upgraded") {
                        item.updateStatusName = sbsjzt_language.Upgraded;
                    }else if(item.updateStatusName == "Upgrade  Failed") {
                        item.updateStatusName = sbsjzt_language.UpgradeFailed;
                    }
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
    ajaxGetTableList: function(data) {
        return ajax({
            url: '/gmvcs/uom/package/getWorkstationUpdateTask',
            // url: `/gmvcs/uap/dic/findByDicTypeCode/0001?page=${page}&pageSize=${pageSize}&time=${Date.parse(new Date)}`,
            method: 'post',
            data: data
        });
    }
}

// 表格数据判空
avalon.filters.fillterEmpty = function(str) {
    return (str === "" || str === null) ? "-" : str;
}

function autoSetPanelTop() {
    let $searchbox = $('.tyywglpt-search-box');
    if (vm.authority.SEARCH) {
        $('.tyywglpt-list-panel').css({
            // 'top': $searchbox.offset().top + $searchbox.outerHeight() + 42
            'top': 102
        });
    } else {
        $('.tyywglpt-list-panel').css({
            'top': 102
        }); //108 = 66+8+34
    }
}