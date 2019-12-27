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
import {
    Gm
} from '../common/common-tools.js';
require('/apps/zfsypsjglpt/zfsypsjglpt-zfda-jqgl_gongan.css');
require('/apps/zfsypsjglpt/zfsypsjglpt-jdkp-kpcczl-ck-sgcl.css');
export const name = 'zfsypsjglpt-jdkp-kpcczl-ck-sgcl';

let jqglMan = null;
let jqgl_last = null;
avalon.component(name, {
    template: __inline('./zfsypsjglpt-jdkp-kpcczl-ck-sgcl.html'),
    defaults: {

        // 版权信息
        copyRight: copyRight,
        telephone: telephone,

        //返回
        all_back() {
            avalon.history.setHash('/zfsypsjglpt-jdkp-kpcczl');
        },

        //查询表单
        $searchForm: createForm({
            autoAsyncChange: true,
            onFieldsChange: function () {

            },
            record: jqgl_initialData()
        }),
        jqgl_search() {
            jqglMan.fetch(true);
        },

        //处警单位
        searchForm_cjdw: avalon.define({
            $id: 'sgcl_zqbm',
            rdata: [],
            treeId: 'sgcl_tree',
            checkedKeys: [],
            expandedKeys: [],
            cjdw: [''],
            checkType: '',
            handleChange(event, treeId, treeNode, treeTarget) {
                ({
                    key: jqglMan.$searchForm.record.zqbm,
                    orgName: this.checkedKeys,
                    orgName: this.selectedTitle,
                    checkType: this.checkType
                } = treeNode);
            },
            selectedTitle: ''
        }),

        //报警时间
        dateShow: false,
        kssj_isNull: 'none',
        jssj_isNull: 'none',
        searchForm_bjsj: avalon.define({
            $id: 'sgcl_wfsj',
            bjsj: ['last-week'],
            callback: {
                week(ret) {
                    jqglMan.dateShow = false;
                    jqglMan.kssj_isNull = 'none';
                    jqglMan.jssj_isNull = 'none';
                    $('.timeCover_jq .ane-datepicker-input').val('');
                },
                month(ret) {
                    let _this = this;
                    this.week();
                },
                others(ret) {
                    jqglMan.dateShow = true;
                    $('.sgcl-form').find($("[placeholder = '开始时间']")).val(Format.formatDate(+ret.end, true));
                    $('.sgcl-form').find($("[placeholder = '结束时间']")).val(Format.formatDate(+ret.now, true));
                }
            },
            calcutor: null,
            searchForm_bjsj_Change(e, a) {
                this.calcutor.calculate(e.target.value, jqglMan.$searchForm.record, 'bjsjEnd', 'bjsjStart');
            }
        }),
        enter_click(e) {

            if (e.target.name == 'sfdd') {
                $(e.target).val($(e.target).val().replace(Reg.illegal_wfdd, ''));
                this.$searchForm.record['sfdd'] = this.$searchForm.record[e.target.name].replace(Reg.illegal_wfdd, '');
            } else {
                $(e.target).val($(e.target).val().replace(Reg.illegal_word, ''));
                this.$searchForm.record[e.target.name] = this.$searchForm.record[e.target.name].replace(Reg.illegal_word, '');
            }

            if (e.keyCode == "13") {
                jqglMan.fetch(true);
            }
        },
        topform_start_time: '',
        topform_end_time: '',
        startTimeHandleChange(e) {
            jqglMan.$searchForm.record.bjsjStart = e.target.value ? Number(Format.getTimeByDateStr(e.target.value + ' 00:00:00')) : '';
            jqglMan.kssj_isNull = e.target.value ? 'none' : 'block';
        },
        endTimeHandleChange(e) {
            jqglMan.$searchForm.record.bjsjEnd = e.target.value ? Number(Format.getTimeByDateStr(e.target.value + ' 23:59:59')) : '';
            jqglMan.jssj_isNull = e.target.value ? 'none' : 'block';
        },

        //input控件
        sgcl_close_sgdd: false,
        sgcl_close_jyjh: false,
        sgcl_close_sgbh: false,
        sgcl_close_cphm: false,
        close_click(e) {
            $('.top-form').find($("[name = " + e + "]")).val('');
            $('.top-form').find($("[name = " + e + "]")).focus();
            jqglMan.$searchForm.record[e] = '';
        },
        input_focus(e) {
            this['sgcl_close_' + e] = true;
        },
        input_blur(e) {
            this['sgcl_close_' + e] = false;
        },
        sgdd: '',
        jyjh: '',
        sgbh: '',
        cphm: '',
        sgcl_check: avalon.define({
            $id: "sgcl_check",
            authority: { // 按钮权限标识
                "CHECK": false, //音视频库_执法档案_警情关联_查看
                "SEARCH": false, //音视频库_执法档案_警情关联_查询
                "OPT_SHOW": false //操作栏显示方式
            }
        }),
        toggleShow: true,

        //table
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
                avalon.history.setHash('/zfsypsjglpt-jdkp-jycx-ykp_jiaojing');
            }
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
            Object.keys(seachParams).forEach((prop) => {
                seachParams[prop] = seachParams[prop].toString().trim();
            });
            this.loading = true;
            seachParams.timeStatus = jqglMan.searchForm_bjsj.calcutor.getStatus();

            //添加默认时间为一周
            if (jqglMan.dateShow) {

                if (seachParams.bjsjStart == '' || seachParams.bjsjEnd == '') {
                    jqglMan.kssj_isNull = seachParams.bjsjStart == '' ? 'block' : 'none';
                    jqglMan.jssj_isNull = seachParams.bjsjEnd == '' ? 'block' : 'none';
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
                    jqglMan.searchForm_bjsj.calcutor.calculate('last-week', jqglMan.$searchForm.record, 'bjsjEnd', 'bjsjStart');
                }
            };
            var jqgl_form_data = Tools.getStorage('zfsypsjglpt-jdkp-kpcczl-ck-sgcl');

            if (jqgl_form_data == null) {

            } else {
                jqgl_last = jqgl_form_data;

                if (initMark) {
                    seachParams = jqgl_form_data;
                    page = jqgl_form_data.page;
                    jqglMan.pagination.current = page + 1;
                }
            }

            if (jqglMan.searchForm_bjsj.calcutor.getStatus() != 'last-past-of-time') {
                jqglMan.searchForm_bjsj.calcutor.calculate(jqglMan.searchForm_bjsj.calcutor.getStatus(), jqglMan.$searchForm.record, 'bjsjEnd', 'bjsjStart');
            }
            this.getTableData(seachParams, page);
        },
        getTableData(seachParams, page) {
            ajax({
                // url: '/gmvcs/audio/policeSituation/search?page=' + page + '&pageSize=' + this.pagination.pageSize,
                url: '/api/faketable.json',
                method: 'post',
                data: seachParams,
                cache: false
            }).then(ret => {

                if (ret.code == 0) {

                    //test
                    this.flag = 0;
                    this.pagination.current = page + 1;
                    this.pagination.total = ret.list.length;
                    ret.list.forEach(function (val, key) {
                        val.index = key + (jqglMan.pagination.current - 1) * jqglMan.pagination.pageSize + 1; //手动增加表格行号
                    });
                    this.$cache[page] = this.remoteList = ret.list;
                    let pageSize_table = jqglMan.pagination.pageSize;

                    tableObject.page(page + 1, pageSize_table);
                    tableObject.tableDataFnc(ret.list);
                    tableObject.loading(false);
                    this.loading = false;
                    return;
                    //
                    Tools.setStorage('zfsypsjglpt-jdkp-kpcczl-ck-jycxkp', jqglMan.$searchForm.record, 0.5, function () {
                        jqglMan.$searchForm.record.page = page;
                        jqglMan.$searchForm.record.timeStatus = seachParams.timeStatus;
                    });

                    if (!ret.data.currentElements) {
                        Tools.dealTableWithoutData();
                    }

                    if (ret.data.currentElements && ret.data.currentElements.length == 0) {
                        tableObject.loading(false);
                        Tools.dealTableWithoutData();
                    } else {

                        for (var i = 0, len = ret.data.currentElements.length; i < len; i++) {

                            //这里处理拿到的数据
                        };

                        if (this.flag == 1) {
                            this.pagination.current = 1;
                        }
                        this.flag = 0;
                        this.pagination.current = page + 1;
                        this.pagination.overLimit = ret.data.overLimit;
                        this.pagination.total = this.pagination.overLimit ? ret.data.limit * 20 : ret.data.totalElements;

                        ret.data.currentElements.forEach(function (val, key) {
                            val.index = key + (jqglMan.pagination.current - 1) * jqglMan.pagination.pageSize + 1; //手动增加表格行号
                        });
                        this.$cache[page] = this.remoteList = ret.data.currentElements;
                        let pageSize_table = jqglMan.pagination.pageSize;
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
        },

        onInit(event) {
            jqglMan = this;

            this.searchForm_bjsj.calcutor = Tools.timeCalculator();
            this.searchForm_bjsj.calcutor.setCallBack(this.searchForm_bjsj.callback);
            tableObject = $.tableIndex({ //初始化表格jq插件
                id: 'sgcl_table',
                tableBody: tableBodyJQGL
            });
            Tools.clearForm(); //在模块切换时重置所有的查询表单字段
            var jqgl_form_data = Tools.getStorage('zfsypsjglpt-jdkp-kpcczl-ck-sgcl');

            if (jqgl_form_data) {
                Gm_tool.assign(this.$searchForm.record, jqgl_form_data);
                ({
                    sgdd: this.sgdd,
                    jyjh: this.jyjh,
                    sgbh: this.sgbh,
                    cphm: this.cphm,
                } = jqgl_form_data);
                this.searchForm_bjsj.calcutor.setStatus(jqgl_form_data.timeStatus);
                this.searchForm_bjsj.bjsj = [jqgl_form_data.timeStatus];

                if (jqgl_form_data.timeStatus == 'last-past-of-time') {
                    this.dateShow = true;
                    this.topform_start_time = Format.formatDate(jqgl_form_data.bjsjStart, true);
                    this.topform_end_time = Format.formatDate(jqgl_form_data.bjsjEnd, true);
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
                            jqglMan.sgcl_check.authority.CHECK = true;
                            break;
                        case "AUDIO_FUNCTION_ZFDA_JQGL_SEARCH":
                            jqglMan.sgcl_check.authority.SEARCH = true;
                            break;
                    }
                });

                if (false == jqglMan.sgcl_check.authority.CHECK)
                    jqglMan.sgcl_check.authority.OPT_SHOW = true;

                // 防止查询无权限时页面留白
                if (false == jqglMan.sgcl_check.authority.SEARCH)
                    $('#aqglTable').css('top', '6px');
            });
        },
        onReady() {
            $('.popover').hide();
            Tools.getTree();
        },
        onDispose() {

        }
    }
});


