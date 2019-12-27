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

require('/apps/zfsypsjglpt/zfsypsjglpt-zfda-jqgl_gongan.css');
export const name = 'zfsypsjglpt-zfda-jqgl_gongan';

let jqglMan = null;
let jqgl_ck_Man = null;
let jqgl_last = null;
avalon.component(name, {
    template: __inline('./zfsypsjglpt-zfda-jqgl_gongan.html'),
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
            record: jqgl_initialData()
        }),
        jqgl_search() {
            table.fetch(true);
        },
        bh: '',
        //处警单位
        searchForm_cjdw: avalon.define({
            $id: 'searchFormcjdw',
            rdata: [],
            checkedKeys: [],
            expandedKeys: [],
            cjdw: [''],
            checkType: '',
            id: '',
            handleChange(event, treeId, treeNode, treeTarget) {
                jqglMan.$searchForm.record.cjdw = treeNode.orgPath;
                this.checkedKeys = treeNode.orgName;
                this.id = treeNode.id;
                this.selectedTitle = treeNode.orgName;
                this.checkType = treeNode.checkType;
            },
            selectedTitle: ''
        }),
        year: new Date().getFullYear(),
        //报警时间
        dateShow: false,
        kssj_isNull: 'none',
        jssj_isNull: 'none',
        searchForm_bjsj: avalon.define({
            $id: 'jqgl_searchForm_bjsj',
            bjsj: ['last-week'],
            searchForm_bjsj_Change(e, a) {

                //时间的问题尚不够完善待修改
                Tools.timeCalculator.calculate(e.target.value);
            }
        }),
        enter_click(e) {

            if (e.target.name == 'sfdd') {
                $(e.target).val($(e.target).val().replace(/[`~!.\-_;:,""@\?#$%^&*+<>\\\|{}\/'[\]]/img, ''));
                this.$searchForm.record['sfdd'] = this.$searchForm.record[e.target.name].replace(/[`~!.\-_;:,""@\?#$%^&*+<>\\\|{}\/'[\]]/img, '');
            } else {
                $(e.target).val($(e.target).val().replace(/[`~!.;:,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, ''));
                this.$searchForm.record[e.target.name] = $(e.target).val();
                this.$searchForm.record[e.target.name] = this.$searchForm.record[e.target.name].replace(/[`~!.:;,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, '');
            }

            if (e.keyCode == "13") {
                table.fetch(true);
            }
        },
        topform_start_time: '',
        topform_end_time: '',
        startTimeHandleChange(e) {

            if (e.target.value) {
                jqglMan.$searchForm.record.bjsjStart = Number(getTimeByDateStr(e.target.value + ' 00:00:00'));
                jqglMan.kssj_isNull = 'none';
            } else {
                jqglMan.kssj_isNull = 'block';
                jqglMan.$searchForm.record.bjsjStart = '';
            }
        },
        endTimeHandleChange(e) {

            if (e.target.value) {
                jqglMan.jssj_isNull = 'none';
                jqglMan.$searchForm.record.bjsjEnd = Number(getTimeByDateStr(e.target.value + ' 23:59:59'));
            } else {
                jqglMan.jssj_isNull = 'block';
                jqglMan.$searchForm.record.bjsjEnd = '';
            }
        },

        //input控件
        jqgl_close_bjr: false,
        jqgl_close_cjr: false,
        jqgl_close_bjdh: false,
        jqgl_close_sfdd: false,
        jqgl_close_jqbh: false,
        close_click(e) {
            switch (e) {
                case 'bjr':
                    $('.top-form').find($("[name = 'bjr']")).val('');
                    $('.top-form').find($("[name = 'bjr']")).focus();
                    jqglMan.$searchForm.record.bjr = '';
                    break;
                case 'cjr':
                    $('.top-form').find($("[name = 'cjr']")).val('');
                    $('.top-form').find($("[name = 'cjr']")).focus();
                    jqglMan.$searchForm.record.cjr = '';
                    break;
                case 'bjdh':
                    $('.top-form').find($("[name = 'bjdh']")).val('');
                    $('.top-form').find($("[name = 'bjdh']")).focus();
                    jqglMan.$searchForm.record.bjdh = '';
                    break;
                case 'sfdd':
                    $('.top-form').find($("[name = 'sfdd']")).val('');
                    $('.top-form').find($("[name = 'sfdd']")).focus();
                    jqglMan.$searchForm.record.sfdd = '';
                    break;
                case 'jqbh':
                    $('.top-form').find($("[name = 'jqbh']")).val('');
                    $('.top-form').find($("[name = 'jqbh']")).focus();
                    jqglMan.$searchForm.record.jqbh = '';
                    break;
            }
        },
        input_focus(e) {
            switch (e) {
                case 'bjr':
                    this.jqgl_close_bjr = true;
                    break;
                case 'cjr':
                    this.jqgl_close_cjr = true;
                    break;
                case 'bjdh':
                    this.jqgl_close_bjdh = true;
                    break;
                case 'sfdd':
                    this.jqgl_close_sfdd = true;
                    break;
                case 'jqbh':
                    this.jqgl_close_jqbh = true;
                    break;
            }
        },
        input_blur(e, name) {

            if (e.target.name == 'sfdd') {
                $(e.target).val($(e.target).val().replace(/[`~!.\-_;:,""@\?#$%^&*+<>\\\|{}\/'[\]]/img, ''));
                this.$searchForm.record['sfdd'] = this.$searchForm.record[e.target.name].replace(/[`~!.\-_;:,""@\?#$%^&*+<>\\\|{}\/'[\]]/img, '');
            } else {
                $(e.target).val($(e.target).val().replace(/[`~!.;:,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, ''));
                this.$searchForm.record[e.target.name] = $(e.target).val();
                this.$searchForm.record[e.target.name] = this.$searchForm.record[e.target.name].replace(/[`~!.:;,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, '');
            }
            switch (name) {
                case 'bjr':
                    this.jqgl_close_bjr = false;
                    break;
                case 'cjr':
                    this.jqgl_close_cjr = false;
                    break;
                case 'bjdh':
                    this.jqgl_close_bjdh = false;
                    break;
                case 'sfdd':
                    this.jqgl_close_sfdd = false;
                    break;
                case 'jqbh':
                    this.jqgl_close_jqbh = false;
                    break;
            }
        },
        //关联媒体
        searchForm_glmt: avalon.define({
            $id: 'searchForm_glmt',
            glmt: ['99'],
            searchForm_glmt_Change(e, a) {
                jqglMan.$searchForm.record.glmt = e.target.value;
            }
        }),
        jqbh: '',
        bjr: '',
        cjr: '',
        bjdh: '',
        sfdd: '',
        jqgl_check: avalon.define({
            $id: "jqgl_check",
            authority: { // 按钮权限标识
                "CHECK": false, //音视频库_执法档案_警情关联_查看
                "SEARCH": false, //音视频库_执法档案_警情关联_查询
                "OPT_SHOW": false //操作栏显示方式
            }
        }),
        toggleShow: true,

        onInit(event) {
            tableObject = $.tableIndex({ //初始化表格jq插件
                id: 'jqgl_table',
                tableBody: tableBodyJQGL
            });
            jqglMan = this;
            jqgl_ck_Man = this;
            Tools.clearForm(); //在模块切换时重置所有的查询表单字段
            var jqgl_form_data = null;

            if (storage && storage.getItem) {

                if (storage.getItem('zfsypsjglpt-zfda-jqgl')) {
                    jqgl_form_data = JSON.parse(storage.getItem('zfsypsjglpt-zfda-jqgl'));
                } else {

                }
            } else {

            };

            if (jqgl_form_data) {
                this.$searchForm.record.jqbh = this.jqbh = jqgl_form_data.jqbh;
                this.$searchForm.record.bjr = this.bjr = jqgl_form_data.bjr;
                this.$searchForm.record.cjr = this.cjr = jqgl_form_data.cjr;
                this.$searchForm.record.bjdh = this.bjdh = jqgl_form_data.bjdh;
                this.$searchForm.record.sfdd = this.sfdd = jqgl_form_data.sfdd;
                this.$searchForm.record.glmt = jqgl_form_data.glmt;
                this.searchForm_glmt.glmt = [jqgl_form_data.glmt];
                this.$searchForm.record.bjsjStart = jqgl_form_data.bjsjStart;
                this.$searchForm.record.bjsjEnd = jqgl_form_data.bjsjEnd;
                Tools.timeCalculator.setStatus(jqgl_form_data.timeStatus);
                this.$searchForm.record.includeChild = this.includeChild = jqgl_form_data.includeChild;

                var date = new Date();
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var d = new Date(year, month, 0);

                if (jqgl_form_data.timeStatus == 'last-week') {
                    this.searchForm_bjsj.bjsj = ['last-week'];
                    jqglMan.$searchForm.record.timeStatus = 'last-week';
                } else if (jqgl_form_data.timeStatus == 'last-month') {
                    this.searchForm_bjsj.bjsj = ['last-month'];
                    jqglMan.$searchForm.record.timeStatus = 'last-month';
                } else {
                    this.searchForm_bjsj.bjsj = ['last-past-of-time'];
                    jqglMan.$searchForm.record.timeStatus = 'last-past-of-time';
                    this.dateShow = true;
                    this.topform_start_time = formatDate(jqgl_form_data.bjsjStart, true);
                    this.topform_end_time = formatDate(jqgl_form_data.bjsjEnd, true);
                }
            }

            // 查看、查询按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_ZFDA_JQGL/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询无权限时页面留白
                    $('#aqglTable').css('top', '6px');
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_ZFDA_JQGL_CHECK":
                            jqglMan.jqgl_check.authority.CHECK = true;
                            break;
                        case "AUDIO_FUNCTION_ZFDA_JQGL_SEARCH":
                            jqglMan.jqgl_check.authority.SEARCH = true;
                            break;
                    }
                });

                if (false == jqglMan.jqgl_check.authority.CHECK)
                    jqglMan.jqgl_check.authority.OPT_SHOW = true;

                // 防止查询无权限时页面留白
                if (false == jqglMan.jqgl_check.authority.SEARCH)
                    $('#aqglTable').css('top', '6px');
            });
        },
        onReady() {
            Tools.getTree();
        },
        onDispose() {

        }
    }
});

/**********查询得来的表格**********/
let table = avalon.define({
    $id: 'jqgl-table',
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
    getPageSize(pageSize) {
        this.pagination.pageSize = pageSize;
    },
    actions(type, text, record, index) {

        if (type == 'checkLook') {
            window.jqgl_bh = record.jqbh;
            avalon.history.setHash('/zfsypsjglpt-zfda-jqgl-detail_gongan');
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

        if (!search) {
            var page = this.pagination.current == 0 ? 0 : this.pagination.current - 1;
            this.ajax_table(initMark);
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
            seachParams = jqglMan.$searchForm.record;
        seachParams.jqbh = $.trim(seachParams.jqbh);
        seachParams.bjr = $.trim(seachParams.bjr);
        seachParams.cjr = $.trim(seachParams.cjr);
        seachParams.bjdh = $.trim(seachParams.bjdh);
        seachParams.sfdd = $.trim(seachParams.sfdd);
        // 是否包含子部门
        seachParams.includeChild = jqglMan.includeChild;
        // 部门参数修改为orgPath
        seachParams.orgPath = seachParams.cjdw;
        // delete seachParams.cjdw;
        seachParams.id = jqglMan.searchForm_cjdw.id;
        this.loading = true;
        seachParams.timeStatus = Tools.timeCalculator.getStatus();

        //添加默认时间为一周
        if (jqglMan.dateShow) {

            if (seachParams.bjsjStart == '' || seachParams.bjsjEnd == '') {

                if (seachParams.bjsjStart == '') {
                    jqglMan.kssj_isNull = 'block';
                } else {
                    jqglMan.kssj_isNull = 'none';
                }
                if (seachParams.bjsjEnd == '') {
                    jqglMan.jssj_isNull = 'block';
                } else {
                    jqglMan.jssj_isNull = 'none';
                }
                this.loading = false;
                return;
            } else {

                if (seachParams.bjsjStart >= seachParams.bjsjEnd) {
                    Tools.sayWarn('开始时间不能超过结束时间');
                    this.loading = false;
                    return;
                }

                if (seachParams.bjsjEnd - seachParams.bjsjStart > 365 * 86400000) {
                    Tools.sayWarn('时间间隔不能超过一年，请重新设置！');
                    this.loading = false;
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
                jqglMan.$searchForm.record.bjsjEnd = Number(+sunday);

                monday.setHours(0);
                monday.setMinutes(0);
                monday.setSeconds(0);
                jqglMan.$searchForm.record.bjsjStart = Number(+monday);
            }
        };
        var jqgl_form_data = null;
        if (storage && storage.getItem) {

            if (storage.getItem('zfsypsjglpt-zfda-jqgl')) {
                jqgl_form_data = JSON.parse(storage.getItem('zfsypsjglpt-zfda-jqgl'));
            } else {

            }
        } else {

        };

        if (jqgl_form_data == null) {

        } else {
            jqgl_last = jqgl_form_data;

            if (initMark) {
                seachParams = jqgl_form_data;
                page = jqgl_form_data.page;
                table.pagination.current = page + 1;
            }
        }

        if (Tools.timeCalculator.getStatus() != 'last-past-of-time') {
            Tools.timeCalculator.calculate(Tools.timeCalculator.getStatus());
        }
        ajax({
            url: '/gmvcs/audio/policeSituation/search?page=' + page + '&pageSize=' + this.pagination.pageSize,
            method: 'post',
            data: seachParams,
            cache: false
        }).then(ret => {

            if (ret.code == 0) {

                if (storage && storage.setItem) {
                    jqglMan.$searchForm.record.page = page;
                    jqglMan.$searchForm.record.timeStatus = seachParams.timeStatus;
                    storage.setItem('zfsypsjglpt-zfda-jqgl', JSON.stringify(jqglMan.$searchForm.record), 0.5);
                } else {

                };
                if (!ret.data.currentElements) {
                    Tools.dealTableWithoutData();
                }

                if (ret.data.currentElements && ret.data.currentElements.length == 0) {
                    tableObject.loading(false);
                    Tools.dealTableWithoutData();
                } else {

                    for (var i = 0, len = ret.data.currentElements.length; i < len; i++) {

                        if (ret.data.currentElements[i].glgs == 0) {
                            ret.data.currentElements[i].glgs = '否';
                        } else {
                            ret.data.currentElements[i].glgs = '是';
                        };
                        ret.data.currentElements[i].space = '';
                        ret.data.currentElements[i].jqlb = ret.data.currentElements[i].jqlbmc ? ret.data.currentElements[i].jqlbmc : '-';
                        ret.data.currentElements[i].glgs = ret.data.currentElements[i].relation ? '已关联' : '未关联';
                        ret.data.currentElements[i].bjsj = formatDate(ret.data.currentElements[i].bjsj);
                        ret.data.currentElements[i].cjr = ret.data.currentElements[i].cjrxm.join(',')+'('+ret.data.currentElements[i].cjr.join(',')+')';//处警人
                        ret.data.currentElements[i].cjdwmc = ret.data.currentElements[i].cjdwmc.join(',');
                    };

                    if (this.flag == 1) {
                        this.pagination.current = 1;
                    }
                    this.flag = 0;
                    this.pagination.current = page + 1;
                    this.pagination.overLimit = ret.data.overLimit;
                    this.pagination.total = this.pagination.overLimit ? ret.data.limit * 20 : ret.data.totalElements;

                    ret.data.currentElements.forEach(function (val, key) {
                        val.index = key + (table.pagination.current - 1) * table.pagination.pageSize + 1; //手动增加表格行号
                    });
                    this.$cache[page] = this.remoteList = ret.data.currentElements;
                    let pageSize_table = table.pagination.pageSize;
                    tableObject.page(page + 1, pageSize_table);
                    tableObject.tableDataFnc(this.remoteList);
                    tableObject.loading(false);
                    this.loading = false;
                }
            } else {
                message.error({
                    content: '请求数据失败'
                });
                this.loading = false;
            }
        }, () => {
            this.loading = false;
        });
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
    handleTableChange(pagination) {

        if (this.pagination.hasOwnProperty('current')) {
            this.pagination.current = pagination;
            tableObject.page(pagination, this.pagination.pageSize);
            this.fetch();
        }
    }
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
            };
            jqglMan.searchForm_cjdw.rdata = Tools.addIcon(ret.data);
            jqglMan.searchForm_cjdw.expandedKeys = [ret.data[0].orgPath];
            var jqgl_form_data = null;

            if (storage && storage.getItem) {

                if (storage.getItem('zfsypsjglpt-zfda-jqgl')) {
                    jqgl_form_data = JSON.parse(storage.getItem('zfsypsjglpt-zfda-jqgl'));
                } else {

                }
            } else {

            };
            jqglMan.searchForm_cjdw.checkedKeys = jqgl_form_data ? jqgl_form_data.cjdw : (ret.data ? ret.data[0].orgPath : '');
            jqglMan.searchForm_cjdw.cjdw = jqgl_form_data ? jqgl_form_data.cjdw : ret.data[0].orgPath;
            jqglMan.searchForm_cjdw.checkType = ret.data[0].checkType;
            jqglMan.$searchForm.record.cjdw = jqgl_form_data ? jqgl_form_data.cjdw : ret.data[0].orgPath;
            jqglMan.searchForm_cjdw.id = jqgl_form_data ? jqgl_form_data.id : ret.data[0].orgId;
            table.fetch(true, true);

            //执行用户自定义操作          
            ajax({
                url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + jqglMan.searchForm_cjdw.id + '&checkType=' + jqglMan.searchForm_cjdw.checkType,
                method: 'get',
                data: null,
                cache: false
            }).then(ret => {

                if (ret.code == 0) {

                    if (ret.data) {
                        var $tree_target = $.fn.zTree.getZTreeObj($('.tree-select-wrap .ztree').attr('id'));
                        var node = $tree_target.getNodesByParam('key', jqglMan.searchForm_cjdw.checkedKeys, null)[0];
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
        var dataSource = JSON.parse(JSON.stringify(arr));
        var res = [];

        // 每一层的数据都 push 进 res
        res.push(...dataSource);

        // res 动态增加长度
        for (var i = 0; i < res.length; i++) {
            var curData = res[i];
            curData.icon = '/static/image/zfsypsjglpt/users.png';
            curData.key = curData.orgPath;
            curData.isParent = true;
            curData.name = curData.orgName;
            curData.title = curData.orgName;
            curData.id = curData.orgId;
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
    clearForm: function () {
        // table.$selectOption = [];
        jqglMan.$searchForm.record = jqgl_initialData();
    },
    dealTableWithoutData: function (page) {
        table.$cache[page] = [];
        table.pagination.total = table.flag == 0 ? table.pagination.total : 0;
        table.remoteList = [];
        table.loading = false;
        tableObject.loading(false);
        $('#jqtbnextPage').attr("disabled", true);
        $('#jqtblastPage').attr("disabled", true);
        // Tools.saySuccess('无警情数据');
        return;
    },
    getFirstDayOfWeek: function (date) {
        var day = date.getDay() || 7;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day);
    },
    timeCalculator: (function () {
        var States = {
            status: 'last-week', //用以判断请求时时间处在哪种model
            'last-week': function () {
                this.status = 'last-week';
                jqglMan.dateShow = false;
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
                jqglMan.$searchForm.record.bjsjEnd = Number(+sunday);

                monday.setHours(0);
                monday.setMinutes(0);
                monday.setSeconds(0);
                jqglMan.$searchForm.record.bjsjStart = Number(+monday);
                jqglMan.kssj_isNull = 'none';
                jqglMan.jssj_isNull = 'none';
                $('.timeCover_jq .ane-datepicker-input').val('');
                now = null;
                oneDayTime = null;
                MondayTime = null;
                SundayTime = null;
                monday = null;
                sunday = null;
            },
            'last-month': function (jh) {
                this.status = 'last-month';
                jqglMan.dateShow = false;
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

                jqglMan.$searchForm.record.bjsjEnd = Number(+end);
                jqglMan.$searchForm.record.bjsjStart = Number(+now);
                jqglMan.kssj_isNull = 'none';
                jqglMan.jssj_isNull = 'none';
                $('.timeCover_jq .ane-datepicker-input').val('');
                now = null;
                date = null;
                year = null;
                month = null;
                d = null;
                end = null;
            },
            'last-past-of-time': function (jh) {
                this.status = 'last-past-of-time';
                jqglMan.dateShow = true;
                var now = new Date();
                now.setHours(23);
                now.setMinutes(59);
                now.setSeconds(59);
                var end = new Date();
                jqglMan.$searchForm.record.bjsjEnd = Number(+now);
                end.setMonth(now.getMonth() - 3 + '');
                end.setHours(0);
                end.setMinutes(0);
                end.setSeconds(0);
                jqglMan.$searchForm.record.bjsjStart = Number(+end);
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
function jqgl_initialData() {
    return {
        bjsjEnd: '',
        bjsjStart: '',
        cjdw: '',
        glmt: '99',
        jqbh: '',
        bjr: '',
        cjr: '',
        bjdh: '',
        // jqlb:'',
        sfdd: '',
        includeChild: false,
    }
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

let tableBodyJQGL = avalon.define({ //表格定义组件
    $id: 'jqgl_table',
    data: [],
    key: 'jqbh',
    currentPage: 1,
    prePageSize: 20,
    loading: false,
    isColDrag: true, //true代表表格列宽可以拖动
    dragStorageName: 'jqgl-tableDrag-style', //表格拖动样式style存储storage名称，另外：在表格内所有元素中切记不要使用style定义样式以免造成影响
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