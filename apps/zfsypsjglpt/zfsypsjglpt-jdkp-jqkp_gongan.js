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
import moment from 'moment';
require('/apps/zfsypsjglpt/zfsypsjglpt-jdkp-jqkp_gongan.css');
export const name = 'zfsypsjglpt-jdkp-jqkp_gongan';
let storage = require('/services/storageService.js').ret;
import {
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;
let local_storage = {
    "ccNumBtn": true,
    "search_num": 20,
    "pageSize_table": {},
    "table_list": [],
    "page": ""

};
let jqglMan = null,
    jqgl_ck_Man = null;
let clickFlag = true, //查询按钮标识,去抖动
    clickTimer = null;
avalon.component(name, {
    template: __inline('./zfsypsjglpt-jdkp-jqkp_gongan.html'),
    defaults: {
        // zfsypsjglpt_language: getLan(), //英文翻译
        verson_JDKP_JQKP: true, //领导版本or警员版本 true领导 false警员
        authority: { // 按钮权限标识
            "SEARCH": false //监督考评-警情考评-查询按钮
        },
        //处警单位
        searchForm_cjdw: avalon.define({
            $id: 'searchForm_cjdw_qjzb',
            rdata: [],
            checkedKeys: [],
            expandedKeys: [],
            cjdw: [''],
            checkType: '',
            orgPath: '',
            handleChange(event, treeId, treeNode, treeTarget) {
                jqglMan.$searchForm.record.cjdw = treeNode.orgPath;
                this.checkedKeys = treeNode.orgName;
                this.orgPath = treeNode.orgPath;
                this.selectedTitle = treeNode.orgName;
                this.checkType = treeNode.checkType;
            },
            selectedTitle: ''
        }),
        searchForm_bjsj: avalon.define({
            $id: 'jqgl_searchForm_bjsj_jdkp_qjzb',
            bjsj: ['last-week'],
            searchForm_bjsj_Change(e, a) {
                //时间的问题尚不够完善待修改
                Tools.timeCalculator.calculate(e.target.value);
            }
        }),
        dateShow: false,
        topform_start_time: '',
        topform_end_time: '',
        endDate: moment().format('YYYY-MM-DD'),
        kssj_isNull: 'none',
        jssj_isNull: 'none',
        startTimeHandleChange(e) {
            if (e.target.value) {
                jqglMan.$searchForm.record.bjsjStart = Number(getTimeByDateStr(e.target.value + ' 00:00:00'));
                jqglMan.kssj_isNull = 'none';
            } else {
                jqglMan.$searchForm.record.bjsjStart = '';
                jqglMan.kssj_isNull = 'block';
            }
        },
        endTimeHandleChange(e) {
            if (e.target.value) {
                jqglMan.$searchForm.record.bjsjEnd = Number(getTimeByDateStr(e.target.value + ' 23:59:59'));
                jqglMan.jssj_isNull = 'none';
            } else {
                jqglMan.jssj_isNull = 'block';
                jqglMan.$searchForm.record.bjsjEnd = '';
            }
        },
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
                if (/[^\d]/g.test(this.search_num)) {
                    this.search_num = this.search_num.replace(/[^\d]/g, '');//限制数字
                }
                table.fetch(true);
            }
        },

        //抽查按钮
        ccNumBtn: true,
        search_num: 20,
        onClickCCBtn(e) {
            if (e.target.checked) {
                this.ccNumBtn = false;
                jqglMan.notEvaStatus = false; //考评状态
                jqglMan.notReviewStatus = false; //核查状态
            } else {
                this.ccNumBtn = true;
                jqglMan.notEvaStatus = true;
                jqglMan.notReviewStatus = true;
                this.search_num = 20;
            }
        },

        //input控件
        jqgl_close_jqbh: false,
        jqgl_close_bjr: false,
        jqgl_close_bjdh: false,
        jqgl_close_sfdd: false,
        jqgl_close_zbmj: false, //主办民警
        close_click(e) {
            switch (e) {
                case 'bjr':
                    $('.top-form').find($("[name = 'bjr']")).val('');
                    $('.top-form').find($("[name = 'bjr']")).attr("title", "");
                    $('.top-form').find($("[name = 'bjr']")).focus();
                    jqglMan.$searchForm.record.bjr = '';
                    break;
                case 'bjdh':
                    $('.top-form').find($("[name = 'bjdh']")).val('');
                    $('.top-form').find($("[name = 'bjdh']")).attr("title", "");
                    $('.top-form').find($("[name = 'bjdh']")).focus();
                    jqglMan.$searchForm.record.bjdh = '';
                    break;
                case 'sfdd':
                    $('.top-form').find($("[name = 'sfdd']")).val('');
                    $('.top-form').find($("[name = 'sfdd']")).attr('title', '');
                    $('.top-form').find($("[name = 'sfdd']")).focus();
                    jqglMan.$searchForm.record.sfdd = '';
                    break;
                case 'jqbh':
                    $('.top-form').find($("[name = 'jqbh']")).val('');
                    $('.top-form').find($("[name = 'jqbh']")).attr('title', '');
                    $('.top-form').find($("[name = 'jqbh']")).focus();
                    jqglMan.$searchForm.record.jqbh = '';
                    break;
                case 'zbmj':
                    $('.top-form').find($("[name = 'cjr']")).val('');
                    $('.top-form').find($("[name = 'cjr']")).attr('title', '');
                    $('.top-form').find($("[name = 'cjr']")).focus();
                    jqglMan.$searchForm.record.zbmj = '';
                    break;
            }
        },
        input_focus(e) {
            switch (e) {
                case 'bjr':
                    this.jqgl_close_bjr = true;
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
                case 'zbmj':
                    this.jqgl_close_zbmj = true;
                    break;
            }
        },
        input_blur(e, name) {
            //修复查询输入框复制黏贴bug
            $(e.target).val($(e.target).val().replace(/[`~!.;:,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, ''));
            this.$searchForm.record[e.target.name] = $(e.target).val();
            this.$searchForm.record[e.target.name] = this.$searchForm.record[e.target.name].replace(/[`~!.:;,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, '');

            switch (name) {
                case 'bjr':
                    this.jqgl_close_bjr = false;
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
                case 'zbmj':
                    this.jqgl_close_zbmj = false;
                    break;
            }
        },

        searchForm_kpzt: avalon.define({
            $id: 'searchForm_jqkp_kpzt_qjzb',
            evaStatus: ["ALL"],
            searchForm_kpzt_Change(e) {
                jqglMan.$searchForm.record.evaStatus = e.target.value;
                if (e.target.value == 0) {
                    jqgl_ck_Man.notEvaStatus = false;
                    jqglMan.$searchForm.record.evaResult = "ALL"; //考评结果 改为 不限
                } else {
                    jqglMan.notEvaStatus = true;
                }
            }
        }),
        notEvaStatus: true, //判断为 ‘未考评’ 时候禁止选择考评结果
        //考评结果
        searchForm_kpjg: avalon.define({
            $id: 'searchForm_jqkpQjzb_kpjg',
            evaResult: ["ALL"],
            searchForm_kpjg_Change(e) {
                jqglMan.$searchForm.record.evaResult = e.target.value;
            }
        }),
        //核查状态
        searchForm_hczt: avalon.define({
            $id: 'searchForm_jqkpQjzb_hczt',
            reviewStatus: ["ALL"],
            searchForm_hczt_Change(e) {
                jqglMan.$searchForm.record.reviewStatus = e.target.value;
                if (e.target.value == 0) {
                    jqgl_ck_Man.notReviewStatus = false;
                    jqglMan.$searchForm.record.reviewResult = "ALL"; //核查结果 改为 不限
                } else {
                    jqglMan.notReviewStatus = true;
                }
            }
        }),
        notReviewStatus: true, //判断为 ‘未核查’ 时候禁止选择核查结果
        //核查结果
        searchForm_hcjg: avalon.define({
            $id: 'searchForm_jqkpQjzb_khjg',
            reviewResult: ["ALL"],
            searchForm_hcjg_Change(e) {
                jqglMan.$searchForm.record.reviewResult = e.target.value;
            }
        }),
        //关联媒体
        searchForm_glmt: avalon.define({
            $id: 'searchForm_glmt_jdkp_qjzb',
            glmt: ['ALL'], //默认 选择已关联
            searchForm_glmt_Change(e, a) {
                jqglMan.$searchForm.record.glmt = e.target.value;
            }
        }),
        jqbh: '',
        bjr: '',
        bjdh: '',
        sfdd: '',
        cjr: '',
        //查询表单
        $searchForm: createForm({
            autoAsyncChange: true,
            onFieldsChange: function () { },
            record: jqgl_initialData()
        }),
        jqgl_search() {
            if (/[^\d]/g.test(this.search_num)) {
                this.search_num = this.search_num.replace(/[^\d]/g, '');//限制数字
            }
            if (clickFlag == true) {
                table.fetch(true);
                clickFlag = false;
                clickTimer = setTimeout(function () {
                    clickFlag = true;
                }, 2000);
            }
        },
        onInit(event) {
            tableObject = $.tableIndex({ //初始化表格jq插件
                id: 'jqkp_table',
                tableBody: tableBodyJQKP
            });
            jqglMan = this;
            jqgl_ck_Man = this;
            jqgl_ck_Man.verson_JDKP_JQKP = storage.getItem("policeType");
            // jqgl_ck_Man.verson_JDKP_JQKP = false;
            Tools.clearForm(); //在模块切换时重置所有的查询表单字段

            var jqgl_form_data = null;
            if (storage.getItem('zfsypsjglpt-jdkp-jqkpQjzb-searchForm')) {
                jqgl_form_data = JSON.parse(storage.getItem('zfsypsjglpt-jdkp-jqkpQjzb-searchForm'));
            }
            if (jqgl_form_data) {

                //分页
                table.pagination.current = jqgl_form_data.page;
                this.$searchForm.record.orgCode = jqgl_form_data.orgCode;

                this.$searchForm.record.jqbh = this.jqbh = jqgl_form_data.jqbh;
                this.$searchForm.record.bjr = this.bjr = jqgl_form_data.bjr;
                this.$searchForm.record.bjdh = this.bjdh = jqgl_form_data.bjdh;
                this.$searchForm.record.sfdd = this.sfdd = jqgl_form_data.sfdd;
                this.$searchForm.record.cjr = this.cjr = jqgl_form_data.cjr;
                this.$searchForm.record.glmt = jqgl_form_data.glmt;
                this.searchForm_glmt.glmt = [jqgl_form_data.glmt];

                //增加考评状态
                this.$searchForm.record.evaStatus = jqgl_form_data.evaStatus;
                this.searchForm_kpzt.evaStatus = [jqgl_form_data.evaStatus];
                this.searchForm_hcjg.reviewResult = [jqgl_form_data.reviewResult];
                this.$searchForm.record.reviewResult = jqgl_form_data.reviewResult;
                this.searchForm_hczt.reviewStatus = [jqgl_form_data.reviewStatus];
                this.$searchForm.record.reviewStatus = jqgl_form_data.reviewStatus;
                this.searchForm_kpjg.evaResult = [jqgl_form_data.evaResult];
                this.$searchForm.record.evaResult = jqgl_form_data.evaResult;


                this.$searchForm.record.bjsjStart = jqgl_form_data.bjsjStart;
                this.$searchForm.record.bjsjEnd = jqgl_form_data.bjsjEnd;
                Tools.timeCalculator.setStatus(jqgl_form_data.timeStatus);

                //存储表格当前页码和每页大小
                table.pagination.current = jqgl_form_data.page;
                table.pagination.pageSize = jqgl_form_data.pageSize;

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
            // 查看、查询按钮权限控制->查看按钮不需要权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_JDKP_JQKP/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                if (func_list.length == 0) {
                    // 防止查询无权限时页面留白
                    $('.jqkp-tabCont-gab').css('top', '46px');
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_JDKP_JQKP_SEARCH":
                            jqglMan.authority.SEARCH = true;
                            break;
                    }
                });
                // 防止查询无权限时页面留白
                if (false == jqglMan.authority.SEARCH)
                    $('.jqkp-tabCont-gab').css('top', '46px');
            });
            local_storage = storage.getItem('zfsypsjglpt-jdkp-jqkp-gongan-cc');
            if (local_storage) {
                if (!local_storage.ccNumBtn) { //选中抽查
                    //恢复抽查页面
                    jqglMan.ccNumBtn = local_storage.ccNumBtn;
                    jqglMan.search_num = local_storage.search_num;
                    jqglMan.notEvaStatus = false; //考评状态
                    jqglMan.notReviewStatus = false; //核查状态

                    table.pagination.current = local_storage.page + 1; //恢复 当前页
                    tableObject.page(local_storage.page + 1, local_storage.pageSize_table); //恢复当前分页
                    tableObject.tableDataFnc(local_storage.table_list); //恢复当前表格
                    tableObject.loading(false);
                    return;
                }
            }
        },
        onReady() {
            $('.popover').hide();
            let policeType = storage.getItem("policeType");
            // policeType = false;
            // if (policeType) {
            Tools.getTree();
            // }
            $('.top-form input.form-control[name]').each(function (index, ele) {
                $(ele).wrap('<div class="inputWrap" />');
            });
            judgeLeaderOrPerson(policeType);
        },
        onDispose() {
            // tableObject.tableDataFnc([]);
            tableObject.destroy();
            clickFlag = true;
            window.clearTimeout(clickTimer);
        }
    }
});
//判断领导版本或警员版本
function judgeLeaderOrPerson(judgeLeader) {
    table.version_JDKP = judgeLeader;
    let flag = judgeLeader;
    if (flag) {
        // $('.top-form').css('height', '170px');
        $('.jqbottomForm').css('display', 'inherit');
        $('.bjsj_aj').css('margin-left', '25px');
        //修复x按钮位置错乱问题
        $(".jdkp-container .jqbh_close").css("left", "779px");
        $('#jqkp_table').css('top', '0px');
        return;
    } else {
        // $('.top-form').css('height', '90px');
        $('.jqbottomForm').css('display', 'none');
        $(".bottomForm").css("margin-top", "13px");
        $('.bjsj_aj').css('margin-left', '13px');
        $(".bjsj").css("margin-left", "-4px");
        //修复x按钮位置错乱问题
        $(".jdkp-container .jqbh_close").css("left", "230px");
        $('#jqkp_table').css('position', 'absolute');
        $('#jqkp_table').css('top', '-40px');
    }
}

