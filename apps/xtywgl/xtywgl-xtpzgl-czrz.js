import avalon from 'avalon2';
import ajax from '../../services/ajaxService';
import "ane";
import moment from 'moment';
import {
    createForm
} from 'ane';
import {
    notification
} from 'ane';
import * as menuServer from '../../services/menuService';
import {
    apiUrl,
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;
export const name = 'xtywgl-czrz';
const listHeaderName = name + "-list-header";
const storage = require('../../services/storageService.js').ret;
require('./xtywgl-xtpzgl-czrz.less');
var czrzObj = null;
var recordData = new Object();
var czrzinitParams = new Object();
let local_storage = {
    // "pageSize_table": {},
    "table_list": [],
    "page": ""
};
let vm = avalon.component(name, {
    template: __inline('./xtywgl-xtpzgl-czrz.html'),
    defaults: {
        sysAll: {},
        czrz_language: language_txt.xtywgl.czrz, //多语言
        extra_class: languageSelect == "en" ? true : false,
        startTime: moment().isoWeekday(1).format('YYYY-MM-DD 00:00:00'),
        endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        czrz_endDate: moment().format('YYYY-MM-DD'),
        czxt: '',
        authority: { //操作日志按钮权限控制标识
            "SEARCH": false, //操作日志_查询
            "DCRZ": false // 导出日志
        },
        isBtnChangeTime: false, //是否用按钮去改变datapicker的值
        included_status: true, //true 包含子部门；false 不包含子部门
        clickBranchBack(e) {
            this.included_status = e;
        },
        start_null: "none",
        end_null: "none",
        handlerChangeStart(e) {
            if (this.isBtnChangeTime)
                return;
            this.dataBtnActive = false;
            this.btnClickActive = false;
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
            _this.startTime = moment().isoWeekday(1).format('YYYY-MM-DD 00:00:00');
            _this.endTime = moment().format('YYYY-MM-DD HH:mm:ss');

        },
        handlerChangeEnd(e) {
            if (this.isBtnChangeTime)
                return;
            this.dataBtnActive = false;
            this.btnClickActive = false;
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

        getDept() {
            let slqktj_deptemp = [];
            ajax({
                // url: '/api/dep_tree',
                // url: '/gmvcs/uap/org/all',
                url: '/gmvcs/uap/org/find/fakeroot/mgr',
                method: 'get',
                data: {},
                cache: false
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: 'Fail!',
                        title: 'Tips'
                    });
                    return;
                }
                let ajgl_form_data = null;
                // if (storage && storage.getItem) {

                //     if (storage.getItem('zfsypsjglpt-ywzx-czrz')) {
                //         ajgl_form_data = JSON.parse(storage.getItem('zfsypsjglpt-ywzx-czrz'));
                //     }
                // } else {

                // };
                getDepTree(result.data, slqktj_deptemp);
                yspk_tree.yspk_data = slqktj_deptemp;
                yspk_tree.tree_code = ajgl_form_data ? ajgl_form_data.orgPath || slqktj_deptemp[0].path : slqktj_deptemp[0].path;
                yspk_tree.tree_key = ajgl_form_data ? ajgl_form_data.orgPath : slqktj_deptemp[0].key;
                yspk_tree.tree_title = ajgl_form_data ? ajgl_form_data.orgName || (slqktj_deptemp[0] ? slqktj_deptemp[0].title : '') : (slqktj_deptemp[0] ? slqktj_deptemp[0].title : '');
            }).then(result => {

                // //恢复上次抽查数据
                // if (local_storage.remoteList) {
                //     return;
                // }
                this.czrzSearch();
            });
        },
        remoteList: [],
        dataBtnActive: true,
        btnClickActive: true,
        weekClick() {
            this.dataBtnActive = true;
            this.btnClickActive = true;
            this.isBtnChangeTime = true;
            if (moment().format('d') == "0") {
                this.startTime = recordData.startTime = moment().day(-6).format('YYYY-MM-DD 00:00:00');
                // this.startTime = recordData.endDate = moment().day(0).format('YYYY-MM-DD HH:mm:ss');
            } else {
                this.startTime = recordData.startTime = moment().day(1).format('YYYY-MM-DD 00:00:00');
            }
            this.endTime = recordData.endDate = moment().format('YYYY-MM-DD HH:mm:ss');
            this.isBtnChangeTime = false;
        },
        monthClick() {
            this.dataBtnActive = true;
            this.btnClickActive = false;
            this.isBtnChangeTime = true;
            this.startTime = recordData.startTime = moment().startOf('month').format('YYYY-MM-DD 00:00:00');
            this.endTime = recordData.endDate = moment().format('YYYY-MM-DD HH:mm:ss');
            this.isBtnChangeTime = false;
        },
        // curType: null, //默认是ALL，对应值是null
        curType:'',
        // OperationCategory: [null],
        count_type_options: [{
                value: null,
                label: language_txt.xtywgl.czrz.all
            }, {
                value: "INSERT",
                label: "INSERT"
            }, {
                value: "DELETE",
                label: "DELETE"
            }, {
                value: "UPDATE",
                label: "UPDATE"
            }
            // ,{
            //     value: "SELECT",
            //     label: "SELECT"
            // }, {
            //     value: "CALL",
            //     label: "CALL"
            // }, {
            //     value: "DOWNLOAD",
            //     label: "DOWNLOAD"
            // }, {
            //     value: "EXPORT",
            //     label: "EXPORT"
            // }
        ],
        onChangeType(e) {
            czrzObj.curType = e.target.value;
        },
        curType_lookupRange: null, //默认值是all，对应值是null
        lookupRange: [null],
        count_type_options_lookupRange: [{
            value: null,
            label: language_txt.xtywgl.czrz.all //不限
        }, {
            value: "/gmvcs/mangement/organization/",
            label: language_txt.xtywgl.zzjggl.title //组织架构
        }, {
            value: "/gmvcs/mangement/ngqx/",
            label: language_txt.xtywgl.jsgl.title //角色管理
        }],
        onChangeType_lookupRange(e) {
            czrzObj.curType_lookupRange = e.target.value;

        },
        // lookupRange: '1',
        // OperationCategory: '1',
        department: '',
        userName: '', //用户名
        userCode: '', //用户编号
        OperationCategory:'',
        handleBlur(event) {
            event.target.value = $.trim(event.target.value);
            $(event.target).siblings('.input-close-ywzx-czrz').hide();
        },
        handleClear(name, event) {
            this[name] = '';
            $(event.target).siblings('input').focus()
        },
        handleFocus(event) {
            $(event.target).siblings('.input-close-ywzx-czrz').css('display', 'inline-block');
        },
        handlePress(event) {
            let keyCode = event.keyCode || event.which;
            if (this.authority.SEARCH && keyCode == 13) {
                this.czrzSearch();
            } else if (keyCode === 32 && event.target.selectionStart === 0) {
                return false;
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
                    message: this.czrz_language.starttimecannotbelaterthanendtimePleasereset,
                    title: this.czrz_language.tips
                });
                return;
            }

            yspk_tree.tree_code;
            let params = {
                // "admin": true,
                // "userName": this.userName,
                // "userCode": czrzObj.userCode == '' ? '' : this.userCode,
                // "menuPath": czrzObj.curType_lookupRange, //lookupRange
                // "operation": czrzObj.curType == '' ? null : czrzObj.curType, //OperationCategory
                // "orgId": yspk_tree.tree_key,
                "orgPath": yspk_tree.tree_code,
                "subOrg": czrzObj.included_status,
                "beginTime": getTimeByDateStr(beginTime),
                "endTime": getTimeByDateStr(endTime),
                "page": page,
                "pageSize": pageSize,
                'appCode': "/gmvcs"
            };
            if(czrzObj.userCode){
                params.key = $.trim(czrzObj.userCode)
            }
            if(czrzObj.curType){
                params.operator = $.trim(czrzObj.curType)
            }

            table.current = 1;
            table.paramsData = params;
            table.fetch(params);
        },

        czrzSearch() {
            var startTime = recordData.startTime;
            var endDate = recordData.endDate;
            czrzinitParams.startTime = startTime;
            czrzinitParams.endDate = endDate;

            //判断开始时间是否晚于结束时间
            let t = getTimeByDateStr(startTime) - getTimeByDateStr(endDate, true);
            if (t > 0) {
                notification.warn({
                    message: this.czrz_language.starttimecannotbelaterthanendtimePleasereset,
                    title: this.czrz_language.tips
                });
                return;
            }
            //判断开始时间跨度是否为一年
            let time_interval = getTimeByDateStr(endDate, true) - getTimeByDateStr(startTime);
            if (time_interval / (24 * 60 * 60 * 1000) > 365) {
                notification.warn({
                    message: this.czrz_language.timeintervalcannotexceedoneyearpleasereset,
                    title: this.czrz_language.tips
                });
                return;
            }
            this.ajaxList(0, 20);
        },
        czrzExport() {
            // let appCode = '';
            // if (avalon['components'][name]['defaults']['czxt']) { //操作系统
            //     appCode = avalon['components'][name]['defaults']['czxt'];
            // }
            var startTime = recordData.startTime;
            var endDate = recordData.endDate;
            let beginTime = (typeof startTime != 'undefined') ? startTime : this.startTime;
            let endTime = (typeof endDate != 'undefined') ? endDate : this.endTime;

            if (!startTime) {
                notification.error({
                    message: this.czrz_language.starttimecannotbeempty,
                    title: this.czrz_language.tips
                });
                return;
            }
            if (!endDate) {
                notification.error({
                    message: this.czrz_language.endtimecannotbeempty,
                    title: this.czrz_language.tips
                });
                return;
            }

            //判断开始时间是否晚于结束时间
            let t = getTimeByDateStr(beginTime) - getTimeByDateStr(endTime);
            if (t > 0) {
                notification.error({
                    message: this.czrz_language.starttimecannotbelaterthanendtimePleasereset,
                    title: this.czrz_language.tips
                });
                return;
            }
            let params = {
                "orgPath": yspk_tree.tree_code,
                // "subOrg": czrzObj.included_status,
                "subOrg": true,
                "beginTime": getTimeByDateStr(beginTime),
                "endTime": getTimeByDateStr(endTime),
                "page": 0,
                "pageSize": 20,
                'appCode': "/gmvcs"
            };
            if(czrzObj.userCode){
                params.key = $.trim(czrzObj.userCode)
            }
            if(czrzObj.curType){
                params.operator = $.trim(czrzObj.curType)
            }
            let data = 'appCode='+ params.appCode + '&beginTime=' + params.beginTime + '&endTime=' + params.endTime +
                 '&subOrg=' + params.subOrg + '&orgPath=' + params.orgPath  + '&page=' + params.page + '&pageSize=' + params.pageSize;
            window.location.href = "http://" + window.location.host + apiUrl + "/gmvcs/uap/log/inter/overseasExport?" + data; //远程服务器使用
        },
        // czrz_search_sys: avalon.define({
        //     $id: 'czrz-search-sys',
        //     selValue: [],
        //     options: [],
        //     halderChange(event) {
        //         avalon['components'][name]['defaults'].czxt = event.target.value;
        //     }
        // }),

        // allSys() {
        //     ajax({
        //         url: '/gmvcs/uap/app/all',
        //         method: 'get'
        //     }).then(result => {
        //         if (result.data) {
        //             if (result.data) {
        //                 let r = result.data;
        //                 let optJs = [];
        //                 for (let i = 0; i < r.length; i++) {
        //                     optJs[i] = new Object();
        //                     optJs[i].label = r[i].name;
        //                     optJs[i].value = r[i].code;
        //                 }
        //                 let vm_search_czrz = avalon.components[name]['defaults']['czrz_search_sys'];
        //                 vm_search_czrz.options = optJs;
        //                 vm_search_czrz.selValue = [optJs[0].value];
        //                 avalon['components'][name]['defaults']['czxt'] = optJs[0].value;
        //                 if (!$.isEmptyObject(czrzinitParams)) {
        //                     avalon.components[name]['defaults']['czrz_search_sys'].selValue = [czrzinitParams.appCode];
        //                     if (czrzinitParams.startTime && czrzinitParams.endDate) {
        //                         this.startTime = czrzinitParams.startTime;
        //                         this.endTime = czrzinitParams.endDate;
        //                     }
        //                 }
        //                 if (czrzinitParams.page && czrzinitParams.pageSize) {
        //                     //                      	this.ajaxList(czrzinitParams.page, czrzinitParams.pageSize); //初始化显示数据
        //                     table.current = czrzinitParams.page + 1;
        //                     let params = {
        //                         "appCode": czrzinitParams.appCode,
        //                         "beginTime": getTimeByDateStr(this.startTime),
        //                         "endTime": getTimeByDateStr(this.endTime),
        //                         "page": czrzinitParams.page,
        //                         "pageSize": czrzinitParams.pageSize
        //                     };
        //                     table.paramsData = params;
        //                     table.fetch(params);
        //                 } else {
        //                     this.ajaxList(0, 20); //初始化显示数据
        //                 }
        //             }
        //         }
        //     });

        // },
        onDispose() {
            tableObjectJYCX.tableDataFnc([]);
            tableObjectJYCX.destroy();
        },
        onInit(event) {
            let _this = this;
            czrzObj = event.vmodel;
            tableObjectJYCX = $.tableIndex({ //初始化表格jq插件
                id: 'czrz_table',
                tableBody: tableBodyJYCX
            });
            // 查询按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^CAS_FUNC_CZRZ/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                // if (0 == func_list.length) {
                //     // 设置绝对定位的top，防止空白
                //     $('.czrzBtns').css('padding-top', '8px');
                //     $('.czrz-table').css('top', '68px');
                //     return;
                // }

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
                    // $('.czrz-table').css('top', '45px'); //加上去会隐藏掉导出日志按钮
                }
                if (true == _this.authority.SEARCH && false == _this.authority.DCRZ) {
                    $('.czrz-table').css('top', '68px');
                }
            });
            // if (storage && storage.getItem) {
            //     let czrz_data
            //     if (storage.getItem('zfsypsjglpt-ywzx-czrz')) {
            //         czrz_data = JSON.parse(storage.getItem('zfsypsjglpt-ywzx-czrz'));

            //         table.remoteList = czrz_data.remoteList;
            //         table.current = czrz_data.page;
            //         // table.total = czrz_data;
            //         table.pageSize = 20;
            //     }
            // } else {

            // };

            // this.allSys();
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
            this.getDept();
            this.dataBtnActive = true;
            this.btnClickActive = true;
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
        tableObjectJYCX.loading(true);
        ajax({
            url: '/gmvcs/uap/log/inter/list',
            // url: '/api/czrz.json',
            method: 'post',
            data: params
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: this.czrz_language.fails,
                    title: this.czrz_language.tips
                });
                this.loading = false;
                return;
            }
            if (result.data.overLimit) {
                this.total = result.data.limit * result.data.perPages; //总条数
            } else {
                this.total = result.data.totalElements; //总条数
            }
            if (result.data.currentElements) {
                if (storage && storage.setItem) {
                    // ajglMan.$searchForm.record.page = page;
                    // ajglMan.$searchForm.record.timeStatus = seachParams.timeStatus;
                    storage.setItem('zfsypsjglpt-ywzx-czrz', JSON.stringify(params));
                } else {

                };

                this.changeData = []; //当表格刷新当前页数据置空
                // this.total = result.data.totalElements;
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
                    userName: ret[n].user || '-',
                    org: ret[n].org || '-',
                    terminal: ret[n].terminal || '-',
                    operator: ret[n].operator || '-',
                    results: ret[n].results || '-',
                    failCode: ret[n].failCode || '-',
                    funcModule: ret[n].funcModule || '-',
                    conditions: ret[n].conditions || '-',

                    describe: ret[n].describe || '-',

                    insertTime: new Date(ret[n].insertTime).Format("yyyy-MM-dd hh:mm:ss"),
                    index: 1 + 20 * (this.current - 1) + n,
                    ip:ret[n].ip || '-'
                }));
                // let pageSize_table = table.pagination.pageSize;
                // tableObjectJYCX.page(page + 1, pageSize_table);
                tableObjectJYCX.tableDataFnc(this.remoteList);
                tableObjectJYCX.loading(false);

                // 保存数据
                // local_storage.remoteList = this.remoteList;
                // local_storage.page = params.page;
                // local_storage.pageSize_table = params.pageSize;
                // storage.setItem('zfsypsjglpt-ywzx-czrz', local_storage);
            }
            // if (result.data.totalElements == 0) {
            //     this.current = 0;
            //     this.loading = false;
            //     return;
            // }
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


//定义树
let yspk_tree = avalon.define({
    $id: "ywzx_tree_czrz",
    yspk_data: [],
    tree_key: "",
    tree_title: "",
    tree_code: "",
    curTree: "",
    getSelected(key, title, e) {
        this.tree_key = key;
        this.tree_title = title;
        this.tree_code = e.path;
    },
    select_change(e, selectedKeys) {
        this.curTree = e.node.key;
        this.tree_code = e.node.path;
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
                    title: this.czrz_language.tips
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
});

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