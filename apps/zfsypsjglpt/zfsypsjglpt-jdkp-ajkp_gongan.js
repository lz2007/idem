import avalon from 'avalon2';
import {
    createForm,
    message
} from 'ane';
import moment from 'moment';
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
    gxxOcxVersion,
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;
require('/apps/zfsypsjglpt/zfsypsjglpt-jdkp-ajkp_gongan.css');
export const name = 'zfsypsjglpt-jdkp-ajkp_gongan';

let policeType = storage.getItem("policeType"); //获取版本
let kplb_type = storage.getItem("kplb_type");

let local_storage = {
    "ccNumBtn": true,
    "search_num": 20,
    "pageSize_table": {},
    "table_list": [],
    "page": ""

};
let ajglMan = null;
let ajgl_ck_Man = null;
let ajgl_last = null;
let tempUnselected = [];
let ajgl_session = (function () {
    let ajbh = '';
    return {
        getAjbh: function () {
            if (storage && storage.getItem) {
                ajbh = storage.getItem('ajbh_ajgl_kp');
            } else {
                ajbh = cookier.getCookie('ajbh_ajgl_kp');
            };
            return ajbh;
        }
    };
})();
let currentList = {
    jckp: false,
    fzkp: false
};
avalon.component(name, {
    template: __inline('./zfsypsjglpt-jdkp-ajkp_gongan.html'),
    defaults: {
        // 版权信息
        copyRight: copyRight,
        telephone: telephone,
        // zfsypsjglpt_language: getLan(), //英文翻译
        //领导版本or警员版本 true领导 false警员
        verson_JDKP_AJKP: policeType,
        //查询表单
        $searchForm: createForm({
            autoAsyncChange: true,
            onFieldsChange: function () {

            },
            record: ajgl_initialData()
        }),
        ajgl_search() {
            if (/[^\d]/g.test(this.search_num)) {
                this.search_num = this.search_num.replace(/[^\d]/g, '');//限制数字
            }
            table.fetch(true);
        },

        //抽查按钮
        ccNumBtn: true,
        search_num: 20,
        onClickCCBtn(e) {
            if (e.target.checked) {
                this.ccNumBtn = false;
                ajgl_ck_Man.notEvaStatus = false; //考评状态
                ajgl_ck_Man.notReviewStatus = false; //核查状态
            } else {
                this.ccNumBtn = true;
                ajgl_ck_Man.notEvaStatus = true;
                ajgl_ck_Man.notReviewStatus = true;
                this.search_num = 20;
            }
        },

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
            //修复查询输入框复制黏贴bug
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
            $id: 'searchForm_sjdw_ajkp_qjzb',
            rdata: [],
            sjdw: [],
            checkedKeys: [],
            expandedKeys: [],
            selectedTitle: '',
            checkType: '',
            handleChange(event, treeId, treeNode, treeTarget) {
                ajglMan.$searchForm.record.sjdw = treeNode.key;
                ajglMan.$searchForm.record.checkType = treeNode.checkType;
                this.checkedKeys = treeNode.orgName;
                this.selectedTitle = treeNode.orgName;
                this.checkType = treeNode.checkType;
            }
        }),


        enter_click(e) {
            $(e.target).val($(e.target).val().replace(/[`~!.;:,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, ''));
            this.$searchForm.record[e.target.name] = $(e.target).val();
            this.$searchForm.record[e.target.name] = this.$searchForm.record[e.target.name].replace(/[`~!.:;,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, '');

            if (e.keyCode == "13") {
                if (/[^\d]/g.test(this.search_num)) {
                    this.search_num = this.search_num.replace(/[^\d]/g, '');//限制数字
                }
                table.fetch(true);
            }
        },
        year: new Date().getFullYear(),
        //报警时间
        dateShow: false,
        kssj_isNull: 'none',
        jssj_isNull: 'none',
        searchForm_bjsj: avalon.define({
            $id: 'ajkp_searchForm_bjsj_qjzb',
            bjsj: ['last-week'],
            searchForm_bjsj_Change(e, a) {

                //以下是按照原项目计算方法 -- 时间的问题尚不够完善待修改
                Tools.timeCalculator.calculate(e.target.value);
            }
        }),
        endDate: moment().format('YYYY-MM-DD'),
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
            $id: 'searchForm_gllb_ajkp_qjzb',
            glmt: ['ALL'],
            searchForm_gllb_Change(e, a) {
                ajglMan.$searchForm.record.gllb = e.target.value;
            }
        }),

        //考评状态
        searchForm_kpzt: avalon.define({
            $id: 'searchForm_ajkp_kpzt_qjzb',
            evaStatus: ["ALL"],
            searchForm_kpzt_Change(e) {
                ajglMan.$searchForm.record.evaStatus = e.target.value;
                if (e.target.value == 0) {
                    ajgl_ck_Man.notEvaStatus = false;
                    ajglMan.$searchForm.record.evaResult = "ALL"; //考评结果 改为 不限
                } else {
                    ajglMan.notEvaStatus = true;
                }
            }
        }),
        notEvaStatus: true, //判断为 ‘未考评’ 时候禁止选择考评结果
        //考评结果
        searchForm_kpjg: avalon.define({
            $id: 'searchForm_ajkpQjzb_kpjg',
            evaResult: ["ALL"],
            searchForm_kpjg_Change(e) {
                ajglMan.$searchForm.record.evaResult = e.target.value;
            }
        }),
        //核查状态
        searchForm_hczt: avalon.define({
            $id: 'searchForm_ajkpQjzb_hczt',
            reviewStatus: ["ALL"],
            searchForm_hczt_Change(e) {
                ajglMan.$searchForm.record.reviewStatus = e.target.value;
                if (e.target.value == 0) {
                    ajgl_ck_Man.notReviewStatus = false;
                    ajglMan.$searchForm.record.reviewResult = "ALL"; //核查结果 改为 不限
                } else {
                    ajglMan.notReviewStatus = true;
                }
            }
        }),
        notReviewStatus: true, //判断为 ‘未核查’ 时候禁止选择核查结果
        //核查结果
        searchForm_hcjg: avalon.define({
            $id: 'searchForm_ajkpQjzb_khjg',
            reviewResult: ["ALL"],
            searchForm_hcjg_Change(e) {
                ajglMan.$searchForm.record.reviewResult = e.target.value;
            }
        }),

        jqbh: '',
        ajbh: '',
        ajmc: '',
        sary: '',
        jy: '',
        toggleShow: true,
        toggleShowCk: false,

        //ck part
        //点击返回按钮
        ajgl_back(e) {
            $('.popover').hide();
            Tools.clearPlayer('');
            this.cjxxInfo.infomation = {
                jobType: '-',
                path: '-',
                userName: '-',
                userCode: '-',
                keyFile: '-',
                startTime: '-',
                saveTime: '-',
                importTime: '-'
            };
            //解决考评未完成切换页面再进入，数据未及时更新的Bug
            ajgl_ck_Man.cjxxInfo.evaLists = [];
            let temp = document.getElementById("commentBox");
            if (temp) {
                temp.style.color = "#536b82";
            }
            ajgl_ck_Man.mtxx_clickClass = 'cjxx-btn';
            ajgl_ck_Man.jckpStatus = false;
            ajgl_ck_Man.fzkpStatus = false;
            this.toggleShow = true;
            this.toggleShowCk = false;
            table.fetch(true);
        },

        //页面标题 -- 正在看
        checkLooking: '',

        //共多少条关联媒体
        glmt_total: 0,

        //所有类型媒体的集合
        glmt_type: ['jq_checked_data', 'cj_checked_data'],
        glmt_name: ['jq', 'cj'],

        //媒体标志 -- 目前在哪一类媒体上
        glmt_mark: 'cj',

        //关联媒体 -- 接警
        jq_clickClass: 'glmt_jj', //按钮样式
        jq_data: [], //展示的关联媒体
        glmt_jq_show: false, //媒体切换
        glmt_jq(e) { //点击警情  
            Tools.clickGlmt('jq');
        },

        //关联媒体 -- 暂无
        cj_clickClass: 'glmt_cj',
        cj_data: [],
        glmt_cj_show: true,
        glmt_cj(e) {
            Tools.clickGlmt('cj');
        },
        jq_nodata: false,
        cj_nodata: false,

        //关联警情下拉及单独三个字段
        gljq_info: {
            bjsj: '',
            jqlbmc: '',
            bjnr: ''
        },
        selecting: '',
        typeOptions: [],
        viewJq(a, b, c) {
            this.selecting = a.target.value;
            Tools.searchMediaByJqbh();
        },
        //点击折叠
        toggleMt(e, z, x) {
            var arr = e.srcElement.src.split('/');
            var path = arr[arr.length - 1].split('?')[0];
            var mark = false;
            var rid = e.srcElement.attributes.name.nodeValue;
            var type = ajgl_ck_Man.glmt_mark;
            var aim = null;
            ajgl_ck_Man[type + '_data'].forEach(function (val, key) {

                if (val.rid == rid) {
                    aim = val;
                }
            });

            if (path == 'zk.png') {
                e.srcElement.src = '/static/image/zfda-ajgl-ck/wzk.png?__sprite';
                mark = false;
            } else {
                e.srcElement.src = '/static/image/zfda-ajgl-ck/zk.png?__sprite';
                mark = true;

                ajax({
                    url: '/gmvcs/audio/basefile/getBaseFileByRid?rid=' + rid,
                    method: 'get',
                    data: null,
                    cache: false
                }).then(ret => {

                    if (ret.code == 0) {
                        aim.jobType = ret.data.jobType;
                        if (ret.data.saveTime == -1) {
                            aim.saveTime = '永久存储';
                        } else if (ret.data.saveTime == -2) {
                            aim.saveTime = '已过期';
                        } else {
                            aim.saveTime = ret.data.saveTime + '天';
                        }

                        if (ret.data.saveSiteWs && ret.data.saveSiteSt) {
                            aim.path = "采集工作站、存储服务器";
                        } else {

                            if (ret.data.saveSiteWs) {
                                aim.path = "采集工作站";
                            } else if (ret.data.saveSiteSt) {
                                aim.path = "存储服务器";
                            }

                        }

                        if (aim.saveTime == '已过期') {
                            aim.path = "-";
                        }
                    } else {
                        Tools.sayError('获取详细信息失败');
                    }
                    Tools.reduceWordForToggle();
                });

            };
            ajgl_ck_Man[type + '_data'].forEach(function (val, key) {

                if (val.rid == rid) {
                    val.toggle = mark;
                    return;
                }
            });
        },
        src: '',
        video_url: '',
        audio_url: '',
        loading: false,
        ocxPlayer: false,
        playingFile: '',

        imgff: false,

        //点击媒体文件名
        playFile(e) {

            var rid = $(e.currentTarget).find('[path]').attr('name');
            var type = $(e.currentTarget).find('[path]').attr('type'); //获取媒体类型: 视频/语音/图片/其他/文字
            var mark = ajgl_ck_Man.glmt_mark;

            $('.clickMTCK').removeClass('clickMTCK');
            $(e.currentTarget).addClass('clickMTCK');
            ajglMan.playingFile = rid;

            this.mtxx();
            //更新媒体信息
            ajax({
                url: '/gmvcs/audio/basefile/getBaseFileByRid?rid=' + rid,
                method: 'get',
                data: null,
                cache: false
            }).then(ret => {

                if (ret.code == 0) {
                    ret.data.importTime = formatDate(ret.data.importTime);
                    ret.data.startTime = formatDate(ret.data.startTime);
                    ret.data.keyFile = ret.data.keyFile == true ? '是' : '否';

                    if (ret.data.saveTime == -1) {
                        ret.data.saveTime = '永久存储';
                    } else if (ret.data.saveTime == -2) {
                        ret.data.saveTime = '已过期';
                    } else {
                        ret.data.saveTime = ret.data.saveTime + '天';
                    }

                    if (ret.data.saveSiteWs && ret.data.saveSiteSt) {
                        ret.data.path = "采集工作站、存储服务器";
                    } else {

                        if (ret.data.saveSiteWs) {
                            ret.data.path = "采集工作站";
                        } else if (ret.data.saveSiteSt) {
                            ret.data.path = "存储服务器";
                        }
                    }

                    if (ret.data.saveTime == '已过期') {
                        ret.data.path = "-";
                        // $('.palyerImg').css('display', 'none');
                        ajgl_ck_Man.imgff = false;
                        ajgl_ck_Man.ocxPlayer = false;
                        $('.finishDelete').css('display', 'none');
                        $('.outDateMedia').css('display', 'block');
                    } else {
                        filePlayer.play(type, rid, '');
                    }
                    this.cjxxInfo.infomation = ret.data;
                    Tools.reduceWordForCjxx();
                } else {
                    Tools.sayError('获取详细媒体信息失败');
                }
            });

        },

        //查看 -- 基层考评
        jckp_clickClass: 'jbxx-btn',
        fzkp_clickClass: 'cjxx-btn',
        mtxx_clickClass: 'cjxx-btn',
        cjxx_show: -1,
        noneKP: true, //选中警情信息时,需要同时隐藏基层跟法制
        kpType: 'jckp',

        //查看 -- 基本信息
        jbxx_clickClass: 'cjxx-btn',
        jbxx_show: false,
        jbxx(e) {
            this.jbxx_clickClass = 'jbxx-btn';
            this.fzkp_clickClass = 'cjxx-btn';
            this.jckp_clickClass = 'cjxx-btn';
            this.mtxx_clickClass = 'cjxx-btn';
            this.jbxx_show = true;
            this.cjxx_show = -1;
            this.noneKP = false;
            Tools.reduceWordForJbxx();
        },
        //查看媒体信息
        mtxx() {
            this.mtxx_clickClass = 'jbxx-btn';
            this.fzkp_clickClass = 'cjxx-btn';
            this.jckp_clickClass = 'cjxx-btn';
            this.jbxx_clickClass = 'cjxx-btn';
            this.jbxx_show = false;
            this.cjxx_show = 2;
            this.noneKP = false;
            Tools.reduceWordForJbxx();
        },
        jbxxInfo: avalon.define({
            $id: 'ajkp_jbxx_info_qjzb',
            infomation: {} //基本信息的数据
        }),

        //查看 -- 处警信息
        cjxx(kpType) {
            this.jbxx_clickClass = 'cjxx-btn';
            this.mtxx_clickClass = 'cjxx-btn';
            this.jbxx_show = false;
            this.kpType = kpType;
            this.cjxx_show = -1;
            ajgl_ck_Man.cjxxInfo.selectEva = [];
            tempUnselected = [];
            if (kpType == 'jckp') {
                this.jckp_clickClass = 'jbxx-btn';
                this.fzkp_clickClass = 'cjxx-btn';
            } else {
                this.jckp_clickClass = 'cjxx-btn';
                this.fzkp_clickClass = 'jbxx-btn';
            }
            //点击基层考评
            if (kpType == 'jckp') {
                if (currentList.jckp) {
                    getEvaInfo("BASIC");
                } else {
                    getPolicesituation();
                }
            } else {
                //点击法制考评
                if (currentList.fzkp) {
                    getEvaInfo("LEGAL");
                } else {
                    getPolicesituation();
                }
            }

        },

        cjxxInfo: avalon.define({
            $id: 'ajkp_cjxx_info_jdkp_qjzb',
            infomation: {
                jobType: '-',
                path: '-',
                userName: '-',
                userCode: '-',
                keyFile: '-',
                startTime: '-',
                saveTime: '-',
                importTime: '-'
            }, //处警信息的数据
            selectEva: [],
            evaLists: [],
            commentValue: '',
            getCommentVal(e) {
                let _this = this;
                _this.commentValue = e.target.value;
                if (e.target.value != "") {
                    let temp = document.getElementById("commentBox");
                    temp.style.color = '#536b82';
                }
            },
            handleChange(e) {
                let _this = this;
                let tempArr = e.target.value.split('-');
                let tempArrCode = tempArr[0];
                let tempArrName = tempArr[1];
                let tempArrChecked = (tempArr[2] == "Y") ? true : false;
                let tempIndex = findElem(_this.selectEva, 'code', tempArrCode);
                _this.selectEva[tempIndex].check = tempArrChecked;
                let tempId = document.getElementById(tempArrCode);
                tempId.style.color = "#536b82";
            },
            //完成评语
            submitComment() {

                //判断考评是否完成,若已完成,则弹出确认框,否则标红未进行考评的选项
                let _this = this;
                tempUnselected = [];
                let tempSelectEva = _this.selectEva;
                if (ajgl_ck_Man.cjxxInfo.commentValue.length > 500) {
                    notification.warn({
                        message: '评语最多输入500个字',
                        title: '温馨提示'
                    });
                    return;
                }
                if (ajgl_ck_Man.cjxxInfo.selectEva.length == 0) {
                    notification.warn({
                        message: '考核标准项为空,不允许提交考评,请联系管理员!',
                        title: '提示'
                    });
                    return;
                }
                for (var i = 0; i < tempSelectEva.length; i++) {
                    if (tempSelectEva[i].check == "none") {
                        tempUnselected.push({
                            code: tempSelectEva[i].code,
                            name: tempSelectEva[i].name
                        });
                    }
                };
                if (tempUnselected.length == 0 && ajgl_ck_Man.cjxxInfo.commentValue != "") {
                    confirmCont.confirmShow = true;
                    $("#iframe_zfsyps").css({
                        "opacity": 0
                    });
                    setTimeout(function () {
                        $("#iframe_zfsyps").css({
                            "opacity": 1
                        });
                        $("#iframe_zfsyps").show();
                    }, 600);
                } else {
                    unFinishBox_cont.unFinishShow = true;
                    $("#iframe_zfsyps").css({
                        "opacity": 0
                    });
                    setTimeout(function () {
                        $("#iframe_zfsyps").css({
                            "opacity": 1
                        });
                        $("#iframe_zfsyps").show();
                    }, 600);
                }

            }
        }),

        //点击详细内容
        show_info: false,
        cancelInfo() {
            this.show_info = false;

            $("#iframe_zfsyps").hide();

            $('.popover').hide();
        },
        move_return(a, b) {
            $("#iframe_zfsyps").css({
                width: "980px", //---- 这个是弹窗的宽度
                height: "410px", //---- 这个是弹窗的高度
                left: a,
                top: b
            });
        },
        show_allInfo() {

            this.show_info = true;


            this.show_info = true;
            Tools.addShowInfo('showInfo');
            Tools.reduceWordForAllInfo();

            $("#iframe_zfsyps").css({
                "opacity": 0
            });
            setTimeout(function () {
                $("#iframe_zfsyps").css({
                    "opacity": 1
                });
                $("#iframe_zfsyps").show();
            }, 600);
        },

        //警员类型,结合权限控制底部按钮的显示隐藏
        jckpStatus: false,
        fzkpStatus: false,

        authority: { // 按钮权限标识
            "SEARCH": false, //监督考评-警情考评-查询按钮
            "JCKP": false, //监督考评-警情考评-查看-基层考评
            "FZKP": false //监督考评-警情考评-查看-法制考评
        },

        //警员版本功能  是否考评 policeFZKP法制考评 policeJCKP基层考评
        policeFZKP: false,
        policeJCKP: false,

        onInit(event) {
            tableObjectAJKP = $.tableIndex({ //初始化表格jq插件
                id: 'ajkp_table_qjzb',
                tableBody: tableBodyAJKP
            });
            ajglMan = this;
            ajgl_ck_Man = this;

            Tools.clearForm(); //在模块切换时重置所有的查询表单字段
            var ajgl_form_data = null;

            if (storage && storage.getItem) {

                if (storage.getItem('zfsypsjglpt-jdkp-ajkp_gongan')) {
                    ajgl_form_data = JSON.parse(storage.getItem('zfsypsjglpt-jdkp-ajkp_gongan'));
                }
            } else {

            };

            if (ajgl_form_data) {
                //分页
                table.pagination.current = ajgl_form_data.page;
                this.$searchForm.record.orgCode = ajgl_form_data.orgCode;

                this.$searchForm.record.jqbh = this.jqbh = ajgl_form_data.jqbh;
                this.$searchForm.record.ajbh = this.ajbh = ajgl_form_data.ajbh;
                this.$searchForm.record.ajmc = this.ajmc = ajgl_form_data.ajmc;
                this.$searchForm.record.sary = this.sary = ajgl_form_data.sary;
                this.$searchForm.record.jy = this.jy = ajgl_form_data.jy;
                this.$searchForm.record.gllb = ajgl_form_data.gllb;

                //增加考评状态
                this.$searchForm.record.evaStatus = ajgl_form_data.evaStatus;
                this.searchForm_kpzt.evaStatus = [ajgl_form_data.evaStatus];
                this.searchForm_hcjg.reviewResult = [ajgl_form_data.reviewResult];
                this.$searchForm.record.reviewResult = ajgl_form_data.reviewResult;
                this.searchForm_hczt.reviewStatus = [ajgl_form_data.reviewStatus];
                this.$searchForm.record.reviewStatus = ajgl_form_data.reviewStatus;
                this.searchForm_kpjg.evaResult = [ajgl_form_data.evaResult];
                this.$searchForm.record.evaResult = ajgl_form_data.evaResult;
                this.$searchForm.record.glmt = ajgl_form_data.gllb;
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
                    if (/^AUDIO_FUNCTION_JDKP_AJKP/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    return;
                }

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_JDKP_AJKP_SEARCH":
                            ajgl_ck_Man.authority.SEARCH = true;
                            break;
                        case "AUDIO_FUNCTION_JDKP_AJKP_JCKP":
                            ajgl_ck_Man.authority.JCKP = true;
                            break;
                        case "AUDIO_FUNCTION_JDKP_AJKP_FZKP":
                            ajgl_ck_Man.authority.FZKP = true;
                            break;
                    }
                });
                ajglMan.authority.SEARCH = true;
                if (false == ajglMan.authority.SEARCH)
                    $('#aqglTable').css('top', '6px');

            });
            local_storage = storage.getItem('zfsypsjglpt-jdkp-ajkp-gongan-cc');
            if (local_storage) {
                if (!local_storage.ccNumBtn) { //选中抽查
                    //恢复抽查页面
                    ajglMan.ccNumBtn = local_storage.ccNumBtn;
                    ajglMan.search_num = local_storage.search_num;
                    ajglMan.notEvaStatus = false; //考评状态
                    ajglMan.notReviewStatus = false; //核查状态

                    table.pagination.current = local_storage.page + 1; //恢复 当前页
                    tableObjectAJKP.page(local_storage.page + 1, local_storage.pageSize_table); //恢复当前分页
                    tableObjectAJKP.tableDataFnc(local_storage.table_list); //恢复当前表格
                    tableObjectAJKP.loading(false);
                    return;
                }
            }
        },
        onReady() {
            // Tools.getTree();
            Tools.getDept();
            $('.popover').hide();
            judgeLeaderOrPerson(this.verson_JDKP_AJKP);
        },
        onDispose() {
            table.remoteList = [];
            // tableObjectAJKP.tableDataFnc([]);
            Tools.clearPlayer('');
            tableObjectAJKP.destroy();
        }
    }
});

