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
import {
    Gm
} from '../common/common-tools.js';

require('/apps/zfsypsjglpt/zfsypsjglpt-jdkp-jycx-ykp_jiaojing.css');
export const name = 'zfsypsjglpt-jdkp-qzcs-ykp_jiaojing';
let delete_ocx = require('../../apps/common/common').delete_ocx; //---引入声明
let kp_hccl = null;

function Tools() {

    //核查，简易程序信息，媒体信息之间的tab切换
    this.toggleTab = function (mark) {
        kp_hccl.hc_tab_show = mark != 'jbxx' ? false : true;
        let reg = new RegExp(mark, 'g');
        let classes = ['jbxx_clickClass', 'cjxx_clickClass', 'mtxx_clickClass'];
        let show = ['jbxx_show', 'cjxx_show', 'mtxx_show'];
        classes.forEach((i, key) => {
            kp_hccl[i] = 'cjxx-btn';
        })
        show.forEach((i, key) => {
            kp_hccl[i] = false;
        });
        classes.forEach((i, key) => {

            if (reg.test(i)) {
                kp_hccl[i] = 'jbxx-btn';
                return;
            }
        });
        show.forEach((i, key) => {

            if (reg.test(i)) {
                kp_hccl[i] = true;
                return;
            } else {
                if (mark == 'jbxx') {
                    kp_hccl.jbxx_show = true;
                }
            }
        });
        $('#zflx').text(kp_hccl.cjxxInfo.infomation.type);
    };

    //初始化核查结果表单
    this.clear_hc_form = function () {
        info_body.real = '1';
        info_body.deduction = '';
        info_body.comment = '';
        info_body.error_number_valid = false;
    };

    //违法类别的分析
    this.changeWfType = function (i) {
        switch (i) {
            case 'VIOLATION':
                return '简易程序';
                break;
            case 'SURVEIL':
                return '非现场处罚';
                break;
            case 'FORCE':
                return '强制措施'
                break;
            default:
                return '事故处理';
        }
    };

    //获取简易程序信息以及媒体信息
    this.get_jycx_info = function (param) {
        ajax({
            url: '/gmvcs/audio/force/search/' + window.kpcczl_qzcs,
            // url: '/api/faketable3.json',
            method: 'get',
            // method: 'post',
            data: null,
            cache: false
        }).then(ret => {

            if (ret.code == 0) {

                if (!ret.data) {
                    Gm_tool.sayError('获取查看详细信息失败');
                    return;
                }
                //获取关联媒体信息
                ret.data.files = ret.data.files ? ret.data.files : [];
                ret.data.files.forEach((i, key) => {
                    i.duration = Gm_format.formatDuring(i.duration * 1000);
                    i.type = (function () {
                        switch (i.type) {

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
                kp_hccl.mtdata = ret.data.files;
                Gm_tool.reduceWord('.cmspan .cmspan_prop', '.cmspan', 15);

                //获取简易程序信息
                let infos_of_jycx = {};
                ({
                    //   type: infos_of_jycx.type,
                    orgName: infos_of_jycx.orgName,
                    dsr: infos_of_jycx.dsr,
                    userName: infos_of_jycx.userName,
                    userCode: infos_of_jycx.userCode,
                    jszh: infos_of_jycx.jszh,
                    wfxwmc: infos_of_jycx.wfxwmc,
                    jdsbh: infos_of_jycx.jdsbh,
                    hphm: infos_of_jycx.hphm,
                    wfdz: infos_of_jycx.wfdz,
                    hpzlmc: infos_of_jycx.hpzlmc,
                    wfsj: infos_of_jycx.wfsj,
                    pzbh: infos_of_jycx.pzbh,
                } = ret.data);
                infos_of_jycx.type = Gm_tool.changeWfType(ret.data.type);
                kp_hccl.infomation_type = infos_of_jycx.type + '信息';
                Gm_tool.assign(kp_hccl.cjxxInfo.infomation, infos_of_jycx);
                //    kp_hccl.checkLooking = (infos_of_jycx.wfxw ? infos_of_jycx.wfxw : '')  + ' (' + (ret.data.wfbh ? ret.data.wfbh : '')  + ')';
                kp_hccl.checkLooking = (ret.data.wfxwmc || '-') + '(' + (ret.data.pzbh || '-') + ')';

                //判断是否考评&核查过
                ({
                    reviewStatus: kp_hccl.hc_done,
                    evaStatus: kp_hccl.kp_done,
                } = ret.data);

                if (kp_hccl.hc_done) {
                    Gm_tool.get_review_info();
                };

                if (kp_hccl.kp_done) {
                    Gm_tool.get_eva_info();
                }
            } else {
                Gm_tool.sayError('获取简易程序数据详细信息失败');
            }
        });
    };

    //获取考评信息
    this.get_eva_info = function () {
        ajax({
            url: '/gmvcs/audio/force/eva/info/' + window.kpcczl_qzcs,
            //  url: '/api/faketable4.json',
            method: 'get',
            //  method: 'POST',
            data: null,
            cache: false
        }).then(ret => {

            if (ret.code == 0) {
                ret.data.passed = ret.data.passed ? '通过, ' : '不通过, ';
                ret.data.result = ret.data.passed + ret.data.result;
                kp_hccl.jbxxInfo.kp_infomation = ret.data;
                Gm_tool.reduceWord('.jbxx .innerSpan', '.jbxx', 14);
            } else {
                Gm_tool.sayError('获取考评信息失败');
            }
        });
    };

    //核查结果的确定
    this.set_review_info = function (params) {
        ajax({
            url: '/gmvcs/audio/force/review',
            // url: '/api/faketable.json',
            method: 'POST',
            data: params,
            cache: false
        }).then(ret => {

            if (ret.code == 0) {
                Gm_tool.saySuccess('核查处理成功');
                kp_hccl.hc_done = true;
                kp_hccl.cancel_hc();
                Gm_tool.get_hc_result();
            } else {
                Gm_tool.sayError('核查处理失败');
            }
        });
    };

    //获取核查信息
    this.get_review_info = function () {
        ajax({
            url: '/gmvcs/audio/force/review/info/' + window.kpcczl_qzcs,
            //    url: '/api/faketable5.json',
            method: 'get',
            //    method: 'POST',
            data: null,
            cache: false
        }).then(ret => {

            if (ret.code == 0) {
                ret.data.real = ret.data.real ? '属实' : '不属实';
                Gm_tool.assign(kp_hccl.jbxxInfo.hc_infomation, ret.data);
                kp_hccl.hc_done = true;
                Gm_tool.reduceWord('.jbxx .innerSpan', '.jbxx', 14);
            } else {
                Gm_tool.sayError('获取核查信息失败');
            }
        });
    }
};

function Format() {};

function Reg() {};
Tools.prototype = Object.create(new Gm().tool);
Format.prototype = Object.create(new Gm().format);
Reg.prototype = Object.create(new Gm().reg);
let Gm_tool = new Tools();
let Gm_format = new Format();
let Gm_reg = new Reg();
avalon.component(name, {
    template: __inline('./zfsypsjglpt-jdkp-qzcs-ykp_jiaojing.html'),
    defaults: {
        back() {
            $("#gm_webplayer").hide();
            delete_ocx();
            window.history.go(-1);
        },
        height: 500,
        mtdata: [],
        diaHide: true,
        playFile: function (ret, name) {
            //自定义的回调，再点击媒体之后
            Gm_tool.assign(this.mtxxinfo.mt_infomation, ret.data);
            kp_hccl.checkLooking = '正在查看: ' + name;
            this.mtxx();
        },

        //页面标题 -- 正在看
        checkLooking: '',

        //媒体信息栏
        mtxx_clickClass: 'cjxx-btn',
        mtxx() {
            Gm_tool.toggleTab('mtxx');
            Gm_tool.reduceWord('.mtxx .innerSpan', '.mtxx', 15);
        },
        mtxx_show: false,
        mtxxinfo: avalon.define({
            $id: 'ajgl_mtxx_info3',

            //核查处理核查信息字段
            mt_infomation: {
                startTime: '-',
                jobType: '-',
                importTime: '-',
                saveTime: '-',
                userName: '-',
                userCode: '-',
                keyFile: '-',
                path: '-',
            },
        }),

        //核查处理，简易程序信息    
        kp_done: false,
        hc_done: false,
        hc_tab_show: true,
        jbxx_clickClass: 'jbxx-btn',
        infomation_type: '',
        $computed: {
            hx_type: function () {
                let text = this.hc_done ? '考评核查结果' : '考评';
                return text;
            },
        },
        jbxx_show: true,
        hccl(e) {
            if (this.hc_done) {
                return;
            } else {
                this.show_hccl();
            }
        },
        jbxx(e) {
            Gm_tool.toggleTab('jbxx');
            Gm_tool.reduceWord('.jbxx .innerSpan', 'jbxx', 14);
        },
        jbxxInfo: avalon.define({
            $id: 'ajgl_jbxx_info3',

            //核查处理核查信息字段
            hc_infomation: {
                orgName: '-',
                userName: '-',
                userCode: '-',
                createTime: '-',
                real: '-',
                deduction: '-',
                comment: '-',
            },

            //核查处理考评信息字段
            kp_infomation: {}
        }),

        //查看 -- 核查信息
        cjxx_clickClass: 'cjxx-btn',
        cjxx_show: false,
        cjxx(e) {
            Gm_tool.toggleTab('cjxx');
            Gm_tool.reduceWord('.cjxx .innerSpan', 'cjxx', 15);
        },
        cjxxInfo: avalon.define({
            $id: 'ajgl_cjxx_info3',

            //简易程序信息
            infomation: {}
        }),

        //点击核查        
        hccl_dialog_show: false,
        cancel_hc() {
            Gm_tool.clear_hc_form();
            this.hccl_dialog_show = false;
            $('#gm_webplayer').css('z-index', 9999);
            $("#iframe_zfsyps").hide();
            $('.popover').hide();
        },
        move_return(a, b) {
            $("#iframe_zfsyps").css({
                width: '480px', //---- 这个是弹窗的宽度
                height: '400px', //---- 这个是弹窗的高度
                left: a,
                top: b
            });
        },
        show_hccl() {
            $('#gm_webplayer').css('z-index', 0);
            Gm_tool.clear_hc_form();
            this.hccl_dialog_show = true;
            Gm_tool.addClassForDialog('hccl');
            $('.modal-title').text('核查处理');
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
        done_hcck() {
            let params = {
                bh: window.kpcczl_qzcs,
                reviewInfo: {
                    deduction: info_body.deduction,
                    comment: info_body.comment,
                    real: info_body.real == '1' ? true : false,
                }
            };

            if ($('.deletepoint').attr('disabled') || Gm_reg.int.test($.trim(params.reviewInfo.deduction)) && $.trim(params.reviewInfo.deduction) <= 9999) {

                if (!$.trim(params.reviewInfo.comment)) {
                    info_body.error_hcyj_valid = true;
                    return;
                } else {
                    params.reviewInfo.deduction = Number(params.reviewInfo.deduction);
                    Gm_tool.set_review_info(params);
                }
            } else {
                info_body.error_number_valid = true;
                return;
            }
        },

        //刷新离开       
        back_confirm: false,
        move_return2(a, b) {
            $("#iframe_zfsyps").css({
                width: '299px', //---- 这个是弹窗的宽度
                height: '180px', //---- 这个是弹窗的高度
                left: a,
                top: b
            });
        },
        goback() {
            this.back_confirm = false;
            $("#gm_webplayer").hide();
            $("#iframe_zfsyps").hide();
            avalon.history.setHash('/zfsypsjglpt-jdkp-qzcs_jiaojing');
        },
        handleCancel_confirm() {
            this.back_confirm = false;
            $("#gm_webplayer").hide();
            $("#iframe_zfsyps").hide();
        },
        authority: {
            hccl: false,
        },
        onInit(event) {

            if (!window.kpcczl_qzcs) {
                this.goback();
                return;
            }
            kp_hccl = this;
            this.$watch("hccl_dialog_show", (v) => {
                this.diaHide = !this.hccl_dialog_show;
            });
            this.$watch("back_confirm", (v) => {
                this.diaHide = !this.hccl_dialog_show;
            });
            Gm_tool.clear_hc_form();
            Gm_tool.get_jycx_info();

            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_JDKP/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                if (func_list.length == 0) {
                    // 防止查询无权限时页面留白
                    // $('.jqkp-tabCont').css('top', '40px');
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_JDKP_JTWFKP_QZCS_HCCL":
                            kp_hccl.authority.hccl = true;
                            break;
                    }
                });
            });
        },
        onReady() {
            let _this = this;
            $('.popover').hide();
            $(document).bind("keydown", function (event) {
                var ev = window.event || event;
                var code = ev.keyCode || ev.which;
                if (code == 116) {
                    if (ev.preventDefault) {
                        ev.preventDefault();
                    } else {
                        ev.keyCode = 0;
                        ev.returnValue = false;
                    }

                    if (_this.back_confirm) {
                        return;
                    }

                    kp_hccl.back_confirm = true;
                    Gm_tool.addClassForDialog('tjglConfirm');
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
            });
            $(window).bind('beforeunload', function (event) { //ie
                $(window).unbind('beforeunload'); //在不需要时解除绑定   
                if (global.location.hash.indexOf("zfsypsjglpt-zfda-ajgl") > -1)
                    avalon.history.setHash("/zfsypsjglpt-zfda-ajgl_gongan");
            });
            $(window).unload(function () { //firefox
                $(window).unbind('beforeunload'); //在不需要时解除绑定 
                if (global.location.hash.indexOf("zfsypsjglpt-zfda-ajgl") > -1)
                    avalon.history.setHash("/zfsypsjglpt-zfda-ajgl_gongan");
            });
        },
        onDispose() {
            delete_ocx();
            Gm_tool.resetProp(this.mtxxinfo.mt_infomation);
            window.if_kpcczl_hc = false;
        }
    }
});
avalon.filters.formatDate = function (str) {

    if (str == '' || str == null) {
        return '-';
    } else {
        return Gm_format.formatDate(str);
    }
};
avalon.filters.formatDateKP = function (str) {

    if (str == '' || str == null || str == '-') {
        return '-';
    } else {
        return Gm_format.formatDate(str);
    }
};
avalon.filters.checkInvalidProp = function (str) {

    if (str === '' || str == null) {
        return '-';
    } else {
        return str;
    }
};
let tjgl_confirm = avalon.define({
    $id: 'back-confirm',
    title: '提示'
});
let all_info = avalon.define({
    $id: 'ajgl-allinfo',
    title: '核查处理'
});
let info_body = avalon.define({
    $id: 'allinfo_body_qzcs',
    real: '1',
    deduction: '',
    comment: '',
    error_hcyj_valid: false,
    error_number_valid: false,
    check_number(e) {

        if (Gm_reg.int.test($.trim(this.deduction)) && $.trim(this.deduction) <= 9999) {
            this.error_number_valid = false;
        } else {
            this.error_number_valid = true;
        }
    },
    check_hcyj(e) {
        if (!$.trim(this.comment)) {
            this.error_hcyj_valid = true;
        } else {
            this.error_hcyj_valid = false;
        }
    },
    check_real(e) {

        if (+e.target.value) {
            $('.deletepoint').attr('disabled', true);
            this.deduction = 0;
            this.error_number_valid = false;
        } else {
            $('.deletepoint').removeAttr('disabled');
        }
    },
    allInfomation: {}
});