/**********查询得来的表格**********/
let table = avalon.define({
    $id: 'jqgl-table-jdkp_qjzb',
    pagination: {
        pageSize: 20,
        total: 0,
        overLimit: false,
        current: 0
    },
    version_JDKP: true, //领导版本or警员版本
    flag: 0,
    getCurrent(current) {
        this.pagination.current = current;
    },
    actions(type, text, record, index) {
        if (type == 'checkLook') {
            //存储当前点击数据的考评状态[基层/法制考评, 还有警情编号]

            if (record.evaStatus == '已考评') {
                window.kpcczl_jqkp = record.jqbh;
                avalon.history.setHash('/zfsypsjglpt-jdkp-jqkp-ykp_gongan');
                return;
            }
            let current_jqkpData = {
                "jqbh_jqkp": record.jqbh,
                "jckpStatus": (record.jckp == "已考评") ? true : false,
                "fzkpStatus": (record.fzkp == "已考评") ? true : false
            };
            storage.setItem("zfsypsjglpt-jdkp-jqkpQjzb-current-jqkpData", current_jqkpData);
            //页面路由跳转至详情页
            avalon.history.setHash("/zfsypsjglpt-jdkp-jqkp-wkp_gongan");
        }
    },
    fetch(search, initMark) {
        tableObject.loading(true);
        if (!search) {
            var page = (this.pagination.current == 0) ? 0 : this.pagination.current - 1;
            this.ajax_table(initMark);
        } else {
            this.pagination = {
                pageSize: 20,
                total: 0,
                overLimit: false,
                current: 0
            };
            this.flag = 1;
            this.ajax_table(initMark);
        }
    },
    ajax_table(initMark) {
        var page = this.pagination.current == 0 ? 0 : this.pagination.current - 1,
            seachParams = jqglMan.$searchForm.record;
        seachParams.jqbh = $.trim(seachParams.jqbh);
        seachParams.bjr = $.trim(seachParams.bjr);
        seachParams.bjdh = $.trim(seachParams.bjdh);
        seachParams.sfdd = $.trim(seachParams.sfdd);
        seachParams.cjr = $.trim(seachParams.cjr);
        seachParams.orgPath = jqglMan.searchForm_cjdw.orgPath;
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
                return;
            } else {

                if (seachParams.bjsjStart >= seachParams.bjsjEnd) {
                    Tools.sayWarn('开始时间不能超过结束时间');
                    return;
                }

                if (seachParams.bjsjEnd - seachParams.bjsjStart > 365 * 86400000) {
                    Tools.sayWarn('时间间隔不能超过一年，请重新设置！');
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
            }
        }
        if (jqgl_form_data == null) {

        } else if (initMark) {
            seachParams = jqgl_form_data;
            page = jqgl_form_data.page;
            table.pagination.current = page + 1;
        }
        if (Tools.timeCalculator.getStatus() != 'last-past-of-time') {
            Tools.timeCalculator.calculate(Tools.timeCalculator.getStatus());
        }
        seachParams.page = page;
        seachParams.pageSize = this.pagination.pageSize;
        seachParams.includeChild = window.checkChildren_ga === undefined ? true : window.checkChildren_ga;
        // seachParams.glmt = '1';//屏蔽 关联媒体
        let ajax_data_g = {
            "page": seachParams.page,
            "pageSize": seachParams.pageSize,
            "orgPath": seachParams.orgPath,
            "bjsjStart": seachParams.bjsjStart,
            "bjsjEnd": seachParams.bjsjEnd,
            "glmt": seachParams.glmt,
            "checkNum": jqglMan.search_num
        };

        let ajaxURL = '/gmvcs/audio/policeSituation/search/eva?page=' + page + '&pageSize=' + this.pagination.pageSize;
        if (!jqglMan.ccNumBtn) { //如果勾选抽查 ，则调用抽查接口
            ajaxURL = '/gmvcs/audio/policeSituation/search/randomEva';
            seachParams = ajax_data_g;
        }
        ajax({
            url: ajaxURL,
            method: 'post',
            data: seachParams,
            cache: false
        }).then(ret => {

            if (ret.code == 0) {
                window.checkChildren_ga = true;
                jqglMan.$searchForm.record.page = page + 1;
                jqglMan.$searchForm.record.pageSize = this.pagination.pageSize;
                jqglMan.$searchForm.record.timeStatus = seachParams.timeStatus;
                jqglMan.$searchForm.record.orgId = jqglMan.searchForm_cjdw.cjdw;
                //存储当前的查询条件至localStorage中,便于返回操作后继续展示原有的查询数据;
                storage.setItem('zfsypsjglpt-jdkp-jqkpQjzb-searchForm', JSON.stringify(jqglMan.$searchForm.record), 0.5);

                if (!ret.data.currentElements) {
                    Tools.dealTableWithoutData();
                }

                if (ret.data.currentElements && ret.data.currentElements.length == 0) {
                    tableObject.loading(false);
                    Tools.dealTableWithoutData();
                } else {

                    for (var i = 0, len = ret.data.currentElements.length; i < len; i++) {

                        ret.data.currentElements[i].space = '';
                        ret.data.currentElements[i].jqlb = ret.data.currentElements[i].jqlbmc ? ret.data.currentElements[i].jqlbmc : '-';
                        ret.data.currentElements[i].cjr = ret.data.currentElements[i].cjrxm ? ret.data.currentElements[i].cjrxm + '(' + ret.data.currentElements[i].cjr + ')' : '-'; //处警人
                        ret.data.currentElements[i].relation = ret.data.currentElements[i].relation ? '已关联' : '未关联';
                        ret.data.currentElements[i].bjsj = formatDate(ret.data.currentElements[i].bjsj);
                        ret.data.currentElements[i].cjdwmc = ret.data.currentElements[i].cjdwmc.join(',');
                        ret.data.currentElements[i].evaStatus = ret.data.currentElements[i].evaStatus ? '已考评' : '未考评';
                        ret.data.currentElements[i].reviewStatus = ret.data.currentElements[i].reviewStatus ? '已核查' : '未核查';


                        if (ret.data.currentElements[i].evaResult == '0') {
                            ret.data.currentElements[i].evaResult = '不通过';
                        } else if (ret.data.currentElements[i].evaResult == '1') {
                            ret.data.currentElements[i].evaResult = '通过';
                        } else {
                            ret.data.currentElements[i].evaResult = '-';
                        }

                        if (ret.data.currentElements[i].reviewResult == '0') {
                            ret.data.currentElements[i].reviewResult = '不属实';
                        } else if (ret.data.currentElements[i].reviewResult == '1') {
                            ret.data.currentElements[i].reviewResult = '属实';
                        } else {
                            ret.data.currentElements[i].reviewResult = '-';
                        }

                    };

                    if (this.flag == 1) {
                        this.pagination.current = 1;
                    }
                    this.flag = 0;


                    this.pagination.overLimit = ret.data.overLimit;
                    this.pagination.total = this.pagination.overLimit ? ret.data.limit * 20 : ret.data.totalElements;

                    // this.pagination.total = ret.data.totalElements;
                    this.pagination.current = page + 1;
                    let pageSize_table = table.pagination.pageSize;
                    tableObject.page(page + 1, pageSize_table);
                    tableObject.tableDataFnc(ret.data.currentElements);
                    tableObject.loading(false);
                    // 保存抽查数据
                    if (!jqglMan.ccNumBtn) {
                        let local_storage = {};
                        local_storage.table_list = ret.data.currentElements;
                        local_storage.page = page;
                        local_storage.pageSize_table = pageSize_table;
                        local_storage.ccNumBtn = jqglMan.ccNumBtn;
                        local_storage.search_num = jqglMan.search_num
                        storage.setItem('zfsypsjglpt-jdkp-jqkp-gongan-cc', local_storage);
                    } else {
                        storage.setItem('zfsypsjglpt-jdkp-jqkp-gongan-cc', '');
                    }
                }
            } else {
                message.error({
                    content: '请求数据失败'
                });
                tableObject.loading(false);
            }
        }, () => { });
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
    getTree: function () {
        ajax({
            // url: '/gmvcs/uap/org/find/root',
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

            jqglMan.searchForm_cjdw.rdata = Tools.addIcon(ret.data);
            jqglMan.searchForm_cjdw.expandedKeys = [ret.data[0].orgId];

            var jqgl_form_data = null;

            if (storage.getItem('zfsypsjglpt-jdkp-jqkpQjzb-searchForm')) {
                jqgl_form_data = JSON.parse(storage.getItem('zfsypsjglpt-jdkp-jqkpQjzb-searchForm'));
            }
            let jqglMan_searchForm_cjdwInitPath = jqgl_form_data ? jqgl_form_data.orgId : (ret.data ? ret.data[0].orgId : '');
            jqglMan.searchForm_cjdw.checkedKeys = jqgl_form_data ? jqgl_form_data.orgPath : (ret.data ? ret.data[0].orgPath : '');
            jqglMan.searchForm_cjdw.selectedTitle = jqgl_form_data ? jqgl_form_data.orgName || (ret.data ? ret.data[0].orgName : '') : (ret.data ? ret.data[0].orgName : '');
            jqglMan.searchForm_cjdw.cjdw = jqgl_form_data ? jqgl_form_data.cjdw : ret.data[0].orgPath;
            jqglMan.searchForm_cjdw.orgPath = jqgl_form_data ? jqgl_form_data.orgPath : ret.data[0].orgPath;
            jqglMan.$searchForm.record.cjdw = jqgl_form_data ? jqgl_form_data.cjdw : ret.data[0].orgPath;

            //区分列表页刷新还是详情页回到列表页
            if (storage.getItem('zfsypsjglpt-jdkp-jqkpQjzb-searchForm')) {
                if (local_storage.table_list) {
                    return;
                }
                table.fetch();
            } else {
                if (local_storage.table_list) {
                    return;
                }
                table.fetch(true, true);
            }

            //执行用户自定义操作          
            ajax({
                url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + jqglMan_searchForm_cjdwInitPath + '&checkType=' + ret.data[0].checkType,
                method: 'get',
                data: null,
                cache: false
            }).then(ret => {

                if (ret.code == 0) {

                    if (ret.data) {
                        var $tree_target = $.fn.zTree.getZTreeObj($('.tree-select-wrap .ztree').attr('id'));
                        var node = $tree_target.getNodesByParam('key', jqglMan.searchForm_cjdw.orgPath, null)[0];
                        $tree_target.addNodes(node, Tools.addIcon(ret.data));
                        $tree_target = null;
                        node = null;
                    } else {
                        Tools.sayError('请求下级部门数据失败');
                    }
                } else {
                    Tools.sayError('请求下级部门数据失败');
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
            curData.id = curData.orgId;
            curData.isParent = true;
            curData.title = curData.orgName;
            curData.name = curData.orgName;
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
        jqglMan.$searchForm.record = jqgl_initialData();
    },
    dealTableWithoutData: function (page) {
        table.pagination.total = table.flag == 0 ? table.pagination.total : 0;
        tableObject.loading(false);
        $('#jqtbnextPage').attr("disabled", true);
        $('#jqtblastPage').attr("disabled", true);
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
    })()
};
/**********查询表单初始化函数(需单独提出)**********/
function jqgl_initialData() {
    return {
        bjsjEnd: '',
        bjsjStart: '',
        cjdw: '',
        glmt: 'ALL',
        jqbh: '',
        bjr: '',
        bjdh: '',
        sfdd: '',
        cjr: '',
        evaStatus: 'ALL',
        evaResult: 'ALL',
        reviewStatus: 'ALL',
        reviewResult: 'ALL'
    };
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
}

let tableBodyJQKP = avalon.define({ //表格定义组件
    $id: 'jqkp_table_qjzb',
    data: [],
    key: 'jqbh',
    currentPage: 1,
    prePageSize: 20,
    loading: false,
    paddingRight: 0, //有滚动条时内边距
    checked: [],
    isAllChecked: false,
    selection: [],
    isColDrag: true, //true代表表格列宽可以拖动
    dragStorageName: 'jdkp-jqkpQjzb-tableDrag-style',
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