/**********通用函数工具**********/
let Tools = {
    handleTreeLeaf(curData) {
        curData.icon = '/static/image/zfsypsjglpt/users.png';
        curData.key = curData.orgId;
        curData.isParent = true;
        curData.name = curData.orgName;
        curData.title = curData.orgName;
        curData.children = curData.childs || [];
        curData.parent = curData.parent || '';
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
            jqglMan.searchForm_cjdw.rdata = Tools.addIcon(ret.data, (curData) => {
                Tools.handleTreeLeaf(curData);
            });
            jqglMan.searchForm_cjdw.expandedKeys = [ret.data[0].orgId];
            var jqgl_form_data = Tools.getStorage('zfsypsjglpt-jdkp-kpcczl-ck-sgcl');
            jqglMan.searchForm_cjdw.checkedKeys = jqgl_form_data ? jqgl_form_data.cjdw : (ret.data ? ret.data[0].orgId : '');
            jqglMan.searchForm_cjdw.cjdw = jqgl_form_data ? jqgl_form_data.cjdw : ret.data[0].orgId;
            jqglMan.searchForm_cjdw.checkType = ret.data[0].checkType;
            jqglMan.$searchForm.record.cjdw = jqgl_form_data ? jqgl_form_data.cjdw : ret.data[0].orgId;
            jqglMan.fetch(true, true);

            //执行用户自定义操作          
            ajax({
                url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + jqglMan.searchForm_cjdw.checkedKeys + '&checkType=' + jqglMan.searchForm_cjdw.checkType,
                method: 'get',
                data: null,
                cache: false
            }).then(ret => {

                if (ret.code == 0) {

                    if (ret.data) {
                        var $tree_target = $.fn.zTree.getZTreeObj($('#sgcl_tree .ztree').attr('id'));
                        var node = $tree_target.getNodesByParam('key', jqglMan.searchForm_cjdw.checkedKeys, null)[0];
                        $tree_target.addNodes(node, Tools.addIcon(ret.data, (curData) => {
                            Tools.handleTreeLeaf(curData);
                        }));
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
    clearForm: function () {
        // jqglMan.$selectOption = [];
        jqglMan.$searchForm.record = jqgl_initialData();
    },
    dealTableWithoutData: function (page) {
        jqglMan.$cache[page] = [];
        jqglMan.pagination.total = jqglMan.flag == 0 ? jqglMan.pagination.total : 　0;
        jqglMan.remoteList = [];
        jqglMan.loading = false;
        tableObject.loading(false);
        $('#jqtbnextPage').attr("disabled", true);
        $('#jqtblastPage').attr("disabled", true);
        // Tools.saySuccess('无警情数据');
        return;
    },
};
Object.setPrototypeOf(Tools, Object.create(Gm.tool));
let Format = Object.create(null);
Object.setPrototypeOf(Format, Object.create(Gm.format));
let Reg = Object.create(null);
Object.setPrototypeOf(Reg, Object.create(Gm.reg));
Reg.illegal_wfdd = /[`~!.\-_;:,""@\?#$%^&*+<>\\\|{}\/'[\]]/img;
/**********查询表单初始化函数(需单独提出)**********/
function jqgl_initialData() {
    return {
        bjsjEnd: '',
        bjsjStart: '',
        cjdw: '',
        glmt: '99',
        jqbh: '',
        bjr: '',
        bjdh: '',
        // jqlb:'',
        sfdd: ''
    }
}

let tableBodyJQGL = avalon.define({ //表格定义组件
    $id: 'sgcl_table',
    data: [],
    key: 'jqbh',
    currentPage: 1,
    prePageSize: 20,
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
        jqglMan.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});
let tableObject = {};