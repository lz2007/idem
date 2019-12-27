import avalon from 'avalon2';
import {
    createForm,
    message
} from 'ane';
import {
    notification
} from 'ane';
import * as bootbox from 'bootbox';
import ajax from '../../services/ajaxService';
import * as menuServer from '../../services/menuService';
import 'bootstrap';

let storage = require('/services/storageService.js').ret;
import {
    copyRight,
    telephone
} from '/services/configService';

require('/apps/zfsypsjglpt/zfsypsjglpt-zfda-ajgl_gongan.css');
require('../common/common-zoom.js');
require('../common/common-zoom.css');
export const name = 'zfsypsjglpt-zfda-ajgl_gongan';

let ajglMan = null;
let ajgl_ck_Man = null;
let ajgl_last = null;
// $(document).mousedown(function (e) {

//     if ($(e.target).attr('data-toggle') || $(e.target).parent().attr('data-toggle')) {
//         return;
//     } else {
//         $('.popover').hide();
//     }
// });
avalon.component(name, {
    template: __inline('./zfsypsjglpt-zfda-ajgl_gongan.html'),
    defaults: {
        //包含子部门
        includeChild: false,
        clickincludeChild() {
            this.includeChild = !this.includeChild
        },
        // 版权信息
        copyRight: copyRight,
        telephone: telephone,
        //查询表单
        $searchForm: createForm({
            autoAsyncChange: true,
            onFieldsChange: function () {

            },
            record: ajgl_initialData()
        }),
        ajgl_search() {
            table.fetch(true);
        },
        bh: '',
        //input
        ajgl_close_ajbh: false,
        ajgl_close_ajmc: false,
        ajgl_close_jqbh: false,
        ajgl_close_sary: false,
        ajgl_close_jy: false,
        close_click(e) {
            switch (e) {
                case 'ajbh':
                    $('.top-form').find($("[name = 'ajbh']")).val('');
                    $('.top-form').find($("[name = 'ajbh']")).focus();
                    ajglMan.$searchForm.record.ajbh = '';
                    break;
                case 'ajmc':
                    $('.top-form').find($("[name = 'ajmc']")).val('');
                    $('.top-form').find($("[name = 'ajmc']")).focus();
                    ajglMan.$searchForm.record.ajmc = '';
                    break;
                case 'jqbh':
                    $('.top-form').find($("[name = 'jqbh']")).val('');
                    $('.top-form').find($("[name = 'jqbh']")).focus();
                    ajglMan.$searchForm.record.jqbh = '';
                    break;
                case 'sary':
                    $('.top-form').find($("[name = 'sary']")).val('');
                    $('.top-form').find($("[name = 'sary']")).focus();
                    ajglMan.$searchForm.record.sary = '';
                    break;
                case 'jy':
                    $('.top-form').find($("[name = 'jy']")).val('');
                    $('.top-form').find($("[name = 'jy']")).focus();
                    ajglMan.$searchForm.record.jy = '';
                    break;
            }
        },
        input_focus(e) {
            switch (e) {
                case 'ajbh':
                    this.ajgl_close_ajbh = true;
                    break;
                case 'ajmc':
                    this.ajgl_close_ajmc = true;
                    break;
                case 'jqbh':
                    this.ajgl_close_jqbh = true;
                    break;
                case 'sary':
                    this.ajgl_close_sary = true;
                    break;
                case 'jy':
                    this.ajgl_close_jy = true;
                    break;
            }
        },
        input_blur(e, name) {
            $(e.target).val($(e.target).val().replace(/[`~!.;:,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, ''));
            this.$searchForm.record[e.target.name] = $(e.target).val();
            this.$searchForm.record[e.target.name] = this.$searchForm.record[e.target.name].replace(/[`~!.:;,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, '');

            switch (name) {
                case 'ajbh':
                    this.ajgl_close_ajbh = false;
                    break;
                case 'ajmc':
                    this.ajgl_close_ajmc = false;
                    break;
                case 'jqbh':
                    this.ajgl_close_jqbh = false;
                    break;
                case 'sary':
                    this.ajgl_close_sary = false;
                    break;
                case 'jy':
                    this.ajgl_close_jy = false;
                    break;
            }
        },
        //受警单位
        searchForm_sjdw: avalon.define({
            $id: 'searchForm_sjdw',
            rdata: [],
            sjdw: [],
            checkedKeys: [],
            expandedKeys: [],
            checkType: '',
            id: '',
            handleChange(event, treeId, treeNode, treeTarget) {
                ajglMan.$searchForm.record.sjdw = treeNode.orgPath;
                this.id = treeNode.id;
                this.checkedKeys = treeNode.orgName;
                this.selectedTitle = treeNode.orgName;
                this.checkType = treeNode.checkType;
            },
            selectedTitle: ''
        }),
        enter_click(e) {
            $(e.target).val($(e.target).val().replace(/[`~!.;:,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, ''));
            this.$searchForm.record[e.target.name] = $(e.target).val();
            this.$searchForm.record[e.target.name] = this.$searchForm.record[e.target.name].replace(/[`~!.:;,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, '');

            if (e.keyCode == "13") {
                table.fetch(true);
            }
        },
        year: new Date().getFullYear(),
        //报警时间
        dateShow: false,
        kssj_isNull: 'none',
        jssj_isNull: 'none',
        $computed: {
            show_isNull: function () {
                return (this.kssj_isNull == 'block' || this.jssj_isNull == 'block') ? 'block' : 'none';
            }
        },
        searchForm_bjsj: avalon.define({
            $id: 'ajgl_searchForm_bjsj',
            bjsj: ['last-week'],
            searchForm_bjsj_Change(e, a) {

                //以下是按照原项目计算方法 -- 时间的问题尚不够完善待修改
                Tools.timeCalculator.calculate(e.target.value);
            }
        }),
        topform_start_time: '',
        topform_end_time: '',
        startTimeHandleChange(e) {

            if (e.target.value) {
                ajglMan.kssj_isNull = 'none';
                ajglMan.$searchForm.record.bjsjStart = Number(getTimeByDateStr(e.target.value + ' 00:00:00'));
            } else {
                ajglMan.kssj_isNull = 'block';
                ajglMan.$searchForm.record.bjsjStart = '';
            }
        },
        endTimeHandleChange(e) {
            if (e.target.value) {
                ajglMan.jssj_isNull = 'none';
                ajglMan.$searchForm.record.bjsjEnd = Number(getTimeByDateStr(e.target.value + ' 23:59:59'));
            } else {
                ajglMan.jssj_isNull = 'block';
                ajglMan.$searchForm.record.bjsjEnd = '';
            }
        },
        //关联类别
        searchForm_glmt: avalon.define({
            $id: 'searchForm_gllb',
            glmt: ['99'],
            searchForm_gllb_Change(e, a) {
                ajglMan.$searchForm.record.gllb = e.target.value;
            }
        }),
        clearPo() {
            $('.popover').hide();
        },
        ajgl_check: avalon.define({
            $id: "ajgl_check",
            authority: { // 按钮权限标识
                // "CHECK_TJGL": false,  //音视频库_执法档案_案件关联_查看_添加关联
                // "CHECK_SCGL": false,  //音视频库_执法档案_案件关联_查看_删除关联
                "CHECK": false, //音视频库_执法档案_案件关联_查看
                "SEARCH": false, //音视频库_执法档案_案件关联_查询
                "OPT_SHOW": false //操作栏显示方式
            }
        }),
        jqbh: '',
        ajbh: '',
        ajmc: '',
        sary: '',
        jy: '',
        toggleShow: true,

        onInit(event) {
            tableObject = $.tableIndex({ //初始化表格jq插件
                id: 'ajgl_table',
                tableBody: tableBodyAJGL
            });
            ajglMan = this;
            ajgl_ck_Man = this;

            Tools.clearForm(); //在模块切换时重置所有的查询表单字段
            var ajgl_form_data = null;

            if (storage && storage.getItem) {

                if (storage.getItem('zfsypsjglpt-zfda-ajgl')) {
                    ajgl_form_data = JSON.parse(storage.getItem('zfsypsjglpt-zfda-ajgl'));
                }
            } else {

            };

            if (ajgl_form_data) {
                this.$searchForm.record.jqbh = this.jqbh = ajgl_form_data.jqbh;
                this.$searchForm.record.ajbh = this.ajbh = ajgl_form_data.ajbh;
                this.$searchForm.record.ajmc = this.ajmc = ajgl_form_data.ajmc;
                this.$searchForm.record.sary = this.sary = ajgl_form_data.sary;
                this.$searchForm.record.jy = this.jy = ajgl_form_data.jy;
                this.$searchForm.record.includeChild = this.includeChild = ajgl_form_data.includeChild;
                this.$searchForm.record.gllb = ajgl_form_data.gllb;
                this.searchForm_glmt.glmt = [ajgl_form_data.gllb];
                this.$searchForm.record.bjsjStart = ajgl_form_data.bjsjStart;
                this.$searchForm.record.bjsjEnd = ajgl_form_data.bjsjEnd;
                Tools.timeCalculator.setStatus(ajgl_form_data.timeStatus);


                var date = new Date();
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var d = new Date(year, month, 0);

                if (ajgl_form_data.timeStatus == 'last-week') {
                    this.searchForm_bjsj.bjsj = ['last-week'];
                    ajglMan.$searchForm.record.timeStatus = 'last-week';
                } else if (ajgl_form_data.timeStatus == 'last-month') {
                    this.searchForm_bjsj.bjsj = ['last-month'];
                    ajglMan.$searchForm.record.timeStatus = 'last-month';
                } else {
                    this.searchForm_bjsj.bjsj = ['last-past-of-time'];
                    ajglMan.$searchForm.record.timeStatus = 'last-past-of-time';
                    this.dateShow = true;
                    this.topform_start_time = formatDate(ajgl_form_data.bjsjStart, true);
                    this.topform_end_time = formatDate(ajgl_form_data.bjsjEnd, true);
                }
            }

            // 查看、查询按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_ZFDA_AJGL/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    $('#aqglTable').css('top', '6px');
                    return;
                }

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        // case "AUDIO_FUNCTION_ZFDA_AJGL_CHECK_TJGL":
                        //     ajglMan.ajgl_check.authority.CHECK_TJGL = true;
                        //     break;
                        // case "AUDIO_FUNCTION_ZFDA_AJGL_CHECK_SCGL":
                        //     ajglMan.ajgl_check.authority.CHECK_SCGL = true;
                        //     break;
                        case "AUDIO_FUNCTION_ZFDA_AJGL_CHECK":
                            ajglMan.ajgl_check.authority.CHECK = true;
                            break;
                        case "AUDIO_FUNCTION_ZFDA_AJGL_SEARCH":
                            ajglMan.ajgl_check.authority.SEARCH = true;
                            break;
                    }
                });
                if (false == ajglMan.ajgl_check.authority.SEARCH)
                    $('#aqglTable').css('top', '6px');

                if (false == ajglMan.ajgl_check.authority.CHECK)
                    ajglMan.ajgl_check.authority.OPT_SHOW = true;

            });
        },
        onReady() {
            Tools.getTree();
        },
        onDispose() {

        }
    }
});

