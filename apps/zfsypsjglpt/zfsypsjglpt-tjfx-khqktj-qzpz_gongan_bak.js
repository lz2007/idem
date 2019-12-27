import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
var storage = require('/services/storageService.js').ret;

export const name = "zfsypsjglpt-tjfx-khqktj-qzpz_gongan";
require("/apps/zfsypsjglpt/zfsypsjglpt-tjfx-khqktj-qzpz_gongan.css");
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
        dsjEQRateWeight: 10, // 执法记录仪配发率权重分
        dsjUsageRateWeight: 10, // 执法记录仪使用率权重分
        videoImportOnTimeRateWeight: 10, // 执法按时导入率权重分
        psMatchRateWeight: 20, // 警情关联率权重分
        cmMatchRateWeight: 20, // 案件关联率权重分
        evaRateWeight: 10, // 基层考评率得分权重分
        legalEVAPoint: 20, // 法制考评得分权重分
        dsjEQRateMaxPoint: 10, // 执法记录仪配发率权重分
        dsjUsageRateMaxPoint: 10, // 执法记录仪使用率权重分
        videoImportOnTimeRateMaxPoint: 10, // 执法按时导入率权重分
        psMatchRateMaxPoint: 20, // 警情关联率权重分
        cmMatchRateMaxPoint: 20, // 案件关联率权重分
        evaRateMaxPoint: 10, // 基层考评率得分权重分
        legalEVAPointMaxPoint: 20, // 法制考评得分权重分
        dsjEQRate: [], // 执法记录仪配发率
        dsjUsageRate: [], // 执法记录仪使用率
        videoImportOnTimeRate: [], // 执法按时导入率
        psMatchRate: [], // 警情关联率
        cmMatchRate: [], // 案件关联率
        evaRate: [], // 基层考评率得分
        configParams: { // 权限配置参数
            dsjEQRate: {
                itemRPS: [],
                maxPoint: 0
            },
            dsjUsageRate: {
                itemRPS: [],
                maxPoint: 0
            },
            videoImportOnTimeRate: {
                itemRPS: [],
                maxPoint: 0
            },
            psMatchRate: {
                itemRPS: [],
                maxPoint: 0
            },
            cmMatchRate: {
                itemRPS: [],
                maxPoint: 0
            },
            evaRate: {
                itemRPS: [],
                maxPoint: 0
            }
            // legalEVAPoint: 0
        },
        dsjEQRateInputChange(index, record, val, data) {
            this.configParams.dsjEQRate.itemRPS = data;
        },
        dsjUsageRateInputChange(index, record, val, data) {
            this.configParams.dsjUsageRate.itemRPS = data;
        },
        videoImportInputChange(index, record, val, data) {
            this.configParams.videoImportOnTimeRate.itemRPS = data;
        },
        psMatchRateInputChange(index, record, val, data) {
            this.configParams.psMatchRate.itemRPS = data;
        },
        cmMatchRateInputChange(index, record, val, data) {
            this.configParams.cmMatchRate.itemRPS = data;
        },
        evaRateInputChange(index, record, val, data) {
            this.configParams.evaRate.itemRPS = data;
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
                let totalPoint = Number(this.dsjEQRateWeight) + Number(this.dsjUsageRateWeight) + Number(this.videoImportOnTimeRateWeight) + Number(this.psMatchRateWeight) + Number(this.cmMatchRateWeight) + Number(this.evaRateWeight);
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
            "dsjEQRateWeight": {
                "show": false,
                "msg": "执法记录仪配发率"
            },
            "dsjUsageRateWeight": {
                "show": false,
                "msg": "执法记录仪使用率"
            },
            "videoImportOnTimeRateWeight": {
                "show": false,
                "msg": "视频及时导入率"
            },
            "psMatchRateWeight": {
                "show": false,
                "msg": "警情关联率"
            },
            "cmMatchRateWeight": {
                "show": false,
                "msg": "案件关联率"
            },
            "evaRateWeight": {
                "show": false,
                "msg": "考评率得分"
            }
            // "legalEVAPoint": {
            //     "show": false,
            //     "msg": "法制考评得分"
            // }
        },
        // 返回按钮
        back() {
            $(window).unbind('beforeunload'); //在不需要时解除绑定 
            $(document).unbind("keydown");
            let hash = "/zfsypsjglpt-tjfx-khqktj_gongan";
            // avalon.router.navigate(hash, 1);
            avalon.history.setHash(hash);

        },
        // 保存权重配置数据
        saveBtn() {
            // 检验输入是否有错误
            let findError = $('.input_error');
            if (findError.length > 0)
                return;

            let totalPoint = Number(this.dsjEQRateWeight) + Number(this.dsjUsageRateWeight) + Number(this.videoImportOnTimeRateWeight) + Number(this.psMatchRateWeight) + Number(this.cmMatchRateWeight) + Number(this.evaRateWeight);
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
                if ("legalEVAPoint" != i && "id" != i) {
                    let list = [];
                    avalon.each(this.configParams[i].itemRPS, function (k, v) {
                        list.push(Number(v.point));
                    });
                    if (-1 == $.inArray(Number(zhkp_qzpz_vm[i + "Weight"]), list)) {
                        if (!this.alertSign) {
                            this.alertSign = true;
                            notification.warn({
                                message: zhkp_qzpz_vm.pointObj[i + "Weight"].msg + "得分至少有一项等于其权重分",
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

            this.configParams.dsjEQRate.maxPoint = this.dsjEQRateWeight;
            this.configParams.dsjUsageRate.maxPoint = this.dsjUsageRateWeight;
            this.configParams.videoImportOnTimeRate.maxPoint = this.videoImportOnTimeRateWeight;
            this.configParams.psMatchRate.maxPoint = this.psMatchRateWeight;
            this.configParams.cmMatchRate.maxPoint = this.cmMatchRateWeight;
            this.configParams.evaRate.maxPoint = this.evaRateWeight;
            // this.configParams.legalEVAPoint = this.legalEVAPoint;

            ajax({
                url: '/gmvcs/stat/ge/ga/config',
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
                    window.hadSaveConf = true;
                    this.back();
                }
            });
        },
        getConfigInfo() {
            ajax({
                // url: '/api/zhkp_qzpz',
                url: '/gmvcs/stat/ge/ga/config/info',
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
                this.dsjEQRate = result.data.dsjEQRate.itemRPS;
                this.dsjUsageRate = result.data.dsjUsageRate.itemRPS;
                this.videoImportOnTimeRate = result.data.videoImportOnTimeRate.itemRPS;
                this.psMatchRate = result.data.psMatchRate.itemRPS;
                this.cmMatchRate = result.data.cmMatchRate.itemRPS;
                this.evaRate = result.data.evaRate.itemRPS;

                // 权重得分输入框数据填充
                this.dsjEQRateMaxPoint = this.dsjEQRateWeight = result.data.dsjEQRate.maxPoint;
                this.dsjUsageRateMaxPoint = this.dsjUsageRateWeight = result.data.dsjUsageRate.maxPoint;
                this.videoImportOnTimeRateMaxPoint = this.videoImportOnTimeRateWeight = result.data.videoImportOnTimeRate.maxPoint;
                this.psMatchRateMaxPoint = this.psMatchRateWeight = result.data.psMatchRate.maxPoint;
                this.cmMatchRateMaxPoint = this.cmMatchRateWeight = result.data.cmMatchRate.maxPoint;
                this.evaRateMaxPoint = this.evaRateWeight = result.data.evaRate.maxPoint;
                // this.legalEVAPointMaxPoint = this.legalEVAPoint = result.data.legalEVAPoint;

                this.configParams = result.data;
            });
        },
        onInit(e) {

            zhkp_qzpz_vm = e.vmodel;
            window.hadSaveConf = false; // hadSaveConf 是否保存权重配置数据

            $(".header").css({
                "min-width": "1550px"
            });
            $(".qzpz-wrap").addClass('min-width-class');

            // 先清除先前在权重配置页面生成的错误提示样式
            $('.down-input').children('input').removeClass('input_error').next('span').css('display', 'none');
            $('.up-input').children('input').removeClass('input_error');
            $('.weight-wrap').children('input').removeClass('input_error').next('span').next('div.tips-wrap').css('display', 'none');
        },
        onReady() {
            let _this = this;
            let v_height = $(window).height() - 96;
            let v_min_height = $(window).height() - 68;
            let menu_height = $("body")[0].clientHeight;
            if (v_height > 740) {
                $("#sidebar .zfsypsjglpt-menu").css("min-height", menu_height - 68 + "px");
                if (8 == avalon.msie) {
                    $("#sidebar").css("min-height", menu_height + "px");
                }
            } else {
                $("#sidebar .zfsypsjglpt-menu").css("min-height", "860px");
                if (8 == avalon.msie) {
                    $("#sidebar").css("min-height", "860px");
                }
            }
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
                if (global.location.hash.indexOf("zfsypsjglpt-jdkp-zhkp") > -1)
                    avalon.history.setHash("/zfsypsjglpt-jdkp-zhkp");
            });
            $(window).unload(function () { //firefox
                $(window).unbind('beforeunload'); //在不需要时解除绑定 
                if (global.location.hash.indexOf("zfsypsjglpt-jdkp-zhkp") > -1)
                    avalon.history.setHash("/zfsypsjglpt-jdkp-zhkp");
            });
        },
        onDispose() {},
        // f5刷新页面提示弹窗
        qzpz_fresh_tips_gongan: avalon.define({
            $id: "qzpz_fresh_tips_gongan",
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