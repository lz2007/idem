import avalon from 'avalon2';
import ajax from '../../services/ajaxService';
import "ane";
import moment from 'moment';
import {
    apiUrl
} from '../../services/configService';
import {
    createForm
} from 'ane';
import {
    notification
} from 'ane';
import * as menuServer from '../../services/menuService';

export const name = 'xtpzgl-czrz';
const listHeaderName = name + "-list-header";
const storage = require('../../services/storageService.js').ret;
require('./tyyhrzpt-xtpzgl-czrz.css');
var params = new Object();
var recordData = new Object();
var czrzinitParams = new Object();
let vm = avalon.component(name, {
    template: __inline('./tyyhrzpt-xtpzgl-czrz.html'),
    defaults: {
        sysAll: {},
        startTime: '',
        endTime: '',
        czrz_endDate: moment().format('YYYY-MM-DD'),
        czxt: '',
        authority: { //操作日志按钮权限控制标识
            "SEARCH": false, //操作日志_查询
            "DCRZ": false // 导出日志
        },
        start_null: "none",
        end_null: "none",
        handlerChangeStart(e) {
            let _this = this;
            _this.startTime = e.target.value;
            if (_this.startTime == "") {
                _this.start_null = "inline-block";
                $(".zfyps_start_time_tip").prev().children("input").addClass("input_error");
            } else {
                _this.start_null = "none";
                $(".zfyps_start_time_tip").prev().children("input").removeClass("input_error");
            }
        },
        getStartTime() {
            let _this = this;
            _this.startTime = moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss');
            _this.endTime = moment().format('YYYY-MM-DD HH:mm:ss');
            //	    	if (moment().format('d') == "0") {
            //		         _this.startTime = moment().day(-6).format('YYYY-MM-DD hh:mm:ss');
            //		    } else {
            //		        _this.startTime = moment().day(1).format('YYYY-MM-DD hh:mm:ss');
            //		    }
        },
        handlerChangeEnd(e) {
            let _this = this;
            _this.endTime = e.target.value;
            if (_this.endTime == "") {
                _this.end_null = "inline-block";
                $(".zfyps_end_time_tip").prev().children("input").addClass("input_error");
            } else {
                _this.end_null = "none";
                $(".zfyps_end_time_tip").prev().children("input").removeClass("input_error");
            }
        },

        $searchForm: createForm({
            onFieldsChange(fields, record) {
                recordData = record;
            }
        }),

        ajaxList(page, pageSize) {
            let appCode = '';
            if (avalon['components'][name]['defaults']['czxt']) { //操作系统
                appCode = avalon['components'][name]['defaults']['czxt'];
            }
            czrzinitParams.appCode = appCode;
            var startTime = recordData.startTime;
            var endDate = recordData.endDate;
            let beginTime = (typeof startTime != 'undefined') && startTime ? startTime : this.startTime;
            let endTime = (typeof endDate != 'undefined') && endDate ? endDate : this.endTime;
            if (!beginTime) {
                return;
            }
            if (!endTime) {
                return;
            }


            //判断开始时间是否晚于结束时间
            let t = getTimeByDateStr(beginTime) - getTimeByDateStr(endTime);
            if (t > 0) {
                notification.error({
                    message: '开始时间不能晚于结束时间，请重新设置！',
                    title: '温馨提示'
                });
                return;
            }

            let params = {
                "appCode": appCode,
                "beginTime": getTimeByDateStr(beginTime),
                "endTime": getTimeByDateStr(endTime),
                "page": page,
                "pageSize": pageSize
            };
            table.current = 1;
            table.paramsData = params;
            table.fetch(params);
        },

        czrzSearch() {
            var startTime = recordData.startTime;
            var endDate = recordData.endDate;
            czrzinitParams.startTime = startTime;
            czrzinitParams.endDate = endDate;
            //          if(!startTime) {
            //              notification.error({
            //                  message: '开始时间不能为空！',
            //                  title: '温馨提示'
            //              });
            //              return;
            //          }
            //          if(!endDate) {
            //              notification.error({
            //                  message: '结束时间不能为空！',
            //                  title: '温馨提示'
            //              });
            //              return;
            //          }
            //判断开始时间是否晚于结束时间
            let t = getTimeByDateStr(startTime) - getTimeByDateStr(endDate, true);
            if (t > 0) {
                notification.warn({
                    message: '开始时间不能晚于结束时间，请重新设置！',
                    title: '温馨提示'
                });
                return;
            }
            //判断开始时间跨度是否为一年
            let time_interval = getTimeByDateStr(endDate, true) - getTimeByDateStr(startTime);
            if (time_interval / (24 * 60 * 60 * 1000) > 365) {
                notification.warn({
                    message: '时间间隔不能超过一年，请重新设置！',
                    title: '通知'
                });
                return;
            }
            this.ajaxList(0, 20);
        },
        czrzExport() {
            let appCode = '';
            if (avalon['components'][name]['defaults']['czxt']) { //操作系统
                appCode = avalon['components'][name]['defaults']['czxt'];
            }
            var startTime = recordData.startTime;
            var endDate = recordData.endDate;
            let beginTime = (typeof startTime != 'undefined') ? startTime : this.startTime;
            let endTime = (typeof endDate != 'undefined') ? endDate : this.endTime;

            if (!startTime) {
                notification.error({
                    message: '开始时间不能为空！',
                    title: '温馨提示'
                });
                return;
            }
            if (!endDate) {
                notification.error({
                    message: '结束时间不能为空！',
                    title: '温馨提示'
                });
                return;
            }

            //判断开始时间是否晚于结束时间
            let t = getTimeByDateStr(beginTime) - getTimeByDateStr(endTime);
            if (t > 0) {
                notification.error({
                    message: '开始时间不能晚于结束时间，请重新设置！',
                    title: '温馨提示'
                });
                return;
            }

            let params = {
                "appCode": appCode,
                "beginTime": getTimeByDateStr(beginTime),
                "endTime": getTimeByDateStr(endTime)
            };
            let data = 'appCode=' + params.appCode + '&beginTime=' + params.beginTime + '&endTime=' + params.endTime;
            window.location.href = "http://" + window.location.host + apiUrl + "/gmvcs/uap/log/inter/export?" + data; //远程服务器使用
        },
        czrz_search_sys: avalon.define({
            $id: 'czrz-search-sys',
            selValue: [],
            options: [],
            halderChange(event) {
                avalon['components'][name]['defaults'].czxt = event.target.value;
            }
        }),

        allSys() {
            ajax({
                url: '/gmvcs/uap/app/all',
                method: 'get'
            }).then(result => {
                if (result.data) {
                    if (result.data) {
                        let r = result.data;
                        let optJs = [];
                        for (let i = 0; i < r.length; i++) {
                            optJs[i] = new Object();
                            optJs[i].label = r[i].name;
                            optJs[i].value = r[i].code;
                        }
                        let vm_search_czrz = avalon.components[name]['defaults']['czrz_search_sys'];
                        vm_search_czrz.options = optJs;
                        vm_search_czrz.selValue = [optJs[0].value];
                        avalon['components'][name]['defaults']['czxt'] = optJs[0].value;
                        if (!$.isEmptyObject(czrzinitParams)) {
                            avalon.components[name]['defaults']['czrz_search_sys'].selValue = [czrzinitParams.appCode];
                            if (czrzinitParams.startTime && czrzinitParams.endDate) {
                                this.startTime = czrzinitParams.startTime;
                                this.endTime = czrzinitParams.endDate;
                            }
                        }
                        if (czrzinitParams.page && czrzinitParams.pageSize) {
                            //                      	this.ajaxList(czrzinitParams.page, czrzinitParams.pageSize); //初始化显示数据
                            table.current = czrzinitParams.page + 1;
                            let params = {
                                "appCode": czrzinitParams.appCode,
                                "beginTime": getTimeByDateStr(this.startTime),
                                "endTime": getTimeByDateStr(this.endTime),
                                "page": czrzinitParams.page,
                                "pageSize": czrzinitParams.pageSize
                            };
                            table.paramsData = params;
                            table.fetch(params);
                        } else {
                            this.ajaxList(0, 20); //初始化显示数据
                        }
                    }
                }
            });

        },
        onDispose() {
            tableObjectJYCX.tableDataFnc([]);
            tableObjectJYCX.destroy();
        },
        onInit(event) {
            let _this = this;
            tableObjectJYCX = $.tableIndex({ //初始化表格jq插件
                id: 'czrz_table',
                tableBody: tableBodyJYCX
            });
            // 查询按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.CAS_FUNC_TYYHRZPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^CAS_FUNC_CZRZ/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                if (0 == func_list.length) {
                    // 设置绝对定位的top，防止空白
                    $('.czrzBtns').css('padding-top', '8px');
                    $('.czrz-table').css('top', '68px');
                    return;
                }

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "CAS_FUNC_CZRZ_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                        case "CAS_FUNC_CZRZ_DCRZ":
                            _this.authority.DCRZ = true;
                            break;
                    }
                });
                // 设置绝对定位的top，防止空白
                if (false == _this.authority.SEARCH && true == _this.authority.DCRZ) {
                    $('.czrzBtns').css('padding-top', '8px');
                    $('.czrz-table').css('top', '45px');
                }
                if (true == _this.authority.SEARCH && false == _this.authority.DCRZ) {
                    $('.czrz-table').css('top', '68px');
                }
            });
            this.allSys();
            table.remoteList = []; //置空表格
            table.changeData = [];
            table.total = 0;
            table.current = 0;
            table.pageSize = 20;
            table.paramsData = {};
        },
        onReady() {
            //         this.ajaxList(0, 20);
            this.getStartTime();
        }
    }
});
/*表格控制器*/
let tableBodyJYCX = avalon.define({ //表格定义组件
    $id: 'xtpegl_czrz_table',
    data: [],
    key: 'id',
    currentPage: 1,
    prePageSize: 20,
    loading: false,
    paddingRight: 0, //有滚动条时内边距
    checked: [],
    isAllChecked: false,
    selection: [],
    isColDrag: true, //true代表表格列宽可以拖动
    dragStorageName: 'xtpegl-czrz-tableDrag-style',
    handle: function (type, col, record, $index) { //操作函数
        var extra = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            extra[_i - 4] = arguments[_i];
        }
        var text = record[col].$model || record[col];
        table.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});