/*********查询所得的表格**********/
let table = avalon.define({
    $id: 'ajgl-table',
    remoteList: [],
    loading: false,
    $cache: {}, //数据缓存对象，缓存着每次请求的当页数据
    $selectOption: [], //勾选表格行保存该行的数据
    pagination: {
        pageSize: 20,
        total: 0,
        current: 0,
        overLimit: false,
    },
    flag: 0,
    getCurrent(current) {
        this.pagination.current = current;
    },
    actions(type, text, record, index) {

        if (type == 'checkLook') {
            window.ajgl_bh = record.ajbh;
            window.sessionStorage.setItem('ajgl_bh',record.ajbh);
            avalon.history.setHash('/zfsypsjglpt-zfda-ajgl-detail_gongan');
        }
    },
    handleSelect(record, selected, selectedRows) {

    },
    selectChange(selectedRowKeys, selectedRows) {
        this.$selectOption = [selectedRows]
    },
    handleSelectAll(selectedRowKeys, selectedRows) {
        console.log(selectedRowKeys);
    },
    fetch(search, initMark) {
        tableObject.loading(true);
        if (!search) {
            var page = this.pagination.current == 0 ? 0 : this.pagination.current - 1;


            this.ajax_table();

        } else {
            this.pagination = {
                pageSize: 20,
                total: 0,
                current: 0,
                overLimit: false,
            };
            this.$cache = [];
            this.loading = false;
            this.remoteList = [];
            this.flag = 1;
            this.ajax_table(initMark);
        }
    },
    ajax_table(initMark) {
        tableObject.loading(true);

        var page = this.pagination.current == 0 ? 0 : this.pagination.current - 1,
            seachParams = ajglMan.$searchForm.record;
        seachParams.timeStatus = Tools.timeCalculator.getStatus();
        seachParams.ajbh = $.trim(seachParams.ajbh);
        seachParams.ajmc = $.trim(seachParams.ajmc);
        seachParams.jqbh = $.trim(seachParams.jqbh);
        seachParams.sary = $.trim(seachParams.sary);
        seachParams.jy = $.trim(seachParams.jy);
        // 是否包含子部门
        seachParams.includeChild = ajglMan.includeChild;
        // 部门参数修改为orgPath
        seachParams.orgPath = seachParams.sjdw;
        seachParams.id = ajglMan.searchForm_sjdw.id
        // delete seachParams.sjdw;
        // console.log(seachParams)
        //添加默认时间为一周
        if (ajglMan.dateShow) {

            if (seachParams.bjsjStart == '' || seachParams.bjsjEnd == '') {

                if (seachParams.bjsjStart == '') {
                    ajglMan.kssj_isNull = 'block';
                } else {
                    ajglMan.kssj_isNull = 'none';
                }
                if (seachParams.bjsjEnd == '') {
                    ajglMan.jssj_isNull = 'block';
                } else {
                    ajglMan.jssj_isNull = 'none';
                }
                tableObject.loading(false);
                return;
            } else {

                if (seachParams.bjsjStart > seachParams.bjsjEnd) {
                    Tools.sayWarn('开始时间不能超过结束时间');
                    tableObject.loading(false);
                    return;
                }

                if (seachParams.bjsjEnd - seachParams.bjsjStart > 365 * 86400000) {
                    Tools.sayWarn('时间间隔不能超过一年，请重新设置！');
                    tableObject.loading(false);
                    return;
                }
            }
        } else {

            if (seachParams.bjsjStart == '' && seachParams.bjsjEnd == '') {
                var now = new Date();
                var oneDayTime = 24 * 60 * 60 * 1000;

                //显示周一
                var MondayTime = +Tools.getFirstDayOfWeek(now);
                //显示周日
                var SundayTime = MondayTime + 6 * oneDayTime;

                //初始化日期时间
                var monday = new Date(MondayTime);
                var sunday = new Date(SundayTime);

                sunday.setHours(23);
                sunday.setMinutes(59);
                sunday.setSeconds(59);
                ajglMan.$searchForm.record.bjsjEnd = Number(+sunday);

                monday.setHours(0);
                monday.setMinutes(0);
                monday.setSeconds(0);
                ajglMan.$searchForm.record.bjsjStart = Number(+monday);
            }
        };
        var ajgl_form_data = null;

        if (storage && storage.getItem) {

            if (storage.getItem('zfsypsjglpt-zfda-ajgl')) {
                ajgl_form_data = JSON.parse(storage.getItem('zfsypsjglpt-zfda-ajgl'));
            }
        } else {

        };

        if (ajgl_form_data == null) {

        } else {
            ajgl_last = ajgl_form_data;

            if (initMark) {
                seachParams = ajgl_form_data;
                page = ajgl_form_data.page;
                table.pagination.current = page + 1;
                //  this.getCurrent(page);
                //  this.handleTableChange();
            }
        };

        if (Tools.timeCalculator.getStatus() != 'last-past-of-time') {
            Tools.timeCalculator.calculate(Tools.timeCalculator.getStatus());
        }
        ajax({
            url: '/gmvcs/audio/case/search?page=' + page + '&pageSize=' + this.pagination.pageSize,
            method: 'post',
            data: seachParams,
            cache: false
        }).then(ret => {

            if (ret.code == 0) {

                if (storage && storage.setItem) {
                    ajglMan.$searchForm.record.page = page;
                    ajglMan.$searchForm.record.timeStatus = seachParams.timeStatus;
                    storage.setItem('zfsypsjglpt-zfda-ajgl', JSON.stringify(ajglMan.$searchForm.record), 0.5);
                } else {

                };

                if (!ret.data.currentElements) {
                    Tools.dealTableWithoutData();
                }

                if (ret.data.currentElements && ret.data.currentElements.length == 0) {
                    tableObject.loading(false);

                    Tools.dealTableWithoutData();
                } else {
                    ret.data.currentElements.forEach(function (val, key) {

                        if (val.relation) {
                            val.sfgl = '已关联';
                        } else {
                            val.sfgl = '未关联';
                        };
                        val.space = '';
                        val.ajlb = val.ajlbmc ? val.ajlbmc : '-';
                        val.policeSituation = val.policeSituation ? val.policeSituation : [];
                        val.jqbh = val.policeSituation.length?val.policeSituation.join(','):'-';
                        val.zbr = val.zbr ? val.zbr : '';
                        val.zbmjxm = val.zbmjxm ? val.zbmjxm + '(' + val.zbr + ')' : '-';
                        val.afsj = formatDate(val.afsj);
                        var sary = '';
                        val.involvedPeoples = val.involvedPeoples ? val.involvedPeoples : [{
                            rymc: '-'
                        }];
                        val.involvedPeoples.forEach(function (val, key) {

                            if (key == 0) {
                                sary += val.rymc;
                            } else {
                                sary += (',' + val.rymc);
                            }
                        });
                        val.sary = sary;
                    });

                    if (this.flag == 1) {
                        this.pagination.current = 1;
                    }
                    this.flag = 0;

                    this.pagination.overLimit = ret.data.overLimit;
                    this.pagination.total = this.pagination.overLimit ? ret.data.limit * 20 : ret.data.totalElements;

                    this.pagination.current = page + 1;
                    ret.data.currentElements.forEach(function (val, key) {
                        val.index = key + (table.pagination.current - 1) * table.pagination.pageSize + 1; //手动增加表格行号
                    });
                    this.remoteList = ret.data.currentElements;
                    let pageSize_table = table.pagination.pageSize;
                    tableObject.page(page + 1, pageSize_table);
                    tableObject.tableDataFnc(this.remoteList);
                    tableObject.loading(false);
                }
            } else {
                Tools.sayError('请求数据失败');
                tableObject.loading(false);
            }
        });
    },
    handleTableChange(pagination) {

        if (this.pagination.hasOwnProperty('current')) {
            this.pagination.current = pagination;
            tableObject.page(pagination, this.pagination.pageSize);
            this.fetch();
        }
    },
    nextPage(e, pagination) {

        if (this.current == 1) {
            $('#jqtbnextPage').attr("disabled", "disabled");
        } else {
            $('#jqtbnextPage').attr("disabled", false);
            ++this.current;
            this.fetch();
        }
    },
    lastPage(e, pagination) {

        if (this.current == this.pagination.total) {
            $('#jqtbnextPage').attr("disabled", "disabled");
        } else {
            $('#jqtbnextPage').attr("disabled", false);
            --this.current;
            this.fetch();
        }
    },
});

