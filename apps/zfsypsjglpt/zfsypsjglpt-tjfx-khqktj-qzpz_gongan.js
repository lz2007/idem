import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
var storage = require('/services/storageService.js').ret;

export const name = "zfsypsjglpt-tjfx-khqktj-qzpz_gongan";
require("/apps/zfsypsjglpt/zfsypsjglpt-tjfx-khqktj-qzpz_gongan.css");
require("/apps/zfsypsjglpt/zfsypsjglpt-tjfx-khqktj-qzpz_jiaojing.css");
require('/apps/common/common-rate-input');

let zhkp_qzpz_vm;

avalon.component(name, {
    template: __inline("./zfsypsjglpt-tjfx-khqktj-qzpz_gongan.html"),
    defaults: {
        arrTabs: [{
            name: '部门权重配置'
        }],
        currentTabsIndex: 0,
        tabsClick(index) {
            this.currentTabsIndex = index;
        },

        qzpz_fresh_tips_show: false,
        dayLeOfHour: 4.5, // 每天应执法时长
        weekLeOfDay: 5, // 每周应执法天数
        monthLeOfDay: 20, // 每月应执法天数
        sdSituationWeight: 20, // 建档情况统计权重分
        sySituationWeight: 20, // 使用情况统计权重分
        scSituationWeight: 20, // 时长情况统计权重分
        glSituationWeight: 20, // 关联情况统计权重分
        ccSituationWeight: 20, // 抽查情况统计权重分   

        sdSituationMaxPoint: 20, // 建档情况统计最大分
        sySituationMaxPoint: 20, // 使用情况统计最大分
        scSituationMaxPoint: 20, // 时长情况统计最大分
        glSituationMaxPoint: 20, // 关联情况统计最大分
        ccSituationMaxPoint: 20, // 抽查情况统计最大分

        sdSituation: [], // 建档情况统计
        sySituation: [], // 使用情况统计
        scSituation: [], // 时长情况统计
        glSituation: [], // 关联情况统计
        ccSituation: [], // 抽查情况统计

        configParams: { // 权限配置参数
            fileWeight: 0,
            usageWeight: 0,
            durationWeight: 0,
            matchWeight: 0,
            spotCheckWeight: {
                itemRPS: [],
                maxPoint: 0
            },
            dayLeOfHour: 0,
            weekLeOfDay: 0,
            monthLeOfDay: 0
        },
        cmMatchRateInputChange(index, record, val, data) {
            this.configParams.spotCheckWeight.itemRPS = data;
        },
        dayLeOfHour_tips: "",
        weekLeOfDay_tips: "",
        monthLeOfDay_tips: "",
        dayLeOfHourChange() {
            let item = $(".params-wrap").eq(0);
            reg = /^[0-9]+([.]{1}[0-9]+){0,1}$/;
            let flag_0 = this.dayLeOfHour == "";
            let flag_1 = !reg.test(this.dayLeOfHour) && !/^0[0-9]/.test(this.dayLeOfHour);
            let flag_2 = Number(this.dayLeOfHour) > 24;
            this.handleInputTips(item, flag_0, "dayLeOfHour_tips", "该输入框不能为空") && this.handleInputTips(item, flag_1, "dayLeOfHour_tips", "该输入框格式不正确") && this.handleInputTips(item, flag_2, "dayLeOfHour_tips", "该输入框不能大于24小时");
        },
        weekLeOfDayChange() {
            let item = $(".params-wrap").eq(1);
            reg = /^[0-9]+([.]{1}[0-9]+){0,1}$/;
            let flag_0 = this.weekLeOfDay == "";
            let flag_1 = !reg.test(this.weekLeOfDay) && !/^0[0-9]/.test(this.weekLeOfDay);
            let flag_2 = Number(this.weekLeOfDay) > 7;
            this.handleInputTips(item, flag_0, "weekLeOfDay_tips", "该输入框不能为空") && this.handleInputTips(item, flag_1, "weekLeOfDay_tips", "该输入框格式不正确") && this.handleInputTips(item, flag_2, "weekLeOfDay_tips", "该输入框不能大于7天");
        },
        monthLeOfDayChange() {
            let item = $(".params-wrap").eq(2);
            reg = /^[0-9]+([.]{1}[0-9]+){0,1}$/;
            let flag_0 = this.monthLeOfDay == "";
            let flag_1 = !reg.test(this.monthLeOfDay) && !/^0[0-9]/.test(this.monthLeOfDay);
            let flag_2 = Number(this.monthLeOfDay) > 31;
            this.handleInputTips(item, flag_0, "monthLeOfDay_tips", "该输入框不能为空") && this.handleInputTips(item, flag_1, "monthLeOfDay_tips", "该输入框格式不正确") && this.handleInputTips(item, flag_2, "monthLeOfDay_tips", "该输入框不能大于31日");
        },
        handleInputTips(item, flag, fieldName, tips) {
            if (flag) {
                zhkp_qzpz_vm[fieldName] = tips;
                item.children("input").addClass("input_error");
                item.children("h6").css("display", "block");
                return false;
            } else {
                item.children("input").removeClass("input_error");
                item.children("h6").css("display", "none");
                return true;
            }
        },
        timer: 0,
        alertSign: false, // 是否已经有弹窗
        // 限制权重分为数字且不能为空
        weightChange(type) {
            if ('' === zhkp_qzpz_vm[type]) {
                this.pointObj[type].show = true;
                this.pointObj[type].msg = '权重分不能为空';
            } else {
                this.pointObj[type].show = false;
                if (/[^\d]/g.test(zhkp_qzpz_vm[type])) {
                    zhkp_qzpz_vm[type] = Number(zhkp_qzpz_vm[type].replace(/[^\d]/g, ''));
                }
                if (/^0[0-9]/.test(zhkp_qzpz_vm[type])) {
                    this.pointObj[type].show = true;
                    this.pointObj[type].msg = '权重分格式错误';
                }
                let totalPoint = Number(this.sdSituationWeight) + Number(this.sySituationWeight) + Number(this.scSituationWeight) + Number(this.glSituationWeight) + Number(this.ccSituationWeight);

                //  设置3s内弹窗只弹一次
                if (totalPoint > 100) {
                    if (!this.alertSign) {
                        this.alertSign = true;
                        notification.warn({
                            message: '权重总分应为100分，当前为' + totalPoint + '分',
                            title: '通知'
                        });
                        this.timer = setTimeout(() => {
                            this.alertSign = false;
                        }, 3000);
                    }
                }
            }
        },
        pointObj: {
            "sdSituationWeight": {
                "show": false,
                "msg": "建档情况统计"
            },
            "sySituationWeight": {
                "show": false,
                "msg": "使用情况统计"
            },
            "scSituationWeight": {
                "show": false,
                "msg": "时长情况统计"
            },
            "glSituationWeight": {
                "show": false,
                "msg": "关联情况统计"
            },
            "ccSituationWeight": {
                "show": false,
                "msg": "抽查情况统计"
            },
        },
        // 返回按钮
        back() {
            $(window).unbind('beforeunload'); //在不需要时解除绑定 
            $(document).unbind("keydown");
            let hash = "/zfsypsjglpt-tjfx-khqktj_gongan";
            avalon.history.setHash(hash);
        },
        // 保存权重配置数据
        saveBtn() {
            // 检验输入是否有错误
            let findError = $('.input_error');

            if (findError.length > 0)
                return;

            let totalPoint = Number(this.sdSituationWeight) + Number(this.sySituationWeight) + Number(this.scSituationWeight) + Number(this.glSituationWeight) + Number(this.ccSituationWeight);

            if (totalPoint != 100) {

                if (!this.alertSign) {
                    this.alertSign = true;
                    notification.warn({
                        message: '权重总分应为100分，当前为' + totalPoint + '分',
                        title: '通知'
                    });
                    this.timer = setTimeout(() => {
                        this.alertSign = false;
                    }, 3000);
                }
                return;
            }

            for (let i in this.configParams.$model) {

                if ("spotCheckWeight" == i) {
                    let list = [];
                    avalon.each(this.configParams[i].itemRPS, function (k, v) {
                        list.push(Number(v.point));
                    });

                    if (-1 == $.inArray(Number(zhkp_qzpz_vm["ccSituationWeight"]), list)) {

                        if (!this.alertSign) {
                            this.alertSign = true;
                            notification.warn({
                                message: zhkp_qzpz_vm.pointObj["ccSituationWeight"].msg + "得分至少有一项等于其权重分",
                                title: '通知'
                            });
                            this.timer = setTimeout(() => {
                                this.alertSign = false;
                            }, 3000);
                        }
                        return;
                    }
                }
            }
            this.configParams.fileWeight = this.sdSituationWeight;
            this.configParams.usageWeight = this.sySituationWeight;
            this.configParams.durationWeight = this.scSituationWeight;
            this.configParams.matchWeight = this.glSituationWeight;
            this.configParams.spotCheckWeight.maxPoint = this.ccSituationWeight;
            this.configParams.dayLeOfHour = this.dayLeOfHour;
            // this.configParams.weekLeOfDay = this.weekLeOfDay;
            // this.configParams.monthLeOfDay = this.monthLeOfDay;
            ajax({
                url: '/gmvcs/stat/ge/config/ga',
                method: 'post',
                data: this.configParams.$model // $model 返回一个纯净的JS对象，兼容IE8对象undefined问题
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                    return;
                } else {
                    notification.success({
                        message: '权重配置成功!',
                        title: '通知'
                    });
                    window.hadSaveKhqktjConf = true;
                    this.back();
                }
            });
        },
        getConfigInfo() {
            ajax({
                // url: '/api/jj-qzpz',
                url: '/gmvcs/stat/ge/config/info/ga',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: '服务器后端错误，请联系管理员',
                        title: '通知'
                    });
                    return;
                }

                // 输入框组数据填充
                this.ccSituation = result.data.spotCheckWeight.itemRPS;

                // 权重得分输入框数据填充
                this.sdSituationMaxPoint = this.sdSituationWeight = result.data.fileWeight;
                this.sySituationMaxPoint = this.sySituationWeight = result.data.usageWeight;
                this.scSituationMaxPoint = this.scSituationWeight = result.data.durationWeight;
                this.glSituationMaxPoint = this.glSituationWeight = result.data.matchWeight;
                this.ccSituationMaxPoint = this.ccSituationWeight = result.data.spotCheckWeight.maxPoint;
                this.dayLeOfHour = result.data.dayLeOfHour;
                this.weekLeOfDay = result.data.weekLeOfDay;
                this.monthLeOfDay = result.data.monthLeOfDay;
                this.configParams = result.data;
            });
        },
        onInit(e) {

            zhkp_qzpz_vm = e.vmodel;
            window.hadSaveKhqktjConf = false; // hadSaveKhqktjConf 是否保存权重配置数据

            $(".header").css({
                "min-width": "1720px"
            });
            $(".qzpz-wrap").addClass('min-width-class-khqktj-qzpz');

            // 先清除先前在权重配置页面生成的错误提示样式
            $('.down-input').children('input').removeClass('input_error').next('span').css('display', 'none');
            $('.up-input').children('input').removeClass('input_error');
            $('.weight-wrap').children('input').removeClass('input_error').next('span').next('div.tips-wrap').css('display', 'none');
        },
        onReady() {
            let _this = this;
            this.windowResize();
            $(window).resize(function () {
                _this.windowResize();
            });
            // 加载权重配置数据
            this.getConfigInfo();

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

                    if (_this.qzpz_fresh_tips_show)
                        return;

                    _this.qzpz_fresh_tips_show = true;

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
                if (global.location.hash.indexOf("zfsypsjglpt-tjfx-khqktj") > -1)
                    avalon.history.setHash("/zfsypsjglpt-tjfx-khqktj_gongan");
            });
            $(window).unload(function () { //firefox
                $(window).unbind('beforeunload'); //在不需要时解除绑定 
                if (global.location.hash.indexOf("zfsypsjglpt-tjfx-khqktj") > -1)
                    avalon.history.setHash("/zfsypsjglpt-tjfx-khqktj_gongan");
            });
        },
        onDispose() {},
        windowResize() {
            let v_height = $(window).height() - 96;
            let v_min_height = $(window).height() - 68;
            let menu_height = $("body")[0].scrollHeight;
            if (v_height > 740) {
                $(".zfsypsjglpt_tjfx_khqktj").height(v_height);
                $("#sidebar .zfsypsjglpt-menu").css("min-height", menu_height - 68 + "px");
                if (8 == avalon.msie) {
                    $("#sidebar").css("min-height", menu_height - 68 + "px");
                }
            } else {
                $("#sidebar .zfsypsjglpt-menu").css("min-height", menu_height - 68 + "px");
                if (8 == avalon.msie) {
                    $("#sidebar").css("min-height", "860px");
                }
            }
        },
        // f5刷新页面提示弹窗
        qzpz_fresh_tips: avalon.define({
            $id: "qzpz_fresh_tips",
            title: "提示",
            dialog_txt: "是否确认离开此页面？"
        }),
        onOk() {
            this.back();
            $("#iframe_zfsyps").hide();
            this.qzpz_fresh_tips_show = false;
        },
        cancel() {
            $("#iframe_zfsyps").hide();
            this.qzpz_fresh_tips_show = false;
        },
        move_return(a, b) {
            let _this = this;
            $("#iframe_zfsyps").css({
                width: "300px",
                height: "175px",
                left: a,
                top: b
            });
        },
    }
});