let tableObjectJYCX = {};
let table = avalon.define({
    $id: 'czrz_tabCont',
    //页面表格数据渲染
    loading: false,
    remoteList: [],
    changeData: [], //保存需要编辑或者删除的用户
    total: 0,
    current: 0,
    pageSize: 20,
    paramsData: {},
    // pagination: {
    //     pageSize: 20,
    //     total: 0,
    //     current: 0
    // },
    $computed: {
        pagination: function () {
            return {
                current: this.current,
                pageSize: this.pageSize,
                total: this.total,
                onChange: this.pageChange
            };
        }
    },
    getCurrent(current) {
        this.current = current;
    },
    getPageSize(pageSize) {
        this.pageSize = pageSize;
    },
    pageChange() {
        let params = this.paramsData;
        params.pageSize = this.pageSize;
        params.page = this.current - 1;
        czrzinitParams.page = params.page;
        czrzinitParams.pageSize = params.pageSize;
        this.fetch(params);
    },
    fetch(params) {
        // this.loading = true;
        tableObjectJYCX.loading(true);
        // let noti = '<li :if="@loading" class="czrzlist-loading"><span>结果加载中</span></li>';
        // $('.fixed-table-saika-loading').html(noti);
        ajax({
            url: '/gmvcs/uap/log/inter/list',
            // url: '/api/czrz.json',
            method: 'post',
            data: {
                "appCode": params.appCode,
                "beginTime": params.beginTime,
                "endTime": params.endTime,
                "page": params.page,
                "pageSize": params.pageSize
            }
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: "查询失败！",
                    title: "温馨提示"
                });
                this.loading = false;
                return;
            }
            if (result.data.currentElements) {
                this.changeData = []; //当表格刷新当前页数据置空
                this.total = result.data.totalElements;
                let ret = [];
                avalon.each(result.data.currentElements, function (index, el) {
                    ret.push(el);
                });
                // let ret = result.data.currentElements;
                let len = ret.length; //记录当前页面的数据长度
                this.remoteList = [];
                this.remoteList = avalon.range(len).map(n => ({ //字段末尾带L：表示返回的是没经过处理的字段
                    logId: ret[n].logId || '-',
                    app: ret[n].app || '-',
                    user: ret[n].user || '-',
                    org: ret[n].org || '-',
                    terminal: ret[n].terminal || '-',
                    operator: ret[n].operator || '-',
                    results: ret[n].results || '-',
                    failCode: ret[n].failCode || '-',
                    funcModule: ret[n].funcModule || '-',
                    conditions: ret[n].conditions || '-',
                    insertTime: new Date(ret[n].insertTime).Format("yyyy-MM-dd hh:mm:ss"),
                    index: 1 + 20 * (this.current - 1) + n
                }));
                // let pageSize_table = table.pagination.pageSize;
                // tableObjectJYCX.page(page + 1, pageSize_table);
                tableObjectJYCX.tableDataFnc(this.remoteList);
                tableObjectJYCX.loading(false);
            }
            if (result.data.totalElements == 0) {
                this.current = 0;
                this.loading = false;
                return;
            }
            this.loading = false;
        });
    },
    handleSelect(record, selected, selectedRows) {
        table.changeData = selectedRows;
    },
    handleSelectAll(selected, selectedRows) {
        for (let i = 0; i < selectedRows.length; i++) {
            table.changeData[i] = selectedRows[i];
        }
    }
});