/*********查询所得的表格**********/
let table = avalon.define({
    $id: 'jdkp-ajkp-table-qjzb',
    remoteList: [],
    loading: false,
    version_AJKP: true, //领导版本or警员版本
    $cache: {}, //数据缓存对象，缓存着每次请求的当页数据
    $selectOption: [], //勾选表格行保存该行的数据
    pagination: {
        pageSize: 20,
        total: 0,
        overLimit: false,
        current: 0
    },
    flag: 0,
    getCurrent(current) {
        this.pagination.current = current;
    },
    actions(type, text, record, index) {

        if (type == 'checkLook') {

            if (record.evaStatus == '已考评') {
                window.kpcczl_ajkp = record.ajbh;
                avalon.history.setHash('/zfsypsjglpt-jdkp-ajkp-ykp_gongan');
                return;
            }
            //存储当前点击数据的考评状态[基层/法制考评, 还有警情编号]
            let current_ajkpData = {
                "ajbh_ajkp": record.ajbh,
                "jckpStatus": (record.jckp == "已考评") ? true : false,
                "fzkpStatus": (record.fzkp == "已考评") ? true : false
            };
            storage.setItem("zfsypsjglpt-jdkp-ajkpQjzb-current-ajkpData", current_ajkpData);
            avalon.history.setHash('/zfsypsjglpt-jdkp-ajkp-wkp_gongan');
            // avalon.history.setHash("/zfsypsjglpt-jdkp-jqkp-detail");       
        }
    },
    handleSelect(record, selected, selectedRows) {

    },
    selectChange(selectedRowKeys, selectedRows) {
        this.$selectOption = [selectedRows];
    },
    handleSelectAll(selectedRowKeys, selectedRows) {
        // console.log(selectedRowKeys);
    },
    fetch(search, initMark) {
        tableObjectAJKP.loading(true);
        if (!search) {
            var page = this.pagination.current == 0 ? 0 : this.pagination.current - 1;

            if (this.$cache[page]) {

                //恢复该页状态，显示该页内容
                this.remoteList = this.$cache[page];
                tableObjectAJKP.tableDataFnc(this.remoteList);
                tableObjectAJKP.loading(false);
            } else {

                //如果缓存中不存在再请求
                this.ajax_table();
            }
        } else {
            this.pagination = {
                pageSize: 20,
                total: 0,
                overLimit: false,
                current: 0
            };
            this.$cache = [];
            //          this.loading = false;
            this.remoteList = [];
            this.flag = 1;
            this.ajax_table(initMark);
        }
    },
    ajax_table(initMark) {
        //  	tableObjectAJKP.loading(true);

        var page = this.pagination.current == 0 ? 0 : this.pagination.current - 1,
            seachParams = ajglMan.$searchForm.record;

        seachParams.ajbh = $.trim(seachParams.ajbh);
        seachParams.ajmc = $.trim(seachParams.ajmc);
        seachParams.jqbh = $.trim(seachParams.jqbh);
        seachParams.sary = $.trim(seachParams.sary);
        seachParams.orgPath = yspk_tree.tree_code;
        seachParams.timeStatus = Tools.timeCalculator.getStatus();

        if (!this.version_AJKP) { //false警员版本 删除部分参数
            delete seachParams['evaStatus'];
            delete seachParams['gllb'];
            delete seachParams['jy'];
            delete seachParams['sjdw'];
        } else {
            seachParams.jy = $.trim(seachParams.jy);
        }
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
                //              this.loading = false;
                return;
            } else {

                if (seachParams.bjsjStart > seachParams.bjsjEnd) {
                    Tools.sayWarn('开始时间不能超过结束时间');
                    //                  this.loading = false;
                    return;
                }

                if (seachParams.bjsjEnd - seachParams.bjsjStart > 365 * 86400000) {
                    Tools.sayWarn('时间间隔不能超过一年，请重新设置！');
                    //                  this.loading = false;
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

            if (storage.getItem('zfsypsjglpt-jdkp-ajkp_gongan')) {
                ajgl_form_data = JSON.parse(storage.getItem('zfsypsjglpt-jdkp-ajkp_gongan'));
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

            }
        };

        if (Tools.timeCalculator.getStatus() != 'last-past-of-time') {
            Tools.timeCalculator.calculate(Tools.timeCalculator.getStatus());
        }
        seachParams.sjdw = yspk_tree.curTree || yspk_tree.tree_key;

        seachParams.page = page;
        seachParams.pageSize = this.pagination.pageSize;
        seachParams.includeChild = window.checkChildren_ga === undefined ? true : window.checkChildren_ga;
        // seachParams.gllb = '1';//屏蔽 关联类别
        let ajax_data_g = {
            "page": seachParams.page,
            "pageSize": seachParams.pageSize,
            "orgPath": seachParams.orgPath,
            "afsjStart": seachParams.bjsjStart,
            "afsjEnd": seachParams.bjsjEnd,
            "gllb": seachParams.gllb,
            "checkNum": ajglMan.search_num
        };

        let ajaxURL = '/gmvcs/audio/case/search/eva?page=' + page + '&pageSize=' + this.pagination.pageSize;
        if (!ajglMan.ccNumBtn) { //如果勾选抽查 ，则调用抽查接口
            ajaxURL = '/gmvcs/audio/case/search/randomEva';
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
                if (storage && storage.setItem) {
                    ajglMan.$searchForm.record.page = page;
                    ajglMan.$searchForm.record.timeStatus = seachParams.timeStatus;
                    storage.setItem('zfsypsjglpt-jdkp-ajkp_gongan', JSON.stringify(ajglMan.$searchForm.record), 0.5);
                } else {

                };

                if (!ret.data.currentElements) {
                    Tools.dealTableWithoutData();
                }

                if (ret.data.currentElements && ret.data.currentElements.length == 0) {
                    tableObjectAJKP.loading(false);
                    Tools.dealTableWithoutData();
                } else {
                    ret.data.currentElements.forEach(function (val, key) {

                        if (val.relation) {
                            val.sfgl = '是';
                        } else {
                            val.sfgl = '否';
                        };
                        val.space = '';
                        val.ajlb = val.ajlbmc ? val.ajlbmc : '-';
                        val.policeSituation = val.policeSituation ? val.policeSituation : [];
                        val.jqbh = val.policeSituation.length ? val.policeSituation.join(',') : '-';
                        val.zbr = val.zbr ? val.zbr : '';
                        val.zbmjxm = val.zbmjxm ? val.zbmjxm + '(' + val.zbr + ')' : '-';
                        val.afsj = formatDate(val.afsj);
                        var sary = '';
                        val.relation = val.relation ? '已关联' : '未关联';
                        val.evaStatus = val.evaStatus ? '已考评' : '未考评';
                        val.reviewStatus = val.reviewStatus ? '已核查' : '未核查';
                        if (val.evaResult == '0') {
                            val.evaResult = '不通过';
                        } else if (val.evaResult == '1') {
                            val.evaResult = '通过';
                        } else {
                            val.evaResult = '-';
                        }

                        if (val.reviewResult == '0') {
                            val.reviewResult = '不属实';
                        } else if (val.reviewResult == '1') {
                            val.reviewResult = '属实';
                        } else {
                            val.reviewResult = '-';
                        }

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

                    // this.pagination.total = ret.data.totalElements;
                    this.pagination.current = page + 1;
                    ret.data.currentElements.forEach(function (val, key) {
                        val.index = key + (table.pagination.current - 1) * table.pagination.pageSize + 1; //手动增加表格行号
                    });
                    this.$cache[page] = this.remoteList = ret.data.currentElements;
                    let pageSize_table = table.pagination.pageSize;
                    tableObjectAJKP.page(page + 1, pageSize_table);
                    tableObjectAJKP.tableDataFnc(this.remoteList);
                    tableObjectAJKP.loading(false);
                    // 保存抽查数据
                    if (!ajglMan.ccNumBtn) {
                        let local_storage = {};
                        local_storage.table_list = this.remoteList;
                        local_storage.page = page;
                        local_storage.pageSize_table = pageSize_table;
                        local_storage.ccNumBtn = ajglMan.ccNumBtn;
                        local_storage.search_num = ajglMan.search_num
                        storage.setItem('zfsypsjglpt-jdkp-ajkp-gongan-cc', local_storage);
                    } else {
                        storage.setItem('zfsypsjglpt-jdkp-ajkp-gongan-cc', '');
                    }

                }
            } else {
                Tools.sayError('请求数据失败');
                //              this.loading = false;
                tableObjectAJKP.loading(false);
            }
        });
    },
    handleTableChange(pagination) {

        if (this.pagination.hasOwnProperty('current')) {
            this.pagination.current = pagination;
            tableObjectAJKP.page(pagination, this.pagination.pageSize);
            this.fetch();
        }
        //      this.fetch();
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
    initOcxPlayer: function () {
        $('#btn_play').show();
        $('#btn_stop').hide();
        $('#ajgl_playControll').on('click', 'img', GlobalOcxPlayer.playControll);
        GlobalOcxPlayer.InitPlay('ajgl_gxxPlayOcx');
    },
    formatDuring: function (mss) {
        var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = (mss % (1000 * 60)) / 1000;
        hours = hours < 10 ? ('0' + hours) : hours;
        minutes = minutes < 10 ? ('0' + minutes) : minutes;
        seconds = seconds < 10 && seconds >= 0 ? ('0' + seconds) : seconds;
        return hours + " : " + minutes + " : " + seconds;
    },
    checkSpace: function (aim) {
        var isOk = true;

        if (aim instanceof Array) {
            for (var i = 0, len = aim.length; i < len; i++) {

                if (!aim[i].toString().replace(/\s+/g, '')) {
                    isOk = false;
                    break;
                }
            };
        } else {
            isOk = !aim.replace(/\s+/g, '') ? false : true;
        };
        return isOk;
    },
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
    searchMediaByJqbh: function () {
        var id = ajglMan.selecting;

        if (id == '') {
            ajglMan.gljq_info = {
                bjsj: '',
                jqlbmc: '',
                bjnr: ''
            };
            info_body.allInfomation = {
                jqbh: '',
                bjsj: '',
                sfdd: '',
                bjrxm: '',
                bjrdh: '',
                bjnr: '',
                ddxcsj: [],
                zbmjxm: [],
                xbmjmc: '',
                cjdwmc: '',
                sfsj: '',
                cjsj: [],
                jlly: '',
                jqlbmc: '',
                mjyj: '',
            };
            ajgl_ck_Man.cj_data = [];
            ajgl_ck_Man.jq_nodata = !Boolean(ajgl_ck_Man.jq_data.length);
            ajgl_ck_Man.cj_nodata = !Boolean(ajgl_ck_Man.cj_data.length);
            this.configGlmtNumber(); //关联媒体总数和选中个数

            return;
        }
        ajax({
            url: '/gmvcs/audio/policeSituation/searchById/' + id,
            method: 'post',
            data: '',
            cache: false
        }).then(ret => {

            if (ret.code == 0) {

                if (!ret.data) {
                    Tools.saySuccess('该警情无相关数据');
                    ajglMan.gljq_info = {
                        bjsj: '',
                        jqlbmc: '',
                        bjnr: ''
                    };
                    info_body.allInfomation = {
                        jqbh: '',
                        bjsj: '',
                        sfdd: '',
                        bjrxm: '',
                        bjrdh: '',
                        bjnr: '',
                        ddxcsj: [],
                        zbmjxm: [],
                        xbmjmc: '',
                        cjdwmc: '',
                        sfsj: '',
                        cjsj: [],
                        jlly: '',
                        jqlbmc: '',
                        mjyj: '',
                    };
                    ajgl_ck_Man.cj_data = [];
                    ajgl_ck_Man.jq_nodata = !Boolean(ajgl_ck_Man.jq_data.length);
                    ajgl_ck_Man.cj_nodata = !Boolean(ajgl_ck_Man.cj_data.length);
                    this.configGlmtNumber(); //关联媒体总数和选中个数

                    return;
                }

                //处理关联警情字段
                ret.data.jlly = ret.data.jlly == '01' ? '后台系统同步' : '管理系统人工录入';
                ajglMan.gljq_info = ret.data;
                let zbmjxmTemp = [];
                // for(let i=0;i<20;i++){
                for (let i = 0; i < ret.data.zbmjxm.length; i++) {
                    zbmjxmTemp.push(ret.data.zbmjxm + '(' + ret.data.zbmj + ')');
                }
                ret.data.zbmjxm = zbmjxmTemp;

                // ret.data.zbmjxm = ret.data.zbmjxm + '(' + ret.data.zbmj + ')';
                ret.data.xbmjmc = ret.data.xbmjmc + '(' + ret.data.xbmj + ')';
                info_body.allInfomation = ret.data;
                Tools.reduceWordForGljq();

                //处理通过警情ID获得的媒体文件
                ret.data.preBaseFiles = ret.data.preBaseFiles ? ret.data.preBaseFiles : [];
                ret.data.handelerBaseFiles = ret.data.handelerBaseFiles ? ret.data.handelerBaseFiles : [];
                ['preBaseFiles', 'handelerBaseFiles'].forEach(function (val, key) {
                    ret.data[val].forEach(function (val, key) {
                        val.checked = false;
                        val.importTime = formatDate(val.importTime);
                        val.startTime = formatDate(val.startTime);
                        val.duration = Tools.formatDuring(val.duration * 1000);
                        val.toggle = false;
                        val.keyFile = val.keyFile == true ? '是' : '否';
                        val.type = (function () {
                            switch (val.type) {

                                case 0:
                                    return '视频';
                                    break;
                                case 1:
                                    return '音频';
                                    break;
                                case 2:
                                    return '图片';
                                    break;
                                case 3:
                                    return '文本';
                                    break;
                                case 4:
                                    return '其他';
                                    break;
                            }
                        }());
                    });
                });

                //处理选中已经总共数量的显示
                // ajgl_ck_Man.jq_data = ret.data.handelerBaseFiles;
                ajgl_ck_Man.cj_data = ret.data.handelerBaseFiles;
                ajgl_ck_Man.jq_nodata = !Boolean(ajgl_ck_Man.jq_data.length);
                ajgl_ck_Man.cj_nodata = !Boolean(ajgl_ck_Man.cj_data.length);
                this.configGlmtNumber(); //关联媒体总数和选中个数

            }
        });
    },
    clearForm: function () {
        table.$selectOption = [];
        ajglMan.$searchForm.record = ajgl_initialData();
    },
    clearPlayer: function (type) {
        var playing = type == '_dia' ? tjgl_form : ajgl_ck_Man;

        if (type == '') {
            $('.finishDelete').css('display', 'none');
        }
        playing.video_url = '';
        playing['ocxPlayer' + type] = false;

        playing.imgff = false;
        $('.outDateMedia' + type).css('display', 'none');
    },
    reduceWordForToggle: function () {
        $('.mtsecondpart .jj-inline-div .inlineSpan span:nth-child(2)').each(function () {

            if ($(this).text().length > 13) {
                // $(this).attr('title', $(this).text());
                $(this).attr('data-toggle', 'popover');
                $(this).attr('data-placement', 'top');
                Tools.setPopover($(this));
            } else {
                return;
            }
        });
        $('.mtsecondpart .jj-inline-div .inlineSpan').find($("[data-toggle='popover']")).popover({

            container: 'body',
            placement: 'top',
            html: 'true',
            content: function () {
                return '<div class="title-content">' + $(this).text() + '</div>';
            },
            animation: false
        });
    },
    reduceWordForAllInfo: function () {
        $('.allinfo-dialog span').each(function () {

            if ($(this).text().length > 15) {
                $(this).attr('title', $(this).text().split('：')[1]);
                $(this).attr('data-toggle', 'popover');
                $(this).attr('data-placement', 'top');
                Tools.setPopover($(this));
            } else {
                return;
            }
        });
        $('.allinfo-dialog').find($("[data-toggle='popover']")).popover({

            container: 'body',
            placement: 'top',
            html: 'true',
            content: function () {
                return '<div class="title-content">' + $(this).text().split('：')[1] + '</div>';
            },
            animation: false
        });
    },
    reduceWordForGljq: function () {

        $('.gljq_inline span').each(function () {
            if ($(this).text().length > 15) {
                // $(this).attr('title', $(this).text().split('：')[1]);
                $(this).attr('data-toggle', 'popover');
                $(this).attr('data-placement', 'top');
                Tools.setPopover($(this));
            } else {
                return;
            }
        });
        $('.gljq_inline').find($("[data-toggle='popover']")).popover({

            container: 'body',
            placement: 'top',
            html: 'true',
            content: function () {
                return '<div class="title-content">' + $(this).text().split('：')[1] + '</div>';
            },
            animation: false
        });
    },
    reduceWordForHead: function () {

        if ($('.ajgl-ck-head span').text().length > 15) {
            $('.ajgl-ck-head span').attr('title', $('.ajgl-ck-head span').text());
        }
    },
    setPopover: function (ele) {
        ele.on("mouseenter", function () {
            var _this = this;
            clearTimeout(_this.timer);
            _this.timer = setTimeout(function () {
                $('div').siblings(".popover").popover("hide");
                $(_this).popover("show");
            }, 500);
            $(this).siblings(".popover").on("mouseleave", function () {
                $(_this).popover('hide');
            });
        }).on("mouseleave", function () {
            var _this = this;
            clearTimeout(_this.timer);
            setTimeout(function () {
                if (!$(".popover:hover").length) {
                    $(_this).popover("hide");
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
    },
    reduceWordForCjxx: function () {
        $('.cjxx .innerSpan').each(function () {

            if ($(this).text().length > 15) {
                // $(this).attr('title', $(this).text());
                $(this).attr('data-toggle', 'popover');
                $(this).attr('data-placement', 'top');
                Tools.setPopover($(this));
            } else {
                return;
            }
        });
        $('.cjxx').find($("[data-toggle='popover']")).popover({
            trigger: 'manual',
            container: 'body',
            placement: 'top',
            html: 'true',
            content: function () {
                return '<div class="title-content">' + $(this).text() + '</div>';
            },
            animation: false
        });
    },
    reduceWordForJbxx: function () {
        $('.jbxx .innerSpan').each(function () {

            if ($(this).text().length > 14) {
                // $(this).attr('title', $(this).text());
                $(this).attr('data-toggle', 'popover');
                $(this).attr('data-placement', 'top');
                Tools.setPopover($(this));
            } else {
                return;
            }
        });
        $('.jbxx').find($("[data-toggle='popover']")).popover({

            container: 'body',
            placement: 'top',

            html: 'true',
            content: function () {
                return '<div class="title-content">' + $(this).text() + '</div>';
            },
            animation: false
        });
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
                    message: '获取部门树失败，请稍后再试',
                    title: '通知'
                });
                return;
            }
            let ajgl_form_data = null;
            if (storage && storage.getItem) {

                if (storage.getItem('zfsypsjglpt-jdkp-ajkp_gongan')) {
                    ajgl_form_data = JSON.parse(storage.getItem('zfsypsjglpt-jdkp-ajkp_gongan'));
                }
            } else {

            };
            getDepTree(result.data, slqktj_deptemp);
            yspk_tree.yspk_data = slqktj_deptemp;
            yspk_tree.tree_code = ajgl_form_data ? ajgl_form_data.orgPath || slqktj_deptemp[0].path : slqktj_deptemp[0].path;
            yspk_tree.tree_key = ajgl_form_data ? ajgl_form_data.orgPath : slqktj_deptemp[0].orgPath;
            // yspk_tree.tree_title = slqktj_deptemp[0].title;
            yspk_tree.tree_title = ajgl_form_data ? ajgl_form_data.orgName || (slqktj_deptemp[0] ? slqktj_deptemp[0].title : '') : (slqktj_deptemp[0] ? slqktj_deptemp[0].title : '');
        }).then(result => {
            //勾选抽查
            // if (!local_storage.ccNumBtn) {
            //恢复上次抽查数据
            if (local_storage.table_list) {
                return;
            }
            // }
            table.fetch(true, true);
        });
    },
    // getTree: function () {
    //     ajax({
    //         // url: '/gmvcs/uap/org/all',
    //         // url: '/gmvcs/uap/org/find/root',
    //         url: '/gmvcs/uap/org/find/fakeroot/mgr',
    //         method: 'get',
    //         data: {},
    //         cache: false
    //     }).then(ret => {
    //         if (!(ret.code == 0)) {
    //             Tools.sayError('获取部门数据失败');
    //             return;
    //         }
    //         Tools.checkType = ret.data.checkType;
    //         ajglMan.searchForm_sjdw.rdata = Tools.addIcon(ret.data);
    //         ajglMan.searchForm_sjdw.expandedKeys = [ret.data[0].orgId];
    //         var ajgl_form_data = null;

    //         if (storage && storage.getItem) {

    //             if (storage.getItem('zfsypsjglpt-jdkp-ajkp_gongan')) {
    //                 ajgl_form_data = JSON.parse(storage.getItem('zfsypsjglpt-jdkp-ajkp_gongan'));
    //             }
    //         } else {

    //         };

    //         ajglMan.searchForm_sjdw.checkedKeys = ajgl_form_data ? ajgl_form_data.sjdw : (ret.data ? ret.data[0].orgId : '');
    //         ajglMan.searchForm_sjdw.sjdw = ajgl_form_data ? ajgl_form_data.sjdw : ret.data[0].orgId;
    //         ajglMan.$searchForm.record.sjdw = ajgl_form_data ? ajgl_form_data.sjdw : ret.data[0].orgId;
    //         ajglMan.searchForm_sjdw.checkType = ajgl_form_data ? ajgl_form_data.checkType : ret.data[0].checkType;
    //         table.fetch(true, true);

    //         // 执行用户自定义操作          
    //         ajax({
    //             // url: '/gmvcs/uap/org/find/by/parent?pid=' + ajglMan.searchForm_sjdw.checkedKeys,
    //             url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + ajglMan.searchForm_sjdw.checkedKeys + '&checkType=' + ajglMan.searchForm_sjdw.checkType,
    //             method: 'get',
    //             data: null,
    //             cache: false
    //         }).then(ret => {

    //             if (ret.code == 0) {

    //                 if (ret.data) {
    //                     var $tree_target = $.fn.zTree.getZTreeObj($('#tree-select-wrap .ztree').attr('id'));
    //                     var node = $tree_target.getNodesByParam('key', ajglMan.searchForm_sjdw.checkedKeys, null)[0];
    //                     $tree_target.addNodes(node, Tools.addIcon(ret.data));
    //                     $tree_target = null;
    //                     node = null;
    //                 } else {
    //                     this.sayError('请求下级部门数据失败');
    //                 }
    //             } else {
    //                 this.sayError('请求下级部门数据失败');
    //             }
    //         });
    //     });
    // },
    //给tree增加图标
    addIcon: function (arr) {

        // 深拷贝原始数据
        var dataSource = JSON.parse(JSON.stringify(arr))
        var res = [];

        // 每一层的数据都 push 进 res
        res.push(...dataSource);

        // res 动态增加长度
        for (var i = 0; i < res.length; i++) {
            var curData = res[i]
            curData.icon = '/static/image/zfsypsjglpt/users.png';
            curData.key = curData.orgPath;
            curData.id = curData.orgId;
            curData.title = curData.orgName;
            curData.isParent = true;
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
    dealTableWithoutData: function (page) {
        table.$cache[page] = [];
        table.pagination.total = table.flag == 0 ? table.pagination.total : 0;
        table.remoteList = [];
        table.loading = false;
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
    addShowInfo: function (type) {
        var className = type + 'Class';
        $('.modal-content').addClass(className);
        $('.modal-content').addClass('draggable');

        if (!$('.modal-dialog').hasClass('ajgl-showinfo')) {
            $('.modal-dialog').addClass('ajgl-showinfo');
        } else {
            return;
        }
    },
    searchCaseInfo: function () {

        ajax({
            url: '/gmvcs/audio/case/searchById/' + ajgl_session.getAjbh(),
            method: 'post',
            data: '',
            cache: false
        }).then(ret => {

            if (ret.code == 0) {

                if (!ret.data) {

                } else {

                    //处理案件信息
                    ajgl_ck_Man.checkLooking = ret.data.ajmc + ' (' + ret.data.ajbh + ')';
                    ret.data.afsj = formatDate(ret.data.afsj);
                    ret.data.zbmjxm = ret.data.zbmjxm ? ret.data.zbmjxm : '-';
                    ret.data.ajlb = ret.data.ajlbmc;
                    var sary = '';
                    ret.data.involvedPeoples = ret.data.involvedPeoples ? ret.data.involvedPeoples : [{
                        rymc: '-'
                    }];
                    ret.data.involvedPeoples.forEach(function (val, key) {

                        if (key == 0) {
                            sary += val.rymc;
                        } else {
                            sary += (',' + val.rymc);
                        }
                    });
                    ret.data.sary = sary;
                    ajgl_ck_Man.jbxxInfo.infomation = ret.data;

                    Tools.reduceWordForHead();
                    Tools.reduceWordForJbxx();
                    //关联警情下拉菜单
                    var selectOption = [];
                    ret.data.policeSituation = ret.data.policeSituation ? ret.data.policeSituation : [];
                    ret.data.policeSituation.forEach(function (value, index, arr) {
                        selectOption.push({
                            label: value,
                            value: value
                        });
                    });
                    ajglMan.typeOptions = selectOption;
                    ajglMan.selecting = ret.data.policeSituation[0] ? ret.data.policeSituation[0] : '';
                    Tools.searchMediaByJqbh();
                }
            } else {

            }
        });
        //测试数据
        // ajgl_ck_Man.authority.JCKP = true;
        // ajgl_ck_Man.authority.FZKP = true;
        // kplb_type = 1;
        // policeType = false;


        //kplb==2为超级管理员
        if (kplb_type == 2) {
            ajgl_ck_Man.jckp_clickClass = "jbxx-btn";
            ajgl_ck_Man.mtxx_clickClass = 'cjxx-btn';
            ajgl_ck_Man.jbxx_clickClass = "cjxx-btn";
            ajgl_ck_Man.fzkp_clickClass = "cjxx-btn";
            ajgl_ck_Man.jckpStatus = true;
            ajgl_ck_Man.fzkpStatus = true;
            ajgl_ck_Man.kpType = 'jckp';
            ajgl_ck_Man.authority.JCKP = true;
            ajgl_ck_Man.authority.FZKP = true;
            if (currentList.jckp) {
                getEvaInfo("BASIC");
            } else {
                getPolicesituation();
            }
            return;
        }

        //初始情况放在这,统一解决选中警情信息
        ajgl_ck_Man.mtxx_clickClass = 'cjxx-btn';
        ajgl_ck_Man.jbxx_clickClass = "jbxx-btn";
        ajgl_ck_Man.fzkp_clickClass = "cjxx-btn";
        ajgl_ck_Man.jckp_clickClass = "cjxx-btn";
        ajgl_ck_Man.jbxx_show = true;
        ajgl_ck_Man.cjxx_show = -1;
        ajgl_ck_Man.jckpStatus = false;
        ajgl_ck_Man.fzkpStatus = false;
        ajgl_ck_Man.kpType = 'jckp';


        if ((ajgl_ck_Man.authority.JCKP == true)) {
            ajgl_ck_Man.fzkpStatus = false;
            switch (kplb_type) {
                case 0:
                    if (currentList.jckp) {
                        getEvaInfo("BASIC");
                    } else if (policeType == true) {
                        ajgl_ck_Man.kpType = 'jckp';
                        getPolicesituation();

                    } else {
                        return;
                    }
                    //控制底部法制考评是否出现
                    if ((policeType == true) && (ajgl_ck_Man.authority.FZKP == true) && (currentList.fzkp == true)) {
                        ajgl_ck_Man.fzkpStatus = true;
                    }
                    getSelectedItem("jckp");
                    break;
                case 1:
                    if (ajgl_ck_Man.authority.FZKP == true) {
                        ajgl_ck_Man.fzkpStatus = true;
                        //法制类领导,基层/法制页面有配权限且基层未考评过=>选中法制考评
                        if (currentList.jckp == true && policeType == true) {
                            getEvaInfo("BASIC");
                            getSelectedItem("jckp");
                        } else {
                            if (currentList.fzkp) {
                                getEvaInfo("LEGAL");
                                getSelectedItem("fzkp");
                            } else if (policeType == true) {
                                getPolicesituation();
                                ajgl_ck_Man.kpType = 'fzkp';
                                getSelectedItem("fzkp");
                            } else {
                                ajgl_ck_Man.fzkpStatus = false;
                            }
                        }
                    } else {
                        ajgl_ck_Man.fzkpStatus = false;
                    }
                    break;
                default:
                    //警员类别为其他时,有考评则显示
                    if (currentList.jckp == true) {
                        getEvaInfo("BASIC");
                        getSelectedItem("jckp");
                        //法制考评有配置,且已考评过，则显示
                        if ((ajgl_ck_Man.authority.FZKP == true) && (currentList.fzkp == true)) {
                            ajgl_ck_Man.fzkpStatus = true;
                        }
                    } else if ((ajgl_ck_Man.authority.FZKP == true) && (currentList.fzkp == true)) {
                        ajgl_ck_Man.fzkpStatus = true;
                        getEvaInfo("LEGAL");
                        getSelectedItem("fzkp");
                    }
                    break;
            }
        } else if ((ajgl_ck_Man.authority.JCKP == false) && (ajgl_ck_Man.authority.FZKP == true)) {
            switch (kplb_type) {
                case 0:
                    if (policeType == true && currentList.fzkp == true) {
                        getEvaInfo("LEGAL");
                        getSelectedItem("fzkp");
                    }
                    break;
                case 1:
                    if (currentList.fzkp) {
                        getEvaInfo("LEGAL");
                        getSelectedItem("fzkp");
                    } else if (policeType == true) {
                        getPolicesituation();
                        ajgl_ck_Man.kpType = 'fzkp';
                        getSelectedItem("fzkp");
                    }
                    break;
                default:
                    if (currentList.fzkp == true) {
                        ajgl_ck_Man.fzkpStatus = true;
                        getEvaInfo("LEGAL");
                        getSelectedItem("fzkp");
                    }
                    break;
            }
        }

    },
    clickGlmt: function (type) {
        ajgl_ck_Man.glmt_name.forEach(function (val, key) {
            ajgl_ck_Man[val + '_clickClass'] = 'glmt_cj';
            ajgl_ck_Man['glmt_' + val + '_show'] = false;
        });
        ajgl_ck_Man[type + '_clickClass'] = 'glmt_jj';
        ajgl_ck_Man['glmt_' + type + '_show'] = true;
        ajgl_ck_Man.glmt_mark = type;
        Tools.configGlmtNumber();
    },
    configGlmtNumber: function () {
        var type = ajgl_ck_Man.glmt_mark;
        ajgl_ck_Man.glmt_total = ajgl_ck_Man[type + '_data'].length;
    },
    init: function () {

    }
};

var cookier = (function init() {
    function cookierWorker() {

        //私有方法
        function timeHandler(time) {
            var ex = time.substring(0, time.length - 1);
            var pire = time.substring(time.length - 1);

            switch (pire) {

                case 's':
                    ex *= 1000;
                    break;

                case 'm':
                    ex *= 60 * 1000;
                    break;

                case 'h':
                    ex *= 60 * 60 * 1000;
                    break;

                case 'd':
                    ex *= 24 * 60 * 60 * 1000;
            };
            var timeHanle = new Date();
            var timeSetted = ex;
            timeHanle.setTime(timeHanle.getTime() + timeSetted);
            return ";expires=" + timeHanle.toGMTString();
        };
        this.getTime = function (ex) {
            return timeHandler(ex);
        };
    };
    cookierWorker.prototype.getCookie = function (name) {
        var cookieArray = document.cookie.split(';');
        var cookieAccept = new Array();
        var cookieRegex = new RegExp(name + "=", "g");
        for (var i = 0; i < cookieArray.length; i++) {
            var c;

            if (cookieArray[i].trim) {
                c = $.trim(cookieArray[i]);
            } else {
                c = cookieArray[i].replace(/(^\s*)|(\s*$)/g, "");
            };

            if (cookieRegex.test(c)) {
                cookieAccept.push(c);
            } else {
                continue;
            };
        };

        if (cookieAccept.length == 0) {
            return '';
        } else {
            return cookieAccept[0].spilt('=')[1];
        };
    };
    cookierWorker.prototype.setCookie = function (name, value, expire) {
        var cookieAim = this.getCookie(name);

        //不存在名为name的cookie
        if (cookieAim == undefined) {
            var cookieString = '';
            cookieString += name + '=' + value;

            if (expire == undefined) {
                document.cookie = cookieString;
            } else {
                cookieString += this.getTime(expire);
                document.cookie = cookieString;
            };
        } else { //已存在名为name的cookie
            var query = confirm("已存在名为" + name + "的cookie,请问是否修改该cookie");

            if (query) {
                this.removeCookie(name);
                this.setCookie(name, value, expire);
            } else {
                return;
            }
        };
    };
    cookierWorker.prototype.modifyCookie = function (name, value, expire) {
        var cookieAim = this.getCookie(name);

        if (cookieAim == undefined) {
            this.setCookie(name, value, expire);
        } else {
            this.removeCookie(name);
            this.setCookie(name, value, expire);
        };
    };
    cookierWorker.prototype.removeCookie = function (name) {
        var cookieAim = this.getCookie(name);

        if (cookieAim == undefined) {
            return;
        } else {
            var cookieCover = cookieAim[0].split("=");
        };

        if (cookieCover[0].trim) {
            document.cookie = name + "=" + $.trim(cookieCover[1]) + ";expires=Thu, 01 Jan 1970 00:00:00 GMT";
        } else {
            document.cookie = name + "=" + cookieCover[1].replace(/(^\s*)|(\s*$)/g, "") + ";expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    };
    return new cookierWorker();
})();
/**********查询表单初始化函数(需单独提出)**********/
function ajgl_initialData() {
    return {
        bjsjEnd: '',
        bjsjStart: '',
        sjdw: '',
        ajbh: '',
        ajmc: '',
        jqbh: '',
        gllb: 'ALL',
        sary: '',
        jy: '',
        evaStatus: 'ALL',
        evaResult: 'ALL',
        reviewStatus: 'ALL',
        reviewResult: 'ALL'
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

function EventTarget() {
    this.handlers = {};
};
EventTarget.prototype = {
    constructor: EventTarget,
    addHandler: function (type, handler) {

        if (typeof this.handlers[type] == 'undefined') {
            this.handlers[type] = [];
        };
        this.handlers[type].push(handler);
    },
    fire: function (event) {

        if (!event.target) {
            event.target = this;
        };

        if (this.handlers[event.type] instanceof Array) {
            var handlers = this.handlers[event.type];
            for (var i = 0, len = handlers.length; i < len; i++) {
                handlers[i](event);
            };
        };
    },
    removeHandler: function (type, handler) {

        if (this.handlers[event.type] instanceof Array) {
            var handlers = this.handlers[type];
            for (var i = 0, len = handlers.length; i < len; i++) {

                if (handlers[i] === handler) {
                    break;
                }
            };
            handlers.splice(i, 1);
        }
    }
};

//拖放
var DragDrop = function () {
    var dragdrap = new EventTarget(),
        dragging = null,
        diffX = 0,
        diffY = 0;

    function handleEvent(event) {

        event = event || window.event;
        var target = event.target || event.srcElement,
            targetParent = target.offsetParent;

        if (targetParent == null) {
            return;
        }

        switch (event.type) {
            case 'mousedown':

                if (targetParent.className && targetParent.className.indexOf('draggable') > -1) {
                    dragging = targetParent;
                    diffX = event.clientX - targetParent.offsetLeft;
                    diffY = event.clientY - targetParent.offsetTop;
                    dragdrap.fire({
                        type: 'dragstart',
                        target: dragging,
                        x: event.clientX,
                        y: event.clientY
                    });
                } else {
                    return;
                }
                break;

            case 'mousemove':

                if (dragging !== null) {
                    dragging.style.left = (event.clientX - diffX) + 'px';
                    dragging.style.top = (event.clientY - diffY) + 'px';
                    dragdrap.fire({
                        type: 'drag',
                        target: dragging,
                        x: event.clientX,
                        y: event.clientY
                    });
                } else {
                    return;
                }
                break;

            case 'mouseup':

                if (dragging !== null) {
                    dragdrap.fire({
                        type: 'dragend',
                        target: dragging,
                        x: event.clientX,
                        y: event.clientY
                    });
                    dragging = null;
                } else {
                    return;
                }
                break;
        };
    };
    dragdrap.enable = function () {
        $(document).mousedown(handleEvent);
        $(document).mousemove(handleEvent);
        $(document).mouseup(handleEvent);
    };
    dragdrap.disable = function () {
        $(document).unbind('mousedown');
        $(document).unbind('mousemove');
        $(document).unbind('mouseup');
    };
    return dragdrap;
}();
DragDrop.addHandler('dragstart', function (event) {

});
DragDrop.addHandler('drag', function (event) {

});
DragDrop.addHandler('dragend', function (event) {

});
DragDrop.enable();


//判断领导版本或警员版本
function judgeLeaderOrPerson(judgeLeader) {
    table.version_AJKP = judgeLeader;
    let flag = judgeLeader;
    // if (flag) {
    //     $('.top-form').css('height', '130px');
    //     $('.leaderORpolice').css('display', 'inherit');
    //     $('.bjsj_aj').css('margin-left', '25px');

    //     /*调整关闭X的位子*/
    //     $('.ajgl-container-kp-qjzb .ajbh_close_kp').css('left', '517px');
    //     $('.ajgl-container-kp-qjzb .ajmc_close_kp').css('left', '802px');
    //     $('.ajgl-container-kp-qjzb .jqbh_close').css('left', '1087px');

    //     $('.ajgl-container-kp-qjzb .sary_close_kp').css('left', '517px');
    //     $('.ajgl-container-kp-qjzb .sary_close_kp').css('left', '-37px');
    //     $('#ajkp_table_qjzb').css('top', '0px');
    //     return;
    // } else {
    // $('#aqglTable').css('top', '105px');
    // $('.top-form').css('height', '90px');
    // $('.leaderORpolice').css('display', 'none');
    // $('.bjsj_aj').css('margin-left', '13px');

    /*调整关闭X的位子*/
    // $('.ajgl-container-kp-qjzb .ajbh_close_kp').css('left', '230px');
    // $('.ajgl-container-kp-qjzb .ajmc_close_kp').css('left', '517px');
    // $('.ajgl-container-kp-qjzb .jqbh_close').css('left', '802px');

    // $('.ajgl-container-kp-qjzb .sary_close_kp').css('left', '230px');
    // $('.ajgl-container-kp-qjzb .sary_close_kp').css('left', '-78px');
    // $('#ajkp_table_qjzb').css('position', 'absolute');
    // $('#ajkp_table_qjzb').css('top', '-40px');
    // }
}

/*按照属性值，查找对象*/
function findElem(arrayToSearch, attr, val) {
    for (var i = 0; i < arrayToSearch.length; i++) {
        if (arrayToSearch[i][attr] == val) {
            return i;
        }
    }
    return -1;
}

/*表格控制器*/
let tableBodyAJKP = avalon.define({ //表格定义组件
    $id: 'ajkp_table_qjzb',
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
    dragStorageName: 'jdkp-ajkpQjzb-tableDrag-style',
    handle: function (type, col, record, $index) { //操作函数
        var extra = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            extra[_i - 4] = arguments[_i];
        }
        var text = record[col].$model || record[col];
        table.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});
let tableObjectAJKP = {};


//定义树
let yspk_tree = avalon.define({
    $id: "jdkp_sldw_tree_qjzb",
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
                    title: '通知'
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