/**********通用函数工具**********/
let Tools = {
    sayError: function (word) {
        notification.error({
            message: word,
            title: '温馨提示'
        });
    },
    sayWarn: function (word) {
        notification.warn({
            message: word,
            title: '温馨提示'
        });
    },
    saySuccess: function (word) {
        notification.success({
            message: word,
            title: '温馨提示'
        });
    },
    checkIE: function () {

        if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE8.0") {
            return true;
        } else {
            return false;
        };
    },
    checkIE11: function () {

        if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "WOW64") {
            return true;
        } else {
            return false;
        };
    },
    clearForm: function () {
        table.$selectOption = [];
        ajglMan.$searchForm.record = ajgl_initialData();
    },
    getTree: function () {
        ajax({
            url: '/gmvcs/uap/org/find/fakeroot/mgr',
            method: 'get',
            data: {},
            cache: false
        }).then(ret => {

            if (!(ret.code == 0)) {
                Tools.sayError('获取部门数据失败');
                return;
            }
            Tools.checkType = ret.data.checkType;
            ajglMan.searchForm_sjdw.rdata = Tools.addIcon(ret.data);
            ajglMan.searchForm_sjdw.expandedKeys = [ret.data[0].orgPath];
            var ajgl_form_data = null;

            if (storage && storage.getItem) {

                if (storage.getItem('zfsypsjglpt-zfda-ajgl')) {
                    ajgl_form_data = JSON.parse(storage.getItem('zfsypsjglpt-zfda-ajgl'));
                }
            } else {

            };

            ajglMan.searchForm_sjdw.checkedKeys = ajgl_form_data ? ajgl_form_data.sjdw : (ret.data ? ret.data[0].orgPath : '');
            ajglMan.searchForm_sjdw.sjdw = ajgl_form_data ? [ajgl_form_data.sjdw] : [ret.data[0].orgPath];
            ajglMan.searchForm_sjdw.checkType = ret.data[0].checkType;
            ajglMan.$searchForm.record.sjdw = ajgl_form_data ? ajgl_form_data.sjdw : ret.data[0].orgPath;
            ajglMan.searchForm_sjdw.id = ajgl_form_data ? ajgl_form_data.id : ret.data[0].orgId;
            table.fetch(true, true);

            //执行用户自定义操作          
            ajax({
                url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + ajglMan.searchForm_sjdw.id + '&checkType=' + ajglMan.searchForm_sjdw.checkType,
                method: 'get',
                data: null,
                cache: false
            }).then(ret => {

                if (ret.code == 0) {

                    if (ret.data) {
                        var $tree_target = $.fn.zTree.getZTreeObj($('.tree-select-wrap .ztree').attr('id'));
                        var node = $tree_target.getNodesByParam('key', ajglMan.searchForm_sjdw.checkedKeys, null)[0];
                        $tree_target.addNodes(node, Tools.addIcon(ret.data));
                        $tree_target = null;
                        node = null;
                    } else {
                        this.sayError('请求下级部门数据失败');
                    }
                } else {
                    this.sayError('请求下级部门数据失败');
                }
            });
        });
    },
    //给tree增加图标
    addIcon: function (arr) {

        // 深拷贝原始数据
        var dataSource = JSON.parse(JSON.stringify(arr))
        var res = [];

        // 每一层的数据都 push 进 res
        res.push(...dataSource);

        // res 动态增加长度
        for (var i = 0; i < res.length; i++) {
            var curData = res[i];
            curData.icon = '/static/image/zfsypsjglpt/users.png';
            curData.key = curData.orgPath;
            curData.id = curData.orgId;
            curData.name = curData.orgName;
            curData.isParent = true;
            curData.title = curData.orgName;
            curData.children = curData.childs;

            // null数据置空
            curData.orderNo = curData.orderNo == null ? '' : curData.orderNo;
            curData.dutyRange = curData.dutyRange == null ? '' : curData.dutyRange;
            curData.extend = curData.extend == null ? '' : curData.extend;

            // 如果有 children 则 push 进 res 中待搜索
            if (curData.childs) {
                res.push(...curData.childs.map(d => {
                    return d;
                }));
            }
        }
        return dataSource;
    },
    dealTableWithoutData: function (page) {
        table.$cache[page] = [];
        table.pagination.total = table.flag == 0 ? table.pagination.total : 　0;
        table.remoteList = [];
        table.loading = false;
        tableObject.loading(false);
        $('#jqtbnextPage').attr("disabled", true);
        $('#jqtblastPage').attr("disabled", true);
        // Tools.saySuccess('无案件数据');
        return;
    },
    getFirstDayOfWeek: function (date) {
        var day = date.getDay() || 7;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day);
    },
    timeCalculator: (function () {
        var States = {
            status: 'last-week',
            'last-week': function () {
                this.status = 'last-week';
                ajglMan.dateShow = false;
                var now = new Date();
                var oneDayTime = 24 * 60 * 60 * 1000;

                //显示周一
                var MondayTime = +Tools.getFirstDayOfWeek(now);
                //显示周日
                var SundayTime = MondayTime + 6 * oneDayTime;

                //初始化日期时间
                var monday = new Date(MondayTime);
                var sunday = new Date(SundayTime);

                //初始化日期时间
                var monday = new Date(MondayTime);
                var sunday = new Date(SundayTime);
                monday.setHours(0);
                monday.setMinutes(0);
                monday.setSeconds(0);
                sunday.setHours(23);
                sunday.setMinutes(59);
                sunday.setSeconds(59);

                ajglMan.$searchForm.record.bjsjEnd = Number(+sunday);
                ajglMan.$searchForm.record.bjsjStart = Number(+monday);
                ajglMan.kssj_isNull = 'none';
                ajglMan.jssj_isNull = 'none';
                $('.timeCover .ane-datepicker-input').val('');
                now = null;
                oneDayTime = null;
                MondayTime = null;
                SundayTime = null;
                monday = null;
                sunday = null;
            },
            'last-month': function (jh) {
                this.status = 'last-month';
                ajglMan.dateShow = false;
                var now = new Date();
                now.setDate(1);
                now.setHours(0);
                now.setMinutes(0);
                now.setSeconds(0);

                var date = new Date();
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var d = new Date(year, month, 0);

                var end = new Date();
                end.setDate(d.getDate());
                end.setHours(23);
                end.setMinutes(59);
                end.setSeconds(59);

                ajglMan.$searchForm.record.bjsjEnd = Number(+end);
                ajglMan.$searchForm.record.bjsjStart = Number(+now);
                ajglMan.kssj_isNull = 'none';
                ajglMan.jssj_isNull = 'none';
                $('.timeCover .ane-datepicker-input').val('');
                now = null;
                date = null;
                year = null;
                month = null;
                d = null;
                end = null;
            },
            'last-past-of-time': function (jh) {
                this.status = 'last-past-of-time';
                ajglMan.dateShow = true;
                var now = new Date();
                now.setHours(23);
                now.setMinutes(59);
                now.setSeconds(59);
                var end = new Date();
                ajglMan.$searchForm.record.bjsjEnd = Number(+now);
                end.setMonth(now.getMonth() - 3 + '');
                end.setHours(0);
                end.setMinutes(0);
                end.setSeconds(0);
                ajglMan.$searchForm.record.bjsjStart = Number(+end);
                $('.top-form').find($("[placeholder = '开始时间']")).val(formatDate(+end, true));
                $('.top-form').find($("[placeholder = '结束时间']")).val(formatDate(+now, true));
            }
        };
        return {
            calculate: function (type) {
                States[type] && States[type]();
            },
            getStatus: function () {
                return States.status;
            },
            setStatus: function (sts) {
                States.status = sts;
            }
        };
    })(),
    init: function () {

    }
};
/**********查询表单初始化函数(需单独提出)**********/
function ajgl_initialData() {
    return {
        bjsjEnd: '',
        bjsjStart: '',
        sjdw: '',
        ajbh: '',
        ajmc: '',
        jqbh: '',
        gllb: '99',
        sary: '',
        jy: '',
        includeChild: false,
    };
}

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
//时间戳转日期
function formatDate(date, day) {
    var d = new Date(date);
    var year = d.getFullYear();
    var month = (d.getMonth() + 1) < 10 ? ("0" + (d.getMonth() + 1)) : (d.getMonth() + 1);
    var date = d.getDate() < 10 ? ("0" + d.getDate()) : d.getDate();
    var hour = d.getHours() < 10 ? ("0" + d.getHours()) : d.getHours();
    var minute = d.getMinutes() < 10 ? ("0" + d.getMinutes()) : d.getMinutes();
    var second = d.getSeconds() < 10 ? ("0" + d.getSeconds()) : d.getSeconds();

    if (day) {
        return year + "-" + month + "-" + date + "";
    } else {
        return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
    }
}
avalon.filters.formatDate = function (str) {

    if (str == '' || str == null) {
        return '-';
    } else {
        return formatDate(str);
    }
};
avalon.filters.checkNull = function (str) {

    if (str === '' || str === null) {
        return '-';
    } else {
        return str;
    }
};
let tableBodyAJGL = avalon.define({ //表格定义组件
    $id: 'ajgl_table',
    data: [],
    key: 'jqbh',
    currentPage: 1,
    prePageSize: 20,
    isColDrag: true, //true代表表格列宽可以拖动
    dragStorageName: 'ajgl-tableDrag-style', //表格拖动样式style存储storage名称，另外：在表格内所有元素中切记不要使用style定义样式以免造成影响
    loading: false,
    paddingRight: 0, //有滚动条时内边距
    checked: [],
    isAllChecked: false,
    selection: [],
    handle: function (type, col, record, $index) { //操作函数
        var extra = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            extra[_i - 4] = arguments[_i];
        }
        var text = record[col].$model || record[col];
        table.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});
let tableObject = {};