function getEndTime() {
    return new Date().Format("yyyy-MM-dd hh:mm:ss");
}

//function getStartTime() {
//  var s = new Date().Format("yyyy-MM-dd hh:mm:ss");
//  var dt = new Date(s.replace(/-/, "/"));
//  var endTime = dt.getTime() - 1000 * 60 * 60 * 24 * 7;
//  return new Date(endTime).Format("yyyy-MM-dd hh:mm:ss");
//  
//}
//日期转时间戳
function getTimeByDateStr(stringTime) {
    var s = stringTime.split(" ");
    var s1 = s[0].split("-");
    var s2 = s[1].split(":");
    if (s2.length == 2) {
        s2.push("00");
    }

    return new Date(s1[0], s1[1] - 1, s1[2], s2[0], s2[1], s2[2]).getTime();

    // 火狐不支持该方法，IE CHROME支持
    //var dt = new Date(stringTime.replace(/-/, "/"));
    //return dt.getTime();
}

// function set_size() {
//     let v_height = $(window).height() - 96;
//     let v_min_height = $(window).height() - 68;
//     if (v_height > 740) {
//         $(".czrz-table").height(v_height);
//         $("#sidebar .zfsypsjglpt-menu").css("min-height", v_min_height + "px");
//     } else {
//         $(".czrz-table").height(740);
//         $("#sidebar .zfsypsjglpt-menu").css("min-height", "765px");
//     }
// }